export default () => {
	return {
		onMsg: async (_, { user, database }) => {
			if (user?.query?.role !== 'admin') {
				return { error: 'forbidden' };
			}

			if (!database) {
				throw new Error('Mongo database not provided (context.database)');
			}

			const cols = await database
				.listCollections({}, { nameOnly: true })
				.toArray();

			const tables = cols
				.map(c => c.name)
				.filter(name => name && name !== 'DBTableDataStore')
				.sort();

			return tables;
		}
	};
};