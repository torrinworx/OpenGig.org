import { createNetwork } from "destam";
import { stringify, parse } from "../util/clone.js";

export default () => {
    return {
        connection: (ws, sync) => {
            let network = createNetwork(sync.observer);
            const fromClient = {};

            ws.send(JSON.stringify({ name: 'sync', result: stringify(sync) }));

            network.digest(async (changes, observerRefs) => {
                const encodedChanges = stringify(
                    changes, { observerRefs: observerRefs, observerNetwork: network }
                );
                ws.send(JSON.stringify({ name: 'sync', result: encodedChanges }));
            }, 1000 / 30, (arg) => arg === fromClient);

            ws.on("message", (msg) => {
                msg = parse(msg);
                console.log(msg);
                if (msg.name === 'sync' && !msg.init) {
                    console.log(msg.encodedChanges)
                    // TODO: validate changes follow the validator/schema
                    network.apply(parsedCommit, fromClient);
                }
            });

            ws.on("close", () => {
                network.remove();
            });

            ws.on("error", (e) => {
                console.log(e);
            });
        },
        message: (msg) => {}
    };
};
