const express = require('express');
const router = express.Router();
const pool = require('../config/database');

/**
 * GET /api/pricing/config
 * Récupère toute la configuration de tarification
 */
router.get('/config', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM pricing_config ORDER BY id DESC LIMIT 1'
    );
    
    if (result.rows.length === 0) {
      // Configuration par défaut
      return res.json({
        profitMargin: 30,
        serviceCosts: {},
        rechargeOffers: [
          { id: 'basic', name: 'Essentiel', price: 50, credits: 1111, discount: 10, popular: false },
          { id: 'comfort', name: 'Confort', price: 100, credits: 2500, discount: 20, popular: true },
          { id: 'pro', name: 'Professionnel', price: 200, credits: 5714, discount: 30, popular: false },
          { id: 'expert', name: 'Expert', price: 400, credits: 13333, discount: 40, popular: false }
        ],
        monthlySubscriptionAmount: 0
      });
    }

    const config = result.rows[0];
    res.json({
      profitMargin: parseFloat(config.profit_margin),
      serviceCosts: config.service_costs,
      rechargeOffers: config.recharge_offers,
      monthlySubscriptionAmount: parseFloat(config.monthly_subscription_amount || 0)
    });
  } catch (error) {
    console.error('Erreur lors de la récupération de la config:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

/**
 * GET /api/pricing/offers
 * Récupère uniquement les offres de recharge
 */
router.get('/offers', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT recharge_offers FROM pricing_config ORDER BY id DESC LIMIT 1'
    );
    
    if (result.rows.length === 0) {
      return res.json({
        offers: [
          { id: 'basic', name: 'Essentiel', price: 50, credits: 1111, discount: 10, popular: false },
          { id: 'comfort', name: 'Confort', price: 100, credits: 2500, discount: 20, popular: true },
          { id: 'pro', name: 'Professionnel', price: 200, credits: 5714, discount: 30, popular: false },
          { id: 'expert', name: 'Expert', price: 400, credits: 13333, discount: 40, popular: false }
        ]
      });
    }

    res.json({
      offers: result.rows[0].recharge_offers || []
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des offres:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

/**
 * POST /api/pricing/save
 * Sauvegarde la configuration des prix (admin uniquement)
 */
router.post('/save', async (req, res) => {
  try {
    const { profitMargin, serviceCosts, rechargeOffers, monthlySubscriptionAmount } = req.body;

    // Vérifier si une config existe
    const existingConfig = await pool.query(
      'SELECT id FROM pricing_config ORDER BY id DESC LIMIT 1'
    );

    if (existingConfig.rows.length > 0) {
      // Mettre à jour la config existante
      await pool.query(
        `UPDATE pricing_config 
         SET profit_margin = $1, 
             service_costs = $2, 
             recharge_offers = $3,
             monthly_subscription_amount = $4,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $5`,
        [
          profitMargin,
          JSON.stringify(serviceCosts),
          JSON.stringify(rechargeOffers),
          monthlySubscriptionAmount || 0,
          existingConfig.rows[0].id
        ]
      );
    } else {
      // Créer une nouvelle config
      await pool.query(
        `INSERT INTO pricing_config (profit_margin, service_costs, recharge_offers, monthly_subscription_amount)
         VALUES ($1, $2, $3, $4)`,
        [
          profitMargin,
          JSON.stringify(serviceCosts),
          JSON.stringify(rechargeOffers),
          monthlySubscriptionAmount || 0
        ]
      );
    }

    res.json({ 
      success: true, 
      message: 'Configuration sauvegardée avec succès' 
    });
  } catch (error) {
    console.error('Erreur lors de la sauvegarde:', error);
    res.status(500).json({ error: 'Erreur lors de la sauvegarde' });
  }
});

module.exports = router;
