/**
 * Script pour créer le compte administrateur
 * À exécuter une seule fois
 */

import { User } from '../models/index.sequelize.js';
import { sequelize } from '../config/sequelize.js';
import bcrypt from 'bcryptjs';

async function createAdmin() {
  try {
    console.log('🔧 Connexion à la base de données...');
    await sequelize.authenticate();
    console.log('✅ Connexion réussie');

    const adminEmail = 'admin@assistant-redacteur.fr';
    const adminPassword = 'AdminRedacteur2025!';

    // Vérifier si l'admin existe déjà
    const existingAdmin = await User.findOne({ where: { email: adminEmail } });
    
    if (existingAdmin) {
      console.log('⚠️  Le compte admin existe déjà');
      console.log('   Email:', existingAdmin.email);
      console.log('   Rôle:', existingAdmin.role);
      console.log('   Crédits:', existingAdmin.creditsBalance);
      
      // Mettre à jour le rôle si nécessaire
      if (existingAdmin.role !== 'admin') {
        existingAdmin.role = 'admin';
        await existingAdmin.save();
        console.log('✅ Rôle mis à jour vers admin');
      }
      
      process.exit(0);
    }

    // Créer le compte admin
    console.log('🔧 Création du compte administrateur...');
    
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    
    const admin = await User.create({
      email: adminEmail,
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'Assistant Rédacteur',
      role: 'admin',
      isVerified: true,
      creditsBalance: 10000, // 10 000 crédits de départ
      creditsTotalPurchased: 10000,
      creditsTotalUsed: 0
    });

    console.log('✅ Compte administrateur créé avec succès !');
    console.log('');
    console.log('📧 Email:', admin.email);
    console.log('🔑 Mot de passe:', adminPassword);
    console.log('👤 Rôle:', admin.role);
    console.log('💰 Crédits:', admin.creditsBalance);
    console.log('');
    console.log('⚠️  IMPORTANT: Changez le mot de passe après la première connexion !');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
}

createAdmin();
