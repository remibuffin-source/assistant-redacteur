import { useState, useEffect } from 'react';
import { useTheme } from '../hooks/useTheme';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useAssistantAutoSave } from '../hooks/useLocalStorage';
import { getMenuText } from '../i18n/menuTranslations';
import { getHelpText } from '../i18n/helpTranslations';
import { getHomeText } from '../i18n/homeTranslations';
import StorageManager from '../utils/StorageManager';

const MenuBar = ({ onHelp }) => {
  const { toggleTheme, currentTheme } = useTheme();
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { autoSaveData } = useAssistantAutoSave();
  
  // Récupérer la langue depuis les données utilisateur
  const userLanguage = autoSaveData.language || 'fr';
  const t = (path) => getMenuText(userLanguage, path);
  const h = (path) => getHelpText(userLanguage, path);
  const home = (path) => getHomeText(userLanguage, path);
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [menuTimeout, setMenuTimeout] = useState(null);
  const [showSaveChoiceModal, setShowSaveChoiceModal] = useState(false);
  const [showLoadChoiceModal, setShowLoadChoiceModal] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showLoadModal, setShowLoadModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [presetName, setPresetName] = useState('');
  const [savedConfigs, setSavedConfigs] = useState([]);
  const [saveType, setSaveType] = useState('config'); // 'config' ou 'model'
  const [loadType, setLoadType] = useState('config'); // 'config' ou 'model'

  const showMenu = () => {
    clearTimeout(menuTimeout);
    setIsMenuVisible(true);
  };

  const hideMenuDelayed = () => {
    const timeout = setTimeout(() => {
      setIsMenuVisible(false);
      setShowLanguageMenu(false); // Fermer aussi le menu langue
    }, 1000); // 1 seconde de délai
    setMenuTimeout(timeout);
  };

  const keepMenuOpen = () => {
    clearTimeout(menuTimeout);
  };

  const handleMenuClick = (action) => {
    switch(action) {
      case 'open':
        // Ouvrir la modale de choix
        setShowLoadChoiceModal(true);
        break;
      case 'save':
        // Ouvrir la modale de choix
        setShowSaveChoiceModal(true);
        break;
      case 'analyze':
        analyzeContent();
        break;
      case 'account':
        if (!isAuthenticated) {
          navigate('/login');
        } else {
          showAccountModal();
        }
        break;
      case 'config':
        if (!isAuthenticated) {
          navigate('/login');
        } else {
          openConfig();
        }
        break;
      case 'network':
        if (!isAuthenticated) {
          navigate('/login');
        } else {
          navigate('/network-api');
        }
        break;
      case 'calendar':
        if (!isAuthenticated) {
          navigate('/login');
        } else {
          openCalendar();
        }
        break;
      case 'results':
        if (!isAuthenticated) {
          navigate('/login');
        } else {
          openResults();
        }
        break;
      case 'editor':
        if (!isAuthenticated) {
          navigate('/login');
        } else {
          navigate('/editor');
        }
        break;
      case 'subscription':
        if (!isAuthenticated) {
          navigate('/login');
        } else {
          openSubscription();
        }
        break;
      case 'login':
        navigate('/login');
        break;
      case 'logout':
        handleLogout();
        break;
      default:
        break;
    }
  };

  const openProject = () => {
    // Charger la liste des préréglages sauvegardés
    const configs = StorageManager.getSavedConfigs();
    setSavedConfigs(configs);
    setShowLoadModal(true);
  };

  const handleSaveChoice = (type) => {
    setSaveType(type);
    setShowSaveChoiceModal(false);
    setShowSaveModal(true);
  };

  const handleLoadChoice = (type) => {
    setLoadType(type);
    setShowLoadChoiceModal(false);
    // Charger la liste appropriée
    if (type === 'config') {
      const configs = StorageManager.getSavedConfigs();
      setSavedConfigs(configs);
    } else {
      const models = StorageManager.getSavedModels();
      setSavedConfigs(models);
    }
    setShowLoadModal(true);
  };

  const handleSaveConfig = async () => {
    if (!presetName.trim()) {
      alert('Veuillez saisir un nom');
      return;
    }

    // Récupérer l'état complet depuis window.assistantRedacteurState
    const appState = window.assistantRedacteurState || {};

    const config = {
      theme: currentTheme,
      timestamp: new Date().toISOString(),
      
      // Informations du projet (TOUS les champs)
      projectData: appState.projectData || {
        projectTitle: '',
        targetAudience: '',
        tone: '',
        projectDescription: ''
      },
      
      // IA sélectionnée
      selectedAI: appState.selectedAI || '',
      
      // Tâches sélectionnées (TOUTES)
      selectedTasks: appState.selectedTasks || [],
      
      // Formats de sortie sélectionnés (TOUS)
      selectedFormats: appState.selectedFormats || [],
      
      // Options avancées (TOUTES)
      advancedOptions: appState.advancedOptions || {
        style: 'professionnel',
        length: 3,
        creativity: 3,
        adaptation: 'web'
      }
    };

    // Si c'est un modèle complet, ajouter le contenu ET les résultats
    if (saveType === 'model') {
      config.content = appState.content || '';
      config.results = appState.results || [];
    }

    const result = saveType === 'config' 
      ? await StorageManager.saveInterfaceConfig(presetName, config)
      : await StorageManager.saveModel(presetName, config);
    
    if (result.success) {
      const successMessage = saveType === 'config' 
        ? `✅ Configuration "${presetName}" sauvegardée avec succès !\n\n` +
          `📊 Contenu sauvegardé :\n` +
          `- Informations du projet : ✓\n` +
          `- IA sélectionnée : ${config.selectedAI || 'Aucune'}\n` +
          `- Tâches : ${config.selectedTasks.length}\n` +
          `- Formats de sortie : ${config.selectedFormats.length}\n` +
          `- Options avancées : ✓\n` +
          `- Thème : ${config.theme === 'dark' ? 'Nuit' : 'Jour'}`
        : `✅ Modèle Complet "${presetName}" sauvegardé avec succès !\n\n` +
          `📊 TOUT a été sauvegardé :\n` +
          `- Informations du projet : ✓\n` +
          `- IA sélectionnée : ${config.selectedAI || 'Aucune'}\n` +
          `- Tâches : ${config.selectedTasks.length}\n` +
          `- Formats de sortie : ${config.selectedFormats.length}\n` +
          `- Options avancées : ✓\n` +
          `- Contenu zone de collecte : ${config.content ? '✓ (' + config.content.length + ' caractères)' : 'Vide'}\n` +
          `- Résultats générés : ${config.results.length} vignette(s)\n` +
          `- Thème : ${config.theme === 'dark' ? 'Nuit' : 'Jour'}\n\n` +
          `🎯 Vous pourrez tout recharger en 1 clic !`;
      
      alert(successMessage);
      setShowSaveModal(false);
      setPresetName('');
    } else {
      alert('❌ ' + result.message);
    }
  };

  const handleLoadConfig = async (configId) => {
    const result = loadType === 'config'
      ? await StorageManager.loadInterfaceConfig(configId)
      : await StorageManager.loadModel(configId);
    
    if (result.success) {
      const config = result.config;
      
      // Utiliser la fonction de chargement exposée par HomeFixed
      if (window.assistantRedacteurLoadState) {
        window.assistantRedacteurLoadState({
          projectData: config.projectData,
          selectedAI: config.selectedAI,
          content: config.content || '',
          selectedTasks: config.selectedTasks || [],
          selectedFormats: config.selectedFormats || [],
          advancedOptions: config.advancedOptions || {
            style: 'professionnel',
            length: 3,
            creativity: 3,
            adaptation: 'web'
          },
          results: config.results || []
        });
      }
      
      // Appliquer le thème si différent
      if (config.theme && config.theme !== currentTheme) {
        toggleTheme();
      }
      
      const loadMessage = loadType === 'config'
        ? `✅ Configuration "${result.name}" chargée avec succès !\n\n` +
          `📊 Contenu restauré :\n` +
          `- Informations du projet : ✓\n` +
          `- IA sélectionnée : ${config.selectedAI || 'Aucune'}\n` +
          `- Tâches : ${config.selectedTasks?.length || 0}\n` +
          `- Formats de sortie : ${config.selectedFormats?.length || 0}\n` +
          `- Options avancées : ✓\n` +
          `- Thème : ${config.theme === 'dark' ? 'Nuit' : 'Jour'}`
        : `✅ Modèle Complet "${result.name}" chargé avec succès !\n\n` +
          `📊 TOUT a été restauré :\n` +
          `- Informations du projet : ✓\n` +
          `- IA sélectionnée : ${config.selectedAI || 'Aucune'}\n` +
          `- Tâches : ${config.selectedTasks?.length || 0}\n` +
          `- Formats de sortie : ${config.selectedFormats?.length || 0}\n` +
          `- Options avancées : ✓\n` +
          `- Contenu zone de collecte : ${config.content ? '✓ (' + config.content.length + ' caractères)' : 'Vide'}\n` +
          `- Résultats générés : ${config.results?.length || 0} vignette(s)\n` +
          `- Thème : ${config.theme === 'dark' ? 'Nuit' : 'Jour'}\n\n` +
          `🎉 Tous vos posts sont de retour !`;
      
      alert(loadMessage);
      setShowLoadModal(false);
    } else {
      alert('❌ ' + result.message);
    }
  };

  const handleDeleteConfig = async (configId) => {
    const typeLabel = loadType === 'config' ? 'configuration' : 'modèle';
    if (confirm(`Êtes-vous sûr de vouloir supprimer ce ${typeLabel} ?`)) {
      const result = loadType === 'config'
        ? await StorageManager.deleteInterfaceConfig(configId)
        : await StorageManager.deleteModel(configId);
      
      if (result.success) {
        // Recharger la liste appropriée
        const configs = loadType === 'config'
          ? StorageManager.getSavedConfigs()
          : StorageManager.getSavedModels();
        setSavedConfigs(configs);
        alert('✅ ' + result.message);
      } else {
        alert('❌ ' + result.message);
      }
    }
  };

  const changeLanguage = (lang) => {
    // Sauvegarder la langue dans le bon localStorage
    const currentData = JSON.parse(localStorage.getItem('assistantRedacteur_autoSave') || '{}');
    currentData.language = lang;
    localStorage.setItem('assistantRedacteur_autoSave', JSON.stringify(currentData));
    
    // Recharger la page pour appliquer la nouvelle langue
    window.location.reload();
  };

  const analyzeContent = () => {
    const content = document.querySelector('.result-area')?.textContent;
    if (!content || content.includes('Aucun résultat')) {
      alert('Aucun contenu à analyser. Générez d\'abord du contenu.');
      return;
    }
    
    const analysis = {
      wordCount: content.split(' ').length,
      charCount: content.length,
      readingTime: Math.ceil(content.split(' ').length / 200),
      sentiment: 'Positif'
    };
    
    alert(`Analyse du contenu:\n- Mots: ${analysis.wordCount}\n- Caractères: ${analysis.charCount}\n- Temps de lecture: ${analysis.readingTime} min\n- Sentiment: ${analysis.sentiment}`);
  };

  const showAccountModal = () => {
    navigate('/account', { replace: false });
  };

  const openConfig = () => {
    navigate('/config-api', { replace: false });
  };

  const openCalendar = () => {
    // Ouvrir le calendrier dans une nouvelle fenêtre
    window.open('/calendar', '_blank', 'width=1400,height=900,menubar=no,toolbar=no,location=no,status=no');
  };

  const openResults = () => {
    navigate('/results', { replace: false });
  };

  const openSubscription = () => {
    navigate('/subscription', { replace: false });
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Gestion de la touche Esc pour fermer les modales
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === 'Escape') {
        if (showSaveChoiceModal) {
          setShowSaveChoiceModal(false);
        }
        if (showLoadChoiceModal) {
          setShowLoadChoiceModal(false);
        }
        if (showSaveModal) {
          setShowSaveModal(false);
        }
        if (showLoadModal) {
          setShowLoadModal(false);
        }
      }
    };

    // Ajouter l'écouteur d'événement
    document.addEventListener('keydown', handleEscKey);

    // Nettoyer l'écouteur lors du démontage
    return () => {
      document.removeEventListener('keydown', handleEscKey);
      if (menuTimeout) {
        clearTimeout(menuTimeout);
      }
    };
  }, [menuTimeout, showSaveChoiceModal, showLoadChoiceModal, showSaveModal, showLoadModal]);

  return (
    <>
      {/* Zone de déclenchement du menu */}
      <div
        className="menu-trigger-area"
        onMouseEnter={showMenu}
      ></div>

      {/* Menu amovible */}
      <div
        className={`menu-container ${isMenuVisible ? 'show' : ''}`}
        onMouseEnter={keepMenuOpen}
        onMouseLeave={hideMenuDelayed}
      >
        <div className="menu-header">
          <div className="menu-left">
            <img src="/Studio du Cap Brun.png" alt="Studio du Cap Brun" />
            <h1 className="main-title" onClick={() => navigate('/')} style={{cursor: 'pointer'}}>{home('appTitle')}</h1>
          </div>
          <div className="menu-buttons">
            <button className="menu-btn" onClick={() => handleMenuClick('open')}>
              <i className="fas fa-folder-open"></i>
              <span>{t('buttons.open')}</span>
            </button>
            <button className="menu-btn" onClick={() => handleMenuClick('save')}>
              <i className="fas fa-save"></i>
              <span>{t('buttons.save')}</span>
            </button>
            <button className="menu-btn" onClick={() => handleMenuClick('analyze')}>
              <i className="fas fa-chart-bar"></i>
              <span>{t('buttons.analyze')}</span>
            </button>
            
            {isAuthenticated ? (
              <>
                <button className="menu-btn" onClick={() => handleMenuClick('account')}>
                  <i className="fas fa-user"></i>
                  <span>{t('buttons.account')}</span>
                </button>
                <button className="menu-btn" onClick={() => handleMenuClick('network')}>
                  <i className="fas fa-share-alt"></i>
                  <span>Accès Réseaux</span>
                </button>
                <button className="menu-btn" onClick={() => handleMenuClick('calendar')}>
                  <i className="fas fa-calendar-alt"></i>
                  <span>{t('buttons.calendar')}</span>
                </button>
                <button className="menu-btn" onClick={() => handleMenuClick('editor')}>
                  <i className="fas fa-edit"></i>
                  <span>{t('buttons.editor')}</span>
                </button>
                <button className="menu-btn" onClick={() => handleMenuClick('subscription')}>
                  <i className="fas fa-crown"></i>
                  <span>{t('buttons.subscription')}</span>
                </button>
                {(user?.role === 'admin' || user?.email === 'admin@studioducapbrun.com') && (
                  <button className="menu-btn" onClick={() => handleMenuClick('config')}>
                    <i className="fas fa-shield-alt"></i>
                    <span>Admin</span>
                  </button>
                )}
                <button className="menu-btn logout-btn" onClick={() => handleMenuClick('logout')}>
                  <i className="fas fa-sign-out-alt"></i>
                  <span>{t('buttons.logout')}</span>
                </button>
              </>
            ) : (
              <button className="menu-btn login-btn" onClick={() => handleMenuClick('login')}>
                <i className="fas fa-sign-in-alt"></i>
                <span>{t('buttons.login')}</span>
              </button>
            )}
            
            <button className="theme-toggle-btn" onClick={toggleTheme} title={currentTheme === 'dark' ? t('theme.switchToLight') : t('theme.switchToDark')}>
              <i className={`fas fa-${currentTheme === 'dark' ? 'sun' : 'moon'}`}></i>
            </button>
            
            {/* Sélecteur de langue */}
            <div className="language-selector">
              <button 
                className="language-toggle-btn" 
                onMouseEnter={() => setShowLanguageMenu(true)}
                onClick={() => setShowLanguageMenu(!showLanguageMenu)}
                title={t('language.select')}
              >
                <i className="fas fa-globe"></i>
                <span className="current-lang">{userLanguage.toUpperCase()}</span>
              </button>
              {showLanguageMenu && (
                <div 
                  className="language-dropdown"
                  onMouseEnter={() => clearTimeout(menuTimeout)}
                  onMouseLeave={() => {
                    const timeout = setTimeout(() => {
                      setShowLanguageMenu(false);
                    }, 0);
                  }}
                >
                  <button onClick={() => changeLanguage('fr')} className={userLanguage === 'fr' ? 'active' : ''}>
                    <span className="flag">🇫🇷</span> 
                    <span className="lang-name">Français</span>
                    {userLanguage === 'fr' && <i className="fas fa-check check-icon"></i>}
                  </button>
                  <button onClick={() => changeLanguage('en')} className={userLanguage === 'en' ? 'active' : ''}>
                    <span className="flag">🇬🇧</span> 
                    <span className="lang-name">English</span>
                    {userLanguage === 'en' && <i className="fas fa-check check-icon"></i>}
                  </button>
                  <button onClick={() => changeLanguage('es')} className={userLanguage === 'es' ? 'active' : ''}>
                    <span className="flag">🇪🇸</span> 
                    <span className="lang-name">Español</span>
                    {userLanguage === 'es' && <i className="fas fa-check check-icon"></i>}
                  </button>
                  <button onClick={() => changeLanguage('de')} className={userLanguage === 'de' ? 'active' : ''}>
                    <span className="flag">🇩🇪</span> 
                    <span className="lang-name">Deutsch</span>
                    {userLanguage === 'de' && <i className="fas fa-check check-icon"></i>}
                  </button>
                </div>
              )}
            </div>
            
            <button className="help-btn" onClick={() => setShowHelpModal(true)}>?</button>
          </div>
        </div>
      </div>

      {/* Modale de choix - Enregistrer */}
      {showSaveChoiceModal && (
        <div className="modal-overlay" onClick={() => setShowSaveChoiceModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Que souhaitez-vous enregistrer ?</h3>
            <p style={{fontSize: '0.9rem', color: '#666', marginBottom: '20px'}}>
              Choisissez le type de sauvegarde
            </p>
            <div style={{display: 'flex', flexDirection: 'column', gap: '15px'}}>
              <button 
                onClick={() => handleSaveChoice('config')}
                style={{
                  padding: '15px 20px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  fontWeight: '600',
                  transition: 'transform 0.2s, box-shadow 0.2s'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.4)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <i className="fas fa-cog" style={{marginRight: '10px'}}></i>
                Configuration
                <div style={{fontSize: '0.85rem', fontWeight: '400', marginTop: '5px', opacity: '0.9'}}>
                  Réglages uniquement (sans contenu)
                </div>
              </button>
              <button 
                onClick={() => handleSaveChoice('model')}
                style={{
                  padding: '15px 20px',
                  background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  fontWeight: '600',
                  transition: 'transform 0.2s, box-shadow 0.2s'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(245, 87, 108, 0.4)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <i className="fas fa-save" style={{marginRight: '10px'}}></i>
                Modèle Complet
                <div style={{fontSize: '0.85rem', fontWeight: '400', marginTop: '5px', opacity: '0.9'}}>
                  Réglages + contenu complet
                </div>
              </button>
            </div>
            <div className="modal-buttons" style={{marginTop: '20px'}}>
              <button onClick={() => setShowSaveChoiceModal(false)}>Annuler</button>
            </div>
          </div>
        </div>
      )}

      {/* Modale de choix - Ouvrir */}
      {showLoadChoiceModal && (
        <div className="modal-overlay" onClick={() => setShowLoadChoiceModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Que souhaitez-vous ouvrir ?</h3>
            <p style={{fontSize: '0.9rem', color: '#666', marginBottom: '20px'}}>
              Choisissez le type de fichier à charger
            </p>
            <div style={{display: 'flex', flexDirection: 'column', gap: '15px'}}>
              <button 
                onClick={() => handleLoadChoice('config')}
                style={{
                  padding: '15px 20px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  fontWeight: '600',
                  transition: 'transform 0.2s, box-shadow 0.2s'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.4)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <i className="fas fa-cog" style={{marginRight: '10px'}}></i>
                Configuration
                <div style={{fontSize: '0.85rem', fontWeight: '400', marginTop: '5px', opacity: '0.9'}}>
                  Charger un préréglage
                </div>
              </button>
              <button 
                onClick={() => handleLoadChoice('model')}
                style={{
                  padding: '15px 20px',
                  background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  fontWeight: '600',
                  transition: 'transform 0.2s, box-shadow 0.2s'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(245, 87, 108, 0.4)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <i className="fas fa-folder-open" style={{marginRight: '10px'}}></i>
                Modèle Complet
                <div style={{fontSize: '0.85rem', fontWeight: '400', marginTop: '5px', opacity: '0.9'}}>
                  Charger modèle avec contenu
                </div>
              </button>
            </div>
            <div className="modal-buttons" style={{marginTop: '20px'}}>
              <button onClick={() => setShowLoadChoiceModal(false)}>Annuler</button>
            </div>
          </div>
        </div>
      )}

      {/* Modale de sauvegarde */}
      {showSaveModal && (
        <div className="modal-overlay" onClick={() => setShowSaveModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>{saveType === 'config' ? 'Sauvegarder la Configuration' : 'Sauvegarder le Modèle Complet'}</h3>
            <p style={{fontSize: '0.9rem', color: '#666', marginBottom: '15px'}}>
              {saveType === 'config' 
                ? 'Sauvegarde uniquement les réglages de la page (sans le contenu)'
                : 'Sauvegarde les réglages ET tout le contenu (zone de collecte + résultats)'}
            </p>
            <input
              type="text"
              placeholder={saveType === 'config' ? 'Nom du préréglage...' : 'Nom du modèle...'}
              value={presetName}
              onChange={(e) => setPresetName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSaveConfig()}
            />
            <div className="modal-buttons">
              <button onClick={handleSaveConfig}>Sauvegarder</button>
              <button onClick={() => setShowSaveModal(false)}>Annuler</button>
            </div>
          </div>
        </div>
      )}

      {/* Modale de chargement */}
      {showLoadModal && (
        <div className="modal-overlay" onClick={() => setShowLoadModal(false)}>
          <div className="modal-content modal-content-large" onClick={(e) => e.stopPropagation()}>
            <h3>{loadType === 'config' ? 'Charger une Configuration' : 'Charger un Modèle Complet'}</h3>
            <p style={{fontSize: '0.9rem', color: '#666', marginBottom: '15px'}}>
              {loadType === 'config' 
                ? 'Sélectionnez un préréglage à charger'
                : 'Sélectionnez un modèle complet (avec contenu et résultats)'}
            </p>
            <div className="config-list">
              {savedConfigs.length === 0 ? (
                <p style={{textAlign: 'center', color: '#999', padding: '20px'}}>
                  {loadType === 'config' ? 'Aucune configuration sauvegardée' : 'Aucun modèle sauvegardé'}
                </p>
              ) : (
                savedConfigs.map((config) => (
                  <div key={config.timestamp} className="config-item">
                    <div className="config-info">
                      <strong>{config.name}</strong>
                      <small>{new Date(config.timestamp).toLocaleString('fr-FR')}</small>
                    </div>
                    <div className="config-actions">
                      <button 
                        onClick={() => handleLoadConfig(config.timestamp)}
                        className="load-btn"
                      >
                        <i className="fas fa-folder-open"></i> Charger
                      </button>
                      <button 
                        onClick={() => handleDeleteConfig(config.timestamp)}
                        className="delete-btn"
                      >
                        <i className="fas fa-trash"></i> Supprimer
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="modal-buttons">
              <button onClick={() => setShowLoadModal(false)}>Fermer</button>
            </div>
          </div>
        </div>
      )}

      {/* Modale d'aide */}
      {showHelpModal && (
        <div className="modal-overlay" onClick={() => setShowHelpModal(false)}>
          <div className="modal-content help-modal" onClick={(e) => e.stopPropagation()}>
            <div className="help-modal-header">
              <h2>{h('title')}</h2>
              <button className="modal-close" onClick={() => setShowHelpModal(false)}>&times;</button>
            </div>
            <div className="help-content">
              <h3>{h('sections.mainFeatures.title')}</h3>
              <p><strong>{h('sections.mainFeatures.menu')}</strong></p>
              
              <h3>{h('sections.projectInfo.title')}</h3>
              <p>{h('sections.projectInfo.intro')}</p>
              <ul>
                <li><strong>{h('sections.projectInfo.fields.title')}</strong></li>
                <li><strong>{h('sections.projectInfo.fields.audience')}</strong></li>
                <li><strong>{h('sections.projectInfo.fields.keywords')}</strong></li>
                <li><strong>{h('sections.projectInfo.fields.tone')}</strong></li>
                <li><strong>{h('sections.projectInfo.fields.description')}</strong></li>
              </ul>

              <h3>{h('sections.aiSelection.title')}</h3>
              <p>{h('sections.aiSelection.intro')}</p>
              <ul>
                <li><strong>{h('sections.aiSelection.options.claude')}</strong></li>
                <li><strong>{h('sections.aiSelection.options.gpt4')}</strong></li>
                <li><strong>{h('sections.aiSelection.options.gemini')}</strong></li>
                <li><strong>{h('sections.aiSelection.options.elevenlabs')}</strong></li>
              </ul>

              <h3>{h('sections.mediaTypes.title')}</h3>
              <p>{h('sections.mediaTypes.description')}</p>

              <h3>{h('sections.advancedFeatures.title')}</h3>
              <ul>
                <li><strong>{h('sections.advancedFeatures.items.adminPanel')}</strong></li>
                <li><strong>{h('sections.advancedFeatures.items.configAPI')}</strong></li>
                <li><strong>{h('sections.advancedFeatures.items.calendar')}</strong></li>
                <li><strong>{h('sections.advancedFeatures.items.history')}</strong></li>
                <li><strong>{h('sections.advancedFeatures.items.analysis')}</strong></li>
              </ul>

              <h3>{h('sections.tips.title')}</h3>
              <p>{h('sections.tips.intro')}</p>
              <ul>
                <li>{h('sections.tips.items.precise')}</li>
                <li>{h('sections.tips.items.tooltips')}</li>
                <li>{h('sections.tips.items.test')}</li>
                <li>{h('sections.tips.items.save')}</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MenuBar;