import { Button, TextField, Observer, Typography, StageContext, suspend, Icon } from 'destamatic-ui';
import AppContext from '../utils/appContext.js';

import Stasis from '../components/Stasis.jsx';
import UserProfileCircleImage from '../components/UserProfileCircleImage.jsx';

const MessageItem = ({ msg, imageUrlForUuid, nameForUuid }) => {
	const m = msg?.get?.() ? msg.get() : msg;

	const senderUuidObs = m.observer.path('user');

	console.log(imageUrlForUuid())

	return <div theme="row" style={{ padding: 8, gap: 10, alignItems: 'flex-start' }}>
		<div theme="column" style={{ gap: 4, alignItems: 'center', width: 60 }}>
			<UserProfileCircleImage
				size="32px"
				borderWidth={0}
				imageUrl={senderUuidObs.map(imageUrlForUuid)}
			/>
			<Typography
				type="p2"
				label={senderUuidObs.map(nameForUuid)}
				style={{ textAlign: 'center', maxWidth: 60 }}
			/>
		</div>

		<div theme="column" style={{ gap: 2 }}>
			<Typography type="p1" label={m.observer.path('text')} />
		</div>
	</div>;
};

const CurrentChat = AppContext.use(app => ({ chatUuid, imageUrlForUuid, nameForUuid }) => {
	const msgText = Observer.mutable('');

	const send = async () => {
		const text = msgText.get().trim();
		if (!text) return;
		msgText.set('');
		await app.modReq('chat/CreateMsg', { chatUuid: chatUuid.get(), text });
	};

	const focused = Observer.mutable(false);
	const hovered = Observer.mutable(false);

	return <div theme='column_fill_contentContainer' style={{ marginTop: 16 }}>
		<Typography type="h2" label={chatUuid.map(c => `Chat: ${c}`)} />

		<div theme='primary' style={{ marginTop: 12, height: 420, overflowY: 'auto', border: '4px solid $color', borderRadius: 8 }}>
			<MessageItem
				each:msg={app.observer.path(['sync', 'currentChat', 'messages'])}
				imageUrlForUuid={imageUrlForUuid}
				nameForUuid={nameForUuid}
			/>
		</div>

		<div theme='row_fill_center' style={{ gap: 8, marginTop: 12 }}>
			<div
				theme={[
					'row_radius_primary',
					focused.bool("focused", null),
				]}
				style={{ background: hovered.bool("$color_hover", '$color'), gap: 5, overflow: 'clip', paddingRight: 5 }}
			>
				<TextField
					type='contained'
					value={msgText}
					style={{ background: 'none', border: 'none', outline: 'none' }}
					isFocused={focused}
					isHovered={hovered}
					placeholder='type a message…'
					onKeyDown={async e => {
						if (e.key === 'Enter') {
							e.preventDefault();
							await send();
						} else if (e.key === 'Escape') {
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
	const initialId = (stage.urlProps?.id || '').trim();
	if (initialId) app.sync.currentChat.uuid = initialId;

	const chatsList = await app.modReq('chat/ListChats');
	const chatUuids = (chatsList || []).map(c => c.uuid).filter(Boolean);

	const chats = chatUuids.length
		? await app.modReq('chat/GetChats', { uuids: chatUuids })
		: [];

	// include self + everyone else
	const userUuids = [...new Set(
		chats
			.flatMap(x => x.participants || [])
			.map(p => (p ?? "").trim())
			.filter(Boolean)
	)];

	const userIndex = userUuids.length
		? await app.modReq('users/get', { uuids: userUuids })
		: [];

	const selfUuid = app.sync.state.profile.uuid;

	// These two are the key changes: use the reactive profile fields for self
	const imageUrlForUuid = (uuid) => {
		if (!uuid) return false;

		if (uuid === selfUuid) {
			const img = app.observer.path(['sync', 'state', 'profile', 'image']).get();
			return img ? `/files/${img.slice(1)}` : false;
		}

		const u = userIndex?.find?.(x => x.uuid === uuid);
		return u?.image ? `/files/${u.image.slice(1)}` : false;
	};

	const nameForUuid = (uuid) => {
		if (!uuid) return '';

		if (uuid === selfUuid) {
			return app.observer.path(['sync', 'state', 'profile', 'name']).get() || 'You';
		}

		const u = userIndex?.find?.(x => x.uuid === uuid);
		return u?.name || uuid;
	};

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
					? <CurrentChat
						chatUuid={stage.observer.path(['urlProps', 'id'])}
						imageUrlForUuid={imageUrlForUuid}
						nameForUuid={nameForUuid}
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
