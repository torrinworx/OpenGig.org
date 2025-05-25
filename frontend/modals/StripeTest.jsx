import { Button } from 'destamatic-ui';
import { loadStripe } from '@stripe/stripe-js';
import { modReq } from 'destam-web-core/client';

export default (props, cleanup, mounted) => {
	let stripe, cardElement;

	// runs after the <div id="card-element"/> is in the DOM
	mounted(async () => {
		stripe = await loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);
		const elements = stripe.elements();
		cardElement = elements.create('card', { style: {} });
		cardElement.mount('#card-element');
	});

	const handleSetup = async () => {
		try {
			// Request a SetupIntent from the server
			const clientSecret = await modReq({ name: 'stripe/createPaymentMethod' });

			if (!clientSecret) {
				console.log('No client_secret returned from server');
				return;
			}

			// Confirm the SetupIntent using the cardElement
			const { setupIntent, error } = await stripe.confirmCardSetup(clientSecret, {
				payment_method: {
					card: cardElement,
				},
			});

			if (error) {
				console.error('ConfirmCardSetup error:', error);
				return;
			}

			console.log('Setup complete! PaymentMethod:', setupIntent.payment_method);

			// Attach the payment method to the customer on the server
			const attachResponse = await modReq({
				name: 'stripe/attachPaymentMethod',
				props: { paymentMethodId: setupIntent.payment_method }
			});

			if (attachResponse.error) {
				console.error('Error attaching payment method:', attachResponse.error);
				return;
			}

			console.log('Payment method attached successfully');
		} catch (err) {
			console.error('Setup error:', err);
		}
	};

	return <div style="padding: 20px;">
		<div theme='radius' id="card-element" style="padding: 10px; background: white; margin: 10px"></div>

		<Button
			type="contained"
			onMouseDown={handleSetup}
			label="Setup Payment Method"
		/>
	</div>;
};