import Stripe from 'stripe';
import { OArray } from "destam";
import { coreServer } from "destam-web-core/server";

let stripe;
try {
	if (!process.env.STRIPE_SECRET_KEY) {
		console.warn('No STRIPE_SECRET_KEY provided. Skipping Stripe initialization.');
	} else {
		stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
		console.log('Stripe initialized successfully.');
	}
} catch (error) {
	console.error('Failed to initialize Stripe. Continuing without it:', error);
	stripe = null;
}

const connection = async (ws, req, user, sync) => {
	// server side definition of notifications so we can push notifications directly
	// to the client.
	sync.notifications = OArray([]);
	return; // params returned here are fed automatically into all jobs if authenticated (I think)
};

const onEnter = async ({ email, user }) => {
	if (!stripe) {
		console.warn('Stripe is unavailable. Skipping customer creation.');
		return;
	}
	try {
		const result = await stripe.customers.create({ email });
		user.stripeID = result.id;
	} catch (error) {
		console.error('Failed to create Stripe customer:', error);
	}
};

coreServer(
	'./backend/jobs',
	process.env.ENV === 'production' ? './dist' : './frontend',
	connection,
	{ stripe },
	onEnter
);
