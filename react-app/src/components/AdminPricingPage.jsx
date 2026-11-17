import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import MenuBar from './MenuBar';
import './AdminPricingPage.css';
import './ConfigAPIPage.css'; // Pour utiliser les styles de la sidebar admin

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

// Debug : Afficher les variables d'environnement au chargement
console.log('🔍 Variables d\'environnement Vite:');
console.log('  - VITE_API_URL:', import.meta.env.VITE_API_URL);
console.log('  - API_BASE_URL utilisée:', API_BASE_URL);
console.log('  - Toutes les vars VITE:', Object.keys(import.meta.env).filter(k => k.startsWith('VITE_')));

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
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [activeTab, setActiveTab] = useState('pricing');
  
  // Configuration des coûts par service (ce que ça nous coûte)
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

  // NOUVEAU : Configuration des coûts par image
  const [imageServiceCosts, setImageServiceCosts] = useState({
    'fal': {
      'seedream-4.5-text-to-image': { cost: 0.04, unit: 'image' },
      'seedream-4.5-edit': { cost: 0.04, unit: 'image' }
    },
    'openrouter': {
        'nano-banana': { cost: 0.04, unit: 'image' }
    }
  });

  // Marge bénéficiaire (en %)
  const [profitMargin, setProfitMargin] = useState(30); // 30% de marge par défaut
  const [imageProfitMargin, setImageProfitMargin] = useState(50); // 50% de marge par défaut pour les images
  const [maxCreditsPerImage, setMaxCreditsPerImage] = useState(3); // Plafond de crédits par image
  
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
      const url = `${API_BASE_URL}/pricing/config`;
      console.log('🔍 URL appelée:', url);
      console.log('🔍 API_BASE_URL:', API_BASE_URL);
      const response = await fetch(url, { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        console.log('📥 Configuration chargée:', data);
        
        if (data.serviceCosts && Object.keys(data.serviceCosts).length > 0) {
          setServiceCosts(data.serviceCosts);
        }
        if (data.imageServiceCosts && Object.keys(data.imageServiceCosts).length > 0) {
          setImageServiceCosts(data.imageServiceCosts);
        }
        if (data.profitMargin) {
          setProfitMargin(data.profitMargin);
        }
        if (data.imageProfitMargin) {
          setImageProfitMargin(data.imageProfitMargin);
        }
        if (data.maxCreditsPerImage) {
          setMaxCreditsPerImage(data.maxCreditsPerImage);
        }
        if (data.rechargeOffers && data.rechargeOffers.length > 0) {
          setRechargeOffers(data.rechargeOffers);
        }
      }
      setLoading(false);
    } catch (error) {
      console.error('Erreur chargement config:', error);
      setLoading(false);
    }
  };

  const handleSavePricing = async () => {
    setSaving(true);
    try {
      const payload = {
        serviceCosts,
        imageServiceCosts,
        profitMargin,
        imageProfitMargin,
        maxCreditsPerImage,
        rechargeOffers
      };
      
      console.log('💾 Sauvegarde de la configuration:', payload);
      
      const response = await fetch(`${API_BASE_URL}/pricing/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload)
      });
      
      console.log('📡 Réponse serveur:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ Erreur serveur:', errorData);
        throw new Error(errorData.error || 'Erreur lors de la sauvegarde');
      }
      
      const result = await response.json();
      console.log('✅ Sauvegarde réussie:', result);
      
      setMessage({ type: 'success', text: '✅ Configuration sauvegardée avec succès !' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('❌ Erreur complète:', error);
      setMessage({ type: 'error', text: `❌ Erreur: ${error.message}` });
      setTimeout(() => setMessage(null), 5000);
    } finally {
      setSaving(false);
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

  const updateImageServiceCost = (service, model, field, value) => {
    setImageServiceCosts(prev => ({
      ...prev,
      [service]: {
        ...prev[service],
        [model]: {
          ...prev[service][model],
          [field]: field === 'unit' ? value : (parseFloat(value) || 0)
        }
      }
    }));
  };

  const updateRechargeOffer = (id, field, value) => {
    const CREDIT_BASE_PRICE = 0.05; // 1 crédit = 0.05€ sans remise
    
    setRechargeOffers(prev => prev.map(offer => {
      if (offer.id !== id) return offer;
      
      // Si c'est le champ "popular", pas de calcul
      if (field === 'popular') {
        return { ...offer, popular: value };
      }
      
      const numValue = parseFloat(value) || 0;
      
      // Calculer automatiquement selon le champ modifié
      if (field === 'price') {
        // Prix modifié → Recalculer les crédits
        const newCredits = Math.round(numValue / (CREDIT_BASE_PRICE * (1 - offer.discount / 100)));
        return { ...offer, price: numValue, credits: newCredits };
      } 
      else if (field === 'credits') {
        // Crédits modifiés → Recalculer le prix
        const newPrice = Math.round(numValue * CREDIT_BASE_PRICE * (1 - offer.discount / 100));
        return { ...offer, credits: numValue, price: newPrice };
      } 
      else if (field === 'discount') {
        // Remise modifiée → Recalculer les crédits (garder le prix fixe)
        const newCredits = Math.round(offer.price / (CREDIT_BASE_PRICE * (1 - numValue / 100)));
        
        // Avertissement si remise > marge bénéficiaire
        if (numValue > profitMargin) {
          setMessage({ 
            type: 'error', 
            text: `⚠️ ATTENTION: La remise de ${numValue}% est supérieure à votre marge bénéficiaire de ${profitMargin}%. Vous perdez de l'argent sur cette offre !` 
          });
          setTimeout(() => setMessage(null), 8000);
        }
        
        return { ...offer, discount: numValue, credits: newCredits };
      }
      
      return offer;
    }));
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
                onClick={() => navigate('/config-api?tab=prompt-builder')}
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
                <i className="fas fa-credit-card"></i>
                <span>Souscriptions</span>
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
        <div className="margin-config" style={{display: 'flex', gap: '12px', flexDirection: 'row'}}>
          <div style={{background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', flex: '1 1 0', width: '33%'}}>
            <label style={{display: 'block', fontWeight: '600', marginBottom: '8px', color: '#374151', fontSize: '13px'}}>
              Marge tokens (%)
            </label>
            <input 
              type="number" 
              value={profitMargin}
              onChange={(e) => setProfitMargin(parseFloat(e.target.value) || 0)}
              min="0"
              max="100"
              step="5"
              style={{width: '100%', padding: '10px', fontSize: '16px', borderRadius: '6px', border: '2px solid #e2e8f0'}}
            />
            <p style={{margin: '8px 0 0 0', color: '#059669', fontSize: '12px'}}><strong>Ex:</strong> 0,001€ + {profitMargin}% = {(0.001 * (1 + profitMargin / 100)).toFixed(4)}€</p>
          </div>
          <div style={{background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', flex: '1 1 0', width: '33%'}}>
            <label style={{display: 'block', fontWeight: '600', marginBottom: '6px', color: '#374151', fontSize: '12px'}}>
              Marge images (%)
            </label>
            <input 
              type="number" 
              value={imageProfitMargin}
              onChange={(e) => setImageProfitMargin(parseFloat(e.target.value) || 0)}
              min="0"
              max="100"
              step="5"
              style={{width: '100%', padding: '10px', fontSize: '16px', borderRadius: '6px', border: '2px solid #e2e8f0'}}
            />
            <p style={{margin: '8px 0 0 0', color: '#059669', fontSize: '12px'}}><strong>Ex:</strong> 0,04$ + {imageProfitMargin}% = {(0.04 * (1 + imageProfitMargin / 100)).toFixed(3)}$</p>
          </div>
          <div style={{background: '#fef3c7', padding: '12px', borderRadius: '8px', border: '1px solid #f59e0b', flex: '1 1 0', width: '33%'}}>
            <label style={{display: 'block', fontWeight: '600', marginBottom: '8px', color: '#92400e', fontSize: '13px'}}>
              Plafond crédits/image
            </label>
            <input 
              type="number" 
              value={maxCreditsPerImage}
              onChange={(e) => setMaxCreditsPerImage(parseFloat(e.target.value) || 3)}
              min="1"
              max="20"
              step="1"
              style={{width: '100%', padding: '10px', fontSize: '16px', borderRadius: '6px', border: '2px solid #f59e0b'}}
            />
            <p style={{margin: '8px 0 0 0', color: '#b45309', fontSize: '12px'}}><strong>Actuel :</strong> {maxCreditsPerImage} crédits max/image</p>
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

      {/* NOUVEAU : Coûts par image */}
      <div className="pricing-section">
        <h2>🖼️ Coûts des Services AI (par Image)</h2>
        <p className="section-description">Configurez les coûts réels pour la génération d'images</p>
        {Object.entries(imageServiceCosts).filter(([service]) => service !== 'wan-2.6').map(([service, models]) => (
          <div key={service} className="service-costs">
            <h3>{service.charAt(0).toUpperCase() + service.slice(1)}</h3>
            <div className="models-grid">
              {Object.entries(models).map(([model, costs]) => (
                <div key={model} className="model-cost-card">
                  <h4>{model}</h4>
                  <div className="cost-inputs">
                    <label>
                      Coût ($)
                      <input
                        type="number"
                        value={costs.cost}
                        onChange={(e) => updateImageServiceCost(service, model, 'cost', e.target.value)}
                        step="0.0001"
                        min="0"
                      />
                    </label>
                    <label>
                      Unité
                      <input
                        type="text"
                        value={costs.unit || 'image'}
                        onChange={(e) => updateImageServiceCost(service, model, 'unit', e.target.value)}
                      />
                    </label>
                  </div>
                  <div className="cost-summary">
                    <small>Prix de vente (avec {imageProfitMargin}% marge, plafond {maxCreditsPerImage} crédits):</small>
                    <div>
                      <strong>${(costs.cost * (1 + imageProfitMargin / 100)).toFixed(4)}</strong> / {costs.unit || 'image'}
                      <span style={{marginLeft: '10px', color: '#6b7280', fontSize: '12px'}}>
                        = {Math.min(maxCreditsPerImage, ((costs.cost * (1 + imageProfitMargin / 100)) / 0.01)).toFixed(0)} crédits
                        {((costs.cost * (1 + imageProfitMargin / 100)) / 0.01) > maxCreditsPerImage && (
                          <span style={{color: '#f59e0b', marginLeft: '5px'}}>(plafonné)</span>
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* WAN 2.6 Vidéo */}
      {imageServiceCosts['wan-2.6'] && (
        <div className="pricing-section">
          <h2>🎬 Coûts WAN 2.6 (Génération Vidéo)</h2>
          <p className="section-description">Configurez les coûts réels pour la génération de vidéos (marge: {imageProfitMargin}%)</p>
          <div className="service-costs">
            <h3>WAN 2.6</h3>
            <div className="models-grid">
              {Object.entries(imageServiceCosts['wan-2.6']).map(([model, costs]) => (
                <div key={model} className="model-cost-card">
                  <h4>{model.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</h4>
                  <div className="cost-inputs">
                    <label>
                      Coût ($)
                      <input
                        type="number"
                        value={costs.cost}
                        onChange={(e) => updateImageServiceCost('wan-2.6', model, 'cost', e.target.value)}
                        step="0.01"
                        min="0"
                      />
                    </label>
                    <label>
                      Unité
                      <input
                        type="text"
                        value={costs.unit || 'video'}
                        onChange={(e) => updateImageServiceCost('wan-2.6', model, 'unit', e.target.value)}
                      />
                    </label>
                  </div>
                  <div className="cost-summary">
                    <small>Prix de vente (avec {imageProfitMargin}% marge):</small>
                    <div>
                      <strong>${(costs.cost * (1 + imageProfitMargin / 100)).toFixed(2)}</strong> / {costs.unit || 'video'}
                      <span style={{marginLeft: '10px', color: '#10b981', fontSize: '12px', fontWeight: 'bold'}}>
                        = {Math.ceil((costs.cost * (1 + imageProfitMargin / 100)) / 0.01)} crédits
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Offres de recharge */}
      <div className="pricing-section">
        <h2>💳 Offres de Recharge</h2>
        <p className="section-description">Configurez les packs de crédits proposés aux clients</p>
        <div className="pricing-info-box">
          <i className="fas fa-info-circle"></i>
          <div>
            <strong>Calcul automatique :</strong> Modifiez le Prix, les Crédits ou la Remise, les autres valeurs s'ajustent automatiquement.
            <br />
            <strong>Base :</strong> 1 crédit = 0,05€ (sans remise)
          </div>
        </div>
        
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
              <button 
                onClick={handleSavePricing} 
                className="btn-save"
                disabled={saving}
              >
                {saving ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i>
                    Sauvegarde en cours...
                  </>
                ) : (
                  <>
                    <i className="fas fa-save"></i>
                    Sauvegarder la Configuration
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPricingPage;
