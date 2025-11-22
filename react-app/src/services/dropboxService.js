/**
 * Service de stockage centralisé Dropbox (via backend)
 * Utilise le backend pour gérer tous les fichiers dans la Dropbox de l'application
 */
class DropboxService {
  constructor() {
    this.apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:4000';
  }

  /**
   * Obtenir le token d'authentification depuis localStorage
   */
  getAuthToken() {
    return localStorage.getItem('token');
  }

  /**
   * Headers pour les requêtes API
   */
  getHeaders() {
    const token = this.getAuthToken();
    return {
      'Authorization': `Bearer ${token}`,
    };
  }

  /**
   * Vérifier si le stockage est disponible
   */
  async isAuthenticated() {
    try {
      const response = await fetch(`${this.apiUrl}/api/storage/status`, {
        headers: this.getHeaders()
      });
      const data = await response.json();
      return data.success && data.data.configured;
    } catch (error) {
      console.error('Erreur lors de la vérification du stockage:', error);
      return false;
    }
  }

  /**
   * Téléverser un fichier
   * @param {File} file - Fichier à uploader
   * @param {string} folder - Dossier de destination (uploads, documents, templates, etc.)
   */
  async uploadFile(file, folder = 'uploads') {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', folder);

      const response = await fetch(`${this.apiUrl}/api/storage/upload`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: formData
      });

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Upload failed');
      }

      return data.data;
    } catch (error) {
      console.error('Erreur lors du téléversement:', error);
      throw error;
    }
  }

  /**
   * Lister les fichiers d'un dossier
   * @param {string} folder - Dossier à lister
   */
  async listFiles(folder = 'uploads') {
    try {
      const response = await fetch(`${this.apiUrl}/api/storage/files?folder=${folder}`, {
        headers: this.getHeaders()
      });

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to list files');
      }

      return data.data;
    } catch (error) {
      console.error('Erreur lors de la liste des fichiers:', error);
      throw error;
    }
  }

  /**
   * Télécharger un fichier
   * @param {string} path - Chemin complet du fichier
   * @param {string} filename - Nom du fichier pour le téléchargement
   */
  async downloadFile(path, filename) {
    try {
      const response = await fetch(`${this.apiUrl}/api/storage/download?path=${encodeURIComponent(path)}`, {
        headers: this.getHeaders()
      });

      if (!response.ok) {
        throw new Error('Download failed');
      }

      const blob = await response.blob();
      
      // Créer un lien de téléchargement
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      return true;
    } catch (error) {
      console.error('Erreur lors du téléchargement:', error);
      throw error;
    }
  }

  /**
   * Supprimer un fichier
   * @param {string} path - Chemin complet du fichier
   */
  async deleteFile(path) {
    try {
      const response = await fetch(`${this.apiUrl}/api/storage/file`, {
        method: 'DELETE',
        headers: {
          ...this.getHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ path })
      });

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Delete failed');
      }

      return data.data;
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      throw error;
    }
  }

  /**
   * Créer un dossier
   * @param {string} folder - Nom du dossier à créer
   */
  async createFolder(folder) {
    try {
      const response = await fetch(`${this.apiUrl}/api/storage/folder`, {
        method: 'POST',
        headers: {
          ...this.getHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ folder })
      });

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Create folder failed');
      }

      return data.data;
    } catch (error) {
      console.error('Erreur lors de la création du dossier:', error);
      throw error;
    }
  }

  /**
   * Obtenir les métadonnées d'un fichier
   * @param {string} path - Chemin complet du fichier
   */
  async getFileMetadata(path) {
    try {
      const response = await fetch(`${this.apiUrl}/api/storage/metadata?path=${encodeURIComponent(path)}`, {
        headers: this.getHeaders()
      });

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to get metadata');
      }

      return data.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des métadonnées:', error);
      throw error;
    }
  }
}

export const dropboxService = new DropboxService();
export default dropboxService;
