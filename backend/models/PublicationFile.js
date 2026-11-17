import { DataTypes } from 'sequelize';
import { sequelize } from '../config/sequelize.js';

/**
 * Modèle pour les fichiers attachés aux publications
 */
const PublicationFile = sequelize.define('PublicationFile', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  publicationId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'publication_id',
    references: {
      model: 'publications',
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
  // Métadonnées spécifiques selon le type
  metadata: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Métadonnées: dimensions, durée, codec, etc.'
  },
  // Pour les images
  thumbnail: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: 'Chemin vers la miniature (pour images/vidéos)'
  },
  // Ordre d'affichage
  displayOrder: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    field: 'display_order'
  },
  // Alt text pour accessibilité
  altText: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'alt_text'
  },
  // Caption/légende
  caption: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'publication_files',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      fields: ['publication_id']
    },
    {
      fields: ['file_type']
    },
    {
      fields: ['publication_id', 'display_order']
    }
  ]
});

// Associations
PublicationFile.associate = (models) => {
  PublicationFile.belongsTo(models.PublicationModel, {
    foreignKey: 'publicationId',
    as: 'publication'
  });
};

// Méthodes statiques
PublicationFile.getTotalSizeByPublication = async function(publicationId) {
  const result = await this.findOne({
    where: { publicationId },
    attributes: [
      [sequelize.fn('SUM', sequelize.col('file_size')), 'totalSize']
    ],
    raw: true
  });
  return result?.totalSize || 0;
};

PublicationFile.getTotalSizeByUser = async function(userId) {
  const result = await this.findOne({
    include: [{
      model: sequelize.models.PublicationModel,
      as: 'publication',
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

PublicationFile.getByType = function(publicationId, fileType) {
  return this.findAll({
    where: { 
      publicationId,
      fileType 
    },
    order: [['displayOrder', 'ASC']]
  });
};

PublicationFile.reorderFiles = async function(publicationId, fileIds) {
  const promises = fileIds.map((fileId, index) => {
    return this.update(
      { displayOrder: index },
      { where: { id: fileId, publicationId } }
    );
  });
  return Promise.all(promises);
};

export default PublicationFile;
