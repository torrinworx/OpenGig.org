/*
Public user lookup by uuid.
Returns:
- single uuid: { uuid, name, image, gigs } | null | { error }
- uuids[]: Array<{ uuid, name, image, gigs }> | { error }
*/
export default () => {
	return {
		authenticated: false,

		onMsg: async ({ uuid, uuids }, { DB }) => {
			const toUserInfo = (user) => ({
				uuid: user.uuid,
				name: user.name,
				image: user.image ?? null,
				gigs: user.gigs,
			});

			if (typeof uuid === "string" && uuid.trim()) {
				const user = await DB("users", { uuid });
				if (!user) return null;
				return toUserInfo(user);
			}

			if (Array.isArray(uuids)) {
				const cleaned = uuids
					.filter((u) => typeof u === "string")
					.map((u) => u.trim())
					.filter(Boolean);

				if (cleaned.length === 0) return { error: "Invalid uuids" };

				const users = await Promise.all(
					cleaned.map(async (id) => {
						const user = await DB("users", { uuid: id });
						return user ? toUserInfo(user) : null;
					})
				);

				return users.filter(Boolean);
			}

			return { error: "Invalid uuid" };
		},
	};
};