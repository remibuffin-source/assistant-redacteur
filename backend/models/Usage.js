import mongoose from 'mongoose';

/**
 * Modèle pour tracker l'utilisation des services AI et la consommation de crédits
 */
const usageSchema = new mongoose.Schema({
  // Utilisateur et projet
  userId: {
    type: String,
    required: true,
    index: true
  },
  projectId: {
    type: String,
    default: 'default',
    index: true
  },
  
  // Service AI utilisé
  service: {
    type: String,
    required: true,
    enum: ['anthropic', 'openai', 'openai-mini', 'gemini', 'gemini-pro', 'deepseek', 'grok', 'grok-2', 'kimi', 'whisper', 'gpt-vision'],
    index: true
  },
  model: {
    type: String,
    required: true
  },
  
  // Tokens consommés
  tokensUsed: {
    input: {
      type: Number,
      default: 0
    },
    output: {
      type: Number,
      default: 0
    },
    total: {
      type: Number,
      required: true
    }
  },
  
  // Crédits déduits
  creditsDeducted: {
    type: Number,
    required: true,
    min: 0
  },
  
  // Type d'opération
  operation: {
    type: String,
    required: true,
    enum: ['article_generation', 'content_improvement', 'translation', 'image_generation', 'audio_transcription', 'other']
  },
  
  // Métadonnées
  metadata: {
    articleId: String,
    title: String,
    platform: String,
    language: String,
    wordCount: Number,
    duration: Number, // en ms
    success: {
      type: Boolean,
      default: true
    },
    errorMessage: String
  },
  
  // Coût en euros (pour référence)
  costInEuros: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index composés pour les requêtes fréquentes
usageSchema.index({ userId: 1, createdAt: -1 });
usageSchema.index({ userId: 1, projectId: 1, createdAt: -1 });
usageSchema.index({ service: 1, createdAt: -1 });

// Méthode statique pour obtenir les statistiques d'un utilisateur
usageSchema.statics.getUserStats = async function(userId, startDate, endDate) {
  const match = { userId };
  
  if (startDate || endDate) {
    match.createdAt = {};
    if (startDate) match.createdAt.$gte = new Date(startDate);
    if (endDate) match.createdAt.$lte = new Date(endDate);
  }
  
  const stats = await this.aggregate([
    { $match: match },
    {
      $group: {
        _id: null,
        totalCredits: { $sum: '$creditsDeducted' },
        totalTokens: { $sum: '$tokensUsed.total' },
        totalOperations: { $sum: 1 },
        totalCost: { $sum: '$costInEuros' },
        byService: {
          $push: {
            service: '$service',
            credits: '$creditsDeducted',
            tokens: '$tokensUsed.total'
          }
        }
      }
    }
  ]);
  
  return stats[0] || {
    totalCredits: 0,
    totalTokens: 0,
    totalOperations: 0,
    totalCost: 0,
    byService: []
  };
};

// Méthode statique pour obtenir les statistiques par projet
usageSchema.statics.getProjectStats = async function(userId, projectId, startDate, endDate) {
  const match = { userId, projectId };
  
  if (startDate || endDate) {
    match.createdAt = {};
    if (startDate) match.createdAt.$gte = new Date(startDate);
    if (endDate) match.createdAt.$lte = new Date(endDate);
  }
  
  return await this.aggregate([
    { $match: match },
    {
      $group: {
        _id: '$service',
        totalCredits: { $sum: '$creditsDeducted' },
        totalTokens: { $sum: '$tokensUsed.total' },
        count: { $sum: 1 }
      }
    },
    { $sort: { totalCredits: -1 } }
  ]);
};

// Méthode statique pour obtenir l'historique récent
usageSchema.statics.getRecentUsage = async function(userId, limit = 20) {
  return await this.find({ userId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .select('service model tokensUsed creditsDeducted operation metadata createdAt');
};

const Usage = mongoose.model('Usage', usageSchema);

export default Usage;
