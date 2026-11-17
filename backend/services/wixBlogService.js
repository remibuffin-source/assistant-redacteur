import axios from 'axios';
import { logger } from '../utils/logger.js';

/**
 * Service de publication Wix Blog API
 * Documentation: https://dev.wix.com/docs/build-apps/develop-your-app/access/authentication/authenticate-using-oauth
 */
export class WixBlogService {
  constructor() {
    this.baseURL = 'https://www.wixapis.com';
    this.tokenCache = new Map();
  }

  /**
   * Obtenir un access token OAuth 2.0
   * @param {string} appId - Wix App ID
   * @param {string} appSecret - Wix App Secret
   * @returns {string} Access token
   */
  async getAccessToken(appId, appSecret) {
    const cacheKey = `${appId}:${appSecret}`;
    
    // TEMPORAIRE : Désactiver le cache pour forcer le refresh avec le nouveau Content-Type
    // if (this.tokenCache.has(cacheKey)) {
    //   const cached = this.tokenCache.get(cacheKey);
    //   if (cached.expiresAt > Date.now()) {
    //     return cached.token;
    //   }
    // }

    try {
      // Log des credentials pour diagnostic (masquer en production)
      logger.info('Wix OAuth attempt:', {
        appId: appId?.substring(0, 8) + '...',
        hasSecret: !!appSecret,
        secretLength: appSecret?.length
      });

      // Wix OAuth utilise JSON, pas form-urlencoded
      const response = await axios.post(
        `${this.baseURL}/oauth/access`,
        {
          grant_type: 'client_credentials',
          client_id: appId,
          client_secret: appSecret
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      const token = response.data.access_token;
      const expiresIn = response.data.expires_in || 86400;
      
      this.tokenCache.set(cacheKey, {
        token,
        expiresAt: Date.now() + (expiresIn * 1000) - 60000
      });

      logger.info('Wix Blog access token obtained successfully');
      return token;

    } catch (error) {
      logger.error('Wix Blog OAuth error:', error.response?.data || error.message);
      logger.error('Wix OAuth error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        headers: error.response?.headers
      });
      logger.error('Request sent:', {
        url: `${this.baseURL}/oauth/access`,
        appIdProvided: !!appId,
        appSecretProvided: !!appSecret
      });
      throw new Error(`Wix OAuth Error: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Importer une image depuis une URL vers Wix Media Manager
   * @param {string} imageUrl - URL de l'image
   * @param {string} accessToken - Access token Wix
   * @returns {string} ID de l'image dans Wix
   */
  async uploadImageFromUrl(imageUrl, accessToken) {
    try {
      const response = await axios.post(
        `${this.baseURL}/media-manager/v1/files/import-from-url`,
        {
          url: imageUrl,
          mediaType: 'IMAGE'
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const imageId = response.data.file.id;
      logger.info(`Wix image uploaded successfully: ${imageId}`);
      return imageId;

    } catch (error) {
      logger.error('Wix image upload error:', error.response?.data || error.message);
      throw new Error(`Wix Media Upload Error: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Récupérer les catégories du blog
   * @param {string} accessToken - Access token Wix
   * @returns {Array} Liste des catégories
   */
  async getCategories(accessToken) {
    try {
      const response = await axios.get(
        `${this.baseURL}/blog/v2/categories`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        }
      );

      return response.data.categories || [];

    } catch (error) {
      logger.error('Wix get categories error:', error.response?.data || error.message);
      return [];
    }
  }

  /**
   * Créer un article de blog sur Wix
   * @param {Object} publication - Objet publication
   * @param {Object} credentials - Credentials Wix (appId, appSecret)
   * @param {Object} options - Options supplémentaires (categoryIds, etc.)
   * @returns {Object} Résultat de la publication
   */
  async createBlogPost(publication, credentials, options = {}) {
    try {
      logger.info('🔵 Wix Blog createBlogPost - Start');
      logger.info('📦 Publication:', JSON.stringify(publication, null, 2));
      logger.info('🔑 Credentials:', { appId: credentials.appId, hasSecret: !!credentials.appSecret });
      
      const { appId, appSecret } = credentials;
      const accessToken = await this.getAccessToken(appId, appSecret);
      logger.info('✅ Access token obtained');

      let coverImageId = null;
      if (publication.imageUrl) {
        try {
          coverImageId = await this.uploadImageFromUrl(publication.imageUrl, accessToken);
        } catch (imageError) {
          logger.warn('Failed to upload cover image, continuing without it:', imageError.message);
        }
      }

      const richContentNodes = [];
      
      if (publication.content) {
        const paragraphs = publication.content.split('\n\n').filter(p => p.trim());
        paragraphs.forEach(paragraph => {
          richContentNodes.push({
            type: 'PARAGRAPH',
            nodes: [
              {
                type: 'TEXT',
                textData: {
                  text: paragraph.trim()
                }
              }
            ]
          });
        });
      }

      if (coverImageId) {
        richContentNodes.push({
          type: 'IMAGE',
          imageData: {
            src: { id: coverImageId }
          }
        });
      }

      const draftPostData = {
        draftPost: {
          title: publication.title || 'Article sans titre',
          richContent: {
            nodes: richContentNodes
          },
          publish: options.publish !== false
        }
      };

      if (coverImageId) {
        draftPostData.draftPost.coverMedia = {
          image: { id: coverImageId }
        };
      }

      if (options.categoryIds && options.categoryIds.length > 0) {
        draftPostData.draftPost.categoryIds = options.categoryIds;
      }

      const response = await axios.post(
        `${this.baseURL}/blog/v2/draft-posts`,
        draftPostData,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const postId = response.data.draftPost?.id;
      logger.info(`Wix Blog post created successfully: ${postId}`);

      return {
        success: true,
        postId,
        postUrl: response.data.draftPost?.url || null,
        platform: 'wixBlog',
        metadata: {
          title: publication.title,
          hasImage: !!coverImageId,
          published: options.publish !== false
        }
      };

    } catch (error) {
      logger.error('❌ Wix Blog publish error - Full error:', error);
      logger.error('❌ Error message:', error.message);
      logger.error('❌ Error response:', error.response?.data);
      logger.error('❌ Error stack:', error.stack);

      let errorMessage = error.message;
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data) {
        errorMessage = JSON.stringify(error.response.data);
      }

      throw new Error(`Wix Blog API Error: ${errorMessage}`);
    }
  }

  /**
   * Tester la connexion à l'API Wix
   * @param {string} appId - Wix App ID
   * @param {string} appSecret - Wix App Secret
   * @returns {Object} Résultat du test
   */
  async testConnection(appId, appSecret) {
    try {
      const accessToken = await this.getAccessToken(appId, appSecret);
      const categories = await this.getCategories(accessToken);

      return {
        success: true,
        message: 'Connexion Wix Blog réussie',
        categoriesCount: categories.length
      };

    } catch (error) {
      logger.error('Wix Blog test connection error:', error.message);
      return {
        success: false,
        message: error.message
      };
    }
  }
}

export default new WixBlogService();
