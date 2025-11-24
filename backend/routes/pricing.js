import express from 'express';
import PricingConfig from '../models/PricingConfig.js';

const router = express.Router();

/**
 * GET /api/pricing/config
 * Récupère toute la configuration de tarification
 */
router.get('/config', async (req, res) => {
  try {
    const config = await PricingConfig.getConfig();
    
    res.json({
      profitMargin: config.profitMargin,
      serviceCosts: Object.fromEntries(config.serviceCosts),
      rechargeOffers: config.rechargeOffers,
      monthlySubscriptionAmount: config.monthlySubscriptionAmount
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
    const config = await PricingConfig.getConfig();
    
    res.json({
      offers: config.rechargeOffers || []
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

    await PricingConfig.updateConfig({
      profitMargin,
      serviceCosts,
      rechargeOffers,
      monthlySubscriptionAmount: monthlySubscriptionAmount || 0
    });

    res.json({ 
      success: true, 
      message: 'Configuration sauvegardée avec succès' 
    });
  } catch (error) {
    console.error('Erreur lors de la sauvegarde:', error);
    res.status(500).json({ error: 'Erreur lors de la sauvegarde' });
  }
});

export default router;
