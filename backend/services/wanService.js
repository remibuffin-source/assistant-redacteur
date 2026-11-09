import fetch from 'node-fetch';
import FormData from 'form-data';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { logger } from '../utils/logger.js';
import { formatProviderError } from '../utils/providerErrors.js';
import { calculateWanVideoCredits } from '../utils/creditCalculator.js';
import User from '../models/User.js';
import ApiKey from '../models/ApiKey.js';
import Video from '../models/Video.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const STORAGE_PATH = process.env.STORAGE_PATH || (process.env.NODE_ENV === 'production'
  ? '/home/bure7653/assistant-redacteur/stockage'
  : path.join(__dirname, '../../stockage'));

const WAN_BASE_URL = 'https://api.kie.ai/api/v1/jobs';
const WAN_UPLOAD_URL = 'https://api.kie.ai/api/v1/files/upload';

/**
 * Récupérer la clé API WAN partagée depuis la base de données
 * La clé WAN est configurée par l'admin et partagée pour tous les utilisateurs
 * @returns {Promise<string>} - Clé API WAN
 */
async function getWanApiKey() {
  // Chercher la clé WAN (peu importe le userId, c'est une clé partagée)
  const wanKey = await ApiKey.findOne({
    where: { service: 'wan', isActive: true }
  });
  
  if (!wanKey) {
    throw new Error('Clé API WAN non configurée. Veuillez la configurer dans /config-api');
  }
  
  try {
    return wanKey.decryptKey();
  } catch (error) {
    logger.error('Erreur déchiffrement clé WAN:', error);
    throw new Error('Erreur lors de la récupération de la clé API WAN');
  }
}

/**
 * Télécharger une vidéo depuis une URL et la sauvegarder dans stockage/video
 * @param {number} userId - ID de l'utilisateur
 * @param {string} videoUrl - URL de la vidéo à télécharger
 * @param {object} metadata - Métadonnées de la vidéo
 * @returns {Promise<object>} - Informations sur la vidéo sauvegardée
 */
export async function downloadAndSaveVideo(userId, videoUrl, metadata = {}) {
  try {
    // Créer le dossier utilisateur si nécessaire (architecture: /stockage/users/{userId}/video/)
    const userVideoDir = path.join(STORAGE_PATH, 'users', String(userId), 'video');
    await fs.mkdir(userVideoDir, { recursive: true });

    // Générer un nom de fichier unique
    const timestamp = Date.now();
    const filename = `video_${timestamp}.mp4`;
    const filepath = path.join(userVideoDir, filename);
    const relativeFilepath = `users/${userId}/video/${filename}`;

    // Télécharger la vidéo
    logger.info(`Téléchargement de la vidéo depuis: ${videoUrl}`);
    const response = await fetch(videoUrl);
    
    if (!response.ok) {
      throw new Error(`Erreur téléchargement vidéo: ${response.statusText}`);
    }

    const buffer = await response.buffer();
    
    // Sauvegarder le fichier
    await fs.writeFile(filepath, buffer);
    logger.info(`Vidéo sauvegardée: ${filepath} (${buffer.length} octets)`);

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
      model: metadata.model,
      prompt: metadata.prompt,
      resolution: metadata.resolution,
      duration: metadata.duration,
      aspectRatio: metadata.aspectRatio,
      fileSize: buffer.length,
      mimeType: 'video/mp4',
      creditsUsed: metadata.creditsUsed,
      metadata: {
        seed: metadata.seed,
        multiShots: metadata.multiShots,
        enableAudio: metadata.enableAudio,
        kieaiUrl: videoUrl
      },
      isActive: true
    });

    logger.info(`Vidéo enregistrée en BDD: ID ${videoRecord.id}`);

    return {
      id: videoRecord.id,
      filename,
      filepath: relativeFilepath,
      url: publicUrl,
      fileSize: buffer.length
    };

  } catch (error) {
    logger.error('Erreur sauvegarde vidéo:', error);
    throw error;
  }
}

/**
 * Upload un fichier vers Kie.ai
 * @param {Buffer} fileBuffer - Buffer du fichier
 * @param {string} filename - Nom du fichier
 * @returns {Promise<string>} - URL du fichier uploadé
 */
export async function uploadFile(userId, fileBuffer, filename) {
  try {
    const WAN_API_KEY = await getWanApiKey();
    
    const formData = new FormData();
    formData.append('file', fileBuffer, filename);

    const response = await fetch(WAN_UPLOAD_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${WAN_API_KEY}`
      },
      body: formData
    });

    const data = await response.json();

    if (data.code !== 200) {
      throw new Error(formatProviderError('Kie.ai', data.code || response.status, JSON.stringify(data)));
    }

    logger.info(`Fichier uploadé avec succès: ${data.data.url}`);
    return data.data.url;

  } catch (error) {
    logger.error('Erreur upload fichier Kie.ai:', error);
    throw error;
  }
}

/**
 * Créer une tâche WAN 2.6
 * @param {string} model - Modèle (wan/2-6-text-to-video, wan/2-6-image-to-video, wan/2-6-video-to-video)
 * @param {object} input - Paramètres d'entrée
 * @param {string} callbackUrl - URL de callback (optionnel)
 * @returns {Promise<object>} - Réponse de l'API
 */
export async function createWanTask(userId, model, input, callbackUrl = null) {
  try {
    const WAN_API_KEY = await getWanApiKey();
    
    const payload = {
      model,
      input
    };

    if (callbackUrl) {
      payload.callBackUrl = callbackUrl;
    }

    logger.info('=== Création tâche WAN ===');
    logger.info('URL:', `${WAN_BASE_URL}/createTask`);
    logger.info('Payload:', JSON.stringify(payload, null, 2));
    logger.info('API Key length:', WAN_API_KEY.length);

    const response = await fetch(`${WAN_BASE_URL}/createTask`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${WAN_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    logger.info('Response status:', response.status);
    logger.info('Response headers:', JSON.stringify([...response.headers.entries()]));

    const data = await response.json();
    logger.info('Response data:', JSON.stringify(data, null, 2));

    if (data.code !== 200) {
      logger.error('Erreur API Kie.ai - Code:', data.code);
      logger.error('Erreur API Kie.ai - Message:', data.message);
      logger.error('Erreur API Kie.ai - Data complète:', JSON.stringify(data, null, 2));
      
      const error = new Error(formatProviderError('Kie.ai', data.code || response.status, JSON.stringify(data)));
      error.apiResponse = data;
      error.statusCode = response.status;
      error.payload = payload;
      throw error;
    }

    logger.info(`Tâche WAN créée: ${data.data.taskId}`);
    return data.data;

  } catch (error) {
    logger.error('Erreur création tâche WAN:', error);
    throw error;
  }
}

/**
 * Récupérer le statut d'une tâche
 * @param {string} taskId - ID de la tâche
 * @returns {Promise<object>} - Détails de la tâche
 */
export async function getTaskStatus(userId, taskId) {
  try {
    const WAN_API_KEY = await getWanApiKey();
    
    const response = await fetch(`${WAN_BASE_URL}/recordInfo?taskId=${taskId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${WAN_API_KEY}`
      }
    });

    const data = await response.json();

    if (data.code !== 200) {
      throw new Error(`Task status failed: ${data.message}`);
    }

    return data.data;

  } catch (error) {
    logger.error('Erreur récupération statut tâche:', error);
    throw error;
  }
}

/**
 * Générer une vidéo Text-to-Video
 * @param {number} userId - ID de l'utilisateur
 * @param {string} prompt - Prompt de génération
 * @param {object} options - Options (resolution, duration, aspectRatio, seed, etc.)
 * @returns {Promise<object>} - Tâche créée
 */
export async function generateTextToVideo(userId, prompt, options = {}) {
  try {
    const {
      resolution = '720p',
      duration = 5,
      aspectRatio = '16:9',
      seed = null,
      multiShots = false,
      enableAudio = true
    } = options;

    // Calculer le coût
    const creditsNeeded = await calculateWanVideoCredits('text-to-video', resolution, duration);

    // Vérifier le solde utilisateur
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error('Utilisateur introuvable');
    }

    if (user.credits < creditsNeeded) {
      throw new Error(`Crédits insuffisants. Requis: ${creditsNeeded}, Disponible: ${user.credits}`);
    }

    // Préparer l'input
    const input = {
      prompt,
      resolution,
      duration: String(duration), // L'API Kie.ai attend une string
      aspect_ratio: aspectRatio,
      multi_shots: multiShots,
      enable_audio: enableAudio
    };

    if (seed) {
      input.seed = parseInt(seed);
    }

    // Créer la tâche
    const task = await createWanTask(userId, 'wan/2-6-text-to-video', input);

    // Déduire les crédits
    await user.update({
      credits: user.credits - creditsNeeded
    });

    logger.info(`Crédits déduits: ${creditsNeeded} pour user ${userId}, nouveau solde: ${user.credits - creditsNeeded}`);

    return {
      taskId: task.taskId,
      creditsUsed: creditsNeeded,
      status: 'queuing'
    };

  } catch (error) {
    logger.error('Erreur génération Text-to-Video:', error);
    throw error;
  }
}

/**
 * Générer une vidéo Image-to-Video
 * @param {number} userId - ID de l'utilisateur
 * @param {string} imageUrl - URL de l'image source
 * @param {string} prompt - Prompt de génération
 * @param {object} options - Options (resolution, duration, aspectRatio, seed, etc.)
 * @returns {Promise<object>} - Tâche créée
 */
export async function generateImageToVideo(userId, imageUrl, prompt, options = {}) {
  try {
    const {
      resolution = '720p',
      duration = 5,
      aspectRatio = '16:9',
      seed = null,
      multiShots = false,
      enableAudio = true
    } = options;

    // Calculer le coût
    const creditsNeeded = await calculateWanVideoCredits('image-to-video', resolution, duration);

    // Vérifier le solde utilisateur
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error('Utilisateur introuvable');
    }

    if (user.credits < creditsNeeded) {
      throw new Error(`Crédits insuffisants. Requis: ${creditsNeeded}, Disponible: ${user.credits}`);
    }

    // Préparer l'input
    const input = {
      image_url: imageUrl,
      prompt,
      resolution,
      duration: String(duration), // L'API Kie.ai attend une string
      aspect_ratio: aspectRatio,
      multi_shots: multiShots,
      enable_audio: enableAudio
    };

    if (seed) {
      input.seed = parseInt(seed);
    }

    // Créer la tâche
    const task = await createWanTask(userId, 'wan/2-6-image-to-video', input);

    // Déduire les crédits
    await user.update({
      credits: user.credits - creditsNeeded
    });

    logger.info(`Crédits déduits: ${creditsNeeded} pour user ${userId}, nouveau solde: ${user.credits - creditsNeeded}`);

    return {
      taskId: task.taskId,
      creditsUsed: creditsNeeded,
      status: 'queuing'
    };

  } catch (error) {
    logger.error('Erreur génération Image-to-Video:', error);
    throw error;
  }
}

/**
 * Générer une vidéo Video-to-Video
 * @param {number} userId - ID de l'utilisateur
 * @param {string} videoUrl - URL de la vidéo source
 * @param {string} prompt - Prompt de génération
 * @param {object} options - Options (resolution, duration, aspectRatio, seed, etc.)
 * @returns {Promise<object>} - Tâche créée
 */
export async function generateVideoToVideo(userId, videoUrl, prompt, options = {}) {
  try {
    const {
      resolution = '720p',
      duration = 5,
      aspectRatio = '16:9',
      seed = null,
      multiShots = false,
      enableAudio = true
    } = options;

    // Calculer le coût
    const creditsNeeded = await calculateWanVideoCredits('video-to-video', resolution, duration);

    // Vérifier le solde utilisateur
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error('Utilisateur introuvable');
    }

    if (user.credits < creditsNeeded) {
      throw new Error(`Crédits insuffisants. Requis: ${creditsNeeded}, Disponible: ${user.credits}`);
    }

    // Préparer l'input
    const input = {
      video_url: videoUrl,
      prompt,
      resolution,
      duration: String(duration), // L'API Kie.ai attend une string
      aspect_ratio: aspectRatio,
      multi_shots: multiShots,
      enable_audio: enableAudio
    };

    if (seed) {
      input.seed = parseInt(seed);
    }

    // Créer la tâche
    const task = await createWanTask(userId, 'wan/2-6-video-to-video', input);

    // Déduire les crédits
    await user.update({
      credits: user.credits - creditsNeeded
    });

    logger.info(`Crédits déduits: ${creditsNeeded} pour user ${userId}, nouveau solde: ${user.credits - creditsNeeded}`);

    return {
      taskId: task.taskId,
      creditsUsed: creditsNeeded,
      status: 'queuing'
    };

  } catch (error) {
    logger.error('Erreur génération Video-to-Video:', error);
    throw error;
  }
}

/**
 * Récupérer le solde de crédits Kie.ai
 * @returns {Promise<object>} - Informations sur le compte
 */
export async function getAccountCredits(userId) {
  try {
    const WAN_API_KEY = await getWanApiKey();
    
    const response = await fetch('https://api.kie.ai/api/v1/account/credits', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${WAN_API_KEY}`
      }
    });

    const data = await response.json();

    if (data.code !== 200) {
      throw new Error(`Get credits failed: ${data.message}`);
    }

    return data.data;

  } catch (error) {
    logger.error('Erreur récupération crédits Kie.ai:', error);
    throw error;
  }
}
