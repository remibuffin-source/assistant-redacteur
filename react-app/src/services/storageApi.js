/**
 * Service API pour le stockage serveur
 * Remplace localStorage par des appels API
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://api.assistant-redacteur.fr';

/**
 * Obtenir le token d'authentification
 */
const getAuthToken = () => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('Non authentifié. Veuillez vous connecter.');
  }
  return token;
};

/**
 * Headers par défaut avec authentification
 */
const getHeaders = () => ({
  'Authorization': `Bearer ${getAuthToken()}`,
  'Content-Type': 'application/json'
});

/**
 * Headers pour upload de fichiers
 */
const getFileHeaders = () => ({
  'Authorization': `Bearer ${getAuthToken()}`
  // Pas de Content-Type pour FormData (géré automatiquement)
});

// ============================================
// MODÈLES DE CONTENU (ÉDITEUR)
// ============================================

export const contentModelsApi = {
  /**
   * Créer un modèle
   */
  async create(data) {
    const response = await fetch(`${API_BASE_URL}/content-models`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erreur lors de la création du modèle');
    }
    
    return response.json();
  },

  /**
   * Récupérer tous les modèles
   */
  async getAll(filters = {}) {
    const params = new URLSearchParams(filters);
    const response = await fetch(`${API_BASE_URL}/content-models?${params}`, {
      headers: getHeaders()
    });
    
    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des modèles');
    }
    
    return response.json();
  },

  /**
   * Récupérer un modèle spécifique
   */
  async getById(id) {
    const response = await fetch(`${API_BASE_URL}/content-models/${id}`, {
      headers: getHeaders()
    });
    
    if (!response.ok) {
      throw new Error('Modèle non trouvé');
    }
    
    return response.json();
  },

  /**
   * Mettre à jour un modèle
   */
  async update(id, data) {
    const response = await fetch(`${API_BASE_URL}/content-models/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erreur lors de la mise à jour');
    }
    
    return response.json();
  },

  /**
   * Supprimer un modèle
   */
  async delete(id) {
    const response = await fetch(`${API_BASE_URL}/content-models/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    
    if (!response.ok) {
      throw new Error('Erreur lors de la suppression');
    }
    
    return response.json();
  },

  /**
   * Uploader un fichier
   */
  async uploadFile(modelId, file) {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/content-models/${modelId}/files`, {
      method: 'POST',
      headers: getFileHeaders(),
      body: formData
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erreur lors de l\'upload');
    }
    
    return response.json();
  },

  /**
   * Supprimer un fichier
   */
  async deleteFile(modelId, fileId) {
    const response = await fetch(`${API_BASE_URL}/content-models/${modelId}/files/${fileId}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    
    if (!response.ok) {
      throw new Error('Erreur lors de la suppression du fichier');
    }
    
    return response.json();
  }
};

// ============================================
// MODÈLES COMPLETS (HOME)
// ============================================

export const completeModelsApi = {
  /**
   * Créer un modèle complet
   */
  async create(data) {
    const response = await fetch(`${API_BASE_URL}/complete-models`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erreur lors de la création');
    }
    
    return response.json();
  },

  /**
   * Récupérer tous les modèles complets
   */
  async getAll(filters = {}) {
    const params = new URLSearchParams(filters);
    const response = await fetch(`${API_BASE_URL}/complete-models?${params}`, {
      headers: getHeaders()
    });
    
    if (!response.ok) {
      throw new Error('Erreur lors de la récupération');
    }
    
    return response.json();
  },

  /**
   * Récupérer un modèle complet spécifique
   */
  async getById(id) {
    const response = await fetch(`${API_BASE_URL}/complete-models/${id}`, {
      headers: getHeaders()
    });
    
    if (!response.ok) {
      throw new Error('Modèle complet non trouvé');
    }
    
    return response.json();
  },

  /**
   * Mettre à jour un modèle complet
   */
  async update(id, data) {
    const response = await fetch(`${API_BASE_URL}/complete-models/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erreur lors de la mise à jour');
    }
    
    return response.json();
  },

  /**
   * Toggle favori
   */
  async toggleFavorite(id) {
    const response = await fetch(`${API_BASE_URL}/complete-models/${id}/favorite`, {
      method: 'PATCH',
      headers: getHeaders()
    });
    
    if (!response.ok) {
      throw new Error('Erreur lors du changement de favori');
    }
    
    return response.json();
  },

  /**
   * Supprimer un modèle complet
   */
  async delete(id) {
    const response = await fetch(`${API_BASE_URL}/complete-models/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    
    if (!response.ok) {
      throw new Error('Erreur lors de la suppression');
    }
    
    return response.json();
  },

  /**
   * Uploader un fichier
   */
  async uploadFile(modelId, file) {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/complete-models/${modelId}/files`, {
      method: 'POST',
      headers: getFileHeaders(),
      body: formData
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erreur lors de l\'upload');
    }
    
    return response.json();
  },

  /**
   * Supprimer un fichier
   */
  async deleteFile(modelId, fileId) {
    const response = await fetch(`${API_BASE_URL}/complete-models/${modelId}/files/${fileId}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    
    if (!response.ok) {
      throw new Error('Erreur lors de la suppression du fichier');
    }
    
    return response.json();
  }
};

// ============================================
// PUBLICATIONS
// ============================================

export const publicationsApi = {
  /**
   * Créer une publication
   */
  async create(data) {
    console.log('📤 [publicationsApi.create] Envoi données:', JSON.stringify(data, null, 2));
    const response = await fetch(`${API_BASE_URL}/publications-v2`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      const error = await response.json();
      console.error('❌ [publicationsApi.create] Erreur:', error);
      throw new Error(error.error || error.message || 'Erreur lors de la création');
    }
    
    const result = await response.json();
    console.log('✅ [publicationsApi.create] Succès:', result);
    return result;
  },

  /**
   * Récupérer toutes les publications
   */
  async getAll(filters = {}) {
    const params = new URLSearchParams(filters);
    const response = await fetch(`${API_BASE_URL}/publications-v2?${params}`, {
      headers: getHeaders()
    });
    
    if (!response.ok) {
      throw new Error('Erreur lors de la récupération');
    }
    
    return response.json();
  },

  /**
   * Récupérer une publication spécifique
   */
  async getById(id) {
    const response = await fetch(`${API_BASE_URL}/publications-v2/${id}`, {
      headers: getHeaders()
    });
    
    if (!response.ok) {
      throw new Error('Publication non trouvée');
    }
    
    return response.json();
  },

  /**
   * Mettre à jour une publication
   */
  async update(id, data) {
    const response = await fetch(`${API_BASE_URL}/publications-v2/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erreur lors de la mise à jour');
    }
    
    return response.json();
  },

  /**
   * Changer le statut
   */
  async updateStatus(id, status, message = '') {
    const response = await fetch(`${API_BASE_URL}/publications-v2/${id}/status`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ status, message })
    });
    
    if (!response.ok) {
      throw new Error('Erreur lors du changement de statut');
    }
    
    return response.json();
  },

  /**
   * Reprogrammer
   */
  async reschedule(id, publishDate) {
    const response = await fetch(`${API_BASE_URL}/publications-v2/${id}/reschedule`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ publishDate })
    });
    
    if (!response.ok) {
      throw new Error('Erreur lors de la reprogrammation');
    }
    
    return response.json();
  },

  /**
   * Supprimer une publication
   */
  async delete(id) {
    const response = await fetch(`${API_BASE_URL}/publications-v2/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    
    if (!response.ok) {
      throw new Error('Erreur lors de la suppression');
    }
    
    return response.json();
  },

  /**
   * Uploader un fichier
   */
  async uploadFile(publicationId, file, metadata = {}) {
    const formData = new FormData();
    formData.append('file', file);
    if (metadata.altText) formData.append('altText', metadata.altText);
    if (metadata.caption) formData.append('caption', metadata.caption);
    if (metadata.displayOrder !== undefined) formData.append('displayOrder', metadata.displayOrder);

    const response = await fetch(`${API_BASE_URL}/publications-v2/${publicationId}/files`, {
      method: 'POST',
      headers: getFileHeaders(),
      body: formData
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erreur lors de l\'upload');
    }
    
    return response.json();
  },

  /**
   * Supprimer un fichier
   */
  async deleteFile(publicationId, fileId) {
    const response = await fetch(`${API_BASE_URL}/publications-v2/${publicationId}/files/${fileId}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    
    if (!response.ok) {
      throw new Error('Erreur lors de la suppression du fichier');
    }
    
    return response.json();
  },

  /**
   * Obtenir les statistiques
   */
  async getStats(filters = {}) {
    const params = new URLSearchParams(filters);
    const response = await fetch(`${API_BASE_URL}/publications-v2/stats?${params}`, {
      headers: getHeaders()
    });
    
    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des stats');
    }
    
    return response.json();
  }
};

export default {
  contentModels: contentModelsApi,
  completeModels: completeModelsApi,
  publications: publicationsApi
};
