import fs from 'fs/promises';
import path from 'path';
import { logger } from '../utils/logger.js';

// Chemin de base du stockage sur O2Switch
// Nouvelle architecture : /stockage/users/{userId}/
const STORAGE_BASE_PATH = process.env.STORAGE_PATH || '/home/bure7653/assistant-redacteur/stockage';

// Limite de stockage par utilisateur : 5 Go
const STORAGE_LIMIT_BYTES = 5 * 1024 * 1024 * 1024; // 5 GB

/**
 * Service de scan et calcul du stockage par utilisateur
 * Architecture : /stockage/users/{userId}/
 *   ├── images/
 *   │   ├── generated/    ← Images IA générées
 *   │   └── uploaded/     ← Images uploadées
 *   ├── models/
 *   │   ├── content/      ← Modèles de contenu
 *   │   └── complete/     ← Modèles complets
 *   ├── publications/
 *   │   └── {pubId}/      ← Fichiers par publication
 *   ├── invoices/
 *   └── temp/             ← Fichiers temporaires
 */
class StorageScanner {
  constructor() {
    this.basePath = STORAGE_BASE_PATH;
    this.usersPath = path.join(STORAGE_BASE_PATH, 'users');
    this.storageLimit = STORAGE_LIMIT_BYTES;
  }

  /**
   * Retourne le chemin du dossier racine d'un utilisateur
   * @param {number} userId - ID de l'utilisateur
   * @returns {string} - Chemin du dossier utilisateur
   */
  getUserPath(userId) {
    return path.join(this.usersPath, String(userId));
  }

  /**
   * Retourne les chemins des sous-dossiers d'un utilisateur
   * @param {number} userId - ID de l'utilisateur
   * @returns {object} - Chemins des sous-dossiers
   */
  getUserPaths(userId) {
    const userPath = this.getUserPath(userId);
    return {
      root: userPath,
      images: {
        root: path.join(userPath, 'images'),
        generated: path.join(userPath, 'images', 'generated'),
        uploaded: path.join(userPath, 'images', 'uploaded')
      },
      models: {
        root: path.join(userPath, 'models'),
        content: path.join(userPath, 'models', 'content'),
        complete: path.join(userPath, 'models', 'complete')
      },
      publications: path.join(userPath, 'publications'),
      invoices: path.join(userPath, 'invoices'),
      temp: path.join(userPath, 'temp')
    };
  }

  /**
   * Crée la structure de dossiers pour un utilisateur
   * @param {number} userId - ID de l'utilisateur
   */
  async createUserStructure(userId) {
    const paths = this.getUserPaths(userId);
    const dirsToCreate = [
      paths.root,
      paths.images.root,
      paths.images.generated,
      paths.images.uploaded,
      paths.models.root,
      paths.models.content,
      paths.models.complete,
      paths.publications,
      paths.invoices,
      paths.temp
    ];

    for (const dir of dirsToCreate) {
      try {
        await fs.mkdir(dir, { recursive: true });
      } catch (err) {
        if (err.code !== 'EEXIST') {
          logger.warn(`Impossible de créer le dossier ${dir}: ${err.message}`);
        }
      }
    }
    
    logger.info(`Structure de dossiers créée pour l'utilisateur ${userId}`);
    return paths;
  }

  /**
   * Calcule récursivement la taille d'un dossier
   * @param {string} dirPath - Chemin du dossier
   * @returns {Promise<number>} - Taille totale en bytes
   */
  async calculateFolderSize(dirPath) {
    let totalSize = 0;
    
    try {
      const entries = await fs.readdir(dirPath, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);
        
        if (entry.isDirectory()) {
          totalSize += await this.calculateFolderSize(fullPath);
        } else if (entry.isFile()) {
          try {
            const stats = await fs.stat(fullPath);
            totalSize += stats.size;
          } catch (err) {
            logger.warn(`Impossible de lire le fichier ${fullPath}: ${err.message}`);
          }
        }
      }
    } catch (err) {
      logger.warn(`Impossible de lire le dossier ${dirPath}: ${err.message}`);
    }
    
    return totalSize;
  }

  /**
   * Calcule le stockage total utilisé par un utilisateur
   * Nouvelle architecture : /stockage/users/{userId}/
   * @param {number} userId - ID de l'utilisateur
   * @returns {Promise<object>} - Informations de stockage
   */
  async calculateUserStorage(userId) {
    const userPath = this.getUserPath(userId);
    let totalBytes = 0;
    const folderDetails = {};
    
    try {
      // Vérifier si le dossier utilisateur existe
      await fs.access(userPath);
      
      // Calculer la taille totale du dossier utilisateur
      totalBytes = await this.calculateFolderSize(userPath);
      
      // Optionnel : détail par sous-dossier
      const paths = this.getUserPaths(userId);
      const subFolders = {
        'images/generated': paths.images.generated,
        'images/uploaded': paths.images.uploaded,
        'models/content': paths.models.content,
        'models/complete': paths.models.complete,
        'publications': paths.publications,
        'invoices': paths.invoices,
        'temp': paths.temp
      };
      
      for (const [name, folderPath] of Object.entries(subFolders)) {
        try {
          await fs.access(folderPath);
          folderDetails[name] = await this.calculateFolderSize(folderPath);
        } catch {
          folderDetails[name] = 0;
        }
      }
      
    } catch (err) {
      // Le dossier utilisateur n'existe pas encore
      logger.info(`Dossier utilisateur ${userId} non trouvé, création...`);
      await this.createUserStructure(userId);
    }
    
    return {
      userId,
      totalBytes,
      totalMB: (totalBytes / (1024 * 1024)).toFixed(2),
      totalGB: (totalBytes / (1024 * 1024 * 1024)).toFixed(3),
      limitBytes: this.storageLimit,
      limitGB: (this.storageLimit / (1024 * 1024 * 1024)).toFixed(0),
      usedPercent: ((totalBytes / this.storageLimit) * 100).toFixed(1),
      isOverLimit: totalBytes > this.storageLimit,
      remainingBytes: Math.max(0, this.storageLimit - totalBytes),
      folders: folderDetails
    };
  }

  /**
   * Scanne tous les utilisateurs et recalcule leur stockage
   * Met à jour la base de données
   * Nouvelle architecture : /stockage/users/{userId}/
   * @returns {Promise<object[]>} - Résultats du scan
   */
  async scanAllUsers() {
    const results = [];
    
    try {
      // Créer le dossier users s'il n'existe pas
      try {
        await fs.mkdir(this.usersPath, { recursive: true });
      } catch (err) {
        if (err.code !== 'EEXIST') throw err;
      }
      
      // Lister tous les dossiers utilisateur dans /stockage/users/
      const userDirs = await fs.readdir(this.usersPath, { withFileTypes: true });
      const userIds = userDirs
        .filter(d => d.isDirectory() && /^\d+$/.test(d.name))
        .map(d => parseInt(d.name, 10));
      
      // Calculer le stockage pour chaque utilisateur et mettre à jour la BDD
      const { User } = await import('../models/index.sequelize.js');
      
      for (const userId of userIds) {
        const storageInfo = await this.calculateUserStorage(userId);
        
        try {
          const user = await User.findByPk(userId);
          if (user) {
            // Mettre à jour storageUsed dans la base de données
            const previousStorage = user.storageUsed || 0;
            user.storageUsed = storageInfo.totalBytes;
            await user.save();
            
            logger.info(`Storage scan: User ${userId} - ${storageInfo.totalMB} MB (was ${(previousStorage / (1024 * 1024)).toFixed(2)} MB)`);
            
            results.push({
              ...storageInfo,
              email: user.email,
              previousBytes: previousStorage,
              updated: true
            });
          } else {
            logger.warn(`Storage scan: User ${userId} not found in database`);
            results.push({
              ...storageInfo,
              updated: false,
              error: 'User not found in database'
            });
          }
        } catch (err) {
          logger.error(`Storage scan error for user ${userId}: ${err.message}`);
          results.push({
            ...storageInfo,
            updated: false,
            error: err.message
          });
        }
      }
      
      logger.info(`Storage scan completed: ${results.length} users processed`);
      
    } catch (err) {
      logger.error(`Storage scan failed: ${err.message}`);
      throw err;
    }
    
    return results;
  }

  /**
   * Vérifie si un utilisateur peut stocker un fichier de taille donnée
   * @param {number} userId - ID de l'utilisateur
   * @param {number} fileSize - Taille du fichier en bytes
   * @returns {Promise<{allowed: boolean, message: string}>}
   */
  async checkStorageQuota(userId, fileSize) {
    const storageInfo = await this.calculateUserStorage(userId);
    const newTotal = storageInfo.totalBytes + fileSize;
    
    if (newTotal > this.storageLimit) {
      return {
        allowed: false,
        message: `Quota de stockage dépassé. Vous utilisez ${storageInfo.totalMB} MB sur ${storageInfo.limitGB} GB. ` +
                 `Le fichier (${(fileSize / (1024 * 1024)).toFixed(2)} MB) dépasse l'espace disponible.`,
        currentUsage: storageInfo.totalBytes,
        limit: this.storageLimit,
        fileSize,
        remaining: storageInfo.remainingBytes
      };
    }
    
    return {
      allowed: true,
      message: 'OK',
      currentUsage: storageInfo.totalBytes,
      limit: this.storageLimit,
      fileSize,
      remaining: storageInfo.remainingBytes - fileSize
    };
  }

  /**
   * Retourne l'URL publique pour un fichier stocké
   * @param {number} userId - ID de l'utilisateur
   * @param {string} subPath - Sous-chemin dans le dossier utilisateur (ex: images/generated/file.webp)
   * @returns {string} - URL publique
   */
  getPublicUrl(userId, subPath) {
    return `https://api.assistant-redacteur.fr/stockage/users/${userId}/${subPath}`;
  }
}

// Instance singleton
const storageScanner = new StorageScanner();

export { storageScanner, StorageScanner, STORAGE_LIMIT_BYTES, STORAGE_BASE_PATH };
export default storageScanner;
