import axios from 'axios';
import { logger } from '../utils/logger.js';

/**
 * Service de publication LinkedIn
 */
export class LinkedInService {
  constructor() {
    this.baseURL = 'https://api.linkedin.com/v2';
  }

  /**
   * Publie sur LinkedIn
   * @param {Object} publication - Objet publication
   * @param {Object} platformData - Données plateforme
   * @param {Object} account - Compte social
   * @returns {Object} Résultat de la publication
   */
  async publishPost(publication, platformData, account) {
    try {
      const personId = platformData.accountId;
      const accessToken = account.accessToken;

      // Préparer le contenu du post LinkedIn
      const postContent = await this.preparePostContent(publication, platformData);

      // Structure du post LinkedIn
      const postData = {
        author: `urn:li:person:${personId}`,
        lifecycleState: 'PUBLISHED',
        specificContent: {
          'com.linkedin.ugc.ShareContent': {
            shareCommentary: {
              text: postContent
            },
            shareMediaCategory: 'NONE'
          }
        },
        visibility: {
          'com.linkedin.ugc.MemberNetworkVisibility': platformData.settings?.defaultVisibility?.toUpperCase() || 'PUBLIC'
        }
      };

      // Ajouter des médias si présents
      if (publication.media && publication.media.images && publication.media.images.length > 0) {
        const mediaUrn = await this.uploadMedia(publication.media.images[0], accessToken);
        if (mediaUrn) {
          postData.specificContent['com.linkedin.ugc.ShareContent'].shareMediaCategory = 'IMAGE';
          postData.specificContent['com.linkedin.ugc.ShareContent'].media = [{
            status: 'READY',
            description: {
              text: publication.title || 'Image partagée'
            },
            media: mediaUrn,
            title: {
              text: publication.title || 'Image'
            }
          }];
        }
      }

      // Publier le post
      const response = await axios.post(
        `${this.baseURL}/ugcPosts`,
        postData,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
            'X-Restli-Protocol-Version': '2.0.0'
          }
        }
      );

      logger.info(`LinkedIn post published successfully: ${response.data.id}`);

      return {
        success: true,
        postId: response.data.id,
        postUrl: `https://linkedin.com/feed/update/${response.data.id}`,
        platform: 'linkedin',
        metadata: {
          characterCount: postContent.length,
          hasMedia: !!(publication.media && publication.media.images && publication.media.images.length > 0)
        }
      };

    } catch (error) {
      logger.error('LinkedIn publish error:', error.response?.data || error.message);

      let errorMessage = error.message;

      if (error.response?.data) {
        const linkedinError = error.response.data;
        if (linkedinError.message) {
          errorMessage = linkedinError.message;
        }

        if (linkedinError.status === 401) {
          errorMessage = 'LinkedIn access token expired. Please reconnect your account.';
        } else if (linkedinError.status === 403) {
          errorMessage = 'LinkedIn permissions insufficient. Please check your account permissions.';
        }
      }

      throw new Error(`LinkedIn API Error: ${errorMessage}`);
    }
  }

  /**
   * Prépare le contenu du post LinkedIn
   * @param {Object} publication - Objet publication
   * @param {Object} platformData - Données plateforme
   * @returns {string} Contenu du post
   */
  async preparePostContent(publication, platformData) {
    let content = publication.content;

    // LinkedIn permet jusqu'à 3000 caractères
    if (content.length > 3000) {
      content = content.substring(0, 2997) + '...';
    }

    // Ajouter des hashtags si configuré (LinkedIn supporte les hashtags)
    if (platformData.settings && platformData.settings.includeHashtags && publication.tags && publication.tags.length > 0) {
      const hashtags = publication.tags.slice(0, 3).map(tag => `#${tag}`).join(' ');
      if ((content + '\n\n' + hashtags).length <= 3000) {
        content += '\n\n' + hashtags;
      }
    }

    return content;
  }

  /**
   * Upload un média sur LinkedIn
   * @param {Object} image - Objet image
   * @param {string} accessToken - Token d'accès
   * @returns {string} URN du média uploadé
   */
  async uploadMedia(image, accessToken) {
    try {
      // En production, il faudrait :
      // 1. Télécharger l'image depuis image.url
      // 2. L'uploader via POST /assets avec le contenu binaire
      // 3. Récupérer l'asset URN

      logger.warn('LinkedIn media upload not fully implemented - using placeholder');

      return `urn:li:digitalmediaAsset:temp_${Date.now()}`;

    } catch (error) {
      logger.error('LinkedIn media upload error:', error);
      return null;
    }
  }

  /**
   * Vérifie les permissions du compte LinkedIn
   * @param {Object} account - Compte social
   * @returns {Object} Informations sur les permissions
   */
  async checkPermissions(account) {
    try {
      const response = await axios.get(
        `${this.baseURL}/people/~`,
        {
          headers: {
            'Authorization': `Bearer ${account.accessToken}`
          }
        }
      );

      const profile = response.data;

      return {
        canPost: true, // Si on peut récupérer le profil, on peut généralement poster
        profile: {
          id: profile.id,
          firstName: profile.firstName?.localized?.fr_FR || profile.firstName?.localized?.en_US,
          lastName: profile.lastName?.localized?.fr_FR || profile.lastName?.localized?.en_US,
          headline: profile.headline?.localized?.fr_FR || profile.headline?.localized?.en_US
        }
      };

    } catch (error) {
      logger.error('LinkedIn permissions check error:', error);
      return { canPost: false, error: error.message };
    }
  }

  /**
   * Récupère les informations du profil LinkedIn
   * @param {Object} account - Compte social
   * @returns {Object} Informations du profil
   */
  async getProfileInfo(account) {
    try {
      const response = await axios.get(
        `${this.baseURL}/people/~`,
        {
          params: {
            projection: '(id,firstName,lastName,profilePicture(displayImage~:playableStreams))'
          },
          headers: {
            'Authorization': `Bearer ${account.accessToken}`
          }
        }
      );

      const profile = response.data;

      return {
        id: profile.id,
        firstName: profile.firstName?.localized?.fr_FR || profile.firstName?.localized?.en_US,
        lastName: profile.lastName?.localized?.fr_FR || profile.lastName?.localized?.en_US,
        avatar: profile.profilePicture?.displayImage?.elements?.[0]?.identifiers?.[0]?.identifier,
        headline: profile.headline?.localized?.fr_FR || profile.headline?.localized?.en_US
      };

    } catch (error) {
      logger.error('LinkedIn profile info error:', error);
      throw error;
    }
  }

  /**
   * Récupère les statistiques du profil LinkedIn
   * @param {Object} account - Compte social
   * @returns {Object} Statistiques du profil
   */
  async getProfileStats(account) {
    try {
      // LinkedIn ne fournit pas directement les statistiques via l'API basique
      // Il faudrait utiliser des APIs partenaires ou des outils tiers

      return {
        connections: 0, // Non disponible via API basique
        followers: 0,   // Non disponible via API basique
        posts: 0        // Non disponible via API basique
      };

    } catch (error) {
      logger.error('LinkedIn profile stats error:', error);
      return { connections: 0, followers: 0, posts: 0 };
    }
  }
}

// Export d'une instance unique
export const linkedInService = new LinkedInService();

// Fonction d'export pour l'utiliser dans les routes
export const publishToLinkedIn = async (publication, account, platformIndex) => {
  return await linkedInService.publishPost(publication, publication.platforms[platformIndex], account);
};
