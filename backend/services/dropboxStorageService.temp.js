import { TwitterApi } from 'twitter-api-v2';
import { logger } from '../utils/logger.js';

/**
 * Service de publication Twitter/X
 *
 * Important : le client Twitter n'est plus instancié au chargement du module
 * pour éviter de bloquer tout le backend quand les variables d'environnement
 * Twitter ne sont pas configurées. Les clients sont créés au cas par cas dans
 * les méthodes qui en ont besoin.
 */
export class TwitterService {
  constructor() {
    // Pas d'initialisation de client global ici pour ne pas faire échouer
    // le démarrage du serveur si les clés Twitter ne sont pas définies.
  }

  /**
   * Publie un tweet
   * @param {Object} publication - Objet publication
   * @param {Object} platformData - Données plateforme
   * @param {Object} account - Compte social
   * @returns {Object} Résultat de la publication
   */
  async publishTweet(publication, platformData, account) {
    try {
      // Préparer le contenu du tweet
      const tweetContent = await this.prepareTweetContent(publication, platformData);

      // Créer le client avec les tokens du compte utilisateur
      const userClient = new TwitterApi({
        appKey: process.env.TWITTER_API_KEY,
        appSecret: process.env.TWITTER_API_SECRET,
        accessToken: account.accessToken,
        accessSecret: account.refreshToken, // Twitter utilise refreshToken pour accessSecret
      });

      let tweetResult;

      // Vérifier si le contenu contient des médias
      if (publication.media && publication.media.images && publication.media.images.length > 0) {
        tweetResult = await this.publishTweetWithMedia(userClient, tweetContent, publication);
      } else {
        tweetResult = await userClient.v2.tweet(tweetContent);
      }

      logger.info(`Tweet published successfully: ${tweetResult.data.id}`);

      return {
        success: true,
        postId: tweetResult.data.id,
        postUrl: `https://twitter.com/i/web/status/${tweetResult.data.id}`,
        platform: 'twitter',
        metadata: {
          characterCount: tweetContent.length,
          hasMedia: !!(publication.media && publication.media.images && publication.media.images.length > 0)
        }
      };

    } catch (error) {
      logger.error('Twitter publish error:', error);

      // Gérer les erreurs spécifiques Twitter
      let errorMessage = error.message;

      if (error.code === 429) {
        errorMessage = 'Twitter rate limit exceeded. Please try again later.';
      } else if (error.code === 401) {
        errorMessage = 'Twitter authentication failed. Please reconnect your account.';
      } else if (error.code === 403) {
        errorMessage = 'Twitter access forbidden. Check your account permissions.';
      } else if (error.data && error.data.detail) {
        errorMessage = error.data.detail;
      }

      throw new Error(`Twitter API Error: ${errorMessage}`);
    }
  }

  /**
   * Prépare le contenu du tweet selon les limites de caractères
   * @param {Object} publication - Objet publication
   * @param {Object} platformData - Données plateforme
   * @returns {string} Contenu du tweet
   */
  async prepareTweetContent(publication, platformData) {
    let content = publication.content;

    // Tronquer si nécessaire (280 caractères max)
    if (content.length > 280) {
      content = content.substring(0, 277) + '...';
    }

    // Ajouter des hashtags si configuré
    if (platformData.settings && platformData.settings.includeHashtags && publication.tags && publication.tags.length > 0) {
      const hashtags = publication.tags.slice(0, 3).map(tag => `#${tag}`).join(' ');
      if ((content + ' ' + hashtags).length <= 280) {
        content += ' ' + hashtags;
      }
    }

    // Ajouter des mentions si configuré
    if (platformData.settings && platformData.settings.includeMentions && publication.mentions && publication.mentions.length > 0) {
      const mentions = publication.mentions.map(mention => `@${mention}`).join(' ');
      if ((content + ' ' + mentions).length <= 280) {
        content += ' ' + mentions;
      }
    }

    return content;
  }

  /**
   * Publie un tweet avec médias
   * @param {TwitterApi} client - Client Twitter
   * @param {string} tweetContent - Contenu du tweet
   * @param {Object} publication - Objet publication
   * @returns {Object} Résultat de la publication
   */
  async publishTweetWithMedia(client, tweetContent, publication) {
    try {
      // Télécharger les images (max 4 pour Twitter)
      const mediaIds = [];

      for (const image of publication.media.images.slice(0, 4)) {
        // Note: En production, il faudrait télécharger l'image depuis l'URL
        // Pour l'instant, on suppose que les images sont déjà uploadées
        // ou qu'on utilise des URLs publiques

        if (image.url.startsWith('http')) {
          // Pour les URLs publiques, Twitter peut les utiliser directement
          // Mais il faut les uploader via l'API media
          const mediaResult = await client.v1.uploadMedia(image.url, {
            mimeType: this.getMimeType(image.url)
          });
          mediaIds.push(mediaResult);
        }
      }

      // Publier le tweet avec médias
      if (mediaIds.length === 1) {
        return await client.v2.tweet({
          text: tweetContent,
          media: { media_ids: mediaIds }
        });
      } else if (mediaIds.length > 1) {
        return await client.v2.tweet({
          text: tweetContent,
          media: { media_ids: mediaIds }
        });
      }

    } catch (error) {
      logger.error('Twitter media upload error:', error);
      // En cas d'erreur avec les médias, publier sans médias
      return await client.v2.tweet(tweetContent);
    }
  }

  /**
   * Détermine le type MIME d'une image depuis son URL
   * @param {string} url - URL de l'image
   * @returns {string} Type MIME
   */
  getMimeType(url) {
    const extension = url.split('.').pop().toLowerCase();
    const mimeTypes = {
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif',
      'webp': 'image/webp'
    };
    return mimeTypes[extension] || 'image/jpeg';
  }

  /**
   * Vérifie si le compte a les permissions nécessaires
   * @param {Object} account - Compte social
   * @returns {boolean} True si autorisé
   */
  async checkPermissions(account) {
    try {
      const userClient = new TwitterApi({
        appKey: process.env.TWITTER_API_KEY,
        appSecret: process.env.TWITTER_API_SECRET,
        accessToken: account.accessToken,
        accessSecret: account.refreshToken,
      });

      // Vérifier les permissions en récupérant les informations du compte
      const user = await userClient.v2.me({
        'user.fields': ['public_metrics', 'verified', 'protected']
      });

      return {
        canPost: !user.data.protected, // Ne peut pas poster sur des comptes protégés
        isVerified: user.data.verified || false,
        followersCount: user.data.public_metrics?.followers_count || 0
      };

    } catch (error) {
      logger.error('Twitter permissions check error:', error);
      return { canPost: false, error: error.message };
    }
  }

  /**
   * Récupère les informations du compte
   * @param {Object} account - Compte social
   * @returns {Object} Informations du compte
   */
  async getAccountInfo(account) {
    try {
      const userClient = new TwitterApi({
        appKey: process.env.TWITTER_API_KEY,
        appSecret: process.env.TWITTER_API_SECRET,
        accessToken: account.accessToken,
        accessSecret: account.refreshToken,
      });

      const user = await userClient.v2.me({
        'user.fields': ['public_metrics', 'verified', 'profile_image_url', 'description']
      });

      return {
        id: user.data.id,
        username: user.data.username,
        name: user.data.name,
        description: user.data.description,
        avatar: user.data.profile_image_url?.replace('_normal', '_400x400'),
        verified: user.data.verified,
        followers: user.data.public_metrics?.followers_count || 0,
        following: user.data.public_metrics?.following_count || 0,
        tweets: user.data.public_metrics?.tweet_count || 0
      };

    } catch (error) {
      logger.error('Twitter account info error:', error);
      throw error;
    }
  }
}

// Export d'une instance unique
export const twitterService = new TwitterService();

// Fonction d'export pour l'utiliser dans les routes
export const publishToTwitter = async (publication, account, platformIndex) => {
  return await twitterService.publishTweet(publication, publication.platforms[platformIndex], account);
};
