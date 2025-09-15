import { useState } from 'react';
import { useAssistantAutoSave } from '../hooks/useLocalStorage';
import { useNavigate } from 'react-router-dom';
import './ConfigAPIPage.css';

const ConfigAPIPage = () => {
  const { autoSaveData, updateApiKey, testApiKey } = useAssistantAutoSave();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('ia');
  const [testing, setTesting] = useState({});
  const [testResults, setTestResults] = useState({});

  const aiServices = [
    { id: 'openai', name: 'OpenAI', icon: 'fab fa-openai', description: 'GPT-4, GPT-3.5' },
    { id: 'anthropic', name: 'Anthropic', icon: 'fas fa-brain', description: 'Claude 2, Claude 3' },
    { id: 'gemini', name: 'Gemini', icon: 'fas fa-gem', description: 'Google Gemini' },
    { id: 'deepseek', name: 'DeepSeek', icon: 'fas fa-search', description: 'DeepSeek AI' },
    { id: 'grok', name: 'Grok', icon: 'fas fa-robot', description: 'X AI Grok' },
    { id: 'kimi', name: 'Kimi', icon: 'fas fa-comment', description: 'Moonshot AI' }
  ];

  const networkServices = [
    { id: 'twitter', name: 'Twitter/X', icon: 'fab fa-twitter', description: 'API Twitter/X' },
    { id: 'facebook', name: 'Facebook', icon: 'fab fa-facebook', description: 'API Facebook' },
    { id: 'linkedin', name: 'LinkedIn', icon: 'fab fa-linkedin', description: 'API LinkedIn' },
    { id: 'instagram', name: 'Instagram', icon: 'fab fa-instagram', description: 'API Instagram' },
    { id: 'blog', name: 'Blog', icon: 'fas fa-blog', description: 'API WordPress/Medium' },
    { id: 'website', name: 'Site Web', icon: 'fas fa-globe', description: 'API Site Web' }
  ];

  const handleKeyChange = (service, key) => {
    updateApiKey(service, key);
  };

  const handleTestKey = async (service) => {
    setTesting(prev => ({ ...prev, [service]: true }));
    
    try {
      const result = await testApiKey(service, autoSaveData.apiKeys[service]);
      setTestResults(prev => ({ ...prev, [service]: result }));
    } catch (error) {
      setTestResults(prev => ({ 
        ...prev, 
        [service]: { 
          success: false, 
          message: 'Erreur lors du test', 
          valid: false 
        } 
      }));
    } finally {
      setTesting(prev => ({ ...prev, [service]: false }));
    }
  };

  const renderServiceCard = (service) => {
    const currentKey = autoSaveData.apiKeys[service.id] || '';
    const isTesting = testing[service.id];
    const testResult = testResults[service.id];

    return (
      <div key={service.id} className="api-service-card">
        <div className="service-header">
          <i className={service.icon}></i>
          <div className="service-info">
            <h3>{service.name}</h3>
            <p>{service.description}</p>
          </div>
        </div>

        <div className="api-key-input">
          <label>Clé API</label>
          <input
            type="password"
            value={currentKey}
            onChange={(e) => handleKeyChange(service.id, e.target.value)}
            placeholder={`Entrez votre clé ${service.name}...`}
            className={testResult ? (testResult.valid ? 'valid' : 'invalid') : ''}
          />
        </div>

        <div className="api-actions">
          <button
            onClick={() => handleTestKey(service.id)}
            disabled={!currentKey || isTesting}
            className={`test-btn ${isTesting ? 'testing' : ''}`}
          >
            {isTesting ? (
              <>
                <div className="loader-small"></div>
                Test en cours...
              </>
            ) : (
              <>
                <i className="fas fa-check"></i>
                Tester la clé
              </>
            )}
          </button>

          {testResult && (
            <div className={`test-result ${testResult.valid ? 'success' : 'error'}`}>
              <i className={`fas fa-${testResult.valid ? 'check-circle' : 'exclamation-circle'}`}></i>
              {testResult.message}
            </div>
          )}
        </div>

        {currentKey && (
          <div className="key-status">
            <span className={`status-indicator ${currentKey ? 'active' : 'inactive'}`}>
              {currentKey ? 'Clé configurée' : 'Aucune clé'}
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
    <div className="config-api-page">
      <div className="config-header">
        <button className="back-btn" onClick={() => navigate('/')}>
          <i className="fas fa-arrow-left"></i>
          Retour à l'application
        </button>
        <div className="header-content">
          <h1>Configuration des API</h1>
          <p>Configurez vos clés API pour les services d'IA et les réseaux sociaux</p>
        </div>
      </div>

      <div className="api-tabs">
        <button 
          className={`tab-btn ${activeTab === 'ia' ? 'active' : ''}`}
          onClick={() => setActiveTab('ia')}
        >
          <i className="fas fa-robot"></i>
          Intelligence Artificielle
        </button>
        <button 
          className={`tab-btn ${activeTab === 'networks' ? 'active' : ''}`}
          onClick={() => setActiveTab('networks')}
        >
          <i className="fas fa-share-alt"></i>
          Réseaux Sociaux
        </button>
      </div>

      <div className="api-content">
        {activeTab === 'ia' && (
          <div className="ai-services-grid">
            {aiServices.map(renderServiceCard)}
          </div>
        )}

        {activeTab === 'networks' && (
          <div className="network-services-grid">
            {networkServices.map(renderServiceCard)}
          </div>
        )}
      </div>

      <div className="config-footer">
        <div className="security-notice">
          <i className="fas fa-shield-alt"></i>
          <div>
            <strong>Sécurité des clés API</strong>
            <p>Vos clés sont stockées localement et ne sont jamais envoyées à nos serveurs</p>
          </div>
        </div>

        <div className="usage-stats">
          <div className="stat">
            <span className="stat-number">
              {Object.values(autoSaveData.apiKeys).filter(key => key.length > 0).length}
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
  );
};

export default ConfigAPIPage;