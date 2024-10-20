import fs from 'fs';
import path from 'path';
import express from 'express';
import { createServer as createViteServer } from 'vite';
import { fileURLToPath } from 'url';
import { config } from 'dotenv';
import connection from './connection.js';

config();
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

// Attach any required socket or websocket connections
connection(server);
