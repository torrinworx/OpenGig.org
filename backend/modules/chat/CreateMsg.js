import { OObject } from 'destam';

export default () => ({
	onMsg: async ({ chatId, text = '' }, { odb, user }) => {
		const now = new Date();

		const chat = await odb.findOne({
			collection: 'chats',
			query: { id: chatId },
		});

		const msg = await odb.open({
			collection: 'messages',
			value: OObject({
				chatId,
				creator: user.observer.id.toHex(),
				text: String(text),
				createdAt: now,
				modifiedAt: now,
			}),
		});

		await msg.$odb.flush();

		chat.seq = (chat.seq ?? 0) + 1;
		chat.modifiedAt = now;

		await chat.$odb.flush();
	},
});
