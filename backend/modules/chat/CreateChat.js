import { OArray } from 'destam';

export default () => ({
	onMsg: async ({ participants = [], title = null }, { DB, user }) => {
		const list = Array.isArray(participants) ? [...participants] : [participants];
		if (!list.includes(user.query.uuid)) list.push(user.query.uuid);

		const chat = await DB('chats');
		chat.query.createdAt = Date.now();
		chat.title = title;
		chat.participants = OArray(list);
		chat.seq = 0;
		chat.changes = OArray();

		await DB.flush(chat);
		return chat.query.uuid;
	},
});