const pushChange = (chat, change, cap = 200) => {
	chat.seq = (chat.seq ?? 0) + 1;
	const evt = { ...change, seq: chat.seq, at: Date.now() };
	chat.changes.push(evt);
	while (chat.changes.length > cap) chat.changes.shift();
	return evt;
};

export default () => ({
	onMsg: async ({ chatUuid, text = '' }, { DB, user }) => {
		const chat = await DB('chats', { uuid: chatUuid });
		if (!chat) return { error: 'chat_not_found' };

		const msg = await DB('messages');
		msg.query.chatUuid = chatUuid;
		msg.query.user = user.query.uuid
		msg.user = user.query.uuid
		msg.text = String(text);
		await DB.flush(msg);

		pushChange(chat, { type: 'create', msgUuid: msg.query.uuid });
		await DB.flush(chat);

		return { ok: true, msgUuid: msg.query.uuid };
	}
});
