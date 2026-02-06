import { ObjectId } from 'mongodb';

const getPath = (obj, path) => {
	if (!obj) return undefined;
	if (!path || typeof path !== 'string') return obj?.[path];
	return path.split('.').reduce((o, k) => o?.[k], obj);
};

/**
 * Live cursor paging + watcher lifecycle manager.
 *
 * You provide:
 * - `signal`: Observer with { anchor, before, after, follow }
 * - `mongo`: { table, filter, sort, project, cursorField }
 * - `middle(doc) => { item, remove }` where item goes into `array` and remove cleans watchers
 *
 * Notes:
 * - Designed for chats / feeds: stable cursor paging using (cursorField, _id).
 * - `follow: true` always anchors to newest doc (according to sort) and refreshes on `changes`.
 */
export default ({ DB, database }) => {
	const isHex24 = (s) => typeof s === 'string' && /^[a-fA-F0-9]{24}$/.test(s);
	const toObjectIdMaybe = (v) => (v instanceof ObjectId ? v : (isHex24(v) ? new ObjectId(v) : v));
	const opFor = ({ sortDir, want }) => {
		const desc = sortDir === -1;
		if (want === 'newer') return desc ? '$gt' : '$lt';
		return desc ? '$lt' : '$gt';
	};

	return {
		int: ({
			array,                 // OArray to overwrite with the current window of items
			signal,                // Observer<{anchor,before,after,follow}>
			mongo: {
				table,
				filter = {},
				sort = { 'query.createdAt': -1, _id: -1 },
				project = null,
				cursorField = 'query.createdAt', // must match anchor.createdAt
				idField = '_id',
				keyField = 'query.uuid',
			},
			middle = async (doc) => ({ item: doc, remove: () => { } }), // user supplies watcher/bridge creation
			changes = null,         // optional Observer (ex chat.observer.path('seq'))
			throttle = 80,          // ms throttle for signal changes
			refreshOnChanges = 'follow', // 'follow' | 'always' | 'never'
			key = (doc) => doc?.query?.uuid ?? doc?.persistent.uuid ?? String(doc?._id), // for cleanup mapping
		}) => {

			if (!array || !signal) throw new Error('paginate.int requires { array, signal }');
			if (!table) throw new Error('paginate.int requires mongo.table');
			if (!database?.collection) throw new Error('paginate.int requires a mongodb "database" instance');

			const col = database.collection(table);

			// Active attachments keyed by doc key (uuid)
			const attached = new Map(); // key -> { item, remove }
			const detachAll = () => {
				for (const { remove } of attached.values()) remove?.();
				attached.clear();
				array.splice(0, array.length);
			};

			let req = 0;

			const resolveAnchor = async ({ col, filter, sort, project, cursorField, idField, spec }) => {
				if (spec?.follow) {
					const doc = await col.findOne(filter, {
						sort,
						projection: { ...(project ?? {}), [cursorField]: 1, [idField]: 1 },
					});
					if (!doc) return null;

					const cursor = getPath(doc, cursorField);
					const _id = getPath(doc, idField);

					// if cursor is missing, treat it like “no anchor” and just fetch a top page
					if (cursor == null || _id == null) return null;

					return { cursor, _id };
				}

				const a = spec?.anchor;
				if (!a) return null;

				// compat: allow { createdAt, _id } shape too
				const cursor = a.cursor ?? a.createdAt;
				const _id = toObjectIdMaybe(a._id);

				if (cursor != null && _id != null) return { cursor, _id };

				if (typeof a.uuid === 'string') {
					const doc = await col.findOne(
						{ ...filter, [keyField]: a.uuid },
						{ projection: { [cursorField]: 1, [idField]: 1 } }
					);
					if (!doc) return null;

					return {
						cursor: getPath(doc, cursorField),
						_id: getPath(doc, idField),
					};
				}

				return null;
			};

			const fetchWindowDocs = async ({
				col,
				filter,
				sort,
				project,
				cursorField,
				idField,
				spec,
			}) => {
				const before = Math.max(0, spec?.before ?? 0); // newer
				const after = Math.max(0, spec?.after ?? 0);   // older

				const sortDir = sort?.[cursorField] ?? -1;
				const opNewer = opFor({ sortDir, want: 'newer' });
				const opOlder = opFor({ sortDir, want: 'older' });

				const anchor = await resolveAnchor({ col, filter, sort, project, cursorField, idField, spec });

				// No anchor: just grab a top page
				if (!anchor) {
					const limit = Math.max(0, before + after + 1) || 50;
					return await col.find(filter, { sort, projection: project }).limit(limit).toArray();
				}

				// Special case: cursor is _id itself
				if (cursorField === idField) {
					const [newer, anchorDoc, older] = await Promise.all([
						before
							? col.find({ ...filter, [idField]: { [opNewer]: anchor._id } }, { sort, projection: project }).limit(before).toArray()
							: Promise.resolve([]),

						col.findOne({ ...filter, [idField]: anchor._id }, { projection: project }),

						after
							? col.find({ ...filter, [idField]: { [opOlder]: anchor._id } }, { sort, projection: project }).limit(after).toArray()
							: Promise.resolve([]),
					]);

					const out = [];
					out.push(...newer);
					if (anchorDoc) out.push(anchorDoc);
					out.push(...older);
					return out;
				}

				// General case: tuple compare (cursorField, _id)
				const newerFilter = before ? {
					$and: [
						filter,
						{
							$or: [
								{ [cursorField]: { [opNewer]: anchor.cursor } },
								{ [cursorField]: anchor.cursor, [idField]: { [opNewer]: anchor._id } },
							],
						},
					],
				} : null;

				const olderFilter = after ? {
					$and: [
						filter,
						{
							$or: [
								{ [cursorField]: { [opOlder]: anchor.cursor } },
								{ [cursorField]: anchor.cursor, [idField]: { [opOlder]: anchor._id } },
							],
						},
					],
				} : null;

				const [newer, anchorDoc, older] = await Promise.all([
					newerFilter ? col.find(newerFilter, { sort, projection: project }).limit(before).toArray() : Promise.resolve([]),
					col.findOne({ ...filter, [idField]: anchor._id }, { projection: project }),
					olderFilter ? col.find(olderFilter, { sort, projection: project }).limit(after).toArray() : Promise.resolve([]),
				]);

				const out = [];
				out.push(...newer);
				if (anchorDoc) out.push(anchorDoc);
				out.push(...older);
				return out;
			};


			const reconcile = async () => {
				const spec = signal.get();
				const myReq = ++req;

				const docs = await fetchWindowDocs({ col, filter, sort, project, cursorField, idField, spec });

				if (myReq !== req) return; // stale

				const desiredKeys = docs.map(key);
				const desiredSet = new Set(desiredKeys);

				for (const [k, rec] of attached.entries()) {
					if (!desiredSet.has(k)) {
						rec.remove?.();
						attached.delete(k);
					}
				}

				const items = [];
				for (const doc of docs) {
					const k = key(doc);
					const existing = attached.get(k);
					if (existing) {
						items.push(existing.item);
						continue;
					}

					const { item, remove } = await middle(doc, { DB, database });
					if (myReq !== req) { remove?.(); return; }

					attached.set(k, { item, remove });
					items.push(item);
				}

				// overwrite array to match desired window
				array.splice(0, array.length, ...items);

				console.log('FINAL attached=', attached.size, 'desired=', docs.length);
			};

			// Watch signal updates
			const stopSignal = signal.throttle(throttle).watch(() => {
				reconcile().catch((e) => console.error('paginate reconcile error:', e));
			});

			// Watch changes (seq) to refresh when live changes happen
			const stopChanges = changes
				? changes.watch(() => {
					const spec = signal.get();
					const should =
						refreshOnChanges === 'always' ||
						(refreshOnChanges === 'follow' && spec?.follow) ||
						refreshOnChanges === true;

					if (!should) return;
					reconcile().catch((e) => console.error('paginate changes reconcile error:', e));
				})
				: () => { };

			// Initial load
			reconcile().catch((e) => console.error('paginate initial reconcile error:', e));

			return () => {
				stopSignal?.();
				stopChanges?.();
				detachAll();
			};
		},
	};
};
