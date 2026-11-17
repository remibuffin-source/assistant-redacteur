import express from 'express';
import { metaService } from '../services/metaService.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

/**
 * GET /meta/auth/url
 * Génère l'URL d'autorisation OAuth Meta
 */
router.get('/auth/url', (req, res) => {
  try {
    const appId = process.env.META_APP_ID;
    const redirectUri = `${process.env.FRONTEND_URL}/auth/facebook/callback`;
    
    if (!appId) {
      return res.status(500).json({
        success: false,
        message: 'Meta App ID not configured'
      });
    }

    const authUrl = metaService.getAuthorizationUrl(appId, redirectUri);

    res.json({
      success: true,
      authUrl: authUrl
    });

  } catch (error) {
    logger.error('Meta auth URL error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * POST /meta/auth/token
 * Échange le code d'autorisation contre un access token
 */
router.post('/auth/token', async (req, res) => {
  try {
    const { code } = req.body;
    
    if (!code) {
      return res.status(400).json({
        success: false,
        message: 'Authorization code is required'
      });
    }

    const appId = process.env.META_APP_ID;
    const appSecret = process.env.META_APP_SECRET;
    const redirectUri = `${process.env.FRONTEND_URL}/auth/facebook/callback`;

    if (!appId || !appSecret) {
      return res.status(500).json({
        success: false,
        message: 'Meta credentials not configured'
      });
    }

    // Échanger le code contre un token
    const tokenData = await metaService.exchangeCodeForToken(code, appId, appSecret, redirectUri);

    // Récupérer les Pages de l'utilisateur
    const pages = await metaService.getUserPages(tokenData.accessToken);

    // Pour chaque Page, vérifier si elle a un compte Instagram lié
    const pagesWithInstagram = await Promise.all(
      pages.map(async (page) => {
        try {
          const igAccount = await metaService.getInstagramAccount(page.id, page.access_token);
          return {
            ...page,
            instagram: igAccount
          };
        } catch (error) {
          // Page sans Instagram lié
          return page;
        }
      })
    );

    res.json({
      success: true,
      data: {
        userAccessToken: tokenData.accessToken,
        expiresIn: tokenData.expiresIn,
        pages: pagesWithInstagram
      }
    });

  } catch (error) {
    logger.error('Meta token exchange error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * GET /meta/pages
 * Récupère les Pages Facebook de l'utilisateur
 */
router.get('/pages', async (req, res) => {
  try {
    const { accessToken } = req.query;

    if (!accessToken) {
      return res.status(400).json({
        success: false,
        message: 'Access token is required'
      });
    }

    const pages = await metaService.getUserPages(accessToken);

    res.json({
      success: true,
      data: pages
    });

  } catch (error) {
    logger.error('Meta get pages error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * GET /meta/instagram/:pageId
 * Récupère le compte Instagram lié à une Page
 */
router.get('/instagram/:pageId', async (req, res) => {
  try {
    const { pageId } = req.params;
    const { accessToken } = req.query;

    if (!accessToken) {
      return res.status(400).json({
        success: false,
        message: 'Access token is required'
      });
    }

    const igAccount = await metaService.getInstagramAccount(pageId, accessToken);

    res.json({
      success: true,
      data: igAccount
    });

  } catch (error) {
    logger.error('Meta get Instagram account error:', error);
    res.status(404).json({
      success: false,
      message: error.message
    });
  }
});

export default router;
