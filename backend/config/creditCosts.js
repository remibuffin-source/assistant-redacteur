/**
 * Configuration des coûts en crédits pour chaque service AI
 * 
 * Système de conversion :
 * - 1 crédit = 100 tokens environ
 * - 20€ = 400 crédits
 * - 1 crédit ≈ 0,05€
 * 
 * Les coûts sont basés sur les tarifs réels des fournisseurs AI
 * et incluent une marge pour couvrir les frais
 */

export const CREDIT_COSTS = {
  // Anthropic Claude
  anthropic: {
    'claude-3-opus-20240229': {
      input: 0.015,   // par 1000 tokens
      output: 0.075,  // par 1000 tokens
      creditsPerToken: 0.00015  // 15 crédits pour 100k tokens input
    },
    'claude-3-sonnet-20240229': {
      input: 0.003,
      output: 0.015,
      creditsPerToken: 0.00003
    },
    'claude-3-haiku-20240307': {
      input: 0.00025,
      output: 0.00125,
      creditsPerToken: 0.0000025
    }
  },
  
  // OpenAI
  openai: {
    'gpt-4': {
      input: 0.03,
      output: 0.06,
      creditsPerToken: 0.0003
    },
    'gpt-4-turbo': {
      input: 0.01,
      output: 0.03,
      creditsPerToken: 0.0001
    },
    'gpt-3.5-turbo': {
      input: 0.0015,
      output: 0.002,
      creditsPerToken: 0.000015
    }
  },
  
  // Google Gemini
  gemini: {
    'gemini-pro': {
      input: 0.00025,
      output: 0.0005,
      creditsPerToken: 0.0000025
    },
    'gemini-pro-vision': {
      input: 0.00025,
      output: 0.0005,
      creditsPerToken: 0.0000025
    }
  },
  
  // DeepSeek
  deepseek: {
    'deepseek-chat': {
      input: 0.00014,
      output: 0.00028,
      creditsPerToken: 0.0000014
    },
    'deepseek-reasoner': {
      input: 0.00055,
      output: 0.0022,
      creditsPerToken: 0.0000055
    }
  },
  
  // Grok (X.AI)
  grok: {
    'grok-2': {
      input: 0.002,
      output: 0.01,
      creditsPerToken: 0.00002
    }
  },
  
  // Kimi (Moonshot)
  kimi: {
    'moonshot-v1': {
      input: 0.001,
      output: 0.001,
      creditsPerToken: 0.00001
    }
  }
};

/**
 * Calcule le nombre de crédits nécessaires pour une opération
 * @param {string} service - Service AI (anthropic, openai, etc.)
 * @param {string} model - Modèle spécifique
 * @param {object} tokensUsed - {input, output, total}
 * @returns {number} - Nombre de crédits à déduire
 */
export function calculateCredits(service, model, tokensUsed) {
  // Normaliser le nom du service
  const normalizedService = service.toLowerCase().replace('-mini', '').replace('-pro', '');
  
  // Obtenir la configuration du modèle
  const serviceConfig = CREDIT_COSTS[normalizedService];
  if (!serviceConfig) {
    console.warn(`Service inconnu: ${service}, utilisation du coût par défaut`);
    // Coût par défaut : 0.0001 crédit par token
    return Math.ceil(tokensUsed.total * 0.0001);
  }
  
  // Trouver le modèle exact ou utiliser le premier disponible
  let modelConfig = serviceConfig[model];
  if (!modelConfig) {
    // Essayer de trouver un modèle similaire
    const modelKey = Object.keys(serviceConfig).find(key => 
      model.toLowerCase().includes(key.toLowerCase()) || 
      key.toLowerCase().includes(model.toLowerCase())
    );
    modelConfig = serviceConfig[modelKey] || Object.values(serviceConfig)[0];
  }
  
  // Calculer les crédits
  let credits = 0;
  
  if (tokensUsed.input && tokensUsed.output && modelConfig.input && modelConfig.output) {
    // Calcul précis avec input/output séparés
    credits = (tokensUsed.input * modelConfig.input / 1000) + 
              (tokensUsed.output * modelConfig.output / 1000);
  } else {
    // Calcul simple basé sur le total
    credits = tokensUsed.total * (modelConfig.creditsPerToken || 0.0001);
  }
  
  // Arrondir au centième supérieur et minimum 0.01 crédit
  return Math.max(0.01, Math.ceil(credits * 100) / 100);
}

/**
 * Estime le coût en crédits pour une génération
 * @param {string} service - Service AI
 * @param {string} model - Modèle
 * @param {number} estimatedTokens - Estimation du nombre de tokens
 * @returns {number} - Estimation des crédits nécessaires
 */
export function estimateCredits(service, model, estimatedTokens = 1000) {
  return calculateCredits(service, model, {
    input: estimatedTokens * 0.3,  // 30% input
    output: estimatedTokens * 0.7,  // 70% output
    total: estimatedTokens
  });
}

/**
 * Offres de recharge
 */
export const RECHARGE_OFFERS = [
  {
    id: 'starter',
    name: 'Starter',
    price: 20,
    credits: 400,
    pricePerCredit: 0.05,
    popular: false
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 50,
    credits: 1100,
    pricePerCredit: 0.045,
    popular: true,
    savings: '10%'
  },
  {
    id: 'business',
    name: 'Business',
    price: 100,
    credits: 2500,
    pricePerCredit: 0.04,
    popular: false,
    savings: '20%'
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 200,
    credits: 5500,
    pricePerCredit: 0.036,
    popular: false,
    savings: '28%'
  }
];
