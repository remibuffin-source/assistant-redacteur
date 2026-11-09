import fetch from 'node-fetch';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import ApiKey from '../models/ApiKey.js';
import User from '../models/User.js';
import Video from '../models/Video.js';
import { logger } from '../utils/logger.js';
import { formatProviderError } from '../utils/providerErrors.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const STORAGE_PATH = process.env.STORAGE_PATH || path.join(__dirname, '../../stockage');
const VEO_API_BASE_URL = 'https://api.kie.ai/api/v1/veo';

/**
 * Récupérer la clé API Veo 3.1 depuis la base de données
 */
async function getVeoApiKey() {
  try {
    const apiKeyRecord = await ApiKey.findOne({
      where: {
        service: 'veo',
        isActive: true
      }
    });

    if (!apiKeyRecord) {
      throw new Error('Clé API Veo 3.1 non configurée. Veuillez ajouter votre clé API Kie.ai dans /config-api');
    }

    // Utiliser la méthode decryptKey() du modèle ApiKey
    const decryptedKey = apiKeyRecord.decryptKey();
    if (!decryptedKey) {
      throw new Error('Erreur de déchiffrement de la clé API Veo 3.1');
    }

    return decryptedKey;
  } catch (error) {
    logger.error('Erreur récupération clé API Veo:', error);
    throw error;
  }
}

/**
 * Sauvegarder une image localement et retourner l'URL publique
 * L'API Kie.ai Veo 3.1 nécessite des URLs publiques accessibles, pas d'upload direct
 * @param {number} userId - ID de l'utilisateur
 * @param {Buffer} fileBuffer - Buffer du fichier
 * @param {string} filename - Nom du fichier
 * @returns {Promise<string>} - URL publique du fichier
 */
export async function uploadImageFile(userId, fileBuffer, filename) {
  try {
    // Créer un nom de fichier unique
    const timestamp = Date.now();
    const ext = path.extname(filename);
    const uniqueFilename = `veo_ref_${userId}_${timestamp}${ext}`;
    
    // Chemin de stockage : stockage/temp/veo/
    const veoTempDir = path.join(STORAGE_PATH, 'temp', 'veo');
    await fs.mkdir(veoTempDir, { recursive: true });
    
    const filePath = path.join(veoTempDir, uniqueFilename);
    
    // Sauvegarder le fichier
    await fs.writeFile(filePath, fileBuffer);
    
    // Retourner l'URL publique
    const publicUrl = `${process.env.API_URL || 'https://api.assistant-redacteur.fr'}/files/temp/veo/${uniqueFilename}`;
    
    logger.info(`Image de référence Veo sauvegardée: ${publicUrl}`);
    return publicUrl;

  } catch (error) {
    logger.error('Erreur sauvegarde image Veo:', error);
    throw error;
  }
}

/**
 * Calculer le coût en crédits pour une vidéo Veo 3.1
 * @param {string} model - veo3 ou veo3_fast
 * @param {string} aspectRatio - 16:9, 9:16 ou Auto
 * @param {string} generationType - TEXT_2_VIDEO, FIRST_AND_LAST_FRAMES_2_VIDEO, REFERENCE_2_VIDEO
 * @returns {Promise<number>} - Nombre de crédits nécessaires
 */
async function calculateVeoCredits(model, aspectRatio, generationType) {
  // Tarification basée sur https://kie.ai/pricing
  // À ajuster selon la tarification réelle
  let baseCredits = 0;

  if (model === 'veo3') {
    baseCredits = 100; // Veo 3.1 Quality
  } else if (model === 'veo3_fast') {
    baseCredits = 50; // Veo 3.1 Fast
  }

  // Majoration pour certains types de génération
  if (generationType === 'REFERENCE_2_VIDEO') {
    baseCredits *= 1.2;
  }

  return Math.ceil(baseCredits);
}

/**
 * Générer une vidéo Veo 3.1
 * @param {number} userId - ID de l'utilisateur
 * @param {object} params - Paramètres de génération
 * @returns {Promise<object>} - Tâche créée
 */
export async function generateVeoVideo(userId, params) {
  try {
    const {
      prompt,
      imageUrls = [],
      model = 'veo3_fast',
      aspectRatio = '16:9',
      seeds = null,
      watermark = null,
      enableTranslation = true,
      generationType = null
    } = params;

    // Validation
    if (!prompt || !prompt.trim()) {
      throw new Error('Le prompt est requis');
    }

    // Calculer le coût
    const creditsNeeded = await calculateVeoCredits(model, aspectRatio, generationType);

    // Vérifier le solde utilisateur
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error('Utilisateur introuvable');
    }

    if (user.credits < creditsNeeded) {
      throw new Error(`Crédits insuffisants. Requis: ${creditsNeeded}, Disponible: ${user.credits}`);
    }

    // Préparer le payload
    const apiKey = await getVeoApiKey();
    const payload = {
      prompt: prompt.trim(),
      model,
      aspect_ratio: aspectRatio,
      enableTranslation
    };

    if (imageUrls && imageUrls.length > 0) {
      payload.imageUrls = imageUrls;
    }

    if (seeds) {
      payload.seeds = parseInt(seeds);
    }

    if (watermark) {
      payload.watermark = watermark;
    }

    if (generationType) {
      payload.generationType = generationType;
    }

    logger.info('Envoi requête Veo 3.1:', JSON.stringify(payload, null, 2));

    // Appeler l'API Veo
    const response = await fetch(`${VEO_API_BASE_URL}/generate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(formatProviderError('Kie.ai', response.status, errorText));
    }

    const result = await response.json();

    if (result.code !== 200) {
      throw new Error(formatProviderError('Kie.ai', result.code || response.status, JSON.stringify(result)));
    }

    const taskId = result.data.taskId;

    // Déduire les crédits
    await user.update({
      credits: user.credits - creditsNeeded
    });

    logger.info(`Vidéo Veo créée: taskId=${taskId}, crédits déduits: ${creditsNeeded}`);

    return {
      taskId,
      creditsUsed: creditsNeeded,
      status: 'generating'
    };

  } catch (error) {
    logger.error('Erreur génération vidéo Veo:', error);
    throw error;
  }
}

/**
 * Récupérer le statut d'une tâche Veo
 * @param {number} userId - ID de l'utilisateur
 * @param {string} taskId - ID de la tâche
 * @returns {Promise<object>} - Statut de la tâche
 */
export async function getVeoTaskStatus(userId, taskId) {
  try {
    const apiKey = await getVeoApiKey();

    const response = await fetch(`${VEO_API_BASE_URL}/record-info?taskId=${taskId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Erreur récupération statut Veo: ${response.status} - ${errorText}`);
    }

    const result = await response.json();

    if (result.code !== 200) {
      throw new Error(`Erreur statut: ${result.msg}`);
    }

    const data = result.data;

    // Mapper le statut
    let state = 'generating';
    if (data.successFlag === 1) {
      state = 'success';
    } else if (data.successFlag === 2 || data.successFlag === 3) {
      state = 'failed';
    }

    return {
      taskId: data.taskId,
      state,
      successFlag: data.successFlag,
      resultUrls: data.response?.resultUrls || [],
      originUrls: data.response?.originUrls || [],
      resolution: data.response?.resolution || '720p',
      fallbackFlag: data.fallbackFlag || false,
      errorCode: data.errorCode,
      errorMessage: data.errorMessage,
      completeTime: data.completeTime,
      createTime: data.createTime,
      paramJson: data.paramJson
    };

  } catch (error) {
    logger.error('Erreur récupération statut Veo:', error);
    throw error;
  }
}

/**
 * Télécharger et sauvegarder une vidéo Veo
 * @param {number} userId - ID de l'utilisateur
 * @param {string} videoUrl - URL de la vidéo
 * @param {object} metadata - Métadonnées
 * @returns {Promise<object>} - Informations sur la vidéo sauvegardée
 */
export async function downloadAndSaveVeoVideo(userId, videoUrl, metadata = {}) {
  try {
    // Créer le dossier utilisateur
    const userVideoDir = path.join(STORAGE_PATH, 'users', String(userId), 'video');
    await fs.mkdir(userVideoDir, { recursive: true });

    // Générer un nom de fichier unique
    const timestamp = Date.now();
    const filename = `veo_${timestamp}.mp4`;
    const filepath = path.join(userVideoDir, filename);
    const relativeFilepath = `users/${userId}/video/${filename}`;

    // Télécharger la vidéo
    logger.info(`Téléchargement vidéo Veo depuis: ${videoUrl}`);
    const response = await fetch(videoUrl);
    
    if (!response.ok) {
      throw new Error(`Erreur téléchargement vidéo: ${response.statusText}`);
    }

    const buffer = await response.buffer();
    
    // Sauvegarder le fichier
    await fs.writeFile(filepath, buffer);
    logger.info(`Vidéo Veo sauvegardée: ${filepath} (${buffer.length} octets)`);

    // Construire l'URL publique
    const publicUrl = `/stockage/${relativeFilepath}`;

    // Enregistrer dans la base de données
    const videoRecord = await Video.create({
      userId,
      filename,
      originalFilename: metadata.originalFilename || filename,
      filepath: relativeFilepath,
      url: publicUrl,
      taskId: metadata.taskId,
      model: metadata.model || 'veo3_fast',
      prompt: metadata.prompt,
      resolution: metadata.resolution || '720p',
      duration: metadata.duration || 5,
      aspectRatio: metadata.aspectRatio || '16:9',
      fileSize: buffer.length,
      mimeType: 'video/mp4',
      creditsUsed: metadata.creditsUsed,
      metadata: {
        seeds: metadata.seeds,
        watermark: metadata.watermark,
        generationType: metadata.generationType,
        fallbackFlag: metadata.fallbackFlag,
        kieaiUrl: videoUrl
      },
      isActive: true
    });

    logger.info(`Vidéo Veo enregistrée en BDD: ID ${videoRecord.id}`);

    return {
      id: videoRecord.id,
      filename,
      filepath: relativeFilepath,
      url: publicUrl,
      fileSize: buffer.length
    };

  } catch (error) {
    logger.error('Erreur sauvegarde vidéo Veo:', error);
    throw error;
  }
}

/**
 * Récupérer les crédits disponibles sur le compte Kie.ai
 * @returns {Promise<object>} - Informations sur les crédits
 */
export async function getVeoAccountCredits() {
  try {
    const apiKey = await getVeoApiKey();

    const response = await fetch(`${VEO_API_BASE_URL}/credits`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Erreur récupération crédits Veo: ${response.status} - ${errorText}`);
    }

    const result = await response.json();

    if (result.code !== 200) {
      throw new Error(`Erreur crédits: ${result.msg}`);
    }

    return result.data;

  } catch (error) {
    logger.error('Erreur récupération crédits Veo:', error);
    throw error;
  }
}
