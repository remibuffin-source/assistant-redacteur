import { DataTypes } from 'sequelize';
import { sequelize } from '../config/sequelize.js';

/**
 * Modèle pour les publications programmées
 * Version Sequelize/MySQL (remplace Publication.js Mongoose)
 */
const PublicationModel = sequelize.define('PublicationModel', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'user_id',
    references: {
      model: 'users',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  title: {
    type: DataTypes.STRING(200),
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [1, 200]
    }
  },
  content: {
    type: DataTypes.TEXT('long'),
    allowNull: false
  },
  // Date de publication programmée
  publishDate: {
    type: DataTypes.DATE,
    allowNull: false,
    field: 'publish_date'
  },
  // Plateformes de destination (JSON array)
  platforms: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: [],
    comment: 'Liste des plateformes: twitter, facebook, instagram, linkedin, etc.'
  },
  // Statut global
  status: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'draft',
    validate: {
      isIn: [['draft', 'scheduled', 'published', 'failed', 'cancelled']]
    }
  },
  // Configuration de publication
  settings: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {},
    comment: 'Paramètres: autoPublish, notifyOnCompletion, etc.'
  },
  // Tags et catégorie
  tags: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },
  category: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  // Statistiques de performance
  performance: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {},
    comment: 'Stats: views, likes, shares, comments, etc.'
  },
  // Source du contenu
  source: {
    type: DataTypes.STRING(50),
    allowNull: false,
    defaultValue: 'manual',
    validate: {
      isIn: [['manual', 'library', 'generated', 'imported', 'calendar']]
    }
  },
  sourceId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'source_id'
  },
  // Historique des actions
  history: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: [],
    comment: 'Historique des modifications et publications'
  },
  // Configuration avancée
  advanced: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {},
    comment: 'Config avancée: timezone, priority, requiresApproval, etc.'
  },
  // Date de publication effective
  publishedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'published_at'
  },
  // Type de contenu (text ou image)
  type: {
    type: DataTypes.STRING(20),
    allowNull: true,
    defaultValue: 'text',
    validate: {
      isIn: [['text', 'image', 'mixed']]
    }
  },
  // URL de l'image principale
  imageUrl: {
    type: DataTypes.STRING(500),
    allowNull: true,
    field: 'image_url'
  },
  // URL de la vignette
  vignetteUrl: {
    type: DataTypes.STRING(500),
    allowNull: true,
    field: 'vignette_url'
  }
}, {
  tableName: 'publications',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      fields: ['user_id']
    },
    {
      fields: ['user_id', 'publish_date']
    },
    {
      fields: ['status']
    },
    {
      fields: ['publish_date']
    },
    {
      fields: ['category']
    }
  ]
});

// Associations
PublicationModel.associate = (models) => {
  PublicationModel.belongsTo(models.User, {
    foreignKey: 'userId',
    as: 'user'
  });
  
  PublicationModel.hasMany(models.PublicationFile, {
    foreignKey: 'publicationId',
    as: 'files',
    onDelete: 'CASCADE'
  });
};

// Méthodes d'instance
PublicationModel.prototype.addToHistory = async function(action, details, userId) {
  const history = this.history || [];
  history.push({
    action,
    timestamp: new Date().toISOString(),
    details,
    userId
  });
  this.history = history;
  return this.save();
};

PublicationModel.prototype.updateStatus = async function(newStatus, details = {}) {
  this.status = newStatus;
  
  if (newStatus === 'published') {
    this.publishedAt = new Date();
  }
  
  await this.addToHistory(newStatus, details.message || `Status changed to ${newStatus}`, this.userId);
  return this;
};

PublicationModel.prototype.reschedule = async function(newDate) {
  this.publishDate = newDate;
  this.status = 'scheduled';
  await this.addToHistory('rescheduled', `Rescheduled to ${newDate.toISOString()}`, this.userId);
  return this.save();
};

// Méthodes statiques
PublicationModel.findByUser = function(userId, options = {}) {
  return this.findAll({
    where: { userId },
    include: [{
      model: sequelize.models.PublicationFile,
      as: 'files'
    }],
    order: [['publishDate', 'DESC']],
    ...options
  });
};

PublicationModel.findPending = function() {
  return this.findAll({
    where: {
      status: 'scheduled',
      publishDate: {
        [sequelize.Op.lte]: new Date()
      }
    },
    include: [{
      model: sequelize.models.PublicationFile,
      as: 'files'
    }]
  });
};

PublicationModel.findByDateRange = function(userId, startDate, endDate) {
  return this.findAll({
    where: {
      userId,
      publishDate: {
        [sequelize.Op.between]: [startDate, endDate]
      }
    },
    include: [{
      model: sequelize.models.PublicationFile,
      as: 'files'
    }],
    order: [['publishDate', 'ASC']]
  });
};

PublicationModel.getStats = async function(userId, startDate, endDate) {
  const where = { userId };
  
  if (startDate && endDate) {
    where.publishedAt = {
      [sequelize.Op.between]: [startDate, endDate]
    };
  }
  
  const stats = await this.findAll({
    where,
    attributes: [
      'status',
      [sequelize.fn('COUNT', sequelize.col('id')), 'count']
    ],
    group: ['status'],
    raw: true
  });
  
  return stats.reduce((acc, stat) => {
    acc[stat.status] = parseInt(stat.count);
    return acc;
  }, {});
};

export default PublicationModel;
