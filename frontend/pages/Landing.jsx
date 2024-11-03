import { Theme, Button, Typography, Icon } from 'destamatic-ui';
import Logo from '/OpenGig.svg';

Theme.define({
	header: {
		display: 'flex',
		justifyContent: 'space-between',
		alignItems: 'center',
	},
	page: {
		padding: '40px',
		gap: '20px',
		display: 'flex',
		flexDirection: 'column',
		backgroundColor: '#FFFFFF',
		height: '100vw'
	},
	pageSection: {
		extends: ['secondary', 'radius'],
		backgroundColor: '$color',
		padding: '20px',
		color: '$color_top',
	},
	pageSection_inset: {
		extends: ['secondary', 'radius'],
		padding: '20px',
		color: '$color',
		backgroundColor: '#FFFFFF',
	},
	pageSection_centered: {
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center',
		flexDirection: 'column',
	},
	iconWrapper: {
		display: 'flex',
		justifyContent: 'center',
		gap: '15px',
	},
})

const Header = ({ state }) => <span theme="header">
	<img src={Logo} style={{ height: '75px', userSelect: 'none' }} />
	<div style={{ display: 'flex', gap: '15px' }}>
		<Button
			label="Signup or Login"
			type="contained"
			onMouseDown={() => state.sync.observer.path('currentRoute').set('/home')}
		/>
	</div>
</span>;

export default ({ state }) => <div theme="page">
	<Header state={state} />
	<div theme="pageSection">
		<Typography type="h1" >Join OpenGig</Typography>
		<Typography type="p1">
			OpenGig.org is an Open Source Service platform built for gig workers and customers. We stand for openness, the rights of customers, and for the empowerment of workers.
		</Typography>
		<Button
			label="Join"
			type="contained"
			style={{ marginTop: '20px' }}
			onMouseDown={() => state.sync.observer.path('currentRoute').set('/home')}
		/>
	</div>
	<div theme="pageSection_inset">
		<Typography type="h2">Why work on OpenGig?</Typography>
		<Typography type="p1">
			Our platform empowers gig workers by removing the greedy middlemen. OpenGig allows you to dictate your own terms by providing tools built for you.
			<ul>
				<li><Typography type="p1">Set your own rates and earn a fair share.</Typography></li>
				<li><Typography type="p1">Use transparent, open-source pricing algorithms that suggest fair prices based on real data.</Typography></li>
				<li><Typography type="p1">Enjoy at-cost fees; you pay only for what you use—nothing goes to executive golden parachutes or vanity projects.</Typography></li>
				<li><Typography type="p1">Gain insights into market trends through our Open Statistics accessible to everyone.</Typography></li>
				<li><Typography type="p1">Join a community-directed platform focused on development and improvement.</Typography></li>
			</ul>
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

	<div theme="pageSection_inset_centered">
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
