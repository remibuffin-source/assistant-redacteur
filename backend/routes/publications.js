import express from 'express';
import { body, param } from 'express-validator';
import { authenticateToken } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validation.js';
import Publication from '../models/Publication.js';
import SocialAccount from '../models/SocialAccount.js';
import User from '../models/User.js';
import { logger } from '../utils/logger.js';

// Services de publication par plateforme
import { publishToTwitter } from '../services/twitterService.js';
import { publishToFacebook } from '../services/facebookService.js';
import { publishToLinkedIn } from '../services/linkedinService.js';

const router = express.Router();

// @route   GET /api/publications
// @desc    Get user's publications
// @access  Private
router.get('/', authenticateToken, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      platform,
      startDate,
      endDate,
      search
    } = req.query;

    // Construire les conditions de filtrage
    const filterConditions = { userId: req.user.id };

    if (status) {
      filterConditions['platforms.status'] = status;
    }

    if (platform) {
      filterConditions['platforms.platform'] = platform;
    }

    if (startDate || endDate) {
      filterConditions['platforms.scheduledDate'] = {};
      if (startDate) filterConditions['platforms.scheduledDate'].$gte = new Date(startDate);
      if (endDate) filterConditions['platforms.scheduledDate'].$lte = new Date(endDate);
    }

    if (search) {
      filterConditions.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const publications = await Publication.find(filterConditions)
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Publication.countDocuments(filterConditions);

    res.json({
      success: true,
      data: publications,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    logger.error('Get publications error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching publications'
    });
  }
});

// @route   POST /api/publications
// @desc    Create a new publication
// @access  Private
router.post('/',
  authenticateToken,
  [
    body('title').trim().isLength({ min: 1, max: 200 }).withMessage('Title is required and must be less than 200 characters'),
    body('content').trim().isLength({ min: 1, max: 10000 }).withMessage('Content is required and must be less than 10000 characters'),
    body('platforms').isArray({ min: 1 }).withMessage('At least one platform is required'),
    body('platforms.*.platform').isIn(['twitter', 'facebook', 'instagram', 'linkedin', 'youtube', 'tiktok']).withMessage('Invalid platform'),
    body('platforms.*.accountId').notEmpty().withMessage('Account ID is required for each platform'),
    body('platforms.*.scheduledDate').isISO8601().withMessage('Valid scheduled date is required')
  ],
  validateRequest,
  async (req, res) => {
    try {
      const { title, content, platforms, tags, category, settings, advanced } = req.body;

      // Vérifier que les comptes sont connectés
      for (const platform of platforms) {
        const account = await SocialAccount.findOne({
          userId: req.user.id,
          platform: platform.platform,
          accountId: platform.accountId,
          status: 'active'
        });

        if (!account) {
          return res.status(400).json({
            success: false,
            error: `Account ${platform.accountId} for ${platform.platform} is not connected or expired`
          });
        }
      }

      const publication = new Publication({
        userId: req.user.id,
        title,
        content,
        platforms,
        tags: tags || [],
        category: category || null,
        settings: settings || {},
        advanced: advanced || {}
      });

      await publication.save();

      // Ajouter à l'historique
      publication.history.push({
        action: 'created',
        timestamp: new Date(),
        details: 'Publication created',
        userId: req.user.id
      });

      await publication.save();

      logger.info(`Publication created: ${publication._id} by user ${req.user.id}`);

      res.status(201).json({
        success: true,
        data: publication,
        message: 'Publication created successfully'
      });
    } catch (error) {
      logger.error('Create publication error:', error);
      res.status(500).json({
        success: false,
        error: 'Server error while creating publication'
      });
    }
  }
);

// @route   GET /api/publications/:id
// @desc    Get a specific publication
// @access  Private
router.get('/:id',
  authenticateToken,
  [
    param('id').isMongoId().withMessage('Invalid publication ID')
  ],
  validateRequest,
  async (req, res) => {
    try {
      const publication = await Publication.findOne({
        _id: req.params.id,
        userId: req.user.id
      }).populate('userId', 'name email');

      if (!publication) {
        return res.status(404).json({
          success: false,
          error: 'Publication not found'
        });
      }

      res.json({
        success: true,
        data: publication
      });
    } catch (error) {
      logger.error('Get publication error:', error);
      res.status(500).json({
        success: false,
        error: 'Server error while fetching publication'
      });
    }
  }
);

// @route   PUT /api/publications/:id
// @desc    Update a publication
// @access  Private
router.put('/:id',
  authenticateToken,
  [
    param('id').isMongoId().withMessage('Invalid publication ID'),
    body('title').optional().trim().isLength({ min: 1, max: 200 }),
    body('content').optional().trim().isLength({ min: 1, max: 10000 })
  ],
  validateRequest,
  async (req, res) => {
    try {
      const publication = await Publication.findOne({
        _id: req.params.id,
        userId: req.user.id
      });

      if (!publication) {
        return res.status(404).json({
          success: false,
          error: 'Publication not found'
        });
      }

      // Mettre à jour les champs autorisés
      const allowedFields = ['title', 'content', 'tags', 'category', 'settings', 'advanced'];
      allowedFields.forEach(field => {
        if (req.body[field] !== undefined) {
          publication[field] = req.body[field];
        }
      });

      // Ajouter à l'historique
      publication.history.push({
        action: 'edited',
        timestamp: new Date(),
        details: 'Publication updated',
        userId: req.user.id
      });

      await publication.save();

      res.json({
        success: true,
        data: publication,
        message: 'Publication updated successfully'
      });
    } catch (error) {
      logger.error('Update publication error:', error);
      res.status(500).json({
        success: false,
        error: 'Server error while updating publication'
      });
    }
  }
);

// @route   DELETE /api/publications/:id
// @desc    Delete a publication
// @access  Private
router.delete('/:id',
  authenticateToken,
  [
    param('id').isMongoId().withMessage('Invalid publication ID')
  ],
  validateRequest,
  async (req, res) => {
    try {
      const publication = await Publication.findOneAndDelete({
        _id: req.params.id,
        userId: req.user.id
      });

      if (!publication) {
        return res.status(404).json({
          success: false,
          error: 'Publication not found'
        });
      }

      logger.info(`Publication deleted: ${req.params.id} by user ${req.user.id}`);

      res.json({
        success: true,
        message: 'Publication deleted successfully'
      });
    } catch (error) {
      logger.error('Delete publication error:', error);
      res.status(500).json({
        success: false,
        error: 'Server error while deleting publication'
      });
    }
  }
);

// @route   POST /api/publications/:id/publish/:platform
// @desc    Publish immediately to a specific platform
// @access  Private
router.post('/:id/publish/:platform',
  authenticateToken,
  [
    param('id').isMongoId().withMessage('Invalid publication ID'),
    param('platform').isIn(['twitter', 'facebook', 'linkedin']).withMessage('Invalid platform')
  ],
  validateRequest,
  async (req, res) => {
    try {
      const { id, platform } = req.params;

      const publication = await Publication.findOne({
        _id: id,
        userId: req.user.id
      });

      if (!publication) {
        return res.status(404).json({
          success: false,
          error: 'Publication not found'
        });
      }

      // Trouver la plateforme spécifique
      const platformIndex = publication.platforms.findIndex(p => p.platform === platform);

      if (platformIndex === -1) {
        return res.status(400).json({
          success: false,
          error: `${platform} platform not configured for this publication`
        });
      }

      // Vérifier le compte
      const account = await SocialAccount.findOne({
        userId: req.user.id,
        platform: platform,
        accountId: publication.platforms[platformIndex].accountId,
        status: 'active'
      });

      if (!account) {
        return res.status(400).json({
          success: false,
          error: `Account for ${platform} is not connected or expired`
        });
      }

      // Publier selon la plateforme
      let result;
      try {
        switch (platform) {
          case 'twitter':
            result = await publishToTwitter(publication, account, platformIndex);
            break;
          case 'facebook':
            result = await publishToFacebook(publication, account, platformIndex);
            break;
          case 'linkedin':
            result = await publishToLinkedIn(publication, account, platformIndex);
            break;
          default:
            throw new Error(`Publishing to ${platform} not yet implemented`);
        }

        // Mettre à jour le statut
        await publication.updatePlatformStatus(platformIndex, 'published', {
          postId: result.postId,
          postUrl: result.postUrl
        });

        // Mettre à jour les statistiques utilisateur
        await req.user.updateStats({
          success: true,
          platform: platform
        });

        // Mettre à jour les statistiques du compte
        await account.updateStats({ success: true });

        res.json({
          success: true,
          message: `Successfully published to ${platform}`,
          data: {
            postId: result.postId,
            postUrl: result.postUrl,
            platform: platform
          }
        });

      } catch (publishError) {
        logger.error(`Publish to ${platform} error:`, publishError);

        // Mettre à jour le statut comme échoué
        await publication.updatePlatformStatus(platformIndex, 'failed', {
          errorMessage: publishError.message
        });

        // Mettre à jour les statistiques utilisateur
        await req.user.updateStats({
          success: false,
          platform: platform
        });

        res.status(500).json({
          success: false,
          error: `Failed to publish to ${platform}: ${publishError.message}`
        });
      }

    } catch (error) {
      logger.error('Manual publish error:', error);
      res.status(500).json({
        success: false,
        error: 'Server error while publishing'
      });
    }
  }
);

// @route   POST /api/publications/:id/reschedule
// @desc    Reschedule a publication
// @access  Private
router.post('/:id/reschedule',
  authenticateToken,
  [
    param('id').isMongoId().withMessage('Invalid publication ID'),
    body('newDate').isISO8601().withMessage('Valid new date is required')
  ],
  validateRequest,
  async (req, res) => {
    try {
      const { newDate } = req.body;

      const publication = await Publication.findOne({
        _id: req.params.id,
        userId: req.user.id
      });

      if (!publication) {
        return res.status(404).json({
          success: false,
          error: 'Publication not found'
        });
      }

      await publication.reschedule(new Date(newDate), req.user.id);

      res.json({
        success: true,
        message: 'Publication rescheduled successfully',
        data: publication
      });
    } catch (error) {
      logger.error('Reschedule publication error:', error);
      res.status(500).json({
        success: false,
        error: 'Server error while rescheduling publication'
      });
    }
  }
);

// @route   GET /api/publications/stats/overview
// @desc    Get publication statistics overview
// @access  Private
router.get('/stats/overview', authenticateToken, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // Construire la condition de date
    const dateFilter = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
      if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
    }

    const stats = await Publication.aggregate([
      { $match: { userId: req.user.id, ...dateFilter } },
      { $unwind: '$platforms' },
      {
        $group: {
          _id: null,
          totalPublications: { $sum: 1 },
          published: {
            $sum: { $cond: [{ $eq: ['$platforms.status', 'published'] }, 1, 0] }
          },
          pending: {
            $sum: { $cond: [{ $eq: ['$platforms.status', 'pending'] }, 1, 0] }
          },
          failed: {
            $sum: { $cond: [{ $eq: ['$platforms.status', 'failed'] }, 1, 0] }
          },
          cancelled: {
            $sum: { $cond: [{ $eq: ['$platforms.status', 'cancelled'] }, 1, 0] }
          }
        }
      }
    ]);

    const platformStats = await Publication.getPlatformStats(req.user.id, startDate ? new Date(startDate) : null, endDate ? new Date(endDate) : null);

    res.json({
      success: true,
      data: {
        overview: stats[0] || {
          totalPublications: 0,
          published: 0,
          pending: 0,
          failed: 0,
          cancelled: 0
        },
        byPlatform: platformStats
      }
    });
  } catch (error) {
    logger.error('Get publication stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching statistics'
    });
  }
});

export default router;
