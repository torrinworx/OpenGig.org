export default () => {
	return {
		onMsg: async ({ table, query, flush = true }, { user, DB }) => {
			if (user?.query?.role !== 'admin') {
				return { error: 'forbidden' };
			}

			if (typeof table !== 'string' || !table.trim()) {
				throw new Error('props.table (string) is required');
			}

			if (!query || typeof query !== 'object' || Array.isArray(query)) {
				throw new Error('props.query (object) is required');
			}

			const querySection = await DB.query(table, query);
			if (!querySection) return { error: 'not_found' };

			// DB.delete accepts either a store or query section
			await DB.delete(querySection);

			// delete() should flush internally per docs, but leaving this hook
			// in case your wrapper behaves differently
			if (flush) {
				try {
					const store = await DB.instance(querySection, table);
					await DB.flush(store);
				} catch {
					// ignore if instance no longer exists
				}
			}

			return { ok: true };
		}
	};
};
