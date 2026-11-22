import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { deductCreditsAfterUsage } from '../middleware/creditCheck.js';
import { checkFreeMode, rateLimitFreeMode, getFreeModeConfig } from '../middleware/freeMode.js';
import { ApiKey } from '../models/index.sequelize.js';
import { logger } from '../utils/logger.js';
import { classifyProviderError } from '../utils/providerErrors.js';
import imageGenerationRoutes from './imageGeneration.js';

const router = express.Router();

// Nom affiché des fournisseurs pour les messages d'erreur utilisateur
const SERVICE_LABELS = {
  openai: 'OpenAI',
  anthropic: 'Anthropic (Claude)',
  gemini: 'Gemini',
  deepseek: 'DeepSeek',
  grok: 'xAI (Grok)',
  kimi: 'Kimi',
  qwen3: 'Qwen',
  mistral: 'Mistral',
  glm: 'GLM (Z.AI)',
  openrouter: 'OpenRouter'
};

router.get('/test', (req, res) => {
  res.json({ success: true, message: 'Route AI simple fonctionne' });
});

router.post('/generate',
  authenticateToken, // Optionnel : définit req.user si token présent
  checkFreeMode,     // Détermine si mode gratuit activé
  rateLimitFreeMode, // Limite les requêtes en mode gratuit
  async (req, res) => {
  try {
    let { service, model, messages, maxTokens = 2000, temperature = 0.7 } = req.body;
    
    // MODE GRATUIT : forcer l'utilisation de Kimi K2 Free
    if (req.freeMode) {
      const freeConfig = getFreeModeConfig();
      service = freeConfig.service;
      model = freeConfig.model;
      maxTokens = Math.min(maxTokens, freeConfig.maxTokens); // Max 1000 tokens
      
      logger.info(`🆓 Mode gratuit activé : ${req.freeModeReason} - ${req.freeModeStats?.requestsUsed}/20 requêtes`);
    }
    
    const userId = req.userId || (req.user?.id || req.user?.userId) || null;
    
    console.log('🔍 [STEP 1] Début génération:', { service, model, userId, freeMode: req.freeMode });
    
    // Récupérer la clé API
    let apiKey;
    
    // Services qui utilisent la clé système OpenRouter
    const openRouterServices = ['qwen3', 'kimi', 'mistral', 'glm', 'openrouter-free'];
    
    if (req.freeMode || openRouterServices.includes(service)) {
      // Mode gratuit ou services OpenRouter : utiliser la clé système
      apiKey = process.env.OPENROUTER_API_KEY || getFreeModeConfig().apiKey;
      console.log('🔍 [STEP 2] Clé système OpenRouter utilisée pour:', service);
    } else {
      // Mode normal : clé de l'utilisateur
      apiKey = await ApiKey.getServiceKey(userId, service);
      console.log('🔍 [STEP 2] Clé utilisateur récupérée:', { found: !!apiKey, keyLength: apiKey?.length });
      
      if (!apiKey) {
        return res.status(404).json({
          success: false,
          error: `Clé API non trouvée pour ${service}`
        });
      }
    }
    
    console.log('🔍 [STEP 3] Appel API pour service:', service);
    
    let response;
    
    // Appeler l'API selon le service
    if (service === 'openai') {
      response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model,
          messages,
          max_tokens: maxTokens,
          temperature
        })
      });
    } else if (service === 'grok') {
      // Grok passe par OpenRouter
      // Grok 4.3 (remplace grok-4.1-fast, retiré du catalogue OpenRouter)
      const openRouterModel = 'x-ai/grok-4.3';
      response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'HTTP-Referer': 'https://assistant-redacteur.fr',
          'X-Title': 'Assistant Rédacteur'
        },
        body: JSON.stringify({
          model: openRouterModel,
          messages,
          max_tokens: maxTokens,
          temperature,
          route: 'fallback' // Utilise le provider le moins cher disponible
        })
      });
    } else if (service === 'anthropic') {
      // Claude via Anthropic - Extraire le system prompt
      const systemMessage = messages.find(m => m.role === 'system');
      const userMessages = messages.filter(m => m.role !== 'system');
      
      const requestBody = {
        model,
        messages: userMessages,
        max_tokens: maxTokens
      };
      
      // Ajouter le system prompt si présent
      if (systemMessage) {
        requestBody.system = systemMessage.content;
      }
      
      response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify(requestBody)
      });
    } else if (service === 'gemini') {
      // Google Gemini
      const geminiMessages = messages.map(msg => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }]
      }));
      response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: geminiMessages,
          generationConfig: {
            maxOutputTokens: maxTokens,
            temperature
          }
        })
      });
    } else if (service === 'deepseek') {
      // DeepSeek
      response = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model,
          messages,
          max_tokens: maxTokens,
          temperature
        })
      });
    } else if (service === 'openrouter' || service === 'qwen3' || service === 'kimi' || service === 'mistral' || service === 'glm' || service === 'openrouter-free') {
      // Services via OpenRouter
      const openRouterModels = {
        openrouter: model, // Utiliser le modèle fourni directement
        qwen3: 'qwen/qwen3-30b-a3b-instruct-2507', // Qwen3 30B A3B Instruct (variant thinking daté retiré)
        kimi: 'moonshotai/kimi-k2-thinking',
        mistral: 'mistralai/mistral-large-2512',
        glm: 'z-ai/glm-5.3', // GLM 5.3 (Z.AI) — contexte 1M, très économique
        'openrouter-free': model // Utiliser le modèle configuré dans freeMode
      };
      const openRouterModel = openRouterModels[service] || model;
      response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'HTTP-Referer': 'https://assistant-redacteur.fr',
          'X-Title': 'Assistant Rédacteur'
        },
        body: JSON.stringify({
          model: openRouterModel,
          messages,
          max_tokens: maxTokens,
          temperature,
          route: 'fallback' // Utilise le provider le moins cher disponible
        })
      });
    } else {
      throw new Error(`Service ${service} non supporté`);
    }
    
    console.log('🔍 [STEP 4] Réponse API:', { service, status: response.status, ok: response.ok });
    
    if (!response.ok) {
      const errorBody = await response.text();
      const label = SERVICE_LABELS[service] || service;
      const classified = classifyProviderError(label, response.status, errorBody, model);
      const providerError = new Error(classified.message);
      providerError.code = classified.code;
      throw providerError;
    }
    
    const aiResponse = await response.json();
    
    // Extraire le contenu selon le service
    let content = '';
    let usage = {};
    
    if (service === 'anthropic') {
      content = aiResponse.content?.[0]?.text || '';
      usage = aiResponse.usage;
    } else if (service === 'gemini') {
      content = aiResponse.candidates?.[0]?.content?.parts?.[0]?.text || '';
      usage = aiResponse.usageMetadata;
    } else {
      // OpenAI, DeepSeek, Grok, Qwen3, Kimi, Mistral (format OpenAI)
      content = aiResponse.choices?.[0]?.message?.content || '';
      usage = aiResponse.usage;
    }
    
    console.log('🔍 [STEP 5] Contenu généré:', { contentLength: content.length });
    
    // Déduction des crédits (sauf en mode gratuit)
    const tokensUsed = {
      input: usage.prompt_tokens || usage.input_tokens || 0,
      output: usage.completion_tokens || usage.output_tokens || 0,
      total: usage.total_tokens || 0
    };
    
    if (!req.freeMode && userId) {
      try {
        await deductCreditsAfterUsage(userId, service, model, tokensUsed, { requestId: 'ai-gen' });
        logger.info(`✅ Crédits déduits pour ${service}/${model}`);
      } catch (creditError) {
        logger.error('⚠️ Erreur déduction crédits:', creditError);
        // Continue sans bloquer la réponse
      }
    }
    
    res.json({ 
      success: true, 
      content,
      usage,
      service,
      model,
      freeMode: req.freeMode || false,
      freeModeStats: req.freeMode ? req.freeModeStats : undefined
    });
    
  } catch (error) {
    console.error('❌ Erreur:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      code: error.code
    });
  }
});

router.use('/image', imageGenerationRoutes);

export default router;
