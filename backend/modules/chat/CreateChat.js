import { OArray, OObject } from 'destam';

export default () => ({
	onMsg: async ({ participants, title = 'New Chat' }, { odb, user }) => {
		const now = new Date();

		const list = Array.isArray(participants) ? [...participants] : [participants];
		const creator = user.observer.id.toHex();

		if (!list.includes(creator)) list.push(creator);

		const chat = await odb.open({
			collection: 'chats',
			value: OObject({
				title,
				participants: OArray(list),
				creator,
				seq: 0,
				createdAt: now,
				modifiedAt: now,
			}),
		});

		await chat.$odb.flush();
		return chat.observer.id.toHex();
	},
});