import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import { authenticateToken } from '../middleware/auth.js';
import { logger } from '../utils/logger.js';

// Chemin de base du stockage (sera différent en local vs production)
// Sur O2Switch multisite : /home/bure7653/assistant-redacteur/stockage
const STORAGE_BASE_PATH = process.env.STORAGE_PATH || '/home/bure7653/assistant-redacteur/stockage';

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
    const fileSize = req.file.size;

    // Vérifier le quota de stockage
    const { User } = await import('../models/index.sequelize.js');
    const user = await User.findByPk(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    if (!user.hasEnoughStorage(fileSize)) {
      const quota = user.getStorageQuota();
      const quotaMB = (quota / (1024 * 1024)).toFixed(0);
      const usedMB = ((user.storageUsed || 0) / (1024 * 1024)).toFixed(2);
      
      return res.status(413).json({
        success: false,
        error: `Quota de stockage dépassé. Vous utilisez ${usedMB} MB sur ${quotaMB} MB disponibles.`,
        quota: quota,
        used: user.storageUsed || 0,
        available: quota - (user.storageUsed || 0)
      });
    }

    // Upload local sur le serveur (cohérent avec browse et folder)
    const userBasePath = path.join(STORAGE_BASE_PATH, 'users', String(userId));
    const cleanFolder = (folder === '.' || folder === '/') ? '' : folder.replace(/^\/+/, '');
    const targetDir = cleanFolder ? path.join(userBasePath, cleanFolder) : userBasePath;
    
    // Créer le dossier si nécessaire
    await fs.mkdir(targetDir, { recursive: true });
    
    // Sécurité : vérifier que le chemin reste dans le dossier utilisateur
    const normalizedDir = path.normalize(targetDir);
    if (!normalizedDir.startsWith(path.normalize(userBasePath))) {
      return res.status(403).json({
        success: false,
        error: 'Accès non autorisé'
      });
    }
    
    const filePath = path.join(targetDir, req.file.originalname);
    await fs.writeFile(filePath, req.file.buffer);

    // Mettre à jour l'espace utilisé
    await user.addStorageUsed(fileSize);

    res.json({
      success: true,
      message: 'File uploaded successfully',
      data: {
        name: req.file.originalname,
        path: `/${folder}/${req.file.originalname}`,
        size: fileSize
      },
      storage: {
        used: user.storageUsed,
        quota: user.getStorageQuota(),
        available: user.getStorageQuota() - user.storageUsed
      }
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

    // Lister les fichiers localement
    const userBasePath = path.join(STORAGE_BASE_PATH, 'users', String(userId));
    const targetDir = path.join(userBasePath, folder);
    
    try {
      await fs.mkdir(targetDir, { recursive: true });
    } catch (e) { /* ignore */ }
    
    let entries;
    try {
      entries = await fs.readdir(targetDir, { withFileTypes: true });
    } catch (e) {
      entries = [];
    }
    
    const files = [];
    for (const entry of entries) {
      if (!entry.isDirectory()) {
        const stats = await fs.stat(path.join(targetDir, entry.name));
        files.push({
          id: entry.name,
          name: entry.name,
          path: `/${folder}/${entry.name}`,
          size: stats.size,
          modifiedAt: stats.mtime
        });
      }
    }

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
    const requestedPath = req.query.path;

    if (!requestedPath) {
      return res.status(400).json({
        success: false,
        error: 'File path is required'
      });
    }

    // Télécharger depuis le stockage local
    const userId = req.user.id;
    const userBasePath = path.join(STORAGE_BASE_PATH, 'users', String(userId));
    const cleanPath = requestedPath.replace(/^\/+/, '');
    const fullPath = path.join(userBasePath, cleanPath);
    
    // Sécurité
    const normalizedPath = path.normalize(fullPath);
    if (!normalizedPath.startsWith(path.normalize(userBasePath))) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }
    
    const fileBuffer = await fs.readFile(normalizedPath);
    const fileName = requestedPath.split('/').pop();
    const ext = path.extname(fileName).toLowerCase();
    const mimeTypes = {
      '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png',
      '.gif': 'image/gif', '.webp': 'image/webp', '.svg': 'image/svg+xml',
      '.pdf': 'application/pdf', '.zip': 'application/zip',
      '.doc': 'application/msword', '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      '.txt': 'text/plain', '.csv': 'text/csv', '.json': 'application/json'
    };
    
    const isInline = req.query.inline === 'true';
    res.setHeader('Content-Type', mimeTypes[ext] || 'application/octet-stream');
    res.setHeader('Content-Disposition', `${isInline ? 'inline' : 'attachment'}; filename="${fileName}"`);
    res.setHeader('Content-Length', fileBuffer.length);
    res.send(fileBuffer);
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
    const requestedPath = req.body.path;

    if (!requestedPath) {
      return res.status(400).json({
        success: false,
        error: 'File path is required'
      });
    }

    // Supprimer depuis le stockage local
    const userId = req.user.id;
    const userBasePath = path.join(STORAGE_BASE_PATH, 'users', String(userId));
    const cleanPath = requestedPath.replace(/^\/+/, '');
    const fullPath = path.join(userBasePath, cleanPath);
    
    // Sécurité
    const normalizedPath = path.normalize(fullPath);
    if (!normalizedPath.startsWith(path.normalize(userBasePath))) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }
    
    // Récupérer la taille avant suppression pour libérer l'espace
    const stats = await fs.stat(normalizedPath);
    const fileSize = stats.size;
    
    await fs.unlink(normalizedPath);

    // Libérer l'espace de stockage
    try {
      const { User } = await import('../models/index.sequelize.js');
      const user = await User.findByPk(userId);
      if (user) await user.freeStorage(fileSize);
    } catch (e) { logger.warn('Erreur libération espace:', e.message); }

    res.json({
      success: true,
      message: 'File deleted successfully',
      data: { path: requestedPath }
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
    
    // Créer le dossier dans le stockage local (cohérent avec browse)
    const userBasePath = path.join(STORAGE_BASE_PATH, 'users', String(userId));
    const cleanFolder = folder.replace(/^\/+/, '');
    const folderPath = path.join(userBasePath, cleanFolder);
    
    // Sécurité : vérifier que le chemin reste dans le dossier utilisateur
    const normalizedPath = path.normalize(folderPath);
    if (!normalizedPath.startsWith(path.normalize(userBasePath))) {
      return res.status(403).json({
        success: false,
        error: 'Accès non autorisé'
      });
    }
    
    await fs.mkdir(normalizedPath, { recursive: true });

    res.json({
      success: true,
      message: 'Folder created successfully',
      data: { path: folder }
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
 * @route   POST /api/storage/move
 * @desc    Déplace un fichier vers un autre dossier
 * @access  Private
 */
router.post('/move', authenticateToken, async (req, res) => {
  try {
    const { sourcePath, destinationFolder } = req.body;
    
    if (!sourcePath || destinationFolder === undefined) {
      return res.status(400).json({
        success: false,
        error: 'sourcePath et destinationFolder sont requis'
      });
    }
    
    const userId = req.user.id;
    const userBasePath = path.join(STORAGE_BASE_PATH, 'users', String(userId));
    
    // Construire les chemins
    const cleanSource = sourcePath.replace(/^\/+/, '');
    const cleanDest = (destinationFolder === '/' || destinationFolder === '') ? '' : destinationFolder.replace(/^\/+/, '');
    const sourceFullPath = path.join(userBasePath, cleanSource);
    const fileName = path.basename(cleanSource);
    const destDir = cleanDest ? path.join(userBasePath, cleanDest) : userBasePath;
    const destFullPath = path.join(destDir, fileName);
    
    // Sécurité
    const normalizedSource = path.normalize(sourceFullPath);
    const normalizedDest = path.normalize(destFullPath);
    const normalizedBase = path.normalize(userBasePath);
    if (!normalizedSource.startsWith(normalizedBase) || !normalizedDest.startsWith(normalizedBase)) {
      return res.status(403).json({ success: false, error: 'Accès non autorisé' });
    }
    
    // Vérifier que le fichier source existe
    await fs.stat(normalizedSource);
    
    // Créer le dossier destination si nécessaire
    await fs.mkdir(path.dirname(normalizedDest), { recursive: true });
    
    // Déplacer le fichier
    await fs.rename(normalizedSource, normalizedDest);
    
    res.json({
      success: true,
      message: 'Fichier déplacé avec succès',
      data: { from: sourcePath, to: `/${cleanDest ? cleanDest + '/' : ''}${fileName}` }
    });
  } catch (error) {
    logger.error('Move file error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Erreur lors du déplacement'
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
    const requestedPath = req.query.path;

    if (!requestedPath) {
      return res.status(400).json({
        success: false,
        error: 'File path is required'
      });
    }

    // Métadonnées depuis le stockage local
    const userId = req.user.id;
    const userBasePath = path.join(STORAGE_BASE_PATH, 'users', String(userId));
    const fullPath = path.join(userBasePath, requestedPath);
    
    const normalizedPath = path.normalize(fullPath);
    if (!normalizedPath.startsWith(path.normalize(userBasePath))) {
      return res.status(403).json({ success: false, error: 'Access denied' });
    }
    
    const stats = await fs.stat(normalizedPath);
    const metadata = {
      name: requestedPath.split('/').pop(),
      path: requestedPath,
      size: stats.size,
      modifiedAt: stats.mtime,
      createdAt: stats.birthtime
    };

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
 * @route   GET /api/storage/browse
 * @desc    Navigue dans le stockage local de l'utilisateur
 * @access  Private
 */
router.get('/browse', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const requestedPath = req.query.path || '/';
    
    // Base unique : STORAGE_BASE_PATH/users/{userId}
    const userBasePath = path.join(STORAGE_BASE_PATH, 'users', String(userId));
    
    // Nettoyer le chemin demandé (retirer le / initial pour path.join)
    const cleanPath = requestedPath === '/' ? '' : requestedPath.replace(/^\/+/, '');
    const fullPath = cleanPath ? path.join(userBasePath, cleanPath) : userBasePath;
    
    // Sécurité : vérifier que le chemin reste dans le dossier utilisateur
    const normalizedPath = path.normalize(fullPath);
    if (!normalizedPath.startsWith(path.normalize(userBasePath))) {
      return res.status(403).json({
        success: false,
        error: 'Accès non autorisé'
      });
    }
    
    // Créer le dossier utilisateur s'il n'existe pas
    try {
      await fs.mkdir(userBasePath, { recursive: true });
    } catch (mkdirError) {
      // Ignorer si le dossier existe déjà
    }
    
    // Lire le contenu du dossier
    let entries;
    try {
      entries = await fs.readdir(normalizedPath, { withFileTypes: true });
    } catch (readError) {
      if (readError.code === 'ENOENT') {
        return res.json({
          success: true,
          path: requestedPath,
          files: []
        });
      }
      throw readError;
    }
    
    // Construire la liste des fichiers/dossiers
    const files = await Promise.all(entries.map(async (entry) => {
      const entryPath = path.join(normalizedPath, entry.name);
      const relativePath = path.relative(userBasePath, entryPath);
      
      try {
        const stats = await fs.stat(entryPath);
        const isImage = /\.(jpg|jpeg|png|gif|webp|svg|bmp)$/i.test(entry.name);
        
        const item = {
          name: entry.name,
          path: '/' + relativePath.replace(/\\/g, '/'),
          type: entry.isDirectory() ? 'directory' : (isImage ? 'image' : 'file'),
          size: entry.isDirectory() ? null : stats.size,
          modifiedAt: stats.mtime
        };
        
        // Pour les dossiers, compter les éléments
        if (entry.isDirectory()) {
          try {
            const subEntries = await fs.readdir(entryPath);
            item.count = subEntries.length;
          } catch {
            item.count = 0;
          }
        }
        
        // Pour les images, générer l'URL de la vignette/preview
        // NB: pas de préfixe /api car le frontend ajoute déjà API_BASE_URL qui contient /api
        if (isImage) {
          item.thumbnailUrl = `/storage/download?path=${encodeURIComponent(item.path)}&inline=true`;
          item.url = `/storage/download?path=${encodeURIComponent(item.path)}&inline=true`;
        }
        
        return item;
      } catch (statError) {
        return null;
      }
    }));
    
    // Filtrer les entrées nulles et trier (dossiers d'abord)
    const validFiles = files
      .filter(f => f !== null)
      .sort((a, b) => {
        if (a.type === 'directory' && b.type !== 'directory') return -1;
        if (a.type !== 'directory' && b.type === 'directory') return 1;
        return a.name.localeCompare(b.name);
      });
    
    res.json({
      success: true,
      path: requestedPath,
      files: validFiles
    });
  } catch (error) {
    logger.error('Browse storage error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Erreur lors de la navigation'
    });
  }
});

/**
 * @route   GET /api/storage/image
 * @desc    Sert une image du stockage
 * @access  Private
 */
router.get('/image', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const imagePath = req.query.path;
    const thumbnail = req.query.thumbnail === 'true';
    
    if (!imagePath) {
      return res.status(400).json({ success: false, error: 'Chemin requis' });
    }
    
    const userBasePath = path.join(STORAGE_BASE_PATH, 'users', String(userId));
    const cleanImagePath = imagePath.replace(/^\/+/, '');
    const fullPath = path.join(userBasePath, cleanImagePath);
    
    // Sécurité
    const normalizedPath = path.normalize(fullPath);
    if (!normalizedPath.startsWith(path.normalize(userBasePath))) {
      return res.status(403).json({ success: false, error: 'Accès non autorisé' });
    }
    
    // Lire le fichier
    logger.info(`[image] Trying to read: ${normalizedPath}`);
    const fileBuffer = await fs.readFile(normalizedPath);
    
    // Déterminer le type MIME
    const ext = path.extname(imagePath).toLowerCase();
    const mimeTypes = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp',
      '.svg': 'image/svg+xml',
      '.bmp': 'image/bmp'
    };
    
    res.setHeader('Content-Type', mimeTypes[ext] || 'application/octet-stream');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.send(fileBuffer);
  } catch (error) {
    logger.error(`Serve image error for path "${req.query.path}":`, error.message);
    res.status(404).json({ success: false, error: 'Image non trouvée' });
  }
});

/**
 * @route   DELETE /api/storage/delete
 * @desc    Supprime un fichier du stockage local
 * @access  Private
 */
router.delete('/delete', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const filePath = req.body.path;
    
    if (!filePath) {
      return res.status(400).json({ success: false, error: 'Chemin requis' });
    }
    
    const userBasePath = path.join(STORAGE_BASE_PATH, 'users', String(userId));
    const cleanFilePath = filePath.replace(/^\/+/, '');
    const fullPath = path.join(userBasePath, cleanFilePath);
    
    // Sécurité
    const normalizedPath = path.normalize(fullPath);
    if (!normalizedPath.startsWith(path.normalize(userBasePath))) {
      return res.status(403).json({ success: false, error: 'Accès non autorisé' });
    }
    
    // Calculer la taille avant suppression
    const { storageScanner } = await import('../services/storageScanner.js');
    const stats = await fs.stat(normalizedPath);
    let freedSize = 0;
    
    if (stats.isDirectory()) {
      freedSize = await storageScanner.calculateFolderSize(normalizedPath);
      await fs.rm(normalizedPath, { recursive: true });
    } else {
      freedSize = stats.size;
      await fs.unlink(normalizedPath);
    }
    
    // Libérer l'espace de stockage
    try {
      const { User } = await import('../models/index.sequelize.js');
      const user = await User.findByPk(userId);
      if (user) await user.freeStorage(freedSize);
    } catch (e) { logger.warn('Erreur libération espace:', e.message); }
    
    res.json({ success: true, message: 'Fichier supprimé' });
  } catch (error) {
    logger.error('Delete file error:', error);
    res.status(500).json({ success: false, error: 'Erreur lors de la suppression' });
  }
});

/**
 * @route   GET /api/storage/status
 * @desc    Vérifie le statut du service de stockage
 * @access  Private
 */
router.get('/status', authenticateToken, async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        configured: true,
        provider: 'Local Storage',
        status: 'active'
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

/**
 * @route   GET /api/storage/usage
 * @desc    Récupère le stockage réel utilisé par l'utilisateur (scan des dossiers)
 * @access  Private
 */
router.get('/usage', authenticateToken, async (req, res) => {
  try {
    const { storageScanner } = await import('../services/storageScanner.js');
    const userId = req.user.id;
    
    const storageInfo = await storageScanner.calculateUserStorage(userId);
    
    // Synchroniser le storageUsed en DB avec la valeur réelle calculée
    try {
      const { User } = await import('../models/index.sequelize.js');
      const user = await User.findByPk(userId);
      if (user && user.storageUsed !== storageInfo.totalBytes) {
        user.storageUsed = storageInfo.totalBytes;
        await user.save();
        logger.info(`[usage] Synced storageUsed for user ${userId}: ${storageInfo.totalBytes} bytes`);
      }
    } catch (syncErr) {
      logger.warn('Erreur sync storageUsed:', syncErr.message);
    }
    
    res.json({
      success: true,
      data: storageInfo
    });
  } catch (error) {
    logger.error('Storage usage error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to calculate storage usage'
    });
  }
});

/**
 * @route   POST /api/storage/scan
 * @desc    Force un scan du stockage et met à jour la BDD (admin seulement)
 * @access  Private (Admin)
 */
router.post('/scan', authenticateToken, async (req, res) => {
  try {
    // Vérifier si l'utilisateur est admin
    const { User } = await import('../models/index.sequelize.js');
    const user = await User.findByPk(req.user.id);
    
    if (!user || user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Accès réservé aux administrateurs'
      });
    }
    
    const { storageScanner } = await import('../services/storageScanner.js');
    const results = await storageScanner.scanAllUsers();
    
    res.json({
      success: true,
      message: `Scan terminé: ${results.length} utilisateurs traités`,
      data: results
    });
  } catch (error) {
    logger.error('Storage scan error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to scan storage'
    });
  }
});

/**
 * @route   GET /api/storage/check-quota
 * @desc    Vérifie si l'utilisateur peut stocker un fichier
 * @access  Private
 */
router.get('/check-quota', authenticateToken, async (req, res) => {
  try {
    const { storageScanner } = await import('../services/storageScanner.js');
    const userId = req.user.id;
    const fileSize = parseInt(req.query.size, 10) || 0;
    
    const result = await storageScanner.checkStorageQuota(userId, fileSize);
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    logger.error('Storage quota check error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to check storage quota'
    });
  }
});

export default router;
