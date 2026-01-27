import { Button, TextField, Observer, Typography, StageContext, suspend, Icon } from 'destamatic-ui';
import AppContext from '../utils/appContext.js';

import Stasis from '../components/Stasis.jsx';
import UserProfileCircleImage from '../components/UserProfileCircleImage.jsx';

const MessageItem = ({ msg }) => <div style={{ padding: 8 }}>
	<Typography type="p1" label={msg?.get?.() ? msg.get().observer.path('text') : msg.observer.path('text')} />
</div>;

const CurrentChat = AppContext.use(app => ({ chatUuid }) => {
	const msgText = Observer.mutable('');

	const send = async () => {
		const text = msgText.get().trim();
		if (!text) return;
		msgText.set('');
		await app.modReq('chat/CreateMsg', { chatUuid: chatUuid.get(), text });
	};

	const query = Observer.mutable('');
	const focused = Observer.mutable(false);
	const hovered = Observer.mutable(false);

	return <div theme='column_fill_contentContainer' style={{ marginTop: 16 }}>
		<Typography type="h2" label={chatUuid.map(c => `Chat: ${c}`)} />

		<div theme='primary' style={{ marginTop: 12, height: 420, overflowY: 'auto', border: '4px solid $color', borderRadius: 8 }}>
			<MessageItem each:msg={app.observer.path(['sync', 'currentChat', 'messages'])} />
		</div>

		<div theme='row_fill_center' style={{ gap: 8, marginTop: 12 }}>
			<div
				theme={[
					'row_radius_primary',
					focused.bool("focused", null),
				]}
				style={{ background: hovered.bool("$color_hover", '$color'), gap: 5, overflow: 'clip', paddingRight: 5 }}
			>
				{/* <Button
					type='outlined'
					round
					icon={<Icon name='feather:plus' style={{ color: '$color_background' }} />}
					onClick={send}
				/> */}
				<TextField
					type='contained'
					value={msgText}
					style={{ background: 'none', border: 'none', outline: 'none', }}
					isFocused={focused}
					isHovered={hovered}
					placeholder='Search Gigs (TODO)'
					onKeyDown={e => {
						if (e.key === 'Enter') {
							e.preventDefault();
						} else if (e.key === 'Escape') {
							query.set('');
							focused.set(false);
							e.preventDefault();
						}
					}}
				/>
				<Button
					type='text'
					round
					icon={<Icon name='feather:send' style={{ color: '$color_background' }} />}
					onClick={send}
				/>
			</div>
		</div>
	</div>;
});

const Chat = AppContext.use(app => StageContext.use(stage => suspend(Stasis, async () => {
	const user = Observer.mutable('');

	// Only set current chat uuid if we actually have one
	const initialId = (stage.urlProps?.id || '').trim();
	if (initialId) app.sync.currentChat.uuid = initialId;

	const chatsList = await app.modReq('chat/ListChats');
	const chatUuids = (chatsList || []).map(c => c.uuid).filter(Boolean);

	// Don’t call GetChats with empty uuids
	const chats = chatUuids.length
		? await app.modReq('chat/GetChats', { uuids: chatUuids })
		: [];

	const userUuids = [...new Set(
		chats
			.flatMap(x => x.participants || [])
			.map(p => (p ?? "").trim())
			.filter(Boolean)
			.filter(u => u !== app.sync.state.profile.uuid)
	)];

	const userIndex = userUuids.length
		? await app.modReq('users/get', { userUuids })
		: [];

	const ChatItem = ({ each }) => {
		const partSet = new Set(each.participants || []);
		const participants = userIndex.filter(ui => partSet.has(ui.uuid));
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
				{chats.length
					? <ChatItem each={chats} />
					: <div theme='column_fill_contentContainer' style={{ padding: 12, gap: 8 }}>
						<Typography type="h3" label="No chats yet" />
						<Typography type="p1" label="Create one below to get started." />
					</div>
				}
			</div>

			{activeChatId.map(id =>
				id
					? <CurrentChat chatUuid={stage.observer.path(['urlProps', 'id'])} />
					: <div theme='column_fill_contentContainer' style={{ marginTop: 16, padding: 12 }}>
						<Typography type="h2" label="Select a chat" />
						<Typography type="p1" label="Pick one on the left, or create a new chat." />
					</div>
			)}
		</div>

		<div theme='column_fill_contentContainer' style={{ marginTop: 12, gap: 8 }}>
			<Typography label={stage.observer.path(['urlProps', 'id']).map(v => v || 'no chat yet')} type="p1" />
			<TextField placeholder="user uuid" value={user} />
			<Button
				type="contained"
				label="create"
				onClick={async () => {
					const participant = user.get().trim();
					const participants = participant ? [participant] : [];
					const res = await app.modReq('chat/CreateChat', { participants });
					stage.open({ name: 'chat', urlProps: { id: res } });
				}}
			/>
		</div>
	</>;
})));

export default Chat;
