import express from 'express';
import { User } from '../models/index.sequelize.js';
import bcrypt from 'bcryptjs';

const router = express.Router();

/**
 * Route temporaire pour déboguer le login admin
 */
router.get('/check-admin', async (req, res) => {
  try {
    const adminEmail = 'admin@assistant-redacteur.fr';
    const testPassword = 'AdminRedacteur2025!';
    
    // Trouver l'utilisateur
    const user = await User.findOne({ where: { email: adminEmail } });
    
    if (!user) {
      return res.json({
        success: false,
        error: 'Utilisateur non trouvé'
      });
    }
    
    // Tester le mot de passe
    const isPasswordValid = await bcrypt.compare(testPassword, user.password);
    
    res.json({
      success: true,
      user: {
        email: user.email,
        name: user.name,
        role: user.role,
        emailVerified: user.emailVerified,
        creditsBalance: user.creditsBalance
      },
      passwordTest: {
        provided: testPassword,
        hashInDB: user.password.substring(0, 20) + '...',
        isValid: isPasswordValid
      }
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
