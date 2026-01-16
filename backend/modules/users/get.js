
// return publicly safe to display profile info.
export default () => {
	return {
		authenticated: true,
		onMsg: async ({ uuid }, _, { DB }) => {
			if (typeof uuid !== 'string' || !uuid.length) {
				return { error: 'Invalid uuid' };
			}

			const user = await DB('users', { uuid });
			if (!user) return null;

			const safe = {
				name: user.name,
			};

			return safe;
		},
	};
};
