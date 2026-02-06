import { Button, TextField, Observer, Typography, StageContext, suspend, Icon, Shown, ThemeContext } from 'destamatic-ui';
import AppContext from '../utils/appContext.js';
import Stasis from '../components/Stasis.jsx';
import UserProfileCircleImage from '../components/UserProfileCircleImage.jsx';

const MessageItem = ({ msg, userIndex }) => {
	if (!msg) return null;

	const userUuid = msg?.query?.user;
	const user = (Array.isArray(userIndex) ? userIndex : []).find(u => u.uuid === userUuid);

	return <div theme="row" style={{ padding: 8, gap: 10, alignItems: 'flex-start' }}>
		<div theme="column" style={{ gap: 4, alignItems: 'center', width: 60 }}>
			<UserProfileCircleImage
				imageUrl={user?.image ? `/files/${user.image.slice(1)}` : null}
				size="32px"
				borderWidth={0}
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
	const { chatUuid, userIndex } = props;

	const msgText = Observer.mutable('');

	const page = app.observer.path(['sync', 'currentChat', 'page']);
	const after = page.path('after');
	const before = page.path('before');
	const follow = page.path('follow');
	const anchor = page.path('anchor');

	const scroller = Observer.mutable(null);

	// Sentinel that sits at the "older edge"
	// With column-reverse, the visually-top (oldest) is the LAST DOM child.
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
		const uuid = anchorMsg?.query?.uuid;

		if (uuid) {
			anchor.set({ uuid });
			after.set(WINDOW - 1);
			before.set(0);
		} else {
			console.log('[chat] no anchorMsg at STEP', { STEP, len: msgs?.length });
		}
	};

	// reset paging on chat change (CLEANED UP)
	cleanup(chatUuid.watch(() => {
		follow.set(true);
		after.set(50);
		before.set(0);
		anchor.set(null);
		queueMicrotask(() => readDbg('chatUuid reset'));
	}));

	// Maintain scroll “pin to older edge” when older msgs are inserted
	// This is optional but helps make it feel seamless.
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
		// update dbg after DOM paint
		const el = scroller.get();
		if (!el) return;

		const wasNear = prevWasNearOlder;
		const oldH = prevScrollHeight;

		requestAnimationFrame(() => {
			const el2 = scroller.get();
			if (!el2) return;

			// If user was at older edge and not following, keep them pinned to older edge
			if (!follow.get() && wasNear) {
				const deltaH = el2.scrollHeight - oldH;
				if (deltaH > 0) el2.scrollTop += deltaH;
			}

			prevScrollHeight = el2.scrollHeight;
			readDbg('messages change');
		});
	}));

	// IntersectionObserver to trigger paging even when scroll events stop firing at edge
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

					// edge detect for older
					const nearOlder = (max - pos) <= 200;
					prevWasNearOlder = nearOlder;

					if (!follow.get() && nearOlder) loadOlder('scroll');

					prevScrollHeight = el.scrollHeight;
					readDbg('scroll');
				}}
				// Helps when user wheels at the boundary and scroll doesn't change
				onWheel={(e) => {
					// wheel up usually means deltaY < 0 (older direction)
					if (e.deltaY < 0) {
						prevWasNearOlder = nearOlderEdge();
						if (prevWasNearOlder && !follow.get()) loadOlder('wheel@edge');
					}
				}}
			>
				{/* newest edge is first DOM child in column-reverse */}
				<MessageItem
					each:msg={app.observer.path(['sync', 'currentChat', 'messages'])}
					userIndex={userIndex}
				/>

				{/* older edge sentinel = last DOM child in column-reverse */}
				<div ref={olderSentinel} style={{ height: 1 }} />
			</div>

			{/* Debug HUD */}
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
						await app.modReq('chat/CreateMsg', { chatUuid: chatUuid.get(), text });
					}
				}}
			/>
		</div>
	</div>;
})
);

const Chat = AppContext.use(app => StageContext.use(stage => suspend(Stasis, async () => {
	const initialId = (stage.urlProps?.id || '').trim();
	if (initialId) app.sync.currentChat.uuid = initialId;

	const chatsList = await app.modReq('chat/ListChats');
	const chatUuids = (chatsList || []).map(c => c.uuid).filter(Boolean);

	const chats = chatUuids.length
		? await app.modReq('chat/GetChats', { uuids: chatUuids })
		: [];

	const userUuids = [...new Set(
		chats
			.flatMap(x => x.participants || [])
			.map(p => (p ?? "").trim())
			.filter(Boolean)
	)];

	const userIndex = userUuids.length
		? await app.modReq('users/get', { uuids: userUuids })
		: [];

	const ChatItem = ({ each }) => {
		const partSet = new Set(each.participants || []);
		const participants = (Array.isArray(userIndex) ? userIndex : []).filter(ui => partSet.has(ui.uuid));
		const images = participants.map(p => p.image ? `/files/${p.image.slice(1)}` : false);

		return <Button
			type={stage.observer.path(['urlProps', 'id']).map(id => id === each.uuid ? 'contained' : 'text')}
			label={each.title || each.uuid}
			onClick={() => stage.open({ name: 'chat', urlProps: { id: each.uuid } })}
		>
			<div theme='row'>
				<UserProfileCircleImage size='50px' borderWidth={0} each:imageUrl={images} />
			</div>
		</Button>;
	};

	const activeChatId = stage.observer.path(['urlProps', 'id']).map(v => (v || '').trim() || null);

	return <>
		<div theme='row_fill_spread'>
			<div theme='column_fill' style={{ minWidth: 280 }}>
				<Shown value={chats.map(() => chats.length > 0)}>
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
						chatUuid={stage.observer.path(['urlProps', 'id'])}
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
