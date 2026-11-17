import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import MediaAIConfig from '../models/MediaAIConfig.js';

const router = express.Router();

/**
 * GET /api/media-ai-config
 * Récupérer la configuration globale des IA multimodales
 * Accessible à tous les utilisateurs authentifiés
 */
router.get('/', authenticateToken, async (req, res) => {
  try {
    const config = await MediaAIConfig.getConfig();
    
    res.json({
      success: true,
      config
    });
  } catch (error) {
    console.error('Erreur récupération config IA multimodale:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération de la configuration'
    });
  }
});

/**
 * POST /api/media-ai-config
 * Sauvegarder la configuration globale des IA multimodales
 * Accessible uniquement aux administrateurs
 */
router.post('/', authenticateToken, async (req, res) => {
  try {
    // Vérifier que l'utilisateur est admin
    const isAdmin = req.user?.role === 'admin' || 
                    req.user?.email === 'admin@assistant-redacteur.fr' ||
                    req.user?.id === 'admin-001';
    
    console.log('🔍 Vérification admin:', { 
      user: req.user, 
      isAdmin,
      role: req.user?.role,
      email: req.user?.email,
      id: req.user?.id
    });
    
    if (!isAdmin) {
      return res.status(403).json({
        success: false,
        error: 'Accès refusé. Seuls les administrateurs peuvent modifier cette configuration.'
      });
    }
    
    const { config } = req.body;
    
    // Validation basique
    if (!config || typeof config !== 'object') {
      return res.status(400).json({
        success: false,
        error: 'Configuration invalide'
      });
    }
    
    // Vérifier que les clés requises sont présentes
    const requiredKeys = ['text', 'audio', 'image', 'spreadsheet', 'web'];
    const missingKeys = requiredKeys.filter(key => !config[key]);
    
    if (missingKeys.length > 0) {
      return res.status(400).json({
        success: false,
        error: `Clés manquantes: ${missingKeys.join(', ')}`
      });
    }
    
    // Sauvegarder la configuration
    const userId = req.user?.id || req.user?.userId;
    await MediaAIConfig.saveConfig(config, userId);
    
    res.json({
      success: true,
      message: 'Configuration sauvegardée avec succès',
      config
    });
  } catch (error) {
    console.error('Erreur sauvegarde config IA multimodale:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la sauvegarde de la configuration'
    });
  }
});

export default router;
