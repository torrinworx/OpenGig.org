import { OArray } from 'destam';

// honestly not sure if this is worth keeping, since data on prod is temp anyway and we set it now in gigs/Create.js in the user.gigs array this doesn't need to exist.
export default ({ DB }) => {
	return {
		validate: {
			table: 'gigs',
			register: async (gig) => {
				try {
					// must have enough to link gig -> user
					const gigUuid = gig?.query?.uuid;
					const userUuid = gig?.query?.user;
					if (typeof gigUuid !== 'string' || !gigUuid) return;
					if (typeof userUuid !== 'string' || !userUuid) return;

					// load user
					const userQuery = await DB.query('users', { uuid: userUuid });
					if (!userQuery) return;
					const user = await DB.instance(userQuery, 'users');
					// ensure array + append if missing
					if (!user.gigs || !user.gigs instanceof OArray) user.gigs = OArray([]);
					if (!user.gigs.includes(gigUuid)) {
						user.gigs.push(gigUuid);
						await DB.flush(user);
					}
				} catch (e) {
					console.error('gig validator repair error:', e);
				}
			},
		},
	};
};
