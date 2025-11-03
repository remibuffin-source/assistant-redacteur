import express from 'express';

const router = express.Router();

/**
 * Routes analytics (à implémenter)
 */

router.get('/', (req, res) => {
  res.status(501).json({ 
    success: false, 
    error: 'Analytics routes not yet implemented' 
  });
});

export default router;
