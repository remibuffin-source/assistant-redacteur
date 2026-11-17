import express from 'express';
import { User } from '../models/index.sequelize.js';
import { sequelize } from '../config/sequelize.js';
import { logger } from '../utils/logger.js';
import bcrypt from 'bcryptjs';

const router = express.Router();

/**
 * Route temporaire pour créer le compte administrateur
 * À SUPPRIMER après utilisation
 */
router.get('/create-admin', async (req, res) => {
  try {
    logger.info('🔧 Création du compte administrateur...');
    
    // Vérifier la connexion
    await sequelize.authenticate();
    logger.info('✅ Connexion DB OK');

    const adminEmail = 'admin@assistant-redacteur.fr';
    const adminPassword = 'AdminRedacteur2025!';

    // Vérifier si l'admin existe déjà
    const existingAdmin = await User.findOne({ where: { email: adminEmail } });
    
    if (existingAdmin) {
      logger.info('⚠️  Le compte admin existe déjà - Mise à jour du mot de passe');
      
      // Mettre à jour le mot de passe et le rôle
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      existingAdmin.password = hashedPassword;
      existingAdmin.role = 'admin';
      existingAdmin.emailVerified = true;
      await existingAdmin.save();
      
      logger.info('✅ Mot de passe et rôle mis à jour');
      
      return res.json({
        success: true,
        message: 'Compte admin mis à jour avec succès',
        admin: {
          email: existingAdmin.email,
          password: adminPassword,
          role: existingAdmin.role,
          credits: existingAdmin.creditsBalance
        },
        warning: 'Mot de passe réinitialisé !'
      });
    }

    // Créer le compte admin
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    
    const admin = await User.create({
      email: adminEmail,
      password: hashedPassword,
      name: 'Admin Assistant Rédacteur',
      role: 'admin',
      emailVerified: true,
      creditsBalance: 10000,
      creditsTotalPurchased: 10000,
      creditsTotalUsed: 0
    });

    logger.info('✅ Compte administrateur créé');

    res.json({
      success: true,
      message: 'Compte administrateur créé avec succès',
      admin: {
        email: admin.email,
        password: adminPassword,
        role: admin.role,
        credits: admin.creditsBalance
      },
      warning: 'IMPORTANT: Changez le mot de passe après la première connexion !'
    });
    
  } catch (error) {
    logger.error('❌ Erreur création admin:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

export default router;
