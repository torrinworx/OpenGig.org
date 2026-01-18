export default () => {
	return {
		authenticated: true,

		onMsg: async (msg, _, { DB, token }) => {
			const uuid = msg?.uuid; // handles null/undefined payloads safely

			let user = null;

			// If uuid is NOT provided, return the authed user's profile (via session token)
			if (uuid === undefined) {
				if (!token) return { error: "Missing session token" };

				const session = await DB("sessions", { uuid: token });
				if (!session) return { error: "Invalid session" };

				const now = Date.now();
				if (!session.status) return { error: "Session disabled" };
				if (typeof session.expires !== "number" || session.expires <= now) {
					return { error: "Session expired" };
				}

				const userUuid = session.query?.user;
				if (!userUuid) return { error: "Session has no user" };

				user = await DB("users", { uuid: userUuid });
			} else {
				// If uuid IS provided, return that user's public profile
				if (typeof uuid !== "string" || !uuid.length) {
					return { error: "Invalid uuid" };
				}

				user = await DB("users", { uuid });
			}

			if (!user) return null;

			// public/safe fields only
			return {
				uuid: user.uuid,
				name: user.name,
				image: user.image ?? null,
			};
		},
	};
};