import { WebSocketServer } from 'ws';
import { createNetwork } from 'destam';

import { stringify, parse } from './clone.js';

export default (server, syncState) => {
    const wss = new WebSocketServer({ server });

    wss.on('connection', async (ws) => {
        const network = createNetwork(syncState.observer);
        const fromClient = {};

        // Push init state to client
        ws.send(stringify(syncState));
    
        network.digest(async (changes, observerRefs) => {
            console.log(changes)
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
