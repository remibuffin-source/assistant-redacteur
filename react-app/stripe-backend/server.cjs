// Serveur Backend Stripe pour Assistant Rédacteur
// Port: 3001
// Gère les paiements et les webhooks Stripe

// Charger les variables d'environnement depuis le fichier .env local
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const app = express();
const PORT = 3005;

// Middleware
app.use(cors({
  origin: ['http://localhost:3003', 'http://localhost:5173'],
  credentials: true
}));

// Pour les webhooks Stripe, on a besoin du body brut
app.use('/api/webhooks', express.raw({ type: 'application/json' }));

// Pour les autres routes, on parse le JSON
app.use(express.json());

// ============================================
// ROUTES API
// ============================================

// Route de test
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Serveur Stripe opérationnel',
    timestamp: new Date().toISOString()
  });
});

// Créer un PaymentIntent
app.post('/api/create-payment-intent', async (req, res) => {
  try {
    const { amount, userEmail } = req.body;

    // Validation
    if (!amount || amount <= 0) {
      return res.status(400).json({ 
        error: 'Montant invalide' 
      });
    }

    // Créer le PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convertir en centimes
      currency: 'eur',
      metadata: {
        userEmail: userEmail || 'anonymous',
        integration: 'assistant-redacteur',
        timestamp: new Date().toISOString()
      },
      description: `Recharge compte - ${amount}€`
    });

    console.log(`✅ PaymentIntent créé: ${paymentIntent.id} - ${amount}€`);

    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });

  } catch (error) {
    console.error('❌ Erreur création PaymentIntent:', error.message);
    res.status(500).json({ 
      error: 'Erreur lors de la création du paiement',
      details: error.message 
    });
  }
});

// Vérifier le statut d'un paiement
app.get('/api/payment-status/:paymentIntentId', async (req, res) => {
  try {
    const { paymentIntentId } = req.params;

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    res.json({
      status: paymentIntent.status,
      amount: paymentIntent.amount / 100,
      currency: paymentIntent.currency,
      metadata: paymentIntent.metadata
    });

  } catch (error) {
    console.error('❌ Erreur récupération paiement:', error.message);
    res.status(500).json({ 
      error: 'Erreur lors de la vérification du paiement',
      details: error.message 
    });
  }
});

// Webhook Stripe (pour les confirmations de paiement)
app.post('/api/webhooks', async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    // Vérifier la signature du webhook
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.error('❌ Erreur webhook signature:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Gérer les différents types d'événements
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      console.log('✅ Paiement réussi:', {
        id: paymentIntent.id,
        amount: paymentIntent.amount / 100,
        email: paymentIntent.metadata.userEmail
      });
      
      // ICI: Mettre à jour le solde de l'utilisateur dans votre base de données
      // Pour l'instant, on log juste l'événement
      
      break;

    case 'payment_intent.payment_failed':
      const failedPayment = event.data.object;
      console.log('❌ Paiement échoué:', {
        id: failedPayment.id,
        error: failedPayment.last_payment_error?.message
      });
      break;

    default:
      console.log(`ℹ️ Événement non géré: ${event.type}`);
  }

  res.json({ received: true });
});

// Liste des derniers paiements (pour l'admin)
app.get('/api/payments/recent', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    const paymentIntents = await stripe.paymentIntents.list({
      limit: limit
    });

    const payments = paymentIntents.data.map(pi => ({
      id: pi.id,
      amount: pi.amount / 100,
      currency: pi.currency,
      status: pi.status,
      created: new Date(pi.created * 1000).toISOString(),
      userEmail: pi.metadata.userEmail
    }));

    res.json({ payments });

  } catch (error) {
    console.error('❌ Erreur récupération paiements:', error.message);
    res.status(500).json({ 
      error: 'Erreur lors de la récupération des paiements',
      details: error.message 
    });
  }
});

// ============================================
// DÉMARRAGE DU SERVEUR
// ============================================

app.listen(PORT, () => {
  console.log('\n' + '='.repeat(50));
  console.log('🚀 SERVEUR STRIPE DÉMARRÉ');
  console.log('='.repeat(50));
  console.log(`📍 URL: http://localhost:${PORT}`);
  console.log(`🔐 Mode: ${process.env.NODE_ENV || 'development'}`);
  console.log(`💳 Stripe: ${process.env.STRIPE_SECRET_KEY ? 'Configuré ✅' : 'NON configuré ❌'}`);
  console.log('='.repeat(50) + '\n');
  
  if (!process.env.STRIPE_SECRET_KEY) {
    console.warn('⚠️  ATTENTION: STRIPE_SECRET_KEY non définie dans .env.local');
    console.warn('⚠️  Les paiements ne fonctionneront pas sans cette clé\n');
  }
});

// Gestion des erreurs non capturées
process.on('unhandledRejection', (error) => {
  console.error('❌ Erreur non gérée:', error);
});

module.exports = app;
