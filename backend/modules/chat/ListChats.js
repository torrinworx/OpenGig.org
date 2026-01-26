export default () => ({
	onMsg: async (_props, { DB, user }) => {
		const results = await DB.queryAll('chats', { participants: user.query.uuid });

		// results are "query objects" (fast). return just what the client needs.
		// If your title/participants are not in query, move them into chat.query.
		const chats = results.map(q => ({
			uuid: q.uuid,
			participants: q.participants,
			createdAt: q.createdAt,
			modifiedAt: q.modifiedAt,
		}));

		chats.sort((a, b) => (b.modifiedAt ?? 0) - (a.modifiedAt ?? 0));

		return chats;
	},
});
