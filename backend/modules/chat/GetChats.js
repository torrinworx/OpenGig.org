export default () => {
	return {
		onMsg: async ({ id, ids }, { odb }) => {
			if (!odb) throw new Error('chat/GetChats requires ctx.odb');

			const toChatInfo = (chat) => ({
				id: chat.id ?? chat.$odb.key,
				creatorId: chat.creatorId,
				title: chat.title,
				participants: chat.participants,
				createdAt: chat.createdAt,
				modifiedAt: chat.modifiedAt,
			});

			if (typeof id === 'string' && id.length) {
				const chat = await odb.findOne({ collection: 'chats', query: { id } });
				if (!chat) return { error: 'Chat not found.' };
				return toChatInfo(chat);
			}

			if (Array.isArray(ids)) {
				const cleaned = ids.filter(v => typeof v === 'string' && v.length);
				if (cleaned.length === 0) return { error: 'Invalid ids.' };

				const chats = await Promise.all(
					cleaned.map(async (cid) => {
						const chat = await odb.findOne({ collection: 'chats', query: { id: cid } });
						return chat ? toChatInfo(chat) : null;
					})
				);

				return chats.filter(Boolean);
			}

			return { error: 'Invalid id.' };
		},
	};
};
