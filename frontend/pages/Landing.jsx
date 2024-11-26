import { Theme, Button, Typography, Icon } from 'destamatic-ui';

import Header from '../components/Header';

Theme.define({

	iconWrapper: {
		display: 'flex',
		justifyContent: 'center',
		gap: '15px',
	},
})

export default ({ state }) => <div theme={['page', 'primary']} style={{ background: '$color' }}>
	<Header>
		<div style={{ display: 'flex', gap: '15px' }}>
			<Button
				label="Enter"
				type="contained"
				onMouseDown={() => state.client.openPage = { page: "Auth" }}
			/>
		</div>
	</Header>
	<div theme="pageSection">
		<Typography type="h1" >Join OpenGig test test test</Typography>
		<Typography type="p1">
			OpenGig.org is an Open Source Service platform built for gig workers and customers. We stand for openness, the rights of customers, and for the empowerment of workers.
		</Typography>
		<Button
			label="Join"
			type="contained"
			style={{ marginTop: '20px' }}
			onMouseDown={() => state.client.openPage = { page: "Auth" }}
		/>
	</div>
	<div theme="pageSection_inset">
		<Typography type="h2">Why work on OpenGig?</Typography>
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
	<div theme="pageSection">
		<Typography type="h2">Why spend on OpenGig?</Typography>
		<Typography type="p1">
			OpenGig is adaptable, catering to a wide spectrum of gig services—from ride-sharing and food delivery to freelance tasks. Whatever you need, we've got you covered.
		</Typography>
		<br />
		<Typography type="p1">
			Customers benefit from our Open Cost principle. You pay only for what you consume, with every cent transparently used for your service or payout—no hidden charges funding luxury yachts, failed self-driving taxi ventures, or stock bonuses for billionaires.
		</Typography>
	</div>

	<div theme="pageSection_inset_center">
		<div theme="iconWrapper">
			<Button
				Icon={<Icon size="40" libraryName="feather" iconName="github" />}
				type="icon"
				onMouseDown={() => window.open('https://github.com/torrinworx/OpenGig.org', '_blank')}
				title={"GitHub"}
			/>
			<Button
				Icon={<Icon size="40" libraryName="feather" iconName="globe" />}
				type="icon"
				onMouseDown={() => window.open('', '_blank')}
				title={"Twitter"}
			/>
			<Button
				Icon={<Icon size="40" libraryName="feather" iconName="feather" />}
				type="icon"
				onMouseDown={() => window.open('', '_blank')}
				title={"Twitter"}
			/>
		</div>
	</div>
</div>;
