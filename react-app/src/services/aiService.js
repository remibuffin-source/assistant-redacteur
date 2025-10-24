// Service pour la génération de contenu IA
import { buildCompletePrompt } from '../utils/promptBuilder';

export class AIService {
  /**
   * Méthode principale pour générer du contenu avec l'IA
   * @param {string} aiType - Type d'IA (gpt4, claude, gemini, etc.)
   * @param {object} data - Données complètes pour la génération
   * @returns {Promise<object>} Résultat de la génération
   */
  static async generateContent(aiType, data) {
    console.log('🔍 AIService.generateContent appelé:', {
      aiType,
      hasFile: typeof data.content === 'object' && data.content.file,
      contentType: typeof data.content
    });
    
    // Gestion spéciale pour DeepL (traduction)
    if (aiType === 'deepl' || aiType.includes('deepl')) {
      return this.handleDeepLTranslation(data);
    }
    
    // Vérifier si les clés API sont configurées
    const useRealAPI = this.checkAPIAvailability(aiType);
    console.log(`🔑 Clé API pour ${aiType}:`, useRealAPI ? '✅ Disponible' : '❌ Non configurée');
    
    if (useRealAPI) {
      return this.generateWithRealAPI(aiType, data);
    } else {
      // Fallback sur simulation si pas de clé API
      console.warn(`⚠️ Clé API non configurée pour ${aiType}, utilisation de la simulation`);
      return this.simulateAICall(aiType, data);
    }
  }

  /**
   * Détecte la langue cible depuis la description du projet
   */
  static detectTargetLanguage(projectDescription) {
    if (!projectDescription) return 'EN';
    
    const desc = projectDescription.toLowerCase();
    
    // Détection par mots-clés
    const languageKeywords = {
      'DE': ['allemand', 'deutsch', 'german', 'allemagne', 'germany'],
      'ES': ['espagnol', 'español', 'spanish', 'espagne', 'spain'],
      'FR': ['français', 'french', 'france'],
      'IT': ['italien', 'italiano', 'italian', 'italie', 'italy'],
      'PT': ['portugais', 'português', 'portuguese', 'portugal', 'brésil', 'brazil'],
      'NL': ['néerlandais', 'dutch', 'pays-bas', 'netherlands'],
      'PL': ['polonais', 'polish', 'pologne', 'poland'],
      'RU': ['russe', 'russian', 'russie', 'russia'],
      'ZH': ['chinois', 'chinese', 'chine', 'china'],
      'JA': ['japonais', 'japanese', 'japon', 'japan'],
      'KO': ['coréen', 'korean', 'corée', 'korea'],
      'AR': ['arabe', 'arabic'],
      'TR': ['turc', 'turkish', 'turquie', 'turkey'],
      'SV': ['suédois', 'swedish', 'suède', 'sweden'],
      'DA': ['danois', 'danish', 'danemark', 'denmark'],
      'FI': ['finnois', 'finnish', 'finlande', 'finland'],
      'NO': ['norvégien', 'norwegian', 'norvège', 'norway'],
      'CS': ['tchèque', 'czech'],
      'RO': ['roumain', 'romanian', 'roumanie', 'romania'],
      'BG': ['bulgare', 'bulgarian', 'bulgarie', 'bulgaria'],
      'EL': ['grec', 'greek', 'grèce', 'greece'],
      'HU': ['hongrois', 'hungarian', 'hongrie', 'hungary'],
      'UK': ['ukrainien', 'ukrainian', 'ukraine'],
      'ID': ['indonésien', 'indonesian', 'indonésie', 'indonesia'],
      'EN': ['anglais', 'english', 'royaume-uni', 'uk', 'usa', 'états-unis']
    };
    
    // Chercher la première correspondance
    for (const [langCode, keywords] of Object.entries(languageKeywords)) {
      if (keywords.some(keyword => desc.includes(keyword))) {
        return langCode;
      }
    }
    
    // Par défaut : anglais
    return 'EN';
  }

  /**
   * Gestion spécifique DeepL : détection texte vs document
   */
  static async handleDeepLTranslation(data) {
    const { content, projectData } = data;
    
    // Récupérer la langue cible (priorité : champ dédié > détection description > défaut EN)
    const targetLang = projectData?.targetLanguage 
      || this.detectTargetLanguage(projectData?.projectDescription)
      || 'EN';
    
    console.log('🌐 DeepL Translation Request:', {
      contentLength: content?.length,
      targetLang,
      projectDescription: projectData?.projectDescription,
      hasProjectData: !!projectData
    });
    
    // Vérifier si c'est un document (fichier attaché)
    const hasAttachment = this.checkForAttachment(content);
    
    if (hasAttachment) {
      // Traduction de document
      console.log('📄 DeepL: Document translation detected');
      return await this.translateDocument(content, targetLang);
    } else {
      // Traduction de texte
      console.log('📝 DeepL: Text translation detected');
      return await this.translateText(content, targetLang);
    }
  }

  /**
   * Vérifie si le contenu contient une pièce jointe
   */
  static checkForAttachment(content) {
    if (!content) return false;
    
    // Vérifier si c'est un objet File
    if (content instanceof File || content instanceof Blob) {
      return true;
    }
    
    // Vérifier si c'est une structure de données avec fichier
    if (typeof content === 'object' && content.file) {
      return true;
    }
    
    // Vérifier si le contenu HTML contient des balises de fichier
    if (typeof content === 'string') {
      const hasFileLink = /<a[^>]*download[^>]*>/i.test(content);
      const hasFileInput = /type="file"/i.test(content);
      return hasFileLink || hasFileInput;
    }
    
    return false;
  }

  /**
   * Traduction de texte simple
   */
  static async translateText(text, targetLang) {
    const apiKey = import.meta.env.VITE_DEEPL_API_KEY;
    
    if (!apiKey || apiKey === 'votre_cle_api_deepl_ici') {
      console.warn('Clé API DeepL non configurée, utilisation de la simulation');
      return this.simulateAICall('deepl', { content: text });
    }
    
    try {
      return await this.callDeepLAPI(text, {
        targetLang,
        sourceLang: null // Détection automatique
      });
    } catch (error) {
      console.error('Erreur traduction texte DeepL:', error);
      return {
        success: false,
        error: error.message,
        content: `⚠️ Erreur de traduction: ${error.message}`
      };
    }
  }

  /**
   * Traduction de document
   */
  static async translateDocument(fileContent, targetLang) {
    const apiKey = import.meta.env.VITE_DEEPL_API_KEY;
    
    if (!apiKey || apiKey === 'votre_cle_api_deepl_ici') {
      return {
        success: false,
        error: 'Clé API DeepL requise pour la traduction de documents',
        content: '⚠️ La traduction de documents nécessite une clé API DeepL valide.'
      };
    }
    
    try {
      // Extraire le fichier
      let file = fileContent;
      if (typeof fileContent === 'object' && fileContent.file) {
        file = fileContent.file;
      }
      
      if (!(file instanceof File || file instanceof Blob)) {
        throw new Error('Format de fichier invalide');
      }
      
      // Vérifier que le format est supporté par DeepL
      const supportedFormats = [
        '.pdf', '.docx', '.pptx', '.xlsx',  // Microsoft Office
        '.txt', '.html', '.htm',             // Texte
        '.xlf', '.xliff'                     // Formats de localisation
      ];
      
      const fileName = file.name.toLowerCase();
      const isSupported = supportedFormats.some(ext => fileName.endsWith(ext));
      
      if (!isSupported) {
        const fileExt = fileName.split('.').pop().toUpperCase();
        throw new Error(
          `Format ${fileExt} non supporté par DeepL.\n\n` +
          `Formats supportés : PDF, DOCX, PPTX, XLSX, TXT, HTML, XLF, XLIFF\n\n` +
          `⚠️ Les formats ODT, DOC, RTF ne sont pas supportés.\n` +
          `💡 Convertissez votre fichier en DOCX ou PDF avant de le traduire.`
        );
      }
      
      const isFreeKey = apiKey.endsWith(':fx');
      const baseUrl = isFreeKey 
        ? 'https://api-free.deepl.com/v2/document'
        : 'https://api.deepl.com/v2/document';
      
      // Étape 1 : Upload du document
      console.log('📤 Upload document vers DeepL...');
      const formData = new FormData();
      formData.append('file', file);
      formData.append('target_lang', targetLang.toUpperCase());
      
      const uploadResponse = await fetch(baseUrl, {
        method: 'POST',
        headers: {
          'Authorization': `DeepL-Auth-Key ${apiKey}`
        },
        body: formData
      });
      
      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json().catch(() => ({}));
        throw new Error(`Erreur upload (${uploadResponse.status}): ${errorData.message || uploadResponse.statusText}`);
      }
      
      const { document_id, document_key } = await uploadResponse.json();
      console.log('✅ Document uploadé:', document_id);
      
      // Étape 2 : Polling du statut
      console.log('⏳ Traduction en cours...');
      let status = 'queued';
      let attempts = 0;
      const maxAttempts = 60; // 2 minutes max
      
      while (status !== 'done' && status !== 'error' && attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 2000)); // Attendre 2s
        
        const statusResponse = await fetch(`${baseUrl}/${document_id}`, {
          method: 'POST',
          headers: {
            'Authorization': `DeepL-Auth-Key ${apiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ document_key })
        });
        
        if (!statusResponse.ok) {
          throw new Error(`Erreur statut (${statusResponse.status})`);
        }
        
        const statusData = await statusResponse.json();
        status = statusData.status;
        attempts++;
        
        console.log(`📊 Statut: ${status} (tentative ${attempts}/${maxAttempts})`);
      }
      
      if (status === 'error') {
        throw new Error('Erreur lors de la traduction du document');
      }
      
      if (status !== 'done') {
        throw new Error('Timeout: la traduction prend trop de temps');
      }
      
      // Étape 3 : Téléchargement du résultat
      console.log('📥 Téléchargement du document traduit...');
      const resultResponse = await fetch(`${baseUrl}/${document_id}/result`, {
        method: 'POST',
        headers: {
          'Authorization': `DeepL-Auth-Key ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ document_key })
      });
      
      if (!resultResponse.ok) {
        throw new Error(`Erreur téléchargement (${resultResponse.status})`);
      }
      
      const blob = await resultResponse.blob();
      const url = URL.createObjectURL(blob);
      
      console.log('✅ Document traduit disponible');
      
      return {
        success: true,
        content: `✅ Document traduit avec succès !\n\n📄 Fichier original : ${file.name}\n🌐 Langue cible : ${targetLang}\n📥 [Télécharger le document traduit](${url})`,
        documentUrl: url,
        fileName: file.name,
        model: 'deepl-document'
      };
      
    } catch (error) {
      console.error('Erreur traduction document DeepL:', error);
      return {
        success: false,
        error: error.message,
        content: `⚠️ Erreur de traduction du document: ${error.message}`
      };
    }
  }

  /**
   * Vérifie si une clé API est disponible pour le type d'IA
   */
  static checkAPIAvailability(aiType) {
    try {
      // Déterminer quelle clé API utiliser selon le type d'IA
      let apiKey = null;
      
      // OpenAI (GPT-4, GPT-4o, GPT-4o Mini, GPT-4 Vision, Whisper)
      if (aiType.includes('gpt') || aiType.includes('whisper')) {
        apiKey = import.meta.env.VITE_OPENAI_API_KEY;
      }
      // Anthropic (Claude)
      else if (aiType.includes('claude')) {
        apiKey = import.meta.env.VITE_CLAUDE_API_KEY;
      }
      // Google (Gemini)
      else if (aiType.includes('gemini')) {
        apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      }
      // DeepSeek
      else if (aiType.includes('deepseek')) {
        apiKey = import.meta.env.VITE_DEEPSEEK_API_KEY;
      }
      // xAI (Grok)
      else if (aiType.includes('grok')) {
        apiKey = import.meta.env.VITE_GROK_API_KEY;
      }
      // Kimi (OpenRouter)
      else if (aiType.includes('kimi')) {
        apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;
      }
      // DeepL
      else if (aiType.includes('deepl')) {
        apiKey = import.meta.env.VITE_DEEPL_API_KEY;
      }
      // ElevenLabs
      else if (aiType.includes('elevenlabs')) {
        apiKey = import.meta.env.VITE_ELEVENLABS_API_KEY;
      }

      const isValid = apiKey && apiKey !== 'votre_cle_api_ici' && apiKey.length > 10;
      
      if (!isValid) {
        console.log(`⚠️ Clé API manquante ou invalide pour ${aiType}`);
      }
      
      return isValid;
    } catch (error) {
      console.error('Erreur vérification clé API:', error);
      return false;
    }
  }

  /**
   * Génère du contenu avec une vraie API IA
   */
  static async generateWithRealAPI(aiType, data) {
    try {
      // Vérifier si c'est un contenu multimodal (avec fichier)
      const hasFile = typeof data.content === 'object' && data.content.file;
      
      console.log('🔍 generateWithRealAPI - Vérification fichier:', {
        hasFile,
        contentType: typeof data.content,
        isObject: typeof data.content === 'object',
        hasFileProperty: data.content && data.content.file !== undefined,
        content: data.content
      });
      
      if (hasFile) {
        console.log('📎 Contenu multimodal détecté, traitement du fichier...');
        return await this.handleMultimodalContent(aiType, data);
      }
      
      // Construire le prompt complet avec tous les paramètres
      const promptData = buildCompletePrompt({
        content: data.content,
        projectData: data.projectData,
        selectedTasks: data.tasks || [],
        advancedOptions: data.advancedOptions || {},
        format: data.format
      });

      // Appeler l'API appropriée
      if (aiType.includes('gpt') || aiType === 'gpt4') {
        return await this.callOpenAIAPI(promptData.userPrompt, {
          model: this.getOpenAIModel(aiType),
          temperature: promptData.temperature,
          max_tokens: promptData.maxTokens,
          systemMessage: promptData.systemPrompt
        });
      } else if (aiType.includes('claude')) {
        return await this.callClaudeAPI(promptData.userPrompt, {
          model: this.getClaudeModel(aiType),
          temperature: promptData.temperature,
          max_tokens: promptData.maxTokens,
          systemMessage: promptData.systemPrompt
        });
      } else if (aiType.includes('gemini')) {
        return await this.callGeminiAPI(promptData.userPrompt, {
          model: this.getGeminiModel(aiType),
          temperature: promptData.temperature,
          maxOutputTokens: promptData.maxTokens
        });
      } else if (aiType.includes('deepseek')) {
        return await this.callDeepSeekAPI(promptData.userPrompt, {
          model: this.getDeepSeekModel(aiType),
          temperature: promptData.temperature,
          max_tokens: promptData.maxTokens,
          systemMessage: promptData.systemPrompt
        });
      } else if (aiType.includes('grok')) {
        return await this.callGrokAPI(promptData.userPrompt, {
          model: this.getGrokModel(aiType),
          temperature: promptData.temperature,
          max_tokens: promptData.maxTokens,
          systemMessage: promptData.systemPrompt
        });
      } else if (aiType.includes('kimi')) {
        return await this.callKimiAPI(promptData.userPrompt, {
          model: this.getKimiModel(aiType),
          temperature: promptData.temperature,
          max_tokens: promptData.maxTokens,
          systemMessage: promptData.systemPrompt
        });
      } else if (aiType.includes('deepl')) {
        return await this.callDeepLAPI(promptData.userPrompt, {
          targetLang: promptData.targetLang || 'FR'
        });
      }

      // Fallback si type inconnu
      return this.simulateAICall(aiType, data);

    } catch (error) {
      console.error(`Erreur génération avec ${aiType}:`, error);
      
      // En cas d'erreur, retourner simulation avec message d'erreur
      return {
        success: false,
        error: error.message,
        content: `⚠️ Erreur API: ${error.message}\n\n` + 
                 `Utilisation du mode simulation à la place.\n\n` +
                 this.generateSampleContent(aiType, data)
      };
    }
  }

  /**
   * Gère le contenu multimodal (fichiers)
   */
  static async handleMultimodalContent(aiType, data) {
    const { content } = data;
    const file = content.file;
    const text = content.text || '';
    const mediaType = content.mediaType;
    
    console.log(`🎯 Traitement multimodal: ${mediaType} avec ${aiType}`);
    
    // Construire le prompt avec le texte d'instruction
    const promptData = buildCompletePrompt({
      content: text,
      projectData: data.projectData,
      selectedTasks: data.tasks || [],
      advancedOptions: data.advancedOptions || {},
      format: data.format
    });
    
    // Selon le type de média, convertir le fichier
    try {
      if (mediaType === 'image') {
        // Convertir l'image en base64
        const base64 = await this.fileToBase64(file);
        return await this.callMultimodalAPI(aiType, promptData, {
          type: 'image',
          data: base64,
          mimeType: file.type
        });
      } else if (mediaType === 'audio') {
        // Pour l'audio, utiliser Whisper ou équivalent
        return await this.transcribeAudio(aiType, file, promptData);
      } else if (mediaType === 'text' || mediaType === 'spreadsheet') {
        // Pour PDF, Excel, etc., extraire le texte
        const extractedText = await this.extractTextFromFile(file, mediaType);
        // Combiner avec l'instruction
        const fullPrompt = `${promptData.userPrompt}\n\n=== CONTENU DU FICHIER ===\n${extractedText}`;
        
        // Appeler l'API avec le texte extrait
        if (aiType.includes('gpt') || aiType === 'gpt4') {
          return await this.callOpenAIAPI(fullPrompt, {
            model: this.getOpenAIModel(aiType),
            temperature: promptData.temperature,
            max_tokens: promptData.maxTokens,
            systemMessage: promptData.systemPrompt
          });
        } else if (aiType.includes('grok')) {
          return await this.callGrokAPI(fullPrompt, {
            model: this.getGrokModel(aiType),
            temperature: promptData.temperature,
            max_tokens: promptData.maxTokens,
            systemMessage: promptData.systemPrompt
          });
        } else if (aiType.includes('deepseek')) {
          return await this.callDeepSeekAPI(fullPrompt, {
            model: this.getDeepSeekModel(aiType),
            temperature: promptData.temperature,
            max_tokens: promptData.maxTokens,
            systemMessage: promptData.systemPrompt
          });
        } else if (aiType.includes('claude')) {
          return await this.callClaudeAPI(fullPrompt, {
            model: this.getClaudeModel(aiType),
            temperature: promptData.temperature,
            max_tokens: promptData.maxTokens,
            systemMessage: promptData.systemPrompt
          });
        }
      }
      
      throw new Error(`Type de média non supporté: ${mediaType}`);
      
    } catch (error) {
      console.error('Erreur traitement multimodal:', error);
      return {
        success: false,
        error: error.message,
        content: `⚠️ Erreur traitement fichier: ${error.message}`
      };
    }
  }

  /**
   * Convertit un fichier en base64
   */
  static fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  /**
   * Extrait le texte d'un fichier PDF ou Excel
   */
  static async extractTextFromFile(file, mediaType) {
    // Pour l'instant, retourner un placeholder
    // TODO: Implémenter extraction réelle avec pdf.js ou xlsx
    console.warn(`⚠️ Extraction de texte non implémentée pour ${mediaType}`);
    return `[Contenu du fichier ${file.name} - Extraction en cours d'implémentation]`;
  }

  /**
   * Transcrit un fichier audio
   */
  static async transcribeAudio(aiType, file, promptData) {
    // TODO: Implémenter transcription audio avec Whisper
    console.warn('⚠️ Transcription audio non implémentée');
    return {
      success: false,
      error: 'Transcription audio en cours d\'implémentation',
      content: '⚠️ La transcription audio sera bientôt disponible.'
    };
  }

  /**
   * Appelle une API multimodale (vision)
   */
  static async callMultimodalAPI(aiType, promptData, media) {
    // Pour l'instant, seul GPT-4 Vision est supporté
    if (aiType.includes('gpt') && aiType.includes('vision')) {
      return await this.callGPTVisionAPI(promptData.userPrompt, media, {
        model: 'gpt-4-vision-preview',
        temperature: promptData.temperature,
        max_tokens: promptData.maxTokens
      });
    }
    
    throw new Error(`Vision non supportée pour ${aiType}`);
  }

  /**
   * Appelle l'API GPT-4 Vision
   */
  static async callGPTVisionAPI(prompt, media, options) {
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    
    if (!apiKey || apiKey === 'votre_cle_api_openai_ici') {
      throw new Error('Clé API OpenAI requise pour GPT-4 Vision');
    }
    
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: options.model || 'gpt-4-vision-preview',
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: prompt
                },
                {
                  type: 'image_url',
                  image_url: {
                    url: `data:${media.mimeType};base64,${media.data}`
                  }
                }
              ]
            }
          ],
          max_tokens: options.max_tokens || 4000,
          temperature: options.temperature || 0.7
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Erreur API OpenAI Vision (${response.status}): ${errorData.error?.message || response.statusText}`);
      }
      
      const result = await response.json();
      
      return {
        success: true,
        content: result.choices[0].message.content,
        model: result.model,
        usage: result.usage
      };
      
    } catch (error) {
      console.error('Erreur GPT-4 Vision:', error);
      throw error;
    }
  }

  /**
   * Retourne le modèle OpenAI approprié
   */
  static getOpenAIModel(aiType) {
    const models = {
      'gpt4': 'gpt-4',
      'gpt-4': 'gpt-4',
      'gpt-4o': 'gpt-4o',
      'gpt-4o-mini': 'gpt-4o-mini'
    };
    return models[aiType] || 'gpt-4';
  }

  /**
   * Retourne le modèle Claude approprié
   */
  static getClaudeModel(aiType) {
    const models = {
      'claude': 'claude-3-sonnet-20240229',
      'claude-3-opus': 'claude-3-opus-20240229',
      'claude-3-sonnet': 'claude-3-sonnet-20240229',
      'claude-3-haiku': 'claude-3-haiku-20240307'
    };
    return models[aiType] || 'claude-3-sonnet-20240229';
  }

  /**
   * Retourne le modèle Gemini approprié
   */
  static getGeminiModel(aiType) {
    const models = {
      'gemini': 'gemini-pro',
      'gemini-pro': 'gemini-pro'
    };
    return models[aiType] || 'gemini-pro';
  }

  /**
   * Retourne le modèle DeepSeek approprié
   */
  static getDeepSeekModel(aiType) {
    const models = {
      'deepseek': 'deepseek-chat',              // V3.2-Exp mode normal
      'deepseek-chat': 'deepseek-chat',         // V3.2-Exp mode normal
      'deepseek-reasoner': 'deepseek-reasoner', // V3.2-Exp mode thinking
      'deepseek-coder': 'deepseek-chat'         // Utilise aussi V3.2-Exp
    };
    return models[aiType] || 'deepseek-chat';
  }

  /**
   * Retourne le modèle Grok approprié
   */
  static getGrokModel(aiType) {
    const models = {
      'grok': 'grok-4-fast-reasoning',
      'grok-2': 'grok-4-fast-reasoning',
      'grok-4': 'grok-4-fast-reasoning'
    };
    return models[aiType] || 'grok-4-fast-reasoning';
  }

  /**
   * Retourne le modèle Kimi approprié (via OpenRouter)
   */
  static getKimiModel(aiType) {
    const models = {
      'kimi': 'moonshotai/kimi-k2-0905',
      'kimi2': 'moonshotai/kimi-k2-0905'
    };
    return models[aiType] || 'moonshotai/kimi-k2-0905';
  }

  static async simulateAICall(aiType, data) {
    // Simulation d'un délai d'API
    await new Promise(resolve => setTimeout(resolve, 2000));

    return {
      success: true,
      content: this.generateSampleContent(aiType, data)
    };
  }

  static generateSampleContent(aiType, data) {
    const templates = {
      claude: `En tant qu'assistant rédactionnel Claude, j'ai analysé votre contenu et voici ma proposition :

**Analyse du contenu source:**
- Longueur: ${data.content.length} caractères
- Complexité: ${data.content.split(' ').length > 100 ? 'Élevée' : 'Moyenne'}

**Recommandations:**
1. Structurez votre contenu en sections claires
2. Utilisez un langage adapté à votre public cible
3. Ajoutez des appels à l'action pertinents

**Contenu optimisé:**
${data.content.slice(0, 200)}... [contenu développé et optimisé]`,

      gpt4: `**GPT-4 Analysis Complete**

📊 **Statistiques:**
- Mots: ${data.content.split(' ').length}
- Score de lisibilité: 75/100
- Ton: Professionnel

🎯 **Suggestions d'amélioration:**
- Ajouter des sous-titres
- Renforcer les arguments principaux
- Optimiser pour le référencement

💡 **Contenu généré:**
${data.content.slice(0, 150)}... [version améliorée avec insights IA]`,

      gemini: `**Gemini Pro - Rapport de génération**

🔍 **Analyse sémantique:**
- Thèmes principaux identifiés
- Sentiment: Positif
- Complexité: Modérée

🚀 **Recommandations:**
- Structure hiérarchique recommandée
- Mots-clés à inclure
- Longueur idéale: 500-800 mots

📝 **Résultat:**
${data.content.slice(0, 180)}... [contenu restructuré et enrichi]`
    };

    const baseContent = `
# Résultat généré par ${aiType.toUpperCase()}

## Projet: ${data.title || 'Sans titre'}

### Public cible: ${data.audience || 'Non spécifié'}

### Description: ${data.description || 'Aucune description'}

---

## Contenu généré:

${templates[aiType] || `Contenu généré par ${aiType}:\n\n${data.content}`}

---

*Généré le ${new Date().toLocaleString('fr-FR')}*
*IA utilisée: ${aiType.toUpperCase()}*
    `.trim();

    return baseContent;
  }

  // Méthodes pour les appels API réels
  static async callOpenAIAPI(prompt, options = {}) {
    let apiKey;
    try {
      // Pour Vite en développement
      apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    } catch {
      // Pour Jest en test
      apiKey = process.env.VITE_OPENAI_API_KEY || 'test-api-key';
    }
    
    if (!apiKey || apiKey === 'votre_cle_api_openai_ici') {
      throw new Error('Clé API OpenAI non configurée. Veuillez configurer VITE_OPENAI_API_KEY dans votre fichier .env.local');
    }

    const {
      model = 'gpt-4',
      temperature = 0.7,
      max_tokens = 2000,
      systemMessage = 'Vous êtes un assistant rédactionnel expert.'
    } = options;

    try {
      const messages = [
        {
          role: 'system',
          content: systemMessage
        },
        {
          role: 'user',
          content: prompt
        }
      ];

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model,
          messages,
          temperature,
          max_tokens,
          stream: false
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Erreur OpenAI (${response.status}): ${errorData.error?.message || response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        throw new Error('Format de réponse OpenAI invalide');
      }

      return {
        success: true,
        content: data.choices[0].message.content,
        usage: data.usage,
        model: data.model
      };

    } catch (error) {
      console.error('Erreur lors de l\'appel OpenAI:', error);
      
      if (error.message.includes('Failed to deserialize the JSON body')) {
        throw new Error('Erreur de formatage des données OpenAI. Vérifiez la structure de votre prompt.');
      }
      
      throw new Error(`Erreur OpenAI: ${error.message}`);
    }
  }

  /**
   * Appel API Claude (Anthropic)
   */
  static async callClaudeAPI(prompt, options = {}) {
    let apiKey;
    try {
      apiKey = import.meta.env.VITE_CLAUDE_API_KEY;
    } catch {
      apiKey = process.env.VITE_CLAUDE_API_KEY || 'test-api-key';
    }
    
    if (!apiKey || apiKey === 'votre_cle_api_claude_ici') {
      throw new Error('Clé API Claude non configurée. Veuillez configurer VITE_CLAUDE_API_KEY dans votre fichier .env.local');
    }

    const {
      model = 'claude-3-sonnet-20240229',
      temperature = 0.7,
      max_tokens = 2000,
      systemMessage = 'Vous êtes un assistant rédactionnel expert.'
    } = options;

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model,
          max_tokens,
          temperature,
          system: systemMessage,
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ]
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Erreur Claude (${response.status}): ${errorData.error?.message || response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.content || !data.content[0] || !data.content[0].text) {
        throw new Error('Format de réponse Claude invalide');
      }

      return {
        success: true,
        content: data.content[0].text,
        usage: data.usage,
        model: data.model
      };

    } catch (error) {
      console.error('Erreur lors de l\'appel Claude:', error);
      throw new Error(`Erreur Claude: ${error.message}`);
    }
  }

  /**
   * Appel API Gemini (Google)
   */
  static async callGeminiAPI(prompt, options = {}) {
    let apiKey;
    try {
      apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    } catch {
      apiKey = process.env.VITE_GEMINI_API_KEY || 'test-api-key';
    }
    
    if (!apiKey || apiKey === 'votre_cle_api_gemini_ici') {
      throw new Error('Clé API Gemini non configurée. Veuillez configurer VITE_GEMINI_API_KEY dans votre fichier .env.local');
    }

    const {
      model = 'gemini-pro',
      temperature = 0.7,
      maxOutputTokens = 2000
    } = options;

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: prompt
                  }
                ]
              }
            ],
            generationConfig: {
              temperature,
              maxOutputTokens
            }
          })
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Erreur Gemini (${response.status}): ${errorData.error?.message || response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
        throw new Error('Format de réponse Gemini invalide');
      }

      return {
        success: true,
        content: data.candidates[0].content.parts[0].text,
        model: model
      };

    } catch (error) {
      console.error('Erreur lors de l\'appel Gemini:', error);
      throw new Error(`Erreur Gemini: ${error.message}`);
    }
  }

  /**
   * Appel API DeepSeek
   */
  static async callDeepSeekAPI(prompt, options = {}) {
    let apiKey;
    try {
      apiKey = import.meta.env.VITE_DEEPSEEK_API_KEY;
    } catch {
      apiKey = process.env.VITE_DEEPSEEK_API_KEY || 'test-api-key';
    }
    
    if (!apiKey || apiKey === 'votre_cle_api_deepseek_ici') {
      throw new Error('Clé API DeepSeek non configurée. Veuillez configurer VITE_DEEPSEEK_API_KEY dans votre fichier .env.local');
    }

    const {
      model = 'deepseek-chat',
      temperature = 0.7,
      max_tokens = 2000,
      systemMessage = 'Vous êtes un assistant rédactionnel expert.',
      useThinkingMode = false  // Active le mode raisonnement (deepseek-reasoner)
    } = options;

    // Si mode thinking activé, utiliser deepseek-reasoner
    const actualModel = useThinkingMode ? 'deepseek-reasoner' : model;
    
    // En mode reasoner, désactiver temperature et top_p pour cohérence
    const requestParams = {
      model: actualModel,
      messages: [],
      max_tokens,
      stream: false
    };
    
    // Ajouter temperature uniquement si pas en mode reasoner
    if (actualModel !== 'deepseek-reasoner') {
      requestParams.temperature = temperature;
    }

    try {
      requestParams.messages = [
        {
          role: 'system',
          content: systemMessage
        },
        {
          role: 'user',
          content: prompt
        }
      ];

      const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify(requestParams)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Erreur DeepSeek (${response.status}): ${errorData.error?.message || response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        throw new Error('Format de réponse DeepSeek invalide');
      }

      // En mode reasoner, extraire le raisonnement si disponible
      const reasoning = data.choices[0].message.reasoning_content || null;
      
      return {
        success: true,
        content: data.choices[0].message.content,
        reasoning: reasoning,  // Raisonnement intermédiaire (mode thinking)
        usage: data.usage,
        model: data.model,
        thinkingMode: actualModel === 'deepseek-reasoner'
      };

    } catch (error) {
      console.error('Erreur lors de l\'appel DeepSeek:', error);
      throw new Error(`Erreur DeepSeek: ${error.message}`);
    }
  }

  /**
   * Appel API Grok (xAI)
   */
  static async callGrokAPI(prompt, options = {}) {
    let apiKey;
    try {
      apiKey = import.meta.env.VITE_GROK_API_KEY;
    } catch {
      apiKey = process.env.VITE_GROK_API_KEY || 'test-api-key';
    }
    
    if (!apiKey || apiKey === 'votre_cle_api_grok_ici') {
      throw new Error('Clé API Grok non configurée. Veuillez configurer VITE_GROK_API_KEY dans votre fichier .env.local');
    }

    const {
      model = 'grok-4-fast-reasoning',
      temperature = 0.7,
      max_tokens = 2000,
      systemMessage = 'Vous êtes un assistant rédactionnel expert.'
    } = options;

    try {
      const messages = [
        {
          role: 'system',
          content: systemMessage
        },
        {
          role: 'user',
          content: prompt
        }
      ];

      const response = await fetch('https://api.x.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model,
          messages,
          temperature,
          max_tokens,
          stream: false
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Erreur Grok (${response.status}): ${errorData.error?.message || response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        throw new Error('Format de réponse Grok invalide');
      }

      return {
        success: true,
        content: data.choices[0].message.content,
        usage: data.usage,
        model: data.model
      };

    } catch (error) {
      console.error('Erreur lors de l\'appel Grok:', error);
      throw new Error(`Erreur Grok: ${error.message}`);
    }
  }

  /**
   * Appel API Kimi via OpenRouter
   */
  static async callKimiAPI(prompt, options = {}) {
    let apiKey;
    try {
      apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;
    } catch {
      apiKey = process.env.VITE_OPENROUTER_API_KEY || 'test-api-key';
    }
    
    if (!apiKey || apiKey === 'votre_cle_api_openrouter_ici') {
      throw new Error('Clé API OpenRouter non configurée. Veuillez configurer VITE_OPENROUTER_API_KEY dans votre fichier .env.local');
    }

    const {
      model = 'moonshotai/kimi-k2-0905',
      temperature = 0.7,
      max_tokens = 2000,
      systemMessage = 'Vous êtes un assistant rédactionnel expert.'
    } = options;

    try {
      const messages = [
        {
          role: 'system',
          content: systemMessage
        },
        {
          role: 'user',
          content: prompt
        }
      ];

      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'HTTP-Referer': window.location.origin,
          'X-Title': 'Assistant Rédacteur'
        },
        body: JSON.stringify({
          model,
          messages,
          temperature,
          max_tokens,
          stream: false
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Erreur Kimi/OpenRouter (${response.status}): ${errorData.error?.message || response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        throw new Error('Format de réponse Kimi invalide');
      }

      return {
        success: true,
        content: data.choices[0].message.content,
        usage: data.usage,
        model: data.model
      };

    } catch (error) {
      console.error('Erreur lors de l\'appel Kimi:', error);
      throw new Error(`Erreur Kimi: ${error.message}`);
    }
  }

  /**
   * Appel API DeepL (Traduction)
   */
  static async callDeepLAPI(text, options = {}) {
    let apiKey;
    try {
      apiKey = import.meta.env.VITE_DEEPL_API_KEY;
    } catch {
      apiKey = process.env.VITE_DEEPL_API_KEY || 'test-api-key';
    }
    
    if (!apiKey || apiKey === 'votre_cle_api_deepl_ici') {
      throw new Error('Clé API DeepL non configurée. Veuillez configurer VITE_DEEPL_API_KEY dans votre fichier .env.local');
    }

    const {
      targetLang = 'FR',
      sourceLang = null,
      formality = 'default'
    } = options;

    try {
      // Déterminer si c'est une clé Free ou Pro
      const isFreeKey = apiKey.endsWith(':fx');
      const baseUrl = isFreeKey 
        ? 'https://api-free.deepl.com/v2/translate'
        : 'https://api.deepl.com/v2/translate';

      const params = new URLSearchParams({
        auth_key: apiKey,
        text: text,
        target_lang: targetLang.toUpperCase()
      });

      if (sourceLang) {
        params.append('source_lang', sourceLang.toUpperCase());
      }

      if (formality !== 'default') {
        params.append('formality', formality);
      }

      const response = await fetch(baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: params
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Erreur DeepL (${response.status}): ${errorData.message || response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.translations || !data.translations[0]) {
        throw new Error('Format de réponse DeepL invalide');
      }

      return {
        success: true,
        content: data.translations[0].text,
        detectedSourceLang: data.translations[0].detected_source_language,
        model: 'deepl'
      };

    } catch (error) {
      console.error('Erreur lors de l\'appel DeepL:', error);
      throw new Error(`Erreur DeepL: ${error.message}`);
    }
  }

  // Méthode principale avec gestion d'erreurs améliorée
  static async generateAIContent(aiType, data) {
    try {
      // Pour l'instant, on garde la simulation par défaut
      // mais on pourrait basculer vers des appels réels
      return await this.simulateAICall(aiType, data);
      
      // Décommentez pour utiliser les appels réels quand les clés API sont configurées
      /*
      if (aiType === 'gpt4') {
        const prompt = this.buildOpenAIPrompt(data);
        return await this.callOpenAIAPI(prompt, {
          model: 'gpt-4',
          temperature: data.creativity / 10,
          max_tokens: data.length * 200,
          systemMessage: this.getSystemMessageForTask(data.tasks)
        });
      }
      */
      
    } catch (error) {
      console.error(`Erreur lors de la génération avec ${aiType}:`, error);
      return {
        success: false,
        error: error.message,
        content: `Erreur: ${error.message}\n\nContenu simulé:\n${this.generateSampleContent(aiType, data)}`
      };
    }
  }

  static buildOpenAIPrompt(data) {
    return `
Projet: ${data.title || 'Sans titre'}
Public cible: ${data.audience || 'Non spécifié'}
Ton: ${data.tone || 'Neutre'}
Description: ${data.description || 'Aucune description'}

Tâches demandées: ${data.tasks?.join(', ') || 'Aucune'}
Format de sortie: ${data.format || 'Texte'}

Contenu à traiter:
${data.content}

Veuillez générer du contenu adapté aux spécifications ci-dessus.
    `.trim();
  }

  static getSystemMessageForTask(tasks = []) {
    const taskDescriptions = {
      rewrite: 'Réécrivez le contenu en améliorant la structure et la clarté',
      summarize: 'Résumez le contenu en conservant les points clés',
      expand: 'Développez le contenu avec des détails supplémentaires',
      translate: 'Traduisez le contenu de manière naturelle',
      optimize: 'Optimisez le contenu pour le référencement et la lisibilité'
    };

    const relevantTasks = tasks.filter(task => taskDescriptions[task]);
    const description = relevantTasks.length > 0
      ? relevantTasks.map(task => taskDescriptions[task]).join('. ')
      : 'Vous êtes un assistant rédactionnel expert.';

    return `${description}. Fournissez un contenu de haute qualité, bien structuré et adapté au public cible.`;
  }
}

export default AIService;