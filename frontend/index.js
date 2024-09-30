import { h, mount, Observer } from 'destam-dom';

const ws = new WebSocket(`ws://${window.location.hostname}:${window.location.port}`);

let remove;
window.addEventListener('load', () => {
    const OClient = Observer.mutable();

    ws.addEventListener('open', () => {
        OClient.watch(d => {
            console.log(d.value)
            ws.send(JSON.stringify(d));
        });
        OClient.set({"test": "HELLO FROM THE CLIENT"})
    });

    ws.addEventListener('message', (event) => {
        OClient.set(JSON.parse(event.data).value);
    });

    ws.addEventListener('close', () => {
        console.log('WebSocket connection closed.');
    });

    ws.addEventListener('error', (error) => {
        console.error('WebSocket error:', error.message);
    });

    remove = mount(document.body, 
        <div>
            Hello World
        </div>
    );
});

window.addEventListener('unload', () => {
  if (remove) remove();
  // Close the WebSocket connection when the page unloads
  if (ws) ws.close();
});
