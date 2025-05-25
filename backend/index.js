import path from 'path';
import { fileURLToPath } from 'url';

import Stripe from 'stripe';
import { core } from "destam-web-core/server";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let stripe;
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
try {
	if (STRIPE_SECRET_KEY) {
		stripe = new Stripe(STRIPE_SECRET_KEY);
	}
} catch (error) {
	console.error('Failed to initialize Stripe. Continuing without it:', error);
	stripe = null;
}

const onCon = async (ws, req, user, sync) => {
	console.log('user in onCon: ', user);
	// server side definition of notifications so we can push notifications directly
	// to the client.
	// console.log('sync server side: ', sync);
	// sync.notifications = OArray([]);
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

const root = path.resolve(__dirname, process.env.NODE_ENV === 'production' ? '../dist' : './frontend');
const modulesDir = path.resolve(__dirname, './modules');

core({
	modulesDir,
	root,
	onCon,
	onEnter,
	props: { stripe },
});
