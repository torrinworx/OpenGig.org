import { OObject } from "destam"
import { ODB, coreServer } from "web-core/server";
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const connection = async (ws, req) => {
    return;
};

const rootDir = path.resolve(__dirname, '..');
console.log('Root Directory:', rootDir);

coreServer(
	path.resolve(rootDir, 'backend/jobs'),
	path.resolve(rootDir, 'frontend/build'),
	connection
);
