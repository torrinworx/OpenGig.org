import { OObject, OArray } from 'destam';
import { Obridge } from 'destam-web-core';

export default () => ({
	authenticated: false,
	onCon: async ({ sync, odb, user }) => {
		if (!user) return;

		const userId = user.observer.id.toHex();

		sync.currentChat = OObject({
			id: null,
			messages: OArray([]),
			title: '',
		});

		sync.observer.path(['currentChat', 'id']).watch(async () => {
			const chatId = sync.currentChat.id;

			sync.currentChat.title = '';
			sync.currentChat.messages.splice(0, sync.currentChat.messages.length);

			if (!chatId) return;

			const chat = await odb.findOne({
				collection: 'chats',
				query: { id: chatId },
			});

			if (!chat) return;

			chat.observer.watch(() => {
				console.log(chat.seq, user.email);
			})
			sync.currentChat.title = typeof chat.title === 'string' ? chat.title.trim() : '';

			const isCreator = chat.creatorId === userId;

			Obridge({
				a: chat.observer,
				b: sync.currentChat.observer,
				aToB: true,
				bToA: isCreator,
				throttle: 150,
				allowAtoB: [['title']],
				allowBtoA: [['title']],
				transform: (delta) => {
					if (!delta?.path || delta.path[0] !== 'title') return delta;

					const v = delta.value;
					return {
						...delta,
						value: typeof v === 'string' ? v.trim() : '',
					};
				},
				flushA: isCreator ? () => chat.$odb.flush() : null,
			});

			const getMsgs = async () => {
				const docs = await odb.findMany({
					collection: 'messages',
					query: { chatId },
					options: { sort: { createdAt: -1, id: -1 }, limit: 200 },
				});

				sync.currentChat.messages.splice(0, sync.currentChat.messages.length);

				for (const msg of docs) {
					const isOwner = msg.userId === userId;

					const mirror = OObject({
						id: msg.observer.id.toHex(),
						userId: msg?.userId ?? null,
						chatId: msg?.chatId ?? null,
						createdAt: msg?.createdAt ?? null,
						modifiedAt: msg?.modifiedAt ?? null,
						text: msg?.text ?? '',
					});

					Obridge({
						a: msg.observer,
						b: mirror.observer,
						aToB: true,
						bToA: false,
						allowAtoB: [['userId'], ['chatId'], ['createdAt'], ['modifiedAt']],
					});

					Obridge({
						a: msg.observer,
						b: mirror.observer,
						aToB: true,
						bToA: isOwner,
						throttle: 50,
						allowAtoB: [['text']],
						allowBtoA: [['text']],
						flushA: isOwner ? () => msg.$odb.flush() : null,
					});

					sync.currentChat.messages.push(mirror);
				}
				return
			};

			chat.observer.path('seq').watch(async () => {
				await getMsgs();
			});

			await getMsgs();
		});
	},
});