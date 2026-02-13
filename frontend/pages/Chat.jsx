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

	const msgUserId = (msg?.userId ?? '').trim();
	const users = Array.isArray(userIndex) ? userIndex : [];
	const user = users.find(u => u.id === msgUserId) ?? null;

	return <div theme="row" style={{ padding: 8, gap: 10, alignItems: 'flex-start' }}>
		<div theme="column" style={{ gap: 4, alignItems: 'center', width: 60 }}>
			<UserProfileCircleImage
				imageUrl={user?.image ? `/files/${String(user.image).slice(1)}` : null}
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

	// simpler api now: just read messages directly
	const messagesObs = app.observer.path(['sync', 'currentChat', 'messages']);

	// just keep pinned-to-bottom behavior
	const scroller = Observer.mutable(null);
	let didInitialPin = false;

	const scrollToNewest = () => {
		const el = scroller.get();
		if (!el) return;
		el.scrollTop = Math.max(0, el.scrollHeight - el.clientHeight);
	};

	// reset pin state on chat change
	cleanup(chatId.watch(() => {
		didInitialPin = false;
		// after chat swap, once messages arrive we'll pin
		requestAnimationFrame(() => scrollToNewest());
	}));

	// pin when messages change (initial + new messages)
	cleanup(messagesObs.watch(() => {
		const el = scroller.get();
		if (!el) return;

		requestAnimationFrame(() => {
			const el2 = scroller.get();
			if (!el2) return;

			// initial pin once first messages land
			if (!didInitialPin && (app.sync.currentChat.messages?.length ?? 0) > 0) {
				didInitialPin = true;
				scrollToNewest();
				return;
			}

			// keep pinned if user is near bottom
			const max = Math.max(0, el2.scrollHeight - el2.clientHeight);
			const distToNewest = max - el2.scrollTop;
			if (distToNewest <= 120) scrollToNewest();
		});
	}));

	mounted(() => {
		// if already loaded
		requestAnimationFrame(() => scrollToNewest());
	});

	return <div theme="column_fill_contentContainer" style={{ marginTop: 16 }}>
		<Typography type="h2" label={app.observer.path(['sync', 'currentChat', 'title'])} />

		<div
			theme="primary"
			ref={scroller}
			style={{
				marginTop: 12,
				height: 420,
				overflowY: 'auto',
				border: '4px solid $color',
				borderRadius: 8,
				display: 'flex',
				flexDirection: 'column',
			}}
		>
			<MessageItem each:msg={messagesObs} userIndex={userIndex} />
		</div>

		<div theme="row_fill_center" style={{ gap: 8, marginTop: 12 }}>
			<TextField
				type="contained"
				value={msgText}
				placeholder="type a message…"
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

const Chat = AppContext.use(app => StageContext.use(stage => suspend(Stasis, async (_, cleanup) => {
	const initialId = (stage.urlProps?.id || '').trim();
	if (initialId) app.sync.currentChat.id = initialId;

	const chatsList = await app.modReq('chat/ListChats');
	const chatIds = (chatsList || []).map(c => c.id).filter(Boolean);

	const chats = chatIds.length
		? await app.modReq('chat/GetChats', { ids: chatIds })
		: [];

	const userIds = [
		...new Set(
			chats
				.flatMap(x => x.participants || [])
				.map(p => (p ?? '').trim())
				.filter(Boolean)
		),
	];

	const userIndex = userIds.length
		? await app.modReq('users/Get', { uuids: userIds })
		: [];

	const ChatItem = ({ each }) => {
		const partSet = new Set(each.participants || []);
		const participants = userIndex.filter(ui => partSet.has(ui.id));
		const images = participants.map(p => (p.image ? `/files/${String(p.image).slice(1)}` : false));

		return <Button
			type={stage.observer.path(['urlProps', 'id']).map(id => (id === each.id ? 'contained' : 'text'))}
			label={each.title || each.id}
			onClick={() => stage.open({ name: 'chat', urlProps: { id: each.id } })}
		>
			<div theme="row">
				<UserProfileCircleImage size="50px" borderWidth={0} each:imageUrl={images} />
			</div>
		</Button>;
	};

	const activeChatId = stage.observer.path(['urlProps', 'id']).map(v => (v || '').trim() || null);

	cleanup(activeChatId.watch(() => {
		app.sync.currentChat.id = activeChatId.get();
	}));

	return <>
		<div theme="row_fill_spread">
			<div theme="column_fill" style={{ minWidth: 280 }}>
				<Shown value={Observer.mutable(chats).map(() => chats.length > 0)}>
					<mark:then>
						<ChatItem each={chats} />
					</mark:then>
					<mark:else>
						<div theme="column_fill_contentContainer" style={{ padding: 12, gap: 8 }}>
							<Typography type="h3" label="No chats yet" />
							<Typography type="p1" label="Create one below to get started." />
						</div>
					</mark:else>
				</Shown>
			</div>

			{activeChatId.map(id =>
				id ? (
					<CurrentChat chatId={stage.observer.path(['urlProps', 'id'])} userIndex={userIndex} />
				) : (
					<div theme="column_fill_contentContainer" style={{ marginTop: 16, padding: 12 }}>
						<Typography type="h2" label="Select a chat" />
						<Typography type="p1" label="Pick one on the left, or create a new chat." />
					</div>
				)
			)}
		</div>
	</>;
})));

export default Chat;
