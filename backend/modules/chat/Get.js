import { OObject, OArray, Observer } from 'destam';

export default () => {
	return {
		authenticated: false,
		onCon: async ({ sync, DB, user }) => {
			const watchers = [];

			console.log('user uuid: ', user.query.uuid);

			sync.currentChat = OObject({
				uuid: null,
				messages: OArray([]),
			});

			// Push msgs to sync.currentChat.messages.
			// If msg is not owned by current user, store as immutable observer.
			const pushMsgs = (msgs) => {
				if (!msgs) return;

				for (const msg of Array.isArray(msgs) ? msgs : [msgs]) {
					if (!msg) continue;

					// If not owned by user, wrap in immutable observer (pattern from your comment)
					if (msg.query?.user !== user.query.uuid) {
						sync.currentChat.messages.push(Observer.immutable(msg.observer));
					} else {
						// Owned by user, keep mutable store
						sync.currentChat.messages.push(msg);
						msg.observer.path('text').watch(async () => {
							console.log('msg flush', msg.text);
							await DB.flush(msg)
						})
					}
				}
			};

			watchers.push(
				sync.observer.path(['currentChat', 'uuid']).watch(async () => {
					sync.currentChat.messages.splice(0, sync.currentChat.messages.length);

					const chat = await DB('chats', { uuid: sync.currentChat.uuid });

					const results = await DB.queryAll('messages', { chatUuid: sync.currentChat.uuid });
					const stores = await Promise.all(results.map((q) => DB.instance(q)));

					pushMsgs(stores);

					watchers.push(
						chat.observer.watch(async (d) => {
							if (d.value.type === 'create') {
								const msg = await DB('messages', { uuid: d.value.msgUuid });
								pushMsgs(msg);
							}
						})
					);
				})
			);

			return watchers;
		},
	};
};
