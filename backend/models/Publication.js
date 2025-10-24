import mongoose from 'mongoose';

const publicationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    index: true
  },

  // Informations du contenu
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },

  content: {
    type: String,
    required: [true, 'Content is required'],
    maxlength: [10000, 'Content cannot exceed 10000 characters']
  },

  // Médias associés
  media: {
    images: [{
      url: String,
      alt: String,
      caption: String
    }],
    videos: [{
      url: String,
      thumbnail: String,
      duration: Number,
      platform: String
    }],
    documents: [{
      url: String,
      filename: String,
      size: Number,
      mimeType: String
    }]
  },

  // Plateformes de destination
  platforms: [{
    platform: {
      type: String,
      required: true,
      enum: ['twitter', 'facebook', 'instagram', 'linkedin', 'youtube', 'tiktok', 'wordpress', 'medium']
    },
    accountId: {
      type: String,
      required: true
    },
    accountName: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'published', 'failed', 'cancelled'],
      default: 'pending'
    },
    scheduledDate: {
      type: Date,
      required: true
    },
    publishedDate: {
      type: Date,
      default: null
    },
    postId: {
      type: String,
      default: null // ID du post sur la plateforme
    },
    postUrl: {
      type: String,
      default: null // URL du post publié
    },
    errorMessage: {
      type: String,
      default: null
    },
    retryCount: {
      type: Number,
      default: 0
    },
    metadata: {
      characterCount: Number,
      wordCount: Number,
      hashtagCount: Number,
      mentionCount: Number
    }
  }],

  // Configuration de publication
  settings: {
    isDraft: {
      type: Boolean,
      default: false
    },
    autoPublish: {
      type: Boolean,
      default: true
    },
    notifyOnCompletion: {
      type: Boolean,
      default: true
    },
    saveToLibrary: {
      type: Boolean,
      default: true
    }
  },

  // Tags et catégories
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],

  category: {
    type: String,
    trim: true,
    lowercase: true
  },

  // Statistiques de performance
  performance: {
    views: {
      type: Number,
      default: 0
    },
    likes: {
      type: Number,
      default: 0
    },
    shares: {
      type: Number,
      default: 0
    },
    comments: {
      type: Number,
      default: 0
    },
    clicks: {
      type: Number,
      default: 0
    },
    reach: {
      type: Number,
      default: 0
    }
  },

  // Source du contenu
  source: {
    type: String,
    enum: ['manual', 'library', 'generated', 'imported'],
    default: 'manual'
  },

  sourceId: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'source',
    default: null
  },

  // Historique des modifications
  history: [{
    action: {
      type: String,
      enum: ['created', 'edited', 'published', 'failed', 'cancelled', 'rescheduled']
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    details: {
      type: String,
      maxlength: [500, 'Details cannot exceed 500 characters']
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],

  // Configuration avancée
  advanced: {
    customTiming: {
      type: Boolean,
      default: false
    },
    timezone: {
      type: String,
      default: 'Europe/Paris'
    },
    priority: {
      type: String,
      enum: ['low', 'normal', 'high', 'urgent'],
      default: 'normal'
    },
    requiresApproval: {
      type: Boolean,
      default: false
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    approvedAt: {
      type: Date,
      default: null
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index pour améliorer les performances
publicationSchema.index({ 'platforms.scheduledDate': 1 });
publicationSchema.index({ 'platforms.status': 1 });
publicationSchema.index({ userId: 1, createdAt: -1 });
publicationSchema.index({ tags: 1 });
publicationSchema.index({ category: 1 });

// Virtual pour le statut global
publicationSchema.virtual('overallStatus').get(function() {
  const statuses = this.platforms.map(p => p.status);
  if (statuses.every(s => s === 'published')) return 'published';
  if (statuses.some(s => s === 'failed')) return 'failed';
  if (statuses.some(s => s === 'pending')) return 'pending';
  return 'cancelled';
});

// Méthode pour ajouter une plateforme
publicationSchema.methods.addPlatform = function(platformData) {
  this.platforms.push({
    ...platformData,
    status: 'pending',
    scheduledDate: platformData.scheduledDate || this.platforms[0]?.scheduledDate || new Date()
  });
  return this.save();
};

// Méthode pour mettre à jour le statut d'une plateforme
publicationSchema.methods.updatePlatformStatus = function(platformIndex, status, details = {}) {
  if (this.platforms[platformIndex]) {
    this.platforms[platformIndex].status = status;

    if (status === 'published') {
      this.platforms[platformIndex].publishedDate = new Date();
      if (details.postId) this.platforms[platformIndex].postId = details.postId;
      if (details.postUrl) this.platforms[platformIndex].postUrl = details.postUrl;
    } else if (status === 'failed') {
      this.platforms[platformIndex].errorMessage = details.errorMessage;
      this.platforms[platformIndex].retryCount += 1;
    }

    // Ajouter à l'historique
    this.history.push({
      action: status === 'published' ? 'published' : 'failed',
      timestamp: new Date(),
      details: details.errorMessage || 'Publication completed',
      userId: this.userId
    });
  }

  return this.save();
};

// Méthode pour reprogrammer
publicationSchema.methods.reschedule = function(newDate, userId) {
  this.platforms.forEach(platform => {
    platform.scheduledDate = newDate;
    platform.status = 'pending';
  });

  this.history.push({
    action: 'rescheduled',
    timestamp: new Date(),
    details: `Rescheduled to ${newDate.toISOString()}`,
    userId: userId
  });

  return this.save();
};

// Méthode statique pour trouver les publications à publier
publicationSchema.statics.findPendingPublications = function() {
  return this.find({
    'platforms.status': 'pending',
    'platforms.scheduledDate': { $lte: new Date() }
  }).populate('userId', 'name email preferences.notifications');
};

// Méthode statique pour les statistiques par plateforme
publicationSchema.statics.getPlatformStats = async function(userId, startDate, endDate) {
  const matchConditions = { userId };

  if (startDate && endDate) {
    matchConditions['platforms.publishedDate'] = {
      $gte: startDate,
      $lte: endDate
    };
  }

  return this.aggregate([
    { $match: matchConditions },
    { $unwind: '$platforms' },
    {
      $group: {
        _id: '$platforms.platform',
        total: { $sum: 1 },
        published: {
          $sum: { $cond: [{ $eq: ['$platforms.status', 'published'] }, 1, 0] }
        },
        failed: {
          $sum: { $cond: [{ $eq: ['$platforms.status', 'failed'] }, 1, 0] }
        },
        avgRetryCount: { $avg: '$platforms.retryCount' }
      }
    },
    { $sort: { total: -1 } }
  ]);
};

const Publication = mongoose.model('Publication', publicationSchema);

export default Publication;
