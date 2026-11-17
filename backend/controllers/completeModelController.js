import CompleteModel from '../models/CompleteModel.js';
import CompleteModelFile from '../models/CompleteModelFile.js';
import { fileStorageService } from '../services/fileStorageService.js';
import { logger } from '../utils/logger.js';

/**
 * Contrôleur pour les modèles complets (Home)
 */

// Créer un nouveau modèle complet (stockage hybride : métadonnées en DB, données volumineuses en fichier)
export const createCompleteModel = async (req, res) => {
  try {
    const { name, description, config, content, results, theme, tags, category } = req.body;
    const userId = req.user.id;

    // Préparer les données pour stockage en fichier
    const configData = typeof config === 'string' ? JSON.parse(config) : config;
    const resultsData = typeof results === 'string' ? JSON.parse(results) : results;

    // 1. Créer l'entrée en DB avec placeholders
    const model = await CompleteModel.create({
      userId,
      name,
      description,
      config: {}, // Stocké en fichier
      content: '', // Stocké en fichier
      results: [], // Stocké en fichier
      theme: theme || 'light',
      tags: tags ? (typeof tags === 'string' ? JSON.parse(tags) : tags) : [],
      category
    });

    // 2. Sauvegarder les données volumineuses en fichier JSON
    const fullData = {
      config: configData || {},
      content: content || '',
      results: resultsData || []
    };
    const fileResult = await fileStorageService.saveContent(
      'completeModels',
      userId,
      model.id,
      JSON.stringify(fullData, null, 2),
      'json'
    );

    // 3. Mettre à jour avec le chemin du fichier
    await model.update({
      config: { _fileRef: fileResult.relativePath },
      content: `file://${fileResult.relativePath}`,
      results: []
    });

    logger.info(`✅ Modèle complet créé: ${model.id} par user ${userId} (fichier: ${fileResult.relativePath})`);

    // Retourner avec les données originales
    const responseModel = model.toJSON();
    responseModel.config = configData;
    responseModel.content = content;
    responseModel.results = resultsData;

    res.status(201).json({
      success: true,
      message: 'Modèle complet créé avec succès',
      data: responseModel
    });
  } catch (error) {
    logger.error('❌ Erreur création modèle complet:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création du modèle complet',
      error: error.message
    });
  }
};

// Récupérer tous les modèles complets de l'utilisateur
export const getCompleteModels = async (req, res) => {
  try {
    const userId = req.user.id;
    const { category, isFavorite } = req.query;

    const where = { userId };
    if (category) where.category = category;
    if (isFavorite !== undefined) where.isFavorite = isFavorite === 'true';

    const models = await CompleteModel.findAll({
      where,
      include: [{
        model: CompleteModelFile,
        as: 'files'
      }],
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: models,
      count: models.length
    });
  } catch (error) {
    logger.error('❌ Erreur récupération modèles complets:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des modèles complets',
      error: error.message
    });
  }
};

// Récupérer un modèle complet spécifique (avec chargement depuis fichier)
export const getCompleteModel = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const model = await CompleteModel.findOne({
      where: { id, userId },
      include: [{
        model: CompleteModelFile,
        as: 'files'
      }]
    });

    if (!model) {
      return res.status(404).json({
        success: false,
        message: 'Modèle complet non trouvé'
      });
    }

    // Incrémenter le compteur d'utilisation
    await model.incrementUsage();

    // Charger les données depuis le fichier si stocké en fichier
    const responseModel = model.toJSON();
    if (responseModel.content && responseModel.content.startsWith('file://')) {
      const fileContent = await fileStorageService.loadContent('completeModels', userId, id, 'json');
      if (fileContent) {
        try {
          const parsedData = JSON.parse(fileContent);
          responseModel.config = parsedData.config || {};
          responseModel.content = parsedData.content || '';
          responseModel.results = parsedData.results || [];
        } catch (parseError) {
          logger.warn(`⚠️ Erreur parsing fichier modèle ${id}:`, parseError);
        }
      }
    }

    res.json({
      success: true,
      data: responseModel
    });
  } catch (error) {
    logger.error('❌ Erreur récupération modèle complet:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du modèle complet',
      error: error.message
    });
  }
};

// Mettre à jour un modèle complet (stockage hybride)
export const updateCompleteModel = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { name, description, config, content, results, theme, tags, category } = req.body;

    const model = await CompleteModel.findOne({
      where: { id, userId }
    });

    if (!model) {
      return res.status(404).json({
        success: false,
        message: 'Modèle complet non trouvé'
      });
    }

    // Préparer les données
    const configData = config ? (typeof config === 'string' ? JSON.parse(config) : config) : null;
    const resultsData = results ? (typeof results === 'string' ? JSON.parse(results) : results) : null;

    // Si des données volumineuses sont fournies, les sauvegarder en fichier
    if (config !== undefined || content !== undefined || results !== undefined) {
      // Charger les données existantes
      let existingData = { config: {}, content: '', results: [] };
      const existingContent = await fileStorageService.loadContent('completeModels', userId, id, 'json');
      if (existingContent) {
        try {
          existingData = JSON.parse(existingContent);
        } catch (e) {}
      }

      // Fusionner avec les nouvelles données
      const fullData = {
        config: configData !== null ? configData : existingData.config,
        content: content !== undefined ? content : existingData.content,
        results: resultsData !== null ? resultsData : existingData.results
      };

      await fileStorageService.saveContent(
        'completeModels',
        userId,
        id,
        JSON.stringify(fullData, null, 2),
        'json'
      );
    }

    // Mettre à jour les métadonnées en DB
    await model.update({
      name: name || model.name,
      description: description !== undefined ? description : model.description,
      config: { _fileRef: `complete-models/user-${userId}/${id}.json` },
      content: `file://complete-models/user-${userId}/${id}.json`,
      results: [],
      theme: theme || model.theme,
      tags: tags ? (typeof tags === 'string' ? JSON.parse(tags) : tags) : model.tags,
      category: category !== undefined ? category : model.category
    });

    logger.info(`✅ Modèle complet mis à jour: ${id}`);

    // Retourner avec les données
    const responseModel = model.toJSON();
    if (configData !== null) responseModel.config = configData;
    if (content !== undefined) responseModel.content = content;
    if (resultsData !== null) responseModel.results = resultsData;

    res.json({
      success: true,
      message: 'Modèle complet mis à jour avec succès',
      data: responseModel
    });
  } catch (error) {
    logger.error('❌ Erreur mise à jour modèle complet:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour du modèle complet',
      error: error.message
    });
  }
};

// Basculer le statut favori
export const toggleFavorite = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const model = await CompleteModel.findOne({
      where: { id, userId }
    });

    if (!model) {
      return res.status(404).json({
        success: false,
        message: 'Modèle complet non trouvé'
      });
    }

    await model.toggleFavorite();

    res.json({
      success: true,
      message: `Modèle ${model.isFavorite ? 'ajouté aux' : 'retiré des'} favoris`,
      data: { isFavorite: model.isFavorite }
    });
  } catch (error) {
    logger.error('❌ Erreur toggle favori:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la modification du statut favori',
      error: error.message
    });
  }
};

// Supprimer un modèle complet (avec suppression du fichier de données)
export const deleteCompleteModel = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const model = await CompleteModel.findOne({
      where: { id, userId },
      include: [{
        model: CompleteModelFile,
        as: 'files'
      }]
    });

    if (!model) {
      return res.status(404).json({
        success: false,
        message: 'Modèle complet non trouvé'
      });
    }

    // Supprimer les fichiers attachés
    if (model.files && model.files.length > 0) {
      const filePaths = model.files.map(f => f.filePath);
      await fileStorageService.deleteFiles(filePaths);
    }

    // Supprimer le fichier de données JSON
    await fileStorageService.deleteContent('completeModels', userId, id, 'json');

    // Supprimer le modèle (cascade supprime les fichiers en BDD)
    await model.destroy();

    logger.info(`✅ Modèle complet supprimé: ${id}`);

    res.json({
      success: true,
      message: 'Modèle complet supprimé avec succès'
    });
  } catch (error) {
    logger.error('❌ Erreur suppression modèle complet:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression du modèle complet',
      error: error.message
    });
  }
};

// Uploader un fichier pour un modèle complet
export const uploadFileToModel = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const file = req.file;

    if (!file) {
      return res.status(400).json({
        success: false,
        message: 'Aucun fichier fourni'
      });
    }

    const model = await CompleteModel.findOne({
      where: { id, userId }
    });

    if (!model) {
      return res.status(404).json({
        success: false,
        message: 'Modèle complet non trouvé'
      });
    }

    // Sauvegarder le fichier
    const fileData = await fileStorageService.saveFile('completeModels', userId, file);

    // Créer l'entrée en BDD
    const modelFile = await CompleteModelFile.create({
      completeModelId: id,
      ...fileData
    });

    logger.info(`✅ Fichier uploadé pour modèle complet ${id}: ${fileData.filename}`);

    res.status(201).json({
      success: true,
      message: 'Fichier uploadé avec succès',
      data: modelFile
    });
  } catch (error) {
    logger.error('❌ Erreur upload fichier:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'upload du fichier',
      error: error.message
    });
  }
};

// Supprimer un fichier d'un modèle complet
export const deleteFileFromModel = async (req, res) => {
  try {
    const { id, fileId } = req.params;
    const userId = req.user.id;

    const model = await CompleteModel.findOne({
      where: { id, userId }
    });

    if (!model) {
      return res.status(404).json({
        success: false,
        message: 'Modèle complet non trouvé'
      });
    }

    const file = await CompleteModelFile.findOne({
      where: { id: fileId, completeModelId: id }
    });

    if (!file) {
      return res.status(404).json({
        success: false,
        message: 'Fichier non trouvé'
      });
    }

    // Supprimer le fichier physique
    await fileStorageService.deleteFile(file.filePath);

    // Supprimer l'entrée en BDD
    await file.destroy();

    logger.info(`✅ Fichier supprimé: ${fileId} du modèle complet ${id}`);

    res.json({
      success: true,
      message: 'Fichier supprimé avec succès'
    });
  } catch (error) {
    logger.error('❌ Erreur suppression fichier:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression du fichier',
      error: error.message
    });
  }
};

export default {
  createCompleteModel,
  getCompleteModels,
  getCompleteModel,
  updateCompleteModel,
  toggleFavorite,
  deleteCompleteModel,
  uploadFileToModel,
  deleteFileFromModel
};
