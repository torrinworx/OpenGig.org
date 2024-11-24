import { OArray } from "destam";
import { coreServer } from "web-core/server";

const connection = async (ws, req, user, sync) => {
	sync.notifications = OArray([]);

	return;
};

console.log("DB URL: ", process.env.DB)

coreServer(
	'./backend/jobs',
	process.env.ENV === 'production' ? './dist' : './frontend',
	connection
);
