import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import Video from '../models/Video.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

/**
 * GET /api/videos
 * Récupérer toutes les vidéos de l'utilisateur connecté
 */
router.get('/', authenticateToken, async (req, res) => {
  try {
    const videos = await Video.findAll({
      where: {
        userId: req.user.id,
        isActive: true
      },
      order: [['createdAt', 'DESC']],
      limit: 50
    });

    // Transformer les vidéos pour le frontend
    const formattedVideos = videos.map(video => ({
      id: video.id,
      taskId: video.taskId,
      model: video.model,
      content: video.prompt,
      isVideo: true,
      status: 'success',
      progress: 'Vidéo prête !',
      videoUrl: `${process.env.API_URL || 'https://api.assistant-redacteur.fr'}${video.url}`,
      videoPath: video.filepath,
      videoId: video.id,
      creditsUsed: video.creditsUsed,
      createdAt: video.createdAt,
      metadata: {
        resolution: video.resolution,
        duration: video.duration,
        aspectRatio: video.aspectRatio,
        fileSize: video.fileSize
      }
    }));

    res.json({
      success: true,
      videos: formattedVideos
    });

  } catch (error) {
    logger.error('Erreur récupération vidéos:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * DELETE /api/videos/:id
 * Supprimer une vidéo
 */
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const video = await Video.findOne({
      where: {
        id,
        userId: req.user.id
      }
    });

    if (!video) {
      return res.status(404).json({ error: 'Vidéo introuvable' });
    }

    // Marquer comme inactive au lieu de supprimer
    await video.update({ isActive: false });

    res.json({
      success: true,
      message: 'Vidéo supprimée'
    });

  } catch (error) {
    logger.error('Erreur suppression vidéo:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
