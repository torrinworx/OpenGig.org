import { Observer } from "destam";

const ws_server = (ws) => {
    const OServer = Observer.mutable();

    OServer.watch(d => {
        console.log("VALUE BEING WATCHED: ", d.value)
        ws.send(JSON.stringify(d))
    })

    ws.on('message', (msg) => {
        const message = msg.toString('utf-8');
    
        try {
            const data = JSON.parse(message);
            console.log("value from the on message: ", data.value)
            OServer.set(data.value)
            console.log(OServer.get())
        } catch (error) {
            console.error('Failed to parse message as JSON:', error);
        }
    });

    ws.on('close', () => {
        console.log('Client disconnected');
    });

    OServer.set({"test": "Hello World!"})
}

export { ws_server }
