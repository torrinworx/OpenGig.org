import { OArray } from 'destam';
import bcryptjs from 'bcryptjs';

import ODB from '../util/db.js';


export default ({ syncState, ws }) => {
    let users;
    (async () => {
        users = await ODB('users', OArray([]));
    })();

    return {
        message: async (msg) => {
            try {
                const saltRounds = 10;
                const salt = await bcryptjs.genSalt(saltRounds);
                const hashedPassword = await bcryptjs.hash(msg.password, salt);

                console.log(users)
                users.push({
                    email: msg.email,
                    password: hashedPassword,
                    userID: crypto.randomUUID(),
                    sessions: OArray([]) // List of user session tokens.
                });
            } catch (error) {
                console.error('Error hashing the password', error);
            }
        },
    };
};