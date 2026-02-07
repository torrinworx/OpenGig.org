export default () => ({
	onMsg: async (_props, { odb, user }) => {

		const docs = await odb.findMany({
			collection: 'chats',
			query: { participants: user.observer.id.toHex() },
			options: { limit: 500 },
		});

		const chats = docs.map(chat => ({
			id: chat.id ?? chat.$odb.key,
			participants: chat.participants,
			createdAt: chat.createdAt,
			modifiedAt: chat.modifiedAt,
			title: chat.title,
		}));

		chats.sort((a, b) => (b.modifiedAt ?? 0) - (a.modifiedAt ?? 0));

		await Promise.all(docs.map(d => d.$odb.dispose()));

		return chats;
	},
});