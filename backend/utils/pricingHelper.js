import PricingConfig from '../models/PricingConfig.js';

/**
 * Récupère la marge bénéficiaire depuis la DB
 * @returns {Promise<number>} Marge en pourcentage
 */
async function getProfitMargin() {
  try {
    const config = await PricingConfig.getConfig();
    return config.profitMargin || 30;
  } catch (error) {
    console.error('Erreur récupération marge:', error);
    return 30; // Fallback
  }
}

/**
 * Récupère les coûts des services AI depuis la DB
 * @returns {Promise<Object>} Coûts par service et modèle
 */
async function getServiceCosts() {
  try {
    const config = await PricingConfig.getConfig();
    return Object.fromEntries(config.serviceCosts) || {};
  } catch (error) {
    console.error('Erreur récupération coûts:', error);
    return {};
  }
}

/**
 * Calcule le prix de vente d'un token avec la marge
 * @param {number} baseCost - Coût de base du token
 * @param {number} profitMargin - Marge en pourcentage (optionnel, sinon récupéré de la DB)
 * @returns {Promise<number>} Prix de vente
 */
async function calculateSellingPrice(baseCost, profitMargin = null) {
  if (profitMargin === null) {
    profitMargin = await getProfitMargin();
  }
  
  return baseCost * (1 + profitMargin / 100);
}

export {
  getProfitMargin,
  getServiceCosts,
  calculateSellingPrice
};
