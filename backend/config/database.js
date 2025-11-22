import mongoose from 'mongoose';
import { logger } from '../utils/logger.js';

/**
 * Connexion à MongoDB Atlas
 */
export const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI;

    if (!mongoURI) {
      logger.warn('⚠️  MONGODB_URI non défini - Base de données désactivée');
      return null;
    }

    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    };

    const conn = await mongoose.connect(mongoURI, options);

    logger.info(`✅ MongoDB connecté: ${conn.connection.host}`);
    logger.info(`📊 Base de données: ${conn.connection.name}`);

    // Gestion des événements de connexion
    mongoose.connection.on('error', (err) => {
      logger.error('❌ Erreur MongoDB:', err);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('⚠️  MongoDB déconnecté');
    });

    mongoose.connection.on('reconnected', () => {
      logger.info('✅ MongoDB reconnecté');
    });

    return conn;
  } catch (error) {
    logger.error('❌ Erreur de connexion MongoDB:', error.message);
    console.error('Détails complets de l\'erreur MongoDB:', error);
    // Ne pas crasher l'application si MongoDB n'est pas disponible
    logger.warn('⚠️  L\'application continue sans base de données');
    return null;
  }
};

/**
 * Déconnexion propre de MongoDB
 */
export const disconnectDB = async () => {
  try {
    await mongoose.connection.close();
    logger.info('✅ MongoDB déconnecté proprement');
  } catch (error) {
    logger.error('❌ Erreur lors de la déconnexion MongoDB:', error.message);
  }
};

/**
 * Vérifier si MongoDB est connecté
 */
export const isConnected = () => {
  return mongoose.connection.readyState === 1;
};

export default { connectDB, disconnectDB, isConnected };
