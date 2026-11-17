// Service pour la génération de contenu IA via le backend
import { buildCompletePrompt } from '../utils/promptBuilder';

const API_BASE_URL = import.meta.env.VITE_API_URL 
  ? import.meta.env.VITE_API_URL
  : 'http://localhost:4000';

export class AIService {
  /**
   * Méthode principale pour générer du contenu avec l'IA
   * @param {string} aiType - Type d'IA (gpt4, claude, gemini, etc.)
   * @param {object} data - Données complètes pour la génération
   * @returns {Promise<object>} Résultat de la génération
   */
  static async generateContent(aiType, data) {
    const imageModels = ['seedream-text-to-image', 'seedream-edit', 'nano-banana', 'gpt-image-2.6'];
    if (imageModels.includes(aiType)) {
      return this.generateImage(aiType, data);
    }
    console.log('🔍 AIService.generateContent appelé:', {
      aiType,
      hasFile: typeof data.content === 'object' && data.content.file,
      contentType: typeof data.content
    });
    
    // Gestion spéciale pour DeepL (traduction)
    if (aiType === 'deepl' || aiType.includes('deepl')) {
      return this.handleDeepLTranslation(data);
    }
    
    try {
      // Vérification des données (console.error pour forcer l'affichage en prod)
      console.error('🔍 [DEBUG] Données reçues:', {
        hasContent: !!data.content,
        contentLength: data.content?.length,
        hasProjectData: !!data.projectData,
        hasTasks: !!data.tasks,
        format: data.format
      });
      
      // Construire le prompt complet
      const promptData = buildCompletePrompt({
        content: data.content,
        projectData: data.projectData,
        selectedTasks: data.tasks || [],
        advancedOptions: data.advancedOptions || {},
        format: data.format
      });
      
      console.error('🔍 [DEBUG] Prompt construit:', {
        hasSystemPrompt: !!promptData.systemPrompt,
        hasUserPrompt: !!promptData.userPrompt,
        temperature: promptData.temperature,
        maxTokens: promptData.maxTokens
      });
      
      // Déterminer le service et le modèle
      const { service, model } = this.getServiceAndModel(aiType);
      
      // Construire les messages
      const messages = [];
      
      if (promptData.systemPrompt) {
        messages.push({
          role: 'system',
          content: promptData.systemPrompt
        });
      }
      
      messages.push({
        role: 'user',
        content: promptData.userPrompt
      });
      
      // Appeler le backend
      const token = localStorage.getItem('token');
      
      // Bloquer les utilisateurs non connectés
      if (!token) {
        return {
          success: false,
          error: 'Connexion requise',
          content: `⚠️ Vous devez être connecté pour utiliser l'IA.\n\n` +
                   `Créez un compte gratuit pour bénéficier de 10 générations gratuites par mois !\n\n` +
                   `Ensuite, rechargez votre compte pour continuer à utiliser l'assistant.`,
          needsLogin: true
        };
      }
      
      console.error('🔍 [DEBUG] Avant fetch:', {
        url: `${API_BASE_URL}/ai/generate`,
        service,
        model,
        messagesCount: messages.length,
        hasToken: !!token
      });
      
      // Préparer les headers
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };
      
      const response = await fetch(`${API_BASE_URL}/ai/generate`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          service,
          model,
          messages,
          maxTokens: promptData.maxTokens || 2000,
          temperature: promptData.temperature || 0.7
        })
      });
      
      console.error('🔍 [DEBUG] Après fetch:', {
        status: response.status,
        ok: response.ok
      });
      
      const result = await response.json();
      
      console.error('🔍 [DEBUG] Résultat JSON:', result);
      
      if (!response.ok) {
        // Gestion des erreurs spécifiques
        if (response.status === 401) {
          // Token expiré - forcer la reconnexion
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          window.location.href = '/login?expired=true';
          throw new Error('Session expirée. Veuillez vous reconnecter.');
        }
        
        if (response.status === 402) {
          return {
            success: false,
            error: 'Crédits insuffisants',
            content: `⚠️ Vous n'avez pas assez de crédits pour cette opération.\n\n` +
                     `Crédits requis : ${result.required || 'N/A'}\n` +
                     `Crédits disponibles : ${result.available || 0}\n\n` +
                     `Veuillez recharger votre compte pour continuer.`,
            needsRecharge: true
          };
        }
        
        if (response.status === 404) {
          return {
            success: false,
            error: 'Clé API non configurée',
            content: `⚠️ La clé API pour ${service} n'est pas configurée.\n\n` +
                     `Veuillez contacter l'administrateur pour configurer les clés API.`
          };
        }
        
        const providerError = new Error(result.error || result.message || 'Erreur lors de la génération');
        providerError.code = result.code;
        throw providerError;
      }
      
      // Succès
      return {
        success: true,
        content: result.content,
        usage: result.usage,
        credits: result.credits,
        metadata: result.metadata
      };
      
    } catch (error) {
      console.error('Erreur dans generateContent:', error);
      
      return {
        success: false,
        error: error.message,
        code: error.code,
        content: `⚠️ Erreur : ${error.message}`
      };
    }
  }
  
  /**
   * Détermine le service et le modèle à partir du type d'IA
   */
  static getServiceAndModel(aiType) {
    const type = aiType.toLowerCase();
    
    // OpenAI (modèles actuels équilibrés : terra = équilibre, luna = économique)
    if (type.includes('gpt-4o-mini') || type.includes('gpt-3.5') || type.includes('openai-mini') || type.includes('gpt-5.6-luna')) {
      return { service: 'openai', model: 'gpt-5.6-luna' };
    }
    if (type.includes('gpt') || type.includes('openai')) {
      return { service: 'openai', model: 'gpt-5.6-terra' };
    }

    // Anthropic Claude (sonnet = efficace, haiku = économique)
    if (type.includes('claude-3-haiku') || type.includes('claude-haiku')) {
      return { service: 'anthropic', model: 'claude-haiku-5-5' };
    }
    if (type.includes('claude')) {
      return { service: 'anthropic', model: 'claude-sonnet-5-5' };
    }
    
    // Google Gemini (via OpenRouter)
    // Texte : Gemini 3.1 Pro (remplace gemini-3-pro-preview, retiré du catalogue)
    if (type.includes('gemini-3.1-pro') || type.includes('gemini-3-pro') || type.includes('gemini-pro')) {
      return { service: 'openrouter', model: 'google/gemini-3.1-pro-preview' };
    }
    // Image : Nano Banana (Gemini 2.5 Flash Image)
    if (type.includes('gemini-2.5-flash') || type.includes('nano-banana')) {
      return { service: 'openrouter', model: 'google/gemini-2.5-flash-image' };
    }
    // Fallback texte : ne jamais renvoyer un modèle image pour du texte
    if (type.includes('gemini')) {
      return { service: 'openrouter', model: 'google/gemini-3.1-pro-preview' };
    }
    
    // DeepSeek
    if (type.includes('deepseek-v3')) {
      return { service: 'deepseek', model: 'deepseek-chat' };
    }
    if (type.includes('deepseek-reasoner')) {
      return { service: 'deepseek', model: 'deepseek-reasoner' };
    }
    if (type.includes('deepseek')) {
      return { service: 'deepseek', model: 'deepseek-chat' };
    }
    
    // Grok (via OpenRouter) — Grok 4.3, modèle actuel le plus accessible
    if (type.includes('grok')) {
      return { service: 'grok', model: 'grok-4.3' };
    }
    
    // Kimi (via OpenRouter)
    if (type.includes('kimi')) {
      return { service: 'kimi', model: 'moonshotai/kimi-k2-thinking' };
    }
    
    // Qwen3 (via OpenRouter) — 30B A3B Instruct (le variant thinking daté a été retiré)
    if (type.includes('qwen')) {
      return { service: 'qwen3', model: 'qwen3-30b-a3b-instruct-2507' };
    }
    
    // Mistral — Large 2512 (remplace mistral-large-2411)
    if (type.includes('mistral')) {
      return { service: 'mistral', model: 'mistral-large-2512' };
    }

    // Fal.ai (SeedDream 5.0 Lite)
    if (type.includes('seedream-text-to-image') || type.includes('fal-tti')) {
      return { service: 'fal-tti', model: 'seedream-v5-lite' };
    }
    if (type.includes('seedream-edit') || type.includes('fal-edit')) {
      return { service: 'fal-edit', model: 'seedream-v5-lite' };
    }
    
    // OpenRouter (Nano Banana / Gemini Image)
    if (type.includes('nano-banana')) {
      return { service: 'openrouter', model: 'google/gemini-2.5-flash-image' };
    }
    
    // Par défaut : Claude Sonnet
    return { service: 'anthropic', model: 'claude-sonnet-5-5' };
  }
  
  /**
   * Gestion spécifique DeepL (traduction)
   * Note: DeepL reste côté client car il gère les documents
   */
  /**
   * NOUVEAU : Gestion de la génération d'images
   */
  static async generateImage(aiType, data) {
    console.log('🖼️ AIService.generateImage appelé:', { aiType, data });
    const token = localStorage.getItem('token');
    if (!token) {
      return {
        success: false,
        error: 'Connexion requise',
        content: `⚠️ Vous devez être connecté pour générer une image.`,
        needsLogin: true
      };
    }

    try {
      const options = data.imageOptions || {};
      const isGptImage = aiType.startsWith('gpt-image');
      const { service, model: defaultModel } = this.getServiceAndModel(aiType);
      const model = isGptImage ? (options.gptModel || 'gpt-image-2.6-flare') : defaultModel;
      const prompt = data.content;

      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };

      // 1. Générer l'image via le fournisseur externe
      let response;

      if (isGptImage) {
        response = await fetch(`${API_BASE_URL}/ai/image/openai`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            prompt,
            model,
            size: options.gptSize || '1024x1024',
            quality: options.gptQuality || 'medium',
            complexity: options.gptComplexity || 'high',
            background: options.gptBackground || 'auto',
            outputFormat: options.gptFormat || 'png',
            outputCompression: options.gptCompression,
            numImages: options.count || 1,
            referenceImages: data.referenceImages || []
          })
        });
      } else {
        // Déterminer la taille d'image selon les enums Fal.ai v5 Lite
        let imageSize;

        // Si auto_2K, auto_3K ou auto_4K sélectionné, utiliser directement l'enum v5
        if (options.size === 'auto_2K' || options.size === 'auto_3K' || options.size === 'auto_4K') {
          imageSize = options.size;
        } else {
          // Mapper le ratio vers les enums Fal.ai v5
          const ratioToV5Enum = {
            '1:1': 'square_hd',
            '4:3': 'landscape_4_3',
            '16:9': 'landscape_16_9',
            '3:4': 'portrait_4_3',
            '9:16': 'portrait_16_9'
          };
          imageSize = ratioToV5Enum[options.ratio] || 'auto_2K';
        }

        response = await fetch(`${API_BASE_URL}/ai/image/generate`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            prompt,
            service,
            model,
            options,
            numImages: options.count || 1,
            maxImages: options.maxImages || 1,
            imageSize: imageSize,
            ratio: options.ratio || '1:1',
            referenceImages: data.referenceImages || [],
            negativePrompt: data.negativePrompt || '',
            strength: data.strength || 0.7,
            seed: options.seed || undefined,
            enhancePromptMode: options.enhancePromptMode || 'standard'
          })
        });
      }

      const result = await response.json();

      if (!response.ok) {
        if (response.status === 402) {
          const required = result.creditsNeeded ?? result.required ?? 'N/A';
          const available = result.creditsAvailable ?? result.available ?? 0;
          return {
            success: false,
            error: `Crédits insuffisants (requis : ${required}, disponibles : ${available})`,
            content: `⚠️ Vous n'avez pas assez de crédits pour générer cette image.\n\n` +
                     `Crédits requis : ${required}\n` +
                     `Crédits disponibles : ${available}\n\n` +
                     `Rechargez votre compte pour continuer.`,
            needsRecharge: true
          };
        }
        const providerError = new Error(result.error || result.details || 'Erreur lors de la génération de l\'image');
        providerError.code = result.code;
        throw providerError;
      }

      // 2. Stocker l'image localement avec création de vignette
      const externalUrls = result.imageUrls || [result.imageUrl];
      const storedImages = [];
      
      // Récupérer le titre du projet pour nommer les fichiers
      const projectTitle = data.projectData?.projectTitle || '';

      for (let i = 0; i < externalUrls.length; i++) {
        const externalUrl = externalUrls[i];
        try {
          const storeResponse = await fetch(`${API_BASE_URL}/ai/image/store`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
              imageUrl: externalUrl,
              prompt: prompt,
              originalId: `gen-${Date.now()}-${i}`,
              projectTitle: projectTitle,
              aiProvider: model // Envoyer le provider pour l'identifier dans le nom du fichier
            })
          });

          if (storeResponse.ok) {
            const storeResult = await storeResponse.json();
            storedImages.push({
              url: storeResult.storedUrl,
              vignetteUrl: storeResult.vignetteUrl,
              originalExternalUrl: externalUrl
            });
            console.log('📁 Image stockée localement:', storeResult.storedUrl);
          } else {
            // Fallback: utiliser l'URL externe si le stockage échoue
            console.warn('⚠️ Stockage local échoué, utilisation URL externe');
            storedImages.push({
              url: externalUrl,
              vignetteUrl: externalUrl,
              originalExternalUrl: externalUrl
            });
          }
        } catch (storeError) {
          console.warn('⚠️ Erreur stockage local:', storeError);
          storedImages.push({
            url: externalUrl,
            vignetteUrl: externalUrl,
            originalExternalUrl: externalUrl
          });
        }
      }

      // Retourner les URLs locales (ou externes en fallback)
      return {
        success: true,
        imageUrl: storedImages[0]?.url || result.imageUrl,
        vignetteUrl: storedImages[0]?.vignetteUrl || result.imageUrl,
        imageUrls: storedImages.map(img => img.url),
        vignetteUrls: storedImages.map(img => img.vignetteUrl),
        storedImages: storedImages,
        seed: result.seed || null,
        creditsDeducted: result.creditsDeducted
      };

    } catch (error) {
      console.error('Erreur dans generateImage:', error);
      return {
        success: false,
        error: error.message,
        content: `⚠️ Erreur : ${error.message}`
      };
    }
  }

  static async handleDeepLTranslation(data) {
    // Importer l'ancien service pour DeepL
    const { AIService: OldAIService } = await import('./aiServiceOld.js');
    return OldAIService.handleDeepLTranslation(data);
  }
  
  /**
   * Récupère les tarifs actuels pour afficher une estimation
   */
  static async getPricing() {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        return null;
      }
      
      const response = await fetch(`${API_BASE_URL}/ai/pricing`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        return data.pricing;
      }
      
      return null;
    } catch (error) {
      console.error('Erreur récupération tarifs:', error);
      return null;
    }
  }
  
  /**
   * Estime le coût d'une génération
   */
  static async estimateCost(aiType, estimatedTokens = 1000) {
    const pricing = await this.getPricing();
    
    if (!pricing) {
      return null;
    }
    
    const { service, model } = this.getServiceAndModel(aiType);
    const serviceCosts = pricing.serviceCosts[service];
    
    if (!serviceCosts) {
      return null;
    }
    
    const modelCosts = serviceCosts[model] || Object.values(serviceCosts)[0];
    
    if (!modelCosts) {
      return null;
    }
    
    // Estimation : 30% input, 70% output
    const inputTokens = estimatedTokens * 0.3;
    const outputTokens = estimatedTokens * 0.7;
    
    const cost = (inputTokens * modelCosts.input / 1000) + 
                 (outputTokens * modelCosts.output / 1000);
    
    return Math.max(0.01, Math.ceil(cost * 100) / 100);
  }
}

export default AIService;
