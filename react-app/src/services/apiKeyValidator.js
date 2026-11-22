/**
 * Service de validation des clés API
 * Effectue de vraies requêtes pour vérifier la validité des clés
 */

const API_ENDPOINTS = {
  openai: 'https://api.openai.com/v1/models',
  'openai-mini': 'https://api.openai.com/v1/models',
  anthropic: 'https://api.anthropic.com/v1/messages',
  'anthropic-haiku': 'https://api.anthropic.com/v1/messages',
  gemini: 'https://generativelanguage.googleapis.com/v1/models',
  'gemini-pro': 'https://generativelanguage.googleapis.com/v1/models',
  deepseek: 'https://api.deepseek.com/v1/chat/completions',
  'deepseek-v3': 'https://api.deepseek.com/v1/chat/completions',
  grok: 'https://api.x.ai/v1/chat/completions',
  'grok-2': 'https://api.x.ai/v1/chat/completions',
  kimi: 'https://openrouter.ai/api/v1/models',
  deepl: 'https://api-free.deepl.com/v2/usage',
  whisper: 'https://api.openai.com/v1/models',
  'gpt-vision': 'https://api.openai.com/v1/models'
};

/**
 * Teste une clé API OpenAI
 */
async function testOpenAI(apiKey) {
  const response = await fetch('https://api.openai.com/v1/models', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Clé API invalide');
  }

  return { valid: true, message: '✅ Clé OpenAI valide et fonctionnelle' };
}

/**
 * Teste une clé API Anthropic (Claude)
 */
async function testAnthropic(apiKey) {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'claude-haiku-5-5',
      max_tokens: 10,
      messages: [{ role: 'user', content: 'test' }]
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Clé API invalide');
  }

  return { valid: true, message: '✅ Clé Anthropic valide et fonctionnelle' };
}

/**
 * Teste une clé API Google Gemini
 */
async function testGemini(apiKey) {
  const response = await fetch(`https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Clé API invalide');
  }

  return { valid: true, message: '✅ Clé Gemini valide et fonctionnelle' };
}

/**
 * Teste une clé API DeepSeek
 */
async function testDeepSeek(apiKey) {
  const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [{ role: 'user', content: 'test' }],
      max_tokens: 10
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Clé API invalide');
  }

  return { valid: true, message: '✅ Clé DeepSeek valide et fonctionnelle' };
}

/**
 * Teste une clé API Grok (xAI)
 */
async function testGrok(apiKey) {
  const response = await fetch('https://api.x.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'grok-beta',
      messages: [{ role: 'user', content: 'test' }],
      max_tokens: 10
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Clé API invalide');
  }

  return { valid: true, message: '✅ Clé Grok valide et fonctionnelle' };
}

/**
 * Teste une clé API OpenRouter (pour Kimi)
 */
async function testOpenRouter(apiKey) {
  const response = await fetch('https://openrouter.ai/api/v1/models', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Clé API invalide');
  }

  return { valid: true, message: '✅ Clé OpenRouter valide et fonctionnelle' };
}

/**
 * Teste une clé API DeepL
 */
async function testDeepL(apiKey) {
  const response = await fetch('https://api-free.deepl.com/v2/usage', {
    method: 'GET',
    headers: {
      'Authorization': `DeepL-Auth-Key ${apiKey}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Clé API invalide');
  }

  return { valid: true, message: '✅ Clé DeepL valide et fonctionnelle' };
}

/**
 * Fonction principale de validation
 * @param {string} service - Nom du service (openai, anthropic, etc.)
 * @param {string} apiKey - Clé API à tester
 * @returns {Promise<{valid: boolean, message: string}>}
 */
export async function validateApiKey(service, apiKey) {
  // Validation basique
  if (!apiKey || apiKey.length < 10) {
    return {
      valid: false,
      message: '❌ Clé trop courte (minimum 10 caractères)'
    };
  }

  try {
    // Router vers la bonne fonction de test
    switch (service) {
      case 'openai':
      case 'openai-mini':
      case 'whisper':
      case 'gpt-vision':
        return await testOpenAI(apiKey);

      case 'anthropic':
      case 'anthropic-haiku':
        return await testAnthropic(apiKey);

      case 'gemini':
      case 'gemini-pro':
        return await testGemini(apiKey);

      case 'deepseek':
      case 'deepseek-v3':
        return await testDeepSeek(apiKey);

      case 'grok':
      case 'grok-2':
        return await testGrok(apiKey);

      case 'kimi':
        return await testOpenRouter(apiKey);

      case 'glm':
        return await testOpenRouter(apiKey);

      case 'deepl':
        return await testDeepL(apiKey);

      default:
        // Pour les services non encore implémentés, validation de format
        const isValidFormat = apiKey.length >= 20 && /^[a-zA-Z0-9\-_]+$/.test(apiKey);
        return {
          valid: isValidFormat,
          message: isValidFormat 
            ? '✅ Format de clé valide (test API non implémenté)'
            : '❌ Format de clé invalide'
        };
    }
  } catch (error) {
    console.error(`Erreur test API ${service}:`, error);
    return {
      valid: false,
      message: `❌ ${error.message || 'Erreur lors du test de connexion'}`
    };
  }
}

/**
 * Teste plusieurs clés en parallèle
 * @param {Object} apiKeys - Objet contenant les clés à tester
 * @returns {Promise<Object>} Résultats des tests
 */
export async function validateMultipleKeys(apiKeys) {
  const results = {};
  const promises = Object.entries(apiKeys)
    .filter(([_, key]) => key && key.length > 0)
    .map(async ([service, key]) => {
      const result = await validateApiKey(service, key);
      results[service] = result;
    });

  await Promise.all(promises);
  return results;
}
