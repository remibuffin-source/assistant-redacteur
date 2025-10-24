// src/utils/stripe.js
import { loadStripe } from '@stripe/stripe-js';

// Charger la clé publique Stripe depuis les variables d'environnement
const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

if (!stripePublishableKey) {
  console.error('⚠️ VITE_STRIPE_PUBLISHABLE_KEY non définie dans .env.local');
}

export const stripePromise = loadStripe(stripePublishableKey);
