import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://api.assistant-redacteur.fr';

/**
 * Service API pour Wix Blog
 */
class WixBlogApi {
  /**
   * Tester la connexion à l'API Wix Blog
   * @param {string} appId - Wix App ID
   * @param {string} appSecret - Wix App Secret
   * @returns {Promise<Object>} Résultat du test
   */
  async testConnection(appId, appSecret) {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_BASE_URL}/wix-blog/test`,
        { appId, appSecret },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Wix Blog test connection error:', error);
      throw error.response?.data || { success: false, message: error.message };
    }
  }

  /**
   * Récupérer les catégories du blog Wix
   * @param {string} appId - Wix App ID
   * @param {string} appSecret - Wix App Secret
   * @returns {Promise<Array>} Liste des catégories
   */
  async getCategories(appId, appSecret) {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${API_BASE_URL}/wix-blog/categories`,
        {
          params: { appId, appSecret },
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      return response.data.categories || [];
    } catch (error) {
      console.error('Wix Blog get categories error:', error);
      throw error.response?.data || { success: false, message: error.message };
    }
  }

  /**
   * Publier un article sur Wix Blog
   * @param {Object} publication - Données de publication
   * @param {Object} credentials - Credentials Wix (appId, appSecret)
   * @param {Object} options - Options supplémentaires
   * @returns {Promise<Object>} Résultat de la publication
   */
  async publishPost(publication, credentials, options = {}) {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_BASE_URL}/wix-blog/publish`,
        {
          publication,
          credentials,
          options
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Wix Blog publish error:', error);
      throw error.response?.data || { success: false, message: error.message };
    }
  }

  /**
   * Uploader une image vers Wix Media Manager
   * @param {string} imageUrl - URL de l'image
   * @param {string} appId - Wix App ID
   * @param {string} appSecret - Wix App Secret
   * @returns {Promise<Object>} Résultat de l'upload
   */
  async uploadImage(imageUrl, appId, appSecret) {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_BASE_URL}/wix-blog/upload-image`,
        {
          imageUrl,
          appId,
          appSecret
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Wix Blog upload image error:', error);
      throw error.response?.data || { success: false, message: error.message };
    }
  }
}

export default new WixBlogApi();
