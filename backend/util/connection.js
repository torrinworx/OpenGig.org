import { OArray } from 'destam';
import { WebSocketServer } from 'ws';

import Jobs from './jobs.js';
import ODB from '../util/db.js';

export default async (server, client) => {
	const users = await ODB(client, 'users', OArray([]));
	const wss = new WebSocketServer({ server });
	let jobs = await Jobs('./backend/jobs', { client, users });

	wss.on('connection', async (ws, req) => {
		// TODO: Need to make sync individual and private for each user.
		let sync;
		let accessibleJobs;

		const updateAccessibleJobs = async (token) => {
			accessibleJobs = {
				signup: jobs.signup,
				login: jobs.login
			};

			if (token && Array.isArray(users)) {
				const user = users.find(user => user.sessions.includes(token));

				if (user) {
					accessibleJobs = jobs
					sync = await ODB(client, 'sync');
				};
			}

			Object.values(accessibleJobs).forEach(job => {
                job.connection(ws, sync);
            });
		};

		const urlParams = new URLSearchParams(req.url.split('?')[1]);
		const initialSessionToken = urlParams.get('opengigSessionToken');
        console.log(initialSessionToken)
		updateAccessibleJobs(initialSessionToken);

		ws.on('message', async msg => {
			const parsedMsg = JSON.parse(msg);
			const { name, sessionToken } = parsedMsg;

			updateAccessibleJobs(sessionToken);

            console.log(accessibleJobs);

			const jobHandler = accessibleJobs[name];
			if (jobHandler) {
				const result = await jobHandler.message(parsedMsg);
				if (result && result.result) {
					ws.send(JSON.stringify(result));
				}
			} else {
				ws.send(JSON.stringify({ error: `Unauthorized job: ${name}` }));
			}
		});

		ws.on('close', () => {
			Object.values(accessibleJobs).forEach(job => {
				job.close();
			});
		});

		ws.on('error', e => {
			Object.values(accessibleJobs).forEach(job => {
				job.error(e);
			});
		});
	});
};

