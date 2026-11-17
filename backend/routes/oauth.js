import express from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import { body } from 'express-validator';
import { authenticateToken } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validation.js';
import User from '../models/User.js';
import SocialAccount from '../models/SocialAccount.sequelize.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

// Configuration OAuth (sera configurée dans un fichier séparé)
import '../config/passport.js';

// @route   GET /api/oauth/google
// @desc    Initiate Google OAuth
// @access  Public
router.get('/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    session: false
  })
);

// @route   GET /api/oauth/google/callback
// @desc    Google OAuth callback
// @access  Public
router.get('/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/login' }),
  async (req, res) => {
    try {
      const { user, token, refreshToken } = req.user;

      // Rediriger vers le frontend avec les tokens
      const redirectUrl = `${process.env.FRONTEND_URL}/oauth/callback?token=${token}&refreshToken=${refreshToken}&provider=google`;
      res.redirect(redirectUrl);
    } catch (error) {
      logger.error('Google OAuth callback error:', error);
      res.redirect(`${process.env.FRONTEND_URL}/login?error=oauth_failed`);
    }
  }
);

// @route   GET /api/oauth/facebook
// @desc    Initiate Facebook OAuth
// @access  Public
router.get('/facebook',
  passport.authenticate('facebook', {
    scope: ['email', 'pages_manage_posts', 'publish_to_groups'],
    session: false
  })
);

// @route   GET /api/oauth/facebook/callback
// @desc    Facebook OAuth callback
// @access  Public
router.get('/facebook/callback',
  passport.authenticate('facebook', { session: false, failureRedirect: '/login' }),
  async (req, res) => {
    try {
      const { user, token, refreshToken } = req.user;

      const redirectUrl = `${process.env.FRONTEND_URL}/oauth/callback?token=${token}&refreshToken=${refreshToken}&provider=facebook`;
      res.redirect(redirectUrl);
    } catch (error) {
      logger.error('Facebook OAuth callback error:', error);
      res.redirect(`${process.env.FRONTEND_URL}/login?error=oauth_failed`);
    }
  }
);

// @route   GET /api/oauth/twitter
// @desc    Initiate Twitter OAuth
// @access  Public
router.get('/twitter',
  passport.authenticate('twitter', {
    session: false
  })
);

// @route   GET /api/oauth/twitter/callback
// @desc    Twitter OAuth callback
// @access  Public
router.get('/twitter/callback',
  passport.authenticate('twitter', { session: false, failureRedirect: '/login' }),
  async (req, res) => {
    try {
      const { user, token, refreshToken } = req.user;

      const redirectUrl = `${process.env.FRONTEND_URL}/oauth/callback?token=${token}&refreshToken=${refreshToken}&provider=twitter`;
      res.redirect(redirectUrl);
    } catch (error) {
      logger.error('Twitter OAuth callback error:', error);
      res.redirect(`${process.env.FRONTEND_URL}/login?error=oauth_failed`);
    }
  }
);

// @route   GET /api/oauth/linkedin
// @desc    Initiate LinkedIn OAuth
// @access  Public
router.get('/linkedin',
  passport.authenticate('linkedin', {
    scope: ['r_liteprofile', 'w_member_social', 'r_emailaddress'],
    session: false
  })
);

// @route   GET /api/oauth/linkedin/callback
// @desc    LinkedIn OAuth callback
// @access  Public
router.get('/linkedin/callback',
  passport.authenticate('linkedin', { session: false, failureRedirect: '/login' }),
  async (req, res) => {
    try {
      const { user, token, refreshToken } = req.user;

      const redirectUrl = `${process.env.FRONTEND_URL}/oauth/callback?token=${token}&refreshToken=${refreshToken}&provider=linkedin`;
      res.redirect(redirectUrl);
    } catch (error) {
      logger.error('LinkedIn OAuth callback error:', error);
      res.redirect(`${process.env.FRONTEND_URL}/login?error=oauth_failed`);
    }
  }
);

// @route   GET /api/oauth/accounts
// @desc    Get user's connected social accounts
// @access  Private
router.get('/accounts', authenticateToken, async (req, res) => {
  try {
    const accounts = await SocialAccount.find({
      userId: req.user.id,
      status: 'active'
    }).sort({ platform: 1 });

    res.json({
      success: true,
      data: accounts
    });
  } catch (error) {
    logger.error('Get social accounts error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching social accounts'
    });
  }
});

// @route   POST /api/oauth/accounts/:platform/disconnect
// @desc    Disconnect a social account
// @access  Private
router.post('/accounts/:platform/disconnect', authenticateToken, async (req, res) => {
  try {
    const { platform } = req.params;

    const account = await SocialAccount.findOneAndUpdate(
      {
        userId: req.user.id,
        platform: platform,
        status: 'active'
      },
      {
        status: 'revoked',
        tokenExpiresAt: new Date()
      },
      { new: true }
    );

    if (!account) {
      return res.status(404).json({
        success: false,
        error: 'Social account not found or already disconnected'
      });
    }

    res.json({
      success: true,
      message: `${platform} account disconnected successfully`
    });
  } catch (error) {
    logger.error('Disconnect social account error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while disconnecting account'
    });
  }
});

// @route   GET /api/oauth/platforms
// @desc    Get available OAuth platforms
// @access  Public
router.get('/platforms', (req, res) => {
  const platforms = [
    {
      id: 'google',
      name: 'Google',
      description: 'Connect your Google account for enhanced features',
      icon: 'fab fa-google',
      color: '#4285F4',
      scopes: ['profile', 'email'],
      available: true
    },
    {
      id: 'facebook',
      name: 'Facebook',
      description: 'Connect your Facebook account to publish posts',
      icon: 'fab fa-facebook',
      color: '#1877F2',
      scopes: ['email', 'pages_manage_posts', 'publish_to_groups'],
      available: true
    },
    {
      id: 'twitter',
      name: 'X (Twitter)',
      description: 'Connect your X account to publish tweets',
      icon: 'fab fa-twitter',
      color: '#1DA1F2',
      scopes: ['tweet.read', 'tweet.write', 'users.read'],
      available: true
    },
    {
      id: 'linkedin',
      name: 'LinkedIn',
      description: 'Connect your LinkedIn account for professional posts',
      icon: 'fab fa-linkedin',
      color: '#0077B5',
      scopes: ['r_liteprofile', 'w_member_social'],
      available: true
    },
    {
      id: 'instagram',
      name: 'Instagram',
      description: 'Connect your Instagram business account',
      icon: 'fab fa-instagram',
      color: '#E1306C',
      scopes: ['user_profile', 'user_media'],
      available: false // Nécessite Instagram Basic Display API
    },
    {
      id: 'tiktok',
      name: 'TikTok',
      description: 'Connect your TikTok account for video content',
      icon: 'fab fa-tiktok',
      color: '#000000',
      scopes: ['user.info.basic', 'video.publish'],
      available: false // API TikTok limitée
    }
  ];

  res.json({
    success: true,
    data: platforms
  });
});

// @route   GET /api/oauth/status
// @desc    Check OAuth connection status for all platforms
// @access  Private
router.get('/status', authenticateToken, async (req, res) => {
  try {
    const accounts = await SocialAccount.find({
      userId: req.user.id
    });

    const status = {
      google: { connected: false, account: null },
      facebook: { connected: false, account: null },
      twitter: { connected: false, account: null },
      linkedin: { connected: false, account: null },
      instagram: { connected: false, account: null },
      tiktok: { connected: false, account: null }
    };

    accounts.forEach(account => {
      if (status[account.platform]) {
        status[account.platform] = {
          connected: account.status === 'active',
          account: {
            id: account.accountId,
            name: account.accountName,
            displayName: account.displayName,
            avatar: account.avatar,
            lastSync: account.lastSyncAt
          }
        };
      }
    });

    res.json({
      success: true,
      data: status
    });
  } catch (error) {
    logger.error('OAuth status check error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while checking OAuth status'
    });
  }
});

export default router;
