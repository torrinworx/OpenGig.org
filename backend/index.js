import { OObject } from "destam";
import { coreServer } from "web-core/server";
import path from 'path';
import { fileURLToPath } from 'url';

const connection = async (ws, req) => {
	return;
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootDir = path.resolve(__dirname, '..');
console.log('Root Directory:', rootDir);

coreServer(
	path.resolve('./backend/jobs'),
	process.env.ENV === 'production' ? './dist' : './frontend',
	connection
);
