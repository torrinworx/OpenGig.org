import { Observer, OObject, OArray } from 'destam';

const normalizeName = v => (typeof v === 'string' ? v.trim() : '');

const normalizeImage = v => {
	if (v == null) return null;
	if (typeof v === 'string') {
		const s = v.trim();
		return s.length ? s : null;
	}
	return null;
};

const normalizeRole = v => (v === 'admin' ? 'admin' : null);

const ensureOArray = v => (v instanceof OArray ? v : OArray(Array.isArray(v) ? v : []));

// return a plain JS array of cleaned values
const cleanGigList = v => {
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

	if (cur.length === next.length && cur.every((v, i) => v === next[i])) return false;

	targetOArray.splice(0, targetOArray.length, ...next);
	return true;
};

const bridged = new WeakSet();

export default ({ odb }) => {
	return {
		validate: {
			table: 'state',

			register: async state => {
				// ---- migrate legacy shape -> new shape ----
				// old system used state.query.user; new system should store state.user
				if (state?.query && typeof state.query === 'object') {
					if (!state.user && state.query.user) state.user = state.query.user;
				}

				// ---- ensure profile is an OObject ----
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

				// remove email if it exists
				if ('email' in profile) delete profile.email;

				// normalize scalars (profile-local)
				profile.name = normalizeName(profile.name);
				profile.role = normalizeRole(profile.role);
				profile.image = normalizeImage(profile.image);

				// ---- resolve user ----
				const userUuid = state.user || profile.uuid;
				if (typeof userUuid !== 'string' || !userUuid) return;

				const user = await odb.findOne({ collection: 'users', query: { uuid: userUuid } });
				if (!user) return;

				// migrate legacy user.query.uuid -> user.uuid if needed
				if (!user.uuid && user?.query?.uuid) user.uuid = user.query.uuid;

				// ensure user's gigs is an OArray too (ONLY replace if needed)
				user.gigs = ensureOArray(user.gigs);

				const userRole = normalizeRole(user.role ?? user?.query?.role);

				// init: users doc is the master
				profile.uuid = user.uuid || userUuid;
				profile.name = normalizeName(user.name);
				profile.role = userRole;
				profile.image = normalizeImage(user.image);

				reconcileGigs(profile.gigs, user.gigs);

				// Make sure state.user is actually set going forward
				if (!state.user) state.user = profile.uuid;

				if (bridged.has(state)) return;
				bridged.add(state);

				let lock = 0;

				// user -> profile
				const stopUserToProfile =
					Observer.all([
						user.observer.path('name'),
						user.observer.path('role'),
						user.observer.path(['query', 'role']), // legacy
						user.observer.path('image'),
						user.observer.path('gigs'),
					])
						.throttle(200)
						.watch(async () => {
							if (lock) return;

							lock++;
							profile.name = normalizeName(user.name);
							profile.role = normalizeRole(user.role ?? user?.query?.role);
							profile.image = normalizeImage(user.image);

							reconcileGigs(profile.gigs, user.gigs);
							lock--;

							// old code flushed; keep same behavior
							try { await state.$odb.flush(); } catch { }
						});

				// profile -> user
				const stopProfileToUser =
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

							try { await user.$odb.flush(); } catch { }
						});

				// allow validation system to clean up watchers on dispose/remove, todo: universal validator cleanup thing like onCon.
				return () => {
					try { stopUserToProfile?.(); } catch { }
					try { stopProfileToUser?.(); } catch { }
				};
			},
		},
	};
};