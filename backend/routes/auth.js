import express from 'express';

const router = express.Router();

/**
 * Routes d'authentification (à implémenter)
 */

router.post('/register', (req, res) => {
  res.status(501).json({ 
    success: false, 
    error: 'Authentication not yet implemented' 
  });
});

router.post('/login', (req, res) => {
  res.status(501).json({ 
    success: false, 
    error: 'Authentication not yet implemented' 
  });
});

export default router;
