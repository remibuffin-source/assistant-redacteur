import { contentModelsApi, completeModelsApi, publicationsApi } from '../services/storageApi.js';

/**
 * Gestionnaire de stockage SERVEUR (API)
 * Remplace le localStorage par des appels API
 */
class StorageManagerAPI {
  constructor() {
    this.useAPI = true; // Flag pour basculer entre API et localStorage
  }

  // ============================================
  // MODÈLES DE CONTENU (ÉDITEUR)
  // ============================================

  /**
   * Sauvegarder un modèle de contenu
   */
  async saveContentModel(modelName, content, type = 'text') {
    try {
      const result = await contentModelsApi.create({
        name: modelName,
        content,
        type
      });

      return {
        success: true,
        message: `Modèle "${modelName}" sauvegardé avec succès`,
        data: result.data
      };
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du modèle:', error);
      return {
        success: false,
        message: error.message || 'Erreur lors de la sauvegarde'
      };
    }
  }

  /**
   * Récupérer les modèles de contenu
   */
  async getSavedContentModels() {
    try {
      console.log('🟦 [API] Appel contentModelsApi.getAll()');
      const result = await contentModelsApi.getAll();
      console.log('🟦 [API] Réponse brute:', result);
      console.log('🟦 [API] result.success:', result.success);
      console.log('🟦 [API] result.data:', result.data);
      console.log('🟦 [API] Type de result.data:', typeof result.data);
      console.log('🟦 [API] Array.isArray(result.data):', Array.isArray(result.data));
      console.log('🟦 [API] Nombre d\'éléments:', result.data?.length);
      
      if (result.data && result.data.length > 0) {
        console.log('🟦 [API] Premier modèle:', result.data[0]);
        console.log('🟦 [API] Structure du premier modèle:', Object.keys(result.data[0]));
      }
      
      return result.data || [];
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des modèles:', error);
      alert(`Erreur de chargement des modèles: ${error.message}`);
      return [];
    }
  }

  /**
   * Charger un modèle de contenu spécifique
   */
  async loadContentModel(modelId) {
    try {
      const result = await contentModelsApi.getById(modelId);
      return {
        success: true,
        data: result.data
      };
    } catch (error) {
      console.error('Erreur lors du chargement du modèle:', error);
      return {
        success: false,
        message: error.message
      };
    }
  }

  /**
   * Supprimer un modèle de contenu
   */
  async deleteContentModel(modelId) {
    try {
      await contentModelsApi.delete(modelId);
      return {
        success: true,
        message: 'Modèle supprimé avec succès'
      };
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      return {
        success: false,
        message: error.message
      };
    }
  }

  // ============================================
  // MODÈLES COMPLETS (HOME)
  // ============================================

  /**
   * Sauvegarder un modèle complet
   */
  async saveModel(modelName, config) {
    try {
      const result = await completeModelsApi.create({
        name: modelName,
        config,
        content: config.content || '',
        results: config.results || [],
        theme: config.theme || 'light'
      });

      return {
        success: true,
        message: `Modèle complet "${modelName}" sauvegardé avec succès`,
        data: result.data
      };
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du modèle complet:', error);
      return {
        success: false,
        message: error.message || 'Erreur lors de la sauvegarde'
      };
    }
  }

  /**
   * Récupérer les modèles complets
   */
  async getSavedModels() {
    try {
      const result = await completeModelsApi.getAll();
      return result.data || [];
    } catch (error) {
      console.error('Erreur lors de la récupération des modèles complets:', error);
      return [];
    }
  }

  /**
   * Charger un modèle complet
   */
  async loadModel(modelId) {
    try {
      const result = await completeModelsApi.getById(modelId);
      const model = result.data;
      
      // Parser le champ config qui est une chaîne JSON
      let parsedConfig = {};
      if (model.config) {
        try {
          parsedConfig = typeof model.config === 'string' 
            ? JSON.parse(model.config) 
            : model.config;
        } catch (e) {
          console.error('Erreur parsing config:', e);
        }
      }
      
      // Fusionner les pièces jointes : les métadonnées serveur ne contiennent
      // ni le base64, ni les rôles (style/décor/sujet), ni la force. On les
      // complète avec les données riches stockées dans la config du modèle.
      const storedFiles = Array.isArray(parsedConfig.attachedFiles) ? parsedConfig.attachedFiles : [];
      const serverFiles = Array.isArray(model.files) ? model.files : [];

      const mergedFiles = serverFiles.map(sf => {
        const match = storedFiles.find(st =>
          (st.name && sf.originalName && st.name === sf.originalName) ||
          (st.id && sf.id && String(st.id) === String(sf.id))
        );

        if (!match) {
          return {
            id: sf.id,
            name: sf.originalName,
            size: sf.fileSize,
            type: sf.mimeType,
            url: sf.filePath
          };
        }

        // Les données riches (base64, roles, strength) priment sur les métadonnées
        return {
          ...sf,
          ...match,
          name: match.name || sf.originalName,
          type: match.type || sf.mimeType,
          size: match.size ?? sf.fileSize
        };
      });

      // Ajouter les fichiers présents uniquement dans la config
      storedFiles.forEach(st => {
        if (!mergedFiles.some(m => m.name === st.name)) {
          mergedFiles.push(st);
        }
      });

      // Fusionner les données
      const config = {
        ...parsedConfig,
        content: model.content || parsedConfig.content || '',
        results: model.results ? (typeof model.results === 'string' ? JSON.parse(model.results) : model.results) : (parsedConfig.results || []),
        attachedFiles: mergedFiles.length > 0 ? mergedFiles : storedFiles
      };
      
      return {
        success: true,
        config: config
      };
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
      return {
        success: false,
        message: error.message
      };
    }
  }

  /**
   * Renommer un modèle complet
   */
  async renameModel(modelId, newName) {
    try {
      await completeModelsApi.update(modelId, { name: newName });
      return {
        success: true,
        message: 'Modèle renommé avec succès'
      };
    } catch (error) {
      console.error('Erreur lors du renommage:', error);
      return {
        success: false,
        message: error.message || 'Erreur lors du renommage'
      };
    }
  }

  /**
   * Supprimer un modèle complet
   */
  async deleteModel(modelId) {
    try {
      await completeModelsApi.delete(modelId);
      return {
        success: true,
        message: 'Modèle complet supprimé avec succès'
      };
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      return {
        success: false,
        message: error.message
      };
    }
  }

  // ============================================
  // PUBLICATIONS
  // ============================================

  /**
   * Sauvegarder une publication
   */
  async saveScheduledPublication(title, content, publishDate, platforms) {
    try {
      const result = await publicationsApi.create({
        title,
        content,
        publishDate,
        platforms
      });

      return {
        success: true,
        message: `Publication "${title}" programmée avec succès`,
        data: result.data
      };
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de la publication:', error);
      return {
        success: false,
        message: error.message || 'Erreur lors de la sauvegarde'
      };
    }
  }

  /**
   * Récupérer les publications
   */
  async getSavedPublications() {
    try {
      const result = await publicationsApi.getAll();
      console.log('📰 Publications récupérées:', result);
      return result.data || [];
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des publications:', error);
      alert(`Erreur de chargement des publications: ${error.message}`);
      return [];
    }
  }

  /**
   * Charger une publication
   */
  async loadPublication(publicationId) {
    try {
      const result = await publicationsApi.getById(publicationId);
      return {
        success: true,
        data: result.data
      };
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
      return {
        success: false,
        message: error.message
      };
    }
  }

  /**
   * Supprimer une publication
   */
  async deletePublication(publicationId) {
    try {
      await publicationsApi.delete(publicationId);
      return {
        success: true,
        message: 'Publication supprimée avec succès'
      };
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      return {
        success: false,
        message: error.message
      };
    }
  }

  // ============================================
  // GESTION DES FICHIERS
  // ============================================

  /**
   * Uploader un fichier pour un modèle de contenu
   */
  async uploadFileToContentModel(modelId, file) {
    try {
      const result = await contentModelsApi.uploadFile(modelId, file);
      return {
        success: true,
        data: result.data
      };
    } catch (error) {
      console.error('Erreur upload fichier:', error);
      return {
        success: false,
        message: error.message
      };
    }
  }

  /**
   * Uploader un fichier pour un modèle complet
   */
  async uploadFileToCompleteModel(modelId, file) {
    try {
      const result = await completeModelsApi.uploadFile(modelId, file);
      return {
        success: true,
        data: result.data
      };
    } catch (error) {
      console.error('Erreur upload fichier:', error);
      return {
        success: false,
        message: error.message
      };
    }
  }

  /**
   * Uploader un fichier pour une publication
   */
  async uploadFileToPublication(publicationId, file, metadata = {}) {
    try {
      const result = await publicationsApi.uploadFile(publicationId, file, metadata);
      return {
        success: true,
        data: result.data
      };
    } catch (error) {
      console.error('Erreur upload fichier:', error);
      return {
        success: false,
        message: error.message
      };
    }
  }

  // ============================================
  // CONFIGURATIONS (PRÉRÉGLAGES) - Reste en localStorage
  // ============================================

  /**
   * Sauvegarder une configuration d'interface
   * (Reste en localStorage car c'est juste des préférences UI)
   */
  async saveInterfaceConfig(configName, config) {
    try {
      const timestamp = new Date().toISOString();
      const configData = {
        name: configName,
        config: config,
        timestamp: timestamp
      };

      const savedConfigs = this.getSavedConfigs();
      savedConfigs.push(configData);
      localStorage.setItem('savedInterfaceConfigs', JSON.stringify(savedConfigs));
      
      return {
        success: true,
        message: `Configuration "${configName}" sauvegardée avec succès`
      };
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de la configuration:', error);
      return {
        success: false,
        message: 'Erreur lors de la sauvegarde'
      };
    }
  }

  /**
   * Récupérer les configurations
   */
  getSavedConfigs() {
    try {
      const saved = localStorage.getItem('savedInterfaceConfigs');
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('Erreur lors de la récupération des configurations:', error);
      return [];
    }
  }

  /**
   * Charger une configuration
   */
  async loadConfig(configId) {
    try {
      const savedConfigs = this.getSavedConfigs();
      const config = savedConfigs.find(c => c.timestamp === configId);
      
      if (config) {
        return {
          success: true,
          config: config.config
        };
      }
      
      return {
        success: false,
        message: 'Configuration non trouvée'
      };
    } catch (error) {
      console.error('Erreur lors du chargement de la configuration:', error);
      return {
        success: false,
        message: 'Erreur lors du chargement'
      };
    }
  }

  /**
   * Supprimer une configuration
   */
  async deleteConfig(configId) {
    try {
      const savedConfigs = this.getSavedConfigs();
      const filteredConfigs = savedConfigs.filter(c => c.timestamp !== configId);
      localStorage.setItem('savedInterfaceConfigs', JSON.stringify(filteredConfigs));
      
      return {
        success: true,
        message: 'Configuration supprimée avec succès'
      };
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      return {
        success: false,
        message: 'Erreur lors de la suppression'
      };
    }
  }
}

// Export singleton
const storageManagerAPI = new StorageManagerAPI();
export default storageManagerAPI;
