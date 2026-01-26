import { Button, TextField, Observer, Typography, StageContext, suspend } from 'destamatic-ui';
import AppContext from '../utils/appContext.js';

import Stasis from '../components/Stasis';

const MessageItem = ({ msg }) => <div style={{ padding: 8 }}>
	<Typography type="p1" label={msg?.get?.() ? msg.get().observer.path('text') : msg.observer.path('text')} />
</div>;

const CurrentChat = AppContext.use(app => ({ chatUuid }) => {
	const msgText = Observer.mutable('');

	const send = async () => {
		const text = msgText.get().trim();
		if (!text) return;
		msgText.set('');
		console.log(chatUuid.get());
		await app.modReq('chat/CreateMsg', { chatUuid: chatUuid.get(), text });
	};

	return <div theme='column_fill_contentContainer' style={{ marginTop: 16 }}>
		<Typography type="h2" label={chatUuid.map(c => `Chat: ${c}`)} />

		<div theme='primary' style={{ marginTop: 12, height: 420, overflowY: 'auto', border: '4px solid $color', borderRadius: 8 }}>
			<MessageItem each:msg={app.observer.path(['sync', 'currentChat', 'messages'])} />
		</div>

		<div theme='row_fill_center' style={{ gap: 8, marginTop: 12 }}>
			<TextField placeholder="type a message…" value={msgText} />
			<Button type="contained" label="send" onClick={send} />
		</div>
	</div>;
});

const Chat = AppContext.use(app => StageContext.use(stage => suspend(Stasis, async () => {
	const user = Observer.mutable('');
	app.sync.currentChat.uuid = stage.urlProps.id;

	const chats = await app.modReq('chat/ListChats');
	console.log(chats)

	return <>
		<Typography label={stage.observer.path(['urlProps', 'id']).map(v => v || 'no chat yet')} type="p1" />
		<TextField placeholder="user uuid" value={user} />
		<Button
			type="contained"
			label="create"
			onClick={async () => {
				const participant = user.get().trim();
				const participants = participant ? [participant] : [];

				const res = await app.modReq('chat/CreateChat', { participants });
				console.log(res)
				stage.open({ name: 'chat', urlProps: { id: res } })
			}}
		/>

		<CurrentChat chatUuid={stage.observer.path(['urlProps', 'id'])} />
	</>;
})));

export default Chat;
