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

const hexId = (thing) => thing?.observer?.id?.toHex?.() ?? null;

const MessageItem = ({ msg, userIndex }) => {
	console.log('msg', msg)
	if (!msg) return null; 

	// new format
	const userId = msg?.userId;
	const user = (Array.isArray(userIndex) ? userIndex : []).find(u => u.id === userId);

	console.log(user);
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

	const page = app.observer.path(['sync', 'currentChat', 'page']);
	const after = page.path('after');
	const before = page.path('before');
	const follow = page.path('follow');
	const anchor = page.path('anchor');

	const scroller = Observer.mutable(null);
	const olderSentinel = Observer.mutable(null);

	const dbg = Observer.mutable({
		len: 0,
		follow: false,
		after: 0,
		before: 0,
		anchor: null,

		scrollTop: 0,
		scrollHeight: 0,
		clientHeight: 0,
		max: 0,
		pos: 0,
		distToOlder: 0,
	});

	const normScroll = (el) => {
		const max = Math.max(0, el.scrollHeight - el.clientHeight);
		const pos = el.scrollTop < 0 ? -el.scrollTop : el.scrollTop; // firefox column-reverse weirdness
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
			after: after.get(),
			before: before.get(),
			anchor: anchor.get(),

			scrollTop: el.scrollTop,
			scrollHeight: el.scrollHeight,
			clientHeight: el.clientHeight,
			max,
			pos,
			distToOlder: max - pos,
			reason,
		});
	};

	const WINDOW = 200;
	const STEP = 50;

	let loadingOlder = false;

	const loadOlder = (why) => {
		if (loadingOlder) return;
		if (follow.get()) return;

		loadingOlder = true;
		setTimeout(() => (loadingOlder = false), 150);

		const msgs = app.sync.currentChat.messages;
		const curAfter = after.get() ?? 0;

		console.log('[chat] loadOlder()', { why, curAfter, len: msgs?.length });

		// Grow until we hit WINDOW
		if (curAfter < WINDOW - 1) {
			after.set(Math.min(WINDOW - 1, curAfter + STEP));
			return;
		}

		// Slide window by setting anchor (drops some newest)
		const anchorMsg = msgs?.[STEP];

		// paginate_odb expects anchor like { cursor, id }
		const id = hexId(anchorMsg) ?? anchorMsg?.id ?? null;
		const cursor = anchorMsg?.createdAt ?? null;

		if (id && cursor != null) {
			anchor.set({ id, cursor });
			after.set(WINDOW - 1);
			before.set(0);
		} else {
			console.log('[chat] no anchorMsg at STEP', { STEP, len: msgs?.length, id, cursor });
		}
	};

	// reset paging on chat change
	cleanup(chatId.watch(() => {
		follow.set(true);
		after.set(50);
		before.set(0);
		anchor.set(null);
		queueMicrotask(() => readDbg('chatId reset'));
	}));

	let prevScrollHeight = 0;
	let prevWasNearOlder = false;

	const nearOlderEdge = () => {
		const el = scroller.get();
		if (!el) return false;
		const { max, pos } = normScroll(el);
		return (max - pos) <= 200;
	};

	mounted(() => {
		const el = scroller.get();
		if (!el) return;
		prevScrollHeight = el.scrollHeight;
		readDbg('mounted');
	});

	cleanup(app.observer.path(['sync', 'currentChat', 'messages']).watch(() => {
		const el = scroller.get();
		if (!el) return;

		const wasNear = prevWasNearOlder;
		const oldH = prevScrollHeight;

		requestAnimationFrame(() => {
			const el2 = scroller.get();
			if (!el2) return;

			if (!follow.get() && wasNear) {
				const deltaH = el2.scrollHeight - oldH;
				if (deltaH > 0) el2.scrollTop += deltaH;
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
					flexDirection: 'column-reverse',
				}}
				onScroll={(e) => {
					const el = e.currentTarget;
					const { max, pos } = normScroll(el);

					const ENTER_NEWEST = 40;
					const LEAVE_NEWEST = 120;
					const isFollow = !!follow.get();

					const atNewest = pos <= (isFollow ? LEAVE_NEWEST : ENTER_NEWEST);
					if (atNewest !== isFollow) follow.set(atNewest);

					const nearOlder = (max - pos) <= 200;
					prevWasNearOlder = nearOlder;

					if (!follow.get() && nearOlder) loadOlder('scroll');

					prevScrollHeight = el.scrollHeight;
					readDbg('scroll');
				}}
				onWheel={(e) => {
					if (e.deltaY < 0) {
						prevWasNearOlder = nearOlderEdge();
						if (prevWasNearOlder && !follow.get()) loadOlder('wheel@edge');
					}
				}}
			>
				<MessageItem
					each:msg={app.observer.path(['sync', 'currentChat', 'messages'])}
					userIndex={userIndex}
				/>

				<div ref={olderSentinel} style={{ height: 1 }} />
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

	// If you still have chat/GetChats, it should accept ids now.
	// If you don't need this second fetch anymore, you can remove it and just use chatsList.

	const chats = chatIds.length
		? await app.modReq('chat/GetChats', { ids: chatIds })
		: [];

	const userIds = [...new Set(
		chats
			.flatMap(x => x.participants || [])
			.map(p => (p ?? '').trim())
			.filter(Boolean)
	)];

	// Update your users/get module to accept ids as well
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

	// keep sync.currentChat.id updated so Get.js reacts
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
