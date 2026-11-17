import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { User, sequelize } from '../models/index.sequelize.js';
import emailService from './emailService.js';
import { logger } from '../utils/logger.js';

/**
 * Service d'authentification
 */
class AuthService {
  /**
   * Générer un token de vérification email
   */
  generateVerificationToken() {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Générer un token JWT
   */
  generateJWT(userId, email) {
    const token = jwt.sign(
      { userId, email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '30d' }
    );

    const refreshToken = jwt.sign(
      { userId, email },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: process.env.JWT_REFRESH_EXPIRE || '90d' }
    );

    return { token, refreshToken };
  }

  /**
   * Inscrire un nouvel utilisateur
   */
  async register({ email, password, name }) {
    try {
      // Vérifier si l'utilisateur existe déjà
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        throw new Error('Un compte existe déjà avec cet email');
      }

      // Hasher le mot de passe
      const hashedPassword = await bcrypt.hash(
        password,
        parseInt(process.env.BCRYPT_ROUNDS) || 12
      );

      // Générer un code de vérification à 6 chiffres
      const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

      // Créer l'utilisateur avec requête SQL directe pour contourner le bug Sequelize
      logger.info(`💾 Creating user with SQL query...`);
      const [result] = await sequelize.query(
        'INSERT INTO users (email, password, name, emailVerified, emailVerificationToken, role, creditsBalance, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())',
        {
          replacements: [email, hashedPassword, name, false, verificationCode, 'user', 0],
          type: sequelize.QueryTypes.INSERT
        }
      );
      
      const userId = result;
      logger.info(`✅ User created with ID: ${userId}, verification code: ${verificationCode}`);

      // Envoyer l'email de vérification
      await this.sendVerificationEmail(email, verificationCode, name);

      logger.info(`✅ New user registered: ${email}`);

      return {
        success: true,
        message: 'Inscription réussie. Veuillez vérifier votre email pour activer votre compte.',
        userId: userId
      };
    } catch (error) {
      logger.error('❌ Registration error:', error);
      throw error;
    }
  }

  /**
   * Envoyer l'email de vérification
   */
  async sendVerificationEmail(email, code, name) {
    const html = `
      <!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Vérification de votre compte</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #f8f9fa; padding: 30px; border-radius: 10px;">
          <h1 style="color: #4a5568; margin-bottom: 20px;">🎉 Bienvenue sur Assistant Rédacteur !</h1>
          
          <p>Bonjour ${name || 'cher utilisateur'},</p>
          
          <p>Merci de vous être inscrit sur <strong>Assistant Rédacteur</strong>.</p>
          <p>Pour activer votre compte, utilisez le code ci-dessous :</p>
          
          <div style="text-align: center; margin: 30px 0; background-color: #fff; padding: 20px; border-radius: 8px; border: 2px dashed #4299e1;">
            <div style="font-size: 32px; font-weight: bold; color: #4299e1; letter-spacing: 5px; font-family: 'Courier New', monospace;">
              ${code}
            </div>
          </div>
          
          <p style="text-align: center; color: #666; font-size: 14px;">
            Ce code est valide pendant <strong>24 heures</strong>
          </p>
          
          <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px;">
            <strong>⚠️ Important :</strong> Ne partagez jamais ce code avec qui que ce soit.
          </div>
          
          <p>Cordialement,<br>L'équipe Studio du Cap Brun</p>
          
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">
          
          <p style="color: #a0aec0; font-size: 12px; text-align: center;">
            © ${new Date().getFullYear()} Studio du Cap Brun - Assistant Rédactionnel<br>
            Si vous n'avez pas créé de compte, vous pouvez ignorer cet email.
          </p>
        </div>
      </body>
      </html>
    `;

    const text = `
Bienvenue sur Assistant Rédacteur !

Bonjour ${name || 'cher utilisateur'},

Merci de vous être inscrit sur Assistant Rédacteur.
Pour activer votre compte, utilisez le code ci-dessous :

CODE: ${code}

Ce code est valide pendant 24 heures.

Important : Ne partagez jamais ce code avec qui que ce soit.

Si vous n'avez pas créé de compte, vous pouvez ignorer cet email.

Cordialement,
L'équipe Studio du Cap Brun
    `;

    await emailService.sendEmail({
      to: email,
      subject: 'Vérification de votre compte - Assistant Rédacteur',
      html,
      text
    });

    logger.info(`📧 Verification email sent to: ${email}`);
  }

  /**
   * Vérifier l'email avec le code
   */
  async verifyEmail(email, code) {
    try {
      const user = await User.findOne({ 
        where: { 
          email,
          emailVerificationToken: code 
        } 
      });

      if (!user) {
        throw new Error('Code de vérification invalide');
      }

      if (user.emailVerified) {
        throw new Error('Email déjà vérifié');
      }

      // Marquer l'email comme vérifié avec requête SQL directe
      logger.info(`💾 Verifying email with SQL query...`);
      await sequelize.query(
        'UPDATE users SET emailVerified = 1, emailVerificationToken = NULL WHERE email = ?',
        {
          replacements: [email],
          type: sequelize.QueryTypes.UPDATE
        }
      );

      // Générer les tokens JWT
      const tokens = this.generateJWT(user.id, user.email);

      logger.info(`✅ Email verified for user: ${user.email}`);

      return {
        success: true,
        message: 'Email vérifié avec succès',
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          creditsBalance: user.creditsBalance
        },
        ...tokens
      };
    } catch (error) {
      logger.error('❌ Email verification error:', error);
      throw error;
    }
  }

  /**
   * Connexion
   */
  async login(email, password) {
    try {
      // Trouver l'utilisateur
      const user = await User.findOne({ where: { email } });

      if (!user) {
        throw new Error('Email ou mot de passe incorrect');
      }

      // Vérifier le mot de passe
      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        throw new Error('Email ou mot de passe incorrect');
      }

      // Vérifier si l'email est vérifié
      if (!user.emailVerified) {
        throw new Error('Veuillez vérifier votre email avant de vous connecter');
      }

      // Générer les tokens JWT
      const tokens = this.generateJWT(user.id, user.email);

      logger.info(`✅ User logged in: ${user.email}`);

      return {
        success: true,
        message: 'Connexion réussie',
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          creditsBalance: user.creditsBalance
        },
        ...tokens
      };
    } catch (error) {
      logger.error('❌ Login error:', error);
      throw error;
    }
  }

  /**
   * Demander une réinitialisation de mot de passe
   */
  async requestPasswordReset(email) {
    try {
      const user = await User.findOne({ where: { email } });

      if (!user) {
        // Ne pas révéler si l'email existe ou non
        return {
          success: true,
          message: 'Si un compte existe avec cet email, vous recevrez un lien de réinitialisation'
        };
      }

      // Générer un code de réinitialisation à 6 chiffres
      const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
      const resetExpires = new Date(Date.now() + 900000); // 15 minutes

      logger.info(`🔑 Generated reset code: ${resetCode} for ${email}`);
      
      // Utiliser une requête SQL directe pour forcer l'enregistrement
      logger.info(`💾 Saving reset token to database with SQL query...`);
      await sequelize.query(
        'UPDATE users SET resetPasswordToken = ?, resetPasswordExpires = ? WHERE email = ?',
        {
          replacements: [resetCode, resetExpires, email],
          type: sequelize.QueryTypes.UPDATE
        }
      );
      logger.info(`✅ Reset token saved successfully via SQL`);

      // Envoyer l'email de réinitialisation avec le code
      await this.sendPasswordResetEmail(email, resetCode, user.name);

      logger.info(`📧 Password reset email sent to: ${email}`);

      return {
        success: true,
        message: 'Si un compte existe avec cet email, vous recevrez un lien de réinitialisation'
      };
    } catch (error) {
      logger.error('❌ Password reset request error:', error);
      throw error;
    }
  }

  /**
   * Envoyer l'email de réinitialisation de mot de passe
   */
  async sendPasswordResetEmail(email, code, name) {
    const html = `
      <!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Réinitialisation de mot de passe</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #f8f9fa; padding: 30px; border-radius: 10px;">
          <h1 style="color: #4a5568; margin-bottom: 20px;">🔑 Réinitialisation de mot de passe</h1>
          
          <p>Bonjour ${name || 'cher utilisateur'},</p>
          
          <p>Vous avez demandé la réinitialisation de votre mot de passe sur <strong>Assistant Rédactionnel</strong>.</p>
          <p>Utilisez le code ci-dessous pour créer un nouveau mot de passe :</p>
          
          <div style="text-align: center; margin: 30px 0; background-color: #fff; padding: 20px; border-radius: 8px; border: 2px dashed #e53e3e;">
            <div style="font-size: 32px; font-weight: bold; color: #e53e3e; letter-spacing: 5px; font-family: 'Courier New', monospace;">
              ${code}
            </div>
          </div>
          
          <p style="text-align: center; color: #666; font-size: 14px;">
            Ce code est valide pendant <strong>15 minutes</strong>
          </p>
          
          <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px;">
            <strong>⚠️ Attention :</strong> Si vous n'avez pas demandé cette réinitialisation, ignorez cet email et votre mot de passe restera inchangé.
          </div>
          
          <p>Cordialement,<br>L'équipe Studio du Cap Brun</p>
          
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">
          
          <p style="color: #a0aec0; font-size: 12px; text-align: center;">
            © ${new Date().getFullYear()} Studio du Cap Brun - Assistant Rédactionnel<br>
            Cet email a été envoyé automatiquement, merci de ne pas y répondre.
          </p>
        </div>
      </body>
      </html>
    `;

    const text = `
Réinitialisation de mot de passe

Bonjour ${name || 'cher utilisateur'},

Vous avez demandé la réinitialisation de votre mot de passe sur Assistant Rédactionnel.
Utilisez le code ci-dessous pour créer un nouveau mot de passe :

CODE: ${code}

Ce code est valide pendant 15 minutes.

Si vous n'avez pas demandé cette réinitialisation, ignorez cet email et votre mot de passe restera inchangé.

Cordialement,
L'équipe Studio du Cap Brun
    `;

    await emailService.sendEmail({
      to: email,
      subject: 'Réinitialisation de mot de passe - Assistant Rédacteur',
      html,
      text
    });
  }

  /**
   * Réinitialiser le mot de passe
   */
  async resetPassword(token, newPassword) {
    try {
      const user = await User.findOne({
        where: {
          resetPasswordToken: token
        }
      });

      if (!user) {
        throw new Error('Token de réinitialisation invalide ou expiré');
      }

      // Vérifier si le token n'est pas expiré
      if (user.resetPasswordExpires < new Date()) {
        throw new Error('Token de réinitialisation expiré');
      }

      // Hasher le nouveau mot de passe
      const hashedPassword = await bcrypt.hash(
        newPassword,
        parseInt(process.env.BCRYPT_ROUNDS) || 12
      );

      // Mettre à jour le mot de passe avec une requête SQL directe
      logger.info(`💾 Updating password with SQL query...`);
      await sequelize.query(
        'UPDATE users SET password = ?, resetPasswordToken = NULL, resetPasswordExpires = NULL WHERE id = ?',
        {
          replacements: [hashedPassword, user.id],
          type: sequelize.QueryTypes.UPDATE
        }
      );

      logger.info(`✅ Password reset for user: ${user.email}`);

      return {
        success: true,
        message: 'Mot de passe réinitialisé avec succès'
      };
    } catch (error) {
      logger.error('❌ Password reset error:', error);
      throw error;
    }
  }
}

// Exporter une instance unique (singleton)
const authService = new AuthService();

export default authService;
