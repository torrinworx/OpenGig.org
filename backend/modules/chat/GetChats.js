export default () => {
	return {
		onMsg: async ({ uuid, uuids }, { DB }) => {
			const toChatInfo = (chat) => ({
				uuid: chat.query.uuid,
				creator: chat.query.creator,
				title: chat.title,
				participants: chat.query.participants,
				createdAt: chat.query.createdAt,
				modifiedAt: chat.query.modifiedAt,
			});

			if (typeof uuid === 'string' && uuid.length) {
				const chat = await DB('chats', { uuid });
				if (!chat) return { error: "Chat not found." };
				return toChatInfo(chat);
			}

			if (Array.isArray(uuids)) {
				const cleaned = uuids.filter(u => typeof u === 'string' && u.length);
				if (cleaned.length === 0) return { error: "Invalid uuids." };

				const chats = await Promise.all(
					cleaned.map(async (id) => {
						const chat = await DB('chats', { uuid: id });
						return chat ? toChatInfo(chat) : null;
					})
				);

				return chats.filter(Boolean);
			}

			return { error: "Invalid uuid." };
		}
	};
};
