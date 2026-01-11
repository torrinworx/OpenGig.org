import { Button, Typography, StageContext } from 'destamatic-ui';
import { getCookie } from 'destam-web-core/client';

import LogoLightMode from '/branding/OpenGig_Logo_Light_Mode.svg';
import LogoDarkMode from '/branding/OpenGig_Logo_Dark_Mode.svg';

const Landing = StageContext.use(s => () => {
	const cookiePresent = getCookie('webcore') || '';

	return <>
		<div theme='row_center_fill_contentContainer'>
			<img
				src={window.themeMode.map(t => t === false ? LogoLightMode : LogoDarkMode)}
				style={{
					width: '20vw',
					maxWidth: 440,
					minWidth: 220,
					height: 'auto',
					objectFit: 'cover',
					display: 'block',
				}}
			/>
		</div>

		<div theme='column_fill_contentContainer'>
			<div theme='row_spread_wrap'>
				<Typography label='Join' type="h1" />
				<Button
					label={cookiePresent ? 'Enter' : 'Join'}
					type="contained"
					style={{ marginTop: '20px' }}
					onClick={() => s.open({ name: 'auth' })}
				/>
			</div>
			<div theme='divider' />
			<Typography type="p1">
				OpenGig is a transparent gig platform. Anyone can hire or work. Pricing and fees are transparent.
			</Typography>

			<ul theme='primary' style={{ color: '$color' }}>
				<li key={0}>
					<Typography label={<>Workers <b>set their own rates</b>.</>} type='p1' />
				</li>
				<li key={1}>
					<Typography label={<>Customers get <b>clear pricing</b>.</>} type='p1' />
				</li>
				<li key={2}>
					<Typography label={<><b>Open source</b> and <b>community run.</b></>} type='p1' />
				</li>
			</ul>

			<Typography label='Goodbye:' type='p1_bold' />

			<ul theme='primary' style={{ color: '$color' }}>
				<li><Typography label={<><s>Surprise fees</s></>} type='p1' /></li>
				<li><Typography label={<><s>Surge / markup pricing</s></>} type='p1' /></li>
				<li><Typography label={<><s>Unclear payouts</s></>} type='p1' /></li>
				<li><Typography label={<><s>Dark patterns</s></>} type='p1' /></li>
			</ul>

		</div>

		<div theme='column_fill_contentContainer'>
			<Typography type="h2" label='Why spend on OpenGig?' />
			<div theme='divider' />
			<Typography type="p1">
				OpenGig is adaptable, catering to a wide spectrum of gig services—from ride-sharing and food delivery to freelance tasks. Whatever you need, we've got you covered.
			</Typography>
			<br />
			<Typography type="p1">
				Customers benefit from our Open Cost principle. You pay only for what you consume, with every cent transparently used for your service or payout—no hidden charges funding luxury yachts, failed self-driving taxi ventures, or stock bonuses for billionaires.
			</Typography>
		</div>

		<div theme='column_fill_contentContainer'>
			<Typography type="h2" label='Why work on OpenGig?' />
			<div theme='divider' />
			<Typography type="p1">
				Our platform empowers gig workers by removing the greedy middlemen. OpenGig allows you to dictate your own terms by providing tools built for you.
			</Typography>
			<Typography type="p1">
				<ul>
					<li><Typography type="p1">Set your own rates and earn a fair share.</Typography></li>
					<li><Typography type="p1">Use transparent, open-source pricing algorithms that suggest fair prices based on real data.</Typography></li>
					<li><Typography type="p1">Enjoy at-cost fees; you pay only for what you use—nothing goes to executive golden parachutes or vanity projects.</Typography></li>
					<li><Typography type="p1">Gain insights into market trends through our Open Statistics accessible to everyone.</Typography></li>
					<li><Typography type="p1">Join a community-directed platform focused on development and improvement.</Typography></li>
				</ul>
			</Typography>
			<Typography type="p1">
				Gig workers benefit from our Open Source principle; OpenGig is entirely open source, providing everyone with equal access to its core. Nothing is hidden, and there's no secret algorithm to manipulate your labor.
			</Typography>
		</div>


		{/* TODO: Bottom hero footer section. Ready to join the change? Join OpenGig today! */}

	</>;
});

export default Landing;
