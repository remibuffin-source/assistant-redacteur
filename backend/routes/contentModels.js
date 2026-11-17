import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { uploadSingle } from '../middleware/upload.js';
import {
  createContentModel,
  getContentModels,
  getContentModel,
  updateContentModel,
  deleteContentModel,
  uploadFileToModel,
  deleteFileFromModel
} from '../controllers/contentModelController.js';

const router = express.Router();

/**
 * Routes pour les modèles de contenu (éditeur)
 * Base: /api/content-models
 */

// Toutes les routes nécessitent une authentification
router.use(authenticateToken);

// CRUD modèles
router.post('/', createContentModel);
router.get('/', getContentModels);
router.get('/:id', getContentModel);
router.put('/:id', updateContentModel);
router.delete('/:id', deleteContentModel);

// Gestion des fichiers
router.post('/:id/files', uploadSingle('file'), uploadFileToModel);
router.delete('/:id/files/:fileId', deleteFileFromModel);

export default router;
