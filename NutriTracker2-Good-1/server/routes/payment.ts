import { Router } from "express";
import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY must be defined');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16'
});

const router = Router();

router.post("/create-subscription", async (req, res) => {
  try {
    const { plan, priceId } = req.body;
    console.log('Creating subscription:', { plan, priceId });

    if (!priceId) {
      return res.status(400).json({ error: 'Price ID is required' });
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      payment_method_collection: plan === 'yearly' ? 'if_required' : 'always',
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      subscription_data: {
        trial_period_days: plan === 'yearly' ? 3 : undefined,
        trial_settings: plan === 'yearly' ? {
          end_behavior: {
            missing_payment_method: 'pause'
          }
        } : undefined
      },
      success_url: `${req.headers.origin}/home?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.origin}/trial`,
      allow_promotion_codes: true,
    });

    console.log('Session created:', { sessionId: session.id, url: session.url });
    return res.json({ id: session.id, url: session.url });

  } catch (error) {
    console.error('Stripe Error:', error);
    return res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Failed to create subscription session'
    });
  }
});

export default router;