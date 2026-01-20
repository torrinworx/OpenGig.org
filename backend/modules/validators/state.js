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
	if (!v || !v instanceof OArray) return OArray([]);
	// keep only string uuids, de-dupe
	return [...new Set(v.filter(x => typeof x === 'string' && x.length))];
};

const bridged = new WeakSet();

export default ({ DB }) => {
	return {
		validate: {
			table: 'state',

			register: async (state) => {
				// profile shape
				if (!state.profile) state.profile = OObject({});
				else if (!(state.profile instanceof OObject)) state.profile = OObject(state.profile);

				const profile = state.profile;

				if (!('uuid' in profile)) profile.uuid = null;
				if (!('name' in profile)) profile.name = '';
				if (!('image' in profile)) profile.image = null;
				if (!('gigs' in profile)) profile.gigs = [];

				// lock email edits out of synced profile
				if ('email' in profile) delete profile.email;

				profile.name = normalizeName(profile.name);
				profile.image = normalizeImage(profile.image);
				profile.gigs = normalizeGigs(profile.gigs);

				// resolve user uuid
				const userUuid = state.query?.user || profile.uuid;
				if (typeof userUuid !== 'string' || !userUuid) return;

				const user = await DB('users', { uuid: userUuid });
				if (!user) return;

				if (!user.uuid) user.uuid = user.query?.uuid || userUuid;

				// init: users doc is the master (one-way)
				profile.uuid = user.uuid;
				profile.name = normalizeName(user.name);
				profile.image = normalizeImage(user.image);
				profile.gigs = normalizeGigs(user.gigs);

				// only wire watchers once per in-memory doc
				if (bridged.has(state)) return;
				bridged.add(state);

				let lock = 0;

				const userName = user.observer.path('name');
				const userImage = user.observer.path('image');
				const userGigs = user.observer.path('gigs');

				Observer.all([userName, userImage, userGigs])
					.throttle(200)
					.watch(async () => {
						if (lock) return;

						const nextName = normalizeName(user.name);
						const nextImage = normalizeImage(user.image);
						const nextGigs = normalizeGigs(user.gigs);

						if (
							profile.name === nextName &&
							profile.image === nextImage &&
							Array.isArray(profile.gigs) &&
							profile.gigs.length === nextGigs.length &&
							profile.gigs.every((v, i) => v === nextGigs[i])
						) return;

						lock++;
						profile.name = nextName;
						profile.image = nextImage;
						profile.gigs = nextGigs;
						lock--;

						await DB.flush(state);
					});
			},
		},
	};
};
