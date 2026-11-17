import { User, CreditHistory } from '../models/index.sequelize.js';
import { logger } from '../utils/logger.js';

/**
 * Middleware pour gérer le mode gratuit
 * Active le mode gratuit si :
 * - L'utilisateur n'est pas connecté
 * - L'utilisateur n'a pas de crédits
 */
export const checkFreeMode = async (req, res, next) => {
  try {
    // Logs détaillés pour debug
    logger.info('🔍 [checkFreeMode] Début vérification:', {
      hasUser: !!req.user,
      userId: req.user?.id,
      userRole: req.user?.role,
      userEmail: req.user?.email
    });

    // Si pas de token, mode gratuit activé
    if (!req.user || !req.user.id) {
      req.freeMode = true;
      req.freeModeReason = 'not_authenticated';
      logger.info('🆓 Mode gratuit activé : utilisateur non connecté');
      return next();
    }

    const userId = req.user.id || req.user.userId;

    // Vérifier les crédits de l'utilisateur
    const user = await User.findOne({
      where: { id: userId }
    });

    logger.info('🔍 [checkFreeMode] Utilisateur trouvé:', {
      found: !!user,
      userId,
      creditsBalance: user?.creditsBalance,
      role: user?.role
    });

    // Si pas de crédits (< 1 crédit)
    if (!user || user.creditsBalance < 1) {
      req.freeMode = true;
      req.freeModeReason = 'insufficient_credits';
      req.userId = userId; // Garder l'ID pour les stats
      logger.info(`🆓 Mode gratuit activé pour user ${userId} : crédits insuffisants (${user?.creditsBalance || 0})`);
      return next();
    }

    // Mode normal : utilisateur connecté avec crédits
    req.freeMode = false;
    req.userId = userId;
    logger.info(`✅ Mode normal activé pour user ${userId} : ${user.creditsBalance} crédits`);
    next();

  } catch (error) {
    logger.error('Erreur checkFreeMode:', error);
    // En cas d'erreur, activer le mode gratuit par sécurité
    req.freeMode = true;
    req.freeModeReason = 'error';
    next();
  }
};

/**
 * Middleware pour limiter les requêtes en mode gratuit
 * Limite : 10 requêtes par utilisateur par mois
 */
const freeModeStats = new Map(); // user-id -> { count, resetTime }

export const rateLimitFreeMode = async (req, res, next) => {
  if (!req.freeMode) {
    return next(); // Pas en mode gratuit, pas de limite
  }

  const userId = req.userId || (req.user?.id || req.user?.userId);
  
  if (!userId) {
    return res.status(401).json({
      success: false,
      error: 'Connexion requise',
      message: 'Vous devez être connecté pour utiliser le mode gratuit. Créez un compte pour bénéficier de 10 générations gratuites par mois !'
    });
  }

  const now = Date.now();
  const oneMonthMs = 30 * 24 * 60 * 60 * 1000; // 30 jours

  // Nettoyer les anciennes entrées (> 30 jours)
  for (const [key, value] of freeModeStats.entries()) {
    if (now - value.resetTime > oneMonthMs) {
      freeModeStats.delete(key);
    }
  }

  // Récupérer ou créer les stats pour cet utilisateur
  let userStats = freeModeStats.get(`user-${userId}`);
  if (!userStats || now - userStats.resetTime > oneMonthMs) {
    userStats = {
      count: 0,
      resetTime: now
    };
    freeModeStats.set(`user-${userId}`, userStats);
  }

  // Vérifier la limite
  if (userStats.count >= 10) {
    return res.status(402).json({
      success: false,
      error: 'Limite de requêtes gratuites atteinte',
      message: 'Vous avez utilisé vos 10 générations gratuites du mois. Rechargez votre compte pour continuer !',
      resetTime: new Date(userStats.resetTime + oneMonthMs).toISOString(),
      required: 1,
      available: 0
    });
  }

  // Incrémenter le compteur
  userStats.count++;

  // Ajouter les infos dans la requête
  req.freeModeStats = {
    requestsUsed: userStats.count,
    requestsRemaining: 10 - userStats.count,
    resetTime: userStats.resetTime
  };

  logger.info(` Mode gratuit : ${userStats.count}/10 requêtes utilisées pour user ${userId}`);
  next();
};

/**
 * Configuration du mode gratuit pour l'API AI
 */
export const getFreeModeConfig = () => {
  // Utiliser la même clé OpenRouter que pour les autres services
  const apiKey = process.env.OPENROUTER_FREE_API_KEY || process.env.OPENROUTER_API_KEY;
  
  if (!apiKey) {
    logger.error('❌ ERREUR : Aucune clé OpenRouter trouvée pour le mode gratuit !');
    logger.error('   Vérifiez les variables d\'environnement : OPENROUTER_FREE_API_KEY ou OPENROUTER_API_KEY');
  }
  
  return {
    service: 'openrouter-free',
    model: 'qwen/qwen3-30b-a3b-instruct-2507', // Qwen3 30B A3B Instruct (variant thinking daté retiré)
    maxTokens: 1000, // Limité à 1000 tokens en mode gratuit
    temperature: 0.7,
    apiKey
  };
};
