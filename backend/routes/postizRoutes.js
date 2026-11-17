import express from 'express';
import postizService from '../services/postizService.js';
import SocialAccount from '../models/SocialAccount.sequelize.js';
import Schedule from '../models/Schedule.js';
import User from '../models/User.js';
import { authenticateToken } from '../middleware/auth.js';
import { getUserPostizToken } from './postiz.js';

const router = express.Router();

/**
 * POST /api/postiz/connect/:provider
 * Démarrer le flux OAuth pour connecter un réseau social
 */
router.post('/connect/:provider', authenticateToken, async (req, res) => {
  try {
    const { provider } = req.params;
    const userId = req.user.id;

    console.log(`🔵 [POSTIZ] Début connexion ${provider} pour userId=${userId}`);

    const user = await User.findByPk(userId);
    if (!user) {
      console.log(`🔴 [POSTIZ] Utilisateur ${userId} non trouvé`);
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    console.log(`🔵 [POSTIZ] Utilisateur trouvé: ${user.email}`);

    // Récupérer le token Postiz de l'utilisateur
    const userPostizToken = await getUserPostizToken(userId);
    if (!userPostizToken) {
      console.log(`🔴 [POSTIZ] Token Postiz non configuré pour userId=${userId}`);
      return res.status(403).json({ 
        error: 'Token Postiz non configuré',
        details: 'Vous devez d\'abord connecter votre compte Postiz'
      });
    }

    console.log(`🟢 [POSTIZ] Token Postiz récupéré: ${userPostizToken.substring(0, 10)}...`);

    // Créer un utilisateur Postiz si nécessaire
    if (!user.postizUserId) {
      console.log(`🔵 [POSTIZ] Création utilisateur Postiz pour ${user.email}`);
      const postizUser = await postizService.createUser({
        email: user.email,
        name: user.name
      }, userPostizToken);

      if (!postizUser.success) {
        console.log(`🔴 [POSTIZ] Erreur création utilisateur:`, postizUser.error);
        return res.status(500).json({ 
          error: 'Erreur création utilisateur Postiz',
          details: postizUser.error
        });
      }

      console.log(`🟢 [POSTIZ] Utilisateur Postiz créé: ${postizUser.postizUserId}`);
      user.postizUserId = postizUser.postizUserId;
      await user.save();
    } else {
      console.log(`🔵 [POSTIZ] Utilisateur Postiz existant: ${user.postizUserId}`);
    }

    // Générer l'URL d'autorisation OAuth
    console.log(`🔵 [POSTIZ] Génération URL OAuth pour ${provider}`);
    const authResult = await postizService.getAuthorizationUrl(
      provider,
      userId,
      user.postizUserId
    );

    if (!authResult.success) {
      console.log(`🔴 [POSTIZ] Erreur génération URL OAuth:`, authResult.error);
      return res.status(500).json({ 
        error: 'Erreur génération URL OAuth',
        details: authResult.error
      });
    }

    console.log(`🟢 [POSTIZ] URL OAuth générée: ${authResult.authUrl}`);
    res.json({
      success: true,
      authUrl: authResult.authUrl,
      state: authResult.state
    });

  } catch (error) {
    console.error('🔴 [POSTIZ] Erreur /connect:', error);
    res.status(500).json({ 
      error: 'Erreur serveur',
      details: error.message
    });
  }
});

/**
 * GET /api/postiz/callback/:provider
 * Callback OAuth après autorisation
 */
router.get('/callback/:provider', async (req, res) => {
  try {
    const { provider } = req.params;
    const { code, state, error } = req.query;

    if (error) {
      return res.redirect(`${process.env.FRONTEND_URL}/social-onboarding?error=${error}`);
    }

    if (!code || !state) {
      return res.redirect(`${process.env.FRONTEND_URL}/social-onboarding?error=missing_params`);
    }

    // Décoder et valider le state
    const stateData = postizService.decodeState(state);
    if (!stateData) {
      return res.redirect(`${process.env.FRONTEND_URL}/social-onboarding?error=invalid_state`);
    }

    const { userId, provider: stateProvider } = stateData;

    if (provider !== stateProvider) {
      return res.redirect(`${process.env.FRONTEND_URL}/social-onboarding?error=provider_mismatch`);
    }

    const user = await User.findByPk(userId);
    if (!user || !user.postizUserId) {
      return res.redirect(`${process.env.FRONTEND_URL}/social-onboarding?error=user_not_found`);
    }

    // Récupérer le token Postiz de l'utilisateur
    const userPostizToken = await getUserPostizToken(userId);
    
    // Récupérer les comptes sociaux depuis Postiz
    const accountsResult = await postizService.getUserSocialAccounts(user.postizUserId, userPostizToken);

    if (accountsResult.success && accountsResult.accounts.length > 0) {
      // Sauvegarder les nouveaux comptes dans notre DB
      for (const account of accountsResult.accounts) {
        if (account.provider === provider) {
          await SocialAccount.findOrCreate({
            where: {
              userId: userId,
              provider: account.provider,
              providerAccountId: account.providerAccountId
            },
            defaults: {
              displayName: account.displayName,
              username: account.username,
              avatarUrl: account.avatarUrl,
              status: account.status,
              postizProfileId: account.postizProfileId,
              metadata: account.metadata,
              lastSyncAt: new Date()
            }
          });
        }
      }

      // Mettre à jour le statut d'onboarding
      if (user.postizOnboardingStatus === 'not_started') {
        user.postizOnboardingStatus = 'in_progress';
        await user.save();
      }
    }

    res.redirect(`${process.env.FRONTEND_URL}/social-onboarding?success=true&provider=${provider}`);

  } catch (error) {
    console.error('Erreur /callback:', error);
    res.redirect(`${process.env.FRONTEND_URL}/social-onboarding?error=server_error`);
  }
});

/**
 * GET /api/postiz/accounts
 * Récupérer les comptes sociaux connectés de l'utilisateur
 */
router.get('/accounts', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const accounts = await SocialAccount.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      accounts: accounts.map(acc => ({
        id: acc.id,
        provider: acc.provider,
        displayName: acc.displayName,
        username: acc.username,
        avatarUrl: acc.avatarUrl,
        status: acc.status,
        metadata: acc.metadata,
        lastSyncAt: acc.lastSyncAt,
        createdAt: acc.createdAt
      }))
    });

  } catch (error) {
    console.error('Erreur /accounts:', error);
    res.status(500).json({ 
      error: 'Erreur serveur',
      details: error.message
    });
  }
});

/**
 * DELETE /api/postiz/accounts/:accountId
 * Déconnecter un compte social
 */
router.delete('/accounts/:accountId', authenticateToken, async (req, res) => {
  try {
    const { accountId } = req.params;
    const userId = req.user.id;

    const account = await SocialAccount.findOne({
      where: { id: accountId, userId }
    });

    if (!account) {
      return res.status(404).json({ error: 'Compte non trouvé' });
    }

    // Déconnecter dans Postiz
    if (account.postizProfileId) {
      await postizService.disconnectSocialAccount(account.postizProfileId);
    }

    // Supprimer de notre DB
    await account.destroy();

    res.json({
      success: true,
      message: 'Compte déconnecté avec succès'
    });

  } catch (error) {
    console.error('Erreur /accounts/delete:', error);
    res.status(500).json({ 
      error: 'Erreur serveur',
      details: error.message
    });
  }
});

/**
 * POST /api/postiz/schedule
 * Créer une publication programmée via Postiz
 */
router.post('/schedule', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      content,
      scheduledAt,
      timezone,
      socialAccountIds,
      publicationId,
      mediaUrls
    } = req.body;

    if (!content || !scheduledAt || !socialAccountIds || socialAccountIds.length === 0) {
      return res.status(400).json({ 
        error: 'Paramètres manquants',
        required: ['content', 'scheduledAt', 'socialAccountIds']
      });
    }

    const user = await User.findByPk(userId);
    if (!user || !user.postizUserId) {
      return res.status(400).json({ 
        error: 'Utilisateur Postiz non configuré'
      });
    }

    // Récupérer les comptes sociaux
    const accounts = await SocialAccount.findAll({
      where: {
        id: socialAccountIds,
        userId: userId,
        status: 'connected'
      }
    });

    if (accounts.length === 0) {
      return res.status(400).json({ 
        error: 'Aucun compte social valide trouvé'
      });
    }

    const postizProfileIds = accounts
      .map(acc => acc.postizProfileId)
      .filter(id => id);

    // Créer la publication dans Postiz
    const postResult = await postizService.createScheduledPost({
      postizUserId: user.postizUserId,
      content,
      scheduledAt,
      socialAccountIds: postizProfileIds,
      mediaUrls
    });

    if (!postResult.success) {
      return res.status(500).json({ 
        error: 'Erreur création publication Postiz',
        details: postResult.error
      });
    }

    // Sauvegarder dans notre DB
    const schedule = await Schedule.create({
      userId,
      publicationId,
      scheduledAt,
      timezone: timezone || 'Europe/Paris',
      targetProviders: accounts.map(acc => acc.provider),
      targetSocialAccountIds: socialAccountIds,
      postizJobId: postResult.postizJobId,
      postizScheduleId: postResult.postizScheduleId,
      status: 'scheduled',
      content: {
        text: content.text || content.body,
        mediaUrls: mediaUrls || []
      }
    });

    res.json({
      success: true,
      schedule: {
        id: schedule.id,
        scheduledAt: schedule.scheduledAt,
        status: schedule.status,
        postizJobId: schedule.postizJobId
      }
    });

  } catch (error) {
    console.error('Erreur /schedule:', error);
    res.status(500).json({ 
      error: 'Erreur serveur',
      details: error.message
    });
  }
});

/**
 * DELETE /api/postiz/schedule/:scheduleId
 * Annuler une publication programmée
 */
router.delete('/schedule/:scheduleId', authenticateToken, async (req, res) => {
  try {
    const { scheduleId } = req.params;
    const userId = req.user.id;

    const schedule = await Schedule.findOne({
      where: { id: scheduleId, userId }
    });

    if (!schedule) {
      return res.status(404).json({ error: 'Programmation non trouvée' });
    }

    if (schedule.status === 'published' || schedule.status === 'cancelled') {
      return res.status(400).json({ 
        error: 'Impossible d\'annuler une publication déjà publiée ou annulée'
      });
    }

    // Annuler dans Postiz
    if (schedule.postizJobId) {
      await postizService.cancelScheduledPost(schedule.postizJobId);
    }

    // Mettre à jour notre DB
    schedule.status = 'cancelled';
    schedule.cancelledAt = new Date();
    schedule.cancelledBy = userId;
    await schedule.save();

    res.json({
      success: true,
      message: 'Publication annulée avec succès'
    });

  } catch (error) {
    console.error('Erreur /schedule/delete:', error);
    res.status(500).json({ 
      error: 'Erreur serveur',
      details: error.message
    });
  }
});

/**
 * POST /api/postiz/webhook
 * Webhook pour recevoir les mises à jour de statut depuis Postiz
 */
router.post('/webhook', async (req, res) => {
  try {
    const { jobId, status, results } = req.body;

    if (!jobId) {
      return res.status(400).json({ error: 'jobId manquant' });
    }

    // Trouver la programmation correspondante
    const schedule = await Schedule.findOne({
      where: { postizJobId: jobId }
    });

    if (!schedule) {
      console.warn(`Schedule non trouvé pour jobId: ${jobId}`);
      return res.status(404).json({ error: 'Schedule non trouvé' });
    }

    // Mettre à jour le statut
    schedule.status = postizService.mapPostizStatus(status);
    schedule.publishResults = results;

    if (schedule.status === 'published') {
      schedule.publishedAt = new Date();
    } else if (schedule.status === 'failed') {
      schedule.lastError = results?.error || 'Erreur de publication';
      schedule.lastErrorAt = new Date();
    }

    await schedule.save();

    res.json({ success: true, message: 'Webhook traité' });

  } catch (error) {
    console.error('Erreur /webhook:', error);
    res.status(500).json({ 
      error: 'Erreur serveur',
      details: error.message
    });
  }
});

/**
 * GET /api/postiz/health
 * Vérifier la santé de l'instance Postiz
 * Route publique pour monitoring
 */
router.get('/health', async (req, res) => {
  try {
    // Si Postiz n'est pas configuré, retourner un statut OK mais non configuré
    if (!process.env.POSTIZ_API_URL || !process.env.POSTIZ_API_KEY) {
      return res.json({
        success: true,
        status: 'not_configured',
        message: 'Postiz non configuré - Variables d\'environnement manquantes'
      });
    }

    const health = await postizService.healthCheck();
    res.json(health);
  } catch (error) {
    res.status(500).json({ 
      success: false,
      status: 'unhealthy',
      error: error.message
    });
  }
});

export default router;
