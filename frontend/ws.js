let ws;

export const initWS = () => ws = new WebSocket(`ws://${window.location.hostname}:${window.location.port}`);

export const jobRequest = (name, params) => {
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
				id: msgID,
				...params
			}));
		} else {
			ws.removeEventListener('message', handleMessage);
			reject(new Error('WebSocket is not open. Ready state is: ' + ws.readyState));
		}
	});
};
