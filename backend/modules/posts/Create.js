// posts are just generic, what makes them gigs are the type of metadata they have, the types of tags and information the user added to them.

// the type of a post, template, whatever, cannot be changed after the fact, the only things that can be changed are things that users can edit like the title
// The tags, or like modifying the description.


export default () => {
    return {
        onMsg: async ({ name, description, }, __, { sync, user, DB }) => {
            console.log(sync);
            console.log("user: ", user.query)

            let post = await DB('posts');

            console.log("THIS IS POST: ", post, post.query);

            post.query.user = user.query.uuid;

            console.log('This is post.query: ', post.query);

            post.name = name
            post.description = description

            post.gig = true

            console.log("NOW THIS IS POST: ", post, post.query);
            return { post: post.query.uuid };
        }
    };
};
