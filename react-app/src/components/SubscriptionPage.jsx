import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAssistantAutoSave } from '../hooks/useLocalStorage';
import './SubscriptionPage.css';

const SubscriptionPage = () => {
  const { autoSaveData, updateAutoSave } = useAssistantAutoSave();
  const navigate = useNavigate();
  const [selectedAmount, setSelectedAmount] = useState('');
  const [customAmount, setCustomAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const presetAmounts = [
    { amount: 10, label: '10€ - Essentiel' },
    { amount: 25, label: '25€ - Confort' },
    { amount: 50, label: '50€ - Professionnel' },
    { amount: 100, label: '100€ - Expert' }
  ];

  const handleBackToMain = () => {
    navigate('/');
  };

  const handleAmountSelect = (amount) => {
    setSelectedAmount(amount);
    setCustomAmount('');
  };

  const handleCustomAmountChange = (value) => {
    setCustomAmount(value);
    setSelectedAmount('');
  };

  const handleRecharge = async () => {
    const amount = customAmount || selectedAmount;
    if (!amount || amount <= 0) {
      alert('Veuillez sélectionner ou saisir un montant valide');
      return;
    }

    setIsProcessing(true);
    
    // Simuler le processus de recharge
    setTimeout(() => {
      const newBalance = (autoSaveData.balance || 0) + parseFloat(amount);
      updateAutoSave({ ...autoSaveData, balance: newBalance });
      
      setIsProcessing(false);
      alert(`✅ Recharge réussie ! ${amount}€ ont été ajoutés à votre solde.`);
      navigate('/');
    }, 2000);
  };

  const currentBalance = autoSaveData.balance || 0;

  return (
    <div className="subscription-page">
      <button className="back-button" onClick={handleBackToMain}>
        <i className="fas fa-arrow-left"></i>
        Retour à l'accueil
      </button>
      
      <div className="subscription-header">
        <h2>
          <i className="fas fa-coins"></i>
          Recharge Libre
        </h2>
        <p>Rechargez votre solde selon vos besoins, sans engagement ni date d'expiration</p>
      </div>

      <div className="current-balance">
        <div className="balance-card">
          <i className="fas fa-wallet"></i>
          <div className="balance-info">
            <h3>Solde actuel</h3>
            <span className="balance-amount">{currentBalance.toFixed(2)}€</span>
          </div>
        </div>
      </div>

      <div className="recharge-options">
        <h3>Choisissez votre montant</h3>
        
        <div className="preset-amounts">
          {presetAmounts.map((preset) => (
            <button
              key={preset.amount}
              className={`amount-btn ${selectedAmount === preset.amount ? 'selected' : ''}`}
              onClick={() => handleAmountSelect(preset.amount)}
            >
              <span className="amount">{preset.amount}€</span>
              <span className="label">{preset.label}</span>
            </button>
          ))}
        </div>

        <div className="custom-amount">
          <h4>Ou saisissez un montant personnalisé</h4>
          <div className="custom-input">
            <input
              type="number"
              value={customAmount}
              onChange={(e) => handleCustomAmountChange(e.target.value)}
              placeholder="Montant en euros"
              min="1"
              step="0.01"
            />
            <span className="currency">€</span>
          </div>
        </div>
      </div>

      <div className="freedom-message">
        <div className="freedom-icon">
          <i className="fas fa-dove"></i>
        </div>
        <div className="freedom-content">
          <h4>Liberté totale, sans contrainte</h4>
          <p>
            Chez nous, pas d'abonnement contraignant ni de date de péremption. 
            Rechargez uniquement ce dont vous avez besoin, quand vous en avez besoin. 
            Votre argent reste disponible indéfinement, pour une consommation à votre rythme.
          </p>
          <ul>
            <li><i className="fas fa-check"></i> Pas d'engagement</li>
            <li><i className="fas fa-check"></i> Pas de date d'expiration</li>
            <li><i className="fas fa-check"></i> Consommation à votre tempo</li>
            <li><i className="fas fa-check"></i> Contrôle total de vos dépenses</li>
          </ul>
        </div>
      </div>

      <div className="recharge-action">
        <button
          className="recharge-btn"
          onClick={handleRecharge}
          disabled={isProcessing || (!selectedAmount && !customAmount)}
        >
          {isProcessing ? (
            <>
              <div className="loader"></div>
              Traitement en cours...
            </>
          ) : (
            <>
              <i className="fas fa-bolt"></i>
              Recharger {customAmount || selectedAmount}€
            </>
          )}
        </button>
        
        <p className="security-note">
          <i className="fas fa-shield-alt"></i>
          Paiement sécurisé - Vos données bancaires sont cryptées
        </p>
      </div>

      <div className="features-grid">
        <div className="feature-card">
          <i className="fas fa-infinity"></i>
          <h4>Valable à vie</h4>
          <p>Votre solde n'expire jamais, utilisez-le quand vous voulez</p>
        </div>
        
        <div className="feature-card">
          <i className="fas fa-chart-line"></i>
          <h4>Économisez</h4>
          <p>Payez seulement ce que vous consommez, sans frais cachés</p>
        </div>
        
        <div className="feature-card">
          <i className="fas fa-sync"></i>
          <h4>Flexibilité</h4>
          <p>Rechargez petit à petit selon vos besoins réels</p>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPage;