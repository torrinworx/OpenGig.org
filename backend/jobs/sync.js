import { createNetwork } from "destam";

import {  stringify, parse } from "../util/clone.js";

export default ({ sync, ws }) => {
    let network;
    const fromClient = {};

    return {
        connection: () => {
            network = createNetwork(sync.observer);
            ws.send(stringify(sync));

            network.digest(async (changes, observerRefs) => {
                const encodedChanges = stringify(
                    changes, { observerRefs: observerRefs, observerNetwork: network }
                );
                ws.send(encodedChanges);
            }, 1000 / 30, (arg) => arg === fromClient);
        },
        message: (msg) => {
            const parsedCommit = parse(msg.encodedChanges);
            // TODO: validate changes follow the validator/schema
            network.apply(parsedCommit, fromClient);
        },
        close: () => {
            network.remove()
        },
        error: (e) => {
            console.log(e);
        }
    };
};
