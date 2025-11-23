import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please provide a valid email'
    ]
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false // Ne pas inclure par défaut dans les queries
  },
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  avatar: {
    type: String,
    default: null
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'moderator'],
    default: 'user'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date,
    default: null
  },
  emailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: {
    type: String,
    default: null
  },
  passwordResetToken: {
    type: String,
    default: null
  },
  passwordResetExpires: {
    type: Date,
    default: null
  },

  // Configuration OAuth
  oauthProviders: {
    google: {
      id: String,
      email: String,
      name: String,
      avatar: String
    },
    facebook: {
      id: String,
      email: String,
      name: String,
      avatar: String
    },
    twitter: {
      id: String,
      username: String,
      name: String,
      avatar: String
    },
    linkedin: {
      id: String,
      email: String,
      name: String,
      avatar: String
    }
  },

  // Préférences utilisateur
  preferences: {
    theme: {
      type: String,
      enum: ['light', 'dark', 'auto'],
      default: 'auto'
    },
    language: {
      type: String,
      default: 'fr',
      enum: ['fr', 'en', 'es', 'de']
    },
    timezone: {
      type: String,
      default: 'Europe/Paris'
    },
    notifications: {
      email: {
        type: Boolean,
        default: true
      },
      push: {
        type: Boolean,
        default: true
      },
      publicationSuccess: {
        type: Boolean,
        default: true
      },
      publicationFailure: {
        type: Boolean,
        default: true
      }
    }
  },

  // Système de crédits
  credits: {
    balance: {
      type: Number,
      default: 0,
      min: 0
    },
    totalPurchased: {
      type: Number,
      default: 0
    },
    totalUsed: {
      type: Number,
      default: 0
    },
    lastRecharge: {
      type: Date,
      default: null
    },
    history: [{
      type: {
        type: String,
        enum: ['purchase', 'usage', 'refund', 'bonus', 'adjustment'],
        required: true
      },
      amount: {
        type: Number,
        required: true
      },
      balanceAfter: {
        type: Number,
        required: true
      },
      description: String,
      relatedTo: String, // ID de l'article, transaction, etc.
      metadata: mongoose.Schema.Types.Mixed,
      createdAt: {
        type: Date,
        default: Date.now
      }
    }]
  },

  // Statistiques utilisateur
  stats: {
    totalPublications: {
      type: Number,
      default: 0
    },
    successfulPublications: {
      type: Number,
      default: 0
    },
    failedPublications: {
      type: Number,
      default: 0
    },
    lastPublicationDate: {
      type: Date,
      default: null
    },
    favoritePlatforms: [{
      platform: {
        type: String,
        enum: ['twitter', 'facebook', 'instagram', 'linkedin', 'youtube', 'tiktok']
      },
      count: {
        type: Number,
        default: 0
      }
    }]
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index pour améliorer les performances
userSchema.index({ email: 1 });
userSchema.index({ 'oauthProviders.google.id': 1 });
userSchema.index({ 'oauthProviders.facebook.id': 1 });
userSchema.index({ 'oauthProviders.twitter.id': 1 });

// Virtual pour le nom complet
userSchema.virtual('fullName').get(function() {
  return this.name;
});

// Méthode pour hasher le mot de passe
userSchema.pre('save', async function(next) {
  // Ne hasher que si le mot de passe a été modifié
  if (!this.isModified('password')) return next();

  try {
    // Hasher le mot de passe avec un coût de 12
    const salt = await bcrypt.genSalt(parseInt(process.env.BCRYPT_ROUNDS) || 12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Méthode pour comparer les mots de passe
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw error;
  }
};

// Méthode pour générer un token JWT
userSchema.methods.generateAuthToken = function() {
  return jwt.sign(
    {
      id: this._id,
      email: this.email,
      role: this.role
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRE || '7d'
    }
  );
};

// Méthode pour générer un token de rafraîchissement
userSchema.methods.generateRefreshToken = function() {
  return jwt.sign(
    {
      id: this._id
    },
    process.env.JWT_REFRESH_SECRET,
    {
      expiresIn: process.env.JWT_REFRESH_EXPIRE || '30d'
    }
  );
};

// Méthode pour ajouter des crédits
userSchema.methods.addCredits = function(amount, type = 'purchase', description = '', metadata = {}) {
  this.credits.balance += amount;
  this.credits.totalPurchased += amount;
  
  if (type === 'purchase') {
    this.credits.lastRecharge = new Date();
  }
  
  this.credits.history.push({
    type,
    amount,
    balanceAfter: this.credits.balance,
    description,
    metadata,
    createdAt: new Date()
  });
  
  return this.credits.balance;
};

// Méthode pour déduire des crédits
userSchema.methods.deductCredits = function(amount, description = '', relatedTo = null) {
  if (this.credits.balance < amount) {
    throw new Error('Insufficient credits');
  }
  
  this.credits.balance -= amount;
  this.credits.totalUsed += amount;
  
  this.credits.history.push({
    type: 'usage',
    amount: -amount,
    balanceAfter: this.credits.balance,
    description,
    relatedTo,
    createdAt: new Date()
  });
  
  return this.credits.balance;
};

// Méthode pour vérifier si l'utilisateur a assez de crédits
userSchema.methods.hasEnoughCredits = function(amount) {
  return this.credits.balance >= amount;
};

// Méthode pour mettre à jour les statistiques
userSchema.methods.updateStats = function(publicationResult) {
  this.stats.totalPublications += 1;

  if (publicationResult.success) {
    this.stats.successfulPublications += 1;
    this.stats.lastPublicationDate = new Date();
  } else {
    this.stats.failedPublications += 1;
  }

  // Mettre à jour les plateformes favorites
  const platformIndex = this.stats.favoritePlatforms.findIndex(
    p => p.platform === publicationResult.platform
  );

  if (platformIndex >= 0) {
    this.stats.favoritePlatforms[platformIndex].count += 1;
  } else {
    this.stats.favoritePlatforms.push({
      platform: publicationResult.platform,
      count: 1
    });
  }

  // Trier par count décroissant
  this.stats.favoritePlatforms.sort((a, b) => b.count - a.count);
};

// Méthode statique pour trouver un utilisateur par email ou OAuth
userSchema.statics.findByCredentials = function(email, password) {
  return this.findOne({ email }).select('+password');
};

userSchema.statics.findByOAuthProvider = function(provider, id) {
  const providerField = `oauthProviders.${provider}.id`;
  const query = {};
  query[providerField] = id;
  return this.findOne(query);
};

// Supprimer le mot de passe des réponses JSON
userSchema.methods.toJSON = function() {
  const userObject = this.toObject();
  delete userObject.password;
  delete userObject.passwordResetToken;
  delete userObject.passwordResetExpires;
  delete userObject.emailVerificationToken;
  return userObject;
};

const User = mongoose.model('User', userSchema);

export default User;
