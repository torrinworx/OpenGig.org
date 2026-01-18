export const deps = ["modStr"];

export default ({ modStr }) => {
    return {
        onMsg: async ({ type, name, description, tags, image }, __, { user, DB }) => {
            console.log("CREATE GIG IMAGE: ", image)
            if (type !== "offer" && type !== "request") {
                return { error: "Invalid type. Must be 'offer' or 'request'." };
            }

            if (typeof name !== 'string' || name.length > 40) {
                return { error: "Invalid name. Must be a string and no more than 40 characters." };
            }

            if (typeof description !== 'string' || description.length > 2000) {
                return { error: "Invalid description. Must be a string and no more than 2000 characters." };
            }

            if (!Array.isArray(tags) || !tags.every(tag => typeof tag === 'string')) {
                return { error: "Invalid tags. Must be an array of strings." };
            }

            const nameMod = await modStr(name);
            if (!nameMod.ok) {
                return { error: "Name violates moderation rules.", details: nameMod.reason };
            }

            const descMod = await modStr(description);
            if (!descMod.ok) {
                return { error: "Description does not pass moderation.", details: descMod.reason };
            }

            const tagChecks = await Promise.all(tags.map(t => modStr(t)));
            const badIndex = tagChecks.findIndex(r => !r.ok);
            if (badIndex !== -1) {
                return {
                    error: `Tag violates moderation rules: "${tags[badIndex]}"`,
                    tagIndex: badIndex,
                    details: tagChecks[badIndex].reason,
                };
            }

            const gig = await DB('gigs');

            gig.query.uuid = gig.query.uuid ?? gig.persistent?.uuid ?? gig.uuid;
            gig.query.user = user.query.uuid;

            gig.type = type;
            gig.name = name;
            gig.description = description;
            gig.tags = tags;
            gig.image = image;

            console.log("GIG IMAGE: ", gig.image);
            await DB.flush(gig);

            return gig.query.uuid;
        }
    };
};
