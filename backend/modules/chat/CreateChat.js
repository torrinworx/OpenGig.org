import { OArray, OObject } from 'destam';

export default () => ({
	onMsg: async ({ participants, title = 'New Chat' }, { odb, user }) => {

		const list = Array.isArray(participants) ? [...participants] : [participants];
		const creator = user.observer.id.toHex();

		if (!list.includes(creator)) list.push(creator);

		const chat = await odb.open({
			collection: 'chats',
			value: OObject({
				title,
				participants: OArray(list),
				creator: creator,
				seq: 0
			}),
		});

		await chat.$odb.flush();
		return chat.observer.id.toHex();
	},
});
