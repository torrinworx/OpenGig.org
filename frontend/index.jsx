import { mount } from 'destam-dom';
import { createNetwork, OObject } from 'destam';
import { Router, Button } from 'destamatic-ui';

import Home from './pages/Home';
import Landing from './pages/Landing';
import NotFound from './pages/NotFound';
import { stringify, parse } from '../backend/util/clone';
import Notifications from './components/Notifications';

const ws = new WebSocket(`ws://${window.location.hostname}:${window.location.port}`);
let remove;
let network;
const fromServer = {};
let sync;
const client = OObject({});

const jobRequest = (name, params) => {
    if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
            name: name,
            ...params
        }));
    } else {
        console.error('WebSocket is not open. Ready state is:', ws.readyState);
    }
};

window.addEventListener('load', () => {
    ws.addEventListener('message', (e) => {
        const incomingData = parse(e.data);

        if (!sync) {
            if (!Array.isArray(incomingData)) {
                sync = incomingData; // Clone of OServer
                init();
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

const init = () => {
    network = createNetwork(sync.observer);
    const currentRoute = sync.observer.path('currentRoute').def('/');

    network.digest(async (changes, observerRefs) => {
        const encodedChanges = stringify(
            changes,
            { observerRefs: observerRefs, observerNetwork: network }
        );
        jobRequest('syncState', {encodedChanges: encodedChanges})
    }, 1000 / 30, arg => arg === fromServer);

    // We split state here so that we don't send needless updates back and
    // forth to the server and client.
    const state = OObject({
        sync: sync, // State synced with the server
        client: client // Global state only present on client
    });

    window.state = state;

    remove = mount(document.body, <div>
        <Button
            label='error'
            type='contained'
            onMouseDown={() => {
                sync.notifications.push({
                    content: 'this is from the landing page',
                    type: 'error'
                });
            }}
        />
        <Button
            label='warning'
            type='contained'
            onMouseDown={() => {
                sync.notifications.push({
                    content: 'this is from the landing page',
                    type: 'warning'
                });
            }}
        />
        <Button
            label='ok'
            type='contained'
            onMouseDown={() => {
                sync.notifications.push({
                    content: 'this is from the landing page',
                    type: 'ok'
                });
            }}
        />
        <Notifications state={state} />
        <Router
            currentRoute={currentRoute}
            routes={{'/': Landing, '/home': Home }}
            NotFound={NotFound}
            state={state}
        />
    </div>);

    window.addEventListener('unload', () => {
        if (remove) remove();
        if (ws) ws.close();
        network.remove();
    });
};
