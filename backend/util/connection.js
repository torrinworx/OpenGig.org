import { WebSocketServer } from 'ws';
import { createNetwork } from 'destam';

import ODB from './db.js';
import { stringify, parse } from './clone.js';

export default (server) => {
    const wss = new WebSocketServer({ server });

    wss.on('connection', async (ws) => {
        const OServer = await ODB('test');
        const network = createNetwork(OServer.observer);
        const fromClient = {};

        // Push init state to client
        ws.send(stringify(OServer));
    
        network.digest(async (changes, observerRefs) => {
            const encodedChanges = stringify(
                changes, { observerRefs: observerRefs, observerNetwork: network }
            );
            ws.send(encodedChanges);
        }, 1000 / 30, (arg) => arg === fromClient);
    
        ws.on('message', (e) => {
            const parsedCommit = parse(e);
            // TODO: validate changes follow the validator/schema
            network.apply(parsedCommit, fromClient);
        });
    
        ws.on('close', () => {
            network.remove();
        });
    });
}
