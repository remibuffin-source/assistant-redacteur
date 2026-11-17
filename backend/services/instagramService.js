import axios from 'axios';
import { logger } from '../utils/logger.js';

/**
 * Service de publication Instagram via Graph API
 * Documentation: https://developers.facebook.com/docs/instagram-api/guides/content-publishing
 */
export class InstagramService {
  constructor() {
    this.baseURL = 'https://graph.facebook.com/v18.0';
  }

  /**
   * Publie une image sur Instagram (processus en 2 étapes)
   * @param {Object} publication - Objet publication
   * @param {Object} platformData - Données plateforme
   * @param {Object} account - Compte social
   * @returns {Object} Résultat de la publication
   */
  async publishPost(publication, platformData, account) {
    try {
      const igAccountId = platformData.accountId;
      const accessToken = account.accessToken;

      // Vérifier qu'il y a au moins une image
      if (!publication.media?.images || publication.media.images.length === 0) {
        throw new Error('Instagram requires at least one image');
      }

      // Préparer le caption
      const caption = await this.prepareCaption(publication, platformData);

      // Étape 1 : Créer un container média
      const containerId = await this.createMediaContainer(
        igAccountId,
        publication.media.images[0].url,
        caption,
        accessToken
      );

      // Attendre que le container soit prêt (Instagram traite l'image)
      await this.waitForContainerReady(igAccountId, containerId, accessToken);

      // Étape 2 : Publier le container
      const postId = await this.publishContainer(igAccountId, containerId, accessToken);

      logger.info(`Instagram post published successfully: ${postId}`);

      return {
        success: true,
        postId: postId,
        postUrl: `https://www.instagram.com/p/${postId}`,
        platform: 'instagram',
        metadata: {
          captionLength: caption.length,
          hasMedia: true,
          mediaType: 'IMAGE'
        }
      };

    } catch (error) {
      logger.error('Instagram publish error:', error.response?.data || error.message);

      let errorMessage = error.message;

      if (error.response?.data?.error) {
        const igError = error.response.data.error;
        errorMessage = igError.message;

        if (igError.code === 190) {
          errorMessage = 'Instagram access token expired. Please reconnect your account.';
        } else if (igError.code === 100) {
          errorMessage = 'Instagram API error. Please check your account permissions.';
        }
      }

      throw new Error(`Instagram API Error: ${errorMessage}`);
    }
  }

  /**
   * Crée un container média Instagram
   * @param {string} igAccountId - Instagram Business Account ID
   * @param {string} imageUrl - URL de l'image
   * @param {string} caption - Légende du post
   * @param {string} accessToken - Access token
   * @returns {string} Container ID
   */
  async createMediaContainer(igAccountId, imageUrl, caption, accessToken) {
    try {
      logger.info('Instagram: Creating media container');

      const response = await axios.post(
        `${this.baseURL}/${igAccountId}/media`,
        {
          image_url: imageUrl,
          caption: caption,
          access_token: accessToken
        }
      );

      const containerId = response.data.id;
      logger.info(`Instagram: Media container created: ${containerId}`);

      return containerId;

    } catch (error) {
      logger.error('Instagram create container error:', error.response?.data || error.message);
      throw new Error(`Instagram Create Container Error: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  /**
   * Attend que le container média soit prêt
   * @param {string} igAccountId - Instagram Business Account ID
   * @param {string} containerId - Container ID
   * @param {string} accessToken - Access token
   * @param {number} maxAttempts - Nombre maximum de tentatives
   */
  async waitForContainerReady(igAccountId, containerId, accessToken, maxAttempts = 10) {
    logger.info('Instagram: Waiting for container to be ready');

    for (let i = 0; i < maxAttempts; i++) {
      try {
        const response = await axios.get(
          `${this.baseURL}/${containerId}`,
          {
            params: {
              fields: 'status_code',
              access_token: accessToken
            }
          }
        );

        const statusCode = response.data.status_code;

        if (statusCode === 'FINISHED') {
          logger.info('Instagram: Container is ready');
          return;
        } else if (statusCode === 'ERROR') {
          throw new Error('Instagram container processing failed');
        }

        // Attendre 2 secondes avant de réessayer
        await new Promise(resolve => setTimeout(resolve, 2000));

      } catch (error) {
        if (i === maxAttempts - 1) {
          throw new Error('Instagram container timeout - image processing took too long');
        }
      }
    }

    throw new Error('Instagram container timeout');
  }

  /**
   * Publie un container média
   * @param {string} igAccountId - Instagram Business Account ID
   * @param {string} containerId - Container ID
   * @param {string} accessToken - Access token
   * @returns {string} Post ID
   */
  async publishContainer(igAccountId, containerId, accessToken) {
    try {
      logger.info('Instagram: Publishing container');

      const response = await axios.post(
        `${this.baseURL}/${igAccountId}/media_publish`,
        {
          creation_id: containerId,
          access_token: accessToken
        }
      );

      const postId = response.data.id;
      logger.info(`Instagram: Post published: ${postId}`);

      return postId;

    } catch (error) {
      logger.error('Instagram publish container error:', error.response?.data || error.message);
      throw new Error(`Instagram Publish Error: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  /**
   * Prépare le caption Instagram
   * @param {Object} publication - Objet publication
   * @param {Object} platformData - Données plateforme
   * @returns {string} Caption
   */
  async prepareCaption(publication, platformData) {
    let caption = publication.content;

    // Instagram limite à 2200 caractères
    if (caption.length > 2200) {
      caption = caption.substring(0, 2197) + '...';
    }

    // Ajouter des hashtags (recommandé pour Instagram)
    if (platformData.settings?.includeHashtags && publication.tags?.length > 0) {
      const hashtags = publication.tags.slice(0, 30).map(tag => `#${tag.replace(/\s+/g, '')}`).join(' ');
      
      // Vérifier qu'on ne dépasse pas la limite avec les hashtags
      if ((caption + '\n\n' + hashtags).length <= 2200) {
        caption += '\n\n' + hashtags;
      }
    }

    return caption;
  }

  /**
   * Publie un carrousel (plusieurs images)
   * @param {Object} publication - Objet publication
   * @param {Object} platformData - Données plateforme
   * @param {Object} account - Compte social
   * @returns {Object} Résultat de la publication
   */
  async publishCarousel(publication, platformData, account) {
    try {
      const igAccountId = platformData.accountId;
      const accessToken = account.accessToken;

      // Vérifier qu'il y a plusieurs images
      if (!publication.media?.images || publication.media.images.length < 2) {
        throw new Error('Carousel requires at least 2 images');
      }

      // Limiter à 10 images (limite Instagram)
      const images = publication.media.images.slice(0, 10);

      // Créer un container pour chaque image
      const childContainers = [];
      for (const image of images) {
        const containerId = await this.createCarouselItemContainer(
          igAccountId,
          image.url,
          accessToken
        );
        childContainers.push(containerId);
      }

      // Préparer le caption
      const caption = await this.prepareCaption(publication, platformData);

      // Créer le container carrousel
      const carouselContainerId = await this.createCarouselContainer(
        igAccountId,
        childContainers,
        caption,
        accessToken
      );

      // Attendre que le carrousel soit prêt
      await this.waitForContainerReady(igAccountId, carouselContainerId, accessToken);

      // Publier le carrousel
      const postId = await this.publishContainer(igAccountId, carouselContainerId, accessToken);

      logger.info(`Instagram carousel published successfully: ${postId}`);

      return {
        success: true,
        postId: postId,
        postUrl: `https://www.instagram.com/p/${postId}`,
        platform: 'instagram',
        metadata: {
          captionLength: caption.length,
          hasMedia: true,
          mediaType: 'CAROUSEL',
          mediaCount: images.length
        }
      };

    } catch (error) {
      logger.error('Instagram carousel publish error:', error.response?.data || error.message);
      throw new Error(`Instagram Carousel Error: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  /**
   * Crée un container pour un item de carrousel
   * @param {string} igAccountId - Instagram Business Account ID
   * @param {string} imageUrl - URL de l'image
   * @param {string} accessToken - Access token
   * @returns {string} Container ID
   */
  async createCarouselItemContainer(igAccountId, imageUrl, accessToken) {
    try {
      const response = await axios.post(
        `${this.baseURL}/${igAccountId}/media`,
        {
          image_url: imageUrl,
          is_carousel_item: true,
          access_token: accessToken
        }
      );

      return response.data.id;

    } catch (error) {
      logger.error('Instagram create carousel item error:', error.response?.data || error.message);
      throw new Error(`Instagram Carousel Item Error: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  /**
   * Crée un container carrousel
   * @param {string} igAccountId - Instagram Business Account ID
   * @param {Array} childContainers - IDs des containers enfants
   * @param {string} caption - Légende
   * @param {string} accessToken - Access token
   * @returns {string} Container ID
   */
  async createCarouselContainer(igAccountId, childContainers, caption, accessToken) {
    try {
      const response = await axios.post(
        `${this.baseURL}/${igAccountId}/media`,
        {
          media_type: 'CAROUSEL',
          children: childContainers,
          caption: caption,
          access_token: accessToken
        }
      );

      return response.data.id;

    } catch (error) {
      logger.error('Instagram create carousel container error:', error.response?.data || error.message);
      throw new Error(`Instagram Carousel Container Error: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  /**
   * Récupère les informations du compte Instagram
   * @param {string} igAccountId - Instagram Business Account ID
   * @param {string} accessToken - Access token
   * @returns {Object} Informations du compte
   */
  async getAccountInfo(igAccountId, accessToken) {
    try {
      const response = await axios.get(
        `${this.baseURL}/${igAccountId}`,
        {
          params: {
            fields: 'id,username,name,profile_picture_url,followers_count,follows_count,media_count',
            access_token: accessToken
          }
        }
      );

      return {
        id: response.data.id,
        username: response.data.username,
        name: response.data.name,
        avatar: response.data.profile_picture_url,
        followersCount: response.data.followers_count,
        followingCount: response.data.follows_count,
        mediaCount: response.data.media_count
      };

    } catch (error) {
      logger.error('Instagram get account info error:', error.response?.data || error.message);
      throw new Error(`Instagram Account Info Error: ${error.response?.data?.error?.message || error.message}`);
    }
  }
}

export const instagramService = new InstagramService();

export const publishToInstagram = async (publication, account, platformIndex) => {
  const platformData = publication.platforms[platformIndex];
  
  // Vérifier si c'est un carrousel (plusieurs images)
  if (publication.media?.images && publication.media.images.length > 1) {
    return await instagramService.publishCarousel(publication, platformData, account);
  } else {
    return await instagramService.publishPost(publication, platformData, account);
  }
};
