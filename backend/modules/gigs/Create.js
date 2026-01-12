import { moderateStr } from '../../moderation.js';

export default () => {
    return {
        onMsg: async ({ type, name, subName, description, tags }, __, { sync, user, DB }) => {
            if (type !== "gig_service" && type !== "gig_request") {
                return { error: "Invalid type. Must be 'gig_service' or 'gig_request'." };
            }

            if (typeof name !== 'string' || name.length > 40) {
                return { error: "Invalid name. Must be a string and no more than 40 characters." };
            }

            if (typeof subName !== 'string' || subName.length > 100) {
                return { error: "Invalid subName. Must be a string and no more than 100 characters." };
            }

            if (typeof description !== 'string' || description.length > 2000) {
                return { error: "Invalid description. Must be a string and no more than 2000 characters." };
            }

            if (!Array.isArray(tags) || !tags.every(tag => typeof tag === 'string')) {
                return { error: "Invalid tags. Must be an array of strings." };
            }

            const nameMod = await moderateStr(name);
            if (!nameMod.ok) {
                // increment user moderation violation counter?
                return { error: "Name violates moderation rules.", details: nameMod.reason };
            }

            const descMod = await moderateStr(description);
            if (!descMod.ok) {
                return { error: "Description does not pass moderation.", details: descMod.reason };
            }

            const tagChecks = await Promise.all(tags.map(t => moderateStr(t)));

            const badIndex = tagChecks.findIndex(r => !r.ok);
            if (badIndex !== -1) {
                return {
                    error: `Tag violates moderation rules: "${tags[badIndex]}"`,
                    tagIndex: badIndex,
                    details: tagChecks[badIndex].reason,
                };
            }

            let gig = await DB('gigs');
            gig.query.user = user.query.uuid;
            gig.type = type;
            gig.name = name;
            gig.subName = subName;
            gig.description = description;
            gig.tags = tags;

            return { gig: gig.query.uuid };
        }
    };
};
