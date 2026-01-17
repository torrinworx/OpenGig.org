import { Button, Typography, StageContext, Icon, Theme } from 'destamatic-ui';
import { wsAuthed } from 'destam-web-core/client';

import Paper from '../components/Paper.jsx';

Theme.define({
	landingCards: {
		gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
		display: 'grid',
		gap: 20,
	},

	landing_list: {
		margin: 0,
		paddingLeft: 18,
		display: 'grid',
		gap: 6,
	},

	landing_callout: {
		borderRadius: 14,
		padding: 16,
		background: '$alpha($color_top, 0.03)',
		border: '1px solid $alpha($color_top, 0.10)',
		display: 'flex',
		flexDirection: 'column',
		gap: 8,
	},

	landing_row_wrap: {
		display: 'flex',
		flexWrap: 'wrap',
		alignItems: 'center',
		justifyContent: 'space-between',
		gap: 12,
	},
});

const Landing = StageContext.use(s => () => <>
	<div theme='column_fill_contentContainer'>
		<div theme='column_fill_center' style={{ gap: 40, margin: '60px 0' }}>
			<Typography label='A transparent gig platform.' type="h1_bold" style={{ textAlign: 'center', fontSize: 'clamp(2.4rem, 1.8rem + 2.6vw, 5rem)', }} />
			<Typography label='OpenGig is an open and fair gig platform where anyone can hire or work.' type="h2" style={{ textAlign: 'center' }} />
			<Button
				label={<Typography type='h2' style={{ color: 'inherit' }} label={wsAuthed.map(a => a ? 'Enter' : 'Join')} />}
				type="contained"
				style={{ borderRadius: 50, marginTop: '20px', padding: 20 }}
				iconPosition='right'
				onClick={() => s.open({ name: wsAuthed.get() ? 'home' : 'auth' })}
				icon={<Icon style={{ height: 'clamp(1.45rem, 1.2rem + 1.1vw, 1.9rem)', width: 'clamp(1.45rem, 1.2rem + 1.1vw, 1.9rem)' }} name={wsAuthed.map(a => a ? 'feather:log-in' : 'feather:arrow-right')} />}
			/>
		</div>

		<div theme="divider" />

		<Typography type="h2" label="Built for fair work and clear pricing." />
		<Typography type="p1" label="OpenGig is designed to be simple, transparent, and community-aligned. No surprises, no confusion — just a clean place to hire or work." />

		<div theme="landingCards">
			<Paper>
				<div theme="row_spread">
					<Typography type='h3_bold' theme="landing_kicker" label="FOR WORKERS" />
					<Icon name="feather:tool" size={50} />
				</div>
				<Typography type="p1_bold" label="Own your rates" />
				<Typography type="p1" label="Set pricing that makes sense for you. Keep control over your work and your payouts." />
			</Paper>

			<Paper>
				<div theme="row_spread">
					<Typography type='h3_bold' theme="landing_kicker" label="FOR CUSTOMERS" />
					<Icon name="feather:shopping-bag" size={50} />
				</div>
				<Typography type="p1_bold" label="Transparent costs" />
				<Typography type="p1" label="Know what you're paying for. Clear pricing, and a platform built around trust." />
			</Paper>

			<Paper>
				<div theme="row_spread">
					<Typography type='h3_bold' theme="landing_kicker" label="COOPERATIVE" />
					<Icon name="feather:users" size={50} />
				</div>
				<Typography type="p1_bold" label="Community-led" />
				<Typography type="p1" label="We're building toward member-driven governance — users help shape priorities and policies." />
			</Paper>

			<Paper>
				<div theme="row_spread">
					<Typography type='h3_bold' theme="landing_kicker" label="OPEN SOURCE" />
					<Icon name="feather:code" size={50} />
				</div>
				<Typography type="p1_bold" label="Auditable platform" />
				<Typography type="p1" label="The core code is public. Transparency isn't a slogan — it's a design constraint." />
			</Paper>
		</div>

		<Paper theme="landing_callout">
			<Typography type="p1_bold" label="What you can expect" />
			<ul theme="landing_list">
				<li><Typography type="p1" label={<>Workers set their own rates and terms.</>} /></li>
				<li><Typography type="p1" label={<>Customers get clear, upfront pricing.</>} /></li>
				<li><Typography type="p1" label={<>A platform built to be transparent and community-aligned.</>} /></li>
			</ul>
		</Paper>
	</div>

	{/* TODO: Bottom hero footer section. Ready to join the change? Join OpenGig today! */}

</>);

export default Landing;
