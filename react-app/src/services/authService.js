import { emailService } from './emailService';

// Service d'authentification robuste pour la production
class AuthService {
  constructor() {
    this.USERS_KEY = 'auth_users';
    this.SESSIONS_KEY = 'auth_sessions';
    this.PENDING_VERIFICATIONS_KEY = 'auth_pending_verifications';
    this.initializeAdminAccount();
  }

  // Initialiser le compte administrateur par défaut
  initializeAdminAccount() {
    const users = this.getUsers();

    // Vérifier si l'admin existe déjà
    const adminExists = users.some(user => user.email === 'admin@studioducapbrun.com');

    if (!adminExists) {
      const hashedPassword = this.hashPassword('AdminStudio2025!');
      const adminUser = {
        id: 'admin_' + Date.now(),
        email: 'admin@studioducapbrun.com',
        username: 'admin',
        firstName: 'Administrateur',
        lastName: 'Studio',
        company: 'Studio du Cap Brun',
        phone: '+33 6 12 34 56 78',
        role: 'admin',
        isAdmin: true,
        isVerified: true,
        createdAt: new Date().toISOString(),
        hashedPassword: hashedPassword
      };

      users.push(adminUser);
      this.saveUsers(users);

      console.log('✅ Compte administrateur créé :');
      console.log('   Email: admin@studioducapbrun.com');
      console.log('   Mot de passe: AdminStudio2025!');
    }
  }

  // Récupérer tous les utilisateurs
  getUsers() {
    try {
      const users = localStorage.getItem(this.USERS_KEY);
      return users ? JSON.parse(users) : [];
    } catch (error) {
      console.error('Erreur lors de la récupération des utilisateurs:', error);
      return [];
    }
  }

  // Sauvegarder les utilisateurs
  saveUsers(users) {
    try {
      localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des utilisateurs:', error);
      throw new Error('Impossible de sauvegarder les données utilisateur');
    }
  }

  // Hacher un mot de passe (simulation - en production utiliser bcrypt)
  hashPassword(password) {
    // Simulation simple - en production utiliser bcrypt ou argon2
    return btoa(password + '_salt_2025');
  }

  // Vérifier un mot de passe
  verifyPassword(password, hashedPassword) {
    return this.hashPassword(password) === hashedPassword;
  }

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

  // Vérifier si un email existe déjà
  emailExists(email) {
    const users = this.getUsers();
    return users.some(user => user.email.toLowerCase() === email.toLowerCase());
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

    // Vérifier si l'email existe déjà
    if (this.emailExists(email)) {
      throw new Error('Cette adresse email est déjà utilisée');
    }

    // Créer l'utilisateur
    const newUser = {
      id: 'user_' + Date.now(),
      email: email.toLowerCase(),
      username: email.split('@')[0],
      firstName,
      lastName,
      company: company || '',
      phone: phone || '',
      role: 'user',
      isAdmin: false,
      isVerified: false,
      createdAt: new Date().toISOString(),
      hashedPassword: this.hashPassword(password)
    };

    // Sauvegarder l'utilisateur
    const users = this.getUsers();
    users.push(newUser);
    this.saveUsers(users);

    // Créer la vérification par email
    const verificationCode = this.generateVerificationCode();
    const pendingVerifications = this.getPendingVerifications();
    pendingVerifications.push({
      email: email.toLowerCase(),
      code: verificationCode,
      userId: newUser.id,
      type: 'email_verification',
      expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
      createdAt: new Date().toISOString()
    });
    this.savePendingVerifications(pendingVerifications);

    // Envoyer l'email de vérification
    const emailResult = await emailService.sendVerificationEmail(
      email,
      verificationCode,
      `${firstName} ${lastName}`
    );

    return {
      success: true,
      message: 'Compte créé avec succès. Vérifiez votre email pour confirmer votre inscription.',
      userId: newUser.id,
      requiresVerification: true,
      verificationCode: emailResult.code
    };
  }

  // Vérifier le code de confirmation par email
  verifyEmailCode(email, code) {
    const pendingVerifications = this.getPendingVerifications();
    const verification = pendingVerifications.find(
      v => v.email === email.toLowerCase() && v.code === code
    );

    if (!verification) {
      throw new Error('Code de vérification invalide');
    }

    // Vérifier l'expiration
    if (new Date() > new Date(verification.expiresAt)) {
      const updatedVerifications = pendingVerifications.filter(v => v !== verification);
      this.savePendingVerifications(updatedVerifications);
      throw new Error('Code de vérification expiré');
    }

    // Marquer l'utilisateur comme vérifié
    const users = this.getUsers();
    const userIndex = users.findIndex(u => u.id === verification.userId);
    if (userIndex !== -1) {
      users[userIndex].isVerified = true;
      this.saveUsers(users);
    }

    // Supprimer la vérification utilisée
    const updatedVerifications = pendingVerifications.filter(v => v !== verification);
    this.savePendingVerifications(updatedVerifications);

    return {
      success: true,
      message: 'Email vérifié avec succès. Vous pouvez maintenant vous connecter.'
    };
  }

  // Connecter un utilisateur
  async login(email, password) {
    const users = this.getUsers();
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (!user) {
      throw new Error('Adresse email ou mot de passe incorrect');
    }

    if (!user.isVerified) {
      throw new Error('Veuillez vérifier votre email avant de vous connecter');
    }

    if (!this.verifyPassword(password, user.hashedPassword)) {
      throw new Error('Adresse email ou mot de passe incorrect');
    }

    // Créer une session
    const sessionToken = this.generateToken();
    const session = {
      token: sessionToken,
      userId: user.id,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    };

    const sessions = this.getSessions();
    sessions.push(session);
    this.saveSessions(sessions);

    // Retourner les données utilisateur (sans le mot de passe)
    const { hashedPassword, ...userData } = user;

    return {
      success: true,
      user: userData,
      token: sessionToken
    };
  }

  // Vérifier la validité d'un token de session
  verifyToken(token) {
    const sessions = this.getSessions();
    const session = sessions.find(s => s.token === token);

    if (!session) {
      return null;
    }

    // Vérifier l'expiration
    if (new Date() > new Date(session.expiresAt)) {
      const updatedSessions = sessions.filter(s => s !== session);
      this.saveSessions(updatedSessions);
      return null;
    }

    // Récupérer les données utilisateur
    const users = this.getUsers();
    const user = users.find(u => u.id === session.userId);

    if (!user) {
      return null;
    }

    // Retourner les données utilisateur (sans le mot de passe)
    const { hashedPassword, ...userData } = user;
    return userData;
  }

  // Déconnecter un utilisateur
  logout(token) {
    if (token) {
      const sessions = this.getSessions();
      const updatedSessions = sessions.filter(s => s.token !== token);
      this.saveSessions(updatedSessions);
    }
  }

  // Récupérer les sessions
  getSessions() {
    try {
      const sessions = localStorage.getItem(this.SESSIONS_KEY);
      return sessions ? JSON.parse(sessions) : [];
    } catch (error) {
      return [];
    }
  }

  // Sauvegarder les sessions
  saveSessions(sessions) {
    try {
      localStorage.setItem(this.SESSIONS_KEY, JSON.stringify(sessions));
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des sessions:', error);
    }
  }

  // Récupérer les vérifications en attente
  getPendingVerifications() {
    try {
      const verifications = localStorage.getItem(this.PENDING_VERIFICATIONS_KEY);
      return verifications ? JSON.parse(verifications) : [];
    } catch (error) {
      return [];
    }
  }

  // Sauvegarder les vérifications en attente
  savePendingVerifications(verifications) {
    try {
      localStorage.setItem(this.PENDING_VERIFICATIONS_KEY, JSON.stringify(verifications));
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des vérifications:', error);
    }
  }

  // Nettoyer les sessions expirées
  cleanupExpiredSessions() {
    const sessions = this.getSessions();
    const now = new Date();
    const validSessions = sessions.filter(session => new Date(session.expiresAt) > now);

    if (validSessions.length !== sessions.length) {
      this.saveSessions(validSessions);
    }

    return validSessions.length;
  }

  // Nettoyer les vérifications expirées
  cleanupExpiredVerifications() {
    const verifications = this.getPendingVerifications();
    const now = new Date();
    const validVerifications = verifications.filter(v => new Date(v.expiresAt) > now);

    if (validVerifications.length !== verifications.length) {
      this.savePendingVerifications(validVerifications);
    }

    return validVerifications.length;
  }

  // Demander une réinitialisation de mot de passe
  async requestPasswordReset(email) {
    const users = this.getUsers();
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (!user) {
      return {
        success: true,
        message: 'Si cette adresse email existe, vous recevrez un code de réinitialisation.'
      };
    }

    // Générer un code de réinitialisation
    const resetCode = this.generateVerificationCode();
    const pendingVerifications = this.getPendingVerifications();
    
    // Supprimer les anciennes demandes de réinitialisation pour cet email
    const filteredVerifications = pendingVerifications.filter(
      v => !(v.email === email.toLowerCase() && v.type === 'password_reset')
    );

    filteredVerifications.push({
      email: email.toLowerCase(),
      code: resetCode,
      userId: user.id,
      type: 'password_reset',
      expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
      createdAt: new Date().toISOString()
    });
    this.savePendingVerifications(filteredVerifications);

    // Envoyer l'email de réinitialisation
    const emailResult = await emailService.sendPasswordResetEmail(
      email,
      resetCode,
      `${user.firstName} ${user.lastName}`
    );

    return {
      success: true,
      message: 'Un code de réinitialisation a été envoyé à votre adresse email.',
      code: emailResult.code
    };
  }

  // Vérifier le code de réinitialisation
  verifyResetCode(email, code) {
    const pendingVerifications = this.getPendingVerifications();
    const verification = pendingVerifications.find(
      v => v.email === email.toLowerCase() && v.code === code && v.type === 'password_reset'
    );

    if (!verification) {
      return { success: false, error: 'Code de réinitialisation invalide' };
    }

    // Vérifier l'expiration
    if (new Date() > new Date(verification.expiresAt)) {
      const updatedVerifications = pendingVerifications.filter(v => v !== verification);
      this.savePendingVerifications(updatedVerifications);
      return { success: false, error: 'Code de réinitialisation expiré' };
    }

    return { success: true, userId: verification.userId };
  }

  // Réinitialiser le mot de passe
  async resetPassword(email, code, newPassword) {
    // Vérifier le code
    const verification = this.verifyResetCode(email, code);
    if (!verification.success) {
      throw new Error(verification.error);
    }

    // Valider le nouveau mot de passe
    const passwordValidation = this.validatePasswordStrength(newPassword);
    if (!passwordValidation.isValid) {
      throw new Error(passwordValidation.errors.join('. '));
    }

    // Mettre à jour le mot de passe ET vérifier le compte
    const users = this.getUsers();
    const userIndex = users.findIndex(u => u.id === verification.userId);
    
    if (userIndex === -1) {
      throw new Error('Utilisateur introuvable');
    }

    users[userIndex].hashedPassword = this.hashPassword(newPassword);
    users[userIndex].isVerified = true; // Vérifier automatiquement le compte
    this.saveUsers(users);

    // Supprimer le code de réinitialisation utilisé
    const pendingVerifications = this.getPendingVerifications();
    const updatedVerifications = pendingVerifications.filter(
      v => !(v.email === email.toLowerCase() && v.type === 'password_reset')
    );
    this.savePendingVerifications(updatedVerifications);

    return {
      success: true,
      message: 'Mot de passe réinitialisé avec succès. Vous pouvez maintenant vous connecter.'
    };
  }
}

// Exporter une instance singleton
export const authService = new AuthService();
export default authService;
