import { DataTypes } from 'sequelize';
import { sequelize } from '../config/sequelize.js';

/**
 * Modèle pour les modèles complets (configuration + contenu + résultats)
 * Sauvegarde l'état complet de l'application depuis la page Home
 */
const CompleteModel = sequelize.define('CompleteModel', {
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
  description: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  // Configuration complète (projectData, selectedAI, selectedTasks, etc.)
  config: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: {},
    comment: 'Configuration complète de l\'interface'
  },
  // Contenu de la zone de collecte
  content: {
    type: DataTypes.TEXT('long'),
    allowNull: true,
    defaultValue: ''
  },
  // Résultats générés
  results: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: [],
    comment: 'Vignettes de résultats générés'
  },
  // Thème
  theme: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'light',
    validate: {
      isIn: [['light', 'dark']]
    }
  },
  // Tags pour organisation
  tags: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },
  category: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  // Statistiques d'utilisation
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
  },
  // Favoris
  isFavorite: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    field: 'is_favorite'
  }
}, {
  tableName: 'complete_models',
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
      fields: ['is_favorite']
    }
  ]
});

// Associations
CompleteModel.associate = (models) => {
  CompleteModel.belongsTo(models.User, {
    foreignKey: 'userId',
    as: 'user'
  });
  
  CompleteModel.hasMany(models.CompleteModelFile, {
    foreignKey: 'completeModelId',
    as: 'files',
    onDelete: 'CASCADE'
  });
};

// Méthodes d'instance
CompleteModel.prototype.incrementUsage = async function() {
  this.usageCount += 1;
  this.lastUsedAt = new Date();
  return this.save();
};

CompleteModel.prototype.toggleFavorite = async function() {
  this.isFavorite = !this.isFavorite;
  return this.save();
};

// Méthodes statiques
CompleteModel.findByUser = function(userId, options = {}) {
  return this.findAll({
    where: { userId },
    include: [{
      model: sequelize.models.CompleteModelFile,
      as: 'files'
    }],
    order: [['createdAt', 'DESC']],
    ...options
  });
};

CompleteModel.findFavorites = function(userId) {
  return this.findAll({
    where: { 
      userId,
      isFavorite: true 
    },
    include: [{
      model: sequelize.models.CompleteModelFile,
      as: 'files'
    }],
    order: [['lastUsedAt', 'DESC']]
  });
};

CompleteModel.findMostUsed = function(userId, limit = 10) {
  return this.findAll({
    where: { userId },
    include: [{
      model: sequelize.models.CompleteModelFile,
      as: 'files'
    }],
    order: [['usageCount', 'DESC']],
    limit
  });
};

export default CompleteModel;
