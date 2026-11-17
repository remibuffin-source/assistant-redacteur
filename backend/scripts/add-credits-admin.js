import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { User } from '../models/index.sequelize.js';
import { logger } from '../utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Charger .env.local en priorité
const envLocalPath = path.resolve(__dirname, '../.env.local');
const envPath = path.resolve(__dirname, '../.env');

dotenv.config({ path: envLocalPath });
if (!process.env.DB_HOST) {
  dotenv.config({ path: envPath });
}

/**
 * Script pour ajouter des crédits à l'admin
 * Usage: node backend/scripts/add-credits-admin.js <montant_en_euros>
 * 
 * Exemple: node backend/scripts/add-credits-admin.js 152
 * Cela ajoutera 152€ = 3040 crédits (sans remise)
 */
async function addCreditsToAdmin() {
  try {
    const amountInEuros = parseFloat(process.argv[2]);
    
    if (!amountInEuros || amountInEuros <= 0) {
      console.error('❌ Usage: node backend/scripts/add-credits-admin.js <montant_en_euros>');
      console.error('   Exemple: node backend/scripts/add-credits-admin.js 152');
      process.exit(1);
    }
    
    // Conversion euros → crédits (1€ = 20 crédits sans remise)
    const creditsToAdd = Math.floor(amountInEuros / 0.05);
    
    console.log(`💰 Ajout de ${amountInEuros}€ = ${creditsToAdd} crédits à l'admin...`);
    
    // Trouver l'admin
    const admin = await User.findOne({
      where: { email: 'admin@assistant-redacteur.fr' }
    });
    
    if (!admin) {
      console.error('❌ Admin non trouvé !');
      process.exit(1);
    }
    
    console.log(`👤 Admin trouvé: ${admin.email}`);
    console.log(`💳 Solde actuel: ${admin.creditsBalance} crédits`);
    
    // Ajouter les crédits
    await admin.addCredits(
      creditsToAdd,
      'manual',
      `Ajout manuel - Récupération de ${amountInEuros}€ perdus`,
      {
        script: 'add-credits-admin.js',
        originalAmount: amountInEuros
      }
    );
    
    console.log(`✅ ${creditsToAdd} crédits ajoutés avec succès !`);
    console.log(`💳 Nouveau solde: ${admin.creditsBalance} crédits (≈ ${(admin.creditsBalance * 0.05).toFixed(2)}€)`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
}

addCreditsToAdmin();
