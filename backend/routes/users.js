import express from 'express';

const router = express.Router();

/**
 * Routes utilisateurs (à implémenter)
 */

router.get('/', (req, res) => {
  res.status(501).json({ 
    success: false, 
    error: 'User routes not yet implemented' 
  });
});

export default router;
