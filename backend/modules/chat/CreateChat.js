import { OArray, OObject } from 'destam';

export default () => ({
	onMsg: async ({ participants, title = 'New Chat' }, { odb, user }) => {
		if (!odb) throw new Error('createChat.onMsg requires ctx.odb');

		const list = Array.isArray(participants) ? [...participants] : [participants];
		const myId = user.observer.id.toHex();
		if (!myId) throw new Error('createChat.onMsg requires user.id');

		if (!list.includes(myId)) list.push(myId);

		const chat = await odb.open({
			collection: 'chats',
			value: OObject({
				title,
				participants: OArray(list),
				creatorId: myId,

				seq: 0,
				changes: OArray(),
				createdAt: Date.now(),
				modifiedAt: Date.now(),
			}),
		});

		await chat.$odb.flush();
		return chat.observer.id.toHex();
	},
});
