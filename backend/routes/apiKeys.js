import express from 'express';
import ApiKey from '../models/ApiKey.js';
import { authenticateToken } from '../middleware/auth.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

/**
 * @route   POST /api/admin/api-keys
 * @desc    Sauvegarder les clés API (admin uniquement)
 * @access  Private (Admin)
 */
router.post('/api-keys', authenticateToken, async (req, res) => {
  try {
    const { apiKeys } = req.body;
    const userId = req.user.id;

    // Log pour debug
    logger.info(`Tentative de sauvegarde par user:`, req.user);

    // Vérifier que l'utilisateur est admin (accepter role='admin' OU email admin)
    const isAdmin = req.user.role === 'admin' || 
                    req.user.email === 'admin@studioducapbrun.com' ||
                    req.user.id === 'admin-001';
    
    if (!isAdmin) {
      logger.warn(`Accès refusé pour user: ${JSON.stringify(req.user)}`);
      return res.status(403).json({
        success: false,
        message: 'Accès refusé. Droits administrateur requis.'
      });
    }

    if (!apiKeys || typeof apiKeys !== 'object') {
      return res.status(400).json({
        success: false,
        message: 'Format de données invalide'
      });
    }

    const savedKeys = [];
    const errors = [];

    // Sauvegarder chaque clé
    for (const [service, key] of Object.entries(apiKeys)) {
      if (key && key.trim() !== '') {
        try {
          const saved = await ApiKey.saveApiKey(userId, service, key);
          savedKeys.push(service);
          logger.info(`✅ Clé API sauvegardée: ${service} pour user ${userId}`);
        } catch (error) {
          logger.error(`❌ Erreur sauvegarde clé ${service}:`, error);
          errors.push({ service, error: error.message });
        }
      }
    }

    res.status(200).json({
      success: true,
      message: `${savedKeys.length} clé(s) API sauvegardée(s) avec succès`,
      data: {
        saved: savedKeys,
        errors: errors.length > 0 ? errors : undefined
      }
    });

  } catch (error) {
    logger.error('❌ Erreur sauvegarde clés API:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la sauvegarde des clés API',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/admin/api-keys/:userId
 * @desc    Récupérer les clés API d'un utilisateur
 * @access  Private (Admin)
 */
router.get('/api-keys/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;

    // Vérifier que l'utilisateur est admin ou demande ses propres clés
    if (req.user.role !== 'admin' && 
        req.user.email !== 'admin@studioducapbrun.com' && 
        req.user.id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Accès refusé'
      });
    }

    const apiKeys = await ApiKey.getUserKeys(userId);

    logger.info(`📥 Clés API récupérées pour user ${userId}`);

    res.status(200).json({
      success: true,
      apiKeys
    });

  } catch (error) {
    logger.error('❌ Erreur récupération clés API:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des clés API',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/admin/api-keys/service/:service
 * @desc    Récupérer une clé API spécifique
 * @access  Private (Admin)
 */
router.get('/api-keys/service/:service', authenticateToken, async (req, res) => {
  try {
    const { service } = req.params;
    const userId = req.user.id;

    // Vérifier que l'utilisateur est admin
    if (req.user.role !== 'admin' && req.user.email !== 'admin@studioducapbrun.com') {
      return res.status(403).json({
        success: false,
        message: 'Accès refusé'
      });
    }

    const apiKey = await ApiKey.getServiceKey(userId, service);

    if (!apiKey) {
      return res.status(404).json({
        success: false,
        message: `Clé API non trouvée pour le service: ${service}`
      });
    }

    res.status(200).json({
      success: true,
      service,
      apiKey
    });

  } catch (error) {
    logger.error('❌ Erreur récupération clé API:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de la clé API',
      error: error.message
    });
  }
});

/**
 * @route   DELETE /api/admin/api-keys/:service
 * @desc    Supprimer une clé API
 * @access  Private (Admin)
 */
router.delete('/api-keys/:service', authenticateToken, async (req, res) => {
  try {
    const { service } = req.params;
    const userId = req.user.id;

    // Vérifier que l'utilisateur est admin
    if (req.user.role !== 'admin' && req.user.email !== 'admin@studioducapbrun.com') {
      return res.status(403).json({
        success: false,
        message: 'Accès refusé'
      });
    }

    await ApiKey.deleteApiKey(userId, service);

    logger.info(`🗑️  Clé API supprimée: ${service} pour user ${userId}`);

    res.status(200).json({
      success: true,
      message: `Clé API ${service} supprimée avec succès`
    });

  } catch (error) {
    logger.error('❌ Erreur suppression clé API:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression de la clé API',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/admin/api-keys/status
 * @desc    Vérifier le statut des clés API configurées
 * @access  Private (Admin)
 */
router.get('/api-keys-status', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // Vérifier que l'utilisateur est admin
    if (req.user.role !== 'admin' && req.user.email !== 'admin@studioducapbrun.com') {
      return res.status(403).json({
        success: false,
        message: 'Accès refusé'
      });
    }

    const keys = await ApiKey.find({ userId, isActive: true }).select('service metadata lastUsed createdAt');

    const status = keys.map(key => ({
      service: key.service,
      configured: true,
      keyPrefix: key.metadata?.keyPrefix,
      lastUsed: key.lastUsed,
      createdAt: key.createdAt
    }));

    res.status(200).json({
      success: true,
      count: keys.length,
      keys: status
    });

  } catch (error) {
    logger.error('❌ Erreur statut clés API:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la vérification du statut',
      error: error.message
    });
  }
});

export default router;
