import { OObject } from "destam"
import { ODB, coreServer } from "web-core/server";


const connection = async (ws, req) => {
    console.log("This is running on connection")
    return
};

coreServer('./backend/jobs', './frontend/build', connection);
