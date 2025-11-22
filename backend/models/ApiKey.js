import mongoose from 'mongoose';
import crypto from 'crypto';

const apiKeySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  service: {
    type: String,
    required: true,
    enum: [
      // IA Services
      'openai',
      'openai-mini',
      'anthropic',
      'anthropic-haiku',
      'gemini',
      'gemini-pro',
      'deepseek',
      'deepseek-v3',
      'grok',
      'grok-2',
      'kimi',
      'mistral',
      'whisper',
      'gpt-vision',
      'elevenlabs',
      'deepl',
      // Social Networks
      'twitter',
      'facebook',
      'linkedin',
      'instagram',
      'tiktok',
      // Other
      'blog',
      'website'
    ]
  },
  encryptedKey: {
    type: String,
    required: true
  },
  iv: {
    type: String,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastUsed: {
    type: Date,
    default: null
  },
  metadata: {
    keyPrefix: String,
    provider: String,
    notes: String
  }
}, {
  timestamps: true
});

// Index composé pour éviter les doublons
apiKeySchema.index({ userId: 1, service: 1 }, { unique: true });

/**
 * Chiffrer une clé API
 */
apiKeySchema.statics.encryptKey = function(apiKey) {
  const algorithm = 'aes-256-cbc';
  const key = Buffer.from(process.env.ENCRYPTION_KEY || 'default-32-char-encryption-key!!', 'utf-8').slice(0, 32);
  const iv = crypto.randomBytes(16);
  
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(apiKey, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  return {
    encryptedKey: encrypted,
    iv: iv.toString('hex')
  };
};

/**
 * Déchiffrer une clé API
 */
apiKeySchema.methods.decryptKey = function() {
  const algorithm = 'aes-256-cbc';
  const key = Buffer.from(process.env.ENCRYPTION_KEY || 'default-32-char-encryption-key!!', 'utf-8').slice(0, 32);
  const iv = Buffer.from(this.iv, 'hex');
  
  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  let decrypted = decipher.update(this.encryptedKey, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
};

/**
 * Sauvegarder ou mettre à jour une clé API
 */
apiKeySchema.statics.saveApiKey = async function(userId, service, apiKey) {
  const { encryptedKey, iv } = this.encryptKey(apiKey);
  
  // Extraire le préfixe de la clé (premiers caractères) pour identification
  const keyPrefix = apiKey.substring(0, Math.min(8, apiKey.length));
  
  const result = await this.findOneAndUpdate(
    { userId, service },
    {
      encryptedKey,
      iv,
      isActive: true,
      metadata: {
        keyPrefix,
        provider: service
      }
    },
    { upsert: true, new: true }
  );
  
  return result;
};

/**
 * Récupérer toutes les clés d'un utilisateur (déchiffrées)
 */
apiKeySchema.statics.getUserKeys = async function(userId) {
  const keys = await this.find({ userId, isActive: true });
  
  const decryptedKeys = {};
  for (const key of keys) {
    try {
      decryptedKeys[key.service] = key.decryptKey();
    } catch (error) {
      console.error(`Erreur déchiffrement clé ${key.service}:`, error);
      decryptedKeys[key.service] = null;
    }
  }
  
  return decryptedKeys;
};

/**
 * Récupérer une clé spécifique (déchiffrée)
 */
apiKeySchema.statics.getServiceKey = async function(userId, service) {
  const key = await this.findOne({ userId, service, isActive: true });
  
  if (!key) {
    return null;
  }
  
  try {
    return key.decryptKey();
  } catch (error) {
    console.error(`Erreur déchiffrement clé ${service}:`, error);
    return null;
  }
};

/**
 * Supprimer une clé API
 */
apiKeySchema.statics.deleteApiKey = async function(userId, service) {
  return await this.findOneAndUpdate(
    { userId, service },
    { isActive: false },
    { new: true }
  );
};

/**
 * Mettre à jour la date de dernière utilisation
 */
apiKeySchema.methods.updateLastUsed = async function() {
  this.lastUsed = new Date();
  return await this.save();
};

const ApiKey = mongoose.model('ApiKey', apiKeySchema);

export default ApiKey;
