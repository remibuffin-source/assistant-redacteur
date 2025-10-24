import express from 'express';
import { body, validationResult } from 'express-validator';
import emailService from '../services/emailService.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

/**
 * @route   POST /api/email/send
 * @desc    Envoyer un email avec le contenu de l'éditeur
 * @access  Public (peut être protégé avec authentification si nécessaire)
 */
router.post(
  '/send',
  [
    body('to')
      .notEmpty()
      .withMessage('Le destinataire est requis')
      .custom((value) => {
        // Accepter une chaîne ou un tableau
        if (typeof value === 'string') {
          // Vérifier que c'est un email valide ou plusieurs séparés par des virgules
          const emails = value.split(',').map(e => e.trim());
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          return emails.every(email => emailRegex.test(email));
        } else if (Array.isArray(value)) {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          return value.every(email => emailRegex.test(email));
        }
        return false;
      })
      .withMessage('Format d\'email invalide'),
    body('subject')
      .notEmpty()
      .withMessage('Le sujet est requis')
      .isLength({ max: 200 })
      .withMessage('Le sujet ne peut pas dépasser 200 caractères'),
    body('htmlContent')
      .notEmpty()
      .withMessage('Le contenu HTML est requis'),
    body('textContent')
      .optional()
      .isString()
      .withMessage('Le contenu texte doit être une chaîne de caractères')
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

      const { to, subject, htmlContent, textContent } = req.body;

      // Convertir "to" en tableau si c'est une chaîne avec des virgules
      let recipients = to;
      if (typeof to === 'string' && to.includes(',')) {
        recipients = to.split(',').map(e => e.trim());
      }

      logger.info(`📧 Sending email to: ${Array.isArray(recipients) ? recipients.join(', ') : recipients}`);

      // Envoyer l'email
      const result = await emailService.sendEditorContent({
        to: recipients,
        subject,
        htmlContent,
        textContent: textContent || 'Veuillez consulter la version HTML de cet email.'
      });

      // Réponse de succès
      res.status(200).json({
        success: true,
        message: 'Email envoyé avec succès',
        messageId: result.messageId
      });

    } catch (error) {
      logger.error('❌ Error sending email:', error);

      // Gérer les erreurs spécifiques
      if (error.code === 'EAUTH') {
        return res.status(500).json({
          success: false,
          error: 'Erreur d\'authentification SMTP. Vérifiez les identifiants.',
          details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
      }

      if (error.code === 'ECONNECTION') {
        return res.status(500).json({
          success: false,
          error: 'Impossible de se connecter au serveur SMTP.',
          details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
      }

      // Erreur générique
      res.status(500).json({
        success: false,
        error: 'Erreur lors de l\'envoi de l\'email',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
);

/**
 * @route   POST /api/email/send-email
 * @desc    Envoyer un email générique (pour authentification, etc.)
 * @access  Public
 */
router.post('/send-email', async (req, res) => {
  try {
    const { to, subject, html } = req.body;

    if (!to || !subject || !html) {
      return res.status(400).json({
        success: false,
        error: 'Paramètres manquants (to, subject, html requis)'
      });
    }

    logger.info(`📧 Sending generic email to: ${to}`);

    // Envoyer l'email
    const result = await emailService.sendEmail({
      to,
      subject,
      html,
      text: 'Veuillez consulter la version HTML de cet email.'
    });

    res.status(200).json({
      success: true,
      message: 'Email envoyé avec succès',
      messageId: result.messageId
    });

  } catch (error) {
    logger.error('❌ Error sending generic email:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de l\'envoi de l\'email',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route   GET /api/email/test
 * @desc    Tester la configuration email
 * @access  Public (devrait être protégé en production)
 */
router.get('/test', async (req, res) => {
  try {
    await emailService.initialize();
    res.status(200).json({
      success: true,
      message: 'Configuration email valide'
    });
  } catch (error) {
    logger.error('❌ Email configuration test failed:', error);
    res.status(500).json({
      success: false,
      error: 'Configuration email invalide',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

export default router;
