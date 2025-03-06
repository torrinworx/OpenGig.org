export default () => {
  return {
    authenticated: true,
    init: async ({ user, amount, currency, paymentMethod, stripe }) => {
      const customerStripeID = user.stripeID;
    
      const result = await stripe.paymentIntents.create({
        amount,
        currency,
        payment_method: paymentMethod,
        payment_method_types: ['card'],
        confirmation_method: 'automatic',
        confirm: true,
      });

      console.log(result);

      return {
        success: true,
        paymentIntentId: result.id // Use result.id here
      };
    },
  };
};
