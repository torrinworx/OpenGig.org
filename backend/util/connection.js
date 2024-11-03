import { WebSocketServer } from 'ws';

export default (server, sync, client, jobs) => {
    const wss = new WebSocketServer({ server });

    wss.on('connection', async (ws) => {
        await jobs.setupHandlers({sync, client, ws});

        jobs.connection();

        ws.on('message', msg => jobs.message(msg));
        ws.on('close', () => jobs.close());
        ws.on('error', e => jobs.error(e));
    });
};
