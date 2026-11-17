import express from 'express';
import { facebookService } from '../services/facebookService.js';
import { instagramService } from '../services/instagramService.js';
import { logger } from '../utils/logger.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

/**
 * POST /social/facebook/publish
 * Publie sur Facebook
 */
router.post('/facebook/publish', authenticateToken, async (req, res) => {
  try {
    const { publication, pageId, pageAccessToken } = req.body;

    if (!publication || !pageId || !pageAccessToken) {
      return res.status(400).json({
        success: false,
        message: 'Publication, pageId and pageAccessToken are required'
      });
    }

    // Préparer les données de plateforme
    const platformData = {
      accountId: pageId,
      settings: publication.settings || {}
    };

    const account = {
      accessToken: pageAccessToken
    };

    const result = await facebookService.publishToPage(publication, platformData, account);

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    logger.error('Facebook publish route error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * POST /social/instagram/publish
 * Publie sur Instagram
 */
router.post('/instagram/publish', authenticateToken, async (req, res) => {
  try {
    const { publication, igAccountId, pageAccessToken } = req.body;

    if (!publication || !igAccountId || !pageAccessToken) {
      return res.status(400).json({
        success: false,
        message: 'Publication, igAccountId and pageAccessToken are required'
      });
    }

    // Vérifier qu'il y a au moins une image
    if (!publication.media?.images || publication.media.images.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Instagram requires at least one image'
      });
    }

    // Préparer les données de plateforme
    const platformData = {
      accountId: igAccountId,
      settings: publication.settings || {}
    };

    const account = {
      accessToken: pageAccessToken
    };

    // Choisir entre post simple ou carrousel
    let result;
    if (publication.media.images.length > 1) {
      result = await instagramService.publishCarousel(publication, platformData, account);
    } else {
      result = await instagramService.publishPost(publication, platformData, account);
    }

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    logger.error('Instagram publish route error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * GET /social/facebook/pages
 * Récupère les Pages Facebook de l'utilisateur
 */
router.get('/facebook/pages', authenticateToken, async (req, res) => {
  try {
    const { accessToken } = req.query;

    if (!accessToken) {
      return res.status(400).json({
        success: false,
        message: 'Access token is required'
      });
    }

    const account = { accessToken };
    const pages = await facebookService.getManagedPages(account);

    res.json({
      success: true,
      data: pages
    });

  } catch (error) {
    logger.error('Facebook get pages route error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * GET /social/instagram/account/:igAccountId
 * Récupère les informations d'un compte Instagram
 */
router.get('/instagram/account/:igAccountId', authenticateToken, async (req, res) => {
  try {
    const { igAccountId } = req.params;
    const { accessToken } = req.query;

    if (!accessToken) {
      return res.status(400).json({
        success: false,
        message: 'Access token is required'
      });
    }

    const accountInfo = await instagramService.getAccountInfo(igAccountId, accessToken);

    res.json({
      success: true,
      data: accountInfo
    });

  } catch (error) {
    logger.error('Instagram get account route error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

export default router;
