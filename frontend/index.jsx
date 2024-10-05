import { h, mount } from 'destam-dom';
import { Button } from 'destamatic-ui';
import { OObject, clone, stringify, parse, createNetwork } from 'destam';

const ws = new WebSocket(`ws://${window.location.hostname}:${window.location.port}`);
let remove;

window.addEventListener('load', () => {
    let OClient;

    
    ws.addEventListener('message', (e) => {
        const incomingData = parse(e.data);
        console.log('Received from server:', incomingData);

        if (!OClient) {
            if (!Array.isArray(incomingData)) {
                OClient = incomingData; // Clone of OServer
                console.log(OClient);
            } else {
                console.error("First message should establish OClient, received an array instead.");
            }
            init();
        } else {
            network.apply(incomingData, fromServer);
        }
    });

    ws.addEventListener('close', () => {
        if (network) network.remove();
        console.log('WebSocket connection closed.');
    });

    ws.addEventListener('error', (error) => {
        console.error('WebSocket error:', error.message);
    });

    const init = () => {
        const network = createNetwork(OClient.observer);
        const fromServer = {};

        network.digest((changes, observerRefs) => {
            const encodedChanges = stringify(clone(
                changes,
                { observerRefs: observerRefs, observerNetwork: network }
            ));
            console.log('Sending to server:', encodedChanges);
            ws.send(encodedChanges);
        }, 1000 / 30, arg => arg === fromServer);

        const counter = OClient.observer.path('counter').def(0);
        remove = mount(document.body,
            <div>
                Hello World
                <br />
                {counter}
                <Button
                    label='Click'
                    onMouseDown={() => {
                        counter.set(counter.get() + 1);
                    }}
                />
            </div>
        );

        window.addEventListener('unload', () => {
            if (remove) remove();
            if (ws) ws.close();
            network.remove();
        });
    }
});
