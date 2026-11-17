import { DataTypes, Model } from 'sequelize';
import crypto from 'crypto';
import { sequelize } from '../config/sequelize.js';

class ApiKey extends Model {
  /**
   * Chiffrer une clé API
   */
  static encryptKey(apiKey) {
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
  }

  /**
   * Déchiffrer une clé API
   */
  decryptKey() {
    const algorithm = 'aes-256-cbc';
    const key = Buffer.from(process.env.ENCRYPTION_KEY || 'default-32-char-encryption-key!!', 'utf-8').slice(0, 32);
    const iv = Buffer.from(this.iv, 'hex');
    
    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    let decrypted = decipher.update(this.encryptedKey, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }

  /**
   * Sauvegarder ou mettre à jour une clé API
   */
  static async saveApiKey(userId, service, apiKey) {
    const { encryptedKey, iv } = this.encryptKey(apiKey);
    
    // Extraire le préfixe de la clé
    const keyPrefix = apiKey.substring(0, Math.min(8, apiKey.length));
    
    const [result] = await this.upsert({
      userId,
      service,
      encryptedKey,
      iv,
      isActive: true,
      metadataKeyPrefix: keyPrefix,
      metadataProvider: service
    });
    
    return result;
  }

  /**
   * Récupérer toutes les clés d'un utilisateur (déchiffrées)
   */
  static async getUserKeys(userId) {
    const keys = await this.findAll({ 
      where: { userId, isActive: true }
    });
    
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
  }

  /**
   * Récupérer une clé spécifique (déchiffrée)
   */
  static async getServiceKey(userId, service) {
    let key = await this.findOne({ 
      where: { userId, service, isActive: true }
    });
    
    // Si le service est 'openrouter' et qu'on ne trouve pas de clé,
    // essayer de récupérer une clé d'un service qui utilise OpenRouter
    if (!key && service === 'openrouter') {
      const openRouterServices = ['gemini-3-pro', 'gemini-2.5-flash', 'kimi', 'grok', 'qwen3'];
      for (const altService of openRouterServices) {
        key = await this.findOne({ 
          where: { userId, service: altService, isActive: true }
        });
        if (key) break;
      }
    }
    
    if (!key) {
      return null;
    }
    
    try {
      return key.decryptKey();
    } catch (error) {
      console.error(`Erreur déchiffrement clé ${service}:`, error);
      return null;
    }
  }

  /**
   * Supprimer une clé API
   */
  static async deleteApiKey(userId, service) {
    return await this.update(
      { isActive: false },
      { where: { userId, service } }
    );
  }

  /**
   * Mettre à jour la date de dernière utilisation
   * TODO: Ajouter la colonne lastUsed à la table api_keys
   */
  async updateLastUsed() {
    // this.lastUsed = new Date();
    // return await this.save();
    console.warn('updateLastUsed: colonne lastUsed non disponible dans la BDD');
    return this;
  }
}

ApiKey.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  service: {
    type: DataTypes.ENUM(
      'openai', 'openai-mini', 'anthropic', 'anthropic-haiku',
      'gemini-3-pro', 'gemini-2.5-flash', 'deepseek', 'deepseek-v3',
      'grok', 'grok-2', 'grok-4.1-fast-reasoning', 'kimi', 'qwen3', 'mistral', 'whisper',
      'gpt-vision', 'elevenlabs', 'deepl',
      'twitter', 'facebook', 'linkedin', 'instagram', 'tiktok',
      'blog', 'website',
      'fal-tti', 'fal-edit', 'gemini-image', 'wan', 'veo'
    ),
    allowNull: false,
    comment: 'Service API (openai, anthropic, etc.)'
  },
  encryptedKey: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  iv: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  // lastUsed: {
  //   type: DataTypes.DATE,
  //   allowNull: true
  // },
  metadataKeyPrefix: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  metadataProvider: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  metadataNotes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  sequelize,
  modelName: 'ApiKey',
  tableName: 'api_keys',
  timestamps: true,
  indexes: [
    { fields: ['userId'] },
    { fields: ['userId', 'service'], unique: true }
  ]
});

export default ApiKey;
