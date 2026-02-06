import { OArray, OObject } from 'destam';

export const deps = ['modStr'];

export default ({ modStr }) => ({
    onMsg: async ({ type, name, description, tags, image }, { user, odb }) => {
        if (!user?.uuid) return { error: 'not_authenticated' };
        if (type !== 'offer' && type !== 'request') return { error: "Invalid type. Must be 'offer' or 'request'." };

        if (typeof name !== 'string' || name.length > 40) {
            return { error: 'Invalid name. Must be a string and no more than 40 characters.' };
        }

        if (typeof description !== 'string' || description.length > 2000) {
            return { error: 'Invalid description. Must be a string and no more than 2000 characters.' };
        }

        const tagList =
            tags == null ? [] :
                Array.isArray(tags) ? tags :
                    [...tags]; // supports OArray/iterables

        if (!tagList.every(t => typeof t === 'string')) {
            return { error: 'Invalid tags. Must be an array of strings.' };
        }

        const check = async (label, text) => {
            const r = await modStr(text);
            if (!r.ok) return { error: `${label} violates moderation rules.`, details: r.reason };
            return null;
        };

        const badName = await check('Name', name);
        if (badName) return badName;

        const badDesc = await check('Description', description);
        if (badDesc) return badDesc;

        for (let i = 0; i < tagList.length; i++) {
            const badTag = await check(`Tag "${tagList[i]}"`, tagList[i]);
            if (badTag) return { ...badTag, tagIndex: i };
        }

        const now = Date.now();

        const gig = await odb.open({
            collection: 'gigs',
            value: OObject({
                user: user.uuid,
                type,
                name,
                description,
                tags: OArray(tagList),
                image: image ?? null,
                createdAt: now,
                modifiedAt: now,
            }),
        });

        await gig.$odb.flush();

        const gigId = gig.$odb?.key;
        if (!gigId) return { error: 'gig_create_failed_no_id' };

        if (!(user.gigs instanceof OArray)) user.gigs = OArray([]);
        user.gigs.push(gigId);
        await user.$odb.flush();

        return gigId;
    },
});
