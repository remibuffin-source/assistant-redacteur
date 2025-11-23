import pg from 'pg';
import { logger } from '../utils/logger.js';

const { Pool } = pg;

/**
 * Configuration de la connexion PostgreSQL
 */
const pool = new Pool({
  host: process.env.POSTGRES_HOST || 'localhost',
  port: process.env.POSTGRES_PORT || 5432,
  database: process.env.POSTGRES_DB || 'assistant_redacteur',
  user: process.env.POSTGRES_USER || 'postgres',
  password: process.env.POSTGRES_PASSWORD || '',
  max: 20, // Nombre maximum de clients dans le pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

/**
 * Gestion des événements du pool
 */
pool.on('connect', () => {
  logger.info('✅ Client PostgreSQL connecté au pool');
});

pool.on('error', (err) => {
  logger.error('❌ Erreur PostgreSQL inattendue:', err);
});

/**
 * Tester la connexion PostgreSQL
 */
export async function testConnection() {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    client.release();
    
    logger.info('✅ PostgreSQL connecté avec succès');
    logger.info(`📊 Heure serveur: ${result.rows[0].now}`);
    return true;
  } catch (error) {
    logger.error('❌ Erreur de connexion PostgreSQL:', error.message);
    return false;
  }
}

/**
 * Fermer proprement le pool
 */
export async function closePool() {
  try {
    await pool.end();
    logger.info('✅ Pool PostgreSQL fermé proprement');
  } catch (error) {
    logger.error('❌ Erreur lors de la fermeture du pool:', error.message);
  }
}

export default pool;
