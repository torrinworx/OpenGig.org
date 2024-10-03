import { h, mount, Observer, OObject } from 'destam-dom';
import { Button } from 'destamatic-ui';

const ws = new WebSocket(`ws://${window.location.hostname}:${window.location.port}`);

let remove;
window.addEventListener('load', () => {
    const OClient = Observer.mutable();
    const prevMsg = Observer.mutable(false);

    OClient.watch(d => {
        console.log(d.value)
        if (!prevMsg.get()) {
            ws.send(JSON.stringify(d));
        }
        prevMsg.set(false)
    });

    ws.addEventListener('message', (event) => {
        const data = JSON.parse(event.data);
        console.log(data)
        if (data) {
            prevMsg.set(true);
            OClient.set(data.value);
            prevMsg.set(false);
        }
    });

    ws.addEventListener('close', () => {
        console.log('WebSocket connection closed.');
    });

    ws.addEventListener('error', (error) => {
        console.error('WebSocket error:', error.message);
    });

    const counter = Observer.mutable(0);
    remove = mount(document.body,
        <div>
            Hello World
            <br />
            {OClient.get() ? OClient.get() : "null"}
            <Button
                label='Click'
                onMouseDown={() => {
                    counter.set(counter.get() + 1);
                    OClient.set(OObject({"test": `click # ${counter.get()}`}));
                }}
            />
        </div>
    );
});

window.addEventListener('unload', () => {
    if (remove) remove();
    if (ws) ws.close();
});
