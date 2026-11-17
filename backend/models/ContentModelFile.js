import { DataTypes } from 'sequelize';
import { sequelize } from '../config/sequelize.js';

/**
 * Modèle pour les fichiers attachés aux modèles de contenu
 */
const ContentModelFile = sequelize.define('ContentModelFile', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  contentModelId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'content_model_id',
    references: {
      model: 'content_models',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  filename: {
    type: DataTypes.STRING(255),
    allowNull: false,
    comment: 'Nom du fichier sur le serveur (unique)'
  },
  originalName: {
    type: DataTypes.STRING(255),
    allowNull: false,
    field: 'original_name',
    comment: 'Nom original du fichier uploadé'
  },
  filePath: {
    type: DataTypes.STRING(500),
    allowNull: false,
    field: 'file_path',
    comment: 'Chemin complet du fichier sur le serveur'
  },
  fileSize: {
    type: DataTypes.BIGINT,
    allowNull: false,
    field: 'file_size',
    comment: 'Taille en bytes'
  },
  mimeType: {
    type: DataTypes.STRING(100),
    allowNull: false,
    field: 'mime_type'
  },
  fileType: {
    type: DataTypes.STRING(50),
    allowNull: false,
    defaultValue: 'document',
    field: 'file_type',
    validate: {
      isIn: [['image', 'video', 'audio', 'document', 'archive', 'other']]
    }
  },
  metadata: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Métadonnées additionnelles (dimensions, durée, etc.)'
  }
}, {
  tableName: 'content_model_files',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      fields: ['content_model_id']
    },
    {
      fields: ['file_type']
    }
  ]
});

// Associations
ContentModelFile.associate = (models) => {
  ContentModelFile.belongsTo(models.ContentModel, {
    foreignKey: 'contentModelId',
    as: 'contentModel'
  });
};

// Méthodes statiques
ContentModelFile.getTotalSizeByModel = async function(contentModelId) {
  const result = await this.findOne({
    where: { contentModelId },
    attributes: [
      [sequelize.fn('SUM', sequelize.col('file_size')), 'totalSize']
    ],
    raw: true
  });
  return result?.totalSize || 0;
};

ContentModelFile.getTotalSizeByUser = async function(userId) {
  const result = await this.findOne({
    include: [{
      model: sequelize.models.ContentModel,
      as: 'contentModel',
      where: { userId },
      attributes: []
    }],
    attributes: [
      [sequelize.fn('SUM', sequelize.col('file_size')), 'totalSize']
    ],
    raw: true
  });
  return result?.totalSize || 0;
};

export default ContentModelFile;
