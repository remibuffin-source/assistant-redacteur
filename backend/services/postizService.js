import axios from 'axios';
import crypto from 'crypto';

/**
 * Service d'intégration avec Postiz
 * Gère les appels API vers l'instance Postiz auto-hébergée
 */

const POSTIZ_API_URL = process.env.POSTIZ_API_URL || 'https://postiz.assistant-redacteur.fr/api';
const POSTIZ_FRONTEND_URL = process.env.POSTIZ_FRONTEND_URL || 'https://postiz.assistant-redacteur.fr';

class PostizService {
  constructor() {
    this.baseURL = POSTIZ_API_URL;
    this.timeout = 30000;
  }

  createApiClient(userToken) {
    if (!userToken) {
      throw new Error('Token Postiz utilisateur requis');
    }

    return axios.create({
      baseURL: this.baseURL,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`
      },
      timeout: this.timeout
    });
  }

  /**
   * Créer un utilisateur dans Postiz
   * @param {Object} userData - Données de l'utilisateur
   * @returns {Promise<Object>} - Utilisateur créé avec son ID Postiz
   */
  async createUser(userData, userToken) {
    try {
      const apiClient = this.createApiClient(userToken);
      const response = await apiClient.post('/users', {
        email: userData.email,
        name: userData.name,
        password: this.generateSecurePassword(),
        role: 'user'
      });

      return {
        success: true,
        postizUserId: response.data.id,
        data: response.data
      };
    } catch (error) {
      console.error('Erreur création utilisateur Postiz:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  }

  /**
   * Obtenir l'URL d'autorisation OAuth pour une plateforme
   * @param {string} provider - Plateforme (facebook, instagram, twitter, etc.)
   * @param {string} userId - ID utilisateur dans notre système
   * @param {string} postizUserId - ID utilisateur dans Postiz
   * @returns {Promise<Object>} - URL d'autorisation
   */
  async getAuthorizationUrl(provider, userId, postizUserId) {
    try {
      // Générer un state unique pour la sécurité OAuth
      const state = this.generateState(userId, provider);

      // Construire l'URL d'autorisation Postiz
      const authUrl = `${POSTIZ_FRONTEND_URL}/integrations/${provider}/connect`;
      const callbackUrl = `${process.env.BACKEND_URL}/api/postiz/callback/${provider}`;

      const params = new URLSearchParams({
        user_id: postizUserId,
        state: state,
        redirect_uri: callbackUrl
      });

      return {
        success: true,
        authUrl: `${authUrl}?${params.toString()}`,
        state: state
      };
    } catch (error) {
      console.error('Erreur génération URL OAuth:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Récupérer les comptes sociaux connectés d'un utilisateur
   * @param {string} postizUserId - ID utilisateur dans Postiz
   * @returns {Promise<Object>} - Liste des comptes connectés
   */
  async getUserSocialAccounts(postizUserId, userToken) {
    try {
      const apiClient = this.createApiClient(userToken);
      const response = await apiClient.get(`/users/${postizUserId}/integrations`);

      return {
        success: true,
        accounts: response.data.map(account => ({
          provider: account.provider,
          providerAccountId: account.providerAccountId,
          displayName: account.name,
          username: account.username,
          avatarUrl: account.picture,
          postizProfileId: account.id,
          status: account.disabled ? 'disconnected' : 'connected',
          metadata: {
            followers: account.followers,
            verified: account.verified
          }
        }))
      };
    } catch (error) {
      console.error('Erreur récupération comptes sociaux:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
        accounts: []
      };
    }
  }

  /**
   * Créer et planifier une publication sur Postiz
   * @param {Object} postData - Données de la publication
   * @returns {Promise<Object>} - Résultat de la création
   */
  async createScheduledPost(postData, userToken) {
    try {
      const {
        postizUserId,
        content,
        scheduledAt,
        socialAccountIds,
        mediaUrls = []
      } = postData;

      const payload = {
        userId: postizUserId,
        content: content.text || content.body,
        scheduledDate: scheduledAt,
        integrations: socialAccountIds,
        media: mediaUrls.map(url => ({ url })),
        settings: {
          firstComment: content.firstComment || null,
          shortenLinks: true
        }
      };

      const apiClient = this.createApiClient(userToken);
      const response = await apiClient.post('/posts', payload);

      return {
        success: true,
        postizJobId: response.data.id,
        postizScheduleId: response.data.scheduleId,
        data: response.data
      };
    } catch (error) {
      console.error('Erreur création post Postiz:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  }

  /**
   * Récupérer le statut d'une publication
   * @param {string} postizJobId - ID du job dans Postiz
   * @returns {Promise<Object>} - Statut de la publication
   */
  async getPostStatus(postizJobId, userToken) {
    try {
      const apiClient = this.createApiClient(userToken);
      const response = await apiClient.get(`/posts/${postizJobId}`);

      return {
        success: true,
        status: this.mapPostizStatus(response.data.status),
        publishResults: response.data.results || [],
        data: response.data
      };
    } catch (error) {
      console.error('Erreur récupération statut post:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  }

  /**
   * Annuler une publication programmée
   * @param {string} postizJobId - ID du job dans Postiz
   * @returns {Promise<Object>} - Résultat de l'annulation
   */
  async cancelScheduledPost(postizJobId, userToken) {
    try {
      const apiClient = this.createApiClient(userToken);
      await apiClient.delete(`/posts/${postizJobId}`);

      return {
        success: true,
        message: 'Publication annulée avec succès'
      };
    } catch (error) {
      console.error('Erreur annulation post:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  }

  /**
   * Déconnecter un compte social
   * @param {string} postizProfileId - ID du profil dans Postiz
   * @returns {Promise<Object>} - Résultat de la déconnexion
   */
  async disconnectSocialAccount(postizProfileId, userToken) {
    try {
      const apiClient = this.createApiClient(userToken);
      await apiClient.delete(`/integrations/${postizProfileId}`);

      return {
        success: true,
        message: 'Compte déconnecté avec succès'
      };
    } catch (error) {
      console.error('Erreur déconnexion compte:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  }

  /**
   * Vérifier la santé de l'instance Postiz
   * @returns {Promise<Object>} - Statut de santé
   */
  async healthCheck(userToken = null) {
    try {
      const apiClient = userToken ? this.createApiClient(userToken) : axios.create({ baseURL: this.baseURL, timeout: this.timeout });
      const response = await apiClient.get('/health');
      return {
        success: true,
        status: 'healthy',
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        status: 'unhealthy',
        error: error.message
      };
    }
  }

  /**
   * Mapper les statuts Postiz vers nos statuts internes
   * @param {string} postizStatus - Statut Postiz
   * @returns {string} - Statut interne
   */
  mapPostizStatus(postizStatus) {
    const statusMap = {
      'draft': 'pending',
      'scheduled': 'scheduled',
      'publishing': 'publishing',
      'published': 'published',
      'failed': 'failed',
      'partial': 'partial_success'
    };

    return statusMap[postizStatus] || 'pending';
  }

  /**
   * Générer un mot de passe sécurisé pour les utilisateurs Postiz
   * @returns {string} - Mot de passe généré
   */
  generateSecurePassword() {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Générer un state OAuth sécurisé
   * @param {string} userId - ID utilisateur
   * @param {string} provider - Plateforme
   * @returns {string} - State généré
   */
  generateState(userId, provider) {
    const data = `${userId}:${provider}:${Date.now()}`;
    const hash = crypto.createHash('sha256').update(data).digest('hex');
    return Buffer.from(`${userId}:${provider}:${hash}`).toString('base64');
  }

  /**
   * Décoder et valider un state OAuth
   * @param {string} state - State à valider
   * @returns {Object|null} - Données décodées ou null si invalide
   */
  decodeState(state) {
    try {
      const decoded = Buffer.from(state, 'base64').toString('utf-8');
      const [userId, provider, hash] = decoded.split(':');
      
      if (!userId || !provider || !hash) {
        return null;
      }

      return { userId: parseInt(userId), provider };
    } catch (error) {
      console.error('Erreur décodage state:', error);
      return null;
    }
  }

  /**
   * Uploader un média vers Postiz
   * @param {string} mediaUrl - URL du média
   * @param {string} postizUserId - ID utilisateur Postiz
   * @returns {Promise<Object>} - Résultat de l'upload
   */
  async uploadMedia(mediaUrl, postizUserId, userToken) {
    try {
      const apiClient = this.createApiClient(userToken);
      const response = await apiClient.post('/media/upload', {
        url: mediaUrl,
        userId: postizUserId
      });

      return {
        success: true,
        mediaId: response.data.id,
        url: response.data.url
      };
    } catch (error) {
      console.error('Erreur upload média:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  }
}

export default new PostizService();
