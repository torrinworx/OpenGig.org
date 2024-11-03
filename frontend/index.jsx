import { mount } from 'destam-dom';
import { createNetwork, OObject } from 'destam';
import { Router, Theme, Button, Typography } from 'destamatic-ui';

import Home from './pages/Home';
import Landing from './pages/Landing';
import NotFound from './pages/NotFound';
import { stringify, parse } from '../backend/util/clone';
import Notifications from './components/Notifications';

import theme from './theme';
import { initWS, jobRequest } from './ws';

const ws = initWS();
let remove;
let network;
const fromServer = {};
let sync;

window.addEventListener('load', () => {
    ws.addEventListener('message', (e) => {
        const incomingData = parse(e.data);

        if (!sync) {
            if (!Array.isArray(incomingData)) {
                sync = incomingData; // Clone of OServer
                network = createNetwork(sync.observer);
                const currentRoute = sync.observer.path('currentRoute').def('/');

                network.digest(async (changes, observerRefs) => {
                    const encodedChanges = stringify(
                        changes,
                        { observerRefs: observerRefs, observerNetwork: network }
                    );
                    jobRequest('syncState', { encodedChanges: encodedChanges })
                }, 1000 / 30, arg => arg === fromServer);

                // We split state here so that we don't send needless updates back and
                // forth to the server and client.
                const state = OObject({
                    sync: sync, // State synced with the server
                    client: OObject({ theme: theme }) // Global state only present on client
                });

                window.state = state;
                remove = mount(document.body, <Theme value={state.client.theme}>
                   <Notifications state={state} />
                    <Router
                        currentRoute={currentRoute}
                        routes={{ '/': Landing, '/home': Home }}
                        NotFound={NotFound}
                        state={state}
                    />
                </Theme >
                );

                window.addEventListener('unload', () => {
                    if (remove) remove();
                    if (ws) ws.close();
                    network.remove();
                });
            } else {
                console.error("First message should establish sync, received an array instead.");
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
