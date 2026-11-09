import express from 'express';
import { body, validationResult } from 'express-validator';
import authService from '../services/authService.js';
import { logger } from '../utils/logger.js';
import { authenticateToken } from '../middleware/auth.js';
import { User } from '../models/index.sequelize.js';

const router = express.Router();

/**
 * @route   POST /api/auth/register
 * @desc    Inscrire un nouvel utilisateur
 * @access  Public
 */
router.post(
  '/register',
  [
    body('email')
      .isEmail()
      .withMessage('Email invalide')
      .normalizeEmail(),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Le mot de passe doit contenir au moins 8 caractères')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre'),
    body('name')
      .trim()
      .isLength({ min: 2 })
      .withMessage('Le nom doit contenir au moins 2 caractères')
  ],
  async (req, res) => {
    try {
      // Vérifier les erreurs de validation
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        logger.error('❌ Registration validation errors:', errors.array());
        return res.status(400).json({
          success: false,
          error: 'Validation error',
          errors: errors.array()
        });
      }

      const { email, password, name } = req.body;

      const result = await authService.register({ email, password, name });

      res.status(201).json(result);
    } catch (error) {
      logger.error('❌ Registration route error:', error);
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }
);

/**
 * @route   POST /api/auth/verify-email
 * @desc    Vérifier l'email avec le code
 * @access  Public
 */
router.post('/verify-email', async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({
        success: false,
        error: 'Email et code de vérification requis'
      });
    }

    const result = await authService.verifyEmail(email, code);

    res.status(200).json(result);
  } catch (error) {
    logger.error('❌ Email verification route error:', error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route   POST /api/auth/login
 * @desc    Connexion utilisateur
 * @access  Public
 */
router.post(
  '/login',
  [
    body('email')
      .isEmail()
      .withMessage('Email invalide')
      .normalizeEmail(),
    body('password')
      .notEmpty()
      .withMessage('Mot de passe requis')
  ],
  async (req, res) => {
    try {
      // Vérifier les erreurs de validation
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array()
        });
      }

      const { email, password } = req.body;

      const result = await authService.login(email, password);

      res.status(200).json(result);
    } catch (error) {
      logger.error('❌ Login route error:', error);
      res.status(401).json({
        success: false,
        error: error.message
      });
    }
  }
);

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Demander une réinitialisation de mot de passe
 * @access  Public
 */
router.post(
  '/forgot-password',
  [
    body('email')
      .isEmail()
      .withMessage('Email invalide')
      .normalizeEmail()
  ],
  async (req, res) => {
    try {
      // Vérifier les erreurs de validation
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array()
        });
      }

      const { email } = req.body;

      const result = await authService.requestPasswordReset(email);

      res.status(200).json(result);
    } catch (error) {
      logger.error('❌ Forgot password route error:', error);
      res.status(500).json({
        success: false,
        error: 'Erreur lors de la demande de réinitialisation'
      });
    }
  }
);

/**
 * @route   POST /api/auth/reset-password
 * @desc    Réinitialiser le mot de passe
 * @access  Public
 */
router.post(
  '/reset-password',
  [
    body('token')
      .notEmpty()
      .withMessage('Token requis'),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Le mot de passe doit contenir au moins 8 caractères')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre')
  ],
  async (req, res) => {
    try {
      // Vérifier les erreurs de validation
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array()
        });
      }

      const { token, password } = req.body;

      const result = await authService.resetPassword(token, password);

      res.status(200).json(result);
    } catch (error) {
      logger.error('❌ Reset password route error:', error);
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }
);

/**
 * @route   GET /auth/me
 * @desc    Récupérer les informations de l'utilisateur connecté
 * @access  Private
 */
router.get('/me', authenticateToken, async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        error: 'Non authentifié'
      });
    }

    const user = await User.findOne({
      where: { id: req.user.id },
      attributes: ['id', 'email', 'name', 'role', 'creditsBalance', 'emailVerified']
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Utilisateur non trouvé'
      });
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        creditsBalance: user.creditsBalance,
        emailVerified: user.emailVerified
      }
    });
  } catch (error) {
    logger.error('❌ /me route error:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur serveur'
    });
  }
});

export default router;
