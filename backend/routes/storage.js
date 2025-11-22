import express from 'express';
import multer from 'multer';
import { authenticateToken } from '../middleware/auth.js';
import dropboxStorageService from '../services/dropboxStorageService.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

// Configuration Multer pour gérer les uploads en mémoire
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50 MB max
  },
});

/**
 * @route   POST /api/storage/upload
 * @desc    Upload un fichier dans Dropbox
 * @access  Private
 */
router.post('/upload', authenticateToken, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file provided'
      });
    }

    const { folder = 'uploads' } = req.body;
    const userId = req.user.id;

    const result = await dropboxStorageService.uploadFile(
      req.file.buffer,
      userId,
      folder,
      req.file.originalname
    );

    res.json({
      success: true,
      message: 'File uploaded successfully',
      data: result
    });
  } catch (error) {
    logger.error('Upload error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to upload file'
    });
  }
});

/**
 * @route   GET /api/storage/files
 * @desc    Liste les fichiers d'un utilisateur
 * @access  Private
 */
router.get('/files', authenticateToken, async (req, res) => {
  try {
    const { folder = 'uploads' } = req.query;
    const userId = req.user.id;

    const files = await dropboxStorageService.listFiles(userId, folder);

    res.json({
      success: true,
      data: files,
      count: files.length
    });
  } catch (error) {
    logger.error('List files error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to list files'
    });
  }
});

/**
 * @route   GET /api/storage/download
 * @desc    Télécharge un fichier
 * @access  Private
 */
router.get('/download', authenticateToken, async (req, res) => {
  try {
    const { path } = req.query;

    if (!path) {
      return res.status(400).json({
        success: false,
        error: 'File path is required'
      });
    }

    // Vérifier que le chemin appartient bien à l'utilisateur
    const userId = req.user.id;
    if (!path.includes(`/users/${userId}/`)) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    const file = await dropboxStorageService.downloadFile(path);

    res.setHeader('Content-Type', file.contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${file.name}"`);
    res.setHeader('Content-Length', file.size);

    res.send(file.fileBlob);
  } catch (error) {
    logger.error('Download error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to download file'
    });
  }
});

/**
 * @route   DELETE /api/storage/file
 * @desc    Supprime un fichier
 * @access  Private
 */
router.delete('/file', authenticateToken, async (req, res) => {
  try {
    const { path } = req.body;

    if (!path) {
      return res.status(400).json({
        success: false,
        error: 'File path is required'
      });
    }

    // Vérifier que le chemin appartient bien à l'utilisateur
    const userId = req.user.id;
    if (!path.includes(`/users/${userId}/`)) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    const result = await dropboxStorageService.deleteFile(path);

    res.json({
      success: true,
      message: 'File deleted successfully',
      data: result
    });
  } catch (error) {
    logger.error('Delete error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to delete file'
    });
  }
});

/**
 * @route   POST /api/storage/folder
 * @desc    Crée un dossier pour l'utilisateur
 * @access  Private
 */
router.post('/folder', authenticateToken, async (req, res) => {
  try {
    const { folder } = req.body;

    if (!folder) {
      return res.status(400).json({
        success: false,
        error: 'Folder name is required'
      });
    }

    const userId = req.user.id;
    const result = await dropboxStorageService.createUserFolder(userId, folder);

    res.json({
      success: true,
      message: 'Folder created successfully',
      data: result
    });
  } catch (error) {
    logger.error('Create folder error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to create folder'
    });
  }
});

/**
 * @route   GET /api/storage/metadata
 * @desc    Obtient les métadonnées d'un fichier
 * @access  Private
 */
router.get('/metadata', authenticateToken, async (req, res) => {
  try {
    const { path } = req.query;

    if (!path) {
      return res.status(400).json({
        success: false,
        error: 'File path is required'
      });
    }

    // Vérifier que le chemin appartient bien à l'utilisateur
    const userId = req.user.id;
    if (!path.includes(`/users/${userId}/`)) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    const metadata = await dropboxStorageService.getFileMetadata(path);

    res.json({
      success: true,
      data: metadata
    });
  } catch (error) {
    logger.error('Get metadata error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get file metadata'
    });
  }
});

/**
 * @route   GET /api/storage/status
 * @desc    Vérifie le statut du service de stockage
 * @access  Private
 */
router.get('/status', authenticateToken, async (req, res) => {
  try {
    const isConfigured = dropboxStorageService.isConfigured;

    res.json({
      success: true,
      data: {
        configured: isConfigured,
        provider: 'Dropbox',
        status: isConfigured ? 'active' : 'not_configured'
      }
    });
  } catch (error) {
    logger.error('Storage status error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to check storage status'
    });
  }
});

export default router;
