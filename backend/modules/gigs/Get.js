import { OArray } from "destam";

export default () => {
    return {
        onMsg: async (_, __, { DB, database }) => {
            const collection = database.collection('gigs');
            const recentGigs = await collection.find({})
                .sort({ 'persistent.createdAt': -1 })
                .limit(10)
                .toArray();

            let gigs = OArray([]);

            for (const post of recentGigs) {
                const reactivePost = await DB.reuse('gigs', {
                    uuid: post.persistent.uuid,
                });
                gigs.push(reactivePost);
            }
            // TODO Figure out how to make these truly reactive? Maybe append to sync? Or do the fancy thing and open a new synced variable with the client?
            // Unsure.
            return { gigs };
        }
    };
};
