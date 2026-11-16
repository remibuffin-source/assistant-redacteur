import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { calculateImageCredits } from '../utils/creditCalculator.js';
import User from '../models/User.js';
import { ApiKey } from '../models/index.sequelize.js';
import { logger } from '../utils/logger.js';
import { classifyProviderError } from '../utils/providerErrors.js';
import fetch from 'node-fetch';
import FormData from 'form-data';
import crypto from 'crypto';

// Sharp sera chargé dynamiquement à la première utilisation
let sharp = null;
let sharpLoaded = false;

async function getSharp() {
  if (!sharpLoaded) {
    sharpLoaded = true;
    try {
      sharp = (await import('sharp')).default;
      logger.info('✅ Sharp chargé avec succès');
    } catch (err) {
      logger.warn('⚠️ Sharp non disponible, les images seront stockées sans conversion PNG optimisée');
      sharp = null;
    }
  }
  return sharp;
}

const router = express.Router();

/**
 * Message utilisateur explicite en cas d'erreur fournisseur (crédits, clé, quota, modèle obsolète).
 * Voir utils/providerErrors.js.
 */
function buildProviderError(provider, status, errorBody, model) {
  return classifyProviderError(provider, status, errorBody, model);
}

/**
 * POST /api/ai/image/generate
 * Génération d'image avec SeedDream 5.0 Lite (text-to-image)
 */
router.post('/generate', authenticateToken, async (req, res, next) => {
  const { prompt, model = 'seedream-v5-lite', numImages = 1, maxImages = 1, imageSize = 'auto_2K', referenceImages = [], strength = 0.7, seed, enhancePromptMode = 'standard' } = req.body;
  const userId = req.user.id;

  logger.info(`🎨 Demande de génération d'image: model=${model}, prompt=${prompt?.substring(0, 50)}..., referenceImages=${referenceImages.length}, enhancePromptMode=${enhancePromptMode}`);

  if (!prompt) {
    return res.status(400).json({ success: false, error: 'Le prompt est obligatoire.' });
  }

  try {
    // Déterminer si c'est OpenRouter (Nano Banana) ou Fal.ai (SeedDream)
    const isOpenRouter = model === 'google/gemini-2.5-flash-image' || model === 'nano-banana';
    
    // 1. Récupérer la clé API appropriée
    let apiKey;
    if (isOpenRouter) {
      apiKey = await ApiKey.getServiceKey(userId, 'openrouter');
      if (!apiKey) {
        return res.status(500).json({ 
          success: false, 
          error: 'La clé API pour OpenRouter n\'est pas configurée. Configurez-la dans Config API.' 
        });
      }
    } else {
      apiKey = await ApiKey.getServiceKey(userId, 'fal-tti');
      if (!apiKey) {
        return res.status(500).json({ 
          success: false, 
          error: 'La clé API pour Fal.ai n\'est pas configurée. Configurez-la dans Config API.' 
        });
      }
    }

    // 2. Calculer le coût en crédits
    const service = isOpenRouter ? 'openrouter' : 'fal-tti';
    const creditsNeeded = await calculateImageCredits(service, model, numImages);
    logger.info(`💰 Crédits nécessaires pour ${numImages} image(s): ${creditsNeeded}`);

    // 3. Vérifier si l'utilisateur a assez de crédits
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ success: false, error: 'Utilisateur non trouvé.' });
    }
    
    if (parseFloat(user.creditsBalance) < creditsNeeded) {
      return res.status(402).json({ 
        success: false, 
        error: 'Crédits insuffisants.',
        creditsNeeded,
        creditsAvailable: parseFloat(user.creditsBalance)
      });
    }

    // 4. Déterminer l'endpoint selon le modèle
    let response;
    
    if (isOpenRouter) {
      // OpenRouter pour Nano Banana (Gemini Image)
      const openRouterKey = apiKey;
      
      // Construire le contenu du message avec les images de référence si présentes
      let messageContent;
      if (referenceImages && referenceImages.length > 0) {
        // Format multimodal avec images de référence
        messageContent = [
          { type: 'text', text: prompt }
        ];
        // Ajouter les images de référence
        for (const img of referenceImages) {
          let imageUrl = img;
          if (!img.startsWith('http://') && !img.startsWith('https://') && !img.startsWith('data:')) {
            imageUrl = `data:image/png;base64,${img}`;
          }
          messageContent.push({
            type: 'image_url',
            image_url: { url: imageUrl }
          });
        }
        logger.info(`🖼️ ${referenceImages.length} image(s) de référence ajoutée(s) pour Nano Banana`);
      } else {
        messageContent = prompt;
      }
      
      const openRouterPayload = {
        model: 'google/gemini-2.5-flash-image',
        messages: [
          {
            role: 'user',
            content: messageContent
          }
        ],
        modalities: ['image', 'text']
      };
      
      logger.info(`🎨 Appel OpenRouter Nano Banana: google/gemini-2.5-flash-image`);
      
      response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openRouterKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://assistant-redacteur.fr',
          'X-Title': 'Assistant Rédacteur'
        },
        body: JSON.stringify(openRouterPayload)
      });
    } else {
      // Fal.ai pour SeedDream 5.0 Lite
      const hasReferenceImages = referenceImages && referenceImages.length > 0;
      
      // SeedDream 5.0 Lite - text-to-image ou edit (multi-références) en v5
      const falEndpoint = hasReferenceImages 
        ? 'https://fal.run/fal-ai/bytedance/seedream/v5/lite/edit'
        : 'https://fal.run/fal-ai/bytedance/seedream/v5/lite/text-to-image';
      
      // Convertir image_size au format Fal.ai v5
      // Enums v5 : square_hd, square, portrait_4_3, portrait_16_9, landscape_4_3, landscape_16_9, auto_2K, auto_3K, auto_4K
      let falImageSize = 'auto_2K'; // défaut v5
      
      // Vérifier si c'est déjà un enum v5 valide
      const v5Enums = ['square_hd', 'square', 'portrait_4_3', 'portrait_16_9', 'landscape_4_3', 'landscape_16_9', 'auto_2K', 'auto_3K', 'auto_4K'];
      if (typeof imageSize === 'string' && v5Enums.includes(imageSize)) {
        falImageSize = imageSize;
      } else if (typeof imageSize === 'string' && imageSize.includes('x')) {
        // Parser le format "WIDTHxHEIGHT" en objet {width, height}
        const [w, h] = imageSize.split('x').map(Number);
        if (w && h) {
          falImageSize = { width: w, height: h };
          logger.info(`📐 Taille personnalisée: ${w}x${h}`);
        }
      } else if (imageSize === 'square') {
        falImageSize = 'square_hd';
      } else if (imageSize === 'landscape') {
        falImageSize = 'landscape_16_9';
      } else if (imageSize === 'portrait') {
        falImageSize = 'portrait_16_9';
      } else if (typeof imageSize === 'object' && imageSize.width && imageSize.height) {
        falImageSize = imageSize;
      }
      
      let falPayload;
      
      if (hasReferenceImages) {
        // Endpoint v5 /edit avec image_urls (jusqu'à 10 images utilisées)
        const imageUrls = referenceImages.map(img => {
          if (img.startsWith('http://') || img.startsWith('https://')) {
            return img;
          }
          if (img.startsWith('data:')) {
            return img;
          }
          return `data:image/png;base64,${img}`;
        });
        
        // En v5, l'influence des références se guide via le prompt (plus de param strength)
        const strengthNum = parseFloat(strength) || 0.7;
        const influenceHint = strengthNum >= 0.8
          ? 'Stay very faithful to the reference image(s): preserve the composition, style and key details.'
          : strengthNum >= 0.5
            ? 'Use the reference image(s) as a strong guide for style, subject and composition.'
            : 'Use the reference image(s) only as loose inspiration and feel free to reinterpret.';

        falPayload = {
          image_urls: imageUrls,
          prompt: `${prompt}. ${influenceHint}`,
          image_size: falImageSize,
          num_images: numImages,
          max_images: maxImages > 1 ? maxImages : undefined,
          enable_safety_checker: true
        };
        
        logger.info(`🖼️ SeedDream /edit avec ${imageUrls.length} image(s) de référence`);
      } else {
        // SeedDream 5.0 Lite text-to-image avec toutes les options v5
        falPayload = {
          prompt: prompt,
          num_images: numImages,
          max_images: maxImages > 1 ? maxImages : undefined,
          image_size: falImageSize,
          enable_safety_checker: true,
          enhance_prompt_mode: enhancePromptMode || 'standard'
        };
        // Ajouter le seed si fourni
        if (seed !== undefined && seed !== null && seed !== '') {
          falPayload.seed = parseInt(seed);
        }
      }

      logger.info(`🎨 Appel Fal.ai SeedDream 5.0 Lite: ${falEndpoint}`);
      
      response = await fetch(falEndpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Key ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(falPayload)
      });
    }

    if (!response.ok) {
      const errorBody = await response.text();
      const providerName = isOpenRouter ? 'OpenRouter' : 'Fal.ai';
      logger.error(`${providerName} API error: ${response.status} ${response.statusText}`, { errorBody });
      const classified = buildProviderError(providerName, response.status, errorBody, model);
      return res.status(response.status).json({ 
        success: false, 
        error: classified.message,
        code: classified.code,
        details: errorBody
      });
    }

    const result = await response.json();
    
    // 5. Parser le résultat selon le provider
    let images = [];
    
    if (isOpenRouter) {
      // OpenRouter retourne les images dans choices[0].message.images[]
      // Format: { type: "image_url", image_url: { url: "data:image/png;base64,..." } }
      const message = result.choices?.[0]?.message;
      
      if (message?.images && Array.isArray(message.images)) {
        for (const img of message.images) {
          if (img.image_url?.url) {
            images.push({ url: img.image_url.url });
          } else if (img.url) {
            images.push({ url: img.url });
          }
        }
      }
      
      // Fallback: chercher dans le content si c'est une URL ou base64
      if (images.length === 0 && message?.content) {
        const content = message.content;
        if (content.startsWith('data:image') || content.startsWith('http')) {
          images = [{ url: content }];
        }
      }
      
      logger.info(`📸 OpenRouter: ${images.length} image(s) trouvée(s)`);
    } else {
      // Fal.ai retourne directement images[]
      images = result.images || [];
    }
    
    // 6. Déduire les crédits via la méthode du modèle User
    const previousCredits = parseFloat(user.creditsBalance);
    await user.deductCredits(creditsNeeded, `Image IA - ${isOpenRouter ? 'OpenRouter' : 'Fal.ai'}`);
    
    logger.info(`✅ Image générée via ${isOpenRouter ? 'OpenRouter' : 'Fal.ai'}. Crédits: ${previousCredits} -> ${user.creditsBalance} (-${creditsNeeded})`);

    // 7. Retourner le résultat
    const imageUrl = images.length > 0 ? images[0].url : null;
    const imageUrls = images.map(img => img.url);
    
    res.json({ 
      success: true,
      imageUrl: imageUrl,
      imageUrls: imageUrls,
      images: images,
      seed: result.seed || null,
      creditsUsed: creditsNeeded,
      creditsDeducted: creditsNeeded,
      creditsRemaining: parseFloat(user.creditsBalance)
    });

  } catch (error) {
    logger.error('❌ Erreur dans /image/generate:', error);
    next(error);
  }
});

/**
 * POST /api/ai/image/edit
 * Édition d'image avec SeedDream 5.0 Lite (image-to-image)
 */
router.post('/edit', authenticateToken, async (req, res, next) => {
  const { prompt, imageUrl, model = 'seedream-v5-lite', imageSize = 'auto_2K', numImages = 1 } = req.body;
  const userId = req.user.id;

  if (!prompt) {
    return res.status(400).json({ success: false, error: 'Le prompt est obligatoire.' });
  }
  
  if (!imageUrl) {
    return res.status(400).json({ success: false, error: 'L\'URL de l\'image source est obligatoire.' });
  }

  try {
    // 1. Récupérer la clé API Fal.ai
    const falApiKey = await ApiKey.getServiceKey(userId, 'fal-edit');
    
    if (!falApiKey) {
      return res.status(500).json({ 
        success: false, 
        error: 'La clé API pour Fal.ai n\'est pas configurée. Configurez-la dans Config API.' 
      });
    }

    // 2. Calculer le coût en crédits (edit coûte plus cher)
    const creditsNeeded = await calculateImageCredits('fal-edit', model, 1);
    logger.info(`💰 Crédits nécessaires pour edit: ${creditsNeeded}`);

    // 3. Vérifier si l'utilisateur a assez de crédits
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ success: false, error: 'Utilisateur non trouvé.' });
    }
    
    if (parseFloat(user.creditsBalance) < creditsNeeded) {
      return res.status(402).json({ 
        success: false, 
        error: 'Crédits insuffisants.',
        creditsNeeded,
        creditsAvailable: parseFloat(user.creditsBalance)
      });
    }

    // 4. Appeler l'API Fal.ai SeedDream 5.0 Lite Edit
    const falEndpoint = 'https://fal.run/fal-ai/bytedance/seedream/v5/lite/edit';
    
    const falPayload = {
      prompt: prompt,
      image_urls: [imageUrl],
      image_size: imageSize,
      num_images: numImages,
      enable_safety_checker: true,
      output_format: 'jpeg'
    };

    logger.info(`🎨 Appel Fal.ai SeedDream Edit: ${falEndpoint}`);
    
    const response = await fetch(falEndpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Key ${falApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(falPayload)
    });

    if (!response.ok) {
      const errorBody = await response.text();
      logger.error(`Fal.ai API error: ${response.status} ${response.statusText}`, { errorBody });
      const classified = buildProviderError('Fal.ai', response.status, errorBody, model);
      return res.status(response.status).json({ 
        success: false, 
        error: classified.message,
        code: classified.code,
        details: errorBody
      });
    }

    const result = await response.json();
    
    // 5. Déduire les crédits via la méthode du modèle User
    const previousCredits = parseFloat(user.creditsBalance);
    await user.deductCredits(creditsNeeded, 'Image IA - Fal.ai Edit');
    
    logger.info(`✅ Image éditée. Crédits: ${previousCredits} -> ${user.creditsBalance} (-${creditsNeeded})`);

    // 6. Retourner le résultat
    res.json({ 
      success: true,
      images: result.images || [],
      creditsUsed: creditsNeeded,
      creditsRemaining: parseFloat(user.creditsBalance)
    });

  } catch (error) {
    logger.error('❌ Erreur dans /image/edit:', error);
    next(error);
  }
});

/**
 * POST /api/ai/image/gemini
 * Génération d'image avec Gemini 2.5 Flash (Nano Banana)
 */
// Coûts indicatifs par image GPT Image (tarifs OpenAI : sortie image 30 $/1M tokens)
const GPT_IMAGE_COST_PER_IMAGE = {
  low: 0.006,
  medium: 0.053,
  high: 0.211,
  xhigh: 0.32,
  max: 0.45,
  auto: 0.053
};

async function referenceImageToBuffer(image) {
  if (typeof image !== 'string' || !image) {
    throw new Error('Image de référence invalide');
  }

  if (image.startsWith('data:')) {
    const match = /^data:([^;]+);base64,(.*)$/s.exec(image);
    if (!match) throw new Error('Format de référence non reconnu');
    return { buffer: Buffer.from(match[2], 'base64'), mime: match[1] };
  }

  // Les fichiers restaurés depuis le serveur peuvent avoir un chemin relatif
  const url = image.startsWith('/') ? `https://api.assistant-redacteur.fr${image}` : image;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Impossible de télécharger l'image de référence (${response.status})`);
  }
  return {
    buffer: Buffer.from(await response.arrayBuffer()),
    mime: response.headers.get('content-type') || 'image/png'
  };
}

/**
 * POST /api/ai/image/openai
 * Génération / édition d'images avec GPT Image 2.6 (Sunburst ou Flare).
 */
router.post('/openai', authenticateToken, async (req, res) => {
  const {
    prompt,
    model = 'gpt-image-2.6-flare',
    size = '1024x1024',
    quality = 'medium',
    complexity = 'high',
    background = 'auto',
    outputFormat = 'png',
    outputCompression,
    numImages = 1,
    referenceImages = []
  } = req.body;
  const userId = req.user.id;

  if (!prompt) {
    return res.status(400).json({ success: false, error: 'Le prompt est obligatoire.' });
  }

  // Assainissement : une option inconnue ou une combinaison incompatible
  // ne doit jamais bloquer la génération (repli sur une valeur valide).
  const allowedModels = ['gpt-image-2.6-flare', 'gpt-image-2.6-sunburst'];
  const safeModel = allowedModels.includes(model) ? model : 'gpt-image-2.6-flare';
  const safeQuality = ['low', 'medium', 'high', 'xhigh', 'max', 'auto'].includes(quality) ? quality : 'medium';
  const safeComplexity = ['low', 'medium', 'high'].includes(complexity) ? complexity : 'high';
  const safeBackground = ['auto', 'opaque', 'transparent'].includes(background) ? background : 'auto';
  let safeFormat = ['png', 'jpeg', 'webp'].includes(outputFormat) ? outputFormat : 'png';
  // Un fond transparent exige PNG ou WebP : on corrige au lieu de renvoyer une erreur
  if (safeBackground === 'transparent' && !['png', 'webp'].includes(safeFormat)) {
    safeFormat = 'png';
  }
  const safeSize = (size === 'auto' || /^\d{3,4}x\d{3,4}$/.test(String(size))) ? size : '1024x1024';
  const safeCount = Math.min(Math.max(parseInt(numImages) || 1, 1), 10);

  try {
    const apiKey = await ApiKey.getServiceKey(userId, 'openai');
    if (!apiKey) {
      return res.status(500).json({
        success: false,
        error: 'La clé API OpenAI n\'est pas configurée. Configurez-la dans Config API.'
      });
    }

    const costPerImage = GPT_IMAGE_COST_PER_IMAGE[safeQuality] ?? GPT_IMAGE_COST_PER_IMAGE.medium;
    const creditsNeeded = await calculateImageCredits('gpt-image', safeModel, safeCount, costPerImage, true);

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ success: false, error: 'Utilisateur non trouvé.' });
    }

    if (parseFloat(user.creditsBalance) < creditsNeeded) {
      return res.status(402).json({
        success: false,
        error: 'Crédits insuffisants.',
        creditsNeeded,
        creditsAvailable: parseFloat(user.creditsBalance)
      });
    }

    // Identifiant de sécurité stable et anonymisé (recommandé par OpenAI)
    const safetyIdentifier = crypto.createHash('sha256').update(String(userId)).digest('hex');

    const isEdit = Array.isArray(referenceImages) && referenceImages.length > 0;
    let response;

    if (isEdit) {
      const form = new FormData();
      form.append('model', safeModel);
      form.append('safety_identifier', safetyIdentifier);
      form.append('prompt', prompt);
      form.append('size', safeSize);
      form.append('quality', safeQuality);
      form.append('complexity', safeComplexity);
      form.append('background', safeBackground);
      form.append('output_format', safeFormat);
      form.append('n', String(safeCount));
      if (outputCompression && ['jpeg', 'webp'].includes(safeFormat)) {
        form.append('output_compression', String(outputCompression));
      }

      for (let i = 0; i < referenceImages.length; i++) {
        const { buffer, mime } = await referenceImageToBuffer(referenceImages[i]);
        form.append('image[]', buffer, { filename: `reference-${i + 1}.png`, contentType: mime });
      }

      logger.info(`🎨 GPT Image edit: ${safeModel}, ${referenceImages.length} référence(s)`);
      response = await fetch('https://api.openai.com/v1/images/edits', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          ...form.getHeaders()
        },
        body: form
      });
    } else {
      const payload = {
        model: safeModel,
        prompt,
        size: safeSize,
        quality: safeQuality,
        complexity: safeComplexity,
        background: safeBackground,
        output_format: safeFormat,
        n: safeCount,
        safety_identifier: safetyIdentifier
      };

      if (outputCompression && ['jpeg', 'webp'].includes(safeFormat)) {
        payload.output_compression = parseInt(outputCompression);
      }

      logger.info(`🎨 GPT Image génération: ${safeModel}, qualité=${safeQuality}, taille=${safeSize}`);
      response = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
    }

    const bodyText = await response.text();

    if (!response.ok) {
      logger.error(`OpenAI image error: ${response.status} ${response.statusText}`, { errorBody: bodyText });
      const classified = classifyProviderError('OpenAI', response.status, bodyText, safeModel);
      return res.status(response.status).json({
        success: false,
        error: classified.message,
        code: classified.code,
        details: bodyText
      });
    }

    let data = {};
    try {
      data = JSON.parse(bodyText);
    } catch (e) {
      logger.warn('Réponse OpenAI non JSON', { bodyText: bodyText?.substring(0, 200) });
    }

    const mime = safeFormat === 'jpeg' ? 'image/jpeg'
      : safeFormat === 'webp' ? 'image/webp'
      : 'image/png';

    const images = (data.data || [])
      .map(item => item.b64_json ? `data:${mime};base64,${item.b64_json}` : item.url)
      .filter(Boolean);

    if (images.length === 0) {
      return res.status(502).json({ success: false, error: 'OpenAI n\'a renvoyé aucune image.' });
    }

    const previousCredits = parseFloat(user.creditsBalance);
    await user.deductCredits(creditsNeeded, 'Image IA - GPT Image');
    logger.info(`✅ GPT Image généré. Crédits: ${previousCredits} -> ${user.creditsBalance} (-${creditsNeeded})`);

    res.json({
      success: true,
      images,
      imageUrls: images,
      creditsUsed: creditsNeeded,
      creditsRemaining: parseFloat(user.creditsBalance),
      model,
      quality
    });
  } catch (error) {
    logger.error('Erreur GPT Image:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Erreur lors de la génération GPT Image.'
    });
  }
});

/**
 * GET /api/ai/image/fal-balance
 * Vérifie le solde réel du compte Fal.ai associé à la clé configurée.
 * Permet de diagnostiquer un message "plus de crédits" alors que le compte a été rechargé.
 */
router.get('/fal-balance', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  try {
    const falApiKey = await ApiKey.getServiceKey(userId, 'fal-tti')
      || await ApiKey.getServiceKey(userId, 'fal-edit');

    if (!falApiKey) {
      return res.status(500).json({
        success: false,
        error: 'Clé API Fal.ai non configurée. Configurez-la dans Config API.'
      });
    }

    const response = await fetch('https://api.fal.ai/v1/account/billing?expand=credits', {
      headers: {
        'Authorization': `Key ${falApiKey}`,
        'Accept': 'application/json'
      }
    });

    const body = await response.text();

    if (!response.ok) {
      logger.error(`Fal.ai billing error: ${response.status} ${response.statusText}`, { errorBody: body });
      if (response.status === 403) {
        return res.status(403).json({
          success: false,
          error: '⚠️ Impossible de lire le solde : la clé Fal.ai n\'a pas la permission de facturation. Créez une clé avec le preset BILLING, READONLY ou FULL sur fal.ai.',
          details: body
        });
      }
      return res.status(response.status).json({
        success: false,
        error: classifyProviderError('Fal.ai', response.status, body).message,
        details: body
      });
    }

    let data = {};
    try {
      data = JSON.parse(body);
    } catch (e) {
      data = { raw: body };
    }

    const credits = data.credits || {};
    res.json({
      success: true,
      balance: credits.current_balance ?? credits.balance ?? null,
      currency: credits.currency || 'USD',
      billing: data
    });
  } catch (error) {
    logger.error('Erreur vérification solde Fal.ai:', error);
    res.status(500).json({ success: false, error: 'Erreur lors de la vérification du solde Fal.ai.' });
  }
});

router.post('/gemini', authenticateToken, async (req, res, next) => {
  const { prompt, model = 'gemini-2.5-flash', negativePrompt, numImages = 1 } = req.body;
  const userId = req.user.id;

  if (!prompt) {
    return res.status(400).json({ success: false, error: 'Le prompt est obligatoire.' });
  }

  try {
    // 1. Récupérer la clé API Gemini
    let geminiApiKey = await ApiKey.getServiceKey(userId, 'gemini-image');
    if (!geminiApiKey) {
      geminiApiKey = await ApiKey.getServiceKey(userId, 'gemini-2.5-flash');
    }
    
    if (!geminiApiKey) {
      return res.status(500).json({ 
        success: false, 
        error: 'La clé API pour Gemini n\'est pas configurée. Configurez-la dans Config API.' 
      });
    }

    // 2. Calculer le coût en crédits
    const creditsNeeded = await calculateImageCredits('gemini-image', model, numImages);
    logger.info(`💰 Crédits nécessaires pour ${numImages} image(s) Gemini: ${creditsNeeded}`);

    // 3. Vérifier si l'utilisateur a assez de crédits
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ success: false, error: 'Utilisateur non trouvé.' });
    }
    
    if (parseFloat(user.creditsBalance) < creditsNeeded) {
      return res.status(402).json({ 
        success: false, 
        error: 'Crédits insuffisants.',
        creditsNeeded,
        creditsAvailable: parseFloat(user.creditsBalance)
      });
    }

    // 4. Appeler l'API Gemini pour génération d'image
    const geminiEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiApiKey}`;
    
    const geminiPayload = {
      contents: [{
        parts: [{
          text: `Generate an image: ${prompt}${negativePrompt ? `. Avoid: ${negativePrompt}` : ''}`
        }]
      }],
      generationConfig: {
        responseModalities: ["image", "text"],
        responseMimeType: "image/png"
      }
    };

    logger.info(`🎨 Appel Gemini Image: ${model}`);
    
    const response = await fetch(geminiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(geminiPayload)
    });

    if (!response.ok) {
      const errorBody = await response.text();
      logger.error(`Gemini API error: ${response.status} ${response.statusText}`, { errorBody });
      const classified = buildProviderError('Gemini', response.status, errorBody, model);
      return res.status(response.status).json({ 
        success: false, 
        error: classified.message,
        code: classified.code,
        details: errorBody
      });
    }

    const result = await response.json();
    
    // Extraire les images de la réponse Gemini
    const images = [];
    if (result.candidates && result.candidates[0]?.content?.parts) {
      for (const part of result.candidates[0].content.parts) {
        if (part.inlineData) {
          images.push({
            url: `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`,
            mimeType: part.inlineData.mimeType
          });
        }
      }
    }
    
    // 5. Déduire les crédits via la méthode du modèle User
    const previousCredits = parseFloat(user.creditsBalance);
    await user.deductCredits(creditsNeeded, 'Image IA - Gemini');
    
    logger.info(`✅ Image Gemini générée. Crédits: ${previousCredits} -> ${user.creditsBalance} (-${creditsNeeded})`);

    // 6. Retourner le résultat
    res.json({ 
      success: true,
      images: images,
      creditsUsed: creditsNeeded,
      creditsRemaining: parseFloat(user.creditsBalance)
    });

  } catch (error) {
    logger.error('❌ Erreur dans /image/gemini:', error);
    next(error);
  }
});

/**
 * GET /api/ai/image/estimate
 * Estimer le coût en crédits avant génération
 */
router.get('/estimate', authenticateToken, async (req, res) => {
  const { mode = 'tti', service = 'fal', numImages = 1 } = req.query;
  
  try {
    let serviceKey, modelKey;
    
    if (service === 'gemini') {
      serviceKey = 'gemini-image';
      modelKey = 'gemini-2.5-flash';
    } else if (mode === 'edit') {
      serviceKey = 'fal-edit';
      modelKey = 'seedream-v5-lite';
    } else {
      serviceKey = 'fal-tti';
      modelKey = 'seedream-v5-lite';
    }
    
    const creditsNeeded = await calculateImageCredits(serviceKey, modelKey, parseInt(numImages));
    
    res.json({
      success: true,
      service: serviceKey,
      mode,
      numImages: parseInt(numImages),
      creditsNeeded
    });
  } catch (error) {
    logger.error('Erreur estimation crédits:', error);
    res.status(500).json({ success: false, error: 'Erreur lors de l\'estimation' });
  }
});

/**
 * POST /api/ai/image/store
 * Télécharge une image depuis une URL externe, la stocke sur le serveur
 * et crée une vignette (largeur 300px, proportions conservées)
 */
router.post('/store', authenticateToken, async (req, res, next) => {
  const { imageUrl, prompt, originalId, projectTitle, aiProvider } = req.body;
  const userId = req.user.id;

  if (!imageUrl) {
    return res.status(400).json({ success: false, error: 'L\'URL de l\'image est obligatoire.' });
  }

  try {
    const fs = await import('fs');
    const path = await import('path');
    
    // Nouvelle architecture : /stockage/users/{userId}/images/generated/
    const storageBase = process.env.STORAGE_PATH || '/home/bure7653/assistant-redacteur/stockage';
    const imagesDir = path.default.join(storageBase, 'users', String(userId), 'images', 'generated');
    
    // Créer les dossiers récursivement
    if (!fs.default.existsSync(imagesDir)) {
      fs.default.mkdirSync(imagesDir, { recursive: true });
    }

    // Télécharger l'image ou décoder le base64
    let buffer;
    
    if (imageUrl.startsWith('data:')) {
      // Image en base64 (ex: Nano Banana)
      const base64Data = imageUrl.replace(/^data:image\/\w+;base64,/, '');
      buffer = Buffer.from(base64Data, 'base64');
      logger.info('📦 Image base64 décodée');
    } else {
      // URL HTTP classique (ex: Fal.ai)
      const response = await fetch(imageUrl);
      if (!response.ok) {
        throw new Error(`Erreur téléchargement image: ${response.status}`);
      }
      buffer = Buffer.from(await response.arrayBuffer());
      logger.info('📥 Image téléchargée depuis URL');
    }
    
    // Générer un nom de fichier unique avec préfixe du titre du projet
    const timestamp = Date.now();
    // Nettoyer le titre du projet pour l'utiliser dans le nom de fichier
    const cleanTitle = projectTitle 
      ? projectTitle.toLowerCase()
          .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // Supprimer accents
          .replace(/[^a-z0-9]+/g, '-') // Remplacer caractères spéciaux par -
          .replace(/^-+|-+$/g, '') // Supprimer - au début/fin
          .substring(0, 30) // Limiter à 30 caractères
      : '';
    // Ajouter le provider dans le nom pour pouvoir l'identifier plus tard
    const providerTag = aiProvider === 'seedream-v4' || aiProvider === 'seedream' || aiProvider === 'seedream-edit' || aiProvider === 'seedream-text-to-image' || aiProvider === 'seedream-v5-lite' ? 'sd' : 
                        aiProvider === 'nano-banana' || aiProvider === 'google/gemini-2.5-flash-image' ? 'nb' :
                        (typeof aiProvider === 'string' && aiProvider.startsWith('gpt-image')) ? 'gpt' : 'gen';
    // Utiliser le titre du projet comme préfixe au lieu de "img"
    const baseFileName = cleanTitle 
      ? `${cleanTitle}-${providerTag}-${timestamp}`
      : `image-${providerTag}-${timestamp}`;
    
    // Charger sharp dynamiquement
    const sharpModule = await getSharp();
    
    // Noms des fichiers - toujours en PNG (format universel)
    const ext = 'png';
    const originalFileName = `${baseFileName}.${ext}`;
    const vignetteFileName = `${baseFileName}_vignette.${ext}`;
    
    const originalFilePath = path.default.join(imagesDir, originalFileName);
    const vignetteFilePath = path.default.join(imagesDir, vignetteFileName);
    
    if (sharpModule) {
      // Convertir et sauvegarder l'image originale en PNG (format universel, qualité maximale)
      await sharpModule(buffer)
        .png({ compressionLevel: 6 })
        .toFile(originalFilePath);
      
      // Créer la vignette (largeur 300px, hauteur proportionnelle)
      await sharpModule(buffer)
        .resize({ width: 300, withoutEnlargement: true })
        .png({ compressionLevel: 8 })
        .toFile(vignetteFilePath);
    } else {
      // Fallback: sauvegarder le buffer directement sans conversion
      const fsPromises = await import('fs/promises');
      await fsPromises.writeFile(originalFilePath, buffer);
      // Pas de vignette sans sharp, utiliser l'original
      await fsPromises.writeFile(vignetteFilePath, buffer);
    }
    
    // Générer les URLs publiques - Nouvelle architecture
    const originalUrl = `https://api.assistant-redacteur.fr/stockage/users/${userId}/images/generated/${originalFileName}`;
    const vignetteUrl = `https://api.assistant-redacteur.fr/stockage/users/${userId}/images/generated/${vignetteFileName}`;
    
    logger.info(`📁 Image stockée: ${originalFilePath}`);
    logger.info(`📁 Vignette créée: ${vignetteFilePath}`);

    res.json({
      success: true,
      storedUrl: originalUrl,
      vignetteUrl: vignetteUrl,
      originalExternalUrl: imageUrl,
      fileName: originalFileName,
      vignetteFileName: vignetteFileName,
      prompt: prompt || ''
    });

  } catch (error) {
    logger.error('❌ Erreur stockage image:', error);
    res.status(500).json({ success: false, error: 'Erreur lors du stockage de l\'image' });
  }
});

/**
 * GET /api/ai/image/list
 * Liste les images stockées pour un utilisateur (avec vignettes)
 */
router.get('/list', authenticateToken, async (req, res, next) => {
  const userId = req.user.id;

  try {
    const fs = await import('fs');
    const path = await import('path');
    
    // Nouvelle architecture : /stockage/users/{userId}/images/generated/
    const storageBase = process.env.STORAGE_PATH || '/home/bure7653/assistant-redacteur/stockage';
    const imagesDir = path.default.join(storageBase, 'users', String(userId), 'images', 'generated');
    
    if (!fs.default.existsSync(imagesDir)) {
      return res.json({ success: true, images: [] });
    }

    const files = fs.default.readdirSync(imagesDir);
    
    // Filtrer les images originales (exclure les vignettes)
    const originalFiles = files.filter(f => 
      /\.(png|jpg|jpeg|gif|webp)$/i.test(f) && !f.includes('_vignette')
    );
    
    const images = originalFiles.map(fileName => {
      const baseName = fileName.replace(/\.[^.]+$/, '');
      const ext = fileName.match(/\.[^.]+$/)?.[0] || '.webp';
      const vignetteFileName = `${baseName}_vignette${ext}`;
      const vignetteExists = files.includes(vignetteFileName);
      
      // Extraire le provider du nom de fichier (img-sd-... ou img-nb-...)
      let aiProvider = null;
      if (fileName.includes('-sd-')) {
        aiProvider = 'seedream-v4';
      } else if (fileName.includes('-nb-')) {
        aiProvider = 'nano-banana';
      }
      
      return {
        fileName,
        url: `https://api.assistant-redacteur.fr/stockage/users/${userId}/images/generated/${fileName}`,
        vignetteUrl: vignetteExists 
          ? `https://api.assistant-redacteur.fr/stockage/users/${userId}/images/generated/${vignetteFileName}`
          : `https://api.assistant-redacteur.fr/stockage/users/${userId}/images/generated/${fileName}`,
        createdAt: fs.default.statSync(path.default.join(imagesDir, fileName)).mtime,
        aiProvider
      };
    }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json({ success: true, images });

  } catch (error) {
    logger.error('❌ Erreur liste images:', error);
    res.status(500).json({ success: false, error: 'Erreur lors de la récupération des images' });
  }
});

export default router;
