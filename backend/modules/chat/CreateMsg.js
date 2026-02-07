import { OObject } from 'destam';

const pushChange = (chat, change, cap = 200) => {
	chat.seq = (chat.seq ?? 0) + 1;
	const evt = { ...change, seq: chat.seq, at: Date.now() };
	chat.changes.push(evt);
	while (chat.changes.length > cap) chat.changes.shift();
	return evt;
};

export default () => ({
	onMsg: async ({ chatId, text = '' }, { odb, user }) => {
		const userId = user.observer.id.toHex();

		const chat = await odb.findOne({
			collection: 'chats',
			query: { id: chatId },
		});
		if (!chat) return { error: 'chat_not_found' };

		// create message doc
		const msg = await odb.open({
			collection: 'messages',
			value: OObject({
				chatId,
				userId,
				text: String(text),

				createdAt: Date.now(),
				modifiedAt: Date.now(),
			}),
		});

		await msg.$odb.flush();

		// bump chat seq + changes so clients can refresh pagination when follow=true
		pushChange(chat, { type: 'create', msgId: msg.observer.id.toHex() });
		await chat.$odb.flush();

		return { ok: true, msgId: msg.observer.id.toHex() };
	},
});
