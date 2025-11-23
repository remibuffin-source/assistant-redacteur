-- Table pour stocker la configuration de tarification
CREATE TABLE IF NOT EXISTS pricing_config (
  id SERIAL PRIMARY KEY,
  profit_margin DECIMAL(5,2) NOT NULL DEFAULT 30.00, -- Marge bénéficiaire en %
  service_costs JSONB NOT NULL DEFAULT '{}', -- Coûts des services AI
  recharge_offers JSONB NOT NULL DEFAULT '[]', -- Offres de recharge
  monthly_subscription_amount DECIMAL(10,2) DEFAULT 0.00, -- Montant global mensuel de souscription
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index pour optimiser les requêtes
CREATE INDEX IF NOT EXISTS idx_pricing_config_updated_at ON pricing_config(updated_at DESC);

-- Insérer une configuration par défaut
INSERT INTO pricing_config (profit_margin, service_costs, recharge_offers, monthly_subscription_amount)
VALUES (
  30.00,
  '{
    "anthropic": {
      "claude-3-opus": {"input": 0.015, "output": 0.075},
      "claude-3-sonnet": {"input": 0.003, "output": 0.015},
      "claude-3-haiku": {"input": 0.00025, "output": 0.00125}
    },
    "openai": {
      "gpt-4": {"input": 0.03, "output": 0.06},
      "gpt-4-turbo": {"input": 0.01, "output": 0.03},
      "gpt-3.5-turbo": {"input": 0.0015, "output": 0.002}
    },
    "gemini": {
      "gemini-pro": {"input": 0.00025, "output": 0.0005}
    },
    "deepseek": {
      "deepseek-chat": {"input": 0.00014, "output": 0.00028},
      "deepseek-reasoner": {"input": 0.00055, "output": 0.0022}
    }
  }'::jsonb,
  '[
    {"id": "basic", "name": "Essentiel", "price": 50, "credits": 1111, "discount": 10, "popular": false},
    {"id": "comfort", "name": "Confort", "price": 100, "credits": 2500, "discount": 20, "popular": true},
    {"id": "pro", "name": "Professionnel", "price": 200, "credits": 5714, "discount": 30, "popular": false},
    {"id": "expert", "name": "Expert", "price": 400, "credits": 13333, "discount": 40, "popular": false}
  ]'::jsonb,
  0.00
)
ON CONFLICT DO NOTHING;

-- Fonction pour mettre à jour automatiquement updated_at
CREATE OR REPLACE FUNCTION update_pricing_config_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour updated_at
DROP TRIGGER IF EXISTS trigger_update_pricing_config_updated_at ON pricing_config;
CREATE TRIGGER trigger_update_pricing_config_updated_at
  BEFORE UPDATE ON pricing_config
  FOR EACH ROW
  EXECUTE FUNCTION update_pricing_config_updated_at();
