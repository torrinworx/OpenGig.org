import { mount } from 'destam-dom';
import { createNetwork, OObject } from 'destam';
import { Router, Theme, Button, Typography } from 'destamatic-ui';

import Home from './pages/Home';
import Landing from './pages/Landing';
import NotFound from './pages/NotFound';
import { stringify, parse } from '../backend/util/clone';
import Notifications from './components/Notifications';

import { initWS, jobRequest } from './ws';

const ws = initWS();
let remove;
let network;
const fromServer = {};
let sync;
const client = OObject({
    theme: OObject({
        '*': {
            fontFamily: 'IBM Plex Sans',
            fontWeight: 600,
        },
        primary: {
            $color: '#3AFF8C', // Vomit green
            $color_hover: 'rgba(58, 255, 140, 0.2)',
            $color_error: 'red',
            $color_top: 'white',
            transition: 'opacity 250ms ease-out, box-shadow 250ms ease-out, background-color 250ms ease-in-out'
        },
        secondary: {
            $color: '#5EBCFF',  // Vomit blue
            $color_hover: 'rgba(94, 188, 255, .2)'
        },
        radius: {
            borderRadius: 8,
        },
        ripple: {
            background: 'rgba(256, 256, 256, .8)'
        },
        button: {
            extends: ['primary', 'center', 'radius'],
    
            height: '45px',
            padding: '5px 12px',
            userSelect: 'none',
            border: 'none',
            cursor: 'pointer',
            textDecoration: 'none',
            position: 'relative',
            overflow: 'clip',
            color: 'black',
            boxShadow: 'none',
        },
        button_text: {
            width: "auto",
        },
        button_contained: {
            color: '$color_top',
            background: '$color',
        },
        button_contained_hovered: {
            extends: 'secondary',
            background: '$color',
        },
        button_outlined: {
            extends: 'secondary',
            color: '$color',
            borderWidth: 2,
            borderStyle: 'solid',
            borderColor: '$color',
            backgroundColor: '$color_top'
        },
        button_outlined_hovered: {
            extends: 'secondary',
            color: '$color',
            backgroundColor: '$color_hover',
        },
        hover: {
            backgroundColor: 'rgba(2, 202, 159, 0.1)',
            color: '#02CA9F',
        },
        typography_h1: { fontSize: 62 },
        typography_h2: { fontSize: 56 },
        typography_h3: { fontSize: 36 },
        typography_h4: { fontSize: 30 },
        typography_h5: { fontSize: 24 },
        typography_h6: { fontSize: 20 },
        typography_p1: { fontSize: 16 },
        typography_p2: { fontSize: 14 },
        typography_regular: { fontStyle: 'normal' },
        typography_bold: { fontWeight: 'bold' },
        typography_italic: { fontStyle: 'italic' },

        // Custom:
        header: {
            borderRadius: '20px',
            position: 'sticky',
            top: 0,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '0px 10px',
            gap: '10px'
        }
    })
});


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
                    client: client // Global state only present on client
                });

                window.state = state;

                remove = mount(document.body, <Theme value={state.client.theme}>
                    <div>

                        <Button
                            label={<Typography type='h5' >Error</Typography>}
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
                            routes={{ '/': Landing, '/home': Home }}
                            NotFound={NotFound}
                            state={state}
                        />
                        <div style={{
                            margin: '10px',
                            width: '100%',
                            height: '100vh',
                            background: 'linear-gradient(to bottom right, #3AFF8C, #5EBCFF)',
                            position: 'relative',
                            overflow: 'hidden'
                        }} />
                    </div>
                </Theme>);

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
