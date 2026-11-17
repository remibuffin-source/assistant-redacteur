import express from 'express';
import { PricingConfig } from '../models/index.sequelize.js';

const router = express.Router();

/**
 * GET /api/pricing/config
 * Récupère toute la configuration de tarification
 */
router.get('/config', async (req, res) => {
  try {
    const config = await PricingConfig.getConfig();
    
    // Parser les données JSON si elles sont des chaînes
    const serviceCosts = typeof config.serviceCosts === 'string' 
      ? JSON.parse(config.serviceCosts) 
      : config.serviceCosts;
    
    const rechargeOffers = typeof config.rechargeOffers === 'string'
      ? JSON.parse(config.rechargeOffers)
      : config.rechargeOffers;
    
    // Parser les données JSON pour les images
    const imageServiceCosts = typeof config.imageServiceCosts === 'string'
      ? JSON.parse(config.imageServiceCosts)
      : (config.imageServiceCosts || {});
    
    res.json({
      profitMargin: parseFloat(config.profitMargin),
      serviceCosts: serviceCosts,
      rechargeOffers: rechargeOffers,
      monthlySubscriptionAmount: parseFloat(config.monthlySubscriptionAmount),
      imageProfitMargin: parseFloat(config.imageProfitMargin) || 50,
      imageServiceCosts: imageServiceCosts,
      maxCreditsPerImage: parseFloat(config.maxCreditsPerImage) || 3
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
    
    // Parser les données JSON si c'est une chaîne
    const rechargeOffers = typeof config.rechargeOffers === 'string'
      ? JSON.parse(config.rechargeOffers)
      : config.rechargeOffers;
    
    res.json({
      offers: rechargeOffers || []
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
    const { profitMargin, serviceCosts, rechargeOffers, monthlySubscriptionAmount, imageProfitMargin, imageServiceCosts, maxCreditsPerImage } = req.body;

    await PricingConfig.updateConfig({
      profitMargin,
      serviceCosts,
      rechargeOffers,
      monthlySubscriptionAmount: monthlySubscriptionAmount || 0,
      imageProfitMargin: imageProfitMargin || 50,
      imageServiceCosts: imageServiceCosts || {},
      maxCreditsPerImage: maxCreditsPerImage || 3
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
