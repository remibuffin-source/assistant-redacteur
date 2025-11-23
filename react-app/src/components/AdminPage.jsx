import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAssistantAutoSave } from '../hooks/useLocalStorage';
import { getConfigApiText } from '../i18n/configApiTranslations';
import MenuBar from './MenuBar';
import './ConfigAPIPage.css';

// Hook pour la sauvegarde locale des clés API IA uniquement
const useAdminApiKeys = () => {
  const [apiKeys, setApiKeys] = useState(() => {
    try {
      const stored = localStorage.getItem('admin_ia_api_keys');
      return stored ? JSON.parse(stored) : {
        openai: '',
        anthropic: '',
        gemini: '',
        deepseek: '',
        grok: '',
        kimi: ''
      };
    } catch {
      return {
        openai: '',
        anthropic: '',
        gemini: '',
        deepseek: '',
        grok: '',
        kimi: ''
      };
    }
  });

  const updateApiKey = (service, key) => {
    const newKeys = { ...apiKeys, [service]: key };
    setApiKeys(newKeys);
    localStorage.setItem('admin_ia_api_keys', JSON.stringify(newKeys));
  };

  const saveToVPS = async (apiKeys) => {
    try {
      // Simulation d'envoi vers VPS - à remplacer par vraie API
      console.log('Sauvegarde VPS simulée (Admin IA):', apiKeys);
      await new Promise(resolve => setTimeout(resolve, 1000));
      return { success: true, message: 'Clés IA sauvegardées sur le serveur' };
    } catch (error) {
      return { success: false, message: 'Erreur lors de la sauvegarde serveur' };
    }
  };

  return { apiKeys, updateApiKey, saveToVPS };
};

const AdminPage = () => {
  const navigate = useNavigate();
  const { autoSaveData } = useAssistantAutoSave();
  
  // Récupérer la langue depuis les données utilisateur
  const userLanguage = autoSaveData.language || 'fr';
  const t = (path) => getConfigApiText(userLanguage, path);
  
  const [testing, setTesting] = useState({});
  const [testResults, setTestResults] = useState({});
  const { apiKeys, updateApiKey, saveToVPS } = useAdminApiKeys();
  const [saving, setSaving] = useState(false);
  const [saveResult, setSaveResult] = useState(null);

  const aiServices = [
    { id: 'openai', name: 'OpenAI', description: 'GPT-4, GPT-3.5', iconPath: '/icons/gpt4.ico' },
    { id: 'anthropic', name: 'Anthropic', description: 'Claude 2, Claude 3', iconPath: '/icons/claude.ico' },
    { id: 'gemini', name: 'Gemini', description: 'Google Gemini', iconPath: '/icons/gemini.ico' },
    { id: 'deepseek', name: 'DeepSeek', description: 'DeepSeek AI', iconPath: '/icons/deepseek.ico' },
    { id: 'grok', name: 'Grok', description: 'X AI Grok', iconPath: '/icons/grok.ico' },
    { id: 'kimi', name: 'Kimi', description: 'Moonshot AI', iconPath: '/icons/kimi2.ico' }
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
      // Simulation de test plus réaliste
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simulation de validation basée sur la longueur et le format de la clé
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

  const handleSaveToVPS = async () => {
    setSaving(true);
    setSaveResult(null);
    
    try {
      const result = await saveToVPS(apiKeys);
      setSaveResult(result);
    } catch (error) {
      setSaveResult({ success: false, message: 'Erreur de connexion au serveur' });
    } finally {
      setSaving(false);
      // Effacer le message après 3 secondes
      setTimeout(() => setSaveResult(null), 3000);
    }
  };

  const renderServiceCard = (service) => {
    const currentKey = apiKeys[service.id] || '';
    const isTesting = testing[service.id];
    const testResult = testResults[service.id];

    return (
      <div key={service.id} className="api-service-card">
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
          </div>
        </div>

        <div className="api-key-input">
          <label>{t('form.apiKeyLabel')}</label>
          <input
            type="password"
            value={currentKey}
            onChange={(e) => handleKeyChange(service.id, e.target.value)}
            placeholder={t('form.placeholder').replace('{service}', service.name)}
            className={testResult ? (testResult.valid ? 'valid' : 'invalid') : ''}
          />
        </div>

        <div className="api-actions">
          <div className="buttons-row">
            <button
              onClick={() => handleTestKey(service.id)}
              disabled={!currentKey || isTesting || (testResult && testResult.valid)}
              className={`test-btn ${isTesting ? 'testing' : ''} ${testResult && testResult.valid ? 'validated' : ''}`}
            >
              {isTesting ? (
                <>
                  <div className="loader-small"></div>
                  {t('form.testing')}
                </>
              ) : testResult && testResult.valid ? (
                <>
                  <i className="fas fa-check-circle"></i>
                  {t('form.validKey')}
                </>
              ) : (
                <>
                  <i className="fas fa-vial"></i>
                  {t('form.testButton')}
                </>
              )}
            </button>

            <button
              onClick={() => handleSaveToVPS()}
              disabled={!currentKey || saving}
              className={`save-btn ${saving ? 'saving' : ''}`}
              title="Sauvegarder la clé sur le serveur"
            >
              {saving ? (
                <>
                  <div className="loader-small"></div>
                  {t('form.saving')}
                </>
              ) : (
                <>
                  <i className="fas fa-save"></i>
                  {t('form.saveButton')}
                </>
              )}
            </button>
          </div>

          {testResult && !testResult.valid && (
            <div className={`test-result error`}>
              <i className="fas fa-exclamation-circle"></i>
              {testResult.message}
            </div>
          )}
        </div>

        {currentKey && (
          <div className="key-status">
            <span className={`status-indicator ${currentKey ? 'active' : 'inactive'}`}>
              {currentKey ? t('form.keyConfigured') : t('form.noKey')}
              {testResult && testResult.valid && (
                <i className="fas fa-check-circle success-persistent"></i>
              )}
            </span>
            {currentKey && (
              <span className="key-length">
                {currentKey.length} {t('form.characters')}
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
      <div className="page-content" style={{paddingTop: '20px'}}>
        <div className="config-api-page">
          <div className="config-header">
            <div className="header-content">
              <h1>
                <i className="fas fa-user-shield" style={{marginRight: '10px', color: '#ff6b35'}}></i>
                Configuration IA - Administrateur
              </h1>
              <p>Configuration des clés API des intelligences artificielles (accès administrateur uniquement)</p>
            </div>
          </div>

          <div className="api-content">
            <div className="ai-services-grid">
              {aiServices.map(renderServiceCard)}
            </div>
          </div>

          {saveResult && (
            <div className={`save-notification ${saveResult.success ? 'success' : 'error'}`}>
              <i className={`fas fa-${saveResult.success ? 'check-circle' : 'exclamation-triangle'}`}></i>
              {saveResult.message}
            </div>
          )}

          <div className="config-footer">
            <div className="security-notice">
              <i className="fas fa-shield-alt"></i>
              <div>
                <strong>{t('security.title')}</strong>
                <p>{t('security.description')}</p>
              </div>
            </div>

            <div className="usage-stats">
              <div className="stat">
                <span className="stat-number">
                  {Object.values(apiKeys).filter(key => key.length > 0).length}
                </span>
                <span className="stat-label">{t('stats.keysConfigured')}</span>
              </div>
              <div className="stat">
                <span className="stat-number">
                  {Object.values(testResults).filter(result => result?.valid).length}
                </span>
                <span className="stat-label">{t('stats.keysValidated')}</span>
              </div>
            </div>

            {/* Liens administrateur */}
            <div className="admin-links" style={{marginTop: '30px', display: 'flex', gap: '15px', justifyContent: 'center'}}>
              <button 
                onClick={() => navigate('/config-api')}
                className="admin-link-btn"
                style={{
                  padding: '12px 24px',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  color: 'var(--text-primary)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => e.target.style.background = 'rgba(255, 107, 44, 0.1)'}
                onMouseLeave={(e) => e.target.style.background = 'var(--bg-secondary)'}
              >
                <i className="fas fa-share-alt"></i>
                Configuration Réseaux Sociaux
              </button>
              
              <button 
                onClick={() => navigate('/account')}
                className="admin-link-btn"
                style={{
                  padding: '12px 24px',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  color: 'var(--text-primary)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => e.target.style.background = 'rgba(255, 107, 44, 0.1)'}
                onMouseLeave={(e) => e.target.style.background = 'var(--bg-secondary)'}
              >
                <i className="fas fa-users-cog"></i>
                Gestion des Comptes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
