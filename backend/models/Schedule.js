import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/sequelize.js';

/**
 * Modèle Schedule pour l'intégration Postiz
 * Représente une programmation de publication sur les réseaux sociaux via Postiz
 */
class Schedule extends Model {}

Schedule.init({
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
    comment: 'ID de l\'utilisateur'
  },
  publicationId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'publications',
      key: 'id'
    },
    onDelete: 'SET NULL',
    comment: 'ID de la publication associée'
  },
  scheduledAt: {
    type: DataTypes.DATE,
    allowNull: false,
    comment: 'Date et heure de publication programmée'
  },
  timezone: {
    type: DataTypes.STRING(50),
    defaultValue: 'Europe/Paris',
    comment: 'Fuseau horaire de la programmation'
  },
  targetProviders: {
    type: DataTypes.JSON,
    allowNull: false,
    comment: 'Liste des plateformes cibles (ex: ["facebook", "instagram"])'
  },
  targetSocialAccountIds: {
    type: DataTypes.JSON,
    allowNull: false,
    comment: 'Liste des IDs de SocialAccount cibles'
  },
  postizJobId: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'ID du job/post dans Postiz'
  },
  postizScheduleId: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'ID de la planification dans Postiz'
  },
  status: {
    type: DataTypes.ENUM(
      'pending',
      'queued',
      'sent_to_postiz',
      'scheduled',
      'publishing',
      'published',
      'partial_success',
      'failed',
      'cancelled'
    ),
    defaultValue: 'pending',
    comment: 'Statut de la programmation'
  },
  content: {
    type: DataTypes.JSON,
    allowNull: false,
    comment: 'Contenu de la publication (texte, médias, liens)'
  },
  publishResults: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Résultats de publication par plateforme'
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
  },
  publishedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Date de publication effective'
  },
  cancelledAt: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Date d\'annulation'
  },
  cancelledBy: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    },
    comment: 'ID de l\'utilisateur ayant annulé'
  },
  metadata: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Métadonnées supplémentaires'
  }
}, {
  sequelize,
  modelName: 'Schedule',
  tableName: 'schedules',
  timestamps: true,
  indexes: [
    { fields: ['userId'] },
    { fields: ['publicationId'] },
    { fields: ['status'] },
    { fields: ['scheduledAt'] },
    { fields: ['postizJobId'] },
    { fields: ['postizScheduleId'] },
    { 
      fields: ['userId', 'status', 'scheduledAt'],
      name: 'user_status_scheduled'
    }
  ]
});

export default Schedule;
