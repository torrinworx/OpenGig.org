import { OArray } from "destam";
import { coreServer } from "web-core/server";

const connection = async (ws, req, user, sync) => {
	sync.notifications = OArray([]);

	return;
};

coreServer(
	'./backend/jobs',
	process.env.ENV === 'production' ? './dist' : './frontend',
	connection
);
