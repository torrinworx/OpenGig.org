import bcryptjs from 'bcryptjs';
import { randomUUID } from 'crypto';
import ODB from '../util/db.js';

export default ({ sync, client }) => {
	let users;
	(async () => {
		users = await ODB(client, 'users');
	})();

	return {
		message: async (msg) => {
			try {
				const user = users.find(user => user.email === msg.email);
				if (user) {
					const validPassword = await bcryptjs.compare(msg.password, user.password);
					if (validPassword) {
						const sessionToken = randomUUID();
						user.sessions.push(sessionToken);
						
						sync.notifications.push({
							type: 'ok',
							content: 'Login successful!'
						});
						return { status: 'success', sessionToken };
					}
				}

				sync.notifications.push({
					type: 'error',
					content: 'Invalid email or password'
				});
				return { status: 'error' };
			} catch (error) {
				sync.notifications.push({
					type: 'error',
					content: error.message || 'An unexpected error occurred during login'
				});
				console.error('Error during login process', error);
			}
		},
	};
};
