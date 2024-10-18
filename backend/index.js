import { Application, send } from "https://deno.land/x/oak/mod.ts";
import { Jobs, JobRequest } from "./jobs.js";

const env = Deno.env.toObject();
const app = new Application();
const jobs = new Jobs('./backend/jobs');

// (async () => {
// 	const jobRequest = new JobRequest('example', { args: 'example' });

// 	try {
// 		const result = await jobs.router(jobRequest);
// 		console.log('Job result:', result);
// 	} catch (error) {
// 		console.error('Job execution error:', error);
// 	}
// })();

app.use(async (context) => {
	const path = context.request.url.pathname;

	if (path.startsWith("/")) {
		await send(context, path, {
			root: `${Deno.cwd()}/../build`,
			index: "index.html",
		});
	} else {
		await send(context, '/index.html', {
			root: `${Deno.cwd()}/../build`,
		});
	}
});

const port = env.PORT || 3000;

console.log(`Serving on http://localhost:${port}/`);
await app.listen({ port });

import connection from './connection.js';
connection(port);
