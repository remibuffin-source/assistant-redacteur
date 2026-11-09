import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAssistantAutoSave } from '../hooks/useLocalStorage';
import { getSubscriptionText } from '../i18n/subscriptionTranslations';
import MenuBar from './MenuBar';
import StripePayment from './StripePayment';
import { createInvoice } from '../utils/invoiceGenerator';
import './SubscriptionPage.css';
import './SubscriptionPageOffers.css';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const SubscriptionPage = () => {
  const { autoSaveData, updateAutoSave } = useAssistantAutoSave();
  const navigate = useNavigate();
  const [selectedAmount, setSelectedAmount] = useState('');
  const [customAmount, setCustomAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Récupérer la langue depuis les données utilisateur
  const userLanguage = autoSaveData.language || 'fr';
  const t = (path) => getSubscriptionText(userLanguage, path);

  // Solde réel depuis la BDD
  const [realBalance, setRealBalance] = useState(null);
  const [loadingBalance, setLoadingBalance] = useState(true);

  // Offres de recharge chargées depuis l'API
  const [rechargeOffers, setRechargeOffers] = useState([
    { id: 'basic', name: 'Essentiel', price: 50, credits: 1111, discount: 10, popular: false },
    { id: 'comfort', name: 'Confort', price: 100, credits: 2500, discount: 20, popular: true },
    { id: 'pro', name: 'Professionnel', price: 200, credits: 5714, discount: 30, popular: false },
    { id: 'expert', name: 'Expert', price: 400, credits: 13333, discount: 40, popular: false }
  ]);

  // Charger le solde réel depuis la BDD
  useEffect(() => {
    const loadBalance = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setLoadingBalance(false);
          return;
        }
        const response = await fetch(`${API_BASE_URL}/credits/balance`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setRealBalance(data.credits?.balance ?? data.balance ?? 0);
        }
      } catch (error) {
        console.error('Erreur chargement solde:', error);
      } finally {
        setLoadingBalance(false);
      }
    };
    loadBalance();
  }, []);

  // Charger les offres depuis l'API au montage
  useEffect(() => {
    const loadOffers = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/pricing/offers`);
        if (response.ok) {
          const data = await response.json();
          if (data.offers && data.offers.length > 0) {
            setRechargeOffers(data.offers);
          }
        }
      } catch (error) {
        console.error('Erreur chargement offres:', error);
      }
    };
    loadOffers();
  }, []);

  const handleAmountSelect = (amount) => {
    setSelectedAmount(amount);
    setCustomAmount('');
  };

  const handleCustomAmountChange = (value) => {
    setCustomAmount(value);
    setSelectedAmount('');
  };

  const [showStripePayment, setShowStripePayment] = useState(false);

  const handleRecharge = () => {
    const amount = selectedAmount || customAmount;
    if (!amount || parseFloat(amount) <= 0) {
      alert(t('recharge.invalidAmount'));
      return;
    }

    setIsProcessing(true);

    // Ouvrir le terminal de paiement Stripe
    setShowStripePayment(true);
  };

  const handlePaymentSuccess = async (amount) => {
    const newBalance = (autoSaveData.balance || 0) + parseFloat(amount);
    updateAutoSave({ ...autoSaveData, balance: newBalance });
    
    // Générer automatiquement une facture (numéro attribué par le serveur)
    const invoice = await createInvoice(
      parseFloat(amount),
      autoSaveData.email || 'contact@studioducapbrun.com',
      'stripe'
    );
    
    console.log('Facture générée:', invoice);
    
    setIsProcessing(false);
    setShowStripePayment(false);
    alert(t('recharge.successMessage').replace('{amount}', amount) + `\n\nFacture ${invoice.number || ''} générée avec succès !`);
    navigate('/');
  };

  const handlePaymentError = (error) => {
    console.error('Erreur de paiement:', error);
    setIsProcessing(false);
    setShowStripePayment(false);
    alert(t('recharge.errorMessage'));
  };

  // Utiliser le solde réel de la BDD, sinon fallback sur localStorage
  const currentBalance = realBalance !== null ? realBalance : (autoSaveData.balance || 0);

  return (
    <div className="page-container">
      <MenuBar onHelp={() => {}} />
      <div className="page-content">
        <div className="subscription-page" style={{ marginTop: '-50px' }}>

          {/* Solde actuel intégré dans le message de liberté */}
          <div className="freedom-message-top">
            <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
              <div className="freedom-icon">
                <i className="fas fa-dove"></i>
              </div>
              <div className="freedom-content" style={{ flex: 1 }}>
                <h4>{t('freedom.title')}</h4>
                <p>
                  {t('freedom.description')}
                </p>
                <ul>
                  <li><i className="fas fa-check"></i> {t('freedom.noCommitment')}</li>
                  <li><i className="fas fa-check"></i> {t('freedom.noExpiration')}</li>
                  <li><i className="fas fa-check"></i> {t('freedom.yourPace')}</li>
                  <li><i className="fas fa-check"></i> {t('freedom.totalControl')}</li>
                </ul>
              </div>
              {/* Solde actuel à droite, encadré orange */}
              <div style={{ 
                background: 'linear-gradient(135deg, #ff6b2c 0%, #ff8f5a 100%)',
                borderRadius: '12px',
                padding: '20px 30px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: '180px',
                boxShadow: '0 4px 15px rgba(255, 107, 44, 0.3)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <i className="fas fa-wallet" style={{ color: 'white', fontSize: '1rem' }}></i>
                  <span style={{ color: 'white', fontSize: '0.9rem', fontWeight: '500' }}>{t('balance.title')}</span>
                </div>
                <span style={{ 
                  color: 'white', 
                  fontSize: '1.8rem', 
                  fontWeight: '700',
                  textShadow: '0 2px 4px rgba(0,0,0,0.2)'
                }}>
                  {loadingBalance ? '...' : currentBalance.toFixed(2)}{t('balance.currency')}
                </span>
              </div>
            </div>
          </div>

          <div className="recharge-options">
            <h3 className="choose-amount-title">{t('recharge.chooseAmount')}</h3>
            
            <div className="custom-amount-inline">
              <div className="custom-input-horizontal">
                <input
                  type="number"
                  value={customAmount}
                  onChange={(e) => handleCustomAmountChange(e.target.value)}
                  placeholder={t('recharge.placeholder')}
                  min="1"
                  step="0.01"
                  className="amount-input"
                />
                <button
                  className="recharge-btn-inline"
                  onClick={handleRecharge}
                  disabled={isProcessing || (!selectedAmount && !customAmount)}
                >
                  {isProcessing ? (
                    <>
                      <div className="loader"></div>
                      {t('recharge.processing')}
                    </>
                  ) : (
                    <>
                      <i className="fas fa-bolt"></i>
                      {t('recharge.button')}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Terminal de paiement Stripe */}
          {showStripePayment && (
            <StripePayment
              amount={parseFloat(selectedAmount || customAmount)}
              onSuccess={handlePaymentSuccess}
              onError={handlePaymentError}
              onCancel={() => {
                setShowStripePayment(false);
                setIsProcessing(false);
              }}
            />
          )}

          {/* Offres de recharge avec remises */}
          <div className="recharge-offers-section">
            <h3 className="offers-title">💳 Offres de Recharge</h3>
            <p className="offers-subtitle">Profitez de remises avantageuses sur vos recharges</p>
            
            <div className="offers-grid">
              {rechargeOffers.map(offer => (
                <div 
                  key={offer.id} 
                  className={`offer-card-client ${offer.popular ? 'popular' : ''} ${selectedAmount === offer.price ? 'selected' : ''}`}
                  onClick={() => handleAmountSelect(offer.price)}
                >
                  {offer.popular && <div className="popular-badge">⭐ POPULAIRE</div>}
                  
                  <div className="offer-header-client">
                    <h4>{offer.name}</h4>
                    <div className="offer-price">{offer.price}€</div>
                  </div>
                  
                  <div className="offer-credits">
                    <span className="credits-amount">{offer.credits.toLocaleString()}</span>
                    <span className="credits-label">crédits</span>
                  </div>
                  
                  <div className="offer-discount-badge">
                    <i className="fas fa-tag"></i>
                    <span>{offer.discount}% de remise</span>
                  </div>
                  
                  <div className="offer-benefits-client">
                    <div className="benefit">
                      <i className="fas fa-infinity"></i>
                      <span>Sans expiration</span>
                    </div>
                    <div className="benefit">
                      <i className="fas fa-check-circle"></i>
                      <span>Pas d'engagement</span>
                    </div>
                  </div>
                  
                  <button 
                    className="select-offer-btn"
                    onClick={(e) => {
                      e.stopPropagation(); // Empêcher la propagation au div parent
                      handleAmountSelect(offer.price);
                      setTimeout(() => handleRecharge(), 100); // Déclencher le paiement
                    }}
                  >
                    <i className="fas fa-shopping-cart"></i>
                    Choisir
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="recharge-action-bottom">
            
            <p className="security-note">
              <i className="fas fa-shield-alt"></i>
              {t('security.note')}
            </p>
          </div>

          <div className="features-grid">
            <div className="feature-card">
              <i className="fas fa-infinity"></i>
              <h4>{t('features.lifetime.title')}</h4>
              <p>{t('features.lifetime.description')}</p>
            </div>
            
            <div className="feature-card">
              <i className="fas fa-chart-line"></i>
              <h4>{t('features.savings.title')}</h4>
              <p>{t('features.savings.description')}</p>
            </div>
            
            <div className="feature-card">
              <i className="fas fa-sync"></i>
              <h4>{t('features.flexibility.title')}</h4>
              <p>{t('features.flexibility.description')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPage;