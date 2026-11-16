import PricingConfig from '../models/PricingConfig.js';
import { logger } from './logger.js';

/**
 * Calcule le nombre de crédits nécessaires pour une opération AI
 * Utilise les tarifs de PricingConfig + la marge bénéficiaire
 * 
 * @param {string} service - Service AI (anthropic, openai, gemini, etc.)
 * @param {string} model - Modèle spécifique
 * @param {object} tokensUsed - {input, output, total}
 * @returns {Promise<number>} - Nombre de crédits à déduire
 */
export async function calculateCredits(service, model, tokensUsed) {
  try {
    // Récupérer la configuration de tarification
    const config = await PricingConfig.getConfig();
    const profitMargin = parseFloat(config.profitMargin) || 30;
    const serviceCosts = typeof config.serviceCosts === 'string' 
      ? JSON.parse(config.serviceCosts) 
      : config.serviceCosts;
    
    // Normaliser le nom du service
    const normalizedService = service.toLowerCase()
      .replace('-mini', '')
      .replace('-pro', '')
      .replace('-haiku', '')
      .replace('-v3', '');
    
    // Récupérer la config du service
    const serviceConfig = serviceCosts[normalizedService];
    
    if (!serviceConfig) {
      logger.warn(`Service inconnu: ${service}, utilisation du coût par défaut`);
      // Coût par défaut : 0.0001 $ par token + marge
      const baseCost = tokensUsed.total * 0.0001;
      return Math.max(0.01, Math.ceil(baseCost * (1 + profitMargin / 100) * 100) / 100);
    }
    
    // Trouver le modèle exact ou similaire
    let modelConfig = serviceConfig[model];
    if (!modelConfig) {
      const modelKey = Object.keys(serviceConfig).find(key => 
        model.toLowerCase().includes(key.toLowerCase()) || 
        key.toLowerCase().includes(model.toLowerCase())
      );
      modelConfig = serviceConfig[modelKey] || Object.values(serviceConfig)[0];
    }
    
    if (!modelConfig) {
      logger.warn(`Modèle inconnu: ${model} pour ${service}, utilisation du coût par défaut`);
      const baseCost = tokensUsed.total * 0.0001;
      return Math.max(0.01, Math.ceil(baseCost * (1 + profitMargin / 100) * 100) / 100);
    }
    
    // Calculer le coût de base en dollars
    let baseCostUSD = 0;
    
    if (tokensUsed.input && tokensUsed.output && modelConfig.input && modelConfig.output) {
      // Calcul précis avec input/output séparés (coûts par 1000 tokens)
      baseCostUSD = (tokensUsed.input * modelConfig.input / 1000) + 
                    (tokensUsed.output * modelConfig.output / 1000);
    } else {
      // Fallback : utiliser le coût moyen
      const avgCost = (modelConfig.input + modelConfig.output) / 2;
      baseCostUSD = tokensUsed.total * avgCost / 1000;
    }
    
    // Appliquer la marge bénéficiaire
    const finalCostUSD = baseCostUSD * (1 + profitMargin / 100);
    
    // Convertir en crédits (1 crédit = 0.01 $)
    const credits = finalCostUSD / 0.01;
    
    // Arrondir au centième supérieur et minimum 0.01 crédit
    return Math.max(0.01, Math.ceil(credits * 100) / 100);
    
  } catch (error) {
    logger.error('Erreur calcul crédits:', error);
    // Fallback sécurisé
    return Math.max(0.01, Math.ceil(tokensUsed.total * 0.0001 * 100) / 100);
  }
}

/**
 * Estime le coût en crédits pour une génération
 * @param {string} service - Service AI
 * @param {string} model - Modèle
 * @param {number} estimatedTokens - Estimation du nombre de tokens
 * @returns {Promise<number>} - Estimation des crédits nécessaires
 */
export async function estimateCredits(service, model, estimatedTokens = 1000) {
  return calculateCredits(service, model, {
    input: Math.floor(estimatedTokens * 0.3),  // 30% input
    output: Math.floor(estimatedTokens * 0.7),  // 70% output
    total: estimatedTokens
  });
}

/**
 * Récupère les offres de recharge depuis PricingConfig
 * @returns {Promise<Array>} - Liste des offres
 */
export async function getRechargeOffers() {
  try {
    const config = await PricingConfig.getConfig();
    const offers = typeof config.rechargeOffers === 'string'
      ? JSON.parse(config.rechargeOffers)
      : config.rechargeOffers;
    
    return offers || [];
  } catch (error) {
    logger.error('Erreur récupération offres:', error);
    return [];
  }
}

/**
 * Calcule le nombre de crédits pour une génération d'image
 * @param {string} service - Service (fal, fal-tti, fal-edit)
 * @param {string} model - Modèle (seedream-v4.5-tti, seedream-v4.5-edit)
 * @param {number} imageCount - Nombre d'images générées
 * @returns {Promise<number>} - Crédits à déduire
 */
export async function calculateImageCredits(service, model, imageCount = 1, costOverride = null, skipCap = false) {
  try {
    const config = await PricingConfig.getConfig();
    const imageProfitMargin = parseFloat(config.imageProfitMargin) || 50;
    const imageServiceCosts = typeof config.imageServiceCosts === 'string'
      ? JSON.parse(config.imageServiceCosts)
      : (config.imageServiceCosts || {});
    
    // Chercher le coût du service/modèle (fal-tti, fal-edit, gemini-image)
    const serviceConfig = imageServiceCosts[service];
    
    if (!serviceConfig && costOverride === null) {
      logger.warn(`Service image inconnu: ${service}, utilisation du coût par défaut (3 crédits/image)`);
      return Math.min(imageCount * 3, Math.max(0.01, imageCount * 3));
    }
    
    // Chercher le modèle (ignoré si un coût explicite est fourni)
    let modelConfig = null;
    if (costOverride === null) {
      modelConfig = serviceConfig[model];
      if (!modelConfig) {
        // Essayer de trouver un modèle similaire
        const modelKey = Object.keys(serviceConfig).find(key => 
          model.toLowerCase().includes(key.toLowerCase()) || 
          key.toLowerCase().includes(model.toLowerCase())
        );
        modelConfig = serviceConfig[modelKey] || Object.values(serviceConfig)[0];
      }
      
      if (!modelConfig) {
        logger.warn(`Modèle image inconnu: ${model}, utilisation du coût par défaut (3 crédits/image)`);
        return Math.max(0.01, imageCount * 3);
      }
    }
    
    // Calculer le coût - PLAFONNÉ selon la config (défaut: 3 crédits par image)
    const maxCreditsPerImage = parseFloat(config.maxCreditsPerImage) || 3;
    const costPerImage = costOverride !== null ? costOverride : (modelConfig.cost || 0.04);
    const baseCostUSD = imageCount * costPerImage;
    const finalCostUSD = baseCostUSD * (1 + imageProfitMargin / 100);
    
    // Convertir en crédits (1 crédit = 0.01 $) avec plafond
    let credits = finalCostUSD / 0.01;
    const maxCredits = imageCount * maxCreditsPerImage;
    
    if (!skipCap && credits > maxCredits) {
      logger.info(`Plafonnement crédits image: ${credits.toFixed(2)} -> ${maxCredits} crédits (max ${maxCreditsPerImage}/image)`);
      credits = maxCredits;
    }
    
    logger.info(`Calcul crédits image: ${imageCount} images x ${costPerImage}$ + ${imageProfitMargin}% marge = ${credits.toFixed(2)} crédits`);
    
    return Math.max(0.01, Math.ceil(credits * 100) / 100);
    
  } catch (error) {
    logger.error('Erreur calcul crédits image:', error);
    // Fallback sécurisé : 3 crédits par image
    return Math.max(0.01, imageCount * 3);
  }
}

/**
 * Calcule le nombre de crédits pour une génération vidéo WAN 2.6
 * @param {string} model - Modèle (text-to-video, image-to-video, video-to-video)
 * @param {string} resolution - Résolution (720p, 1080p)
 * @param {number} duration - Durée en secondes (5, 10, 15)
 * @returns {Promise<number>} - Crédits à déduire
 */
export async function calculateWanVideoCredits(model, resolution, duration = 5) {
  try {
    const config = await PricingConfig.getConfig();
    const imageProfitMargin = parseFloat(config.imageProfitMargin) || 100;
    const imageServiceCosts = typeof config.imageServiceCosts === 'string'
      ? JSON.parse(config.imageServiceCosts)
      : (config.imageServiceCosts || {});
    
    // Construire la clé du modèle
    const modelKey = `${model}-${resolution}-${duration}s`;
    
    // Chercher le coût dans la config
    const wanConfig = imageServiceCosts['wan-2.6'];
    if (!wanConfig || !wanConfig[modelKey]) {
      logger.warn(`Modèle WAN 2.6 inconnu: ${modelKey}, utilisation coût par défaut`);
      return 140; // Fallback: 140 crédits (équivalent 720p 5s)
    }
    
    const costUSD = wanConfig[modelKey].cost;
    const finalCostUSD = costUSD * (1 + imageProfitMargin / 100);
    
    // Convertir en crédits (1 crédit = 0.01 $)
    const credits = finalCostUSD / 0.01;
    
    logger.info(`Calcul crédits WAN 2.6: ${modelKey} = ${costUSD}$ + ${imageProfitMargin}% marge = ${credits.toFixed(2)} crédits`);
    
    return Math.max(1, Math.ceil(credits));
    
  } catch (error) {
    logger.error('Erreur calcul crédits WAN 2.6:', error);
    return 140; // Fallback sécurisé (équivalent 720p 5s)
  }
}
