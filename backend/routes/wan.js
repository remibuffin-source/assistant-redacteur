import express from 'express';
import multer from 'multer';
import { authenticateToken } from '../middleware/auth.js';
import {
  uploadFile,
  generateTextToVideo,
  generateImageToVideo,
  generateVideoToVideo,
  getTaskStatus,
  getAccountCredits
} from '../services/wanService.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

// Configuration multer pour l'upload de fichiers
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB max
  }
});

/**
 * POST /api/wan/text-to-video
 * Générer une vidéo à partir d'un prompt texte
 */
router.post('/text-to-video', authenticateToken, async (req, res) => {
  try {
    logger.info('=== Début text-to-video ===');
    logger.info('User ID:', req.user?.id);
    logger.info('Body:', JSON.stringify(req.body));
    
    const { prompt, resolution, duration, aspectRatio, seed, multiShots, enableAudio } = req.body;

    if (!prompt) {
      logger.error('Prompt manquant');
      return res.status(400).json({ error: 'Le prompt est requis' });
    }

    logger.info('Appel generateTextToVideo avec userId:', req.user.id);
    
    const result = await generateTextToVideo(req.user.id, prompt, {
      resolution,
      duration: parseInt(duration) || 5,
      aspectRatio,
      seed,
      multiShots: multiShots === true || multiShots === 'true',
      enableAudio: enableAudio === true || enableAudio === 'true'
    });

    logger.info('Résultat generateTextToVideo:', result);

    res.json({
      success: true,
      taskId: result.taskId,
      creditsUsed: result.creditsUsed,
      status: result.status
    });

  } catch (error) {
    logger.error('=== ERREUR text-to-video ===');
    logger.error('Message:', error.message);
    logger.error('Stack:', error.stack);
    logger.error('User ID:', req.user?.id);
    res.status(500).json({ error: error.message, details: error.stack });
  }
});

/**
 * POST /api/wan/image-to-video
 * Générer une vidéo à partir d'une image
 */
router.post('/image-to-video', authenticateToken, upload.single('image'), async (req, res) => {
  try {
    const { prompt, resolution, duration, aspectRatio, seed, multiShots, enableAudio, imageUrl } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Le prompt est requis' });
    }

    let finalImageUrl = imageUrl;

    // Si un fichier image a été uploadé, l'envoyer à Kie.ai
    if (req.file) {
      finalImageUrl = await uploadFile(req.user.id, req.file.buffer, req.file.originalname);
    }

    if (!finalImageUrl) {
      return res.status(400).json({ error: 'Une image (fichier ou URL) est requise' });
    }

    const result = await generateImageToVideo(req.user.id, finalImageUrl, prompt, {
      resolution,
      duration: parseInt(duration) || 5,
      aspectRatio,
      seed,
      multiShots: multiShots === true || multiShots === 'true',
      enableAudio: enableAudio === true || enableAudio === 'true'
    });

    res.json({
      success: true,
      taskId: result.taskId,
      creditsUsed: result.creditsUsed,
      status: result.status
    });

  } catch (error) {
    logger.error('Erreur route image-to-video:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/wan/video-to-video
 * Générer une vidéo à partir d'une vidéo source
 */
router.post('/video-to-video', authenticateToken, upload.single('video'), async (req, res) => {
  try {
    const { prompt, resolution, duration, aspectRatio, seed, multiShots, enableAudio, videoUrl } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Le prompt est requis' });
    }

    let finalVideoUrl = videoUrl;

    // Si un fichier a été uploadé, l'envoyer à Kie.ai
    if (req.file) {
      finalVideoUrl = await uploadFile(req.user.id, req.file.buffer, req.file.originalname);
    }

    if (!finalVideoUrl) {
      return res.status(400).json({ error: 'Une vidéo (fichier ou URL) est requise' });
    }

    const result = await generateVideoToVideo(req.user.id, finalVideoUrl, prompt, {
      resolution,
      duration: parseInt(duration) || 5,
      aspectRatio,
      seed,
      multiShots: multiShots === true || multiShots === 'true',
      enableAudio: enableAudio === true || enableAudio === 'true'
    });

    res.json({
      success: true,
      taskId: result.taskId,
      creditsUsed: result.creditsUsed,
      status: result.status
    });

  } catch (error) {
    logger.error('Erreur route video-to-video:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/wan/task/:taskId
 * Récupérer le statut d'une tâche et sauvegarder la vidéo si terminée
 */
router.get('/task/:taskId', authenticateToken, async (req, res) => {
  try {
    const { taskId } = req.params;
    const { autoSave = 'true' } = req.query;

    const taskStatus = await getTaskStatus(req.user.id, taskId);

    let savedVideo = null;

    // Si la tâche est terminée avec succès et autoSave est activé
    if (taskStatus.state === 'success' && autoSave === 'true' && taskStatus.resultJson) {
      const result = JSON.parse(taskStatus.resultJson);
      
      if (result.resultUrls && result.resultUrls.length > 0) {
        const videoUrl = result.resultUrls[0];
        
        // Sauvegarder la vidéo
        const { downloadAndSaveVideo } = await import('../services/wanService.js');
        savedVideo = await downloadAndSaveVideo(req.user.id, videoUrl, {
          taskId: taskStatus.taskId,
          model: taskStatus.model,
          prompt: result.prompt || '',
          resolution: result.resolution,
          duration: result.duration,
          aspectRatio: result.aspectRatio,
          creditsUsed: result.creditsUsed
        });
        
        logger.info(`Vidéo sauvegardée automatiquement: ${savedVideo.filepath}`);
      }
    }

    // Préparer la réponse avec les infos vidéo si disponible
    const response = {
      success: true,
      task: {
        taskId: taskStatus.taskId,
        model: taskStatus.model,
        state: taskStatus.state,
        resultJson: taskStatus.resultJson ? JSON.parse(taskStatus.resultJson) : null,
        failCode: taskStatus.failCode,
        failMsg: taskStatus.failMsg,
        failReason: taskStatus.failMsg,
        completeTime: taskStatus.completeTime,
        createTime: taskStatus.createTime,
        updateTime: taskStatus.updateTime
      }
    };

    // Si la vidéo a été sauvegardée, ajouter les infos pour le frontend
    if (savedVideo) {
      response.video = {
        id: savedVideo.id,
        url: `/stockage/users/${req.user.id}/video/${savedVideo.filename}`,
        filePath: savedVideo.filepath,
        filename: savedVideo.filename
      };
    }

    res.json(response);

  } catch (error) {
    logger.error('Erreur route task status:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/wan/credits
 * Récupérer le solde de crédits Kie.ai (admin uniquement)
 */
router.get('/credits', authenticateToken, async (req, res) => {
  try {
    // Vérifier si l'utilisateur est admin
    if (!req.user.isAdmin) {
      return res.status(403).json({ error: 'Accès refusé' });
    }

    const credits = await getAccountCredits(req.user.id);

    res.json({
      success: true,
      credits
    });

  } catch (error) {
    logger.error('Erreur route credits:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/wan/callback
 * Webhook pour recevoir les notifications de Kie.ai
 */
router.post('/callback', async (req, res) => {
  try {
    const { taskId, state, resultJson, failCode, failMsg } = req.body;

    logger.info(`Callback reçu pour tâche ${taskId}: ${state}`);

    // TODO: Implémenter la logique de traitement du callback
    // - Mettre à jour le statut dans la BDD
    // - Notifier l'utilisateur
    // - Télécharger et sauvegarder la vidéo si nécessaire

    res.json({ success: true });

  } catch (error) {
    logger.error('Erreur route callback:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
