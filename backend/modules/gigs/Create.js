// posts are just generic, what makes them gigs are the type of metadata they have, the types of tags and information the user added to them.

// the type of a post, template, whatever, cannot be changed after the fact, the only things that can be changed are things that users can edit like the title
// The tags, or like modifying the description.


export default () => {
    return {
        onMsg: async ({ type, name, subName, description, tags }, __, { sync, user, DB }) => {

            // Description limit: 2000 characters
            // name limit: 40 characters
            // sub name: 100

            let gig = await DB('gigs');
            gig.query.user = user.query.uuid;
            gig.type = type;
            gig.name = name;
            gig.subName = subName;
            gig.description = description;
            gig.tags = tags

            return { gig: gig.query.uuid };
        }
    };
};
