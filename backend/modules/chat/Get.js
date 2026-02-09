// chat/Get.js
import { OObject, OArray } from 'destam';
import { Obridge, paginate } from 'destam-web-core';

const normalizeTitle = (v) => (typeof v === 'string' ? v.trim() : '');
const hexId = (doc) => doc?.id ?? doc?.observer?.id?.toHex?.() ?? doc?.$odb?.key ?? null;

// Always create a mirror with the same shape for all messages.
// id fields: msg -> mirror (read-only-ish; msg may not have `id` field in-tree anymore)
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
	mirror.id = hexId(msg);
	mirror.userId = msg?.userId ?? null;
	mirror.chatId = msg?.chatId ?? null;
	mirror.createdAt = msg?.createdAt ?? null;
	mirror.modifiedAt = msg?.modifiedAt ?? null;
	mirror.text = msg?.text ?? '';

	const removers = [];

	// NOTE: msg docs created by CreateMsg.js don't set `id` in the state tree,
	// so bridging msg.path('id') would overwrite mirror.id with undefined.
	// Keep mirror.id as the doc id (observer.id / $odb.key).
	// If you later add `id` as a real field on messages, you can re-add an id bridge.

	// read-only field bridges
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

	onCon: async ({ sync, odb, user }) => {
		const removers = [];
		let removeChatScoped = () => { };

		if (!sync) return;

		sync.currentChat = OObject({
			id: null,
			messages: OArray([]),
			title: '',

			// NEW paginate.js signal shape
			page: OObject({
				follow: true,
				want: null,     // 'older' | 'newer' | null
				pageSize: 50,
				cap: 200,
				anchor: null,   // optional; only used if source.around exists
			}),
		});

		removers.push(
			sync.observer.path(['currentChat', 'id']).watch(async () => {
				removeChatScoped();
				removeChatScoped = () => { };

				const chatId = sync.currentChat.id;
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

				// reset paging
				sync.currentChat.page.follow = true;
				sync.currentChat.page.want = null;
				sync.currentChat.page.pageSize = 50;
				sync.currentChat.page.cap = 200;
				sync.currentChat.page.anchor = null;

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

				// ODB-backed keyset source (no raw driver calls)
				const sortDesc = { createdAt: -1, id: -1 };
				const sortAsc = { createdAt: 1, id: 1 };

				const fallbackSlice = async (predicate, limit, dir /* 'older'|'newer' */) => {
					// fallback for drivers that don't support $or/$lt/$gt in query
					const all = await odb.findMany({
						collection: 'messages',
						query: { chatId },
						options: { sort: sortAsc, limit: 5000 }, // cap fallback work
					});

					const filtered = all.filter(predicate);
					if (dir === 'older') return filtered.slice(Math.max(0, filtered.length - limit));
					return filtered.slice(0, limit);
				};

				const source = {
					tail: async (limit) => {
						const docs = await odb.findMany({
							collection: 'messages',
							query: { chatId },
							options: { sort: sortDesc, limit },
						});
						docs.reverse(); // paginator expects oldest -> newest
						return docs;
					},

					older: async (before, limit) => {
						if (!before?.id || before.cursor == null) return [];

						try {
							const docs = await odb.findMany({
								collection: 'messages',
								query: {
									chatId,
									$or: [
										{ createdAt: { $lt: before.cursor } },
										{ createdAt: before.cursor, id: { $lt: before.id } },
									],
								},
								options: { sort: sortDesc, limit },
							});
							docs.reverse(); // oldest -> newest
							return docs;
						} catch {
							return fallbackSlice(
								(d) => {
									const c = d?.createdAt ?? 0;
									const id = hexId(d) ?? '';
									return (c < before.cursor) || (c === before.cursor && id < before.id);
								},
								limit,
								'older'
							);
						}
					},

					newer: async (after, limit) => {
						if (!after?.id || after.cursor == null) return [];

						try {
							return await odb.findMany({
								collection: 'messages',
								query: {
									chatId,
									$or: [
										{ createdAt: { $gt: after.cursor } },
										{ createdAt: after.cursor, id: { $gt: after.id } },
									],
								},
								options: { sort: sortAsc, limit }, // already oldest -> newest
							});
						} catch {
							return fallbackSlice(
								(d) => {
									const c = d?.createdAt ?? 0;
									const id = hexId(d) ?? '';
									return (c > after.cursor) || (c === after.cursor && id > after.id);
								},
								limit,
								'newer'
							);
						}
					},
				};

				const removePager = paginate({
					array: sync.currentChat.messages,
					signal: sync.currentChat.page.observer,
					source,

					// when chat.seq bumps (CreateMsg), follow-mode will pull newer
					changes: chat.observer.path('seq'),

					attach: async (msg) => {
						const isOwner = msg.userId === userId;
						const { mirror, remove } = exposeMsg(msg, { isOwner });

						return {
							item: mirror,
							remove: async () => {
								remove?.();
								await msg.$odb.dispose();
							},
						};
					},

					getKey: (msg) => hexId(msg),
					getId: (msg) => hexId(msg),
					getCursor: (msg) => msg?.createdAt ?? 0,
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