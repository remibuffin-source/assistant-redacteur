import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import crypto from 'crypto';
import { sequelize } from '../config/sequelize.js';

const router = express.Router();

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || crypto.randomBytes(32);
const ALGORITHM = 'aes-256-cbc';

function encryptToken(token) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY), iv);
  let encrypted = cipher.update(token, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return {
    encryptedToken: encrypted,
    iv: iv.toString('hex')
  };
}

function decryptToken(encryptedToken, ivHex) {
  const iv = Buffer.from(ivHex, 'hex');
  const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY), iv);
  let decrypted = decipher.update(encryptedToken, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

router.post('/connect', authenticateToken, async (req, res) => {
  try {
    const { postizToken } = req.body;
    const userId = req.user.id;

    if (!postizToken || !postizToken.trim()) {
      return res.status(400).json({ 
        error: 'Token Postiz requis' 
      });
    }

    const { encryptedToken, iv } = encryptToken(postizToken);

    await sequelize.query(
      `UPDATE users 
       SET postiz_token = ?, 
           postiz_token_iv = ?, 
           postiz_connected = TRUE, 
           postiz_connected_at = NOW() 
       WHERE id = ?`,
      { replacements: [encryptedToken, iv, userId] }
    );

    res.json({ 
      success: true, 
      message: 'Compte Postiz connecté avec succès',
      connected: true
    });
  } catch (error) {
    console.error('Erreur lors de la connexion Postiz:', error);
    res.status(500).json({ error: 'Erreur lors de la connexion à Postiz' });
  }
});

router.get('/status', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const [rows] = await sequelize.query(
      'SELECT postiz_connected, postiz_connected_at FROM users WHERE id = ?',
      { replacements: [userId] }
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    res.json({
      connected: rows[0].postiz_connected === 1,
      connectedAt: rows[0].postiz_connected_at
    });
  } catch (error) {
    console.error('Erreur lors de la vérification du statut Postiz:', error);
    res.status(500).json({ error: 'Erreur lors de la vérification du statut' });
  }
});

router.post('/disconnect', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    await sequelize.query(
      `UPDATE users 
       SET postiz_token = NULL, 
           postiz_token_iv = NULL, 
           postiz_connected = FALSE, 
           postiz_connected_at = NULL 
       WHERE id = ?`,
      { replacements: [userId] }
    );

    res.json({ 
      success: true, 
      message: 'Compte Postiz déconnecté avec succès',
      connected: false
    });
  } catch (error) {
    console.error('Erreur lors de la déconnexion Postiz:', error);
    res.status(500).json({ error: 'Erreur lors de la déconnexion' });
  }
});

async function getUserPostizToken(userId) {
  const [rows] = await sequelize.query(
    'SELECT postiz_token, postiz_token_iv, postiz_connected FROM users WHERE id = ?',
    { replacements: [userId] }
  );

  if (rows.length === 0 || !rows[0].postiz_connected) {
    return null;
  }

  return decryptToken(rows[0].postiz_token, rows[0].postiz_token_iv);
}

export { router, getUserPostizToken };
