import express from 'express';
import User from '../models/User.js';
import Usage from '../models/Usage.js';
import { authenticateToken } from '../middleware/auth.js';
import { RECHARGE_OFFERS } from '../config/creditCosts.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

/**
 * @route   GET /api/credits/balance
 * @desc    Obtenir le solde de crédits de l'utilisateur
 * @access  Private
 */
router.get('/balance', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id || req.user.email;
    const user = await User.findOne({ 
      $or: [{ _id: userId }, { email: userId }] 
    }).select('credits');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    res.json({
      success: true,
      credits: {
        balance: user.credits.balance,
        totalPurchased: user.credits.totalPurchased,
        totalUsed: user.credits.totalUsed,
        lastRecharge: user.credits.lastRecharge
      }
    });
  } catch (error) {
    logger.error('Error fetching credit balance:', error);
    res.status(500).json({
      success: false,
      error: 'Error fetching credit balance',
      message: error.message
    });
  }
});

/**
 * @route   GET /api/credits/history
 * @desc    Obtenir l'historique des crédits
 * @access  Private
 */
router.get('/history', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id || req.user.email;
    const limit = parseInt(req.query.limit) || 50;
    const skip = parseInt(req.query.skip) || 0;
    
    const user = await User.findOne({ 
      $or: [{ _id: userId }, { email: userId }] 
    }).select('credits.history');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    // Trier par date décroissante et paginer
    const history = user.credits.history
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(skip, skip + limit);
    
    res.json({
      success: true,
      history,
      total: user.credits.history.length,
      limit,
      skip
    });
  } catch (error) {
    logger.error('Error fetching credit history:', error);
    res.status(500).json({
      success: false,
      error: 'Error fetching credit history',
      message: error.message
    });
  }
});

/**
 * @route   GET /api/credits/usage
 * @desc    Obtenir les statistiques d'utilisation
 * @access  Private
 */
router.get('/usage', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id || req.user.email;
    const startDate = req.query.startDate;
    const endDate = req.query.endDate;
    
    const stats = await Usage.getUserStats(userId, startDate, endDate);
    const recentUsage = await Usage.getRecentUsage(userId, 10);
    
    res.json({
      success: true,
      stats,
      recentUsage
    });
  } catch (error) {
    logger.error('Error fetching usage stats:', error);
    res.status(500).json({
      success: false,
      error: 'Error fetching usage stats',
      message: error.message
    });
  }
});

/**
 * @route   GET /api/credits/offers
 * @desc    Obtenir les offres de recharge disponibles
 * @access  Private
 */
router.get('/offers', authenticateToken, async (req, res) => {
  try {
    res.json({
      success: true,
      offers: RECHARGE_OFFERS
    });
  } catch (error) {
    logger.error('Error fetching recharge offers:', error);
    res.status(500).json({
      success: false,
      error: 'Error fetching offers',
      message: error.message
    });
  }
});

/**
 * @route   POST /api/credits/add
 * @desc    Ajouter des crédits (admin uniquement ou après paiement Stripe)
 * @access  Private (Admin)
 */
router.post('/add', authenticateToken, async (req, res) => {
  try {
    const { userId: targetUserId, amount, type, description, metadata } = req.body;
    
    // Vérifier les permissions
    const isAdmin = req.user.role === 'admin' || req.user.id === 'admin-001';
    const userId = targetUserId || req.user.id || req.user.email;
    
    if (!isAdmin && targetUserId && targetUserId !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized'
      });
    }
    
    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid amount'
      });
    }
    
    const user = await User.findOne({ 
      $or: [{ _id: userId }, { email: userId }] 
    });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    // Ajouter les crédits
    const newBalance = user.addCredits(
      amount, 
      type || 'purchase', 
      description || `Recharge de ${amount} crédits`,
      metadata || {}
    );
    
    await user.save();
    
    logger.info(`Added ${amount} credits to user ${userId}. New balance: ${newBalance}`);
    
    res.json({
      success: true,
      message: `${amount} crédits ajoutés avec succès`,
      newBalance,
      credits: {
        balance: user.credits.balance,
        totalPurchased: user.credits.totalPurchased,
        totalUsed: user.credits.totalUsed
      }
    });
  } catch (error) {
    logger.error('Error adding credits:', error);
    res.status(500).json({
      success: false,
      error: 'Error adding credits',
      message: error.message
    });
  }
});

/**
 * @route   GET /api/credits/admin/users
 * @desc    Obtenir la liste des utilisateurs avec leurs crédits (admin)
 * @access  Private (Admin)
 */
router.get('/admin/users', authenticateToken, async (req, res) => {
  try {
    // Vérifier les permissions admin
    const isAdmin = req.user.role === 'admin' || req.user.id === 'admin-001';
    
    if (!isAdmin) {
      return res.status(403).json({
        success: false,
        error: 'Admin access required'
      });
    }
    
    const users = await User.find()
      .select('email name credits.balance credits.totalPurchased credits.totalUsed credits.lastRecharge createdAt')
      .sort({ 'credits.totalUsed': -1 })
      .limit(100);
    
    res.json({
      success: true,
      users: users.map(u => ({
        id: u._id,
        email: u.email,
        name: u.name,
        balance: u.credits.balance,
        totalPurchased: u.credits.totalPurchased,
        totalUsed: u.credits.totalUsed,
        lastRecharge: u.credits.lastRecharge,
        createdAt: u.createdAt
      }))
    });
  } catch (error) {
    logger.error('Error fetching users credits:', error);
    res.status(500).json({
      success: false,
      error: 'Error fetching users',
      message: error.message
    });
  }
});

/**
 * @route   GET /api/credits/admin/stats
 * @desc    Obtenir les statistiques globales (admin)
 * @access  Private (Admin)
 */
router.get('/admin/stats', authenticateToken, async (req, res) => {
  try {
    // Vérifier les permissions admin
    const isAdmin = req.user.role === 'admin' || req.user.id === 'admin-001';
    
    if (!isAdmin) {
      return res.status(403).json({
        success: false,
        error: 'Admin access required'
      });
    }
    
    // Statistiques globales
    const totalUsers = await User.countDocuments();
    const usersWithCredits = await User.countDocuments({ 'credits.balance': { $gt: 0 } });
    
    const creditStats = await User.aggregate([
      {
        $group: {
          _id: null,
          totalBalance: { $sum: '$credits.balance' },
          totalPurchased: { $sum: '$credits.totalPurchased' },
          totalUsed: { $sum: '$credits.totalUsed' }
        }
      }
    ]);
    
    const usageStats = await Usage.aggregate([
      {
        $group: {
          _id: null,
          totalOperations: { $sum: 1 },
          totalTokens: { $sum: '$tokensUsed.total' },
          totalCredits: { $sum: '$creditsDeducted' }
        }
      }
    ]);
    
    // Top services utilisés
    const topServices = await Usage.aggregate([
      {
        $group: {
          _id: '$service',
          count: { $sum: 1 },
          totalCredits: { $sum: '$creditsDeducted' },
          totalTokens: { $sum: '$tokensUsed.total' }
        }
      },
      { $sort: { totalCredits: -1 } },
      { $limit: 10 }
    ]);
    
    res.json({
      success: true,
      stats: {
        users: {
          total: totalUsers,
          withCredits: usersWithCredits
        },
        credits: creditStats[0] || { totalBalance: 0, totalPurchased: 0, totalUsed: 0 },
        usage: usageStats[0] || { totalOperations: 0, totalTokens: 0, totalCredits: 0 },
        topServices
      }
    });
  } catch (error) {
    logger.error('Error fetching admin stats:', error);
    res.status(500).json({
      success: false,
      error: 'Error fetching stats',
      message: error.message
    });
  }
});

/**
 * @route   GET /api/credits/admin/monthly-sales
 * @desc    Obtenir les ventes de crédits par mois (admin)
 * @access  Private (Admin)
 */
router.get('/admin/monthly-sales', authenticateToken, async (req, res) => {
  try {
    // Vérifier les permissions admin
    const isAdmin = req.user.role === 'admin' || req.user.id === 'admin-001';
    
    if (!isAdmin) {
      return res.status(403).json({
        success: false,
        error: 'Admin access required'
      });
    }
    
    // Agrégation des ventes par mois (12 derniers mois)
    const monthlySales = await User.aggregate([
      {
        $unwind: '$credits.history'
      },
      {
        $match: {
          'credits.history.type': { $in: ['purchase', 'recharge'] },
          'credits.history.date': {
            $gte: new Date(new Date().setMonth(new Date().getMonth() - 12))
          }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$credits.history.date' },
            month: { $month: '$credits.history.date' }
          },
          totalCredits: { $sum: '$credits.history.amount' },
          totalTransactions: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);
    
    // Formater les données pour le graphique
    const monthNames = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
    const formattedData = monthlySales.map(item => ({
      month: `${monthNames[item._id.month - 1]} ${item._id.year}`,
      credits: item.totalCredits,
      transactions: item.totalTransactions
    }));
    
    res.json({
      success: true,
      sales: formattedData
    });
  } catch (error) {
    logger.error('Error fetching monthly sales:', error);
    res.status(500).json({
      success: false,
      error: 'Error fetching monthly sales',
      message: error.message
    });
  }
});

export default router;
