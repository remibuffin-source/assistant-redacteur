import pool from '../config/postgres.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Script pour exécuter les migrations SQL automatiquement
 */
async function runMigration() {
  try {
    console.log('🚀 Démarrage de la migration...\n');

    // Lire le fichier SQL
    const sqlFilePath = path.join(__dirname, '../migrations/create_pricing_config_table.sql');
    const sqlContent = await fs.readFile(sqlFilePath, 'utf8');

    console.log('📄 Fichier SQL chargé:', sqlFilePath);
    console.log('📝 Exécution de la migration...\n');

    // Exécuter le SQL
    await pool.query(sqlContent);

    console.log('✅ Migration réussie !');
    console.log('✅ Table pricing_config créée avec succès');
    console.log('✅ Configuration par défaut insérée\n');

    // Vérifier que la table existe
    const result = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'pricing_config'
    `);

    if (result.rows.length > 0) {
      console.log('✅ Vérification: Table pricing_config existe bien\n');

      // Afficher la config par défaut
      const config = await pool.query('SELECT * FROM pricing_config LIMIT 1');
      if (config.rows.length > 0) {
        console.log('📊 Configuration par défaut:');
        console.log('   - Marge bénéficiaire:', config.rows[0].profit_margin + '%');
        console.log('   - Nombre de services AI:', Object.keys(config.rows[0].service_costs).length);
        console.log('   - Nombre d\'offres:', config.rows[0].recharge_offers.length);
        console.log('   - Souscription mensuelle:', config.rows[0].monthly_subscription_amount + '€\n');
      }
    }

    console.log('🎉 Migration terminée avec succès !');
    process.exit(0);

  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error.message);
    console.error('\nDétails:', error);
    process.exit(1);
  }
}

// Exécuter la migration
runMigration();
