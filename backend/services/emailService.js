import nodemailer from 'nodemailer';
import { logger } from '../utils/logger.js';

/**
 * Service d'envoi d'emails via Gmail
 * Utilise nodemailer avec SMTP Gmail
 */
class EmailService {
  constructor() {
    this.transporter = null;
    this.initialized = false;
  }

  /**
   * Initialiser le transporteur nodemailer
   */
  async initialize() {
    try {
      // Vérifier que les variables d'environnement sont définies
      if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
        throw new Error('SMTP credentials not configured. Please set SMTP_USER and SMTP_PASS in .env');
      }

      // Créer le transporteur
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT) || 587,
        secure: false, // true pour 465, false pour autres ports
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        },
        tls: {
          rejectUnauthorized: false
        }
      });

      // Vérifier la connexion
      await this.transporter.verify();
      this.initialized = true;
      logger.info('✅ Email service initialized successfully');
      
      return true;
    } catch (error) {
      logger.error('❌ Failed to initialize email service:', error);
      throw error;
    }
  }

  /**
   * Envoyer un email
   * @param {Object} options - Options d'envoi
   * @param {string|string[]} options.to - Destinataire(s)
   * @param {string} options.subject - Sujet de l'email
   * @param {string} options.text - Contenu texte
   * @param {string} options.html - Contenu HTML (optionnel)
   * @param {string} options.from - Expéditeur (optionnel, utilise SMTP_USER par défaut)
   * @returns {Promise<Object>} - Résultat de l'envoi
   */
  async sendEmail({ to, subject, text, html, from }) {
    try {
      // Initialiser si pas encore fait
      if (!this.initialized) {
        await this.initialize();
      }

      // Préparer les destinataires
      const recipients = Array.isArray(to) ? to.join(', ') : to;

      // Préparer l'expéditeur
      const sender = from || `Assistant Rédacteur <${process.env.SMTP_USER}>`;

      // Options de l'email
      const mailOptions = {
        from: sender,
        to: recipients,
        subject: subject,
        text: text
      };

      // Ajouter le HTML si fourni
      if (html) {
        mailOptions.html = html;
      }

      // Envoyer l'email
      const info = await this.transporter.sendMail(mailOptions);

      logger.info(`✅ Email sent successfully to ${recipients}`, {
        messageId: info.messageId,
        response: info.response
      });

      return {
        success: true,
        messageId: info.messageId,
        response: info.response
      };
    } catch (error) {
      logger.error('❌ Failed to send email:', error);
      throw error;
    }
  }

  /**
   * Envoyer un email avec le contenu de l'éditeur
   * @param {Object} options - Options d'envoi
   * @param {string|string[]} options.to - Destinataire(s)
   * @param {string} options.subject - Sujet de l'email
   * @param {string} options.htmlContent - Contenu HTML de l'éditeur
   * @param {string} options.textContent - Contenu texte (fallback)
   * @returns {Promise<Object>} - Résultat de l'envoi
   */
  async sendEditorContent({ to, subject, htmlContent, textContent }) {
    try {
      // Créer le HTML complet avec template
      const fullHtml = this.createEmailTemplate(htmlContent, subject);

      // Envoyer l'email
      return await this.sendEmail({
        to,
        subject,
        text: textContent,
        html: fullHtml
      });
    } catch (error) {
      logger.error('❌ Failed to send editor content:', error);
      throw error;
    }
  }

  /**
   * Créer un template HTML pour l'email
   * @param {string} content - Contenu HTML
   * @param {string} title - Titre
   * @returns {string} - HTML complet
   */
  createEmailTemplate(content, title) {
    return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f5f5f5;
    }
    .email-container {
      background-color: #ffffff;
      padding: 30px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .email-content {
      margin-bottom: 30px;
    }
    .email-footer {
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #e0e0e0;
      font-size: 12px;
      color: #666;
      text-align: center;
    }
    .email-content h1, .email-content h2, .email-content h3 {
      margin-top: 20px;
      margin-bottom: 10px;
    }
    .email-content p {
      margin-bottom: 15px;
    }
    .email-content ul, .email-content ol {
      margin-bottom: 15px;
      padding-left: 30px;
    }
    .email-content li {
      margin-bottom: 5px;
    }
    .email-content img {
      max-width: 100%;
      height: auto;
      border-radius: 4px;
    }
    .email-content a {
      color: #007bff;
      text-decoration: none;
    }
    .email-content a:hover {
      text-decoration: underline;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="email-content">
      ${content}
    </div>
    <div class="email-footer">
      <p>Cet email a été envoyé via <strong>Assistant Rédacteur</strong></p>
      <p style="font-size: 11px; color: #999;">
        Ceci est un email automatique, merci de ne pas y répondre directement.
      </p>
    </div>
  </div>
</body>
</html>
    `.trim();
  }
}

// Exporter une instance unique (singleton)
const emailService = new EmailService();

export default emailService;
