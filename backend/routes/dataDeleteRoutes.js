import express from 'express';
import crypto from 'crypto';

const router = express.Router();

// Endpoint pour recevoir les demandes de suppression de données de Meta
router.post('/deletion', async (req, res) => {
  try {
    const signedRequest = req.body.signed_request;
    
    if (!signedRequest) {
      return res.status(400).json({ 
        error: 'Missing signed_request parameter' 
      });
    }

    // Décoder le signed_request de Meta
    const [encodedSig, payload] = signedRequest.split('.');
    const data = JSON.parse(Buffer.from(payload, 'base64').toString('utf8'));
    
    // Vérifier la signature (optionnel mais recommandé)
    const appSecret = process.env.META_APP_SECRET;
    const expectedSig = crypto
      .createHmac('sha256', appSecret)
      .update(payload)
      .digest('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
    
    const sig = encodedSig.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
    
    if (sig !== expectedSig) {
      console.error('Invalid signature for data deletion request');
      return res.status(400).json({ error: 'Invalid signature' });
    }

    const userId = data.user_id;
    const algorithm = data.algorithm;
    const issuedAt = data.issued_at;

    console.log(`📋 Data deletion request received for Meta user: ${userId}`);
    console.log(`Algorithm: ${algorithm}, Issued at: ${issuedAt}`);

    // TODO: Implémenter la logique de suppression des données
    // 1. Trouver l'utilisateur dans la base de données via son Meta user_id
    // 2. Supprimer toutes ses données Meta (tokens, pages, comptes Instagram)
    // 3. Logger la demande pour audit
    
    // Générer un code de confirmation unique
    const confirmationCode = crypto.randomBytes(16).toString('hex');
    const statusUrl = `https://assistant-redacteur.fr/data-deletion-status?id=${confirmationCode}`;

    // Retourner l'URL de statut à Meta
    res.json({
      url: statusUrl,
      confirmation_code: confirmationCode
    });

    // Log de la demande (à stocker en base de données)
    console.log(`✅ Data deletion request processed. Confirmation code: ${confirmationCode}`);
    
  } catch (error) {
    console.error('Error processing data deletion request:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
});

// Endpoint pour vérifier le statut d'une demande de suppression
router.get('/deletion-status/:confirmationCode', async (req, res) => {
  try {
    const { confirmationCode } = req.params;
    
    // TODO: Vérifier le statut dans la base de données
    // Pour l'instant, retourner un statut par défaut
    
    res.json({
      status: 'pending', // ou 'completed', 'failed'
      confirmation_code: confirmationCode,
      message: 'Votre demande de suppression est en cours de traitement.'
    });
    
  } catch (error) {
    console.error('Error checking deletion status:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
});

export default router;
