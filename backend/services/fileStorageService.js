import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import { logger } from '../utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Service de gestion des fichiers sur O2Switch
 * Stockage illimité NVMe
 * 
 * NOUVELLE ARCHITECTURE : /stockage/users/{userId}/
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
class FileStorageService {
  constructor() {
    // Chemin de base pour le stockage
    // En production O2Switch multisite: /home/bure7653/assistant-redacteur/stockage/
    // En développement: ./stockage/
    this.baseStoragePath = process.env.STORAGE_PATH 
      || (process.env.NODE_ENV === 'production'
        ? '/home/bure7653/assistant-redacteur/stockage'
        : path.join(__dirname, '../../stockage'));
    
    // Nouvelle architecture : sous-dossiers dans /users/{userId}/
    this.subFolders = {
      contentModels: 'models/content',
      completeModels: 'models/complete',
      publications: 'publications',
      prereglages: 'models/prereglages',
      imagesGenerated: 'images/generated',
      imagesUploaded: 'images/uploaded',
      invoices: 'invoices',
      temp: 'temp'
    };
  }

  /**
   * Obtenir le chemin du dossier utilisateur
   */
  getUserBasePath(userId) {
    return path.join(this.baseStoragePath, 'users', String(userId));
  }

  /**
   * Sauvegarder du contenu texte/JSON dans un fichier
   * @param {string} folder - Type de dossier (contentModels, publications, etc.)
   * @param {number} userId - ID de l'utilisateur
   * @param {number} itemId - ID de l'élément (modèle, publication, etc.)
   * @param {string} content - Contenu à sauvegarder
   * @param {string} extension - Extension du fichier (json, html, txt)
   * @returns {object} - Informations sur le fichier sauvegardé
   */
  async saveContent(folder, userId, itemId, content, extension = 'json') {
    try {
      // Nouvelle architecture : /stockage/users/{userId}/{subFolder}/
      const subFolder = this.subFolders[folder] || folder;
      const userFolder = path.join(
        this.getUserBasePath(userId),
        subFolder
      );
      await fs.mkdir(userFolder, { recursive: true });

      const filename = `${itemId}.${extension}`;
      const filePath = path.join(userFolder, filename);

      await fs.writeFile(filePath, content, 'utf8');

      logger.info(`✅ Contenu sauvegardé: ${filePath}`);

      return {
        success: true,
        filename,
        filePath,
        relativePath: `users/${userId}/${subFolder}/${filename}`,
        size: Buffer.byteLength(content, 'utf8')
      };
    } catch (error) {
      logger.error('❌ Erreur sauvegarde contenu:', error);
      throw error;
    }
  }

  /**
   * Charger du contenu depuis un fichier
   * @param {string} folder - Type de dossier
   * @param {number} userId - ID de l'utilisateur
   * @param {number} itemId - ID de l'élément
   * @param {string} extension - Extension du fichier
   * @returns {string} - Contenu du fichier
   */
  async loadContent(folder, userId, itemId, extension = 'json') {
    try {
      // Nouvelle architecture : /stockage/users/{userId}/{subFolder}/
      const subFolder = this.subFolders[folder] || folder;
      const filePath = path.join(
        this.getUserBasePath(userId),
        subFolder,
        `${itemId}.${extension}`
      );

      const content = await fs.readFile(filePath, 'utf8');
      return content;
    } catch (error) {
      if (error.code === 'ENOENT') {
        logger.warn(`⚠️ Fichier non trouvé: users/${userId}/${folder}/${itemId}.${extension}`);
        return null;
      }
      logger.error('❌ Erreur chargement contenu:', error);
      throw error;
    }
  }

  /**
   * Supprimer le contenu d'un élément
   * @param {string} folder - Type de dossier
   * @param {number} userId - ID de l'utilisateur
   * @param {number} itemId - ID de l'élément
   * @param {string} extension - Extension du fichier
   */
  async deleteContent(folder, userId, itemId, extension = 'json') {
    try {
      // Nouvelle architecture : /stockage/users/{userId}/{subFolder}/
      const subFolder = this.subFolders[folder] || folder;
      const filePath = path.join(
        this.getUserBasePath(userId),
        subFolder,
        `${itemId}.${extension}`
      );

      await fs.unlink(filePath);
      logger.info(`✅ Contenu supprimé: ${filePath}`);
      return true;
    } catch (error) {
      if (error.code === 'ENOENT') {
        logger.warn(`⚠️ Fichier déjà supprimé: users/${userId}/${folder}/${itemId}.${extension}`);
        return true;
      }
      logger.error('❌ Erreur suppression contenu:', error);
      throw error;
    }
  }

  /**
   * Initialiser les dossiers de stockage
   * Nouvelle architecture : /stockage/users/
   */
  async initializeStorage() {
    try {
      // Créer le dossier de base et le dossier users
      const usersPath = path.join(this.baseStoragePath, 'users');
      await fs.mkdir(usersPath, { recursive: true });
      
      logger.info(`✅ Stockage initialisé: ${this.baseStoragePath}/users/`);
      return true;
    } catch (error) {
      logger.error('❌ Erreur initialisation stockage:', error);
      throw error;
    }
  }

  /**
   * Créer la structure de dossiers pour un utilisateur
   */
  async initializeUserStorage(userId) {
    try {
      const userPath = this.getUserBasePath(userId);
      const dirsToCreate = [
        userPath,
        path.join(userPath, 'images', 'generated'),
        path.join(userPath, 'images', 'uploaded'),
        path.join(userPath, 'models', 'content'),
        path.join(userPath, 'models', 'complete'),
        path.join(userPath, 'models', 'prereglages'),
        path.join(userPath, 'publications'),
        path.join(userPath, 'invoices'),
        path.join(userPath, 'video'),
        path.join(userPath, 'temp')
      ];

      for (const dir of dirsToCreate) {
        await fs.mkdir(dir, { recursive: true });
      }
      
      logger.info(`✅ Structure utilisateur créée: ${userPath}`);
      return true;
    } catch (error) {
      logger.error('❌ Erreur création structure utilisateur:', error);
      throw error;
    }
  }

  /**
   * Générer un nom de fichier unique
   */
  generateUniqueFilename(originalName) {
    const ext = path.extname(originalName);
    const timestamp = Date.now();
    const random = crypto.randomBytes(8).toString('hex');
    return `${timestamp}-${random}${ext}`;
  }

  /**
   * Obtenir le chemin complet d'un fichier
   */
  getFilePath(folder, userId, filename) {
    const subFolder = this.subFolders[folder] || folder;
    return path.join(
      this.getUserBasePath(userId),
      subFolder,
      filename
    );
  }

  /**
   * Sauvegarder un fichier
   */
  async saveFile(folder, userId, file) {
    try {
      // Nouvelle architecture : /stockage/users/{userId}/{subFolder}/
      const subFolder = this.subFolders[folder] || folder;
      const userFolder = path.join(
        this.getUserBasePath(userId),
        subFolder
      );
      await fs.mkdir(userFolder, { recursive: true });

      // Générer un nom unique
      const uniqueFilename = this.generateUniqueFilename(file.originalname);
      const filePath = path.join(userFolder, uniqueFilename);

      // Sauvegarder le fichier
      await fs.writeFile(filePath, file.buffer);

      logger.info(`✅ Fichier sauvegardé: ${filePath}`);

      return {
        filename: uniqueFilename,
        originalName: file.originalname,
        filePath: filePath,
        relativePath: `users/${userId}/${subFolder}/${uniqueFilename}`,
        fileSize: file.size,
        mimeType: file.mimetype,
        fileType: this.getFileType(file.mimetype)
      };
    } catch (error) {
      logger.error('❌ Erreur sauvegarde fichier:', error);
      throw error;
    }
  }

  /**
   * Déterminer le type de fichier
   */
  getFileType(mimeType) {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.startsWith('audio/')) return 'audio';
    if (mimeType.includes('pdf') || mimeType.includes('document') || mimeType.includes('text')) return 'document';
    if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('tar')) return 'archive';
    return 'other';
  }

  /**
   * Supprimer un fichier
   */
  async deleteFile(filePath) {
    try {
      await fs.unlink(filePath);
      logger.info(`✅ Fichier supprimé: ${filePath}`);
      return true;
    } catch (error) {
      if (error.code === 'ENOENT') {
        logger.warn(`⚠️  Fichier déjà supprimé: ${filePath}`);
        return true;
      }
      logger.error('❌ Erreur suppression fichier:', error);
      throw error;
    }
  }

  /**
   * Supprimer plusieurs fichiers
   */
  async deleteFiles(filePaths) {
    const results = await Promise.allSettled(
      filePaths.map(filePath => this.deleteFile(filePath))
    );
    
    const failed = results.filter(r => r.status === 'rejected');
    if (failed.length > 0) {
      logger.warn(`⚠️  ${failed.length} fichiers non supprimés`);
    }
    
    return results;
  }

  /**
   * Obtenir la taille d'un dossier
   */
  async getFolderSize(folderPath) {
    try {
      const files = await fs.readdir(folderPath, { withFileTypes: true });
      let totalSize = 0;

      for (const file of files) {
        const filePath = path.join(folderPath, file.name);
        
        if (file.isDirectory()) {
          totalSize += await this.getFolderSize(filePath);
        } else {
          const stats = await fs.stat(filePath);
          totalSize += stats.size;
        }
      }

      return totalSize;
    } catch (error) {
      if (error.code === 'ENOENT') return 0;
      throw error;
    }
  }

  /**
   * Obtenir l'utilisation du stockage par utilisateur
   * Nouvelle architecture : calcul du dossier /users/{userId}/ entier
   */
  async getUserStorageUsage(userId) {
    try {
      const userPath = this.getUserBasePath(userId);
      const totalSize = await this.getFolderSize(userPath);

      return {
        totalSize,
        totalSizeMB: (totalSize / (1024 * 1024)).toFixed(2),
        totalSizeGB: (totalSize / (1024 * 1024 * 1024)).toFixed(2)
      };
    } catch (error) {
      logger.error('❌ Erreur calcul utilisation:', error);
      return { totalSize: 0, totalSizeMB: '0.00', totalSizeGB: '0.00' };
    }
  }

  /**
   * Vérifier si un fichier existe
   */
  async fileExists(filePath) {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Copier un fichier
   */
  async copyFile(sourcePath, destPath) {
    try {
      // Créer le dossier de destination
      await fs.mkdir(path.dirname(destPath), { recursive: true });
      
      // Copier le fichier
      await fs.copyFile(sourcePath, destPath);
      
      logger.info(`✅ Fichier copié: ${sourcePath} → ${destPath}`);
      return true;
    } catch (error) {
      logger.error('❌ Erreur copie fichier:', error);
      throw error;
    }
  }

  /**
   * Nettoyer les fichiers temporaires (> 24h)
   */
  async cleanTempFiles() {
    try {
      const tempFolder = path.join(this.baseStoragePath, this.folders.temp);
      const files = await fs.readdir(tempFolder, { withFileTypes: true });
      const now = Date.now();
      const maxAge = 24 * 60 * 60 * 1000; // 24 heures
      let cleaned = 0;

      for (const file of files) {
        const filePath = path.join(tempFolder, file.name);
        const stats = await fs.stat(filePath);
        
        if (now - stats.mtimeMs > maxAge) {
          await this.deleteFile(filePath);
          cleaned++;
        }
      }

      if (cleaned > 0) {
        logger.info(`✅ ${cleaned} fichiers temporaires nettoyés`);
      }
      
      return cleaned;
    } catch (error) {
      logger.error('❌ Erreur nettoyage fichiers temp:', error);
      return 0;
    }
  }
}

const fileStorageService = new FileStorageService();
export { fileStorageService };
export default fileStorageService;
