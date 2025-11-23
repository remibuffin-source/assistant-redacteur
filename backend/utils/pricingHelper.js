const pool = require('../config/database');

/**
 * Récupère la marge bénéficiaire depuis la DB
 * @returns {Promise<number>} Marge en pourcentage
 */
async function getProfitMargin() {
  try {
    const result = await pool.query(
      'SELECT profit_margin FROM pricing_config ORDER BY id DESC LIMIT 1'
    );
    
    if (result.rows.length === 0) {
      return 30; // Marge par défaut 30%
    }
    
    return parseFloat(result.rows[0].profit_margin);
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
    const result = await pool.query(
      'SELECT service_costs FROM pricing_config ORDER BY id DESC LIMIT 1'
    );
    
    if (result.rows.length === 0) {
      return {};
    }
    
    return result.rows[0].service_costs || {};
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

module.exports = {
  getProfitMargin,
  getServiceCosts,
  calculateSellingPrice
};
