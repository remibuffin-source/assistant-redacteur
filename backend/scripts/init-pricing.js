/**
 * Script d'initialisation de la table pricing_config
 * À exécuter une seule fois sur le serveur
 */

import { PricingConfig } from '../models/index.sequelize.js';
import { sequelize } from '../config/sequelize.js';

async function initPricing() {
  try {
    console.log('🔧 Connexion à la base de données...');
    await sequelize.authenticate();
    console.log('✅ Connexion réussie');

    console.log('🔧 Création de la table pricing_config...');
    await PricingConfig.sync({ alter: false });
    console.log('✅ Table créée');

    console.log('🔧 Vérification de la configuration...');
    const config = await PricingConfig.getConfig();
    
    console.log('✅ Configuration initialisée:');
    console.log('   - Marge bénéficiaire:', config.profitMargin + '%');
    console.log('   - Services configurés:', Object.keys(config.serviceCosts).length);
    console.log('   - Offres de recharge:', config.rechargeOffers.length);

    console.log('\n🎉 Initialisation terminée avec succès !');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation:', error);
    process.exit(1);
  }
}

initPricing();
