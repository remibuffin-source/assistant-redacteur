import express from 'express';
import { User, CreditHistory, sequelize } from '../models/index.sequelize.js';
import { authenticateToken } from '../middleware/auth.js';
import { getRechargeOffers } from '../utils/creditCalculator.js';
import { logger } from '../utils/logger.js';
import { Op } from 'sequelize';

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
      where: {
        [Op.or]: [
          { id: userId },
          { email: userId }
        ]
      },
      attributes: ['creditsBalance', 'creditsTotalPurchased', 'creditsTotalUsed', 'creditsLastRecharge']
    });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    res.json({
      success: true,
      credits: {
        balance: user.creditsBalance,
        totalPurchased: user.creditsTotalPurchased,
        totalUsed: user.creditsTotalUsed,
        lastRecharge: user.creditsLastRecharge
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
    const offset = parseInt(req.query.skip) || 0;
    
    // Trouver l'utilisateur
    const user = await User.findOne({ 
      where: {
        [Op.or]: [
          { id: userId },
          { email: userId }
        ]
      }
    });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    // Récupérer l'historique
    const { count, rows: history } = await CreditHistory.findAndCountAll({
      where: { userId: user.id },
      order: [['createdAt', 'DESC']],
      limit,
      offset
    });
    
    res.json({
      success: true,
      history,
      total: count,
      limit,
      skip: offset
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
    
    // Pour l'instant, retourner des statistiques basiques
    // TODO: Implémenter le modèle Usage en Sequelize
    const stats = {
      totalCredits: 0,
      totalTokens: 0,
      totalOperations: 0,
      totalCost: 0,
      byService: []
    };
    
    const recentUsage = [];
    
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
    const offers = await getRechargeOffers();
    res.json({
      success: true,
      offers: offers
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
      where: {
        [Op.or]: [
          { id: userId },
          { email: userId }
        ]
      }
    });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    // Ajouter les crédits
    const newBalance = await user.addCredits(
      amount, 
      type || 'purchase', 
      description || `Recharge de ${amount} crédits`,
      metadata || {}
    );
    
    logger.info(`Added ${amount} credits to user ${userId}. New balance: ${newBalance}`);
    
    res.json({
      success: true,
      message: `${amount} crédits ajoutés avec succès`,
      newBalance,
      credits: {
        balance: user.creditsBalance,
        totalPurchased: user.creditsTotalPurchased,
        totalUsed: user.creditsTotalUsed
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
    
    const users = await User.findAll({
      attributes: [
        'id', 'email', 'name', 
        'creditsBalance', 'creditsTotalPurchased', 'creditsTotalUsed', 
        'creditsLastRecharge', 'createdAt'
      ],
      order: [['creditsTotalUsed', 'DESC']],
      limit: 100
    });
    
    res.json({
      success: true,
      users: users.map(u => ({
        id: u.id,
        email: u.email,
        name: u.name,
        balance: u.creditsBalance,
        totalPurchased: u.creditsTotalPurchased,
        totalUsed: u.creditsTotalUsed,
        lastRecharge: u.creditsLastRecharge,
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
    
    // Statistiques globales avec Sequelize
    const totalUsers = await User.count();
    const usersWithCredits = await User.count({ 
      where: { creditsBalance: { [Op.gt]: 0 } }
    });
    
    // Agrégation des crédits
    const creditStats = await User.findOne({
      attributes: [
        [sequelize.fn('SUM', sequelize.col('creditsBalance')), 'totalBalance'],
        [sequelize.fn('SUM', sequelize.col('creditsTotalPurchased')), 'totalPurchased'],
        [sequelize.fn('SUM', sequelize.col('creditsTotalUsed')), 'totalUsed']
      ],
      raw: true
    });
    
    res.json({
      success: true,
      stats: {
        users: {
          total: totalUsers,
          withCredits: usersWithCredits
        },
        credits: creditStats || { totalBalance: 0, totalPurchased: 0, totalUsed: 0 },
        usage: { totalOperations: 0, totalTokens: 0, totalCredits: 0 }, // TODO: Implémenter Usage
        topServices: [] // TODO: Implémenter Usage
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
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);
    
    const monthlySales = await CreditHistory.findAll({
      attributes: [
        [sequelize.fn('YEAR', sequelize.col('createdAt')), 'year'],
        [sequelize.fn('MONTH', sequelize.col('createdAt')), 'month'],
        [sequelize.fn('SUM', sequelize.col('amount')), 'totalCredits'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'totalTransactions']
      ],
      where: {
        type: { [Op.in]: ['purchase', 'recharge'] },
        createdAt: { [Op.gte]: twelveMonthsAgo }
      },
      group: ['year', 'month'],
      order: [[sequelize.fn('YEAR', sequelize.col('createdAt')), 'ASC'], [sequelize.fn('MONTH', sequelize.col('createdAt')), 'ASC']],
      raw: true
    });
    
    // Formater les données pour le graphique
    const monthNames = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
    const formattedData = monthlySales.map(item => ({
      month: `${monthNames[item.month - 1]} ${item.year}`,
      credits: parseFloat(item.totalCredits) || 0,
      transactions: parseInt(item.totalTransactions) || 0
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
