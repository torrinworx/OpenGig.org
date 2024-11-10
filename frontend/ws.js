import { getCookie } from "./util";
let ws;

export const initWS = () => {
	const tokenValue = getCookie('opengigSessionToken') || '';
	const wsURL = tokenValue
		? `ws://${window.location.hostname}:${window.location.port}/?sessionToken=${encodeURIComponent(tokenValue)}`
		: `ws://${window.location.hostname}:${window.location.port}`;

	ws = new WebSocket(wsURL);
	return ws;
};

export const jobRequest = (name, params) => {
	const sessionToken = getCookie('opengigSessionToken');

	return new Promise((resolve, reject) => {
		const msgID = crypto.randomUUID();

		const handleMessage = (event) => {
			try {
				const response = JSON.parse(event.data);
				if (response.id === msgID) {
					ws.removeEventListener('message', handleMessage);
					resolve(response);
				}
			} catch (error) {
				console.error("Failed to parse incoming message:", error);
			}
		};

		ws.addEventListener('message', handleMessage);

		if (ws.readyState === WebSocket.OPEN) {
			ws.send(JSON.stringify({
				name: name,
				sessionToken: sessionToken,
				id: msgID,
				...params
			}));
		} else {
			ws.removeEventListener('message', handleMessage);
			reject(new Error('WebSocket is not open. Ready state is: ' + ws.readyState));
		}
	});
};
