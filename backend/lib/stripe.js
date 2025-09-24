import stripe from 'stripe';

export const Stripe = stripe(process.env.STRIPE_SECRET_KEY);