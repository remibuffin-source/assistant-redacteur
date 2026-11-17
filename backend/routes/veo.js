import express from 'express';
import multer from 'multer';
import { authenticateToken } from '../middleware/auth.js';
import {
  uploadImageFile,
  generateVeoVideo,
  getVeoTaskStatus,
  downloadAndSaveVeoVideo,
  getVeoAccountCredits
} from '../services/veoService.js';
import Video from '../models/Video.js';
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
 * POST /api/veo/text-to-video
 * Générer une vidéo à partir d'un texte uniquement
 */
router.post('/text-to-video', authenticateToken, async (req, res) => {
  try {
    const { prompt, model, aspectRatio, seeds, watermark, enableTranslation } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Le prompt est requis' });
    }

    const result = await generateVeoVideo(req.user.id, {
      prompt,
      model: model || 'veo3_fast',
      aspectRatio: aspectRatio || '16:9',
      seeds: seeds ? parseInt(seeds) : null,
      watermark,
      enableTranslation: enableTranslation !== false,
      generationType: 'TEXT_2_VIDEO'
    });

    res.json({
      success: true,
      taskId: result.taskId,
      creditsUsed: result.creditsUsed,
      status: result.status
    });

  } catch (error) {
    logger.error('Erreur route text-to-video Veo:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/veo/image-to-video
 * Générer une vidéo à partir d'une ou plusieurs images
 */
router.post('/image-to-video', authenticateToken, upload.array('images', 2), async (req, res) => {
  try {
    const { prompt, model, aspectRatio, seeds, watermark, enableTranslation, generationType, imageUrls } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Le prompt est requis' });
    }

    let finalImageUrls = [];

    // Si des URLs sont fournies directement
    if (imageUrls) {
      try {
        finalImageUrls = JSON.parse(imageUrls);
      } catch (e) {
        finalImageUrls = [imageUrls];
      }
    }

    // Si des fichiers ont été uploadés, les envoyer à Kie.ai
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const uploadedUrl = await uploadImageFile(req.user.id, file.buffer, file.originalname);
        finalImageUrls.push(uploadedUrl);
      }
    }

    if (finalImageUrls.length === 0) {
      return res.status(400).json({ error: 'Au moins une image (fichier ou URL) est requise' });
    }

    // Limiter à 2 images maximum pour FIRST_AND_LAST_FRAMES_2_VIDEO
    // ou 3 images pour REFERENCE_2_VIDEO
    const maxImages = generationType === 'REFERENCE_2_VIDEO' ? 3 : 2;
    if (finalImageUrls.length > maxImages) {
      finalImageUrls = finalImageUrls.slice(0, maxImages);
    }

    const result = await generateVeoVideo(req.user.id, {
      prompt,
      imageUrls: finalImageUrls,
      model: model || 'veo3_fast',
      aspectRatio: aspectRatio || '16:9',
      seeds: seeds ? parseInt(seeds) : null,
      watermark,
      enableTranslation: enableTranslation !== false,
      generationType: generationType || 'FIRST_AND_LAST_FRAMES_2_VIDEO'
    });

    res.json({
      success: true,
      taskId: result.taskId,
      creditsUsed: result.creditsUsed,
      status: result.status
    });

  } catch (error) {
    logger.error('Erreur route image-to-video Veo:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/veo/task/:taskId
 * Récupérer le statut d'une tâche et sauvegarder la vidéo si terminée
 */
router.get('/task/:taskId', authenticateToken, async (req, res) => {
  try {
    const { taskId } = req.params;
    const { autoSave = 'true' } = req.query;

    const taskStatus = await getVeoTaskStatus(req.user.id, taskId);

    let savedVideo = null;

    // Si la tâche est terminée avec succès et autoSave est activé
    if (taskStatus.state === 'success' && autoSave === 'true' && taskStatus.resultUrls.length > 0) {
      // Vérifier si la vidéo existe déjà en base pour ce taskId
      const existingVideo = await Video.findOne({
        where: {
          userId: req.user.id,
          taskId: taskStatus.taskId,
          isActive: true
        }
      });

      if (existingVideo) {
        // Vidéo déjà sauvegardée, retourner les infos existantes
        logger.info(`Vidéo Veo déjà sauvegardée pour taskId ${taskStatus.taskId}, réutilisation`);
        savedVideo = {
          id: existingVideo.id,
          filename: existingVideo.filename,
          filepath: existingVideo.filepath,
          url: existingVideo.url
        };
      } else {
        // Nouvelle vidéo, télécharger et sauvegarder
        const videoUrl = taskStatus.resultUrls[0];
        
        // Parser le paramJson pour récupérer les métadonnées
        let metadata = {};
        try {
          metadata = JSON.parse(taskStatus.paramJson || '{}');
        } catch (e) {
          logger.warn('Impossible de parser paramJson:', e);
        }

        // Sauvegarder la vidéo
        savedVideo = await downloadAndSaveVeoVideo(req.user.id, videoUrl, {
          taskId: taskStatus.taskId,
          model: metadata.model || 'veo3_fast',
          prompt: metadata.prompt || '',
          resolution: taskStatus.resolution,
          aspectRatio: metadata.aspect_ratio || '16:9',
          seeds: metadata.seeds,
          watermark: metadata.watermark,
          generationType: metadata.generationType,
          fallbackFlag: taskStatus.fallbackFlag
        });
        
        logger.info(`Vidéo Veo sauvegardée automatiquement: ${savedVideo.filepath}`);
      }
    }

    // Préparer la réponse
    const response = {
      success: true,
      task: {
        taskId: taskStatus.taskId,
        state: taskStatus.state,
        successFlag: taskStatus.successFlag,
        resultUrls: taskStatus.resultUrls,
        originUrls: taskStatus.originUrls,
        resolution: taskStatus.resolution,
        fallbackFlag: taskStatus.fallbackFlag,
        errorCode: taskStatus.errorCode,
        errorMessage: taskStatus.errorMessage,
        completeTime: taskStatus.completeTime,
        createTime: taskStatus.createTime
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
    logger.error('Erreur route task status Veo:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/veo/credits
 * Récupérer le solde de crédits Kie.ai (admin uniquement)
 */
router.get('/credits', authenticateToken, async (req, res) => {
  try {
    // Vérifier que l'utilisateur est admin
    if (!req.user.isAdmin) {
      return res.status(403).json({ error: 'Accès réservé aux administrateurs' });
    }

    const credits = await getVeoAccountCredits();

    res.json({
      success: true,
      credits
    });

  } catch (error) {
    logger.error('Erreur route credits Veo:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
