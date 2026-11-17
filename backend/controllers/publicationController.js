import PublicationModel from '../models/PublicationModel.js';
import PublicationFile from '../models/PublicationFile.js';
import { fileStorageService } from '../services/fileStorageService.js';
import { logger } from '../utils/logger.js';
import { Op } from 'sequelize';

/**
 * Contrôleur pour les publications
 */

// Créer une nouvelle publication (stockage hybride : métadonnées en DB, contenu en fichier)
export const createPublication = async (req, res) => {
  try {
    const {
      title,
      content,
      publishDate,
      platforms,
      settings,
      tags,
      category,
      source,
      sourceId,
      type,
      imageUrl,
      vignetteUrl,
      status
    } = req.body;
    const userId = req.user.id;

    logger.info(`📝 Création publication - userId: ${userId}, type: ${type}, imageUrl: ${imageUrl ? 'oui' : 'non'}`);
    logger.info(`📝 Données reçues:`, { title, type, imageUrl: imageUrl?.substring(0, 50), vignetteUrl: vignetteUrl?.substring(0, 50) });

    // 1. Créer l'entrée en DB avec placeholder pour le contenu
    const publication = await PublicationModel.create({
      userId,
      title,
      content: '', // Contenu stocké en fichier
      publishDate: publishDate || new Date(),
      platforms: typeof platforms === 'string' ? JSON.parse(platforms) : platforms || [],
      status: status || 'draft',
      settings: typeof settings === 'string' ? JSON.parse(settings) : settings || {},
      tags: tags ? (typeof tags === 'string' ? JSON.parse(tags) : tags) : [],
      category,
      source: source || 'manual',
      sourceId,
      type: type || 'text',
      imageUrl: imageUrl || null,
      vignetteUrl: vignetteUrl || null
    });

    // 2. Sauvegarder le contenu dans un fichier HTML
    const fileResult = await fileStorageService.saveContent(
      'publications',
      userId,
      publication.id,
      content || '',
      'html'
    );

    // 3. Mettre à jour avec le chemin du fichier
    await publication.update({
      content: `file://${fileResult.relativePath}`
    });

    logger.info(`✅ Publication créée: ${publication.id} par user ${userId} (fichier: ${fileResult.relativePath})`);

    // Retourner avec le contenu original
    const responsePublication = publication.toJSON();
    responsePublication.content = content;

    res.status(201).json({
      success: true,
      message: 'Publication créée avec succès',
      data: responsePublication
    });
  } catch (error) {
    logger.error('❌ Erreur création publication:', error);
    logger.error('❌ Stack trace:', error.stack);
    logger.error('❌ Données reçues:', JSON.stringify(req.body, null, 2));
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création de la publication',
      error: error.message,
      details: error.stack
    });
  }
};

// Récupérer toutes les publications de l'utilisateur
export const getPublications = async (req, res) => {
  try {
    const userId = req.user.id;
    const { status, category, startDate, endDate, limit = 100, offset = 0 } = req.query;

    const where = { userId };
    if (status) where.status = status;
    if (category) where.category = category;
    
    if (startDate && endDate) {
      where.publishDate = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    }

    const publications = await PublicationModel.findAll({
      where,
      include: [{
        model: PublicationFile,
        as: 'files',
        order: [['displayOrder', 'ASC']]
      }],
      order: [['publishDate', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
      attributes: { exclude: ['content'] }
    });

    const total = await PublicationModel.count({ where });

    logger.info(`📊 Publications récupérées: ${publications.length}/${total} pour user ${userId}`);

    res.json({
      success: true,
      data: publications,
      count: publications.length,
      total,
      hasMore: (parseInt(offset) + publications.length) < total
    });
  } catch (error) {
    logger.error('❌ Erreur récupération publications:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des publications',
      error: error.message
    });
  }
};

// Récupérer une publication spécifique (avec chargement du contenu depuis fichier)
export const getPublication = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const publication = await PublicationModel.findOne({
      where: { id, userId },
      include: [{
        model: PublicationFile,
        as: 'files',
        order: [['displayOrder', 'ASC']]
      }]
    });

    if (!publication) {
      return res.status(404).json({
        success: false,
        message: 'Publication non trouvée'
      });
    }

    // Charger le contenu depuis le fichier si stocké en fichier
    const responsePublication = publication.toJSON();
    if (responsePublication.content && responsePublication.content.startsWith('file://')) {
      const fileContent = await fileStorageService.loadContent('publications', userId, id, 'html');
      responsePublication.content = fileContent || '';
    }

    res.json({
      success: true,
      data: responsePublication
    });
  } catch (error) {
    logger.error('❌ Erreur récupération publication:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de la publication',
      error: error.message
    });
  }
};

// Mettre à jour une publication (stockage hybride)
export const updatePublication = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const {
      title,
      content,
      publishDate,
      platforms,
      status,
      settings,
      tags,
      category
    } = req.body;

    const publication = await PublicationModel.findOne({
      where: { id, userId }
    });

    if (!publication) {
      return res.status(404).json({
        success: false,
        message: 'Publication non trouvée'
      });
    }

    // Si le contenu est fourni, le sauvegarder en fichier
    if (content !== undefined) {
      await fileStorageService.saveContent('publications', userId, id, content, 'html');
    }

    // Mettre à jour les métadonnées en DB
    await publication.update({
      title: title || publication.title,
      content: content !== undefined ? `file://publications/user-${userId}/${id}.html` : publication.content,
      publishDate: publishDate || publication.publishDate,
      platforms: platforms ? (typeof platforms === 'string' ? JSON.parse(platforms) : platforms) : publication.platforms,
      status: status || publication.status,
      settings: settings ? (typeof settings === 'string' ? JSON.parse(settings) : settings) : publication.settings,
      tags: tags ? (typeof tags === 'string' ? JSON.parse(tags) : tags) : publication.tags,
      category: category !== undefined ? category : publication.category
    });

    logger.info(`✅ Publication mise à jour: ${id}`);

    // Retourner avec le contenu
    const responsePublication = publication.toJSON();
    if (content !== undefined) {
      responsePublication.content = content;
    }

    res.json({
      success: true,
      message: 'Publication mise à jour avec succès',
      data: responsePublication
    });
  } catch (error) {
    logger.error('❌ Erreur mise à jour publication:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour de la publication',
      error: error.message
    });
  }
};

// Changer le statut d'une publication
export const updatePublicationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, message } = req.body;
    const userId = req.user.id;

    const publication = await PublicationModel.findOne({
      where: { id, userId }
    });

    if (!publication) {
      return res.status(404).json({
        success: false,
        message: 'Publication non trouvée'
      });
    }

    await publication.updateStatus(status, { message });

    logger.info(`✅ Statut publication changé: ${id} → ${status}`);

    res.json({
      success: true,
      message: `Publication ${status}`,
      data: publication
    });
  } catch (error) {
    logger.error('❌ Erreur changement statut:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du changement de statut',
      error: error.message
    });
  }
};

// Reprogrammer une publication
export const reschedulePublication = async (req, res) => {
  try {
    const { id } = req.params;
    const { publishDate } = req.body;
    const userId = req.user.id;

    if (!publishDate) {
      return res.status(400).json({
        success: false,
        message: 'Date de publication requise'
      });
    }

    const publication = await PublicationModel.findOne({
      where: { id, userId }
    });

    if (!publication) {
      return res.status(404).json({
        success: false,
        message: 'Publication non trouvée'
      });
    }

    await publication.reschedule(new Date(publishDate));

    logger.info(`✅ Publication reprogrammée: ${id} → ${publishDate}`);

    res.json({
      success: true,
      message: 'Publication reprogrammée avec succès',
      data: publication
    });
  } catch (error) {
    logger.error('❌ Erreur reprogrammation:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la reprogrammation',
      error: error.message
    });
  }
};

// Supprimer une publication
export const deletePublication = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const publication = await PublicationModel.findOne({
      where: { id, userId },
      include: [{
        model: PublicationFile,
        as: 'files'
      }]
    });

    if (!publication) {
      return res.status(404).json({
        success: false,
        message: 'Publication non trouvée'
      });
    }

    // Supprimer les fichiers attachés
    if (publication.files && publication.files.length > 0) {
      const filePaths = publication.files.map(f => f.filePath);
      await fileStorageService.deleteFiles(filePaths);
    }

    // Supprimer le fichier de contenu
    await fileStorageService.deleteContent('publications', userId, id, 'html');

    // Supprimer la publication (cascade supprime les fichiers en BDD)
    await publication.destroy();

    logger.info(`✅ Publication supprimée: ${id}`);

    res.json({
      success: true,
      message: 'Publication supprimée avec succès'
    });
  } catch (error) {
    logger.error('❌ Erreur suppression publication:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression de la publication',
      error: error.message
    });
  }
};

// Uploader un fichier pour une publication
export const uploadFileToPublication = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const file = req.file;
    const { altText, caption, displayOrder } = req.body;

    if (!file) {
      return res.status(400).json({
        success: false,
        message: 'Aucun fichier fourni'
      });
    }

    const publication = await PublicationModel.findOne({
      where: { id, userId }
    });

    if (!publication) {
      return res.status(404).json({
        success: false,
        message: 'Publication non trouvée'
      });
    }

    // Sauvegarder le fichier
    const fileData = await fileStorageService.saveFile('publications', userId, file);

    // Créer l'entrée en BDD
    const pubFile = await PublicationFile.create({
      publicationId: id,
      ...fileData,
      altText,
      caption,
      displayOrder: displayOrder || 0
    });

    logger.info(`✅ Fichier uploadé pour publication ${id}: ${fileData.filename}`);

    res.status(201).json({
      success: true,
      message: 'Fichier uploadé avec succès',
      data: pubFile
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

// Supprimer un fichier d'une publication
export const deleteFileFromPublication = async (req, res) => {
  try {
    const { id, fileId } = req.params;
    const userId = req.user.id;

    const publication = await PublicationModel.findOne({
      where: { id, userId }
    });

    if (!publication) {
      return res.status(404).json({
        success: false,
        message: 'Publication non trouvée'
      });
    }

    const file = await PublicationFile.findOne({
      where: { id: fileId, publicationId: id }
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

    logger.info(`✅ Fichier supprimé: ${fileId} de la publication ${id}`);

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

// Obtenir les statistiques
export const getPublicationStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const { startDate, endDate } = req.query;

    const stats = await PublicationModel.getStats(
      userId,
      startDate ? new Date(startDate) : null,
      endDate ? new Date(endDate) : null
    );

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    logger.error('❌ Erreur récupération stats:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des statistiques',
      error: error.message
    });
  }
};

export default {
  createPublication,
  getPublications,
  getPublication,
  updatePublication,
  updatePublicationStatus,
  reschedulePublication,
  deletePublication,
  uploadFileToPublication,
  deleteFileFromPublication,
  getPublicationStats
};
