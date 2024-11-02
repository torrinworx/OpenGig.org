import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import express from 'express';
import { config } from 'dotenv';
import { createServer as createViteServer } from 'vite';

import ODB from './util/db.js';
import Jobs from './util/jobs.js';
import connection from './util/connection.js';
import { OArray } from 'destam';

config();

const jobs = new Jobs('./backend/jobs');
const syncState = await ODB('test');
const app = express();
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

if (process.env.ENV === 'production') {
	app.use(express.static(path.join(__dirname, '../build')));
	app.get('*', (_req, res) => {
		res.sendFile(path.resolve(__dirname, '../build', 'index.html'));
	});
} else {
	const vite = await createViteServer({
		server: { middlewareMode: 'html' }
	});

	app.use(vite.middlewares);

	app.get('*', async (req, res, next) => {
		try {
			const url = req.originalUrl;
			const template = fs.readFileSync(path.resolve(__dirname, 'index.html'), 'utf-8');
			const html = await vite.transformIndexHtml(url, template);

			res.status(200).set({ 'Content-Type': 'text/html' }).end(html);
		} catch (e) {
			vite.ssrFixStacktrace(e);
			next(e);
		}
	});
}

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
	console.log(`Serving on http://localhost:${port}/`);
});

// if (!syncState.notifications) {
// 	syncState.notifications = OArray([]);
// 	syncState.notifications.push({
// 		content: "This is an error from the server",
// 		type: "ok"
// 	})
// }

connection(server, syncState, jobs);
