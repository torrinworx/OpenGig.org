import { OObject } from "destam";

import { ODB, coreServer } from "web-core";

const connection = async (ws, req) => {
    const sessionToken = new URLSearchParams(req.url.split('?')[1]).get('sessionToken');

    const user = await ODB('users', { "sessions": sessionToken });
    let sync = await ODB('state', { userID: user.userID });
    if (!sync) {
        sync = await ODB('state', {}, OObject({
            userID: user.userID,
        }));
    }

    return {
        sync: sync,
        user: user,
    }
};

coreServer('./backend/jobs', connection);
