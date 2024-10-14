import { WebSocketServer } from 'ws';
import { OObject, createNetwork, clone, stringify, parse } from 'destam';

export default (server) => {
    const wss = new WebSocketServer({ server });

    wss.on('connection', (ws) => {
        const OServer = OObject(); // TODO: Load state from mongodb instead of declaring empty oobject
        const network = createNetwork(OServer.observer);
        const fromClient = {};
    
        ws.send(stringify(clone(OServer)));
    
        // Watcher to validate and store data in db
        OServer.observer.watchCommit((delta) => {
            console.log(delta);
        });

        network.digest(async (changes, observerRefs) => {
            const encodedChanges = stringify(
                clone(changes, { observerRefs: observerRefs, observerNetwork: network })
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
            console.log('Client disconnected');
        });
    });
}
