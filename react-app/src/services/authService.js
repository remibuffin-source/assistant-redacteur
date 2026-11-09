import { emailService } from './emailService';

// URL de l'API d'authentification
const AUTH_API_URL = import.meta.env.VITE_API_URL 
  ? `${import.meta.env.VITE_API_URL}/auth`
  : 'http://localhost:4000/auth';

// Service d'authentification avec DynamoDB
class AuthService {
  constructor() {
    // Plus besoin d'initialiser le compte admin, il sera créé manuellement dans DynamoDB si nécessaire
  }

  // Méthodes utilitaires conservées pour compatibilité

  // Valider la force d'un mot de passe
  validatePasswordStrength(password) {
    const errors = [];

    if (password.length < 8) {
      errors.push('Le mot de passe doit contenir au moins 8 caractères');
    }

    if (!/(?=.*[a-z])/.test(password)) {
      errors.push('Le mot de passe doit contenir au moins une minuscule');
    }

    if (!/(?=.*[A-Z])/.test(password)) {
      errors.push('Le mot de passe doit contenir au moins une majuscule');
    }

    if (!/(?=.*\d)/.test(password)) {
      errors.push('Le mot de passe doit contenir au moins un chiffre');
    }

    if (!/(?=.*[@$!%*?&])/.test(password)) {
      errors.push('Le mot de passe doit contenir au moins un caractère spécial (@$!%*?&)');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Générer un token sécurisé
  generateToken() {
    return 'token_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  // Générer un code de vérification par email
  generateVerificationCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Vérifier si un email existe déjà (géré par la Lambda)
  emailExists(email) {
    return false; // La Lambda vérifiera
  }

  // Inscrire un nouvel utilisateur
  async register(userData) {
    const { email, password, firstName, lastName, company, phone } = userData;

    // Validation des données
    if (!email || !password || !firstName || !lastName) {
      throw new Error('Tous les champs obligatoires doivent être remplis');
    }

    // Validation de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error('Format d\'email invalide');
    }

    // Validation du mot de passe
    const passwordValidation = this.validatePasswordStrength(password);
    if (!passwordValidation.isValid) {
      throw new Error(passwordValidation.errors.join('. '));
    }

    try {
      // Appeler l'API pour créer l'utilisateur
      const response = await fetch(`${AUTH_API_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ 
          email, 
          password, 
          name: `${firstName} ${lastName}` 
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de l\'inscription');
      }

      // L'email de vérification est envoyé automatiquement par le backend
      return {
        success: true,
        message: data.message || 'Compte créé avec succès. Vérifiez votre email pour confirmer votre inscription.',
        userId: data.userId,
        requiresVerification: true
      };
    } catch (error) {
      console.error('Erreur register:', error);
      throw error;
    }
  }

  // Vérifier le code de confirmation par email
  async verifyEmailCode(email, code) {
    try {
      const response = await fetch(`${AUTH_API_URL}/verify-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Code incorrect');
      }

      return data;
    } catch (error) {
      console.error('Erreur verifyEmailCode:', error);
      throw error;
    }
  }

  // Connecter un utilisateur
  async login(email, password) {
    try {
      const response = await fetch(`${AUTH_API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur de connexion');
      }

      // Stocker l'utilisateur et le token en localStorage
      localStorage.setItem('currentUser', JSON.stringify(data.user));
      localStorage.setItem('token', data.token);
      localStorage.setItem('authToken', data.token);

      return {
        success: true,
        user: data.user,
        token: data.token
      };
    } catch (error) {
      console.error('Erreur login:', error);
      throw error;
    }
  }

  // Vérifier la validité d'un token de session
  verifyToken(token) {
    // Récupérer l'utilisateur depuis localStorage
    const userStr = localStorage.getItem('currentUser');
    return userStr ? JSON.parse(userStr) : null;
  }

  // Déconnecter un utilisateur
  logout(token) {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('authToken');
  }

  // Méthodes de nettoyage (plus nécessaires avec DynamoDB)
  cleanupExpiredSessions() {
    return 0;
  }

  cleanupExpiredVerifications() {
    return 0;
  }

  // Demander une réinitialisation de mot de passe
  async requestPasswordReset(email) {
    try {
      const response = await fetch(`${AUTH_API_URL}/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la réinitialisation');
      }

      // Le backend envoie déjà l'email, pas besoin de le faire côté frontend
      return data;
    } catch (error) {
      console.error('Erreur requestPasswordReset:', error);
      throw error;
    }
  }

  // Vérifier le code de réinitialisation (géré par la Lambda)
  verifyResetCode(email, code) {
    return { success: true };
  }

  // Réinitialiser le mot de passe
  async resetPassword(email, code, newPassword) {
    // Valider le nouveau mot de passe
    const passwordValidation = this.validatePasswordStrength(newPassword);
    if (!passwordValidation.isValid) {
      throw new Error(passwordValidation.errors.join('. '));
    }

    try {
      const response = await fetch(`${AUTH_API_URL}/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: code, password: newPassword })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la réinitialisation');
      }

      return data;
    } catch (error) {
      console.error('Erreur resetPassword:', error);
      throw error;
    }
  }
}

// Exporter une instance singleton
export const authService = new AuthService();
export default authService;
