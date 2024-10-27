import { WebSocketServer } from 'ws';

import Jobs from './jobs.js';

const jobsSystem = new Jobs('./backend/jobs');

export default (server, syncState) => {
    const wss = new WebSocketServer({ server });

    wss.on('connection', async (ws) => {
        await jobsSystem.setupHandlers(syncState, ws);

        jobsSystem.connection();

        ws.on('message', msg => jobsSystem.message(msg));
        ws.on('close', () => jobsSystem.close());
        ws.on('error', e => jobsSystem.error(e));
    });
}
