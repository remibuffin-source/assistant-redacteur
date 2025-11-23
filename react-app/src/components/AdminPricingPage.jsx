import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import './AdminPricingPage.css';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

/**
 * Page Admin pour configurer :
 * - Les coûts des tokens par service AI
 * - Les prix de vente des crédits (offres de recharge)
 * - Les marges bénéficiaires
 */
const AdminPricingPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);
  
  // Configuration des coûts par service (ce que ça nous coûte)
  const [serviceCosts, setServiceCosts] = useState({
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
  });
  
  // Marge bénéficiaire (en %)
  const [profitMargin, setProfitMargin] = useState(30); // 30% de marge par défaut
  
  // Offres de recharge (prix de vente)
  const [rechargeOffers, setRechargeOffers] = useState([
    { id: 'starter', name: 'Starter', price: 20, credits: 400, popular: false },
    { id: 'pro', name: 'Pro', price: 50, credits: 1100, popular: true },
    { id: 'business', name: 'Business', price: 100, credits: 2500, popular: false },
    { id: 'enterprise', name: 'Enterprise', price: 200, credits: 5500, popular: false }
  ]);

  useEffect(() => {
    loadPricingConfig();
  }, []);

  const loadPricingConfig = async () => {
    setLoading(true);
    try {
      // TODO: Charger depuis le backend
      // const response = await fetch(`${API_BASE_URL}/admin/pricing-config`);
      // const data = await response.json();
      // setServiceCosts(data.serviceCosts);
      // setProfitMargin(data.profitMargin);
      // setRechargeOffers(data.rechargeOffers);
      
      setLoading(false);
    } catch (error) {
      console.error('Erreur chargement config:', error);
      setLoading(false);
    }
  };

  const handleSavePricing = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // TODO: Sauvegarder sur le backend
      // const response = await fetch(`${API_BASE_URL}/admin/pricing-config`, {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     'Authorization': `Bearer ${token}`
      //   },
      //   body: JSON.stringify({
      //     serviceCosts,
      //     profitMargin,
      //     rechargeOffers
      //   })
      // });
      
      setMessage({ type: 'success', text: '✅ Configuration sauvegardée' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: '❌ Erreur lors de la sauvegarde' });
    }
  };

  const updateServiceCost = (service, model, field, value) => {
    setServiceCosts(prev => ({
      ...prev,
      [service]: {
        ...prev[service],
        [model]: {
          ...prev[service][model],
          [field]: parseFloat(value) || 0
        }
      }
    }));
  };

  const updateRechargeOffer = (id, field, value) => {
    setRechargeOffers(prev => prev.map(offer => 
      offer.id === id 
        ? { ...offer, [field]: field === 'popular' ? value : (parseFloat(value) || offer[field]) }
        : offer
    ));
  };

  const calculatePricePerCredit = (price, credits) => {
    return (price / credits).toFixed(4);
  };

  const calculateSavings = (offer) => {
    const baseOffer = rechargeOffers[0];
    const basePricePerCredit = baseOffer.price / baseOffer.credits;
    const currentPricePerCredit = offer.price / offer.credits;
    const savings = ((basePricePerCredit - currentPricePerCredit) / basePricePerCredit * 100);
    return savings > 0 ? savings.toFixed(0) : 0;
  };

  if (loading) {
    return <div className="admin-pricing-page"><div className="loading">Chargement...</div></div>;
  }

  return (
    <div className="admin-pricing-page">
      <h1>💰 Configuration Tarification</h1>
      <p className="subtitle">Gérez les coûts des services AI et les prix de vente des crédits</p>

      {message && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}

      {/* Marge bénéficiaire globale */}
      <div className="pricing-section">
        <h2>📈 Marge Bénéficiaire</h2>
        <div className="margin-config">
          <label>
            Marge sur les tokens (%)
            <input 
              type="number" 
              value={profitMargin}
              onChange={(e) => setProfitMargin(parseFloat(e.target.value) || 0)}
              min="0"
              max="100"
              step="5"
            />
          </label>
          <div className="margin-info">
            <p>Cette marge s'applique sur le coût réel des tokens pour calculer le prix de vente.</p>
            <p><strong>Exemple :</strong> Si un token coûte 0,001€ et la marge est de {profitMargin}%, 
            le prix de vente sera {(0.001 * (1 + profitMargin / 100)).toFixed(4)}€</p>
          </div>
        </div>
      </div>

      {/* Coûts par service */}
      <div className="pricing-section">
        <h2>🤖 Coûts des Services AI (par 1000 tokens)</h2>
        <p className="section-description">Configurez les coûts réels facturés par chaque fournisseur AI</p>
        
        {Object.entries(serviceCosts).map(([service, models]) => (
          <div key={service} className="service-costs">
            <h3>{service.charAt(0).toUpperCase() + service.slice(1)}</h3>
            <div className="models-grid">
              {Object.entries(models).map(([model, costs]) => (
                <div key={model} className="model-cost-card">
                  <h4>{model}</h4>
                  <div className="cost-inputs">
                    <label>
                      Input ($/1k tokens)
                      <input 
                        type="number"
                        value={costs.input}
                        onChange={(e) => updateServiceCost(service, model, 'input', e.target.value)}
                        step="0.0001"
                        min="0"
                      />
                    </label>
                    <label>
                      Output ($/1k tokens)
                      <input 
                        type="number"
                        value={costs.output}
                        onChange={(e) => updateServiceCost(service, model, 'output', e.target.value)}
                        step="0.0001"
                        min="0"
                      />
                    </label>
                  </div>
                  <div className="cost-summary">
                    <small>Prix de vente (avec {profitMargin}% marge):</small>
                    <div>
                      Input: ${(costs.input * (1 + profitMargin / 100)).toFixed(4)} | 
                      Output: ${(costs.output * (1 + profitMargin / 100)).toFixed(4)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Offres de recharge */}
      <div className="pricing-section">
        <h2>💳 Offres de Recharge</h2>
        <p className="section-description">Configurez les packs de crédits proposés aux clients</p>
        
        <div className="recharge-offers-grid">
          {rechargeOffers.map(offer => (
            <div key={offer.id} className={`offer-card ${offer.popular ? 'popular' : ''}`}>
              <div className="offer-header">
                <input 
                  type="text"
                  value={offer.name}
                  onChange={(e) => updateRechargeOffer(offer.id, 'name', e.target.value)}
                  className="offer-name-input"
                />
                <label className="popular-toggle">
                  <input 
                    type="checkbox"
                    checked={offer.popular}
                    onChange={(e) => updateRechargeOffer(offer.id, 'popular', e.target.checked)}
                  />
                  Populaire
                </label>
              </div>
              
              <div className="offer-inputs">
                <label>
                  Prix (€)
                  <input 
                    type="number"
                    value={offer.price}
                    onChange={(e) => updateRechargeOffer(offer.id, 'price', e.target.value)}
                    min="1"
                    step="1"
                  />
                </label>
                <label>
                  Crédits
                  <input 
                    type="number"
                    value={offer.credits}
                    onChange={(e) => updateRechargeOffer(offer.id, 'credits', e.target.value)}
                    min="1"
                    step="10"
                  />
                </label>
              </div>
              
              <div className="offer-stats">
                <div className="stat">
                  <span className="stat-label">Prix/crédit</span>
                  <span className="stat-value">{calculatePricePerCredit(offer.price, offer.credits)}€</span>
                </div>
                {calculateSavings(offer) > 0 && (
                  <div className="stat savings">
                    <span className="stat-label">Économie</span>
                    <span className="stat-value">{calculateSavings(offer)}%</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bouton de sauvegarde */}
      <div className="pricing-actions">
        <button onClick={handleSavePricing} className="btn-save">
          <i className="fas fa-save"></i>
          Sauvegarder la Configuration
        </button>
      </div>
    </div>
  );
};

export default AdminPricingPage;
