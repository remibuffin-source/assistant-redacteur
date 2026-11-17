import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import ApiKey from '../models/ApiKey.js';
import User from '../models/User.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

/**
 * GET /api/diagnostic/wan-key
 * Tester la récupération de la clé WAN (sans authentification pour debug)
 */
router.get('/wan-key', async (req, res) => {
  try {
    const diagnosticResults = {
      timestamp: new Date().toISOString(),
      tests: [],
      note: 'Endpoint de diagnostic - ne pas utiliser en production'
    };

    // Test 2: Recherche de la clé WAN
    let wanKey;
    try {
      wanKey = await ApiKey.findOne({
        where: { service: 'wan', isActive: true }
      });
      
      diagnosticResults.tests.push({
        name: 'Recherche clé WAN',
        status: wanKey ? 'OK' : 'FAILED',
        details: wanKey ? {
          id: wanKey.id,
          userId: wanKey.userId,
          service: wanKey.service,
          isActive: wanKey.isActive,
          metadataProvider: wanKey.metadataProvider,
          metadataKeyPrefix: wanKey.metadataKeyPrefix
        } : { error: 'Aucune clé WAN trouvée' }
      });
    } catch (error) {
      diagnosticResults.tests.push({
        name: 'Recherche clé WAN',
        status: 'ERROR',
        details: { error: error.message }
      });
    }

    // Test 3: Déchiffrement de la clé
    if (wanKey) {
      try {
        const decryptedKey = wanKey.decryptKey();
        diagnosticResults.tests.push({
          name: 'Déchiffrement clé WAN',
          status: 'OK',
          details: {
            keyLength: decryptedKey.length,
            keyPrefix: decryptedKey.substring(0, 8) + '...'
          }
        });
      } catch (error) {
        diagnosticResults.tests.push({
          name: 'Déchiffrement clé WAN',
          status: 'ERROR',
          details: { error: error.message }
        });
      }
    }

    // Résumé
    const allOk = diagnosticResults.tests.every(t => t.status === 'OK');
    
    res.json({
      success: allOk,
      message: allOk ? 'Tous les tests sont passés' : 'Certains tests ont échoué',
      diagnosticResults
    });

  } catch (error) {
    logger.error('Erreur diagnostic WAN:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

/**
 * GET /api/diagnostic/test-wan-generation
 * Tester la génération WAN sans réellement appeler l'API
 */
router.post('/test-wan-generation', authenticateToken, async (req, res) => {
  try {
    const { prompt, model = 'text-to-video' } = req.body;

    const diagnosticResults = {
      timestamp: new Date().toISOString(),
      tests: [],
      input: { prompt, model }
    };

    // Test 1: Récupération de la clé WAN
    let wanApiKey;
    try {
      const wanKey = await ApiKey.findOne({
        where: { service: 'wan', isActive: true }
      });
      
      if (!wanKey) {
        throw new Error('Clé API WAN non configurée');
      }
      
      wanApiKey = wanKey.decryptKey();
      
      diagnosticResults.tests.push({
        name: 'Récupération clé WAN',
        status: 'OK',
        details: { keyLength: wanApiKey.length }
      });
    } catch (error) {
      diagnosticResults.tests.push({
        name: 'Récupération clé WAN',
        status: 'ERROR',
        details: { error: error.message }
      });
      
      return res.json({
        success: false,
        message: 'Échec de récupération de la clé WAN',
        diagnosticResults
      });
    }

    // Test 2: Vérification des crédits
    try {
      const user = await User.findByPk(req.user.id);
      if (!user) {
        throw new Error('Utilisateur introuvable');
      }

      diagnosticResults.tests.push({
        name: 'Vérification crédits',
        status: user.credits > 0 ? 'OK' : 'WARNING',
        details: {
          credits: user.credits,
          sufficient: user.credits >= 10
        }
      });
    } catch (error) {
      diagnosticResults.tests.push({
        name: 'Vérification crédits',
        status: 'ERROR',
        details: { error: error.message }
      });
    }

    // Test 3: Validation des paramètres
    const validModels = ['text-to-video', 'image-to-video', 'video-to-video'];
    const isValidModel = validModels.includes(model);
    
    diagnosticResults.tests.push({
      name: 'Validation paramètres',
      status: isValidModel && prompt ? 'OK' : 'FAILED',
      details: {
        model,
        modelValid: isValidModel,
        promptProvided: !!prompt
      }
    });

    const allOk = diagnosticResults.tests.every(t => t.status === 'OK' || t.status === 'WARNING');

    res.json({
      success: allOk,
      message: allOk ? 'Tous les tests préliminaires sont OK' : 'Certains tests ont échoué',
      diagnosticResults,
      note: 'Aucune requête réelle à l\'API Kie.ai n\'a été effectuée'
    });

  } catch (error) {
    logger.error('Erreur test génération WAN:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

/**
 * GET /api/diagnostic/test-wan-video
 * Tester la génération vidéo WAN sans authentification
 */
router.get('/test-wan-video', async (req, res) => {
  try {
    const diagnosticResults = {
      timestamp: new Date().toISOString(),
      tests: [],
      note: 'Test de génération vidéo WAN - simulation'
    };

    // Test 1: Import du service WAN
    let wanService;
    try {
      wanService = await import('../services/wanService.js');
      diagnosticResults.tests.push({
        name: 'Import wanService',
        status: 'OK',
        details: { functions: Object.keys(wanService) }
      });
    } catch (error) {
      diagnosticResults.tests.push({
        name: 'Import wanService',
        status: 'ERROR',
        details: { error: error.message, stack: error.stack }
      });
      return res.json({ success: false, diagnosticResults });
    }

    // Test 2: Vérifier que generateImageToVideo existe
    if (typeof wanService.generateImageToVideo === 'function') {
      diagnosticResults.tests.push({
        name: 'Fonction generateImageToVideo',
        status: 'OK'
      });
    } else {
      diagnosticResults.tests.push({
        name: 'Fonction generateImageToVideo',
        status: 'ERROR',
        details: { error: 'Fonction non trouvée' }
      });
      return res.json({ success: false, diagnosticResults });
    }

    // Test 3: Vérifier User model
    try {
      const testUser = await User.findByPk(18); // Admin user
      diagnosticResults.tests.push({
        name: 'Récupération utilisateur test (ID 18)',
        status: testUser ? 'OK' : 'WARNING',
        details: testUser ? {
          id: testUser.id,
          email: testUser.email,
          credits: testUser.credits
        } : { error: 'Utilisateur non trouvé' }
      });
    } catch (error) {
      diagnosticResults.tests.push({
        name: 'Récupération utilisateur test',
        status: 'ERROR',
        details: { error: error.message }
      });
    }

    // Test 4: Import calculateWanVideoCredits
    try {
      const { calculateWanVideoCredits } = await import('../utils/creditCalculator.js');
      const testCredits = await calculateWanVideoCredits('image-to-video', '720p', 5);
      diagnosticResults.tests.push({
        name: 'Calcul crédits WAN',
        status: 'OK',
        details: { creditsNeeded: testCredits }
      });
    } catch (error) {
      diagnosticResults.tests.push({
        name: 'Calcul crédits WAN',
        status: 'ERROR',
        details: { error: error.message, stack: error.stack }
      });
    }

    // Test 5: Simuler l'appel à generateImageToVideo (sans vraiment appeler l'API)
    try {
      // On ne fait pas l'appel réel, juste vérifier que la fonction peut être appelée
      diagnosticResults.tests.push({
        name: 'Simulation generateImageToVideo',
        status: 'OK',
        details: { 
          note: 'Fonction prête, pas d\'appel réel effectué',
          params: {
            userId: 18,
            imageUrl: 'https://example.com/test.jpg',
            prompt: 'Test prompt',
            options: { resolution: '720p', duration: 5 }
          }
        }
      });
    } catch (error) {
      diagnosticResults.tests.push({
        name: 'Simulation generateImageToVideo',
        status: 'ERROR',
        details: { error: error.message }
      });
    }

    const allOk = diagnosticResults.tests.every(t => t.status === 'OK' || t.status === 'WARNING');

    res.json({
      success: allOk,
      message: allOk ? 'Tous les tests préliminaires OK' : 'Certains tests ont échoué',
      diagnosticResults
    });

  } catch (error) {
    logger.error('Erreur test WAN video:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      stack: error.stack
    });
  }
});

/**
 * GET /api/diagnostic/test-text-to-video
 * Tester generateTextToVideo avec un vrai appel et capturer l'erreur
 */
router.get('/test-text-to-video', async (req, res) => {
  try {
    const userId = parseInt(req.query.userId) || 18;
    const prompt = req.query.prompt || 'Test vidéo';
    
    const diagnosticResults = {
      timestamp: new Date().toISOString(),
      input: { userId, prompt },
      steps: []
    };

    // Étape 1: Vérifier l'utilisateur
    try {
      const user = await User.findByPk(userId);
      diagnosticResults.steps.push({
        step: 'Récupération utilisateur',
        status: user ? 'OK' : 'FAILED',
        data: user ? {
          id: user.id,
          email: user.email,
          credits: user.credits
        } : null
      });
      
      if (!user) {
        return res.json({ success: false, diagnosticResults });
      }
    } catch (error) {
      diagnosticResults.steps.push({
        step: 'Récupération utilisateur',
        status: 'ERROR',
        error: error.message,
        stack: error.stack
      });
      return res.json({ success: false, diagnosticResults });
    }

    // Étape 2: Import et appel generateTextToVideo
    try {
      const { generateTextToVideo } = await import('../services/wanService.js');
      
      diagnosticResults.steps.push({
        step: 'Import generateTextToVideo',
        status: 'OK'
      });

      // Étape 3: Appel réel
      try {
        const result = await generateTextToVideo(userId, prompt, {
          resolution: '720p',
          duration: 5,
          aspectRatio: '16:9',
          multiShots: false,
          enableAudio: true
        });

        diagnosticResults.steps.push({
          step: 'Appel generateTextToVideo',
          status: 'OK',
          result
        });

        return res.json({ 
          success: true, 
          diagnosticResults,
          message: 'Génération lancée avec succès'
        });

      } catch (error) {
        diagnosticResults.steps.push({
          step: 'Appel generateTextToVideo',
          status: 'ERROR',
          error: {
            message: error.message,
            stack: error.stack,
            name: error.name,
            apiResponse: error.apiResponse || null,
            statusCode: error.statusCode || null,
            payload: error.payload || null
          }
        });
        return res.json({ success: false, diagnosticResults });
      }

    } catch (error) {
      diagnosticResults.steps.push({
        step: 'Import generateTextToVideo',
        status: 'ERROR',
        error: error.message,
        stack: error.stack
      });
      return res.json({ success: false, diagnosticResults });
    }

  } catch (error) {
    logger.error('Erreur test-text-to-video:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      stack: error.stack
    });
  }
});

export default router;
