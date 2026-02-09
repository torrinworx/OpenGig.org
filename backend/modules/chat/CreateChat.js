import { OArray, OObject } from 'destam';

export default () => ({
	onMsg: async ({ participants, title = 'New Chat' }, { odb, user }) => {
		const now = new Date();

		const list = Array.isArray(participants) ? [...participants] : [participants];
		const userId = user.observer.id.toHex();

		if (!list.includes(userId)) list.push(userId);

		const chat = await odb.open({
			collection: 'chats',
			value: OObject({
				title,
				participants: OArray(list),
				userId,
				seq: 0,
				createdAt: now,
				modifiedAt: now,
			}),
		});

		await chat.$odb.flush();
		return chat.observer.id.toHex();
	},
});