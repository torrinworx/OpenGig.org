import { syncState } from 'destam-web-core/client';

const ensureClientState = async (appObs) => {
	let state = appObs.get();
	if (!state) {
		state = await syncState();
		appObs.set(state);
	}
	return state;
};

export default ensureClientState;
