import { getCookie } from 'destam-web-core/client';
import { Button, Typography, Paper } from 'destamatic-ui';

import Header from '../components/Header';
import Footer from '../components/Footer';

const Landing = ({ state }) => {
	const cookiePresent = getCookie('webcore') || ''; // Doesn't mean cookie is valid, only present

	return <div theme='page'>
		<Header state={state}>
			<div style={{ display: 'flex', gap: '15px' }}>
				<Button
					label={cookiePresent ? 'Enter' : 'Join'}
					type="contained"
					onMouseDown={() => state.client.openPage = { name: "Auth" }}
				/>
			</div>
		</Header>
		<Paper>
			<Typography label='Join OpenGig' type="h1" />
			<Typography type="p1">
				OpenGig.org is an Open Source Service platform built for gig workers and customers. We stand for openness, the rights of customers, and for the empowerment of workers.
			</Typography>
			<Button
				label={cookiePresent ? 'Enter' : 'Join'}
				type="contained"
				style={{ marginTop: '20px' }}
				onMouseDown={() => state.client.openPage = { name: "Auth" }}
			/>
		</Paper>
		<Paper>
			<Typography type="h2" label='Why work on OpenGig?' />
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
		</Paper>
		<Paper>
			<Typography type="h2" label='Why spend on OpenGig?' />
			<Typography type="p1">
				OpenGig is adaptable, catering to a wide spectrum of gig services—from ride-sharing and food delivery to freelance tasks. Whatever you need, we've got you covered.
			</Typography>
			<br />
			<Typography type="p1">
				Customers benefit from our Open Cost principle. You pay only for what you consume, with every cent transparently used for your service or payout—no hidden charges funding luxury yachts, failed self-driving taxi ventures, or stock bonuses for billionaires.
			</Typography>
		</Paper>
		<Footer />
	</div>;
}
export default {
	authenticated: false,
	page: Landing,
};
