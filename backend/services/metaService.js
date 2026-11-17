import axios from 'axios';
import { logger } from '../utils/logger.js';

/**
 * Service Meta (Facebook/Instagram) API
 * Documentation: https://developers.facebook.com/docs/graph-api
 */
export class MetaService {
  constructor() {
    this.baseURL = 'https://graph.facebook.com/v18.0';
    this.tokenCache = new Map();
  }

  /**
   * Générer l'URL d'autorisation OAuth
   * @param {string} appId - Meta App ID
   * @param {string} redirectUri - URL de callback
   * @param {string[]} scopes - Permissions demandées
   * @returns {string} URL d'autorisation
   */
  getAuthorizationUrl(appId, redirectUri, scopes = []) {
    // Permissions de base (fonctionnent sans compte Business)
    const defaultScopes = [
      'public_profile',
      'email'
    ];
    
    const scopeList = scopes.length > 0 ? scopes : defaultScopes;
    
    const params = new URLSearchParams({
      client_id: appId,
      redirect_uri: redirectUri,
      scope: scopeList.join(','),
      response_type: 'code',
      state: Math.random().toString(36).substring(7)
    });

    return `https://www.facebook.com/v18.0/dialog/oauth?${params.toString()}`;
  }

  /**
   * Échanger le code d'autorisation contre un access token
   * @param {string} code - Code d'autorisation
   * @param {string} appId - Meta App ID
   * @param {string} appSecret - Meta App Secret
   * @param {string} redirectUri - URL de callback
   * @returns {Object} Token data
   */
  async exchangeCodeForToken(code, appId, appSecret, redirectUri) {
    try {
      logger.info('Meta OAuth: Exchange code for token');

      const response = await axios.get(`${this.baseURL}/oauth/access_token`, {
        params: {
          client_id: appId,
          client_secret: appSecret,
          redirect_uri: redirectUri,
          code: code
        }
      });

      const { access_token, expires_in } = response.data;

      logger.info('Meta OAuth: Short-lived token obtained');

      // Échanger contre un long-lived token (60 jours)
      const longLivedToken = await this.getLongLivedToken(access_token, appId, appSecret);

      return {
        accessToken: longLivedToken.access_token,
        expiresIn: longLivedToken.expires_in,
        tokenType: 'Bearer'
      };

    } catch (error) {
      logger.error('Meta OAuth error:', error.response?.data || error.message);
      throw new Error(`Meta OAuth Error: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  /**
   * Obtenir un long-lived user access token (60 jours)
   * @param {string} shortLivedToken - Short-lived token
   * @param {string} appId - Meta App ID
   * @param {string} appSecret - Meta App Secret
   * @returns {Object} Long-lived token data
   */
  async getLongLivedToken(shortLivedToken, appId, appSecret) {
    try {
      const response = await axios.get(`${this.baseURL}/oauth/access_token`, {
        params: {
          grant_type: 'fb_exchange_token',
          client_id: appId,
          client_secret: appSecret,
          fb_exchange_token: shortLivedToken
        }
      });

      logger.info('Meta OAuth: Long-lived token obtained (60 days)');
      return response.data;

    } catch (error) {
      logger.error('Meta long-lived token error:', error.response?.data || error.message);
      throw new Error(`Meta Long-Lived Token Error: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  /**
   * Obtenir les Pages Facebook de l'utilisateur
   * @param {string} userAccessToken - User access token
   * @returns {Array} Liste des Pages
   */
  async getUserPages(userAccessToken) {
    try {
      const response = await axios.get(`${this.baseURL}/me/accounts`, {
        params: {
          access_token: userAccessToken,
          fields: 'id,name,access_token,instagram_business_account'
        }
      });

      logger.info(`Meta: Found ${response.data.data.length} pages`);
      return response.data.data;

    } catch (error) {
      logger.error('Meta get pages error:', error.response?.data || error.message);
      throw new Error(`Meta Get Pages Error: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  /**
   * Obtenir le compte Instagram Business lié à une Page
   * @param {string} pageId - Facebook Page ID
   * @param {string} pageAccessToken - Page access token
   * @returns {Object} Instagram account data
   */
  async getInstagramAccount(pageId, pageAccessToken) {
    try {
      const response = await axios.get(`${this.baseURL}/${pageId}`, {
        params: {
          access_token: pageAccessToken,
          fields: 'instagram_business_account{id,username,profile_picture_url}'
        }
      });

      if (!response.data.instagram_business_account) {
        throw new Error('No Instagram Business account linked to this Page');
      }

      logger.info('Meta: Instagram account found:', response.data.instagram_business_account.username);
      return response.data.instagram_business_account;

    } catch (error) {
      logger.error('Meta get Instagram account error:', error.response?.data || error.message);
      throw new Error(`Meta Get Instagram Account Error: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  /**
   * Vérifier la validité d'un access token
   * @param {string} accessToken - Access token à vérifier
   * @returns {Object} Token info
   */
  async debugToken(accessToken) {
    try {
      const response = await axios.get(`${this.baseURL}/debug_token`, {
        params: {
          input_token: accessToken,
          access_token: accessToken
        }
      });

      return response.data.data;

    } catch (error) {
      logger.error('Meta debug token error:', error.response?.data || error.message);
      throw new Error(`Meta Debug Token Error: ${error.response?.data?.error?.message || error.message}`);
    }
  }
}

export const metaService = new MetaService();
