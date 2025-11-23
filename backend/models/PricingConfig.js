import mongoose from 'mongoose';

const pricingConfigSchema = new mongoose.Schema({
  profitMargin: {
    type: Number,
    required: true,
    default: 30,
    min: 0,
    max: 100
  },
  serviceCosts: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: {}
  },
  rechargeOffers: [{
    id: { type: String, required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    credits: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    popular: { type: Boolean, default: false }
  }],
  monthlySubscriptionAmount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Méthode statique pour obtenir la config (singleton)
pricingConfigSchema.statics.getConfig = async function() {
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
        }
      },
      rechargeOffers: [
        { id: 'basic', name: 'Essentiel', price: 50, credits: 1111, discount: 10, popular: false },
        { id: 'comfort', name: 'Confort', price: 100, credits: 2500, discount: 20, popular: true },
        { id: 'pro', name: 'Professionnel', price: 200, credits: 5714, discount: 30, popular: false },
        { id: 'expert', name: 'Expert', price: 400, credits: 13333, discount: 40, popular: false }
      ],
      monthlySubscriptionAmount: 0
    });
  }
  
  return config;
};

// Méthode statique pour mettre à jour la config
pricingConfigSchema.statics.updateConfig = async function(updates) {
  let config = await this.findOne();
  
  if (!config) {
    config = await this.create(updates);
  } else {
    Object.assign(config, updates);
    await config.save();
  }
  
  return config;
};

const PricingConfig = mongoose.model('PricingConfig', pricingConfigSchema);

export default PricingConfig;
