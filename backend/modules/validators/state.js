import { Observer, OObject, OArray } from 'destam';

const normalizeName = (v) => (typeof v === 'string' ? v.trim() : '');

const normalizeImage = (v) => {
	if (v == null) return null;
	if (typeof v === 'string') {
		const s = v.trim();
		return s.length ? s : null;
	}
	return null;
};

const normalizeGigs = (v) => {
	if (!(v instanceof OArray)) return OArray([]);
	// keep only string uuids, de-dupe, keep order
	return OArray([...new Set([...v].filter(x => typeof x === 'string' && x.length))]);
};

const normalizeRole = (v) => (v === 'admin' ? 'admin' : null);

const bridged = new WeakSet();

export default ({ DB }) => {
	return {
		validate: {
			table: 'state',

			register: async (state) => {
				if (!state.profile) state.profile = OObject({});
				else if (!(state.profile instanceof OObject)) state.profile = OObject(state.profile);

				const profile = state.profile;

				if (!('uuid' in profile)) profile.uuid = null;
				if (!('name' in profile)) profile.name = '';
				if (!('role' in profile)) profile.role = null;
				if (!('image' in profile)) profile.image = null;
				if (!('gigs' in profile)) profile.gigs = OArray([]);

				if ('email' in profile) delete profile.email;

				profile.name = normalizeName(profile.name);
				profile.role = normalizeRole(profile.role);
				profile.image = normalizeImage(profile.image);
				profile.gigs = normalizeGigs(profile.gigs);

				const userUuid = state.query?.user || profile.uuid;
				if (typeof userUuid !== 'string' || !userUuid) return;

				const user = await DB('users', { uuid: userUuid });
				if (!user) return;

				if (!user.uuid) user.uuid = user.query?.uuid || userUuid;

				// init: users doc is the master (one-way)
				profile.uuid = user.uuid;
				profile.name = normalizeName(user.name);
				console.log(user)
				console.log(user.query.role)
				profile.role = normalizeRole(user.query.role);
				profile.image = normalizeImage(user.image);
				profile.gigs = normalizeGigs(user.gigs);

				if (bridged.has(state)) return;
				bridged.add(state);

				let lock = 0;

				// user -> profile
				Observer.all([
					user.observer.path('name'),
					user.observer.path(['query', 'role']),
					user.observer.path('image'),
					user.observer.path('gigs'),
				])
					.throttle(200)
					.watch(async () => {
						if (lock) return;

						const nextName = normalizeName(user.name);
						const nextRole = normalizeRole(user.query.role);
						const nextImage = normalizeImage(user.image);
						const nextGigs = normalizeGigs(user.gigs);

						lock++;
						profile.name = nextName;
						profile.role = nextRole;
						profile.image = nextImage;
						profile.gigs = nextGigs;
						lock--;

						await DB.flush(state);
					});

				// profile -> user
				Observer.all([
					profile.observer.path('name'),
					profile.observer.path('image'),
				])
					.throttle(200)
					.watch(async () => {
						if (lock) return;

						const nextName = normalizeName(profile.name);
						const nextImage = normalizeImage(profile.image);

						lock++;
						user.name = nextName;
						user.image = nextImage;
						lock--;

						await DB.flush(user);
					});
			},
		},
	};
};