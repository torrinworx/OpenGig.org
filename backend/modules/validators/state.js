import { Observer, OObject, OArray } from 'destam';

const normalizeName = v => (typeof v === 'string' ? v.trim() : '');
const normalizeImage = v => {
	if (v == null) return null;
	if (typeof v !== 'string') return null;
	const s = v.trim();
	return s.length ? s : null;
};
const normalizeRole = v => (v === 'admin' ? 'admin' : null);

const ensureOObject = v => (v instanceof OObject ? v : OObject(v && typeof v === 'object' ? v : {}));
const ensureOArray = v => (v instanceof OArray ? v : OArray(Array.isArray(v) ? v : []));

const cleanGigList = v => {
	const arr = v instanceof OArray ? [...v] : Array.isArray(v) ? v : [];
	const out = [];
	const seen = new Set();
	for (const x of arr) {
		if (typeof x !== 'string' || !x) continue;
		if (seen.has(x)) continue;
		seen.add(x);
		out.push(x);
	}
	return out;
};

const reconcileGigs = (target, source) => {
	const next = cleanGigList(source);
	const cur = [...target];
	if (cur.length === next.length && cur.every((v, i) => v === next[i])) return false;
	target.splice(0, target.length, ...next);
	return true;
};

const bridged = new WeakSet();

export default ({ odb }) => ({
	validate: {
		table: 'state',

		register: async state => {
			state.profile = ensureOObject(state.profile);
			const profile = state.profile;

			// canonical profile shape
			if (!('id' in profile)) profile.id = null;
			if (!('name' in profile)) profile.name = '';
			if (!('role' in profile)) profile.role = null;
			if (!('image' in profile)) profile.image = null;
			profile.gigs = ensureOArray(profile.gigs);

			// normalize profile scalars
			profile.name = normalizeName(profile.name);
			profile.role = normalizeRole(profile.role);
			profile.image = normalizeImage(profile.image);

			// canonical user id comes from state.user (or legacy profile.id)
			const userId = state.user ?? profile.id;
			if (typeof userId !== 'string' || !userId) return;

			// new system: users are found by index.id
			const user = await odb.findOne({ collection: 'users', query: { id: userId } });
			if (!user) return;

			user.gigs = ensureOArray(user.gigs);

			const syncFromUser = () => {
				// new system: user id is the ODB key (or user.id if you also store it in state)
				const id = user.id ?? user.$odb?.key ?? userId;

				profile.id = id;
				profile.name = normalizeName(user.name);
				profile.role = normalizeRole(user.role);
				profile.image = normalizeImage(user.image);

				reconcileGigs(profile.gigs, user.gigs);

				if (!state.user) state.user = id;
			};

			const syncToUser = () => {
				user.name = normalizeName(profile.name);
				user.image = normalizeImage(profile.image);
			};

			// initial hydrate
			syncFromUser();

			if (bridged.has(state)) return;
			bridged.add(state);

			let lock = 0;

			// user -> profile
			const stopUserToProfile =
				Observer.all([
					user.observer.path('id'),
					user.observer.path('name'),
					user.observer.path('role'),
					user.observer.path('image'),
					user.observer.path('gigs'),
				])
					.throttle(200)
					.watch(async () => {
						if (lock) return;
						lock++;
						try {
							syncFromUser();
						} finally {
							lock--;
						}

						try { await state.$odb.flush(); } catch { }
					});

			// profile -> user (only name/image)
			const stopProfileToUser =
				Observer.all([
					profile.observer.path('name'),
					profile.observer.path('image'),
				])
					.throttle(200)
					.watch(async () => {
						if (lock) return;
						lock++;
						try {
							syncToUser();
						} finally {
							lock--;
						}

						try { await user.$odb.flush(); } catch { }
					});

			return () => {
				try { stopUserToProfile?.(); } catch { }
				try { stopProfileToUser?.(); } catch { }
			};
		},
	},
});
