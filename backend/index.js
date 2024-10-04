import path from 'path';
import http from 'http';
import webpack from 'webpack';
import express from 'express';
import { config } from 'dotenv';
import { OObject, createNetwork } from 'destam';
import { WebSocketServer } from 'ws';
import { encode, decode } from 'msgpack-lite';
import { stringify, parse } from 'flatted';

import webpackDevMiddleware from 'webpack-dev-middleware';
import webpackHotMiddleware from 'webpack-hot-middleware';

import { Jobs } from './jobs.js';
import webpackConfig from '../webpack.config.js';

config();
const app = express();
app.use(express.json());

const __filename = new URL(import.meta.url).pathname;
const __dirname = path.dirname(__filename);

if (process.env.NODE_ENV === 'production') {
	app.use(express.static(path.join(__dirname, '../build')));
	app.get('*', (_req, res) => {
		res.sendFile(path.resolve(__dirname, '../build', 'index.html'));
	});
} else {
	const compiler = webpack(webpackConfig);
	
	app.use(
		webpackDevMiddleware(compiler, {
			publicPath: webpackConfig.output.publicPath,
		})
	);
	
	app.use(webpackHotMiddleware(compiler));
	
	app.get('*', (req, res, next) => {
		const filename = path.join(compiler.outputPath, 'index.html');
		compiler.outputFileSystem.readFile(filename, (err, result) => {
			if (err) {
				return next(err);
			}
			res.set('content-type', 'text/html');
			res.send(result);
			res.end();
		});
	});
}

const port = process.env.PORT || process.env.BACKEND_PORT || 5000;
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

const OServer = OObject({});
const network = createNetwork(OServer.observer);
const fromClient = {};

wss.on('connection', (ws) => {
	network.digest(async commit => {
		try {
            ws.send(encode(stringify(commit)))
		} catch (e) {
            console.log(e)
        }
	}, 1000 / 30, arg => arg === fromClient);

	ws.on('message', (e) => {
        const changes = decode(new Uint8Array(e));
        console.log(parse(changes));
		network.apply(parse(changes), fromClient);
	});

	ws.on('close', () => {
        network.remove();
		console.log('Client disconnected');
	});
});


server.listen(port, () => {
	console.log(`Serving on port ${port}`);
});

(async () => {
	const jobs = new Jobs('./backend/jobs');
	
	// const jobRequest = new JobRequest('example', { args: 'example' });
	// try {
	//     const result = await jobs.router(jobRequest);
	//     console.log('Job result:', result);
	// } catch (error) {
	//     console.error('Job execution error:', error);
	// }
})();
