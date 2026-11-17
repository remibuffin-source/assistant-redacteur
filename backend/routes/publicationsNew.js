import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { uploadSingle } from '../middleware/upload.js';
import {
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
} from '../controllers/publicationController.js';

const router = express.Router();

/**
 * Routes pour les publications
 * Base: /api/publications
 */

// Toutes les routes nécessitent une authentification
router.use(authenticateToken);

// CRUD publications
router.post('/', createPublication);
router.get('/', getPublications);
router.get('/stats', getPublicationStats);
router.get('/:id', getPublication);
router.put('/:id', updatePublication);
router.patch('/:id/status', updatePublicationStatus);
router.patch('/:id/reschedule', reschedulePublication);
router.delete('/:id', deletePublication);

// Gestion des fichiers
router.post('/:id/files', uploadSingle('file'), uploadFileToPublication);
router.delete('/:id/files/:fileId', deleteFileFromPublication);

export default router;
