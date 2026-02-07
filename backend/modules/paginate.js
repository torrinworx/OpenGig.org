// paginate_odb.js
// Pagination for ODB (mongodb driver) using raw mongo filters on record.index.
//
// Key changes vs old version:
// - No direct `database.collection(table)` usage from module consumers.
// - Uses `odb.driver.rawFindOne/rawFindMany` (mongo filter) OR `odb.findMany` (index query).
// - Items are ODB live OObjects (stable refs) opened through ODB.
// - Cursor/anchor reads come from `doc` (OObject) instead of `doc.query.*`.
//
// Assumes your mongodbDriver implements rawFindOne/rawFindMany (your new one does).

const getPath = (obj, path) => {
	if (!obj) return undefined;
	if (!path || typeof path !== 'string') return obj?.[path];
	return path.split('.').reduce((o, k) => o?.[k], obj);
};

const isPlainObject = v =>
	v && typeof v === 'object' && (v.constructor === Object || Object.getPrototypeOf(v) === null);

// turns {a:{b:1}} into {"a.b":1}
const withDotNotation = (obj, prefix = '') => {
	const out = {};
	for (const [k, v] of Object.entries(obj || {})) {
		const key = prefix ? `${prefix}.${k}` : k;
		if (isPlainObject(v)) Object.assign(out, withDotNotation(v, key));
		else out[key] = v;
	}
	return out;
};

const opFor = ({ sortDir, want }) => {
	const desc = sortDir === -1;
	if (want === 'newer') return desc ? '$gt' : '$lt';
	return desc ? '$lt' : '$gt';
};

// Normalizes sort keys from "createdAt" to "index.createdAt" etc.
const normalizeIndexSort = (sort = {}) => {
	const out = {};
	for (const [k, v] of Object.entries(sort)) {
		out[k.startsWith('index.') ? k : `index.${k}`] = v;
	}
	return out;
};

const normalizeCursorField = (cursorField) =>
	cursorField.startsWith('index.') ? cursorField : `index.${cursorField}`;

const normalizeFilterToIndex = (filter = {}) => {
	// if user already passed index.* keys, keep them
	const hasIndexPrefix = Object.keys(filter).some(k => k.startsWith('index.'));
	if (hasIndexPrefix) return filter;

	// otherwise treat it as index-query-like object and dot it under index.
	// ex: { ownerId: 'u1', meta: { projectId:'p1' } } => { 'index.ownerId': 'u1', 'index.meta.projectId': 'p1' }
	return withDotNotation(filter, 'index');
};

export default function paginateODB({ odb }) {
	if (!odb) throw new Error('paginateODB requires { odb }');

	return {
		int: ({
			array,                  // OArray to overwrite with current window
			signal,                 // Observer<{anchor,before,after,follow}>
			odb: odbSpec = {
				collection: null,
				filter: {},           // mongo filter OR "index query object" (we’ll put it under index.*)
				sort: { createdAt: -1, id: -1 }, // cursor sort; will be applied to record.index.* (id maps to index.id)
				project: null,        // mongo projection on record (rarely needed)
				cursorField: 'createdAt', // field on index (ex: createdAt)
				idField: 'id',        // field on index to disambiguate ties; default index.id (ODB key)
				keyField: 'id',       // unique identity field on index; typically "id"
			},
			middle = async (doc) => ({ item: doc, remove: async () => { await doc?.$odb?.dispose?.(); } }),
			changes = null,
			throttle = 80,
			refreshOnChanges = 'follow',
			key = (doc) => doc?.id ?? doc?.key ?? doc?.$odb?.key, // doc is OObject
		} = {}) => {
			if (!array || !signal) throw new Error('paginate.int requires { array, signal }');
			if (!odbSpec?.collection) throw new Error('paginate.int requires odb.collection');

			const collection = odbSpec.collection;
			const cursorField = normalizeCursorField(odbSpec.cursorField || 'createdAt');
			const idField = normalizeCursorField(odbSpec.idField || 'id');
			const keyField = normalizeCursorField(odbSpec.keyField || 'id');

			const filter = normalizeFilterToIndex(odbSpec.filter || {});
			const sort = normalizeIndexSort(odbSpec.sort || { createdAt: -1, id: -1 });
			const project = odbSpec.project;

			// Active attachments keyed by doc key/id
			const attached = new Map(); // k -> { item, remove }
			const detachAll = async () => {
				for (const { remove } of attached.values()) await remove?.();
				attached.clear();
				array.splice(0, array.length);
			};

			let req = 0;

			const rawFindOne = odb.driver?.rawFindOne;
			const rawFindMany = odb.driver?.rawFindMany;
			if (typeof rawFindOne !== 'function' || typeof rawFindMany !== 'function') {
				throw new Error('paginateODB: requires mongodb driver with rawFindOne/rawFindMany (odb.driver.*)');
			}

			const resolveAnchor = async (spec) => {
				if (spec?.follow) {
					const rec = await rawFindOne({
						collection,
						filter,
						options: {
							sort,
							projection: {
								_id: 0,
								key: 1,
								state_tree: 1,
								index: 1,
								...(project ?? {}),
							},
						},
					});
					if (!rec) return null;

					const cursor = getPath(rec, cursorField);
					const id = getPath(rec, idField);
					if (cursor == null || id == null) return null;
					return { cursor, id };
				}

				const a = spec?.anchor;
				if (!a) return null;

				// allow {cursor, id} or {createdAt, id} shapes
				const cursor = a.cursor ?? a.createdAt;
				const id = a.id ?? a._id ?? a.key;
				if (cursor != null && id != null) return { cursor, id };

				// allow anchor lookup by uuid/id string: { uuid: '...' } or { id:'...' }
				const anchorId = a.uuid ?? a.id;
				if (typeof anchorId === 'string') {
					const rec = await rawFindOne({
						collection,
						filter: { ...filter, [keyField]: anchorId },
						options: { projection: { _id: 0, key: 1, index: 1 } },
					});
					if (!rec) return null;
					return { cursor: getPath(rec, cursorField), id: getPath(rec, idField) };
				}

				return null;
			};

			const fetchWindowRecords = async (spec) => {
				const before = Math.max(0, spec?.before ?? 0); // newer
				const after = Math.max(0, spec?.after ?? 0);   // older

				const sortDir = sort?.[cursorField] ?? -1;
				const opNewer = opFor({ sortDir, want: 'newer' });
				const opOlder = opFor({ sortDir, want: 'older' });

				const anchor = await resolveAnchor(spec);

				// No anchor: top page
				if (!anchor) {
					const limit = Math.max(0, before + after + 1) || 50;
					return await rawFindMany({
						collection,
						filter,
						options: {
							sort,
							limit,
							projection: { _id: 0, key: 1, state_tree: 1, index: 1, ...(project ?? {}) },
						},
					});
				}

				// tuple compare (cursorField, idField)
				const newerFilter = before
					? {
						$and: [
							filter,
							{
								$or: [
									{ [cursorField]: { [opNewer]: anchor.cursor } },
									{ [cursorField]: anchor.cursor, [idField]: { [opNewer]: anchor.id } },
								],
							},
						],
					}
					: null;

				const olderFilter = after
					? {
						$and: [
							filter,
							{
								$or: [
									{ [cursorField]: { [opOlder]: anchor.cursor } },
									{ [cursorField]: anchor.cursor, [idField]: { [opOlder]: anchor.id } },
								],
							},
						],
					}
					: null;

				const [newer, anchorRec, older] = await Promise.all([
					newerFilter
						? rawFindMany({
							collection,
							filter: newerFilter,
							options: { sort, limit: before, projection: { _id: 0, key: 1, state_tree: 1, index: 1, ...(project ?? {}) } },
						})
						: Promise.resolve([]),

					rawFindOne({
						collection,
						filter: { ...filter, [idField]: anchor.id },
						options: { projection: { _id: 0, key: 1, state_tree: 1, index: 1, ...(project ?? {}) } },
					}),

					olderFilter
						? rawFindMany({
							collection,
							filter: olderFilter,
							options: { sort, limit: after, projection: { _id: 0, key: 1, state_tree: 1, index: 1, ...(project ?? {}) } },
						})
						: Promise.resolve([]),
				]);

				const out = [];
				out.push(...newer);
				if (anchorRec) out.push(anchorRec);
				out.push(...older);
				return out;
			};

			const reconcile = async () => {
				const spec = signal.get();
				const myReq = ++req;

				const records = await fetchWindowRecords(spec);
				if (myReq !== req) return;

				// open records into live ODB docs
				const docs = await Promise.all(records.map(rec => odb.driver.findOne({
					collection,
					filter: { key: rec.key }, // raw-find by key then open live doc
				})));

				// odb.driver.findOne returns doc or false; filter out falsy
				const liveDocs = docs.filter(Boolean);

				const desiredKeys = liveDocs.map(key);
				const desiredSet = new Set(desiredKeys);

				for (const [k, rec] of attached.entries()) {
					if (!desiredSet.has(k)) {
						await rec.remove?.();
						attached.delete(k);
					}
				}

				const items = [];
				for (const doc of liveDocs) {
					const k = key(doc);
					const existing = attached.get(k);
					if (existing) {
						items.push(existing.item);
						continue;
					}

					const { item, remove } = await middle(doc, { odb, collection });
					if (myReq !== req) {
						await remove?.();
						return;
					}

					attached.set(k, { item, remove });
					items.push(item);
				}

				array.splice(0, array.length, ...items);
			};

			const stopSignal = signal.throttle(throttle).watch(() => {
				reconcile().catch(e => console.error('paginate reconcile error:', e));
			});

			const stopChanges = changes
				? changes.watch(() => {
					const spec = signal.get();
					const should =
						refreshOnChanges === 'always' ||
						(refreshOnChanges === 'follow' && spec?.follow) ||
						refreshOnChanges === true;

					if (!should) return;
					reconcile().catch(e => console.error('paginate changes reconcile error:', e));
				})
				: () => { };

			reconcile().catch(e => console.error('paginate initial reconcile error:', e));

			return () => {
				stopSignal?.();
				stopChanges?.();
				detachAll().catch(() => { });
			};
		},
	};
}