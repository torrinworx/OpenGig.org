import { OObject, OArray } from 'destam';
import { Obridge } from 'destam-web-core';

export const deps = ['paginate'];

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
			flushA: isOwner ? () => DB.flush(msg) : null,
		})
	);

	return {
		mirror,
		remove: () => removers.forEach(r => r()),
	};
};

export default ({ paginate }) => ({
	authenticated: false,
	onCon: async ({ sync, DB, user, database }) => {
		const removers = [];

		let removeChatScoped = () => { };

		if (!sync) return;

		sync.currentChat = OObject({
			uuid: null,
			messages: OArray([]),
			title: '',

			// paging control watched by paginate()
			page: OObject({
				anchor: null,   // { createdAt, _id } (or null)
				before: 0,
				after: 50,
				follow: true,
			}),
		});

		removers.push(
			sync.observer.path(['currentChat', 'uuid']).watch(async () => {
				removeChatScoped();
				removeChatScoped = () => { };

				const chatUuid = sync.currentChat.uuid;
				if (!chatUuid) {
					sync.currentChat.title = '';
					sync.currentChat.messages.splice(0, sync.currentChat.messages.length);
					return;
				}

				const chat = await DB('chats', { uuid: chatUuid });
				if (!chat) {
					sync.currentChat.title = '';
					sync.currentChat.messages.splice(0, sync.currentChat.messages.length);
					return;
				}

				// reset paging defaults on chat change
				sync.currentChat.page.anchor = null;
				sync.currentChat.page.before = 0;
				sync.currentChat.page.after = 50;
				sync.currentChat.page.follow = true;

				if (typeof chat.title !== 'string') chat.title = '';
				sync.currentChat.title = normalizeTitle(chat.title);

				const isCreator = chat.query.creator === user.query.uuid;

				const scoped = [];

				// title bridge
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

				// messages paging + watcher lifecycle
				const removePager = paginate({
					array: sync.currentChat.messages,
					signal: sync.currentChat.page.observer,

					mongo: {
						table: 'messages',

						// IMPORTANT: destam-db mongo driver stores query fields under "persistent"
						filter: { 'persistent.chatUuid': chatUuid },

						// Use createdAt + _id tiebreak for stable paging
						sort: { 'persistent.createdAt': -1, _id: -1 },
						cursorField: 'persistent.createdAt',
						idField: '_id',
						keyField: 'persistent.uuid', // add this
					},

					// simplest invalidate trigger
					changes: chat.observer.path('seq'),

					middle: async (doc) => {
						const uuid = doc?.persistent?.uuid;
						if (!uuid) { console.log('no uuid in doc', doc?._id); return { item: null, remove: () => { } }; }

						const msg = await DB('messages', { uuid });
						if (!msg) { console.log('DB messages lookup failed for uuid', uuid); return { item: null, remove: () => { } }; }

						const isOwner = msg.query.user === user.query.uuid;
						const { mirror, remove } = exposeMsg(msg, { isOwner, DB });
						return { item: mirror, remove };
					},

					key: (doc) => doc?.persistent?.uuid ?? String(doc?._id),

					throttle: 80,
					refreshOnChanges: 'follow',
				});

				scoped.push(removePager);

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
