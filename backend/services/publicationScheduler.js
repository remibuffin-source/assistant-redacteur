import cron from 'node-cron';
import Publication from '../models/Publication.js';
import SocialAccount from '../models/SocialAccount.js';
import User from '../models/User.js';
import { logger } from '../utils/logger.js';

// Services de publication
import { publishToTwitter } from '../services/twitterService.js';
import { publishToFacebook } from '../services/facebookService.js';
import { publishToLinkedIn } from '../services/linkedinService.js';

/**
 * Service de publication automatique
 */
class PublicationScheduler {
  constructor() {
    this.isRunning = false;
    this.job = null;
  }

  /**
   * Démarre le scheduler de publication
   */
  start() {
    if (this.isRunning) {
      logger.warn('Publication scheduler is already running');
      return;
    }

    logger.info('🚀 Starting publication scheduler...');

    // Vérifier toutes les minutes pour les publications à publier
    this.job = cron.schedule('* * * * *', async () => {
      await this.processPendingPublications();
    }, {
      scheduled: false,
      timezone: process.env.CRON_TIMEZONE || 'Europe/Paris'
    });

    this.job.start();
    this.isRunning = true;

    logger.info('✅ Publication scheduler started successfully');
  }

  /**
   * Arrête le scheduler de publication
   */
  stop() {
    if (this.job) {
      this.job.stop();
      this.isRunning = false;
      logger.info('🛑 Publication scheduler stopped');
    }
  }

  /**
   * Traite les publications en attente
   */
  async processPendingPublications() {
    try {
      const now = new Date();

      // Trouver les publications à publier maintenant
      const publications = await Publication.findPendingPublications();

      logger.info(`📋 Found ${publications.length} publications to process`);

      for (const publication of publications) {
        await this.processPublication(publication);
      }

    } catch (error) {
      logger.error('Error processing pending publications:', error);
    }
  }

  /**
   * Traite une publication individuelle
   * @param {Object} publication - Publication à traiter
   */
  async processPublication(publication) {
    try {
      logger.info(`📝 Processing publication: ${publication._id}`);

      // Récupérer l'utilisateur
      const user = await User.findById(publication.userId);
      if (!user) {
        logger.error(`User not found for publication ${publication._id}`);
        return;
      }

      // Traiter chaque plateforme
      for (let i = 0; i < publication.platforms.length; i++) {
        const platform = publication.platforms[i];

        if (platform.status !== 'pending') {
          continue; // Déjà publié ou annulé
        }

        if (new Date(platform.scheduledDate) > new Date()) {
          continue; // Pas encore l'heure
        }

        await this.publishToPlatform(publication, platform, i, user);
      }

    } catch (error) {
      logger.error(`Error processing publication ${publication._id}:`, error);
    }
  }

  /**
   * Publie sur une plateforme spécifique
   * @param {Object} publication - Publication
   * @param {Object} platform - Données plateforme
   * @param {number} platformIndex - Index de la plateforme
   * @param {Object} user - Utilisateur
   */
  async publishToPlatform(publication, platform, platformIndex, user) {
    try {
      // Vérifier le compte social
      const account = await SocialAccount.findOne({
        userId: user._id,
        platform: platform.platform,
        accountId: platform.accountId,
        status: 'active'
      });

      if (!account) {
        logger.error(`Social account not found or expired for ${platform.platform}:${platform.accountId}`);
        await publication.updatePlatformStatus(platformIndex, 'failed', {
          errorMessage: 'Social account not found or expired'
        });
        return;
      }

      // Vérifier les permissions du compte
      let canPublish = true;
      let permissionError = null;

      switch (platform.platform) {
        case 'twitter':
          const twitterPermissions = await twitterService.checkPermissions(account);
          canPublish = twitterPermissions.canPost;
          permissionError = twitterPermissions.error;
          break;
        case 'facebook':
          const facebookPermissions = await facebookService.checkPermissions(account);
          canPublish = facebookPermissions.canPost;
          permissionError = facebookPermissions.error;
          break;
        case 'linkedin':
          const linkedinPermissions = await linkedinService.checkPermissions(account);
          canPublish = linkedinPermissions.canPost;
          permissionError = linkedinPermissions.error;
          break;
      }

      if (!canPublish) {
        logger.error(`Insufficient permissions for ${platform.platform}:${platform.accountId}`);
        await publication.updatePlatformStatus(platformIndex, 'failed', {
          errorMessage: permissionError || 'Insufficient permissions'
        });
        return;
      }

      // Publier selon la plateforme
      let result;
      try {
        switch (platform.platform) {
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
            throw new Error(`Publishing to ${platform.platform} not yet implemented`);
        }

        // Succès
        await publication.updatePlatformStatus(platformIndex, 'published', {
          postId: result.postId,
          postUrl: result.postUrl
        });

        // Mettre à jour les statistiques utilisateur
        await user.updateStats({
          success: true,
          platform: platform.platform
        });

        // Mettre à jour les statistiques du compte
        await account.updateStats({ success: true });

        logger.info(`✅ Successfully published to ${platform.platform}: ${result.postId}`);

      } catch (publishError) {
        logger.error(`❌ Failed to publish to ${platform.platform}:`, publishError.message);

        // Échec
        await publication.updatePlatformStatus(platformIndex, 'failed', {
          errorMessage: publishError.message
        });

        // Mettre à jour les statistiques utilisateur
        await user.updateStats({
          success: false,
          platform: platform.platform
        });

        // Mettre à jour les statistiques du compte
        await account.updateStats({ success: false });
      }

    } catch (error) {
      logger.error(`Error publishing to ${platform.platform}:`, error);
    }
  }

  /**
   * Obtient les statistiques du scheduler
   */
  getStats() {
    return {
      isRunning: this.isRunning,
      nextRun: this.job ? this.job.scheduledJobs[0]?.nextDate() : null,
      scheduledPublications: null // À implémenter avec une requête directe
    };
  }

  /**
   * Force la publication d'une publication spécifique (pour les tests)
   * @param {string} publicationId - ID de la publication
   */
  async forcePublish(publicationId) {
    try {
      const publication = await Publication.findById(publicationId).populate('userId');

      if (!publication) {
        throw new Error('Publication not found');
      }

      await this.processPublication(publication);

      return { success: true, message: 'Publication processed' };

    } catch (error) {
      logger.error('Force publish error:', error);
      throw error;
    }
  }
}

// Créer et exporter une instance unique
export const publicationScheduler = new PublicationScheduler();

// Démarrer automatiquement si ce n'est pas en mode test
if (process.env.NODE_ENV !== 'test') {
  publicationScheduler.start();
}

export default publicationScheduler;
