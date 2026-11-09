import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

/**
 * @route   POST /api/admin/test-api-key
 * @desc    Tester une clé API de manière sécurisée côté serveur
 * @access  Private (Admin)
 */
router.post('/test-api-key', authenticateToken, async (req, res) => {
  try {
    const { service, apiKey } = req.body;

    // Vérifier que l'utilisateur est admin
    if (req.user.role !== 'admin' && req.user.email !== 'admin@assistant-redacteur.fr') {
      return res.status(403).json({
        success: false,
        message: 'Accès refusé. Droits administrateur requis.'
      });
    }

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
      
      case 'gemini-3-pro':
      case 'gemini-2.5-flash':
        // Gemini 3 Pro et 2.5 Flash passent par OpenRouter
        testResult = await testOpenRouter(apiKey);
        break;
      
      case 'deepseek':
      case 'deepseek-v3':
        testResult = await testDeepSeek(apiKey);
        break;
      
      case 'openrouter':
      case 'kimi':
        testResult = await testOpenRouter(apiKey);
        break;
      
      case 'mistral':
        testResult = await testMistral(apiKey);
        break;
      
      case 'deepl':
        testResult = await testDeepL(apiKey);
        break;
      
      case 'grok':
      case 'grok-2':
      case 'grok-4.1-fast-reasoning':
        // Grok passe par OpenRouter
        testResult = await testOpenRouter(apiKey);
        break;
      
      case 'whisper':
      case 'gpt-5':
      case 'openai-gpt5':
      case 'gpt-vision':
        // Ces services utilisent les clés OpenAI
        testResult = await testOpenAI(apiKey);
        break;
      
      case 'qwen3':
        // Qwen3 passe par OpenRouter
        testResult = await testOpenRouter(apiKey);
        break;
      
      case 'fal-tti':
      case 'fal-edit':
        // Fal.ai (SeedDream 5.0 Lite / Edit)
        testResult = await testFalAI(apiKey);
        break;
      
      case 'gemini-image':
        // Gemini Image utilise les clés Gemini
        testResult = await testGemini(apiKey);
        break;
      
      case 'elevenlabs':
        testResult = await testElevenLabs(apiKey);
        break;
      
      case 'wan':
        testResult = await testWAN(apiKey);
        break;
      
      case 'veo':
        testResult = await testVeo(apiKey);
        break;
      
      case 'twitter':
      case 'facebook':
      case 'linkedin':
      case 'instagram':
      case 'blog':
      case 'website':
        // Pour les services sans validation API réelle, vérifier au moins le format
        testResult = validateKeyFormat(service, apiKey);
        break;
      
      default:
        testResult = {
          valid: false,
          message: '❌ Service non reconnu'
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
        model: 'claude-haiku-5-5',
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

/**
 * Teste une clé OpenRouter (utilisé pour Kimi, Grok, Qwen3)
 */
async function testOpenRouter(apiKey) {
  try {
    const response = await fetch('https://openrouter.ai/api/v1/auth/key', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`
      }
    });

    if (response.ok) {
      return {
        valid: true,
        message: '✅ Clé OpenRouter valide'
      };
    } else if (response.status === 401 || response.status === 403) {
      return {
        valid: false,
        message: '❌ Clé OpenRouter invalide'
      };
    } else {
      return {
        valid: false,
        message: `❌ Erreur OpenRouter: ${response.status}`
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
 * Teste une clé Mistral AI
 */
async function testMistral(apiKey) {
  try {
    const response = await fetch('https://api.mistral.ai/v1/models', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`
      }
    });

    if (response.ok) {
      return {
        valid: true,
        message: '✅ Clé Mistral valide'
      };
    } else if (response.status === 401) {
      return {
        valid: false,
        message: '❌ Clé Mistral invalide'
      };
    } else {
      return {
        valid: false,
        message: `❌ Erreur Mistral: ${response.status}`
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
 * Teste une clé DeepL
 */
async function testDeepL(apiKey) {
  try {
    // DeepL a deux endpoints selon le type de clé (free vs pro)
    // On teste d'abord avec l'endpoint free
    const isFreeKey = apiKey.endsWith(':fx');
    const baseUrl = isFreeKey 
      ? 'https://api-free.deepl.com/v2/usage'
      : 'https://api.deepl.com/v2/usage';
    
    const response = await fetch(baseUrl, {
      method: 'GET',
      headers: {
        'Authorization': `DeepL-Auth-Key ${apiKey}`
      }
    });

    if (response.ok) {
      return {
        valid: true,
        message: `✅ Clé DeepL valide (${isFreeKey ? 'Free' : 'Pro'})`
      };
    } else if (response.status === 403) {
      return {
        valid: false,
        message: '❌ Clé DeepL invalide'
      };
    } else {
      return {
        valid: false,
        message: `❌ Erreur DeepL: ${response.status}`
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
 * Teste une clé Fal.ai (SeedDream)
 */
async function testFalAI(apiKey) {
  try {
    const response = await fetch('https://fal.run/fal-ai/fast-sdxl', {
      method: 'POST',
      headers: {
        'Authorization': `Key ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt: 'test',
        num_images: 1,
        image_size: 'square'
      })
    });

    // Fal.ai retourne 200 si la clé est valide, même si la requête échoue pour d'autres raisons
    if (response.ok || response.status === 422) {
      return {
        valid: true,
        message: '✅ Clé Fal.ai valide'
      };
    } else if (response.status === 401 || response.status === 403) {
      return {
        valid: false,
        message: '❌ Clé Fal.ai invalide'
      };
    } else {
      // Vérifier si c'est une erreur de validation (clé valide mais requête incorrecte)
      const errorData = await response.json().catch(() => ({}));
      if (errorData.detail && !errorData.detail.includes('auth')) {
        return {
          valid: true,
          message: '✅ Clé Fal.ai valide'
        };
      }
      return {
        valid: false,
        message: `❌ Erreur Fal.ai: ${response.status}`
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
 * Teste une clé ElevenLabs
 */
async function testElevenLabs(apiKey) {
  try {
    const response = await fetch('https://api.elevenlabs.io/v1/user', {
      method: 'GET',
      headers: {
        'xi-api-key': apiKey
      }
    });

    if (response.ok) {
      return {
        valid: true,
        message: '✅ Clé ElevenLabs valide'
      };
    } else if (response.status === 401) {
      return {
        valid: false,
        message: '❌ Clé ElevenLabs invalide'
      };
    } else {
      return {
        valid: false,
        message: `❌ Erreur ElevenLabs: ${response.status}`
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
 * Teste une clé WAN (Kie.ai)
 */
async function testWAN(apiKey) {
  try {
    const response = await fetch('https://api.kie.ai/api/v1/chat/credit', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`
      }
    });

    if (response.ok) {
      const data = await response.json();
      // La réponse Kie.ai est { code: 200, msg: "success", data: credits }
      const credits = data.data || data.credits || 0;
      return {
        valid: true,
        message: `✅ Clé WAN valide (${credits} crédits disponibles)`
      };
    } else if (response.status === 401 || response.status === 403) {
      return {
        valid: false,
        message: '❌ Clé WAN invalide'
      };
    } else {
      return {
        valid: false,
        message: `❌ Erreur WAN: ${response.status}`
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
 * Teste une clé Veo 3.1 (Kie.ai)
 */
async function testVeo(apiKey) {
  try {
    const response = await fetch('https://api.kie.ai/api/v1/chat/credit', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`
      }
    });

    if (response.ok) {
      const data = await response.json();
      const credits = data.data || data.credits || 0;
      return {
        valid: true,
        message: `✅ Clé Veo 3.1 valide (${credits} crédits Kie.ai disponibles)`
      };
    } else if (response.status === 401 || response.status === 403) {
      return {
        valid: false,
        message: '❌ Clé Veo 3.1 invalide'
      };
    } else {
      return {
        valid: false,
        message: `❌ Erreur Veo 3.1: ${response.status}`
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
 * Valide le format d'une clé API pour les services sans validation réelle
 */
function validateKeyFormat(service, apiKey) {
  // Vérification de longueur minimale
  if (!apiKey || apiKey.length < 20) {
    return {
      valid: false,
      message: '❌ Clé trop courte (minimum 20 caractères)'
    };
  }

  let isValid = false;
  let expectedFormat = '';

  switch(service) {
    case 'twitter':
      // Twitter Bearer tokens commencent généralement par "AA" ou contiennent "Bearer"
      isValid = apiKey.includes('Bearer') || (apiKey.startsWith('AA') && apiKey.length > 40);
      expectedFormat = 'Bearer token ou token OAuth 2.0';
      break;
    
    case 'facebook':
      // Facebook tokens contiennent souvent "EA" et sont longs
      isValid = apiKey.includes('EA') && apiKey.length > 30;
      expectedFormat = 'Token commençant par EA';
      break;
    
    case 'linkedin':
      // LinkedIn tokens contiennent souvent "AQ" 
      isValid = apiKey.includes('AQ') && apiKey.length > 30;
      expectedFormat = 'Token OAuth LinkedIn';
      break;
    
    case 'instagram':
      // Instagram utilise souvent les mêmes tokens que Facebook
      isValid = apiKey.length > 30;
      expectedFormat = 'Access token Instagram';
      break;
    
    case 'blog':
    case 'website':
      // Pour les blogs/sites, accepter des tokens génériques longs
      isValid = apiKey.length > 20;
      expectedFormat = 'Token API personnalisé';
      break;
    
    case 'grok':
      // Grok (X.AI) utilise probablement un format similaire à OpenAI
      isValid = apiKey.startsWith('xai-') && apiKey.length > 30;
      expectedFormat = 'Token commençant par xai-';
      break;
    
    case 'kimi':
      // Kimi via OpenRouter - clés OpenRouter commencent par "sk-or-"
      isValid = apiKey.startsWith('sk-or-') && apiKey.length > 40;
      expectedFormat = 'Clé OpenRouter (format: sk-or-...)';
      break;
    
    case 'deepl':
      // DeepL API keys se terminent par ":fx" (free) ou sont des UUID avec tirets
      // Format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx:fx
      const hasCorrectSuffix = apiKey.endsWith(':fx');
      const hasUuidFormat = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}(:fx)?$/i.test(apiKey);
      isValid = hasCorrectSuffix || hasUuidFormat;
      expectedFormat = 'Token DeepL (format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx:fx)';
      break;
    
    case 'qwen3':
      // Qwen (Alibaba) format inconnu, vérification basique
      isValid = apiKey.length > 30;
      expectedFormat = 'Token API Qwen';
      break;
    
    case 'whisper':
      // Whisper utilise les clés OpenAI
      isValid = apiKey.startsWith('sk-') && apiKey.length > 30;
      expectedFormat = 'Clé OpenAI (sk-...)';
      break;
    
    case 'gpt-5':
    case 'openai-gpt5':
      // GPT-5 utilise les clés OpenAI
      isValid = apiKey.startsWith('sk-') && apiKey.length > 30;
      expectedFormat = 'Clé OpenAI (sk-...)';
      break;
    
    case 'openrouter':
      // OpenRouter clés commencent par "sk-or-"
      isValid = apiKey.startsWith('sk-or-') && apiKey.length > 40;
      expectedFormat = 'Clé OpenRouter (format: sk-or-...)';
      break;
    
    case 'mistral':
      // Mistral AI clés
      isValid = apiKey.length > 30;
      expectedFormat = 'Clé Mistral AI';
      break;
    
    case 'gpt-vision':
      // GPT Vision utilise les clés OpenAI
      isValid = apiKey.startsWith('sk-') && apiKey.length > 30;
      expectedFormat = 'Clé OpenAI (sk-...)';
      break;
    
    default:
      isValid = false;
      expectedFormat = 'Format inconnu';
  }

  return {
    valid: isValid,
    message: isValid 
      ? `✅ Format de clé ${service} valide (validation complète non disponible)`
      : `❌ Format de clé ${service} invalide. Attendu: ${expectedFormat}`
  };
}

export default router;
