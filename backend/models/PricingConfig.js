import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/sequelize.js';

class PricingConfig extends Model {
  /**
   * Méthode statique pour obtenir la config (singleton)
   */
  static async getConfig() {
    let config = await this.findOne();
    
    if (!config) {
      // Créer la config par défaut
      config = await this.create({
        profitMargin: 30,
        serviceCosts: {
          anthropic: {
            'claude-3-opus': { input: 0.015, output: 0.075 },
            'claude-3-sonnet': { input: 0.003, output: 0.015 },
            'claude-3-haiku': { input: 0.00025, output: 0.00125 }
          },
          openai: {
            'gpt-4': { input: 0.03, output: 0.06 },
            'gpt-4-turbo': { input: 0.01, output: 0.03 },
            'gpt-3.5-turbo': { input: 0.0015, output: 0.002 }
          },
          gemini: {
            'gemini-pro': { input: 0.00025, output: 0.0005 }
          },
          deepseek: {
            'deepseek-chat': { input: 0.00014, output: 0.00028 },
            'deepseek-reasoner': { input: 0.00055, output: 0.0022 }
          },
          glm: {
            'z-ai/glm-5.3': { input: 0.00007, output: 0.0014 }
          }
        },
        rechargeOffers: [
          { id: 'starter', name: 'Starter', price: 10, credits: 1000, discount: 0, popular: false },
          { id: 'pro', name: 'Pro', price: 25, credits: 2750, discount: 10, popular: true },
          { id: 'business', name: 'Business', price: 50, credits: 6000, discount: 20, popular: false },
          { id: 'enterprise', name: 'Enterprise', price: 100, credits: 13000, discount: 30, popular: false }
        ],
        monthlySubscriptionAmount: 0,
        imageProfitMargin: 100,
        imageServiceCosts: {
          'fal-tti': {
            'seedream-v4.5': { cost: 0.04 }
          },
          'fal-edit': {
            'seedream-v4.5': { cost: 0.04 }
          },
          'gemini-image': {
            'gemini-2.5-flash': { cost: 0.04 }
          },
          'wan-2.6': {
            'text-to-video-720p-5s': { cost: 0.35, unit: 'video' },
            'text-to-video-720p-10s': { cost: 0.70, unit: 'video' },
            'text-to-video-720p-15s': { cost: 1.05, unit: 'video' },
            'text-to-video-1080p-5s': { cost: 0.53, unit: 'video' },
            'text-to-video-1080p-10s': { cost: 1.05, unit: 'video' },
            'text-to-video-1080p-15s': { cost: 1.58, unit: 'video' },
            'image-to-video-720p-5s': { cost: 0.35, unit: 'video' },
            'image-to-video-720p-10s': { cost: 0.70, unit: 'video' },
            'image-to-video-720p-15s': { cost: 1.05, unit: 'video' },
            'image-to-video-1080p-5s': { cost: 0.53, unit: 'video' },
            'image-to-video-1080p-10s': { cost: 1.05, unit: 'video' },
            'image-to-video-1080p-15s': { cost: 1.58, unit: 'video' },
            'video-to-video-720p-5s': { cost: 0.35, unit: 'video' },
            'video-to-video-720p-10s': { cost: 0.70, unit: 'video' },
            'video-to-video-720p-15s': { cost: 1.05, unit: 'video' },
            'video-to-video-1080p-5s': { cost: 0.53, unit: 'video' },
            'video-to-video-1080p-10s': { cost: 1.05, unit: 'video' },
            'video-to-video-1080p-15s': { cost: 1.58, unit: 'video' }
          }
        },
        maxCreditsPerImage: 3
      });
    }
    
    // S'assurer que maxCreditsPerImage a une valeur par défaut
    if (config && config.maxCreditsPerImage === undefined) {
      config.maxCreditsPerImage = 3;
    }
    
    return config;
  }

  /**
   * Méthode statique pour mettre à jour la config
   */
  static async updateConfig(updates) {
    let config = await this.getConfig();
    
    // Liste des champs valides du modèle
    const validFields = ['profitMargin', 'serviceCosts', 'rechargeOffers', 'monthlySubscriptionAmount', 'imageProfitMargin', 'imageServiceCosts', 'maxCreditsPerImage'];
    
    // Mettre à jour les champs (ignorer les champs qui n'existent pas encore dans la BDD)
    Object.keys(updates).forEach(key => {
      if (validFields.includes(key)) {
        try {
          config[key] = updates[key];
        } catch (e) {
          console.warn(`Impossible de mettre à jour le champ ${key}:`, e.message);
        }
      }
    });
    
    await config.save();
    return config;
  }
}

PricingConfig.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  profitMargin: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    defaultValue: 30,
    validate: {
      min: 0,
      max: 100
    }
  },
  serviceCosts: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: {}
  },
  rechargeOffers: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: []
  },
  monthlySubscriptionAmount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  imageProfitMargin: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true,
    defaultValue: 100
  },
  imageServiceCosts: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {}
  },
  maxCreditsPerImage: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true,
    defaultValue: 3
  }
}, {
  sequelize,
  modelName: 'PricingConfig',
  tableName: 'pricing_config',
  timestamps: true,
  underscored: true // Utilise snake_case pour les colonnes (profit_margin au lieu de profitMargin)
});

export default PricingConfig;
