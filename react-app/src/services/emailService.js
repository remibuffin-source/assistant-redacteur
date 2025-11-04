// Service d'envoi d'emails
// Note: En production, ce service doit être appelé depuis un backend Node.js
// Pour le développement, on simule l'envoi avec affichage du code

class EmailService {
  constructor() {
    // Configuration email (à personnaliser en production)
    this.config = {
      // Pour Gmail (exemple)
      service: 'gmail',
      auth: {
        user: import.meta.env.VITE_EMAIL_USER || '', // Votre email
        pass: import.meta.env.VITE_EMAIL_PASSWORD || '' // Mot de passe d'application Gmail
      }
    };

    // Mode développement : afficher les codes au lieu d'envoyer
    // Changez en false pour activer l'envoi d'emails réels
    // Production : utilise VITE_EMAIL_SERVER_URL pour se connecter au serveur email
    this.isDevelopment = false; // false = envoi réel via serveur Node.js, true = simulation
  }

  // Envoyer un email de vérification d'inscription
  async sendVerificationEmail(email, code, userName) {
    const subject = '🔐 Vérifiez votre compte - Assistant Rédactionnel';
    const html = this.getVerificationEmailTemplate(code, userName);
    
    return this.sendEmail(email, subject, html, code);
  }

  // Envoyer un email de réinitialisation de mot de passe
  async sendPasswordResetEmail(email, code, userName) {
    const subject = '🔑 Réinitialisation de votre mot de passe - Assistant Rédactionnel';
    const html = this.getPasswordResetEmailTemplate(code, userName);
    
    return this.sendEmail(email, subject, html, code);
  }

  // Fonction générique d'envoi d'email
  async sendEmail(to, subject, html, code = null) {
    // En développement : simuler l'envoi
    if (this.isDevelopment) {
      console.log('📧 ========================================');
      console.log(`📧 EMAIL SIMULÉ (Mode Développement)`);
      console.log(`📧 ========================================`);
      console.log(`📧 À: ${to}`);
      console.log(`📧 Sujet: ${subject}`);
      if (code) {
        console.log(`📧 Code de vérification: ${code}`);
      }
      console.log('📧 ========================================');

      return {
        success: true,
        message: 'Email simulé en mode développement',
        code: code, // Retourner le code pour l'afficher dans l'interface
        isDevelopment: true
      };
    }

    // En production : envoyer réellement l'email
    try {
      // Appel au serveur email (local ou Lambda)
      const emailServerUrl = import.meta.env.VITE_EMAIL_SERVER_URL || 'http://localhost:3001';
      
      // Vérification uniquement pour le mode local (sans VITE_EMAIL_SERVER_URL)
      if (!emailServerUrl.includes('amazonaws.com') && (!this.config.auth.user || !this.config.auth.pass)) {
        throw new Error('Configuration email manquante. Veuillez configurer VITE_EMAIL_USER et VITE_EMAIL_PASSWORD pour le développement local');
      }

      // Appel à l'API email (Lambda en production, serveur local en dev)
      // Lambda n'a pas besoin du /api/send-email, il gère tout à la racine
      const endpoint = emailServerUrl.includes('amazonaws.com') 
        ? emailServerUrl 
        : `${emailServerUrl}/api/send-email`;
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to,
          subject,
          html
        })
      });

      if (!response.ok) {
        throw new Error('Erreur lors de l\'envoi de l\'email');
      }

      const result = await response.json();

      return {
        success: true,
        message: 'Email envoyé avec succès',
        isDevelopment: false
      };
    } catch (error) {
      console.error('Erreur envoi email:', error);
      
      // En cas d'erreur en production, afficher quand même le code
      return {
        success: true,
        message: 'Email non envoyé (erreur serveur), code affiché ci-dessous',
        code: code,
        error: error.message,
        isDevelopment: false
      };
    }
  }

  // Template HTML pour email de vérification
  getVerificationEmailTemplate(code, userName) {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      background-color: #f4f4f4;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 40px auto;
      background: white;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
    .header {
      background: linear-gradient(135deg, #ff6b35 0%, #ff8c5a 100%);
      padding: 40px 20px;
      text-align: center;
      color: white;
    }
    .header h1 {
      margin: 0;
      font-size: 28px;
      font-weight: 600;
    }
    .content {
      padding: 40px 30px;
    }
    .code-box {
      background: linear-gradient(135deg, #ff6b35 0%, #ff8c5a 100%);
      border-radius: 12px;
      padding: 30px;
      text-align: center;
      margin: 30px 0;
    }
    .code {
      background: white;
      color: #ff6b35;
      font-size: 36px;
      font-weight: 700;
      letter-spacing: 8px;
      padding: 20px;
      border-radius: 8px;
      font-family: 'Courier New', monospace;
    }
    .footer {
      background: #f8f8f8;
      padding: 20px;
      text-align: center;
      font-size: 14px;
      color: #666;
    }
    .button {
      display: inline-block;
      background: #ff6b35;
      color: white;
      padding: 12px 30px;
      border-radius: 8px;
      text-decoration: none;
      font-weight: 600;
      margin: 20px 0;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🔐 Vérification de votre compte</h1>
    </div>
    <div class="content">
      <p>Bonjour ${userName || 'cher utilisateur'},</p>
      <p>Merci de vous être inscrit sur <strong>Assistant Rédactionnel</strong> !</p>
      <p>Pour activer votre compte, veuillez utiliser le code de vérification ci-dessous :</p>
      
      <div class="code-box">
        <div class="code">${code}</div>
      </div>
      
      <p style="text-align: center; color: #666; font-size: 14px;">
        Ce code est valide pendant <strong>15 minutes</strong>
      </p>
      
      <p>Si vous n'avez pas créé de compte, vous pouvez ignorer cet email.</p>
      
      <p>Cordialement,<br>L'équipe Studio du Cap Brun</p>
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} Studio du Cap Brun - Assistant Rédactionnel</p>
      <p>Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
    </div>
  </div>
</body>
</html>
    `;
  }

  // Template HTML pour email de réinitialisation
  getPasswordResetEmailTemplate(code, userName) {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      background-color: #f4f4f4;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 40px auto;
      background: white;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
    .header {
      background: linear-gradient(135deg, #ff6b35 0%, #ff8c5a 100%);
      padding: 40px 20px;
      text-align: center;
      color: white;
    }
    .header h1 {
      margin: 0;
      font-size: 28px;
      font-weight: 600;
    }
    .content {
      padding: 40px 30px;
    }
    .code-box {
      background: linear-gradient(135deg, #ff6b35 0%, #ff8c5a 100%);
      border-radius: 12px;
      padding: 30px;
      text-align: center;
      margin: 30px 0;
    }
    .code {
      background: white;
      color: #ff6b35;
      font-size: 36px;
      font-weight: 700;
      letter-spacing: 8px;
      padding: 20px;
      border-radius: 8px;
      font-family: 'Courier New', monospace;
    }
    .footer {
      background: #f8f8f8;
      padding: 20px;
      text-align: center;
      font-size: 14px;
      color: #666;
    }
    .warning {
      background: #fff3cd;
      border-left: 4px solid #ffc107;
      padding: 15px;
      margin: 20px 0;
      border-radius: 4px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🔑 Réinitialisation de mot de passe</h1>
    </div>
    <div class="content">
      <p>Bonjour ${userName || 'cher utilisateur'},</p>
      <p>Vous avez demandé la réinitialisation de votre mot de passe sur <strong>Assistant Rédactionnel</strong>.</p>
      <p>Utilisez le code ci-dessous pour créer un nouveau mot de passe :</p>
      
      <div class="code-box">
        <div class="code">${code}</div>
      </div>
      
      <p style="text-align: center; color: #666; font-size: 14px;">
        Ce code est valide pendant <strong>15 minutes</strong>
      </p>
      
      <div class="warning">
        <strong>⚠️ Attention :</strong> Si vous n'avez pas demandé cette réinitialisation, ignorez cet email et votre mot de passe restera inchangé.
      </div>
      
      <p>Cordialement,<br>L'équipe Studio du Cap Brun</p>
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} Studio du Cap Brun - Assistant Rédactionnel</p>
      <p>Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
    </div>
  </div>
</body>
</html>
    `;
  }
}

// Exporter une instance singleton
export const emailService = new EmailService();
export default emailService;
