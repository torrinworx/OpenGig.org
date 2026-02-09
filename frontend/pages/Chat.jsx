import {
	Button,
	TextField,
	Observer,
	Typography,
	StageContext,
	suspend,
	Shown,
	ThemeContext,
} from 'destamatic-ui';

import AppContext from '../utils/appContext.js';
import Stasis from '../components/Stasis.jsx';
import UserProfileCircleImage from '../components/UserProfileCircleImage.jsx';

const MessageItem = ({ msg, userIndex }) => {
	if (!msg) return null;

	const userId = (msg?.userId ?? '').trim();
	const users = Array.isArray(userIndex) ? userIndex : [];
	const user = users.find(u => (u?.id ?? '').trim() === userId);

	return <div theme="row" style={{ padding: 8, gap: 10, alignItems: 'flex-start' }}>
		<div theme="column" style={{ gap: 4, alignItems: 'center', width: 60 }}>
			<UserProfileCircleImage
				imageUrl={user?.image ? `/files/${user.image.slice(1)}` : null}
				size="32px"
				borderWidth={2}
			/>
			<Typography
				type="p2"
				label={user?.name || 'Unknown'}
				style={{ textAlign: 'center', maxWidth: 60 }}
			/>
		</div>

		<div theme="column" style={{ gap: 2 }}>
			<Typography type="p1" label={msg.observer.path('text')} />
		</div>
	</div>;
};

const CurrentChat = ThemeContext.use(h => AppContext.use(app => (props, cleanup, mounted) => {
	const { chatId, userIndex } = props;

	const msgText = Observer.mutable('');

	// NEW paginate signal shape
	const page = app.observer.path(['sync', 'currentChat', 'page']);
	const follow = page.path('follow');
	const want = page.path('want');
	const pageSize = page.path('pageSize');
	const cap = page.path('cap');
	const anchor = page.path('anchor'); // (unused unless you implement source.around)

	const scroller = Observer.mutable(null);
	const olderSentinel = Observer.mutable(null);

	const dbg = Observer.mutable({
		len: 0,
		follow: false,
		want: null,
		pageSize: 0,
		cap: 0,
		anchor: null,

		scrollTop: 0,
		scrollHeight: 0,
		clientHeight: 0,
		max: 0,
		pos: 0,
		distToNewest: 0,
		reason: '',
	});

	const normScroll = (el) => {
		const max = Math.max(0, el.scrollHeight - el.clientHeight);
		const pos = el.scrollTop;
		return { max, pos };
	};

	const readDbg = (reason) => {
		const el = scroller.get();
		const msgs = app.sync.currentChat.messages;
		if (!el) return;

		const { max, pos } = normScroll(el);
		dbg.set({
			len: msgs?.length ?? 0,
			follow: !!follow.get(),
			want: want.get(),
			pageSize: pageSize.get(),
			cap: cap.get(),
			anchor: anchor.get(),

			scrollTop: el.scrollTop,
			scrollHeight: el.scrollHeight,
			clientHeight: el.clientHeight,
			max,
			pos,
			distToNewest: max - pos,
			reason,
		});
	};

	const WINDOW = 200;
	const STEP = 50;

	let loadingOlder = false;
	let loadingNewer = false;
	let wantSeq = 0;

	const loadOlder = (why) => {
		if (loadingOlder) return;
		if (follow.get()) return;

		loadingOlder = true;
		setTimeout(() => (loadingOlder = false), 150);

		// ask paginator for one page of older
		pageSize.set(STEP);
		wantSeq++;
		want.set({ dir: 'older', seq: wantSeq });

		readDbg('loadOlder:' + why);
	};

	const loadNewer = (why) => {
		if (loadingNewer) return;
		if (follow.get()) return;

		loadingNewer = true;
		setTimeout(() => (loadingNewer = false), 150);

		pageSize.set(STEP);
		wantSeq++;
		want.set({ dir: 'newer', seq: wantSeq });

		readDbg('loadNewer:' + why);
	};

	// reset paging on chat change (match new signal shape)
	cleanup(chatId.watch(() => {
		follow.set(true);
		want.set(null);
		pageSize.set(STEP);
		cap.set(WINDOW);
		anchor.set(null);
		queueMicrotask(() => readDbg('chatId reset'));
	}));

	let prevScrollHeight = 0;
	let prevWasNearOlder = false;
	let prevWasNearNewest = false;

	const nearOlderEdge = () => {
		const el = scroller.get();
		if (!el) return false;
		const { pos } = normScroll(el);
		return pos <= 200; // near top
	};

	const nearNewestEdge = () => {
		const el = scroller.get();
		if (!el) return false;
		const { max, pos } = normScroll(el);
		return (max - pos) <= 200; // near bottom
	};

	const scrollToNewest = () => {
		const el = scroller.get();
		if (!el) return;
		const { max } = normScroll(el);
		el.scrollTop = max;
	};

	mounted(() => {
		const el = scroller.get();
		if (!el) return;
		prevScrollHeight = el.scrollHeight;
		// on first mount, if follow=true, be at bottom
		if (follow.get()) queueMicrotask(scrollToNewest);
		readDbg('mounted');
	});

	// keep scroll stable when older prepends happen (near top)
	// and keep pinned to bottom when follow=true.
	cleanup(app.observer.path(['sync', 'currentChat', 'messages']).watch(() => {
		const el = scroller.get();
		if (!el) return;

		const wasNearOlder = prevWasNearOlder;
		const wasNearNewest = prevWasNearNewest;
		const oldH = prevScrollHeight;

		requestAnimationFrame(() => {
			const el2 = scroller.get();
			if (!el2) return;

			// If we were near top and we're unfollowed, compensate prepend growth
			if (!follow.get() && wasNearOlder) {
				const deltaH = el2.scrollHeight - oldH;
				if (deltaH > 0) el2.scrollTop += deltaH;
			}

			// If follow=true (or we were near bottom), stay pinned to newest
			if (follow.get() || wasNearNewest) {
				const max = Math.max(0, el2.scrollHeight - el2.clientHeight);
				el2.scrollTop = max;
			}

			prevScrollHeight = el2.scrollHeight;
			readDbg('messages change');
		});
	}));

	mounted(() => {
		const root = scroller.get();
		const target = olderSentinel.get();
		if (!root || !target || !window.IntersectionObserver) return;

		const io = new IntersectionObserver((entries) => {
			const hit = entries.some(e => e.isIntersecting);
			if (hit && !follow.get()) loadOlder('intersection');
			readDbg('io');
		}, {
			root,
			threshold: 0.01,
		});

		io.observe(target);
		cleanup(() => io.disconnect());
	});

	return <div theme='column_fill_contentContainer' style={{ marginTop: 16 }}>
		<Typography type="h2" label={app.observer.path(['sync', 'currentChat', 'title'])} />

		<div style={{ position: 'relative' }}>
			<div
				theme='primary'
				ref={scroller}
				style={{
					marginTop: 12,
					height: 420,
					overflowY: 'auto',
					border: '4px solid $color',
					borderRadius: 8,

					display: 'flex',
					flexDirection: 'column', // IMPORTANT: paginator is oldest->newest
				}}
				onScroll={(e) => {
					const el = e.currentTarget;
					const { max, pos } = normScroll(el);

					// newest is bottom
					const ENTER_NEWEST = 40;
					const LEAVE_NEWEST = 120;
					const isFollow = !!follow.get();

					const distToNewest = max - pos;
					const atNewest = distToNewest <= (isFollow ? LEAVE_NEWEST : ENTER_NEWEST);
					if (atNewest !== isFollow) follow.set(atNewest);

					const nearOlder = pos <= 200;
					const nearNewest = distToNewest <= 200;

					prevWasNearOlder = nearOlder;
					prevWasNearNewest = nearNewest;

					// Pull older when near top and unfollowed
					if (!follow.get() && nearOlder) loadOlder('scroll');

					// If unfollowed and drifting toward bottom, page newer a bit
					if (!follow.get() && nearNewest && !atNewest) loadNewer('scroll');

					prevScrollHeight = el.scrollHeight;
					readDbg('scroll');
				}}
				onWheel={(e) => {
					if (e.deltaY < 0) {
						prevWasNearOlder = nearOlderEdge();
						if (prevWasNearOlder && !follow.get()) loadOlder('wheel@edge');
					}
					if (e.deltaY > 0) {
						prevWasNearNewest = nearNewestEdge();
						if (prevWasNearNewest && !follow.get()) loadNewer('wheel@edge');
					}
				}}
			>
				{/* sentinel at TOP for "older" */}
				<div ref={olderSentinel} style={{ height: 1 }} />

				<MessageItem
					each:msg={app.observer.path(['sync', 'currentChat', 'messages'])}
					userIndex={userIndex}
				/>
			</div>

			<pre
				style={{
					position: 'absolute',
					top: 10,
					right: 10,
					width: 360,
					maxHeight: 200,
					overflow: 'auto',
					background: 'rgba(0,0,0,0.65)',
					color: 'white',
					padding: 10,
					borderRadius: 8,
					fontSize: 12,
					pointerEvents: 'none',
				}}
			>
				{dbg.map(v => JSON.stringify(v, null, 2))}
			</pre>
		</div>

		<div theme='row_fill_center' style={{ gap: 8, marginTop: 12 }}>
			<TextField
				type='contained'
				value={msgText}
				placeholder='type a message…'
				onKeyDown={async e => {
					if (e.key === 'Enter') {
						e.preventDefault();
						const text = msgText.get().trim();
						if (!text) return;
						msgText.set('');
						await app.modReq('chat/CreateMsg', { chatId: chatId.get(), text });
					}
				}}
			/>
		</div>
	</div>;
}));

const Chat = AppContext.use(app => StageContext.use(stage => suspend(Stasis, async () => {
	const initialId = (stage.urlProps?.id || '').trim();
	if (initialId) app.sync.currentChat.id = initialId;

	const chatsList = await app.modReq('chat/ListChats');
	const chatIds = (chatsList || []).map(c => c.id).filter(Boolean);

	const chats = chatIds.length
		? await app.modReq('chat/GetChats', { ids: chatIds })
		: [];

	const userIds = [...new Set(
		chats
			.flatMap(x => x.participants || [])
			.map(p => (p ?? '').trim())
			.filter(Boolean)
	)];

	const userIndex = userIds.length
		? await app.modReq('users/get', { ids: userIds })
		: [];

	const ChatItem = ({ each }) => {
		const partSet = new Set(each.participants || []);
		const participants = (Array.isArray(userIndex) ? userIndex : []).filter(ui => partSet.has(ui.id));
		const images = participants.map(p => p.image ? `/files/${p.image.slice(1)}` : false);

		return <Button
			type={stage.observer.path(['urlProps', 'id']).map(id => id === each.id ? 'contained' : 'text')}
			label={each.title || each.id}
			onClick={() => stage.open({ name: 'chat', urlProps: { id: each.id } })}
		>
			<div theme='row'>
				<UserProfileCircleImage size='50px' borderWidth={0} each:imageUrl={images} />
			</div>
		</Button>;
	};

	const activeChatId = stage.observer.path(['urlProps', 'id']).map(v => (v || '').trim() || null);

	activeChatId.watch(() => {
		app.sync.currentChat.id = activeChatId.get();
	});

	return <>
		<div theme='row_fill_spread'>
			<div theme='column_fill' style={{ minWidth: 280 }}>
				<Shown value={Observer.mutable(chats).map(() => chats.length > 0)}>
					<mark:then>
						<ChatItem each={chats} />
					</mark:then>
					<mark:else>
						<div theme='column_fill_contentContainer' style={{ padding: 12, gap: 8 }}>
							<Typography type="h3" label="No chats yet" />
							<Typography type="p1" label="Create one below to get started." />
						</div>
					</mark:else>
				</Shown>
			</div>

			{activeChatId.map(id =>
				id
					? <CurrentChat
						chatId={stage.observer.path(['urlProps', 'id'])}
						userIndex={userIndex}
					/>
					: <div theme='column_fill_contentContainer' style={{ marginTop: 16, padding: 12 }}>
						<Typography type="h2" label="Select a chat" />
						<Typography type="p1" label="Pick one on the left, or create a new chat." />
					</div>
			)}
		</div>
	</>;
})));

export default Chat;
