import { coreServer } from "web-core/server";

const connection = async (ws, req) => {
	return;
};

coreServer(
	'./backend/jobs',
	process.env.ENV === 'production' ? './dist' : './frontend',
	connection
);
