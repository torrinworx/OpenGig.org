/*
Public user lookup by uuid.
Returns: { uuid, name, image } | null | { error }
*/
export default () => {
	return {
		authenticated: false,

		onMsg: async ({ uuid }, { DB }) => {
			if (typeof uuid !== 'string' || !uuid.trim()) {
				return { error: 'Invalid uuid' };
			}

			const user = await DB('users', { uuid });
			if (!user) return null;

			return {
				uuid: user.uuid,
				name: user.name,
				image: user.image ?? null,
				gigs: user.gigs,
			};
		},
	};
};
