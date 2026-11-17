import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://api.assistant-redacteur.fr';

/**
 * Service API pour l'intégration Postiz
 * Gère les appels vers le backend pour la connexion des réseaux sociaux
 */

class PostizApi {
  constructor() {
    this.client = axios.create({
      baseURL: `${API_URL}/postiz`,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Intercepteur pour ajouter le token d'authentification
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );
  }

  /**
   * Démarrer le flux de connexion OAuth pour un réseau social
   * @param {string} provider - Plateforme (facebook, instagram, twitter, etc.)
   * @returns {Promise<Object>} - URL d'autorisation
   */
  async connectProvider(provider) {
    try {
      const response = await this.client.post(`/connect/${provider}`);
      return {
        success: true,
        authUrl: response.data.authUrl,
        state: response.data.state
      };
    } catch (error) {
      console.error(`Erreur connexion ${provider}:`, error);
      return {
        success: false,
        error: error.response?.data?.error || error.message
      };
    }
  }

  /**
   * Récupérer les comptes sociaux connectés
   * @returns {Promise<Object>} - Liste des comptes
   */
  async getConnectedAccounts() {
    try {
      const response = await this.client.get('/accounts');
      return {
        success: true,
        accounts: response.data.accounts || []
      };
    } catch (error) {
      console.error('Erreur récupération comptes:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message,
        accounts: []
      };
    }
  }

  /**
   * Déconnecter un compte social
   * @param {number} accountId - ID du compte
   * @returns {Promise<Object>} - Résultat de la déconnexion
   */
  async disconnectAccount(accountId) {
    try {
      const response = await this.client.delete(`/accounts/${accountId}`);
      return {
        success: true,
        message: response.data.message
      };
    } catch (error) {
      console.error('Erreur déconnexion compte:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message
      };
    }
  }

  /**
   * Créer une publication programmée
   * @param {Object} postData - Données de la publication
   * @returns {Promise<Object>} - Résultat de la création
   */
  async schedulePost(postData) {
    try {
      const response = await this.client.post('/schedule', postData);
      return {
        success: true,
        schedule: response.data.schedule
      };
    } catch (error) {
      console.error('Erreur programmation post:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message
      };
    }
  }

  /**
   * Annuler une publication programmée
   * @param {number} scheduleId - ID de la programmation
   * @returns {Promise<Object>} - Résultat de l'annulation
   */
  async cancelSchedule(scheduleId) {
    try {
      const response = await this.client.delete(`/schedule/${scheduleId}`);
      return {
        success: true,
        message: response.data.message
      };
    } catch (error) {
      console.error('Erreur annulation programmation:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message
      };
    }
  }

  /**
   * Vérifier la santé de l'instance Postiz
   * @returns {Promise<Object>} - Statut de santé
   */
  async healthCheck() {
    try {
      const response = await this.client.get('/health');
      return {
        success: true,
        status: response.data.status,
        data: response.data.data
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
   * Ouvrir une popup OAuth et attendre le callback
   * @param {string} authUrl - URL d'autorisation
   * @returns {Promise<Object>} - Résultat de l'autorisation
   */
  openOAuthPopup(authUrl) {
    return new Promise((resolve, reject) => {
      const width = 600;
      const height = 700;
      const left = window.screen.width / 2 - width / 2;
      const top = window.screen.height / 2 - height / 2;

      const popup = window.open(
        authUrl,
        'oauth_popup',
        `width=${width},height=${height},left=${left},top=${top},toolbar=no,menubar=no,scrollbars=yes`
      );

      if (!popup) {
        reject(new Error('Popup bloquée par le navigateur'));
        return;
      }

      // Vérifier si la popup est fermée
      const checkClosed = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkClosed);
          window.removeEventListener('message', messageHandler);
          reject(new Error('Popup fermée par l\'utilisateur'));
        }
      }, 500);

      // Écouter les messages du callback
      const messageHandler = (event) => {
        // Vérifier l'origine pour la sécurité
        if (event.origin !== window.location.origin) {
          return;
        }

        if (event.data.type === 'oauth_success') {
          clearInterval(checkClosed);
          window.removeEventListener('message', messageHandler);
          popup.close();
          resolve({ success: true, provider: event.data.provider });
        } else if (event.data.type === 'oauth_error') {
          clearInterval(checkClosed);
          window.removeEventListener('message', messageHandler);
          popup.close();
          reject(new Error(event.data.error || 'Erreur OAuth'));
        }
      };

      window.addEventListener('message', messageHandler);
    });
  }
}

export default new PostizApi();
