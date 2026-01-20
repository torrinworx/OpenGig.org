import OObject from 'destam/Object.js';
import { Observer } from 'destam';

const normalizeName = (v) => (typeof v === 'string' ? v.trim() : '');
const normalizeImage = (v) => {
	if (v == null) return null;
	if (typeof v === 'string') {
		const s = v.trim();
		return s.length ? s : null;
	}
	return null;
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

				// lock email edits out of synced profile
				if ('email' in profile) delete profile.email;

				profile.name = normalizeName(profile.name);
				profile.image = normalizeImage(profile.image);

				// resolve user uuid
				const userUuid = state.query?.user || profile.uuid;
				if (typeof userUuid !== 'string' || !userUuid) return;

				const user = await DB('users', { uuid: userUuid });
				if (!user) return;

				if (!user.uuid) user.uuid = user.query?.uuid || userUuid;

				// init: users doc is the master
				profile.uuid = user.uuid;
				profile.name = normalizeName(user.name);
				profile.image = normalizeImage(user.image);

				// only wire watchers once per in-memory doc
				if (bridged.has(state)) return;
				bridged.add(state);

				let lock = 0;

				const userName = user.observer.path('name');
				const userImage = user.observer.path('image');

				const profName = state.observer.path('profile').path('name');
				const profImage = state.observer.path('profile').path('image');

				// user -> profile (throttled)
				Observer.all([userName, userImage])
					.throttle(200)
					.watch(async () => {
						if (lock) return;

						const nextName = normalizeName(user.name);
						const nextImage = normalizeImage(user.image);

						if (profile.name === nextName && profile.image === nextImage) return;

						lock++;
						profile.name = nextName;
						profile.image = nextImage;
						lock--;

						await DB.flush(state);
					});

				// profile -> user (throttled)
				Observer.all([profName, profImage])
					.throttle(200)
					.watch(async () => {
						if (lock) return;

						const nextName = normalizeName(profile.name);
						const nextImage = normalizeImage(profile.image);

						if (user.name === nextName && user.image === nextImage) return;

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
