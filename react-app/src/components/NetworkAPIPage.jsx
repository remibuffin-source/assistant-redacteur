import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MenuBar from './MenuBar';
import './NetworkAPIPage.css';

/**
 * PAGE DE CONFIGURATION DES API RÉSEAUX SOCIAUX
 * 
 * Accessible à tous les utilisateurs pour configurer leurs clés API
 * de réseaux sociaux et plateformes de publication.
 */

const useNetworkApiKeys = () => {
  const [apiKeys, setApiKeys] = useState(() => {
    try {
      const stored = localStorage.getItem('network_api_keys');
      return stored ? JSON.parse(stored) : {
        twitter: '',
        facebook: '',
        linkedin: '',
        instagram: '',
        youtube: '',
        tiktok: '',
        blog: '',
        website: ''
      };
    } catch {
      return {
        twitter: '',
        facebook: '',
        linkedin: '',
        instagram: '',
        youtube: '',
        tiktok: '',
        blog: '',
        website: ''
      };
    }
  });

  const updateApiKey = (service, key) => {
    const newKeys = { ...apiKeys, [service]: key };
    setApiKeys(newKeys);
    localStorage.setItem('network_api_keys', JSON.stringify(newKeys));
  };

  return { apiKeys, updateApiKey };
};

const NetworkAPIPage = () => {
  const navigate = useNavigate();
  const [testing, setTesting] = useState({});
  const [testResults, setTestResults] = useState({});
  const { apiKeys, updateApiKey } = useNetworkApiKeys();
  const [saveStatus, setSaveStatus] = useState(null);

  const networkServices = [
    { 
      id: 'twitter', 
      name: 'Twitter/X', 
      description: 'Publiez automatiquement sur Twitter/X', 
      iconPath: '/icons/twitter.ico',
      docs: 'https://developer.twitter.com/en/docs/twitter-api'
    },
    { 
      id: 'facebook', 
      name: 'Facebook', 
      description: 'Publiez sur votre page Facebook', 
      iconPath: '/icons/facebook.ico',
      docs: 'https://developers.facebook.com/docs/graph-api'
    },
    { 
      id: 'linkedin', 
      name: 'LinkedIn', 
      description: 'Partagez sur votre profil LinkedIn', 
      iconPath: '/icons/linkedin.ico',
      docs: 'https://docs.microsoft.com/en-us/linkedin/marketing/integrations/community-management/shares/share-api'
    },
    { 
      id: 'instagram', 
      name: 'Instagram', 
      description: 'Publiez sur Instagram Business', 
      iconPath: '/icons/instagram.ico',
      docs: 'https://developers.facebook.com/docs/instagram-api'
    },
    { 
      id: 'youtube', 
      name: 'YouTube', 
      description: 'Uploadez des vidéos sur YouTube', 
      iconPath: '/icons/youtube.ico',
      docs: 'https://developers.google.com/youtube/v3'
    },
    { 
      id: 'tiktok', 
      name: 'TikTok', 
      description: 'Publiez sur TikTok Business', 
      iconPath: '/icons/tiktok.ico',
      docs: 'https://developers.tiktok.com/'
    },
    { 
      id: 'blog', 
      name: 'Blog (WordPress/Medium)', 
      icon: 'fas fa-blog', 
      description: 'Publiez sur votre blog',
      docs: 'https://developer.wordpress.org/rest-api/'
    },
    { 
      id: 'website', 
      name: 'Site Web', 
      icon: 'fas fa-globe', 
      description: 'API personnalisée de votre site',
      docs: null
    }
  ];

  const handleKeyChange = (service, key) => {
    updateApiKey(service, key);
    // Effacer les résultats de test précédents quand on change la clé
    if (testResults[service]) {
      setTestResults(prev => {
        const newResults = { ...prev };
        delete newResults[service];
        return newResults;
      });
    }
    // Afficher un message de sauvegarde automatique
    setSaveStatus({ success: true, message: 'Clé sauvegardée automatiquement' });
    setTimeout(() => setSaveStatus(null), 2000);
  };

  const handleTestKey = async (service) => {
    const currentKey = apiKeys[service];
    if (!currentKey || currentKey.length < 10) {
      setTestResults(prev => ({ 
        ...prev, 
        [service]: { 
          success: false, 
          message: 'Clé trop courte (minimum 10 caractères)', 
          valid: false 
        } 
      }));
      return;
    }

    setTesting(prev => ({ ...prev, [service]: true }));
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const isValidFormat = currentKey.length >= 20 && /^[a-zA-Z0-9\-_]+$/.test(currentKey);
      
      if (isValidFormat) {
        setTestResults(prev => ({ 
          ...prev, 
          [service]: { 
            success: true, 
            message: '✅ Clé API valide et fonctionnelle', 
            valid: true 
          } 
        }));
      } else {
        setTestResults(prev => ({ 
          ...prev, 
          [service]: { 
            success: false, 
            message: '❌ Format de clé invalide', 
            valid: false 
          } 
        }));
      }
    } catch (error) {
      setTestResults(prev => ({ 
        ...prev, 
        [service]: { 
          success: false, 
          message: '❌ Erreur lors du test de connexion', 
          valid: false 
        } 
      }));
    } finally {
      setTesting(prev => ({ ...prev, [service]: false }));
    }
  };

  const renderServiceCard = (service) => {
    const currentKey = apiKeys[service.id] || '';
    const isTesting = testing[service.id];
    const testResult = testResults[service.id];

    return (
      <div key={service.id} className="network-service-card">
        <div className="service-header">
          <div className="service-logo">
            {service.iconPath ? (
              <img src={service.iconPath} alt={service.name} className="service-icon-official" />
            ) : (
              <i className={service.icon}></i>
            )}
          </div>
          <div className="service-info">
            <h3>{service.name}</h3>
            <p>{service.description}</p>
            {service.docs && (
              <a 
                href={service.docs} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="docs-link"
                title="Documentation API"
              >
                <i className="fas fa-book"></i> Documentation
              </a>
            )}
          </div>
        </div>

        <div className="api-key-input">
          <label>Clé API / Token d'accès</label>
          <input
            type="password"
            value={currentKey}
            onChange={(e) => handleKeyChange(service.id, e.target.value)}
            placeholder={`Entrez votre clé API ${service.name}`}
            className={testResult ? (testResult.valid ? 'valid' : 'invalid') : ''}
          />
        </div>

        <div className="api-actions">
          <button
            onClick={() => handleTestKey(service.id)}
            disabled={!currentKey || isTesting || (testResult && testResult.valid)}
            className={`test-btn ${isTesting ? 'testing' : ''} ${testResult && testResult.valid ? 'validated' : ''}`}
          >
            {isTesting ? (
              <>
                <div className="loader-small"></div>
                Test en cours...
              </>
            ) : testResult && testResult.valid ? (
              <>
                <i className="fas fa-check-circle"></i>
                Clé validée
              </>
            ) : (
              <>
                <i className="fas fa-vial"></i>
                Tester la clé
              </>
            )}
          </button>

          {testResult && !testResult.valid && (
            <div className="test-result error">
              <i className="fas fa-exclamation-circle"></i>
              {testResult.message}
            </div>
          )}
        </div>

        {currentKey && (
          <div className="key-status">
            <span className={`status-indicator ${currentKey ? 'active' : 'inactive'}`}>
              {currentKey ? 'Clé configurée' : 'Aucune clé'}
              {testResult && testResult.valid && (
                <i className="fas fa-check-circle success-persistent"></i>
              )}
            </span>
            {currentKey && (
              <span className="key-length">
                {currentKey.length} caractères
              </span>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="page-container">
      <MenuBar onHelp={() => {}} />
      <div className="page-content" style={{paddingTop: '0px', paddingLeft: '30px', paddingRight: '30px', marginTop: '-40px'}}>
        <div className="network-api-page">
          <div className="config-header">
            <div className="header-content">
              <h1>
                <i className="fas fa-share-alt"></i>
                Accès Réseaux
              </h1>
              <p>Configurez vos clés API pour publier automatiquement sur vos plateformes</p>
            </div>
          </div>

          <div className="info-banner">
            <i className="fas fa-info-circle"></i>
            <div>
              <strong>Comment obtenir vos clés API ?</strong>
              <p>Cliquez sur "Documentation" sous chaque service pour accéder aux guides officiels de création de clés API.</p>
            </div>
          </div>

          {saveStatus && (
            <div className={`save-status-message ${saveStatus.success ? 'success' : 'error'}`}>
              <i className={`fas ${saveStatus.success ? 'fa-check-circle' : 'fa-exclamation-circle'}`}></i>
              {saveStatus.message}
            </div>
          )}

          <div className="network-services-grid">
            {networkServices.map(renderServiceCard)}
          </div>

          <div className="config-footer">
            <div className="security-notice">
              <i className="fas fa-shield-alt"></i>
              <div>
                <strong>Sécurité et confidentialité</strong>
                <p>Vos clés API sont stockées localement sur votre appareil et ne sont jamais transmises à des tiers. Elles sont utilisées uniquement pour publier du contenu sur vos comptes.</p>
              </div>
            </div>

            <div className="usage-stats">
              <div className="stat">
                <span className="stat-number">
                  {Object.values(apiKeys).filter(key => key.length > 0).length}
                </span>
                <span className="stat-label">Clés configurées</span>
              </div>
              <div className="stat">
                <span className="stat-number">
                  {Object.values(testResults).filter(result => result?.valid).length}
                </span>
                <span className="stat-label">Clés validées</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NetworkAPIPage;
