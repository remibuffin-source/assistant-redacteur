import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/sequelize.js';

class Video extends Model {}

Video.init({
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
    }
  },
  filename: {
    type: DataTypes.STRING(255),
    allowNull: false,
    comment: 'Nom du fichier sur le serveur (ex: video_123456789.mp4)'
  },
  originalFilename: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'Nom original du fichier'
  },
  filepath: {
    type: DataTypes.STRING(500),
    allowNull: false,
    comment: 'Chemin relatif depuis stockage/ (ex: video/user_1/video_123456789.mp4)'
  },
  url: {
    type: DataTypes.STRING(500),
    allowNull: false,
    comment: 'URL publique pour accéder à la vidéo'
  },
  taskId: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'ID de la tâche Kie.ai'
  },
  model: {
    type: DataTypes.ENUM('text-to-video', 'image-to-video', 'video-to-video'),
    allowNull: false,
    comment: 'Type de génération'
  },
  prompt: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Prompt utilisé pour la génération'
  },
  resolution: {
    type: DataTypes.ENUM('720p', '1080p'),
    allowNull: true,
    defaultValue: '720p'
  },
  duration: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Durée en secondes (5, 10, 15)'
  },
  aspectRatio: {
    type: DataTypes.STRING(10),
    allowNull: true,
    comment: 'Ratio (16:9, 9:16, 1:1, auto)'
  },
  status: {
    type: DataTypes.ENUM('queuing', 'processing', 'completed', 'failed'),
    allowNull: true,
    defaultValue: 'queuing',
    comment: 'Statut de la génération'
  },
  fileSize: {
    type: DataTypes.BIGINT,
    allowNull: true,
    comment: 'Taille du fichier en octets'
  },
  mimeType: {
    type: DataTypes.STRING(100),
    allowNull: true,
    defaultValue: 'video/mp4'
  },
  creditsUsed: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Nombre de crédits utilisés pour cette génération'
  },
  metadata: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Métadonnées supplémentaires (seed, multiShots, etc.)'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    comment: 'Vidéo active ou supprimée'
  }
}, {
  sequelize,
  modelName: 'Video',
  tableName: 'videos',
  timestamps: true,
  indexes: [
    { fields: ['userId'] },
    { fields: ['taskId'] },
    { fields: ['model'] },
    { fields: ['createdAt'] }
  ]
});

export default Video;
