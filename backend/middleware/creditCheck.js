import User from '../models/User.js';
import { estimateCredits } from '../config/creditCosts.js';
import { logger } from '../utils/logger.js';

/**
 * Middleware pour vérifier que l'utilisateur a suffisamment de crédits
 * avant d'effectuer une opération AI
 */
export async function checkCredits(req, res, next) {
  try {
    // Récupérer l'utilisateur
    const userId = req.user.id || req.user.email;
    const user = await User.findOne({ 
      $or: [{ _id: userId }, { email: userId }] 
    });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    // Estimer le coût de l'opération
    const service = req.body.service || req.body.model || 'anthropic';
    const model = req.body.model || 'claude-3-sonnet-20240229';
    const estimatedTokens = req.body.estimatedTokens || 2000; // Estimation par défaut
    
    const estimatedCost = estimateCredits(service, model, estimatedTokens);
    
    // Vérifier si l'utilisateur a assez de crédits
    if (!user.hasEnoughCredits(estimatedCost)) {
      logger.warn(`Insufficient credits for user ${userId}: ${user.credits.balance} < ${estimatedCost}`);
      
      return res.status(402).json({
        success: false,
        error: 'Insufficient credits',
        required: estimatedCost,
        available: user.credits.balance,
        message: `Vous avez besoin de ${estimatedCost} crédits mais vous n'en avez que ${user.credits.balance}. Rechargez votre compte pour continuer.`
      });
    }
    
    // Ajouter les informations au request pour utilisation ultérieure
    req.user.fullUser = user;
    req.estimatedCost = estimatedCost;
    
    logger.info(`Credit check passed for user ${userId}: ${user.credits.balance} >= ${estimatedCost}`);
    
    next();
  } catch (error) {
    logger.error('Error in credit check middleware:', error);
    return res.status(500).json({
      success: false,
      error: 'Error checking credits',
      message: error.message
    });
  }
}

/**
 * Middleware optionnel qui avertit l'utilisateur si ses crédits sont faibles
 * mais laisse passer la requête
 */
export async function warnLowCredits(req, res, next) {
  try {
    const userId = req.user.id || req.user.email;
    const user = await User.findOne({ 
      $or: [{ _id: userId }, { email: userId }] 
    });
    
    if (user && user.credits.balance < 50) {
      res.set('X-Low-Credits-Warning', 'true');
      res.set('X-Credits-Balance', user.credits.balance.toString());
      logger.warn(`Low credits warning for user ${userId}: ${user.credits.balance} credits remaining`);
    }
    
    next();
  } catch (error) {
    // Ne pas bloquer la requête en cas d'erreur
    logger.error('Error in low credits warning:', error);
    next();
  }
}

/**
 * Fonction utilitaire pour déduire les crédits après une opération réussie
 * À appeler dans les controllers après l'appel AI
 */
export async function deductCreditsAfterUsage(userId, service, model, tokensUsed, metadata = {}) {
  try {
    const user = await User.findOne({ 
      $or: [{ _id: userId }, { email: userId }] 
    });
    
    if (!user) {
      throw new Error('User not found');
    }
    
    // Importer dynamiquement pour éviter les dépendances circulaires
    const { calculateCredits } = await import('../config/creditCosts.js');
    const creditsToDeduct = calculateCredits(service, model, tokensUsed);
    
    // Déduire les crédits
    const description = `${service} - ${model} (${tokensUsed.total} tokens)`;
    user.deductCredits(creditsToDeduct, description, metadata.articleId || metadata.operationId);
    
    await user.save();
    
    logger.info(`Deducted ${creditsToDeduct} credits from user ${userId}. New balance: ${user.credits.balance}`);
    
    return {
      creditsDeducted: creditsToDeduct,
      newBalance: user.credits.balance
    };
  } catch (error) {
    logger.error('Error deducting credits:', error);
    throw error;
  }
}
