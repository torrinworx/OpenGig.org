import { mount } from 'destam-dom';
import { Router, Shown, Theme } from 'destamatic-ui';
import { createNetwork, Observer, OObject } from 'destam';

import Home from './pages/Home';
import Landing from './pages/Landing';
import NotFound from './pages/NotFound';
import { stringify, parse } from '../backend/util/clone';
import Notifications from './components/Notifications';

import theme from './theme';
import { getCookie } from './util';
import { initWS, jobRequest } from './ws';

const ws = initWS();
let remove;
let network;
const fromServer = {};
// State is split in two: state.sync and state.client, this prevents
// client only updates from needlessly updating the database.
const state = OObject({
    client: OObject({
        openPage: { page: Landing }
    })
});
window.state = state;

// TODO: if not on / root then display NotFound.

remove = mount(document.body, <Theme value={theme}>
    {/* <Notifications state={state} /> */}
    <Shown value={state.client.observer.path('openPage')}>
        {state.client.observer.path('openPage').map(p => {
            const Page = p.page;
            if (Page) return <Page {...{ state, ...p.props }} />;
        })}
    </Shown>
</Theme >);

window.addEventListener('load', async () => {
    const initialToken = getCookie('opengigSessionToken');
    console.log(initialToken);
    if (initialToken) {
        await jobRequest('sync', { init: true })
    }

    ws.addEventListener('message', (e) => {
        const data = parse(e.data);
        console.log(data);
        // TODO: make it more concrete from the server that we are receiving an initail message
        // vs an unrelated job message, vs a sync message.
        if (data.name === 'sync') {
            const decodedChanges = parse(data.result);
            if (!state.sync) {
                if (!Array.isArray(decodedChanges)) {
                    state.sync = decodedChanges; // Clone of OServer
                    network = createNetwork(state.sync.observer);
    
                    network.digest(async (changes, observerRefs) => {
                        const encodedChanges = stringify(
                            changes,
                            { observerRefs: observerRefs, observerNetwork: network }
                        );
                        jobRequest('sync', { encodedChanges: encodedChanges })
                    }, 1000 / 30, arg => arg === fromServer);
    
                    window.addEventListener('unload', () => {
                        if (remove) remove();
                        if (ws) ws.close();
                        if (network) network.remove();
                    });
                } else {
                    console.error("First message should establish sync, received an array instead.");
                }
            } else {
                if (Array.isArray(decodedChanges)) {
                    network.apply(decodedChanges, fromServer);
                }
            }
        }
    });

    ws.addEventListener('close', () => {
        if (network) network.remove();
        console.log('WebSocket connection closed.');
        // sync?.notifications.push({
        //     type: 'error',
        //     content: 'Connection to server lost.'
        // })
    });

    ws.addEventListener('error', (error) => {
        console.error('WebSocket error:', error.message);
    });
});


