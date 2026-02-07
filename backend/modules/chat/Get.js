import { OObject, OArray } from 'destam';
import { Obridge, paginate } from 'destam-web-core';

const normalizeTitle = (v) => (typeof v === 'string' ? v.trim() : '');

// New ODB world notes:
// - no `query` / `persistent` nesting anymore
// - messages/chats are plain ODB docs (OObject) with index fields mirroring top-level where needed
// - we should use doc.$odb.flush() instead of DB.flush(doc)
// - paginate.js (ODB version) returns live ODB docs already, so middle(doc) gets the actual message doc

// Always create a mirror with the same shape for all messages.
// id fields: msg -> mirror (read-only)
// text: msg <-> mirror if owner, else msg -> mirror
const exposeMsg = (msg, { isOwner }) => {
	const mirror = OObject({
		id: null,
		userId: null,
		chatId: null,
		createdAt: null,
		modifiedAt: null,
		text: '',
	});

	// initial values
	mirror.id = msg?.id ?? msg?.$odb?.key ?? null;
	mirror.userId = msg?.userId ?? null;
	mirror.chatId = msg?.chatId ?? null;
	mirror.createdAt = msg?.createdAt ?? null;
	mirror.modifiedAt = msg?.modifiedAt ?? null;
	mirror.text = msg?.text ?? '';

	const removers = [];

	// read-only field bridges
	removers.push(
		Obridge({ a: msg.observer.path('id'), b: mirror.observer.path('id'), aToB: true, bToA: false })
	);
	removers.push(
		Obridge({ a: msg.observer.path('userId'), b: mirror.observer.path('userId'), aToB: true, bToA: false })
	);
	removers.push(
		Obridge({ a: msg.observer.path('chatId'), b: mirror.observer.path('chatId'), aToB: true, bToA: false })
	);
	removers.push(
		Obridge({ a: msg.observer.path('createdAt'), b: mirror.observer.path('createdAt'), aToB: true, bToA: false })
	);
	removers.push(
		Obridge({ a: msg.observer.path('modifiedAt'), b: mirror.observer.path('modifiedAt'), aToB: true, bToA: false })
	);

	// text bridge (two-way only for owner)
	removers.push(
		Obridge({
			a: msg.observer.path('text'),
			b: mirror.observer.path('text'),
			aToB: true,
			bToA: isOwner,
			throttle: 50,
			flushA: isOwner ? () => msg.$odb.flush() : null,
		})
	);

	return {
		mirror,
		remove: () => removers.forEach(r => r()),
	};
};

export default () => ({
	authenticated: false,

	// remove `database`/`DB` usage; assume you have `odb` on connection now
	onCon: async ({ sync, odb, user }) => {
		const removers = [];
		let removeChatScoped = () => { };

		if (!sync) return;

		sync.currentChat = OObject({
			id: null,
			messages: OArray([]),
			title: '',

			// paging control watched by paginate()
			page: OObject({
				anchor: null, // { cursor, id } or null (see paginate_odb.js)
				before: 0,
				after: 50,
				follow: true,
			}),
		});

		removers.push(
			sync.observer.path(['currentChat', 'id']).watch(async () => {
				removeChatScoped();
				removeChatScoped = () => { };

				const chatId = sync.currentChat.id; // ✅ use the field, not observer.id
				if (!chatId) {
					sync.currentChat.title = '';
					sync.currentChat.messages.splice(0, sync.currentChat.messages.length);
					return;
				}

				const chat = await odb.findOne({
					collection: 'chats',
					query: { id: chatId },
				});

				if (!chat) {
					sync.currentChat.title = '';
					sync.currentChat.messages.splice(0, sync.currentChat.messages.length);
					return;
				}

				sync.currentChat.page.anchor = null;
				sync.currentChat.page.before = 0;
				sync.currentChat.page.after = 50;
				sync.currentChat.page.follow = true;

				sync.currentChat.title = normalizeTitle(chat.title ?? '');

				const userId = user.observer.id.toHex();
				const isCreator = chat.creatorId === userId;

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
						flushA: isCreator ? () => chat.$odb.flush() : null,
					})
				);

				const removePager = paginate({
					array: sync.currentChat.messages,
					signal: sync.currentChat.page.observer,

					odb: {
						collection: 'messages',
						filter: { chatId },
						sort: { createdAt: -1, id: -1 },
						cursorField: 'createdAt',
						idField: 'id',
						keyField: 'id',
					},

					changes: chat.observer.path('seq'),

					middle: async (msg) => {
						const isOwner = msg.userId === userId;
						const { mirror, remove } = exposeMsg(msg, { isOwner });
						return {
							item: mirror,
							remove: async () => {
								remove?.();
								await msg.$odb.dispose();
							}
						};
					},

					key: (msg) => msg.id ?? msg.$odb.key,
				});

				scoped.push(removePager);

				// also dispose chat doc when switching chats
				scoped.push(async () => { try { await chat.$odb.dispose(); } catch { } });

				removeChatScoped = () => scoped.forEach(r => r());
			})
		);

		removers.push(() => {
			removeChatScoped();
			sync.currentChat.messages.splice(0, sync.currentChat.messages.length);
		});

		return removers;
	},
});