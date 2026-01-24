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

const normalizeRole = (v) => (v === 'admin' ? 'admin' : null);

// make sure it's an OArray, and return it (possibly replaced ONCE)
const ensureOArray = (v) => (v instanceof OArray ? v : OArray(Array.isArray(v) ? v : []));

// return a plain JS array of cleaned values
const cleanGigList = (v) => {
	const arr = v instanceof OArray ? [...v] : Array.isArray(v) ? v : [];
	const out = [];
	const seen = new Set();
	for (const x of arr) {
		if (typeof x !== 'string' || !x.length) continue;
		if (seen.has(x)) continue;
		seen.add(x);
		out.push(x);
	}
	return out;
};

// mutate target OArray to match cleaned source list, without replacing instance
const reconcileGigs = (targetOArray, source) => {
	const next = cleanGigList(source);
	const cur = [...targetOArray];

	// if already equal, do nothing
	if (cur.length === next.length && cur.every((v, i) => v === next[i])) return false;

	targetOArray.splice(0, targetOArray.length, ...next);
	return true;
};

const bridged = new WeakSet();

export default ({ DB }) => {
	return {
		validate: {
			table: 'state',

			register: async (state) => {
				// ensure profile is an OObject
				if (!state.profile) state.profile = OObject({});
				else if (!(state.profile instanceof OObject)) state.profile = OObject(state.profile);

				const profile = state.profile;

				// ensure base fields exist
				if (!('uuid' in profile)) profile.uuid = null;
				if (!('name' in profile)) profile.name = '';
				if (!('role' in profile)) profile.role = null;
				if (!('image' in profile)) profile.image = null;

				// ensure gigs is an OArray (ONLY replace if it isn't already)
				profile.gigs = ensureOArray(profile.gigs);

				if ('email' in profile) delete profile.email;

				// normalize scalars
				profile.name = normalizeName(profile.name);
				profile.role = normalizeRole(profile.role);
				profile.image = normalizeImage(profile.image);

				const userUuid = state.query?.user || profile.uuid;
				if (typeof userUuid !== 'string' || !userUuid) return;

				const user = await DB('users', { uuid: userUuid });
				if (!user) return;

				if (!user.uuid) user.uuid = user.query?.uuid || userUuid;

				// ensure user's gigs is an OArray too (ONLY replace if needed)
				user.gigs = ensureOArray(user.gigs);

				// init: users doc is the master
				profile.uuid = user.uuid;
				profile.name = normalizeName(user.name);
				profile.role = normalizeRole(user.query.role);
				profile.image = normalizeImage(user.image);

				// reconcile gigs in-place (profile.gigs mutated, not replaced)
				reconcileGigs(profile.gigs, user.gigs);

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

						lock++;
						profile.name = normalizeName(user.name);
						profile.role = normalizeRole(user.query.role);
						profile.image = normalizeImage(user.image);

						reconcileGigs(profile.gigs, user.gigs);
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

						lock++;
						user.name = normalizeName(profile.name);
						user.image = normalizeImage(profile.image);
						lock--;

						await DB.flush(user);
					});
			},
		},
	};
};