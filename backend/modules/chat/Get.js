import { OObject, OArray } from 'destam';

const exposeMsg = (msg) => OObject({
	uuid: msg.query.uuid,
	user: msg.query.user,
	chatUuid: msg.query.chatUuid,
	createdAt: msg.query.createdAt,
	modifiedAt: msg.query.modifiedAt,
	text: msg.text,
});

export default () => ({
	authenticated: false,
	onCon: async ({ sync, DB, user }) => {
		const removers = [];
		const msgRemovers = new Map(); // uuid -> remove()

		sync.currentChat = OObject({ uuid: null, messages: OArray([]) });

		const clearMsgs = () => {
			for (const r of msgRemovers.values()) r();
			msgRemovers.clear();
			sync.currentChat.messages.splice(0, sync.currentChat.messages.length);
		};

		const addMsg = (msg) => {
			if (!msg) return;

			if (msg.query.user === user.query.uuid) {
				// owner gets live store (writable)
				sync.currentChat.messages.push(msg);
				return;
			}

			// non-owner gets a mirror (read-only-ish)
			const mirror = exposeMsg(msg);
			sync.currentChat.messages.push(mirror);

			// keep mirror updated when msg changes
			const remove = msg.observer.watch(() => {
				mirror.text = msg.text;
				mirror.modifiedAt = msg.query.modifiedAt;
			});

			msgRemovers.set(msg.query.uuid, remove);
		};

		removers.push(
			sync.observer.path(['currentChat', 'uuid']).watch(async () => {
				clearMsgs();
				const chatUuid = sync.currentChat.uuid;
				if (!chatUuid) return;

				const chat = await DB('chats', { uuid: chatUuid });

				if (!chat) return; // TODO: error or something

				const results = await DB.queryAll('messages', { chatUuid });
				const stores = await Promise.all(results.map(q => DB.instance(q)));
				stores.forEach(addMsg);

				const removeChatWatch = chat.observer.watch(async (d) => {
					if (d.value.type === 'create') {
						const msg = await DB('messages', { uuid: d.value.msgUuid });
						addMsg(msg);
					}
				});
				removers.push(removeChatWatch);
			})
		);

		removers.push(clearMsgs);
		return removers;
	},
});
