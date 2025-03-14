export default () => {
	return {
		authenticated: true,
		onMsg: async ({ user, stripe }) => {
			try {
				// Check that stripe customer exists
				if (!user.stripeID) {
					const result = await stripe.customers.create({
						email: user.email,
					});
					user.stripeID = result.id;
				}

				// Create a SetupIntent
				const setupIntent = await stripe.setupIntents.create({
					customer: user.stripeID,
					usage: 'off_session',
				});

				return setupIntent.client_secret;
			} catch (error) {
				console.error('Setup Intent creation failed:', error);
				throw error;
			}
		}
	};
};
