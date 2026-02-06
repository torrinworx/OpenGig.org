import { StageContext, suspend, Typography, Button, Icon, TextArea, Observer, Shown } from 'destamatic-ui';

import { modReq } from 'destam-web-core/client';

import NotFound from './NotFound.jsx'
import Stasis from '../components/Stasis.jsx';
import AppContext from '../utils/appContext.js';

const Gig = AppContext.use(app => StageContext.use(stage => suspend(Stasis, async () => {
	const gig = await modReq('gigs/Get', { uuid: stage.observer.path('urlProps').get().id })
	if (gig.error) return NotFound;

	console.log("THIS IS THE GIG USER: ", gig.user);
	const user = await modReq('users/get', { uuid: gig.user });
	console.log("THIS IS THE USER: ", user);

	const Tag = ({ each }) => {
		return <div theme='radius_primary' style={{ background: '$color', padding: 10 }}>
			<Typography type='p1_bold' style={{ color: '$color_background' }} label={each.charAt(0).toUpperCase() + each.slice(1)} />
		</div>;
	};

	const msgText = Observer.mutable(gig.type === 'offer'
		? 'Hi there! Could I get a quote for this gig?'
		: 'Hi there! I can offer my services, would you like a quote?'
	);

	const send = async () => {
		if (!app?.sync?.state?.profile?.id) {
			stage.open({ name: 'auth' });
			return;
		}

		const res = await app.modReq('chat/CreateChat', { participants: [gig.user] });

		const text = msgText.get().trim();
		if (text) {
			await app.modReq('chat/CreateMsg', { chatUuid: res, text });
		}

		stage.open({ name: 'chat', urlProps: { id: res } });
	};

	return <div theme='column_fill_contentContainer' style={{ gap: 10 }} >
		<div theme='column_fill_start'>
			<Typography type='h1' label={gig.name} />
			<div theme='row_fill_spread' style={{ gap: 10 }}>
				<Button type='text' label={user?.name ? user.name : 'Unknown'} iconPosition='left' icon={<Icon name='feather:user' />} onClick={() => stage.open({ name: 'user', urlProps: { id: gig.user } })} />
				<div theme='radius_primary' style={{ background: '$color', padding: 10 }}>
					<Typography type='p1_bold' style={{ color: '$color_background' }} label={gig.type.charAt(0).toUpperCase() + gig.type.slice(1)} />
				</div>
			</div>
		</div>

		<Shown value={app?.sync?.state?.profile?.id != gig.user}>
			<div theme='column_fill_contentContainer' style={{ marginTop: 12, gap: 8 }}>
				<Typography type='h2' label={gig.type === 'offer'
					? 'Need a quote for this gig offer?'
					: 'Can you fullfill this gig request?'} />
				<TextArea type='outlined' maxHeight='200' style={{ height: 200 }} value={msgText} placeholder='Message' />
				<div theme='row_fill_center' style={{ gap: 8, marginTop: 12 }}>
					<Button
						type='contained'
						label='Send'
						iconPosition='right'
						icon={<Icon name='feather:send' />}
						onClick={send}
					/>
				</div>
			</div>
		</Shown>
		<div theme='divider' />
		<Typography type='p1' label={gig.description} />
		<Typography type='h2' label='Tags' />
		<div theme='divider' />
		<div theme='row_fill_wrap'>
			<Tag each={gig.tags} />
		</div>

		<img src={`/files/${gig?.image?.slice(1)}`} />
	</div>;
})));

export default Gig;
