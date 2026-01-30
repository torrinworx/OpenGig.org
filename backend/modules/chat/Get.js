import { OObject, OArray } from 'destam';
import { Obridge } from 'destam-web-core';

const normalizeTitle = (v) => (typeof v === 'string' ? v.trim() : '');

// Always create a mirror with the same shape for all messages.
// query fields: msg -> mirror (read-only)
// text: msg <-> mirror if owner, else msg -> mirror
const exposeMsg = (msg, { isOwner, DB }) => {
	const mirror = OObject({
		query: OObject({
			uuid: null,
			user: null,
			chatUuid: null,
			createdAt: null,
			modifiedAt: null,
		}),
		text: '',
	});

	// set initial values immediately (don’t rely on bridge initial push)
	mirror.query.uuid = msg?.query?.uuid ?? null;
	mirror.query.user = msg?.query?.user ?? null;
	mirror.query.chatUuid = msg?.query?.chatUuid ?? null;
	mirror.query.createdAt = msg?.query?.createdAt ?? null;
	mirror.query.modifiedAt = msg?.query?.modifiedAt ?? null;
	mirror.text = msg?.text ?? '';

	const removers = [];

	// route query fields (read-only)
	removers.push(
		Obridge({ a: msg.observer.path(['query', 'uuid']), b: mirror.query.observer.path('uuid'), aToB: true, bToA: false })
	);
	removers.push(
		Obridge({ a: msg.observer.path(['query', 'user']), b: mirror.query.observer.path('user'), aToB: true, bToA: false })
	);
	removers.push(
		Obridge({ a: msg.observer.path(['query', 'chatUuid']), b: mirror.query.observer.path('chatUuid'), aToB: true, bToA: false })
	);
	removers.push(
		Obridge({ a: msg.observer.path(['query', 'createdAt']), b: mirror.query.observer.path('createdAt'), aToB: true, bToA: false })
	);
	removers.push(
		Obridge({ a: msg.observer.path(['query', 'modifiedAt']), b: mirror.query.observer.path('modifiedAt'), aToB: true, bToA: false })
	);

	// route text (two-way only for owner)
	removers.push(
		Obridge({
			a: msg.observer.path('text'),
			b: mirror.observer.path('text'),
			aToB: true,
			bToA: isOwner,
			throttle: 50,
			flushA: isOwner ? () => DB.flush(msg) : null, // flush msg when mirror edits push into msg
		})
	);

	return {
		mirror,
		remove: () => removers.forEach(r => r()),
	};
};

export default () => ({
	authenticated: false,
	onCon: async ({ sync, DB, user }) => {
		const removers = [];
		const msgRemovers = new Map();

		let removeChatScoped = () => { };

		sync.currentChat = OObject({
			uuid: null,
			messages: OArray([]),
			title: '',
		});

		const clearMsgs = () => {
			for (const r of msgRemovers.values()) r();
			msgRemovers.clear();
			sync.currentChat.messages.splice(0, sync.currentChat.messages.length);
		};

		const addMsg = (msg) => {
			if (!msg) return;

			const isOwner = msg.query.user === user.query.uuid;

			const { mirror, remove } = exposeMsg(msg, { isOwner, DB });
			sync.currentChat.messages.push(mirror);

			// key by msg uuid (from real store)
			msgRemovers.set(msg.query.uuid, remove);
		};

		removers.push(
			sync.observer.path(['currentChat', 'uuid']).watch(async () => {
				clearMsgs();
				removeChatScoped();
				removeChatScoped = () => { };

				const chatUuid = sync.currentChat.uuid;
				if (!chatUuid) return;

				const chat = await DB('chats', { uuid: chatUuid });
				if (!chat) return;

				if (typeof chat.title !== 'string') chat.title = '';
				sync.currentChat.title = normalizeTitle(chat.title);

				const isCreator = chat.query.creator === user.query.uuid;

				const scoped = [];

				scoped.push(
					Obridge({
						a: chat.observer.path('title'),
						b: sync.currentChat.observer.path('title'),
						aToB: true,
						bToA: isCreator,
						normalizeA: normalizeTitle,
						normalizeB: normalizeTitle,
						throttle: 150,
						flushA: isCreator ? () => DB.flush(chat) : null,
					})
				);

				const results = await DB.queryAll('messages', { chatUuid });
				const stores = await Promise.all(results.map(q => DB.instance(q)));
				stores.forEach(addMsg);

				scoped.push(
					chat.observer.watch(async (d) => {
						if (d.value?.type === 'create') {
							const msg = await DB('messages', { uuid: d.value.msgUuid });
							addMsg(msg);
						}
					})
				);

				removeChatScoped = () => scoped.forEach(r => r());
			})
		);

		removers.push(() => {
			removeChatScoped();
			clearMsgs();
		});

		return removers;
	},
});
