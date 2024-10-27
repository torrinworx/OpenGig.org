import { WebSocketServer } from 'ws';

export default (server, syncState, jobs) => {
    const wss = new WebSocketServer({ server });

    wss.on('connection', async (ws) => {
        await jobs.setupHandlers(syncState, ws);

        jobs.connection();

        ws.on('message', msg => jobs.message(msg));
        ws.on('close', () => jobs.close());
        ws.on('error', e => jobs.error(e));
    });
};
