/*
Public user lookup by id (new system).

Input:
- { uuid }   (back-compat name; treated as id)
- { uuids }  (back-compat name; treated as ids)

Returns:
- single: { id, name, image, gigs } | null | { error }
- many: Array<{ id, name, image, gigs }> | { error }
*/
export default () => {
	return {
		authenticated: false,

		onMsg: async ({ uuid, uuids }, { odb }) => {
			console.log(uuid);

			const toUserInfo = user => ({
				id: user.id ?? user.$odb?.key ?? null,
				name: user.name ?? '',
				image: user.image ?? null,
				gigs: user.gigs ?? [],
			});

			const getById = id =>
				odb.findOne({ collection: 'users', query: { id } });

			// single (back-compat: param name `uuid`)
			if (typeof uuid === 'string' && uuid.trim()) {
				const id = uuid.trim();
				const user = await getById(id);
				if (!user) return null;
				return toUserInfo(user);
			}

			// many (back-compat: param name `uuids`)
			if (Array.isArray(uuids)) {
				const ids = uuids
					.filter(u => typeof u === 'string')
					.map(u => u.trim())
					.filter(Boolean);

				if (!ids.length) return { error: 'Invalid uuids' };

				const users = await Promise.all(ids.map(getById));
				return users.filter(Boolean).map(toUserInfo);
			}

			return { error: 'Invalid uuid' };
		},
	};
};
