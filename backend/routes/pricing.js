const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');

// Fichier de configuration des prix (à créer)
const PRICING_CONFIG_FILE = path.join(__dirname, '../config/pricing.json');

/**
 * GET /api/pricing/offers
 * Récupère les offres de recharge configurées par l'admin
 */
router.get('/offers', async (req, res) => {
  try {
    // Charger la configuration depuis le fichier
    const configExists = await fs.access(PRICING_CONFIG_FILE).then(() => true).catch(() => false);
    
    if (!configExists) {
      // Configuration par défaut si le fichier n'existe pas
      return res.json({
        offers: [
          { id: 'basic', name: 'Essentiel', price: 50, credits: 1111, discount: 10, popular: false },
          { id: 'comfort', name: 'Confort', price: 100, credits: 2500, discount: 20, popular: true },
          { id: 'pro', name: 'Professionnel', price: 200, credits: 5714, discount: 30, popular: false },
          { id: 'expert', name: 'Expert', price: 400, credits: 13333, discount: 40, popular: false }
        ]
      });
    }

    const configData = await fs.readFile(PRICING_CONFIG_FILE, 'utf8');
    const config = JSON.parse(configData);
    
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
    const { profitMargin, serviceCosts, rechargeOffers } = req.body;

    // Créer le dossier config s'il n'existe pas
    const configDir = path.dirname(PRICING_CONFIG_FILE);
    await fs.mkdir(configDir, { recursive: true });

    // Sauvegarder la configuration
    const config = {
      profitMargin,
      serviceCosts,
      rechargeOffers,
      lastUpdated: new Date().toISOString()
    };

    await fs.writeFile(PRICING_CONFIG_FILE, JSON.stringify(config, null, 2), 'utf8');

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
