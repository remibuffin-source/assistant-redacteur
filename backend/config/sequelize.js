import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import { existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Charger .env AVANT toute configuration (nécessaire car les imports ES6 sont hoistés)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = join(__dirname, '..', '.env');
if (existsSync(envPath)) {
  dotenv.config({ path: envPath });
}

import { logger } from '../utils/logger.js';

/**
 * Configuration Sequelize pour MySQL (production) ou SQLite (développement)
 * En local, utiliser MYSQL_HOST=109.234.166.62 (IP du serveur O2Switch) pour connexion distante
 */
const isProduction = process.env.NODE_ENV === 'production';
const useSQLite = process.env.USE_SQLITE === 'true' || (!isProduction && !process.env.MYSQL_HOST);

const sequelize = useSQLite
  ? new Sequelize({
      dialect: 'sqlite',
      storage: './database.sqlite',
      logging: false,
      define: {
        timestamps: true,
        underscored: false,
        freezeTableName: true
      }
    })
  : new Sequelize(
      process.env.MYSQL_DATABASE || 'assistant_redacteur',
      process.env.MYSQL_USER || 'root',
      process.env.MYSQL_PASSWORD || '',
      {
        host: process.env.MYSQL_HOST || 'localhost',
        port: process.env.MYSQL_PORT || 3306,
        dialect: 'mysql',
        logging: process.env.NODE_ENV === 'development' ? (msg) => logger.debug(msg) : false,
        pool: {
          max: 10,
          min: 0,
          acquire: 30000,
          idle: 10000
        },
        define: {
          timestamps: true,
          underscored: false,
          freezeTableName: true
        },
        timezone: '+01:00' // Europe/Paris
      }
    );

/**
 * Connexion à MySQL
 */
export const connectDB = async () => {
  try {
    await sequelize.authenticate();
    if (useSQLite) {
      logger.info(`✅ SQLite connecté: ./database.sqlite`);
    } else {
      logger.info(`✅ MySQL connecté: ${process.env.MYSQL_HOST || 'localhost'}`);
      logger.info(`📊 Base de données: ${process.env.MYSQL_DATABASE || 'assistant_redacteur'}`);
    }
    
    // Synchroniser les modèles (en développement uniquement)
    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync({ alter: false }); // Ne pas modifier les tables existantes
      logger.info('✅ Modèles synchronisés');
    }
    
    return sequelize;
  } catch (error) {
    logger.error('❌ Erreur de connexion MySQL:', error.message);
    console.error('Détails complets de l\'erreur MySQL:', error);
    logger.warn('⚠️  L\'application continue sans base de données');
    return null;
  }
};

/**
 * Déconnexion propre de MySQL
 */
export const disconnectDB = async () => {
  try {
    await sequelize.close();
    logger.info('✅ MySQL déconnecté proprement');
  } catch (error) {
    logger.error('❌ Erreur lors de la déconnexion MySQL:', error.message);
  }
};

/**
 * Vérifier si MySQL est connecté
 */
export const isConnected = async () => {
  try {
    await sequelize.authenticate();
    return true;
  } catch (error) {
    return false;
  }
};

export { sequelize };
export default { sequelize, connectDB, disconnectDB, isConnected };
