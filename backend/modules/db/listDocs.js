export default () => {
	return {
		onMsg: async (props, { user, database }) => {
			if (user?.query?.role !== 'admin') {
				return { error: 'forbidden' };
			}
			if (!database) throw new Error('Mongo database not provided (context.database)');

			const table = props?.table;
			if (typeof table !== 'string' || !table.trim()) {
				throw new Error('props.table (string) is required');
			}

			// exact match query object, ex: { 'profile.email': 'x@y.com' }
			const query = (props?.query && typeof props.query === 'object') ? props.query : {};

			let limit = props?.limit;
			if (limit == null) limit = 10;
			limit = Number(limit);
			if (!Number.isFinite(limit) || limit < 0) {
				throw new Error('props.limit must be a number >= 0');
			}

			// Convert query shape -> mongo filter on `persistent.*`
			// Also ignore deleted docs
			const filter = {
				'persistent.deletedAt': { $exists: false },
			};

			for (const [k, v] of Object.entries(query)) {
				// exact match semantics
				filter[`persistent.${k}`] = v;
			}

			const collection = database.collection(table);

			let cursor = collection
				.find(filter)
				.sort({ 'persistent.createdAt': -1, _id: -1 }) // _id fallback gives stable-ish ordering
				.project({
					_id: 0,
					persistent: 1,
				});

			if (limit !== 0) cursor = cursor.limit(limit);

			const docs = await cursor.toArray();

			// Return the query sections (persistent), because that’s what you’ll use later for getDoc
			return {
				table,
				limit,
				query,
				docs: docs
					.map(d => d?.persistent)
					.filter(p => p && typeof p === 'object'),
			};
		}
	};
};
