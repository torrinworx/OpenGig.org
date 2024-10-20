import { mount } from 'destam-dom';
import { createNetwork } from 'destam';
import { Router } from 'destamatic-ui';

import Home from './pages/Home';
import Landing from './pages/Landing';
import NotFound from './pages/NotFound';
import { stringify, parse } from '../backend/clone';

const routes = {
    '/': Landing,
    '/home': Home,
};

const ws = new WebSocket(`ws://${window.location.hostname}:${window.location.port}`);
let remove;
let network;
const fromServer = {};
let OClient;

window.addEventListener('load', () => {
    ws.addEventListener('message', (e) => {
        const incomingData = parse(e.data);

        if (!OClient) {
            if (!Array.isArray(incomingData)) {
                OClient = incomingData; // Clone of OServer
                init();
            } else {
                console.error("First message should establish OClient, received an array instead.");
            }
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
});

const init = () => {
    network = createNetwork(OClient.observer);
    const currentRoute = OClient.observer.path('currentRoute').def('/');

    network.digest(async (changes, observerRefs) => {
        const encodedChanges = stringify(
            changes,
            { observerRefs: observerRefs, observerNetwork: network }
        );
        ws.send(encodedChanges);
    }, 1000 / 30, arg => arg === fromServer);

    remove = mount(document.body, <div>
        <Router currentRoute={currentRoute} routes={routes} NotFound={NotFound} OClient={OClient} />
    </div>);

    window.addEventListener('unload', () => {
        if (remove) remove();
        if (ws) ws.close();
        network.remove();
    });
};
