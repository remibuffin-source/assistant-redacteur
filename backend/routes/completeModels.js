import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { uploadSingle } from '../middleware/upload.js';
import {
  createCompleteModel,
  getCompleteModels,
  getCompleteModel,
  updateCompleteModel,
  toggleFavorite,
  deleteCompleteModel,
  uploadFileToModel,
  deleteFileFromModel
} from '../controllers/completeModelController.js';

const router = express.Router();

/**
 * Routes pour les modèles complets (Home)
 * Base: /api/complete-models
 */

// Toutes les routes nécessitent une authentification
router.use(authenticateToken);

// CRUD modèles complets
router.post('/', createCompleteModel);
router.get('/', getCompleteModels);
router.get('/:id', getCompleteModel);
router.put('/:id', updateCompleteModel);
router.patch('/:id/favorite', toggleFavorite);
router.delete('/:id', deleteCompleteModel);

// Gestion des fichiers
router.post('/:id/files', uploadSingle('file'), uploadFileToModel);
router.delete('/:id/files/:fileId', deleteFileFromModel);

export default router;
