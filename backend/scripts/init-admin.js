import dotenv from 'dotenv';
import { existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Charger .env.local en priorité
const envLocalPath = join(__dirname, '..', '.env.local');
const envPath = join(__dirname, '..', '.env');

if (existsSync(envLocalPath)) {
  dotenv.config({ path: envLocalPath });
  console.log('✅ Loaded .env.local');
} else if (existsSync(envPath)) {
  dotenv.config({ path: envPath });
  console.log('✅ Loaded .env');
}

import { User, sequelize } from '../models/index.sequelize.js';

/**
 * Créer l'utilisateur admin par défaut
 */
async function createAdminUser() {
  try {
    // Connecter à la base de données
    await sequelize.authenticate();
    console.log('✅ Base de données connectée');

    // Synchroniser les modèles
    await sequelize.sync({ alter: true });
    console.log('✅ Modèles synchronisés');

    // Vérifier si l'admin existe déjà
    const existingAdmin = await User.findOne({
      where: { email: 'admin@assistant-redacteur.fr' }
    });

    if (existingAdmin) {
      console.log('ℹ️  L\'utilisateur admin existe déjà');
      process.exit(0);
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash('AdminRedacteur2025!', 12);

    // Créer l'admin
    const admin = await User.create({
      email: 'admin@assistant-redacteur.fr',
      password: hashedPassword,
      name: 'Administrateur',
      role: 'admin',
      emailVerified: true,
      creditsBalance: 1000000, // 1 million de crédits pour l'admin
      creditsTotalPurchased: 1000000,
      creditsTotalUsed: 0
    });

    console.log('✅ Utilisateur admin créé avec succès !');
    console.log('📧 Email:', admin.email);
    console.log('🔑 Mot de passe: AdminRedacteur2025!');
    console.log('💰 Crédits:', admin.creditsBalance);

    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur lors de la création de l\'admin:', error);
    process.exit(1);
  }
}

createAdminUser();
