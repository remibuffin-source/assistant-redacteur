import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/sequelize.js';

/**
 * Modèle SocialAccount pour l'intégration Postiz
 * Représente un compte social connecté via Postiz (Facebook, Instagram, X, LinkedIn, etc.)
 */
class SocialAccount extends Model {}

SocialAccount.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    onDelete: 'CASCADE',
    comment: 'ID de l\'utilisateur propriétaire'
  },
  provider: {
    type: DataTypes.ENUM(
      'facebook',
      'instagram',
      'twitter',
      'x',
      'linkedin',
      'tiktok',
      'youtube',
      'pinterest',
      'reddit',
      'threads',
      'mastodon',
      'bluesky'
    ),
    allowNull: false,
    comment: 'Plateforme sociale'
  },
  providerAccountId: {
    type: DataTypes.STRING(255),
    allowNull: false,
    comment: 'ID du compte sur la plateforme (ex: page_id Facebook)'
  },
  displayName: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'Nom d\'affichage du compte (ex: nom de la page)'
  },
  username: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'Nom d\'utilisateur ou handle'
  },
  avatarUrl: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: 'URL de l\'avatar du compte'
  },
  status: {
    type: DataTypes.ENUM('connected', 'disconnected', 'error', 'expired'),
    defaultValue: 'connected',
    comment: 'Statut de la connexion'
  },
  postizProfileId: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'ID du profil dans Postiz'
  },
  postizConnectionId: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'ID de la connexion dans Postiz'
  },
  scopes: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Permissions OAuth accordées'
  },
  metadata: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Métadonnées supplémentaires (followers, etc.)'
  },
  lastSyncAt: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Dernière synchronisation avec Postiz'
  },
  lastError: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Dernier message d\'erreur'
  },
  lastErrorAt: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Date de la dernière erreur'
  }
}, {
  sequelize,
  modelName: 'SocialAccount',
  tableName: 'social_accounts',
  timestamps: true,
  indexes: [
    { fields: ['userId'] },
    { fields: ['provider'] },
    { fields: ['status'] },
    { fields: ['postizProfileId'] },
    { 
      fields: ['userId', 'provider', 'providerAccountId'],
      unique: true,
      name: 'unique_user_provider_account'
    }
  ]
});

export default SocialAccount;
