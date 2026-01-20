export default () => {
    return {
        authenticated: false,
        onMsg: async (_, __, { database }) => {
            const collection = database.collection('gigs');

            const recentGigs = await collection.find({})
                .sort({ 'persistent.createdAt': -1 })
                .limit(50)
                .project({ 'persistent.uuid': 1, _id: 0 })
                .toArray();

            return recentGigs
                .map(doc => doc?.persistent?.uuid)
                .filter(uuid => typeof uuid === 'string' && uuid.length);
        }
    };
};
