import { useState, useEffect } from 'react';
import { useAssistantAutoSave } from '../hooks/useLocalStorage';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getAccountText } from '../i18n/accountTranslations';
import MenuBar from './MenuBar';
import InvoiceList from './InvoiceList';
import './AccountPage.css';

const AccountPageFixed = () => {
  const { autoSaveData, updateAutoSave } = useAssistantAutoSave();
  const [activeTab, setActiveTab] = useState('profile');
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAuth();

  const [userData, setUserData] = useState({
    username: autoSaveData.username || 'utilisateur123',
    email: autoSaveData.email || 'contact@studioducapbrun.com',
    firstName: autoSaveData.firstName || 'Studio',
    lastName: autoSaveData.lastName || 'du Cap Brun',
    company: autoSaveData.company || 'Studio du Cap Brun',
    phone: autoSaveData.phone || '+33 6 12 34 56 78',
    address: autoSaveData.address || '123 Avenue de la Création, 75000 Paris',
    language: autoSaveData.language || 'fr',
    notifications: autoSaveData.notifications !== undefined ? autoSaveData.notifications : true,
    autoSave: autoSaveData.autoSave !== undefined ? autoSaveData.autoSave : true,
    theme: autoSaveData.theme || 'auto',
    bio: autoSaveData.bio || 'Créateur de contenu passionné par l\'IA et la communication digitale'
  });

  const handleInputChange = (field, value) => {
    const newData = { ...userData, [field]: value };
    setUserData(newData);
    updateAutoSave(newData);
  };

  // Fonction de traduction basée sur la langue sélectionnée
  const t = (path) => getAccountText(userData.language, path);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, isLoading, navigate]);

  if (!isAuthenticated) {
    return null;
  }

  const renderProfileTab = () => (
    <div className="account-content-single-column">
      <div className="form-section form-section-profile">
        <h3>{t('profile.title')}</h3>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="firstName">{t('profile.firstName')}</label>
            <input
              type="text"
              id="firstName"
              value={userData.firstName}
              onChange={(e) => handleInputChange('firstName', e.target.value)}
              placeholder="Votre prénom"
            />
          </div>
          <div className="form-group">
            <label htmlFor="lastName">{t('profile.lastName')}</label>
            <input
              type="text"
              id="lastName"
              value={userData.lastName}
              onChange={(e) => handleInputChange('lastName', e.target.value)}
              placeholder="Votre nom"
            />
          </div>
          <div className="form-group">
            <label htmlFor="email">{t('profile.email')}</label>
            <input
              type="email"
              id="email"
              value={userData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="votre@email.com"
            />
          </div>
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="phone">{t('profile.phone')}</label>
            <input
              type="tel"
              id="phone"
              value={userData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              placeholder="+33 6 12 34 56 78"
            />
          </div>
          <div className="form-group">
            <label htmlFor="company">{t('profile.company')}</label>
            <input
              type="text"
              id="company"
              value={userData.company}
              onChange={(e) => handleInputChange('company', e.target.value)}
              placeholder="Nom de votre entreprise"
            />
          </div>
          <div className="form-group">
            <label htmlFor="address">{t('profile.address')}</label>
            <input
              type="text"
              id="address"
              value={userData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              placeholder="Votre adresse complète"
            />
          </div>
        </div>
        
        <div className="form-group">
          <label htmlFor="bio">{t('profile.bio')}</label>
          <textarea
            id="bio"
            value={userData.bio}
            onChange={(e) => handleInputChange('bio', e.target.value)}
            placeholder={t('profile.bioPlaceholder')}
            rows="4"
          />
        </div>
      </div>
    </div>
  );

  const renderPreferencesTab = () => (
    <div className="account-content-single-column">
      <div className="form-section">
        <h3>{t('preferences.title')}</h3>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="language">{t('preferences.language')}</label>
            <select
              id="language"
              value={userData.language}
              onChange={(e) => handleInputChange('language', e.target.value)}
            >
              <option value="fr">Français</option>
              <option value="en">English</option>
              <option value="es">Español</option>
              <option value="de">Deutsch</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="theme">{t('preferences.theme')}</label>
            <select
              id="theme"
              value={userData.theme}
              onChange={(e) => handleInputChange('theme', e.target.value)}
            >
              <option value="auto">{t('preferences.themeAuto')}</option>
              <option value="light">{t('preferences.themeLight')}</option>
              <option value="dark">{t('preferences.themeDark')}</option>
            </select>
          </div>
        </div>
        
        <h3>{t('preferences.featuresTitle')}</h3>
        <div className="checkbox-row" style={{ marginTop: '10px' }}>
          <div className="form-group checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={userData.notifications}
                onChange={(e) => handleInputChange('notifications', e.target.checked)}
              />
              <span style={{ fontSize: '1.2rem' }}>{t('preferences.notifications')}</span>
            </label>
          </div>
          <div className="form-group checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={userData.autoSave}
                onChange={(e) => handleInputChange('autoSave', e.target.checked)}
              />
              <span style={{ fontSize: '1.2rem' }}>{t('preferences.autoSave')}</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSecurityTab = () => (
    <div className="account-content-single-column">
      <div className="form-section">
        <h3>{t('security.title')}</h3>
        <div className="form-group">
          <label>{t('security.currentPassword')}</label>
          <input type="password" placeholder={t('security.currentPassword')} />
        </div>
        <div className="form-group">
          <label>{t('security.newPassword')}</label>
          <input type="password" placeholder={t('security.newPassword')} />
        </div>
        <div className="form-group">
          <label>{t('security.confirmPassword')}</label>
          <input type="password" placeholder={t('security.confirmPassword')} />
        </div>
        <div className="button-row">
          <button className="btn-primary">{t('security.changePassword')}</button>
          <button className="btn-secondary">{t('security.logoutAllDevices')}</button>
        </div>
        
        <div className="form-section" style={{ marginTop: '2rem' }}>
          <h3>{t('security.accountSecurity')}</h3>
          <div className="security-info">
            <p>Dernière connexion : Aujourd'hui à 14:32</p>
            <p>Adresse IP : 192.168.1.1</p>
            <p>Navigateur : Chrome 120.0</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSubscriptionTab = () => {
    const currentBalance = autoSaveData.balance || 0;

    return (
      <div className="account-content-two-columns">
        <div className="column-left">
          <div className="form-section">
            <h3>{t('accounting.rechargeSystem')}</h3>
            <div className="freedom-message-top" style={{ margin: '1rem 0' }}>
              <div className="freedom-icon">
                <i className="fas fa-dove"></i>
              </div>
              <div className="freedom-content">
                <h4>{t('accounting.freedom.title')}</h4>
                <p>
                  {t('accounting.freedom.description')}
                </p>
                <ul>
                  <li><i className="fas fa-check"></i> {t('accounting.freedom.noCommitment')}</li>
                  <li><i className="fas fa-check"></i> {t('accounting.freedom.noExpiration')}</li>
                  <li><i className="fas fa-check"></i> {t('accounting.freedom.yourPace')}</li>
                  <li><i className="fas fa-check"></i> {t('accounting.freedom.totalControl')}</li>
                </ul>
              </div>
              <button className="btn-recharge-integrated" onClick={() => navigate('/subscription')}>
                {t('accounting.rechargeButton')}
              </button>
              <div className="balance-card-integrated">
                <i className="fas fa-wallet"></i>
                <div className="balance-info">
                  <h3>{t('accounting.currentBalance')}</h3>
                  <span className="balance-amount">{currentBalance.toFixed(2)}€</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="column-right">
          <div className="form-section">
            <h3>{t('accounting.billingInfo')}</h3>
            <div className="billing-info">
              <p>{t('accounting.noSubscription')}</p>
              <p>{t('accounting.rechargeAnytime')}</p>
            </div>
            
            {/* Liste des factures */}
            <InvoiceList 
              userEmail={userData.email}
              userName={`${userData.firstName} ${userData.lastName}`}
              userAddress={userData.address}
              userCompany={userData.company}
              language={userData.language}
            />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="page-container">
      <MenuBar onHelp={() => {}} />
      <div className="page-content">
        <div className="account-page" style={{ marginTop: '-26px', paddingTop: '20px' }}>
          <h2 className="page-title">{t('title')}</h2>

          <div className="account-tabs" style={{ marginTop: '15px' }}>
            <button 
              className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => setActiveTab('profile')}
            >
              {t('tabs.profile')}
            </button>
            <button 
              className={`tab-btn ${activeTab === 'security' ? 'active' : ''}`}
              onClick={() => setActiveTab('security')}
            >
              {t('tabs.security')}
            </button>
            <button 
              className={`tab-btn ${activeTab === 'preferences' ? 'active' : ''}`}
              onClick={() => setActiveTab('preferences')}
            >
              {t('tabs.preferences')}
            </button>
            <button 
              className={`tab-btn ${activeTab === 'subscription' ? 'active' : ''}`}
              onClick={() => setActiveTab('subscription')}
            >
              {t('tabs.accounting')}
            </button>
          </div>

          <div className="account-content" style={{ marginTop: activeTab === 'profile' ? '30px' : activeTab === 'preferences' ? '15px' : '0' }}>
            {activeTab === 'profile' && renderProfileTab()}
            {activeTab === 'security' && renderSecurityTab()}
            {activeTab === 'preferences' && renderPreferencesTab()}
            {activeTab === 'subscription' && renderSubscriptionTab()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountPageFixed;
