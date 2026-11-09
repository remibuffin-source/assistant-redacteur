// Gestionnaire de stockage pour l'Assistant Rédactionnel
// Gestion des 5GB de stockage avec 4 dossiers organisés

// Retire les données binaires (conservées dans IndexedDB) pour éviter
// de saturer le quota localStorage
function stripBinaryData(files = []) {
  return files.map(f => {
    const copy = { ...f };
    delete copy.base64;
    delete copy.dataUrl;
    delete copy.file;
    return copy;
  });
}

class StorageManager {
  constructor() {
    this.storageLimit = 5 * 1024 * 1024 * 1024; // 5GB en bytes
    this.basePath = '../../../stockage/';
    this.folders = {
      models: 'Modèles',
      publications: 'Publications', 
      presets: 'Préréglages',
      personal: 'Doc perso'
    };
  }

  // Obtenir l'utilisation actuelle du stockage
  async getStorageUsage() {
    try {
      let totalSize = 0;
      const usage = {};
      
      for (const [key, folderName] of Object.entries(this.folders)) {
        const folderSize = await this.getFolderSize(folderName);
        usage[key] = folderSize;
        totalSize += folderSize;
      }
      
      return {
        total: totalSize,
        limit: this.storageLimit,
        percentage: (totalSize / this.storageLimit) * 100,
        folders: usage,
        remaining: this.storageLimit - totalSize
      };
    } catch (error) {
      console.error('Erreur lors du calcul de l\'utilisation du stockage:', error);
      return null;
    }
  }

  // Calculer la taille d'un dossier
  async getFolderSize(folderName) {
    // Simulation - en production, cela nécessiterait une API backend
    const mockSizes = {
      'Modèles': 150 * 1024 * 1024, // 150MB
      'Publications': 75 * 1024 * 1024, // 75MB
      'Préréglages': 5 * 1024 * 1024, // 5MB
      'Doc perso': 200 * 1024 * 1024 // 200MB
    };
    return mockSizes[folderName] || 0;
  }

  // Sauvegarder la configuration de l'interface
  async saveInterfaceConfig(configName, config) {
    try {
      const timestamp = new Date().toISOString();
      const configData = {
        name: configName,
        timestamp: timestamp,
        config: {
          theme: config.theme,
          projectData: config.projectData,
          selectedAI: config.selectedAI,
          selectedTasks: config.selectedTasks,
          selectedFormats: config.selectedFormats,
          advancedOptions: config.advancedOptions,
          // Métadonnées uniquement : les données binaires sont conservées
          // dans IndexedDB (referenceImageStore) pour éviter le quota localStorage
          attachedFiles: stripBinaryData(config.attachedFiles || [])
        }
      };

      // En production, cela sauvegarderait dans le dossier Préréglages
      const savedConfigs = this.getSavedConfigs();
      savedConfigs.push(configData);
      localStorage.setItem('savedInterfaceConfigs', JSON.stringify(savedConfigs));
      
      return {
        success: true,
        message: `Configuration "${configName}" sauvegardée avec succès`,
        timestamp: timestamp
      };
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de la configuration:', error);
      return {
        success: false,
        message: 'Erreur lors de la sauvegarde'
      };
    }
  }

  // Récupérer les configurations sauvegardées
  getSavedConfigs() {
    try {
      const saved = localStorage.getItem('savedInterfaceConfigs');
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('Erreur lors de la récupération des configurations:', error);
      return [];
    }
  }

  // Charger une configuration
  async loadInterfaceConfig(configId) {
    try {
      const savedConfigs = this.getSavedConfigs();
      const config = savedConfigs.find(c => c.timestamp === configId);
      
      if (config) {
        return {
          success: true,
          config: config.config,
          name: config.name
        };
      } else {
        return {
          success: false,
          message: 'Configuration non trouvée'
        };
      }
    } catch (error) {
      console.error('Erreur lors du chargement de la configuration:', error);
      return {
        success: false,
        message: 'Erreur lors du chargement'
      };
    }
  }

  // Supprimer une configuration
  async deleteInterfaceConfig(configId) {
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

  // Sauvegarder un modèle de contenu (éditeur)
  async saveContentModel(modelName, content, type) {
    try {
      const timestamp = new Date().toISOString();
      const modelData = {
        name: modelName,
        type: type,
        content: content,
        timestamp: timestamp
      };

      const savedModels = this.getSavedContentModels();
      savedModels.push(modelData);
      localStorage.setItem('savedContentModels', JSON.stringify(savedModels));
      
      return {
        success: true,
        message: `Modèle "${modelName}" sauvegardé avec succès`
      };
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du modèle:', error);
      return {
        success: false,
        message: 'Erreur lors de la sauvegarde'
      };
    }
  }

  // Récupérer les modèles de contenu (éditeur)
  getSavedContentModels() {
    try {
      const saved = localStorage.getItem('savedContentModels');
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('Erreur lors de la récupération des modèles de contenu:', error);
      return [];
    }
  }

  // Récupérer les modèles complets (Home)
  getSavedModels() {
    try {
      const saved = localStorage.getItem('savedCompleteModels');
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('Erreur lors de la récupération des modèles complets:', error);
      return [];
    }
  }

  // Charger un modèle complet
  async loadModel(modelId) {
    try {
      const savedModels = this.getSavedModels();
      const model = savedModels.find(m => m.timestamp === modelId);
      
      if (model) {
        return {
          success: true,
          config: {
            ...model.config,
            content: model.content,
            results: model.results || []
          },
          name: model.name
        };
      } else {
        return {
          success: false,
          message: 'Modèle non trouvé'
        };
      }
    } catch (error) {
      console.error('Erreur lors du chargement du modèle:', error);
      return {
        success: false,
        message: 'Erreur lors du chargement'
      };
    }
  }

  // Supprimer un modèle complet
  async deleteModel(modelId) {
    try {
      const savedModels = this.getSavedModels();
      const filteredModels = savedModels.filter(m => m.timestamp !== modelId);
      localStorage.setItem('savedCompleteModels', JSON.stringify(filteredModels));
      
      return {
        success: true,
        message: 'Modèle supprimé avec succès'
      };
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      return {
        success: false,
        message: 'Erreur lors de la suppression'
      };
    }
  }

  // Sauvegarder un modèle complet (configuration + contenu)
  async saveModel(modelName, configWithContent) {
    try {
      const timestamp = new Date().toISOString();
      const modelData = {
        name: modelName,
        timestamp: timestamp,
        config: {
          theme: configWithContent.theme,
          projectData: configWithContent.projectData,
          selectedAI: configWithContent.selectedAI,
          selectedTasks: configWithContent.selectedTasks,
          selectedFormats: configWithContent.selectedFormats,
          advancedOptions: configWithContent.advancedOptions,
          attachedFiles: stripBinaryData(configWithContent.attachedFiles || [])
        },
        content: configWithContent.content || '', // Zone de collecte
        results: configWithContent.results || [] // Résultats générés
      };

      const savedModels = this.getSavedModels();
      savedModels.push(modelData);
      localStorage.setItem('savedCompleteModels', JSON.stringify(savedModels));
      
      return {
        success: true,
        message: `Modèle complet "${modelName}" sauvegardé dans le dossier Modèles`
      };
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du modèle complet:', error);
      return {
        success: false,
        message: 'Erreur lors de la sauvegarde'
      };
    }
  }

  // Sauvegarder une publication programmée
  async saveScheduledPublication(title, content, publishDate, platforms) {
    try {
      const timestamp = new Date().toISOString();
      const publicationData = {
        title: title,
        content: content,
        publishDate: publishDate,
        platforms: platforms,
        timestamp: timestamp,
        status: 'scheduled'
      };

      const savedPublications = this.getSavedPublications();
      savedPublications.push(publicationData);
      localStorage.setItem('savedPublications', JSON.stringify(savedPublications));
      
      return {
        success: true,
        message: `Publication "${title}" programmée avec succès`
      };
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de la publication:', error);
      return {
        success: false,
        message: 'Erreur lors de la sauvegarde'
      };
    }
  }

  // Récupérer les publications sauvegardées
  getSavedPublications() {
    try {
      const saved = localStorage.getItem('savedPublications');
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('Erreur lors de la récupération des publications:', error);
      return [];
    }
  }

  // Bibliothèque de contenus
  saveContentLibrary(contentData) {
    try {
      const timestamp = new Date().toISOString();
      const contentWithId = {
        ...contentData,
        id: Date.now().toString(),
        createdAt: timestamp,
        updatedAt: timestamp
      };

      const savedContents = this.getContentLibrary();
      savedContents.push(contentWithId);
      localStorage.setItem('contentLibrary', JSON.stringify(savedContents));

      return {
        success: true,
        message: `Contenu "${contentData.title}" sauvegardé avec succès`,
        id: contentWithId.id
      };
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du contenu:', error);
      return {
        success: false,
        message: 'Erreur lors de la sauvegarde'
      };
    }
  }

  // Récupérer la bibliothèque de contenus
  getContentLibrary() {
    try {
      const saved = localStorage.getItem('contentLibrary');
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('Erreur lors de la récupération de la bibliothèque:', error);
      return [];
    }
  }

  // Mettre à jour un contenu de la bibliothèque
  updateContentLibrary(contentId, contentData) {
    try {
      const savedContents = this.getContentLibrary();
      const updatedContents = savedContents.map(content =>
        content.id === contentId
          ? { ...content, ...contentData, updatedAt: new Date().toISOString() }
          : content
      );

      localStorage.setItem('contentLibrary', JSON.stringify(updatedContents));

      return {
        success: true,
        message: `Contenu "${contentData.title}" mis à jour avec succès`
      };
    } catch (error) {
      console.error('Erreur lors de la mise à jour du contenu:', error);
      return {
        success: false,
        message: 'Erreur lors de la mise à jour'
      };
    }
  }

  // Supprimer un contenu de la bibliothèque
  deleteContentLibrary(contentId) {
    try {
      const savedContents = this.getContentLibrary();
      const filteredContents = savedContents.filter(content => content.id !== contentId);
      localStorage.setItem('contentLibrary', JSON.stringify(filteredContents));

      return {
        success: true,
        message: 'Contenu supprimé avec succès'
      };
    } catch (error) {
      console.error('Erreur lors de la suppression du contenu:', error);
      return {
        success: false,
        message: 'Erreur lors de la suppression'
      };
    }
  }

  // Filtrer la bibliothèque de contenus
  filterContentLibrary(filters) {
    try {
      let contents = this.getContentLibrary();

      // Filtre de recherche
      if (filters.search && filters.search.trim() !== '') {
        const searchTerm = filters.search.toLowerCase();
        contents = contents.filter(content =>
          content.title.toLowerCase().includes(searchTerm) ||
          content.description.toLowerCase().includes(searchTerm) ||
          content.content.toLowerCase().includes(searchTerm) ||
          content.tags.some(tag => tag.toLowerCase().includes(searchTerm))
        );
      }

      // Filtre par type de média
      if (filters.type_media && filters.type_media !== 'all') {
        contents = contents.filter(content => content.type_media === filters.type_media);
      }

      // Filtre par plateforme
      if (filters.plateforme_cible && filters.plateforme_cible !== 'all') {
        contents = contents.filter(content =>
          content.plateforme_cible.includes(filters.plateforme_cible)
        );
      }

      // Filtre par statut
      if (filters.statut && filters.statut !== 'all') {
        contents = contents.filter(content => content.statut === filters.statut);
      }

      return contents;
    } catch (error) {
      console.error('Erreur lors du filtrage de la bibliothèque:', error);
      return [];
    }
  }

  // Obtenir les statistiques de la bibliothèque
  getLibraryStats() {
    try {
      const contents = this.getContentLibrary();
      const stats = {
        total: contents.length,
        Brouillon: contents.filter(c => c.statut === 'Brouillon').length,
        'En attente': contents.filter(c => c.statut === 'En attente').length,
        Validé: contents.filter(c => c.statut === 'Validé').length,
        Publié: contents.filter(c => c.statut === 'Publié').length,
        Échec: contents.filter(c => c.statut === 'Échec').length
      };

      return stats;
    } catch (error) {
      console.error('Erreur lors du calcul des statistiques:', error);
      return { total: 0, Brouillon: 0, 'En attente': 0, Validé: 0, Publié: 0, Échec: 0 };
    }
  }

  // Formater la taille en unités lisibles
  formatSize(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Vérifier si l'espace est suffisant
  checkSpaceAvailable(requiredSize) {
    return this.getStorageUsage().then(usage => {
      return usage && usage.remaining >= requiredSize;
    });
  }
}

export default new StorageManager();
