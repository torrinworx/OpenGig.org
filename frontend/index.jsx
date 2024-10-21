import { mount } from 'destam-dom';
import { createNetwork, OObject } from 'destam';
import { Router } from 'destamatic-ui';

import Home from './pages/Home';
import Landing from './pages/Landing';
import NotFound from './pages/NotFound';
import { stringify, parse } from '../backend/util/clone';

const routes = {
    '/': Landing,
    '/home': Home,
};

const ws = new WebSocket(`ws://${window.location.hostname}:${window.location.port}`);
let remove;
let network;
const fromServer = {};
let stateSync;
const stateClient = OObject({});

window.addEventListener('load', () => {
    ws.addEventListener('message', (e) => {
        const incomingData = parse(e.data);

        if (!stateSync) {
            if (!Array.isArray(incomingData)) {
                stateSync = incomingData; // Clone of OServer
                init();
            } else {
                console.error("First message should establish stateSync, received an array instead.");
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
    network = createNetwork(stateSync.observer);
    const currentRoute = stateSync.observer.path('currentRoute').def('/');

    network.digest(async (changes, observerRefs) => {
        const encodedChanges = stringify(
            changes,
            { observerRefs: observerRefs, observerNetwork: network }
        );
        ws.send(encodedChanges);
    }, 1000 / 30, arg => arg === fromServer);

    // We split state here so that we don't send needless updates back and
    // forth to the server and client.
    const state = OObject({
        stateSync: stateSync, // State synced with the server
        stateClient: stateClient // Global state only present on client
    })
    remove = mount(document.body, <div>
        <Router currentRoute={currentRoute} routes={routes} NotFound={NotFound} state={state} />
    </div>);

    window.addEventListener('unload', () => {
        if (remove) remove();
        if (ws) ws.close();
        network.remove();
    });
};
