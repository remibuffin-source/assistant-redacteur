import axios from 'axios';
import { logger } from '../utils/logger.js';

/**
 * Service de publication Facebook
 */
export class FacebookService {
  constructor() {
    this.baseURL = 'https://graph.facebook.com/v18.0';
  }

  /**
   * Publie sur une page Facebook
   * @param {Object} publication - Objet publication
   * @param {Object} platformData - Données plateforme
   * @param {Object} account - Compte social
   * @returns {Object} Résultat de la publication
   */
  async publishToPage(publication, platformData, account) {
    try {
      const pageId = platformData.accountId;
      const accessToken = account.accessToken;

      // Préparer le contenu du post
      const postContent = await this.preparePostContent(publication, platformData);

      let postData = {
        message: postContent,
        access_token: accessToken
      };

      // Ajouter des médias si présents
      if (publication.media && publication.media.images && publication.media.images.length > 0) {
        const mediaResult = await this.uploadMedia(publication.media.images[0], accessToken);
        if (mediaResult && mediaResult.id) {
          postData.attached_media = [{ media_fbid: mediaResult.id }];
        }
      }

      // Publier le post
      const response = await axios.post(
        `${this.baseURL}/${pageId}/feed`,
        postData
      );

      logger.info(`Facebook post published successfully: ${response.data.id}`);

      return {
        success: true,
        postId: response.data.id,
        postUrl: `https://facebook.com/${response.data.id}`,
        platform: 'facebook',
        metadata: {
          characterCount: postContent.length,
          hasMedia: !!(publication.media && publication.media.images && publication.media.images.length > 0)
        }
      };

    } catch (error) {
      logger.error('Facebook publish error:', error.response?.data || error.message);

      let errorMessage = error.message;

      if (error.response?.data?.error) {
        const fbError = error.response.data.error;
        errorMessage = fbError.message;

        if (fbError.code === 190) {
          errorMessage = 'Facebook access token expired. Please reconnect your account.';
        } else if (fbError.code === 200) {
          errorMessage = 'Facebook permissions insufficient. Please check your account permissions.';
        }
      }

      throw new Error(`Facebook API Error: ${errorMessage}`);
    }
  }

  /**
   * Publie sur un profil Facebook (moins courant pour les entreprises)
   * @param {Object} publication - Objet publication
   * @param {Object} platformData - Données plateforme
   * @param {Object} account - Compte social
   * @returns {Object} Résultat de la publication
   */
  async publishToProfile(publication, platformData, account) {
    try {
      const userId = platformData.accountId;
      const accessToken = account.accessToken;

      const postContent = await this.preparePostContent(publication, platformData);

      const postData = {
        message: postContent,
        access_token: accessToken
      };

      const response = await axios.post(
        `${this.baseURL}/${userId}/feed`,
        postData
      );

      return {
        success: true,
        postId: response.data.id,
        postUrl: `https://facebook.com/${response.data.id}`,
        platform: 'facebook'
      };

    } catch (error) {
      logger.error('Facebook profile publish error:', error);
      throw error;
    }
  }

  /**
   * Prépare le contenu du post Facebook
   * @param {Object} publication - Objet publication
   * @param {Object} platformData - Données plateforme
   * @returns {string} Contenu du post
   */
  async preparePostContent(publication, platformData) {
    let content = publication.content;

    // Facebook permet jusqu'à 63 206 caractères
    if (content.length > 60000) {
      content = content.substring(0, 60000) + '...';
    }

    // Ajouter des hashtags si configuré
    if (platformData.settings && platformData.settings.includeHashtags && publication.tags && publication.tags.length > 0) {
      const hashtags = publication.tags.slice(0, 5).map(tag => `#${tag}`).join(' ');
      content += '\n\n' + hashtags;
    }

    return content;
  }

  /**
   * Upload un média sur Facebook
   * @param {Object} image - Objet image
   * @param {string} accessToken - Token d'accès
   * @returns {Object} Résultat de l'upload
   */
  async uploadMedia(image, accessToken) {
    try {
      // En production, il faudrait télécharger l'image depuis l'URL
      // et l'uploader via l'API Facebook

      // Pour l'instant, on simule l'upload
      // Dans un environnement réel, il faudrait :
      // 1. Télécharger l'image depuis image.url
      // 2. L'uploader via POST /{page-id}/photos avec source={imageBuffer}

      logger.warn('Facebook media upload not fully implemented - using placeholder');

      return {
        id: 'temp_media_id_' + Date.now()
      };

    } catch (error) {
      logger.error('Facebook media upload error:', error);
      return null;
    }
  }

  /**
   * Vérifie les permissions du compte Facebook
   * @param {Object} account - Compte social
   * @returns {Object} Informations sur les permissions
   */
  async checkPermissions(account) {
    try {
      const response = await axios.get(
        `${this.baseURL}/me/permissions`,
        {
          params: {
            access_token: account.accessToken
          }
        }
      );

      const permissions = response.data.data || [];
      const hasPublishPermission = permissions.some(p => p.permission === 'pages_manage_posts' && p.status === 'granted');
      const hasEmailPermission = permissions.some(p => p.permission === 'email' && p.status === 'granted');

      return {
        canPost: hasPublishPermission,
        hasEmail: hasEmailPermission,
        permissions: permissions
      };

    } catch (error) {
      logger.error('Facebook permissions check error:', error);
      return { canPost: false, error: error.message };
    }
  }

  /**
   * Récupère les informations du compte Facebook
   * @param {Object} account - Compte social
   * @returns {Object} Informations du compte
   */
  async getAccountInfo(account) {
    try {
      // Récupérer les informations de base
      const userResponse = await axios.get(
        `${this.baseURL}/me`,
        {
          params: {
            fields: 'id,name,email,picture,accounts',
            access_token: account.accessToken
          }
        }
      );

      const userData = userResponse.data;

      // Si l'utilisateur gère des pages, récupérer les informations des pages
      let pages = [];
      if (userData.accounts && userData.accounts.data) {
        pages = userData.accounts.data.map(page => ({
          id: page.id,
          name: page.name,
          accessToken: page.access_token,
          category: page.category
        }));
      }

      return {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        avatar: userData.picture?.data?.url,
        pages: pages,
        totalPages: pages.length
      };

    } catch (error) {
      logger.error('Facebook account info error:', error);
      throw error;
    }
  }

  /**
   * Récupère les pages Facebook gérées par l'utilisateur
   * @param {Object} account - Compte social
   * @returns {Array} Liste des pages
   */
  async getManagedPages(account) {
    try {
      const response = await axios.get(
        `${this.baseURL}/me/accounts`,
        {
          params: {
            fields: 'id,name,access_token,category,fan_count',
            access_token: account.accessToken
          }
        }
      );

      return response.data.data.map(page => ({
        id: page.id,
        name: page.name,
        accessToken: page.access_token,
        category: page.category,
        fanCount: page.fan_count || 0
      }));

    } catch (error) {
      logger.error('Facebook get managed pages error:', error);
      return [];
    }
  }
}

// Export d'une instance unique
export const facebookService = new FacebookService();

// Fonction d'export pour l'utiliser dans les routes
export const publishToFacebook = async (publication, account, platformIndex) => {
  return await facebookService.publishToPage(publication, publication.platforms[platformIndex], account);
};
