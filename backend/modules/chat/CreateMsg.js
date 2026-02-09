import { OObject } from 'destam';

const pushChange = (chat, change) => {
	chat.seq = (chat.seq ?? 0) + 1;
	const evt = { ...change, seq: chat.seq, at: Date.now() };
	chat.change = evt;
};

export default () => ({
	onMsg: async ({ chatId, text = '' }, { odb, user }) => {
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
			}),
		});

		await msg.$odb.flush();

		pushChange(chat, { type: 'create', msgId: msg.observer.id.toHex() });
		await chat.$odb.flush();
	},
});
