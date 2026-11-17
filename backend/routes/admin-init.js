import express from 'express';
import { PricingConfig } from '../models/index.sequelize.js';
import { sequelize } from '../config/sequelize.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

/**
 * Route temporaire pour initialiser la table pricing_config
 * À SUPPRIMER après utilisation
 */
router.get('/init-pricing', async (req, res) => {
  try {
    logger.info('🔧 Initialisation de pricing_config...');
    
    // Vérifier la connexion
    await sequelize.authenticate();
    logger.info('✅ Connexion DB OK');
    
    // Supprimer et recréer la table avec la bonne structure
    await PricingConfig.sync({ force: true });
    logger.info('✅ Table pricing_config recréée');
    
    // Obtenir ou créer la config par défaut
    const config = await PricingConfig.getConfig();
    logger.info('✅ Configuration initialisée');
    
    res.json({
      success: true,
      message: 'Table pricing_config initialisée avec succès',
      config: {
        profitMargin: config.profitMargin,
        servicesCount: Object.keys(config.serviceCosts).length,
        offersCount: config.rechargeOffers.length
      }
    });
    
  } catch (error) {
    logger.error('❌ Erreur initialisation pricing:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

export default router;
