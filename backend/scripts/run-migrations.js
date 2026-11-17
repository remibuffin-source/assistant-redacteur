import { sequelize } from '../config/sequelize.js';
import { logger } from '../utils/logger.js';

// Import des modèles pour créer les tables
import '../models/index.sequelize.js';
import ContentModel from '../models/ContentModel.js';
import ContentModelFile from '../models/ContentModelFile.js';
import CompleteModel from '../models/CompleteModel.js';
import CompleteModelFile from '../models/CompleteModelFile.js';
import PublicationModel from '../models/PublicationModel.js';
import PublicationFile from '../models/PublicationFile.js';

/**
 * Script pour créer toutes les tables de stockage
 */
async function runMigrations() {
  try {
    logger.info('🚀 Démarrage des migrations...');
    
    // Connexion à la base de données
    await sequelize.authenticate();
    logger.info('✅ Connexion MySQL établie');
    
    // Créer les tables dans l'ordre (respect des dépendances)
    logger.info('📊 Création des tables...');
    
    // 1. Tables content_models
    await ContentModel.sync({ alter: true });
    logger.info('✅ Table content_models créée');
    
    await ContentModelFile.sync({ alter: true });
    logger.info('✅ Table content_model_files créée');
    
    // 2. Tables complete_models
    await CompleteModel.sync({ alter: true });
    logger.info('✅ Table complete_models créée');
    
    await CompleteModelFile.sync({ alter: true });
    logger.info('✅ Table complete_model_files créée');
    
    // 3. Tables publications
    await PublicationModel.sync({ alter: true });
    logger.info('✅ Table publications créée');
    
    await PublicationFile.sync({ alter: true });
    logger.info('✅ Table publication_files créée');
    
    logger.info('🎉 Toutes les tables ont été créées avec succès !');
    
    // Afficher les tables créées
    const tables = await sequelize.query(
      "SHOW TABLES",
      { type: sequelize.QueryTypes.SELECT }
    );
    
    logger.info('📋 Tables dans la base de données :');
    tables.forEach(table => {
      const tableName = Object.values(table)[0];
      logger.info(`   - ${tableName}`);
    });
    
    process.exit(0);
  } catch (error) {
    logger.error('❌ Erreur lors des migrations:', error);
    console.error(error);
    process.exit(1);
  }
}

runMigrations();
