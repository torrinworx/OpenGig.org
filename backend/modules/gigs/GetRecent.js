export default () => {
    return {
        authenticated: false,

        onMsg: async (_, { odb }) => {
            const col = odb.driver.database.collection('gigs');

            const docs = await col
                .find({}, { projection: { _id: 0, key: 1 } })
                .sort({ 'index.createdAt': -1 })
                .limit(50)
                .toArray();

            return docs
                .map(d => d?.key)
                .filter(id => typeof id === 'string' && id.length);
        }
    };
};