import { OObject, OArray } from 'destam';
import bcryptjs from 'bcryptjs';

export default ({ users }) => {
    return {
        message: async (msg) => {
            try {
                const saltRounds = 10;
                const salt = await bcryptjs.genSalt(saltRounds);
                const hashedPassword = await bcryptjs.hash(msg.password, salt);

                users.push(OObject({
                    email: msg.email,
                    password: hashedPassword,
                    userID: crypto.randomUUID(),
                    sessions: OArray([])
                }));
                return { status: 'success' };
            } catch (error) {
                console.error('Error hashing the password', error);
                return { status: 'error', error: error };
            }
        },
    };
};
