import { StageContext, suspend, LoadingDots, Typography, Button, Icon } from 'destamatic-ui';

import { modReq } from 'destam-web-core/client';

const Gig = StageContext.use(stage => suspend(LoadingDots, async () => {
	const gig = await modReq('gigs/Get', { uuid: stage.observer.path('urlProps').get().id })
	const user = await modReq('users/get', { uuid: gig.user });

	const Tag = ({ each }) => {
		return <div theme='radius_primary' style={{ background: '$color', padding: 10 }}>
			<Typography type='p1_bold' style={{ color: '$color_background' }} label={each.charAt(0).toUpperCase() + each.slice(1)} />
		</div>;
	};

	return <div theme='column_fill_contentContainer' style={{ gap: 10 }} >
		<div theme='column_fill_start'>
			<Typography type='h1' label={gig.name} />
			<div theme='row_fill_spread' style={{ gap: 10 }}>
				<Button type='text' label={user.name} iconPosition='left' icon={<Icon name='feather:user' />} />
				<div theme='radius_primary' style={{ background: '$color', padding: 10 }}>
					<Typography type='p1_bold' style={{ color: '$color_background' }} label={gig.type.charAt(0).toUpperCase() + gig.type.slice(1)} />
				</div>
			</div>
		</div>
		<div theme='divider' />
		<Typography type='p1' label={gig.description} />
		<Typography type='h2' label='Tags' />
		<div theme='divider' />
		<div theme='row_fill_wrap'>
			<Tag each={gig.tags} />
		</div>
	</div>;
}));

export default Gig;
