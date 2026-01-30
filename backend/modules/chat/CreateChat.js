import { OArray } from 'destam';

export default () => ({
	onMsg: async ({ participants, title = "New Chat" }, { DB, user }) => {
		const list = Array.isArray(participants) ? [...participants] : [participants];
		if (!list.includes(user.query.uuid)) list.push(user.query.uuid);

		const chat = await DB('chats');
		chat.title = title;
		chat.participants = OArray(list);
		chat.query.participants = chat.participants;
		chat.query.creator = user.query.uuid;

		chat.seq = 0;
		chat.changes = OArray();

		await DB.flush(chat);
		return chat.query.uuid;
	},
});
