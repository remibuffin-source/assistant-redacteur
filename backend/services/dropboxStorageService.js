import { Dropbox } from 'dropbox';
import { logger } from '../utils/logger.js';

class DropboxStorageService {
  constructor() {
    const accessToken = process.env.DROPBOX_ACCESS_TOKEN;
    if (!accessToken) {
      logger.warn('DROPBOX_ACCESS_TOKEN non configuré');
      this.dbx = null;
      this.isConfigured = false;
    } else {
      this.dbx = new Dropbox({ accessToken });
      this.isConfigured = true;
      logger.info('Service Dropbox initialisé');
    }
    this.basePath = '/Assistant-Redacteur';
  }
  
  checkConfiguration() {
    if (!this.isConfigured) {
      throw new Error('Dropbox not configured');
    }
  }
  
  getUserPath(userId, folder, filename = '') {
    const path = `${this.basePath}/users/${userId}/${folder}`;
    return filename ? `${path}/${filename}` : path;
  }
  
  async uploadFile(fileContent, userId, folder, filename) {
    this.checkConfiguration();
    const path = this.getUserPath(userId, folder, filename);
    const response = await this.dbx.filesUpload({
      path, contents: fileContent, mode: { '.tag': 'overwrite' }
    });
    return { success: true, path: response.result.path_display, name: response.result.name };
  }
  
  async listFiles(userId, folder = 'uploads') {
    this.checkConfiguration();
    const path = this.getUserPath(userId, folder);
    try { await this.dbx.filesCreateFolderV2({ path }); } catch(e) {}
    const response = await this.dbx.filesListFolder({ path });
    return response.result.entries.map(e => ({ id: e.id, name: e.name, path: e.path_display }));
  }
  
  async downloadFile(path) {
    this.checkConfiguration();
    const response = await this.dbx.filesDownload({ path });
    return { fileBlob: response.result.fileBlob, name: response.result.name };
  }
  
  async deleteFile(path) {
    this.checkConfiguration();
    await this.dbx.filesDeleteV2({ path });
    return { success: true, path };
  }
}

const dropboxStorageService = new DropboxStorageService();
export { dropboxStorageService };
export default dropboxStorageService;
