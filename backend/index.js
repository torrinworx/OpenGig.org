import { OObject } from "destam"
import { ODB, coreServer } from "web-core/server";
import path from 'path';

const connection = async (ws, req) => {
    console.log("This is running on connection")
    return
};
console.log(path.resolve('./frontend/build'));
coreServer(
    path.resolve('./backend/jobs'),
    path.resolve('./frontend/build'),
    connection
);
