import { OArray } from 'destam';

export default () => ({
	onMsg: async ({ participants, title = null }, { DB, user }) => {
		console.log(participants);
		const list = Array.isArray(participants) ? [...participants] : [participants];
		if (!list.includes(user.query.uuid)) list.push(user.query.uuid);

		console.log("THIS IS LIST: ", list);
		const chat = await DB('chats');
		chat.title = title;
		chat.participants = OArray(list);
		chat.query.participants = chat.participants;

		chat.seq = 0;
		chat.changes = OArray();

		await DB.flush(chat);
		return chat.query.uuid;
	},
});