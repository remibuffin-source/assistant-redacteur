import { DataTypes, Model } from 'sequelize';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { sequelize } from '../config/sequelize.js';

class User extends Model {
  /**
   * Comparer les mots de passe
   */
  async comparePassword(candidatePassword) {
    try {
      return await bcrypt.compare(candidatePassword, this.password);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Générer un token JWT
   */
  generateAuthToken() {
    return jwt.sign(
      {
        id: this.id,
        email: this.email,
        role: this.role
      },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRE || '30d'
      }
    );
  }

  /**
   * Générer un token de rafraîchissement
   */
  generateRefreshToken() {
    return jwt.sign(
      {
        id: this.id
      },
      process.env.JWT_REFRESH_SECRET,
      {
        expiresIn: process.env.JWT_REFRESH_EXPIRE || '90d'
      }
    );
  }

  /**
   * Ajouter des crédits
   */
  async addCredits(amount, type = 'purchase', description = '', metadata = {}) {
    this.creditsBalance += amount;
    this.creditsTotalPurchased += amount;
    
    if (type === 'purchase') {
      this.creditsLastRecharge = new Date();
    }
    
    // Ajouter à l'historique (sera géré par une table séparée CreditHistory)
    await this.save();
    return this.creditsBalance;
  }

  /**
   * Déduire des crédits
   */
  async deductCredits(amount, description = '', relatedTo = null) {
    if (this.creditsBalance < amount) {
      throw new Error('Insufficient credits');
    }
    
    this.creditsBalance -= amount;
    this.creditsTotalUsed += amount;
    
    await this.save();
    return this.creditsBalance;
  }

  /**
   * Vérifier si l'utilisateur a assez de crédits
   */
  hasEnoughCredits(amount) {
    return this.creditsBalance >= amount;
  }

  /**
   * Obtenir le quota de stockage (en octets)
   * 5 GB pour tous les utilisateurs
   */
  getStorageQuota() {
    return 5 * 1024 * 1024 * 1024; // 5 GB
  }

  /**
   * Vérifier si l'utilisateur a assez d'espace de stockage
   */
  hasEnoughStorage(sizeInBytes) {
    const quota = this.getStorageQuota();
    return (this.storageUsed + sizeInBytes) <= quota;
  }

  /**
   * Ajouter de l'espace de stockage utilisé
   */
  async addStorageUsed(sizeInBytes) {
    this.storageUsed = (this.storageUsed || 0) + sizeInBytes;
    await this.save();
    return this.storageUsed;
  }

  /**
   * Libérer de l'espace de stockage
   */
  async freeStorage(sizeInBytes) {
    this.storageUsed = Math.max(0, (this.storageUsed || 0) - sizeInBytes);
    await this.save();
    return this.storageUsed;
  }

  /**
   * Mettre à jour les statistiques
   */
  async updateStats(publicationResult) {
    this.statsTotalPublications += 1;

    if (publicationResult.success) {
      this.statsSuccessfulPublications += 1;
      this.statsLastPublicationDate = new Date();
    } else {
      this.statsFailedPublications += 1;
    }

    await this.save();
  }

  /**
   * Supprimer le mot de passe des réponses JSON
   */
  toJSON() {
    const values = { ...this.get() };
    delete values.password;
    delete values.passwordResetToken;
    delete values.passwordResetExpires;
    delete values.emailVerificationToken;
    return values;
  }

  /**
   * Méthode statique pour trouver un utilisateur par email
   */
  static async findByCredentials(email, password) {
    return await this.findOne({ 
      where: { email },
      attributes: { include: ['password'] }
    });
  }

  /**
   * Méthode statique pour trouver par OAuth
   */
  static async findByOAuthProvider(provider, providerId) {
    const field = `oauth${provider.charAt(0).toUpperCase() + provider.slice(1)}Id`;
    const where = {};
    where[field] = providerId;
    return await this.findOne({ where });
  }
}

User.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: {
        msg: 'Please provide a valid email'
      }
    }
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      len: {
        args: [6, 255],
        msg: 'Password must be at least 6 characters'
      }
    }
  },
  name: {
    type: DataTypes.STRING(50),
    allowNull: false,
    validate: {
      len: {
        args: [1, 50],
        msg: 'Name cannot exceed 50 characters'
      }
    }
  },
  avatar: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  role: {
    type: DataTypes.ENUM('user', 'admin', 'moderator'),
    defaultValue: 'user'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  lastLogin: {
    type: DataTypes.DATE,
    allowNull: true
  },
  emailVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  emailVerificationToken: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  passwordResetToken: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  passwordResetExpires: {
    type: DataTypes.DATE,
    allowNull: true
  },

  // OAuth Providers (colonnes séparées pour MySQL)
  oauthGoogleId: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  oauthGoogleEmail: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  oauthGoogleName: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  oauthGoogleAvatar: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  oauthFacebookId: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  oauthFacebookEmail: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  oauthFacebookName: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  oauthFacebookAvatar: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  oauthTwitterId: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  oauthTwitterUsername: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  oauthTwitterName: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  oauthTwitterAvatar: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  oauthLinkedinId: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  oauthLinkedinEmail: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  oauthLinkedinName: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  oauthLinkedinAvatar: {
    type: DataTypes.STRING(500),
    allowNull: true
  },

  // Préférences
  preferencesTheme: {
    type: DataTypes.ENUM('light', 'dark', 'auto'),
    defaultValue: 'auto'
  },
  preferencesLanguage: {
    type: DataTypes.ENUM('fr', 'en', 'es', 'de'),
    defaultValue: 'fr'
  },
  preferencesTimezone: {
    type: DataTypes.STRING(50),
    defaultValue: 'Europe/Paris'
  },
  preferencesNotificationsEmail: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  preferencesNotificationsPush: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  preferencesNotificationsPublicationSuccess: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  preferencesNotificationsPublicationFailure: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },

  // Crédits
  creditsBalance: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
  creditsTotalPurchased: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  creditsTotalUsed: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  creditsLastRecharge: {
    type: DataTypes.DATE,
    allowNull: true
  },

  // Stockage (en octets)
  storageUsed: {
    type: DataTypes.BIGINT,
    defaultValue: 0,
    comment: 'Espace de stockage utilisé en octets'
  },

  // Statistiques
  statsTotalPublications: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  statsSuccessfulPublications: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  statsFailedPublications: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  statsLastPublicationDate: {
    type: DataTypes.DATE,
    allowNull: true
  },

  // Intégration Postiz
  postizUserId: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'ID de l\'utilisateur dans Postiz'
  },
  postizOnboardingStatus: {
    type: DataTypes.ENUM('not_started', 'in_progress', 'completed'),
    defaultValue: 'not_started',
    comment: 'Statut de l\'onboarding des réseaux sociaux'
  }
}, {
  sequelize,
  modelName: 'User',
  tableName: 'users',
  timestamps: true,
  indexes: [
    { fields: ['email'], unique: true },
    { fields: ['oauthGoogleId'] },
    { fields: ['oauthFacebookId'] },
    { fields: ['oauthTwitterId'] },
    { fields: ['oauthLinkedinId'] }
  ],
  hooks: {
    beforeSave: async (user) => {
      // Hasher le mot de passe si modifié
      if (user.changed('password')) {
        const salt = await bcrypt.genSalt(parseInt(process.env.BCRYPT_ROUNDS) || 12);
        user.password = await bcrypt.hash(user.password, salt);
      }
    }
  }
});

export default User;
