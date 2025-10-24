import { useState, useEffect } from 'react';
import { useAssistantAutoSave } from '../hooks/useLocalStorage';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import MenuBar from './MenuBar';
import './ConfigAPIPage.css';

const ConfigAPIPage = () => {
  const { autoSaveData, updateApiKey, testApiKey } = useAssistantAutoSave();
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('ia');
  const [layoutItems, setLayoutItems] = useState(() => {
    try {
      const raw = localStorage.getItem('layout_editor_positions');
      return raw ? JSON.parse(raw) : {
        menu: { x: 20, y: 20, w: 260, h: 60 },
        editor: { x: 300, y: 20, w: 700, h: 420 },
        sidebar: { x: 1020, y: 20, w: 260, h: 420 }
      };
    } catch {
      return {
        menu: { x: 20, y: 20, w: 260, h: 60 },
        editor: { x: 300, y: 20, w: 700, h: 420 },
        sidebar: { x: 1020, y: 20, w: 260, h: 420 }
      };
    }
  });
  const [isEditingLayout, setIsEditingLayout] = useState(true);

  useEffect(() => {
    try {
      localStorage.setItem('layout_editor_positions', JSON.stringify(layoutItems));
    } catch {}
  }, [layoutItems]);

  // Drag/resize handlers for layout editor
  useEffect(() => {
    if (activeTab !== 'layout') return;
    const onMouseMove = (e) => {
      const drag = window.__draggingBox;
      const resize = window.__resizingBox;
      const canvas = document.getElementById('layoutEditorCanvas');
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      if (drag) {
        const { key, offsetX, offsetY } = drag;
        const x = Math.max(0, Math.min(e.clientX - rect.left - offsetX, rect.width - 20));
        const y = Math.max(0, Math.min(e.clientY - rect.top - offsetY, rect.height - 20));
        setLayoutItems(prev => ({ ...prev, [key]: { ...prev[key], x, y } }));
      } else if (resize) {
        const { key, startX, startY, startW, startH } = resize;
        const w = Math.max(120, Math.min(startW + (e.clientX - startX), rect.width));
        const h = Math.max(60, Math.min(startH + (e.clientY - startY), rect.height));
        setLayoutItems(prev => ({ ...prev, [key]: { ...prev[key], w, h } }));
      }
    };
    const onMouseUp = () => { window.__draggingBox = null; window.__resizingBox = null; };
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [activeTab]);

  const startDrag = (key, e) => {
    if (!isEditingLayout) return;
    const target = e.currentTarget;
    const rect = target.getBoundingClientRect();
    window.__draggingBox = { key, offsetX: e.clientX - rect.left, offsetY: e.clientY - rect.top };
  };

  const startResize = (key, e) => {
    if (!isEditingLayout) return;
    e.stopPropagation();
    window.__resizingBox = {
      key,
      startX: e.clientX,
      startY: e.clientY,
      startW: layoutItems[key].w,
      startH: layoutItems[key].h,
    };
  };

  const resetLayout = () => {
    setLayoutItems({
      menu: { x: 20, y: 20, w: 260, h: 60 },
      editor: { x: 300, y: 20, w: 700, h: 420 },
      sidebar: { x: 1020, y: 20, w: 260, h: 420 }
    });
  };
  const [testing, setTesting] = useState({});
  const [testResults, setTestResults] = useState({});
  const apiKeys = (autoSaveData && autoSaveData.apiKeys) ? autoSaveData.apiKeys : {};

  // DEBUG: Force render without auth for now
  console.log('[ConfigAPIPage] Rendering - isLoading:', isLoading, 'isAuthenticated:', isAuthenticated);

  // Temporarily disable auth guard to test rendering
  // useEffect(() => {
  //   if (!isLoading && !isAuthenticated) {
  //     navigate('/login');
  //   }
  // }, [isAuthenticated, isLoading, navigate]);

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
      const result = await testApiKey(service, apiKeys[service] || '');
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
    const currentKey = (apiKeys && apiKeys[service.id]) || '';
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

  // Temporarily disable auth checks to test rendering
  // if (isLoading) {
  //   return (
  //     <div className="page-container">
  //       <MenuBar onHelp={() => {}} />
  //       <div className="page-content" style={{display:'flex', alignItems:'center', justifyContent:'center', minHeight: '60vh'}}>
  //         <div className="loader" />
  //       </div>
  //     </div>
  //   );
  // }

  // if (!isAuthenticated) {
  //   return null;
  // }

  return (
    <div className="page-container">
      <div style={{position:'fixed', top:0, left:0, right:0, background:'red', color:'white', padding:'10px', zIndex:9999, textAlign:'center'}}>
        🔴 DEBUG: ConfigAPIPage est bien rendue ! isLoading={String(isLoading)} isAuth={String(isAuthenticated)}
      </div>
      <MenuBar onHelp={() => {}} />
      <div className="page-content">
        <div className="config-api-page">
          <div className="config-header">
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
            <button 
              className={`tab-btn ${activeTab === 'layout' ? 'active' : ''}`}
              onClick={() => setActiveTab('layout')}
            >
              <i className="fas fa-object-group"></i>
              Layout
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

            {activeTab === 'layout' && (
              <div className="layout-editor">
                <div className="layout-controls">
                  <label className="toggle-edit">
                    <input type="checkbox" checked={isEditingLayout} onChange={(e)=>setIsEditingLayout(e.target.checked)} />
                    Mode édition
                  </label>
                  <button className="btn-reset" onClick={resetLayout}><i className="fas fa-undo"></i> Réinitialiser</button>
                </div>
                <div className="layout-editor-canvas" id="layoutEditorCanvas">
                  {Object.entries(layoutItems).map(([key, box]) => (
                    <div
                      key={key}
                      className={`layout-box ${key}`}
                      onMouseDown={(e) => startDrag(key, e)}
                      style={{ left: box.x, top: box.y, width: box.w, height: box.h, cursor: isEditingLayout ? 'move':'default' }}
                    >
                      <div className="box-header">
                        <span className="box-title">{key.toUpperCase()}</span>
                      </div>
                      <div className="resize-handle" onMouseDown={(e)=>startResize(key, e)} />
                    </div>
                  ))}
                </div>
                <div className="layout-help">
                  <p>Faites glisser les panneaux pour les déplacer. Utilisez l'angle en bas à droite pour redimensionner. Les positions sont enregistrées dans le navigateur.</p>
                </div>
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
                  {Object.values(apiKeys || {}).filter(key => key.length > 0).length}
                </span>
                <span className="stat-label">Clés configurées</span>
              </div>
              <div className="stat">
                <span className="stat-number">
                  {Object.values(testResults || {}).filter(result => result?.valid).length}
                </span>
                <span className="stat-label">Clés validées</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

export default ConfigAPIPage;