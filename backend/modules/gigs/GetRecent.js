export default () => {
    return {
        onMsg: async (_, __, { DB, database }) => {
            const collection = database.collection('gigs');
            const recentGigs = await collection.find({})
                .sort({ 'persistent.createdAt': -1 })
                .limit(10)
                .toArray();

            const gigs = {};

            for (const post of recentGigs) {
                const gig = await DB.reuse('gigs', {
                    uuid: post.persistent.uuid,
                });
                gigs[gig.query.uuid] = gig;
            }

            return gigs;
        }
    };
};
