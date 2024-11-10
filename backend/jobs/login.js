import bcryptjs from 'bcryptjs';
import { randomUUID } from 'crypto';

export default ({ users }) => {
	return {
		message: async (msg) => {
			try {
				const user = users.find(user => user.email === msg.email);
				if (user) {
					const validPassword = await bcryptjs.compare(msg.password, user.password);
					if (validPassword) {
						const sessionToken = randomUUID();
						user.sessions.push(sessionToken);
						return { status: 'success', sessionToken };
					}
				}

				return { status: 'error', error: 'Invalid email or password' };
			} catch (error) {
				console.error('Error during login process', error);
				return { status: 'error', error: error };

			}
		},
	};
};
