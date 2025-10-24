// Service API pour communiquer avec le backend
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:4001';

/**
 * Classe pour gérer les requêtes API avec authentification
 */
class ApiService {
  constructor() {
    this.token = localStorage.getItem('token');
    this.refreshToken = localStorage.getItem('refreshToken');
  }

  /**
   * Met à jour les tokens d'authentification
   */
  updateTokens(token, refreshToken) {
    this.token = token;
    this.refreshToken = refreshToken;
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
    if (refreshToken) {
      localStorage.setItem('refreshToken', refreshToken);
    } else {
      localStorage.removeItem('refreshToken');
    }
  }

  /**
   * Effectue une requête HTTP avec gestion des erreurs et authentification
   */
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;

    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    };

    // Ajouter le token d'authentification si disponible
    if (this.token) {
      config.headers.Authorization = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, config);

      // Gérer le rafraîchissement automatique du token si nécessaire
      if (response.status === 401 && this.refreshToken) {
        try {
          const refreshed = await this.refreshAuthToken();
          if (refreshed) {
            config.headers.Authorization = `Bearer ${this.token}`;
            const retryResponse = await fetch(url, config);
            return await retryResponse.json();
          }
        } catch (refreshError) {
          console.error('Token refresh failed:', refreshError);
          this.logout();
          throw new Error('Authentication failed');
        }
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      return await response.json();

    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      throw error;
    }
  }

  /**
   * Rafraîchit le token d'authentification
   */
  async refreshAuthToken() {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ refreshToken: this.refreshToken })
      });

      if (response.ok) {
        const data = await response.json();
        this.updateTokens(data.token, data.refreshToken);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Token refresh error:', error);
      return false;
    }
  }

  /**
   * Déconnexion
   */
  logout() {
    this.updateTokens(null, null);
    window.location.href = '/login';
  }

  // ===== AUTHENTICATION =====

  /**
   * Connexion utilisateur
   */
  async login(email, password) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });

    if (response.success) {
      this.updateTokens(response.token, response.refreshToken);
    }

    return response;
  }

  /**
   * Inscription utilisateur
   */
  async register(userData) {
    const response = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });

    if (response.success) {
      this.updateTokens(response.token, response.refreshToken);
    }

    return response;
  }

  // ===== PUBLICATIONS =====

  /**
   * Récupère les publications avec filtres
   */
  async getPublications(filters = {}) {
    const queryParams = new URLSearchParams(filters).toString();
    const endpoint = `/publications${queryParams ? `?${queryParams}` : ''}`;
    return await this.request(endpoint);
  }

  /**
   * Récupère une publication spécifique
   */
  async getPublication(id) {
    return await this.request(`/publications/${id}`);
  }

  /**
   * Crée une nouvelle publication
   */
  async createPublication(publicationData) {
    return await this.request('/publications', {
      method: 'POST',
      body: JSON.stringify(publicationData)
    });
  }

  /**
   * Met à jour une publication
   */
  async updatePublication(id, updateData) {
    return await this.request(`/publications/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updateData)
    });
  }

  /**
   * Supprime une publication
   */
  async deletePublication(id) {
    return await this.request(`/publications/${id}`, {
      method: 'DELETE'
    });
  }

  /**
   * Publie immédiatement sur une plateforme
   */
  async publishNow(id, platform) {
    return await this.request(`/publications/${id}/publish/${platform}`, {
      method: 'POST'
    });
  }

  /**
   * Reprogramme une publication
   */
  async reschedulePublication(id, newDate) {
    return await this.request(`/publications/${id}/reschedule`, {
      method: 'POST',
      body: JSON.stringify({ newDate })
    });
  }

  /**
   * Récupère les statistiques des publications
   */
  async getPublicationStats(filters = {}) {
    const queryParams = new URLSearchParams(filters).toString();
    const endpoint = `/publications/stats/overview${queryParams ? `?${queryParams}` : ''}`;
    return await this.request(endpoint);
  }

  // ===== OAUTH =====

  /**
   * Récupère les comptes sociaux connectés
   */
  async getSocialAccounts() {
    return await this.request('/oauth/accounts');
  }

  /**
   * Déconnecte un compte social
   */
  async disconnectSocialAccount(platform) {
    return await this.request(`/oauth/accounts/${platform}/disconnect`, {
      method: 'POST'
    });
  }

  /**
   * Récupère les plateformes OAuth disponibles
   */
  async getOAuthPlatforms() {
    return await this.request('/oauth/platforms');
  }

  /**
   * Récupère le statut des connexions OAuth
   */
  async getOAuthStatus() {
    return await this.request('/oauth/status');
  }

  // ===== ANALYTICS =====

  /**
   * Récupère les statistiques utilisateur
   */
  async getUserStats(filters = {}) {
    const queryParams = new URLSearchParams(filters).toString();
    const endpoint = `/analytics/user${queryParams ? `?${queryParams}` : ''}`;
    return await this.request(endpoint);
  }

  /**
   * Récupère les statistiques par plateforme
   */
  async getPlatformStats(filters = {}) {
    const queryParams = new URLSearchParams(filters).toString();
    const endpoint = `/analytics/platforms${queryParams ? `?${queryParams}` : ''}`;
    return await this.request(endpoint);
  }
}

// Créer une instance unique du service API
export const apiService = new ApiService();

// Service Socket.IO pour les notifications temps réel
import { io } from 'socket.io-client';

export const socketService = {
  socket: null,

  /**
   * Connecte le socket avec authentification
   */
  connect(userId) {
    if (this.socket && this.socket.connected) {
      return this.socket;
    }

    this.socket = io(SOCKET_URL, {
      auth: {
        token: localStorage.getItem('token')
      },
      transports: ['websocket', 'polling']
    });

    // Rejoindre la room utilisateur pour les notifications
    this.socket.emit('join-user-room', userId);

    return this.socket;
  },

  /**
   * Déconnecte le socket
   */
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  },

  /**
   * Écoute les événements de publication
   */
  onPublicationUpdate(callback) {
    if (this.socket) {
      this.socket.on('publication-update', callback);
    }
  },

  /**
   * Écoute les événements de statut de publication
   */
  onPublicationStatus(callback) {
    if (this.socket) {
      this.socket.on('publication-status', callback);
    }
  },

  /**
   * Supprime tous les écouteurs
   */
  removeAllListeners() {
    if (this.socket) {
      this.socket.removeAllListeners();
    }
  }
};

// Hook React pour utiliser le service API
export const useApiService = () => {
  return {
    api: apiService,
    socket: socketService,
    isAuthenticated: !!apiService.token
  };
};

export default apiService;
