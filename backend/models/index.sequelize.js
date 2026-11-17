import { sequelize } from '../config/sequelize.js';
import User from './User.js';
import ApiKey from './ApiKey.js';
import PricingConfig from './PricingConfig.js';
import CreditHistory from './CreditHistory.sequelize.js';
import ContentModel from './ContentModel.js';
import ContentModelFile from './ContentModelFile.js';
import CompleteModel from './CompleteModel.js';
import CompleteModelFile from './CompleteModelFile.js';
import PublicationModel from './PublicationModel.js';
import PublicationFile from './PublicationFile.js';
import Invoice from './Invoice.js';
import MediaAIConfig from './MediaAIConfig.js';

/**
 * Définir les relations entre les modèles
 */

// User <-> ApiKey (1:N)
User.hasMany(ApiKey, {
  foreignKey: 'userId',
  as: 'apiKeys',
  onDelete: 'CASCADE'
});
ApiKey.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
});

// User <-> CreditHistory (1:N)
User.hasMany(CreditHistory, {
  foreignKey: 'userId',
  as: 'creditHistory',
  onDelete: 'CASCADE'
});
CreditHistory.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
});

// User <-> ContentModel (1:N)
User.hasMany(ContentModel, {
  foreignKey: 'userId',
  as: 'contentModels',
  onDelete: 'CASCADE'
});
ContentModel.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
});

// ContentModel <-> ContentModelFile (1:N)
ContentModel.hasMany(ContentModelFile, {
  foreignKey: 'contentModelId',
  as: 'files',
  onDelete: 'CASCADE'
});
ContentModelFile.belongsTo(ContentModel, {
  foreignKey: 'contentModelId',
  as: 'contentModel'
});

// User <-> CompleteModel (1:N)
User.hasMany(CompleteModel, {
  foreignKey: 'userId',
  as: 'completeModels',
  onDelete: 'CASCADE'
});
CompleteModel.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
});

// CompleteModel <-> CompleteModelFile (1:N)
CompleteModel.hasMany(CompleteModelFile, {
  foreignKey: 'completeModelId',
  as: 'files',
  onDelete: 'CASCADE'
});
CompleteModelFile.belongsTo(CompleteModel, {
  foreignKey: 'completeModelId',
  as: 'completeModel'
});

// User <-> PublicationModel (1:N)
User.hasMany(PublicationModel, {
  foreignKey: 'userId',
  as: 'publications',
  onDelete: 'CASCADE'
});
PublicationModel.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
});

// PublicationModel <-> PublicationFile (1:N)
PublicationModel.hasMany(PublicationFile, {
  foreignKey: 'publicationId',
  as: 'files',
  onDelete: 'CASCADE'
});
PublicationFile.belongsTo(PublicationModel, {
  foreignKey: 'publicationId',
  as: 'publication'
});

// User <-> Invoice (1:N)
User.hasMany(Invoice, {
  foreignKey: 'userId',
  as: 'invoices',
  onDelete: 'CASCADE'
});
Invoice.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
});

/**
 * Synchroniser tous les modèles avec la base de données
 * ATTENTION: N'utilisez { force: true } qu'en développement !
 */
export const syncDatabase = async (options = {}) => {
  try {
    await sequelize.sync(options);
    console.log('✅ Base de données synchronisée');
  } catch (error) {
    console.error('❌ Erreur lors de la synchronisation:', error);
    throw error;
  }
};

/**
 * Créer les tables si elles n'existent pas
 */
export const initDatabase = async () => {
  try {
    // Créer les tables dans l'ordre (dépendances)
    await User.sync({ alter: false });
    await ApiKey.sync({ alter: false });
    await PricingConfig.sync({ alter: false });
    await CreditHistory.sync({ alter: false });
    await ContentModel.sync({ alter: false });
    await ContentModelFile.sync({ alter: false });
    await CompleteModel.sync({ alter: false });
    await CompleteModelFile.sync({ alter: false });
    await PublicationModel.sync({ alter: false });
    await PublicationFile.sync({ alter: false });
    await Invoice.sync({ alter: false });
    await MediaAIConfig.sync({ alter: false });
    
    console.log('✅ Tables créées avec succès');
  } catch (error) {
    console.error('❌ Erreur lors de la création des tables:', error);
    throw error;
  }
};

export {
  sequelize,
  User,
  ApiKey,
  PricingConfig,
  CreditHistory,
  ContentModel,
  ContentModelFile,
  CompleteModel,
  CompleteModelFile,
  PublicationModel,
  PublicationFile,
  Invoice,
  MediaAIConfig
};

export default {
  sequelize,
  User,
  ApiKey,
  PricingConfig,
  CreditHistory,
  ContentModel,
  ContentModelFile,
  CompleteModel,
  CompleteModelFile,
  PublicationModel,
  PublicationFile,
  Invoice,
  MediaAIConfig,
  syncDatabase,
  initDatabase
};
