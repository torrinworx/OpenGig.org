import { OArray } from 'destam';
import bcryptjs from 'bcryptjs';

import ODB from '../util/db.js';


export default ({ sync, client }) => {
    let users;
    (async () => {
        users = await ODB(client, 'users', OArray([]));
    })();

    return {
        message: async (msg) => {
            try {
                const saltRounds = 10;
                const salt = await bcryptjs.genSalt(saltRounds);
                const hashedPassword = await bcryptjs.hash(msg.password, salt);

                users.push({
                    email: msg.email,
                    password: hashedPassword,
                    userID: crypto.randomUUID(),
                    sessions: OArray([]) // List of user session tokens.
                });

                sync.notifications.push({
                    type: 'ok',
                    content: 'Successful sign up! Please login to confirm your credentials.'
                });
                return { status: 'success' };
            } catch (error) {
                sync.notifications.push({
                    type: 'error',
                    content: error.message || 'An unexpected error occurred'
                });
                console.error('Error hashing the password', error);
            }
        },
    };
};
