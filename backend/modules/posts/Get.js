import { OArray } from "destam";

export default () => {
    return {
        onMsg: async (_, __, { DB, database }) => {
            const collection = database.collection('posts');
            const recentPosts = await collection.find({})
                .sort({ 'persistent.createdAt': -1 })
                .limit(10)
                .toArray();

            let posts = OArray([]);

            for (const post of recentPosts) {
                const reactivePost = await DB.reuse('posts', {
                    uuid: post.persistent.uuid,
                });
                console.log(reactivePost);
                console.log(reactivePost.query)

                posts.push(reactivePost);
            }
            // TODO Figure out how to make these truly reactive? Maybe append to sync? Or do the fancy thing and open a new synced variable with the client?
            // Unsure.
            return { posts };
        }
    };
};
