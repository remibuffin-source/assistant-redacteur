import Stripe from 'stripe';

// Initialiser Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Handler Lambda
export const handler = async (event) => {
  console.log('Event reçu:', JSON.stringify(event, null, 2));
  
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, stripe-signature',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // OPTIONS pour CORS
  if (event.requestContext?.http?.method === 'OPTIONS' || event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  const method = event.requestContext?.http?.method || event.httpMethod || 'GET';
  const path = event.requestContext?.http?.path || event.path || event.rawPath || '';
  
  console.log('Method:', method, 'Path:', path);

  try {
    // Route de test (GET)
    if (method === 'GET' && path.includes('health')) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          status: 'OK',
          message: 'Serveur Stripe opérationnel (Lambda)',
          timestamp: new Date().toISOString()
        })
      };
    }

    // Créer un PaymentIntent (POST /create-payment-intent)
    if (method === 'POST' && path.includes('create-payment-intent')) {
      const body = JSON.parse(event.body || '{}');
      const { amount, userEmail } = body;

      if (!amount || amount <= 0) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Montant invalide' })
        };
      }

      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100),
        currency: 'eur',
        metadata: {
          userEmail: userEmail || 'anonymous',
          integration: 'assistant-redacteur',
          timestamp: new Date().toISOString()
        },
        description: `Recharge compte - ${amount}€`
      });

      console.log(`✅ PaymentIntent créé: ${paymentIntent.id} - ${amount}€`);

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          clientSecret: paymentIntent.client_secret,
          paymentIntentId: paymentIntent.id
        })
      };
    }

    // Vérifier le statut d'un paiement (GET /payment-status/:id)
    if (method === 'GET' && path.includes('payment-status')) {
      const pathParts = path.split('/');
      const paymentIntentId = pathParts[pathParts.length - 1];

      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          status: paymentIntent.status,
          amount: paymentIntent.amount / 100,
          currency: paymentIntent.currency,
          metadata: paymentIntent.metadata
        })
      };
    }

    // Webhook Stripe (POST /webhooks)
    if (method === 'POST' && path.includes('webhooks')) {
      const sig = event.headers['stripe-signature'] || event.headers['Stripe-Signature'];
      const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

      if (!sig || !webhookSecret) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Signature manquante' })
        };
      }

      let stripeEvent;
      try {
        // Pour Lambda, le body est déjà une string
        const rawBody = event.body;
        stripeEvent = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
      } catch (err) {
        console.error('❌ Erreur webhook signature:', err.message);
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: `Webhook Error: ${err.message}` })
        };
      }

      // Gérer les événements
      switch (stripeEvent.type) {
        case 'payment_intent.succeeded':
          const paymentIntent = stripeEvent.data.object;
          console.log('✅ Paiement réussi:', {
            id: paymentIntent.id,
            amount: paymentIntent.amount / 100,
            email: paymentIntent.metadata.userEmail
          });
          break;

        case 'payment_intent.payment_failed':
          const failedPayment = stripeEvent.data.object;
          console.log('❌ Paiement échoué:', {
            id: failedPayment.id,
            error: failedPayment.last_payment_error?.message
          });
          break;

        default:
          console.log(`ℹ️ Événement non géré: ${stripeEvent.type}`);
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ received: true })
      };
    }

    // Liste des derniers paiements (GET /payments/recent)
    if (method === 'GET' && path.includes('payments/recent')) {
      const queryParams = event.queryStringParameters || {};
      const limit = parseInt(queryParams.limit) || 10;

      const paymentIntents = await stripe.paymentIntents.list({ limit });

      const payments = paymentIntents.data.map(pi => ({
        id: pi.id,
        amount: pi.amount / 100,
        currency: pi.currency,
        status: pi.status,
        created: new Date(pi.created * 1000).toISOString(),
        userEmail: pi.metadata.userEmail
      }));

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ payments })
      };
    }

    // Route non trouvée
    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({
        error: 'Route non trouvée',
        path: path,
        method: method
      })
    };

  } catch (error) {
    console.error('❌ Erreur:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Erreur serveur',
        message: error.message
      })
    };
  }
};
