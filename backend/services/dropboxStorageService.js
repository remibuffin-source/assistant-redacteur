import { logger } from '../utils/logger.js';

class DropboxStorageService {
  constructor() {
    this.isConfigured = false;
    logger.warn('Dropbox storage service - mode désactivé (DROPBOX_ACCESS_TOKEN manquant)');
  }
  
  checkConfiguration() {
    if (!this.isConfigured) {
      throw new Error('Dropbox storage not configured. Set DROPBOX_ACCESS_TOKEN in .env');
    }
  }
  
  async uploadFile() { this.checkConfiguration(); }
  async listFiles() { this.checkConfiguration(); }
  async downloadFile() { this.checkConfiguration(); }
  async deleteFile() { this.checkConfiguration(); }
}

const dropboxStorageService = new DropboxStorageService();
export { dropboxStorageService };
export default dropboxStorageService;