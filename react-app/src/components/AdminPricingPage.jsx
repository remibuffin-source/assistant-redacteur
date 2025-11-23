import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import MenuBar from './MenuBar';
import './AdminPricingPage.css';
import './ConfigAPIPage.css'; // Pour utiliser les styles de la sidebar admin

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

/**
 * Page Admin pour configurer :
 * - Les coûts des tokens par service AI
 * - Les prix de vente des crédits (offres de recharge)
 * - Les marges bénéficiaires
 */
const AdminPricingPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const [activeTab, setActiveTab] = useState('pricing');
  
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
  // Prix de base : 1 crédit = 0.05€ (sans remise)
  // Avec remise : crédits = prix / (0.05 * (1 - remise%))
  const [rechargeOffers, setRechargeOffers] = useState([
    { id: 'basic', name: 'Essentiel', price: 50, credits: 1111, discount: 10, popular: false },      // 50 / (0.05 * 0.9) = 1111
    { id: 'comfort', name: 'Confort', price: 100, credits: 2500, discount: 20, popular: true },      // 100 / (0.05 * 0.8) = 2500
    { id: 'pro', name: 'Professionnel', price: 200, credits: 5714, discount: 30, popular: false },   // 200 / (0.05 * 0.7) = 5714
    { id: 'expert', name: 'Expert', price: 400, credits: 13333, discount: 40, popular: false }       // 400 / (0.05 * 0.6) = 13333
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
    return (
      <div className="page-container">
        <MenuBar onHelp={() => {}} />
        <div className="page-content" style={{paddingTop: '20px', paddingLeft: '5px', paddingRight: '30px'}}>
          <div className="loading">Chargement...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <MenuBar onHelp={() => {}} />
      <div className="page-content" style={{paddingTop: '20px', paddingLeft: '5px', paddingRight: '30px'}}>
        <div className="admin-page-layout">
          {/* Menu vertical à gauche */}
          <div className="admin-sidebar">
            <div className="admin-sidebar-header">
              <i className="fas fa-shield-alt"></i>
              <h3>Administration</h3>
            </div>
            <nav className="admin-nav">
              <button 
                className={`admin-nav-btn ${activeTab === 'api-keys' ? 'active' : ''}`}
                onClick={() => navigate('/config-api')}
              >
                <i className="fas fa-key"></i>
                <span>Clés API IA</span>
              </button>
              <button 
                className={`admin-nav-btn ${activeTab === 'prompt-builder' ? 'active' : ''}`}
                onClick={() => navigate('/admin-prompt-builder')}
              >
                <i className="fas fa-cogs"></i>
                <span>Prompt Builder</span>
              </button>
              <button 
                className={`admin-nav-btn ${activeTab === 'pricing' ? 'active' : ''}`}
                onClick={() => setActiveTab('pricing')}
              >
                <i className="fas fa-dollar-sign"></i>
                <span>Tarification</span>
              </button>
              <button 
                className={`admin-nav-btn ${activeTab === 'credits' ? 'active' : ''}`}
                onClick={() => navigate('/admin-credits')}
              >
                <i className="fas fa-coins"></i>
                <span>Gestion Crédits</span>
              </button>
            </nav>
          </div>

          {/* Contenu principal */}
          <div className="admin-main-content">
            <div className="config-header">
              <div className="header-content">
                <h1>
                  <i className="fas fa-dollar-sign" style={{color: '#ff6b2c', marginRight: '12px'}}></i>
                  Configuration Tarification
                </h1>
                <p>Gérez les coûts des services AI et les prix de vente des crédits</p>
              </div>
            </div>

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
                      Input ($/1k)
                      <input 
                        type="number"
                        value={costs.input}
                        onChange={(e) => updateServiceCost(service, model, 'input', e.target.value)}
                        step="0.0001"
                        min="0"
                      />
                    </label>
                    <label>
                      Output ($/1k)
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
                <label>
                  Remise (%)
                  <input 
                    type="number"
                    value={offer.discount || 0}
                    onChange={(e) => updateRechargeOffer(offer.id, 'discount', e.target.value)}
                    min="0"
                    max="100"
                    step="5"
                  />
                </label>
              </div>
              
              <div className="offer-benefits">
                <div className="benefit-badge">
                  <i className="fas fa-tag"></i>
                  <span>{offer.discount}% de remise</span>
                </div>
                <div className="benefit-item">
                  <i className="fas fa-infinity"></i>
                  <span>Crédits sans expiration</span>
                </div>
                <div className="benefit-item">
                  <i className="fas fa-check-circle"></i>
                  <span>Pas d'engagement</span>
                </div>
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
        </div>
      </div>
    </div>
  );
};

export default AdminPricingPage;
