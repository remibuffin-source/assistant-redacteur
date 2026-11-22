import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAssistantAutoSave } from '../hooks/useLocalStorage';
import { getConfigApiText } from '../i18n/configApiTranslations';
import { useAuth } from '../hooks/useAuth';
import { validateApiKey } from '../services/apiKeyValidator';
import { saveApiKeysToServer, loadApiKeysLocally, syncApiKeys, loadApiKeysFromServer } from '../services/apiKeyStorage';
import MenuBar from './MenuBar';
import './ConfigAPIPage.css';

const DEFAULT_API_KEYS = {
  openai: '',
  'openai-mini': '',
  anthropic: '',
  'anthropic-haiku': '',
  'gemini-3-pro': '',
  'gemini-2.5-flash': '',
  deepseek: '',
  'deepseek-v3': '',
  grok: '',
  'grok-2': '',
  deepl: '',
  kimi: '',
  mistral: '',
  glm: '',
  whisper: '',
  'gpt-vision': '',
  'fal-tti': '',
  'fal-edit': '',
  'wan': '',
  'veo': '',
  elevenlabs: '',
  twitter: '',
  facebook: '',
  linkedin: '',
  instagram: '',
  blog: '',
  website: ''
};

// Hook pour la sauvegarde locale des clés API avec chargement depuis le serveur
const useApiKeys = (userId) => {
  const [apiKeys, setApiKeys] = useState(() => {
    try {
      const stored = localStorage.getItem('config_api_keys');
      return stored ? JSON.parse(stored) : { ...DEFAULT_API_KEYS };
    } catch {
      return { ...DEFAULT_API_KEYS };
    }
  });
  const [loading, setLoading] = useState(false);

  // Charger les clés depuis le serveur au montage
  useEffect(() => {
    const loadFromServer = async () => {
      if (!userId) return;
      
      setLoading(true);
      try {
        const serverKeys = await loadApiKeysFromServer(userId);
        if (serverKeys && Object.keys(serverKeys).length > 0) {
          // Fusionner avec les clés par défaut pour avoir toutes les clés
          const mergedKeys = { ...DEFAULT_API_KEYS, ...serverKeys };
          setApiKeys(mergedKeys);
          // Sauvegarder aussi en local pour le cache
          localStorage.setItem('config_api_keys', JSON.stringify(mergedKeys));
          console.log('✅ Clés API chargées depuis le serveur:', Object.keys(serverKeys).filter(k => serverKeys[k]).length, 'clés');
        }
      } catch (error) {
        console.error('❌ Erreur chargement clés serveur:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadFromServer();
  }, [userId]);

  const updateApiKey = (service, key) => {
    const newKeys = { ...apiKeys, [service]: key };
    setApiKeys(newKeys);
    localStorage.setItem('config_api_keys', JSON.stringify(newKeys));
  };

  const saveToVPS = async (apiKeys) => {
    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Non authentifié');
      }
      
      const response = await fetch(`${API_BASE_URL}/admin/api-keys`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ apiKeys })
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Erreur lors de la sauvegarde');
      }
      
      return { success: true, message: result.message || 'Clés sauvegardées sur le serveur' };
    } catch (error) {
      console.error('Erreur sauvegarde VPS:', error);
      return { success: false, message: error.message || 'Erreur lors de la sauvegarde serveur' };
    }
  };

  return { apiKeys, updateApiKey, saveToVPS, loading };
};

const ConfigAPIPageFixed = () => {
  const navigate = useNavigate();
  const { autoSaveData } = useAssistantAutoSave();
  const { user, isAuthenticated } = useAuth();
  
  // Récupérer la langue depuis les données utilisateur
  const userLanguage = autoSaveData.language || 'fr';
  const t = (path) => getConfigApiText(userLanguage, path);
  const [searchParams] = useSearchParams();
  
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'api-keys');
  const [testing, setTesting] = useState({});
  const [testResults, setTestResults] = useState({});
  const { apiKeys, updateApiKey, saveToVPS, loading: loadingKeys } = useApiKeys(user?.id);
  const [saving, setSaving] = useState(false);
  const [saveResult, setSaveResult] = useState(null);
  const [falBalance, setFalBalance] = useState({});

  // Vérifier si l'utilisateur est admin
  const isAdmin = user?.role === 'admin' || user?.email === 'admin@studioducapbrun.com';

  const aiServices = [
    { id: 'anthropic', name: 'Claude Sonnet 5.5', description: 'Claude Sonnet 5.5 - Rapide et performant', iconPath: '/icons/claude.ico', docs: 'https://docs.anthropic.com/claude/reference/getting-started-with-the-api' },
    { id: 'deepl', name: 'DeepL API', description: 'DeepL - Traduction professionnelle', iconPath: '/icons/Deepl.ico', docs: 'https://www.deepl.com/docs-api' },
    { id: 'deepseek', name: 'DeepSeek Chat', description: 'DeepSeek Chat - IA conversationnelle', iconPath: '/icons/deepseek.ico', docs: 'https://platform.deepseek.com/api-docs/' },
    { id: 'gemini-3-pro', name: 'Gemini 3.1 Pro', description: 'Gemini 3.1 Pro - Flagship multimodal (OpenRouter)', iconPath: '/icons/gemini-new.ico', docs: 'https://openrouter.ai/google/gemini-3.1-pro-preview/api' },
    { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash (Nano Banana)', description: 'Gemini 2.5 Flash - Génération d\'images (OpenRouter)', iconPath: '/icons/nano-banana.svg', docs: 'https://openrouter.ai/google/gemini-2.5-flash-image/api' },
    { id: 'grok', name: 'Grok', description: 'Grok - xAI', iconPath: '/icons/grok.ico', docs: 'https://docs.x.ai/api' },
    { id: 'kimi', name: 'Kimi (OpenRouter)', description: 'Kimi - LLM via OpenRouter', iconPath: '/icons/kimi2.ico', docs: 'https://openrouter.ai/docs' },
    { id: 'glm', name: 'GLM 5.3 (OpenRouter)', description: 'GLM 5.3 - LLM Z.AI économique via OpenRouter', iconPath: '/icons/glm.ico', docs: 'https://openrouter.ai/z-ai/glm-5.3/api' },
    { id: 'openai', name: 'OpenAI (GPT-5.6 + GPT Image)', description: 'GPT-5.6 Terra (texte) + GPT Image 2.6 (images)', iconPath: '/icons/gpt4.ico', docs: 'https://platform.openai.com/docs/api-reference' },
    { id: 'qwen3', name: 'Qwen3', description: 'Qwen3 - IA multimodale avancée', iconPath: '/icons/qwen3.ico', docs: 'https://qwenlm.github.io/' },
    { id: 'whisper', name: 'Whisper Large V3', description: 'Whisper - Transcription audio', iconPath: '/icons/gpt4.ico', docs: 'https://platform.openai.com/docs/guides/speech-to-text' },
    { id: 'fal-tti', name: 'SeedDream 5.0 TTI', description: 'SeedDream 5.0 Lite - Text-to-Image via Fal.ai', iconPath: '/icons/fal.svg', docs: 'https://fal.ai/models/fal-ai/bytedance/seedream/v5/lite/text-to-image/api' },
    { id: 'fal-edit', name: 'SeedDream Edit', description: 'SeedDream 5.0 Lite - Édition d\'images via Fal.ai', iconPath: '/icons/fal.svg', docs: 'https://fal.ai/models/fal-ai/bytedance/seedream/v5/lite/edit/api' },
    { id: 'wan', name: 'WAN 2.6 (Kie.ai)', description: 'WAN 2.6 - Génération vidéo Text/Image/Video-to-Video', iconPath: '/icons/wan.ico', icon: 'fas fa-video', docs: 'https://docs.kie.ai' },
    { id: 'veo', name: 'Veo 3.1 (Kie.ai)', description: 'Google Veo 3.1 - Génération vidéo haute qualité', iconPath: '/icons/veo 3.ico', icon: 'fas fa-film', docs: 'https://docs.kie.ai/veo3-api/generate-veo-3-video' }
  ];

  const networkServices = [
    { id: 'twitter', name: 'Twitter/X', description: 'API Twitter/X', iconPath: '/icons/twitter.ico' },
    { id: 'facebook', name: 'Facebook', description: 'API Facebook', iconPath: '/icons/facebook.ico' },
    { id: 'linkedin', name: 'LinkedIn', description: 'API LinkedIn', iconPath: '/icons/linkedin.ico' },
    { id: 'instagram', name: 'Instagram', description: 'API Instagram', iconPath: '/icons/instagram.ico' },
    { id: 'blog', name: 'Blog', icon: 'fas fa-blog', description: 'API WordPress/Medium' },
    { id: 'website', name: 'Site Web', icon: 'fas fa-globe', description: 'API Site Web' }
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

  const handleCheckFalBalance = async (service) => {
    setFalBalance(prev => ({ ...prev, [service]: { loading: true } }));
    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/ai/image/fal-balance`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await response.json();
      if (response.ok && result.success) {
        setFalBalance(prev => ({
          ...prev,
          [service]: {
            success: true,
            message: `Solde Fal.ai : ${result.balance ?? 'inconnu'} ${result.currency || 'USD'}`
          }
        }));
      } else {
        setFalBalance(prev => ({
          ...prev,
          [service]: { success: false, message: result.error || 'Impossible de lire le solde Fal.ai.' }
        }));
      }
    } catch (error) {
      setFalBalance(prev => ({
        ...prev,
        [service]: { success: false, message: `Erreur : ${error.message}` }
      }));
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
      // Test via le backend (sécurisé)
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_BASE_URL}/admin/test-api-key`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          service,
          apiKey: currentKey
        })
      });
      
      const result = await response.json();
      
      setTestResults(prev => ({ 
        ...prev, 
        [service]: { 
          success: result.valid, 
          message: result.message, 
          valid: result.valid 
        } 
      }));
    } catch (error) {
      setTestResults(prev => ({ 
        ...prev, 
        [service]: { 
          success: false, 
          message: `❌ ${error.message || 'Erreur lors du test de connexion'}`, 
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
      // Sauvegarde avec le vrai service
      const result = await saveApiKeysToServer(apiKeys, user?.id || user?.email);
      setSaveResult(result);
    } catch (error) {
      setSaveResult({ 
        success: false, 
        message: `❌ ${error.message || 'Erreur de connexion au serveur'}` 
      });
    } finally {
      setSaving(false);
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

            {(service.id === 'fal-tti' || service.id === 'fal-edit') && (
              <button
                onClick={() => handleCheckFalBalance(service.id)}
                disabled={!currentKey || falBalance[service.id]?.loading}
                className="test-btn"
                title="Vérifier le solde réel du compte Fal.ai"
              >
                {falBalance[service.id]?.loading ? (
                  <>
                    <div className="loader-small"></div>
                    Vérification...
                  </>
                ) : (
                  <>
                    <i className="fas fa-wallet"></i>
                    Vérifier le solde
                  </>
                )}
              </button>
            )}

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

          {falBalance[service.id] && !falBalance[service.id].loading && (
            <div className={`test-result ${falBalance[service.id].success ? 'success' : 'error'}`}>
              <i className={`fas ${falBalance[service.id].success ? 'fa-check-circle' : 'fa-exclamation-circle'}`}></i>
              {falBalance[service.id].message}
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
                onClick={() => setActiveTab('api-keys')}
              >
                <i className="fas fa-key"></i>
                <span>Clés API IA</span>
              </button>
              <button 
                className={`admin-nav-btn ${activeTab === 'prompt-builder' ? 'active' : ''}`}
                onClick={() => setActiveTab('prompt-builder')}
              >
                <i className="fas fa-cogs"></i>
                <span>Prompt Builder</span>
              </button>
              <button 
                className={`admin-nav-btn ${activeTab === 'pricing' ? 'active' : ''}`}
                onClick={() => navigate('/admin-pricing')}
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
                  {activeTab === 'api-keys' && (
                    <>
                      <i className="fas fa-key" style={{color: '#ff6b2c', marginRight: '12px'}}></i>
                      Clés API Intelligence Artificielle
                    </>
                  )}
                  {activeTab === 'prompt-builder' && (
                    <>
                      <i className="fas fa-cogs" style={{color: '#ff6b2c', marginRight: '12px'}}></i>
                      Prompt Builder
                    </>
                  )}
                </h1>
                <p>
                  {activeTab === 'api-keys' && 'Configuration des clés API pour les services d\'intelligence artificielle'}
                  {activeTab === 'prompt-builder' && 'Gestion des règles de génération de contenu IA'}
                </p>
              </div>
            </div>

            {activeTab === 'api-keys' && (
              <div className="api-content">
                <div className="ai-services-grid">
                  {aiServices.map(renderServiceCard)}
                </div>
              </div>
            )}

            {activeTab === 'prompt-builder' && (
              <div className="prompt-builder-content">
                <div className="info-banner" style={{marginBottom: '20px'}}>
                  <i className="fas fa-info-circle"></i>
                  <div>
                    <strong>Prompt Builder</strong>
                    <p>Interface de gestion des règles de génération de contenu IA. Consultez la documentation PHASE-5-ADMIN-PROMPT-BUILDER.md pour plus de détails.</p>
                  </div>
                </div>
                <div className="coming-soon-box">
                  <i className="fas fa-tools" style={{fontSize: '48px', color: '#ff6b2c', marginBottom: '20px'}}></i>
                  <h3>Interface en cours de développement</h3>
                  <p>Le Prompt Builder permettra de gérer :</p>
                  <ul style={{textAlign: 'left', marginTop: '15px'}}>
                    <li>Les 8 tâches de traitement</li>
                    <li>Les 17 formats de sortie</li>
                    <li>Les styles et tons</li>
                    <li>Les adaptations média</li>
                  </ul>
                </div>
              </div>
            )}

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
          </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfigAPIPageFixed;
