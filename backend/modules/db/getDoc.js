import { stringify } from 'destam-web-core';

export default () => {
	return {
		onMsg: async ({ table, query, mode = 'store' }, { user, DB, database }) => {
			if (user?.query?.role !== 'admin') {
				return { error: 'forbidden' };
			}

			if (typeof table !== 'string' || !table.trim()) {
				throw new Error('props.table (string) is required');
			}

			if (!query || typeof query !== 'object' || Array.isArray(query)) {
				throw new Error('props.query (object) is required');
			}

			const allowed = new Set(['store', 'query', 'raw', 'all']);
			if (!allowed.has(mode)) {
				throw new Error(`props.mode must be one of: ${[...allowed].join(', ')}`);
			}

			// Always resolve the destam-db query section first (cheap + also acts like existence check)
			const querySection = await DB.query(table, query);
			if (!querySection) {
				return { table, query, mode, doc: null };
			}

			const out = { table, query, mode, doc: {} };

			// store.query only (cheap-ish)
			if (mode === 'query' || mode === 'all') {
				const store = await DB.instance(querySection, table);
				out.doc.storeQuery = stringify(store?.query);
			}

			// full decoded store (potentially expensive)
			if (mode === 'store' || mode === 'all') {
				const store = await DB.instance(querySection, table);
				out.doc.store = stringify(store);
			}

			// raw mongo document (debugging driver format)
			if (mode === 'raw' || mode === 'all') {
				if (!database) throw new Error('Mongo database not provided (context.database)');

				const filter = { 'persistent.deletedAt': { $exists: false } };
				for (const [k, v] of Object.entries(query)) filter[`persistent.${k}`] = v;

				const raw = await database.collection(table).findOne(filter, {
					projection: {
						_id: 1,
						persistent: 1,
						parts: 1,
						cache: 1,
					}
				});

				out.doc.raw = raw || null;
			}

			return out;
		}
	};
};
