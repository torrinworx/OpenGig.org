import Stripe from 'stripe';
import { OArray } from "destam";
import { coreServer } from "destam-web-core/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const connection = async (ws, req, user, sync) => {
	// server side definition of notifications so we can push notifications directly
	// to the client.
	sync.notifications = OArray([]);

	return;
};

const onEnter = async ({ email, user }) => {
	const result = await stripe.customers.create({ email });
	user.stripeID = result.id
}; // on completed user sign up do this.

coreServer(
	'./backend/jobs',
	process.env.ENV === 'production' ? './dist' : './frontend',
	connection,
	{ stripe },
	onEnter
);
