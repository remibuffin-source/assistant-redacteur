import dotenv from 'dotenv';
import { connectDB, sequelize } from '../config/sequelize.js';
import { User, ApiKey, PricingConfig, CreditHistory, initDatabase } from '../models/index.sequelize.js';
import { logger } from '../utils/logger.js';

dotenv.config();

/**
 * Script de test de la migration MySQL/Sequelize
 */

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

const log = {
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
  title: (msg) => console.log(`\n${colors.cyan}${'='.repeat(60)}\n${msg}\n${'='.repeat(60)}${colors.reset}\n`)
};

async function testMigration() {
  log.title('🧪 TEST DE MIGRATION MYSQL/SEQUELIZE');

  try {
    // Test 1: Connexion à MySQL
    log.info('Test 1: Connexion à MySQL...');
    await connectDB();
    log.success('Connexion MySQL établie');

    // Test 2: Création des tables
    log.info('Test 2: Création des tables...');
    await initDatabase();
    log.success('Tables créées avec succès');

    // Test 3: Vérifier les tables créées
    log.info('Test 3: Vérification des tables...');
    const tables = await sequelize.getQueryInterface().showAllTables();
    log.success(`Tables trouvées: ${tables.join(', ')}`);

    // Test 4: Créer un utilisateur de test
    log.info('Test 4: Création d\'un utilisateur de test...');
    const testUser = await User.create({
      email: 'test@migration.com',
      password: 'Test123!', // Sera hashé automatiquement
      name: 'Test User',
      role: 'user',
      creditsBalance: 100
    });
    log.success(`Utilisateur créé: ID ${testUser.id}, Email: ${testUser.email}`);

    // Test 5: Récupérer l'utilisateur
    log.info('Test 5: Récupération de l\'utilisateur...');
    const foundUser = await User.findOne({ where: { email: 'test@migration.com' } });
    if (foundUser) {
      log.success(`Utilisateur trouvé: ${foundUser.name} (${foundUser.email})`);
      log.info(`  - Crédits: ${foundUser.creditsBalance}`);
      log.info(`  - Rôle: ${foundUser.role}`);
    } else {
      log.error('Utilisateur non trouvé');
    }

    // Test 6: Ajouter des crédits
    log.info('Test 6: Ajout de crédits...');
    const newBalance = await foundUser.addCredits(50, 'purchase', 'Test recharge');
    log.success(`Crédits ajoutés. Nouveau solde: ${newBalance}`);

    // Test 7: Vérifier l'historique des crédits
    log.info('Test 7: Vérification de l\'historique...');
    const history = await CreditHistory.findAll({ 
      where: { userId: foundUser.id },
      order: [['createdAt', 'DESC']]
    });
    log.success(`Historique: ${history.length} entrée(s)`);
    history.forEach((h, i) => {
      log.info(`  ${i + 1}. ${h.type}: ${h.amount} crédits (solde après: ${h.balanceAfter})`);
    });

    // Test 8: Créer une clé API
    log.info('Test 8: Création d\'une clé API...');
    const apiKey = await ApiKey.saveApiKey(
      foundUser.id,
      'openai',
      'sk-test-1234567890abcdef'
    );
    log.success('Clé API créée et chiffrée');

    // Test 9: Récupérer et déchiffrer la clé API
    log.info('Test 9: Récupération de la clé API...');
    const retrievedKey = await ApiKey.getServiceKey(foundUser.id, 'openai');
    if (retrievedKey) {
      log.success(`Clé API récupérée: ${retrievedKey.substring(0, 10)}...`);
    } else {
      log.error('Clé API non trouvée');
    }

    // Test 10: Créer/récupérer la configuration de prix
    log.info('Test 10: Configuration de prix...');
    const pricingConfig = await PricingConfig.getConfig();
    log.success('Configuration de prix récupérée');
    log.info(`  - Marge bénéficiaire: ${pricingConfig.profitMargin}%`);
    log.info(`  - Offres de recharge: ${pricingConfig.rechargeOffers.length}`);

    // Test 11: Mettre à jour la configuration
    log.info('Test 11: Mise à jour de la configuration...');
    await PricingConfig.updateConfig({ profitMargin: 35 });
    const updatedConfig = await PricingConfig.getConfig();
    log.success(`Configuration mise à jour. Nouvelle marge: ${updatedConfig.profitMargin}%`);

    // Test 12: Statistiques utilisateurs
    log.info('Test 12: Statistiques utilisateurs...');
    const totalUsers = await User.count();
    const usersWithCredits = await User.count({ 
      where: { creditsBalance: { [sequelize.Sequelize.Op.gt]: 0 } }
    });
    log.success(`Total utilisateurs: ${totalUsers}`);
    log.success(`Utilisateurs avec crédits: ${usersWithCredits}`);

    // Test 13: Déduire des crédits
    log.info('Test 13: Déduction de crédits...');
    const balanceAfterDeduction = await foundUser.deductCredits(25, 'Test usage');
    log.success(`Crédits déduits. Nouveau solde: ${balanceAfterDeduction}`);

    // Test 14: Vérifier les relations
    log.info('Test 14: Test des relations...');
    const userWithKeys = await User.findOne({
      where: { id: foundUser.id },
      include: [
        { model: ApiKey, as: 'apiKeys' },
        { model: CreditHistory, as: 'creditHistory' }
      ]
    });
    log.success(`Relations chargées:`);
    log.info(`  - Clés API: ${userWithKeys.apiKeys.length}`);
    log.info(`  - Historique: ${userWithKeys.creditHistory.length}`);

    // Test 15: Nettoyage
    log.info('Test 15: Nettoyage des données de test...');
    await CreditHistory.destroy({ where: { userId: foundUser.id } });
    await ApiKey.destroy({ where: { userId: foundUser.id } });
    await User.destroy({ where: { id: foundUser.id } });
    log.success('Données de test supprimées');

    // Résumé final
    log.title('✅ TOUS LES TESTS SONT PASSÉS AVEC SUCCÈS !');
    console.log(`
${colors.green}La migration MySQL/Sequelize fonctionne correctement !${colors.reset}

Prochaines étapes :
1. Configurer les variables d'environnement pour O2Switch
2. Créer la base de données MySQL sur O2Switch
3. Déployer l'application

Pour déployer :
- Suivez le guide DEPLOIEMENT_O2SWITCH.md
- Utilisez Node.js 20.19.4
- Configurez les variables d'environnement
    `);

  } catch (error) {
    log.error(`Erreur lors des tests: ${error.message}`);
    console.error(error);
    process.exit(1);
  } finally {
    // Fermer la connexion
    await sequelize.close();
    log.info('Connexion MySQL fermée');
    process.exit(0);
  }
}

// Exécuter les tests
testMigration();
