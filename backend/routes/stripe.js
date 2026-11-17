// Routes Stripe pour Assistant Rédacteur
// Gestion des paiements et webhooks Stripe

import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import Stripe from 'stripe';
import { logger } from '../utils/logger.js';
import { User } from '../models/index.sequelize.js';
import { getRechargeOffers } from '../utils/creditCalculator.js';
import { Op } from 'sequelize';

const router = express.Router();

// Initialiser Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

/**
 * @route   GET /stripe/health
 * @desc    Vérifier le statut du service Stripe
 * @access  Public
 */
router.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Service Stripe opérationnel',
    timestamp: new Date().toISOString(),
    configured: !!process.env.STRIPE_SECRET_KEY
  });
});

/**
 * @route   POST /stripe/create-payment-intent
 * @desc    Créer un PaymentIntent Stripe
 * @access  Public (devrait être protégé avec authenticateToken en production)
 */
router.post('/create-payment-intent', async (req, res) => {
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

    logger.info(`✅ PaymentIntent créé: ${paymentIntent.id} - ${amount}€ pour ${userEmail}`);

    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });

  } catch (error) {
    logger.error('❌ Erreur création PaymentIntent:', error.message);
    res.status(500).json({ 
      error: 'Erreur lors de la création du paiement',
      details: error.message 
    });
  }
});

/**
 * @route   GET /stripe/payment-status/:paymentIntentId
 * @desc    Vérifier le statut d'un paiement
 * @access  Public (devrait être protégé avec authenticateToken en production)
 */
router.get('/payment-status/:paymentIntentId', async (req, res) => {
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
    logger.error('❌ Erreur récupération paiement:', error.message);
    res.status(500).json({ 
      error: 'Erreur lors de la vérification du paiement',
      details: error.message 
    });
  }
});

/**
 * @route   POST /stripe/webhooks
 * @desc    Recevoir les événements Stripe (webhooks)
 * @access  Public (vérifié par signature Stripe)
 */
router.post('/webhooks', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    // Vérifier la signature du webhook
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    logger.error('❌ Erreur webhook signature:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Gérer les différents types d'événements
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      const amountPaid = paymentIntent.amount / 100; // Convertir en euros
      const userEmail = paymentIntent.metadata.userEmail;
      
      logger.info('✅ Paiement réussi:', {
        id: paymentIntent.id,
        amount: amountPaid,
        email: userEmail
      });
      
      try {
        // Trouver l'utilisateur
        const user = await User.findOne({ 
          where: {
            [Op.or]: [
              { email: userEmail },
              { id: userEmail }
            ]
          }
        });
        
        if (!user) {
          logger.error(`❌ Utilisateur non trouvé pour le paiement: ${userEmail}`);
          break;
        }
        
        // Trouver l'offre correspondante au montant payé
        const offers = await getRechargeOffers();
        const offer = offers.find(o => o.price === amountPaid);
        const creditsToAdd = offer ? offer.credits : Math.floor(amountPaid * 20); // 20 crédits par euro par défaut
        
        // Ajouter les crédits
        await user.addCredits(
          creditsToAdd,
          'purchase',
          `Recharge Stripe - ${amountPaid}€`,
          {
            paymentIntentId: paymentIntent.id,
            stripePaymentId: paymentIntent.id,
            amount: amountPaid,
            offer: offer?.name || 'Custom'
          }
        );
        
        logger.info(`✅ ${creditsToAdd} crédits ajoutés à ${userEmail}. Nouveau solde: ${user.creditsBalance}`);
      } catch (error) {
        logger.error('❌ Erreur lors de l\'ajout des crédits:', error);
      }
      
      break;

    case 'payment_intent.payment_failed':
      const failedPayment = event.data.object;
      logger.error('❌ Paiement échoué:', {
        id: failedPayment.id,
        error: failedPayment.last_payment_error?.message
      });
      break;

    default:
      logger.info(`ℹ️ Événement Stripe non géré: ${event.type}`);
  }

  res.json({ received: true });
});

/**
 * @route   GET /stripe/payments/recent
 * @desc    Liste des derniers paiements (admin)
 * @access  Private (Admin) - TODO: ajouter authenticateToken + isAdmin
 */
router.get('/payments/recent', async (req, res) => {
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
    logger.error('❌ Erreur récupération paiements:', error.message);
    res.status(500).json({ 
      error: 'Erreur lors de la récupération des paiements',
      details: error.message 
    });
  }
});

export default router;
