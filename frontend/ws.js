let ws;

export const initWS = () => ws = new WebSocket(`ws://${window.location.hostname}:${window.location.port}`);

export const jobRequest = (name, params) => {
    if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
            name: name,
            ...params
        }));
    } else {
        console.error('WebSocket is not open. Ready state is:', ws.readyState);
    }
};