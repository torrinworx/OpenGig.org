export default () => {
	return {
		authenticated: true,
		init:  async ({ user, paymentMethodId, stripe }) => {
			// console.log("THIS IS HAPPENING")
			try {
				// Attach the payment method to the customer
				await stripe.paymentMethods.attach(paymentMethodId, {
					customer: user.stripeID,
				});
				
				// Optionally, set it as the default payment method
				await stripe.customers.update(user.stripeID, {
					invoice_settings: {
						default_payment_method: paymentMethodId,
					},
				});
			} catch (error) {
				console.error('Failed to attach payment method:', error);
				return error
			}
		},
	};
};
