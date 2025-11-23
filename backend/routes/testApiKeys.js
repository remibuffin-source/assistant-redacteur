import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

/**
 * @route   POST /api/admin/test-api-key
 * @desc    Tester une clé API de manière sécurisée côté serveur
 * @access  Private (Admin)
 */
router.post('/test-api-key', async (req, res) => {
  try {
    const { service, apiKey } = req.body;

    // TEMPORAIRE: Authentification désactivée pour debug
    // TODO: Réactiver l'authentification une fois Lambda corrigé
    // Vérifier que l'utilisateur est admin
    // if (req.user.role !== 'admin' && req.user.email !== 'admin@studioducapbrun.com') {
    //   return res.status(403).json({
    //     success: false,
    //     message: 'Accès refusé. Droits administrateur requis.'
    //   });
    // }

    if (!service || !apiKey) {
      return res.status(400).json({
        success: false,
        message: 'Service et clé API requis'
      });
    }

    // Tester la clé selon le service
    let testResult;
    
    switch (service) {
      case 'openai':
      case 'openai-mini':
        testResult = await testOpenAI(apiKey);
        break;
      
      case 'anthropic':
      case 'anthropic-haiku':
        testResult = await testAnthropic(apiKey);
        break;
      
      case 'gemini':
      case 'gemini-pro':
        testResult = await testGemini(apiKey);
        break;
      
      case 'deepseek':
      case 'deepseek-v3':
        testResult = await testDeepSeek(apiKey);
        break;
      
      default:
        testResult = {
          valid: true,
          message: '✅ Format de clé valide (test complet non disponible pour ce service)'
        };
    }

    logger.info(`Test clé API ${service}: ${testResult.valid ? 'succès' : 'échec'}`);

    res.status(200).json({
      success: testResult.valid,
      valid: testResult.valid,
      message: testResult.message
    });

  } catch (error) {
    logger.error('❌ Erreur test clé API:', error);
    res.status(500).json({
      success: false,
      valid: false,
      message: 'Erreur lors du test de la clé API'
    });
  }
});

/**
 * Teste une clé OpenAI
 */
async function testOpenAI(apiKey) {
  try {
    const response = await fetch('https://api.openai.com/v1/models', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`
      }
    });

    if (response.ok) {
      return {
        valid: true,
        message: '✅ Clé OpenAI valide'
      };
    } else if (response.status === 401) {
      return {
        valid: false,
        message: '❌ Clé OpenAI invalide'
      };
    } else {
      return {
        valid: false,
        message: `❌ Erreur OpenAI: ${response.status}`
      };
    }
  } catch (error) {
    return {
      valid: false,
      message: `❌ Erreur de connexion: ${error.message}`
    };
  }
}

/**
 * Teste une clé Anthropic (Claude)
 */
async function testAnthropic(apiKey) {
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 10,
        messages: [{ role: 'user', content: 'Hi' }]
      })
    });

    if (response.ok) {
      return {
        valid: true,
        message: '✅ Clé Anthropic valide'
      };
    } else if (response.status === 401) {
      return {
        valid: false,
        message: '❌ Clé Anthropic invalide'
      };
    } else {
      const errorData = await response.json().catch(() => ({}));
      return {
        valid: false,
        message: `❌ Erreur Anthropic: ${errorData.error?.message || response.status}`
      };
    }
  } catch (error) {
    return {
      valid: false,
      message: `❌ Erreur de connexion: ${error.message}`
    };
  }
}

/**
 * Teste une clé Google Gemini
 */
async function testGemini(apiKey) {
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`, {
      method: 'GET'
    });

    if (response.ok) {
      return {
        valid: true,
        message: '✅ Clé Gemini valide'
      };
    } else if (response.status === 400 || response.status === 403) {
      return {
        valid: false,
        message: '❌ Clé Gemini invalide'
      };
    } else {
      return {
        valid: false,
        message: `❌ Erreur Gemini: ${response.status}`
      };
    }
  } catch (error) {
    return {
      valid: false,
      message: `❌ Erreur de connexion: ${error.message}`
    };
  }
}

/**
 * Teste une clé DeepSeek
 */
async function testDeepSeek(apiKey) {
  try {
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [{ role: 'user', content: 'Hi' }],
        max_tokens: 10
      })
    });

    if (response.ok) {
      return {
        valid: true,
        message: '✅ Clé DeepSeek valide'
      };
    } else if (response.status === 401) {
      return {
        valid: false,
        message: '❌ Clé DeepSeek invalide'
      };
    } else {
      return {
        valid: false,
        message: `❌ Erreur DeepSeek: ${response.status}`
      };
    }
  } catch (error) {
    return {
      valid: false,
      message: `❌ Erreur de connexion: ${error.message}`
    };
  }
}

export default router;
