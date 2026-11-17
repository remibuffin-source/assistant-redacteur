import { DataTypes } from 'sequelize';
import { sequelize } from '../config/sequelize.js';

/**
 * Modèle pour les modèles de contenu de l'éditeur
 * Permet de sauvegarder des templates de contenu réutilisables
 */
const ContentModel = sequelize.define('ContentModel', {
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
  name: {
    type: DataTypes.STRING(200),
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [1, 200]
    }
  },
  content: {
    type: DataTypes.TEXT('long'),
    allowNull: false,
    defaultValue: ''
  },
  type: {
    type: DataTypes.STRING(50),
    allowNull: false,
    defaultValue: 'text',
    validate: {
      isIn: [['text', 'html', 'markdown']]
    }
  },
  description: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  tags: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },
  category: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  isTemplate: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    field: 'is_template'
  },
  usageCount: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    field: 'usage_count'
  },
  lastUsedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'last_used_at'
  }
}, {
  tableName: 'content_models',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      fields: ['user_id']
    },
    {
      fields: ['user_id', 'created_at']
    },
    {
      fields: ['category']
    },
    {
      fields: ['is_template']
    }
  ]
});

// Associations
ContentModel.associate = (models) => {
  ContentModel.belongsTo(models.User, {
    foreignKey: 'userId',
    as: 'user'
  });
  
  ContentModel.hasMany(models.ContentModelFile, {
    foreignKey: 'contentModelId',
    as: 'files',
    onDelete: 'CASCADE'
  });
};

// Méthodes d'instance
ContentModel.prototype.incrementUsage = async function() {
  this.usageCount += 1;
  this.lastUsedAt = new Date();
  return this.save();
};

// Méthodes statiques
ContentModel.findByUser = function(userId, options = {}) {
  return this.findAll({
    where: { userId },
    include: [{
      model: sequelize.models.ContentModelFile,
      as: 'files'
    }],
    order: [['createdAt', 'DESC']],
    ...options
  });
};

ContentModel.findTemplates = function(userId) {
  return this.findAll({
    where: { 
      userId,
      isTemplate: true 
    },
    include: [{
      model: sequelize.models.ContentModelFile,
      as: 'files'
    }],
    order: [['usageCount', 'DESC']]
  });
};

export default ContentModel;
