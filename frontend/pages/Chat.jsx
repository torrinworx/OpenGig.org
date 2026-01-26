import { Button, TextField, Observer, Typography, StageContext, OObject, OArray } from 'destamatic-ui';
import AppContext from '../utils/appContext.js';

const MessageItem = ({ msg }) => <div style={{ padding: 8 }}>
	<Typography type="p1" label={msg?.get?.() ? msg.get().observer.path('text') : msg.observer.path('text')} />
</div>;

const CurrentChat = AppContext.use(app => ({ chatUuid }) => {
	const msgText = Observer.mutable('');

	const send = async () => {
		const text = msgText.get().trim();
		if (!text) return;
		msgText.set('');
		console.log(chatUuid);
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

const Chat = AppContext.use(app => StageContext.use(stage => () => {
	console.log(stage.urlProps)
	const user = Observer.mutable('');
	const chatUuid = app.observer.path(['sync', 'currentChat', 'uuid']);

	if (stage?.urlProps?.id) {
		chatUuid.set(stage.urlProps.id);
	}

	return <>
		<Typography label={chatUuid.map(v => v || 'no chat yet')} type="p1" />
		<TextField placeholder="user uuid" value={user} />
		<Button
			type="contained"
			label="create"
			onClick={async () => {
				const res = await app.modReq('chat/CreateChat', { participants: [user.get()] });
				chatUuid.set(res);
			}}
		/>

		<CurrentChat chatUuid={chatUuid} />
	</>;
}));

export default Chat;
