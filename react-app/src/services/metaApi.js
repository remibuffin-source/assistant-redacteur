/**
 * Service API Meta (Facebook/Instagram)
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://api.assistant-redacteur.fr';

const getAuthToken = () => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('Non authentifié. Veuillez vous connecter.');
  }
  return token;
};

const getHeaders = () => ({
  'Authorization': `Bearer ${getAuthToken()}`,
  'Content-Type': 'application/json'
});
export const metaApi = {
  /**
   * Obtenir l'URL d'autorisation OAuth Meta
   */
  async getAuthUrl() {
    try {
      const response = await fetch(`${API_BASE_URL}/meta/auth/url`, {
        method: 'GET',
        headers: getHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error getting Meta auth URL:', error);
      throw error;
    }
  },

  /**
   * Échanger le code d'autorisation contre un access token
   */
  async exchangeToken(code) {
    try {
      const response = await fetch(`${API_BASE_URL}/meta/auth/token`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ code })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error exchanging Meta token:', error);
      throw error;
    }
  },

  /**
   * Récupérer les Pages Facebook de l'utilisateur
   */
  async getPages(accessToken) {
    try {
      const response = await fetch(`${API_BASE_URL}/meta/pages?accessToken=${accessToken}`, {
        method: 'GET',
        headers: getHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error getting Meta pages:', error);
      throw error;
    }
  },

  /**
   * Récupérer le compte Instagram lié à une Page
   */
  async getInstagramAccount(pageId, accessToken) {
    try {
      const response = await fetch(`${API_BASE_URL}/meta/instagram/${pageId}?accessToken=${accessToken}`, {
        method: 'GET',
        headers: getHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error getting Instagram account:', error);
      throw error;
    }
  }
};

/**
 * Service de publication sur Facebook
 */
export const facebookApi = {
  /**
   * Publier sur une Page Facebook
   */
  async publish(publication, pageId, pageAccessToken) {
    try {
      const response = await fetch(`${API_BASE_URL}/social/facebook/publish`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          publication,
          pageId,
          pageAccessToken
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error publishing to Facebook:', error);
      throw error;
    }
  },

  /**
   * Récupérer les Pages gérées
   */
  async getPages(accessToken) {
    try {
      const response = await fetch(`${API_BASE_URL}/social/facebook/pages?accessToken=${accessToken}`, {
        method: 'GET',
        headers: getHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error getting Facebook pages:', error);
      throw error;
    }
  }
};

/**
 * Service de publication sur Instagram
 */
export const instagramApi = {
  /**
   * Publier sur Instagram
   */
  async publish(publication, igAccountId, pageAccessToken) {
    try {
      const response = await fetch(`${API_BASE_URL}/social/instagram/publish`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          publication,
          igAccountId,
          pageAccessToken
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error publishing to Instagram:', error);
      throw error;
    }
  },

  /**
   * Récupérer les informations d'un compte Instagram
   */
  async getAccountInfo(igAccountId, accessToken) {
    try {
      const response = await fetch(`${API_BASE_URL}/social/instagram/account/${igAccountId}?accessToken=${accessToken}`, {
        method: 'GET',
        headers: getHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error getting Instagram account info:', error);
      throw error;
    }
  }
};

/**
 * Gestion du stockage des tokens Meta
 */
export const metaStorage = {
  /**
   * Sauvegarder les données Meta dans localStorage
   */
  save(data) {
    try {
      localStorage.setItem('meta_auth', JSON.stringify(data));
    } catch (error) {
      console.error('Error saving Meta auth data:', error);
    }
  },

  /**
   * Récupérer les données Meta depuis localStorage
   */
  get() {
    try {
      const data = localStorage.getItem('meta_auth');
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error getting Meta auth data:', error);
      return null;
    }
  },

  /**
   * Supprimer les données Meta
   */
  clear() {
    try {
      localStorage.removeItem('meta_auth');
    } catch (error) {
      console.error('Error clearing Meta auth data:', error);
    }
  },

  /**
   * Vérifier si l'utilisateur est connecté
   */
  isConnected() {
    const data = this.get();
    return data && data.userAccessToken;
  },

  /**
   * Récupérer les Pages sauvegardées
   */
  getPages() {
    const data = this.get();
    return data?.pages || [];
  },

  /**
   * Récupérer une Page spécifique par ID
   */
  getPage(pageId) {
    const pages = this.getPages();
    return pages.find(page => page.id === pageId);
  }
};
