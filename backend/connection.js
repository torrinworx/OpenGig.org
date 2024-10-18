import { createNetwork, clone, stringify, parse } from '../destam/destam/index.js';
import ODB from './db.js';

export default async (port) => {
	const listener = Deno.listen({ port: port });

	for await (const conn of listener) {
		(async () => {
			const httpConn = Deno.serveHttp(conn);
			for await (const requestEvent of httpConn) {
				const { socket, response } = Deno.upgradeWebSocket(requestEvent.request);

				const OServer = await ODB("test");
				const network = createNetwork(OServer.observer);
				const fromClient = {};

				socket.onopen = () => {
					socket.send(stringify(clone(OServer)));
				};

				network.digest(async (changes, observerRefs) => {
					const encodedChanges = stringify(
						clone(changes, {
							observerRefs: observerRefs,
							observerNetwork: network
						})
					);
					socket.send(encodedChanges);
				}, 1000 / 30, (arg) => arg === fromClient);

				socket.onmessage = (event) => {
					const parsedCommit = parse(event.data);
					// TODO: validate changes follow the validator/schema
					network.apply(parsedCommit, fromClient);
				};

				// Handle close connection
				socket.onclose = () => {
					network.remove();
				};

				await requestEvent.respondWith(response);
			}
		})();
	}
};

