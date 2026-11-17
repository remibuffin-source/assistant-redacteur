import express from 'express';
import wixBlogService from '../services/wixBlogService.js';
import { authenticateToken } from '../middleware/auth.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

/**
 * POST /api/wix-blog/test
 * Tester la connexion à l'API Wix Blog
 */
router.post('/test', authenticateToken, async (req, res) => {
  try {
    const { appId, appSecret } = req.body;

    if (!appId || !appSecret) {
      return res.status(400).json({
        success: false,
        message: 'App ID et App Secret requis'
      });
    }

    const result = await wixBlogService.testConnection(appId, appSecret);

    return res.json(result);

  } catch (error) {
    logger.error('Wix Blog test error:', error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * GET /api/wix-blog/categories
 * Récupérer les catégories du blog Wix
 */
router.get('/categories', authenticateToken, async (req, res) => {
  try {
    const { appId, appSecret } = req.query;

    if (!appId || !appSecret) {
      return res.status(400).json({
        success: false,
        message: 'App ID et App Secret requis'
      });
    }

    const accessToken = await wixBlogService.getAccessToken(appId, appSecret);
    const categories = await wixBlogService.getCategories(accessToken);

    return res.json({
      success: true,
      categories
    });

  } catch (error) {
    logger.error('Wix Blog get categories error:', error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * POST /api/wix-blog/publish
 * Publier un article sur Wix Blog
 */
router.post('/publish', authenticateToken, async (req, res) => {
  try {
    const { publication, credentials, options } = req.body;

    if (!publication || !credentials) {
      return res.status(400).json({
        success: false,
        message: 'Publication et credentials requis'
      });
    }

    if (!credentials.appId || !credentials.appSecret) {
      return res.status(400).json({
        success: false,
        message: 'App ID et App Secret requis dans credentials'
      });
    }

    const result = await wixBlogService.createBlogPost(
      publication,
      credentials,
      options || {}
    );

    return res.json(result);

  } catch (error) {
    logger.error('Wix Blog publish error:', error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * POST /api/wix-blog/upload-image
 * Uploader une image vers Wix Media Manager
 */
router.post('/upload-image', authenticateToken, async (req, res) => {
  try {
    const { imageUrl, appId, appSecret } = req.body;

    if (!imageUrl || !appId || !appSecret) {
      return res.status(400).json({
        success: false,
        message: 'imageUrl, appId et appSecret requis'
      });
    }

    const accessToken = await wixBlogService.getAccessToken(appId, appSecret);
    const imageId = await wixBlogService.uploadImageFromUrl(imageUrl, accessToken);

    return res.json({
      success: true,
      imageId
    });

  } catch (error) {
    logger.error('Wix Blog upload image error:', error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

export default router;
