import ContentModel from '../models/ContentModel.js';
import ContentModelFile from '../models/ContentModelFile.js';
import { fileStorageService } from '../services/fileStorageService.js';
import { logger } from '../utils/logger.js';

/**
 * Contrôleur pour les modèles de contenu (éditeur)
 */

// Créer un nouveau modèle (stockage hybride : métadonnées en DB, contenu en fichier)
export const createContentModel = async (req, res) => {
  try {
    const { name, content, type, description, tags, category, isTemplate } = req.body;
    const userId = req.user.id;
    const fileType = type || 'text';
    const extension = fileType === 'html' ? 'html' : (fileType === 'markdown' ? 'md' : 'txt');

    // 1. Créer l'entrée en DB avec un placeholder pour le contenu
    const model = await ContentModel.create({
      userId,
      name,
      content: '', // Contenu stocké en fichier, pas en DB
      type: fileType,
      description,
      tags: tags ? (typeof tags === 'string' ? JSON.parse(tags) : tags) : [],
      category,
      isTemplate: isTemplate === 'true' || isTemplate === true
    });

    // 2. Sauvegarder le contenu dans un fichier
    const fileResult = await fileStorageService.saveContent(
      'contentModels',
      userId,
      model.id,
      content || '',
      extension
    );

    // 3. Mettre à jour le modèle avec le chemin du fichier
    await model.update({ 
      content: `file://${fileResult.relativePath}` 
    });

    logger.info(`✅ Modèle créé: ${model.id} par user ${userId} (fichier: ${fileResult.relativePath})`);

    // Retourner le modèle avec le contenu original
    const responseModel = model.toJSON();
    responseModel.content = content;

    res.status(201).json({
      success: true,
      message: 'Modèle créé avec succès',
      data: responseModel
    });
  } catch (error) {
    logger.error('❌ Erreur création modèle:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création du modèle',
      error: error.message
    });
  }
};

// Récupérer tous les modèles de l'utilisateur
export const getContentModels = async (req, res) => {
  try {
    const userId = req.user.id;
    const { category, isTemplate } = req.query;

    logger.info(`🟦 [API BACKEND] GET /content-models - userId: ${userId}`);
    logger.info(`🟦 [API BACKEND] Query params - category: ${category}, isTemplate: ${isTemplate}`);

    const where = { userId };
    if (category) where.category = category;
    if (isTemplate !== undefined) where.isTemplate = isTemplate === 'true';

    const models = await ContentModel.findAll({
      where,
      include: [{
        model: ContentModelFile,
        as: 'files'
      }],
      order: [['createdAt', 'DESC']]
    });

    logger.info(`🟦 [API BACKEND] Modèles trouvés: ${models.length}`);
    if (models.length > 0) {
      logger.info(`🟦 [API BACKEND] Premier modèle - id: ${models[0].id}, name: ${models[0].name}`);
      logger.info(`🟦 [API BACKEND] Premier modèle - content length: ${models[0].content?.length || 0}`);
      logger.info(`🟦 [API BACKEND] Premier modèle - fichiers: ${models[0].files?.length || 0}`);
    } else {
      logger.warn(`⚠️ [API BACKEND] AUCUN modèle trouvé pour userId: ${userId}`);
    }

    res.json({
      success: true,
      data: models,
      count: models.length
    });
  } catch (error) {
    logger.error('❌ Erreur récupération modèles:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des modèles',
      error: error.message
    });
  }
};

// Récupérer un modèle spécifique (avec chargement du contenu depuis fichier)
export const getContentModel = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const model = await ContentModel.findOne({
      where: { id, userId },
      include: [{
        model: ContentModelFile,
        as: 'files'
      }]
    });

    if (!model) {
      return res.status(404).json({
        success: false,
        message: 'Modèle non trouvé'
      });
    }

    // Incrémenter le compteur d'utilisation
    await model.incrementUsage();

    // Charger le contenu depuis le fichier si stocké en fichier
    const responseModel = model.toJSON();
    if (responseModel.content && responseModel.content.startsWith('file://')) {
      const extension = responseModel.type === 'html' ? 'html' : (responseModel.type === 'markdown' ? 'md' : 'txt');
      const fileContent = await fileStorageService.loadContent('contentModels', userId, id, extension);
      responseModel.content = fileContent || '';
    }

    res.json({
      success: true,
      data: responseModel
    });
  } catch (error) {
    logger.error('❌ Erreur récupération modèle:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du modèle',
      error: error.message
    });
  }
};

// Mettre à jour un modèle (stockage hybride)
export const updateContentModel = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { name, content, type, description, tags, category, isTemplate } = req.body;

    const model = await ContentModel.findOne({
      where: { id, userId }
    });

    if (!model) {
      return res.status(404).json({
        success: false,
        message: 'Modèle non trouvé'
      });
    }

    const fileType = type || model.type;
    const extension = fileType === 'html' ? 'html' : (fileType === 'markdown' ? 'md' : 'txt');

    // Si le contenu est fourni, le sauvegarder en fichier
    if (content !== undefined) {
      await fileStorageService.saveContent('contentModels', userId, id, content, extension);
    }

    // Mettre à jour les métadonnées en DB
    await model.update({
      name: name || model.name,
      content: content !== undefined ? `file://content-models/user-${userId}/${id}.${extension}` : model.content,
      type: fileType,
      description: description !== undefined ? description : model.description,
      tags: tags ? (typeof tags === 'string' ? JSON.parse(tags) : tags) : model.tags,
      category: category !== undefined ? category : model.category,
      isTemplate: isTemplate !== undefined ? (isTemplate === 'true' || isTemplate === true) : model.isTemplate
    });

    logger.info(`✅ Modèle mis à jour: ${id}`);

    // Retourner le modèle avec le contenu
    const responseModel = model.toJSON();
    if (content !== undefined) {
      responseModel.content = content;
    }

    res.json({
      success: true,
      message: 'Modèle mis à jour avec succès',
      data: responseModel
    });
  } catch (error) {
    logger.error('❌ Erreur mise à jour modèle:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour du modèle',
      error: error.message
    });
  }
};

// Supprimer un modèle (avec suppression du fichier de contenu)
export const deleteContentModel = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const model = await ContentModel.findOne({
      where: { id, userId },
      include: [{
        model: ContentModelFile,
        as: 'files'
      }]
    });

    if (!model) {
      return res.status(404).json({
        success: false,
        message: 'Modèle non trouvé'
      });
    }

    // Supprimer les fichiers attachés
    if (model.files && model.files.length > 0) {
      const filePaths = model.files.map(f => f.filePath);
      await fileStorageService.deleteFiles(filePaths);
    }

    // Supprimer le fichier de contenu
    const extension = model.type === 'html' ? 'html' : (model.type === 'markdown' ? 'md' : 'txt');
    await fileStorageService.deleteContent('contentModels', userId, id, extension);

    // Supprimer le modèle (cascade supprime les fichiers en BDD)
    await model.destroy();

    logger.info(`✅ Modèle supprimé: ${id}`);

    res.json({
      success: true,
      message: 'Modèle supprimé avec succès'
    });
  } catch (error) {
    logger.error('❌ Erreur suppression modèle:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression du modèle',
      error: error.message
    });
  }
};

// Uploader un fichier pour un modèle
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

    const model = await ContentModel.findOne({
      where: { id, userId }
    });

    if (!model) {
      return res.status(404).json({
        success: false,
        message: 'Modèle non trouvé'
      });
    }

    // Sauvegarder le fichier
    const fileData = await fileStorageService.saveFile('contentModels', userId, file);

    // Créer l'entrée en BDD
    const modelFile = await ContentModelFile.create({
      contentModelId: id,
      ...fileData
    });

    logger.info(`✅ Fichier uploadé pour modèle ${id}: ${fileData.filename}`);

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

// Supprimer un fichier d'un modèle
export const deleteFileFromModel = async (req, res) => {
  try {
    const { id, fileId } = req.params;
    const userId = req.user.id;

    const model = await ContentModel.findOne({
      where: { id, userId }
    });

    if (!model) {
      return res.status(404).json({
        success: false,
        message: 'Modèle non trouvé'
      });
    }

    const file = await ContentModelFile.findOne({
      where: { id: fileId, contentModelId: id }
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

    logger.info(`✅ Fichier supprimé: ${fileId} du modèle ${id}`);

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
  createContentModel,
  getContentModels,
  getContentModel,
  updateContentModel,
  deleteContentModel,
  uploadFileToModel,
  deleteFileFromModel
};
