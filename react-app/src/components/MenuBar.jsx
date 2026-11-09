import { useState, useEffect } from 'react';
import { useTheme } from '../hooks/useTheme';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useAssistantAutoSave } from '../hooks/useLocalStorage';
import { getMenuText } from '../i18n/menuTranslations';
import { getHelpText } from '../i18n/helpTranslations';
import { getHomeText } from '../i18n/homeTranslations';
import { getEditorText } from '../i18n/editorTranslations';
import StorageManager from '../utils/StorageManager';
import StorageManagerAPI from '../utils/StorageManagerAPI';
import { savePresetFiles, loadPresetFiles, deletePresetFiles } from '../utils/referenceImageStore';

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
  const e = (path) => getEditorText(userLanguage, path);
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
  const [isSaving, setIsSaving] = useState(false); // État de sauvegarde
  const [isLoading, setIsLoading] = useState(false); // État de chargement
  const [loadingItemId, setLoadingItemId] = useState(null); // ID de l'item en cours de chargement
  const [selectedItems, setSelectedItems] = useState([]); // Sélection multiple
  const [editingItem, setEditingItem] = useState(null); // Item en cours de renommage
  const [editingName, setEditingName] = useState(''); // Nouveau nom
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // Menu hamburger mobile

  // Fermer le menu mobile quand on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMobileMenuOpen && !event.target.closest('.menu-container') && !event.target.closest('.hamburger-btn')) {
        setIsMobileMenuOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isMobileMenuOpen]);

  // Fermer le menu mobile après une action
  const handleMobileMenuClick = (action) => {
    setIsMobileMenuOpen(false);
    handleMenuClick(action);
  };

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
          navigate('/social-onboarding');
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

  const handleLoadChoice = async (type) => {
    setLoadType(type);
    setShowLoadChoiceModal(false);
    
    try {
      // Charger la liste appropriée
      if (type === 'config') {
        // Les configs restent en localStorage
        const configs = StorageManager.getSavedConfigs();
        setSavedConfigs(configs);
      } else {
        // Les modèles complets viennent de l'API
        const models = await StorageManagerAPI.getSavedModels();
        setSavedConfigs(models);
      }
      setShowLoadModal(true);
    } catch (error) {
      console.error('Erreur chargement:', error);
      alert('Erreur lors du chargement');
    }
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

    // Pièces jointes : toujours sauvegardées (les préréglages doivent restituer
    // les images de référence avec leurs rôles et leur force)
    config.attachedFiles = appState.attachedFiles || [];

    // Si c'est un modèle complet, ajouter le contenu et les résultats
    if (saveType === 'model') {
      config.content = appState.content || '';
      config.results = appState.results || [];
    }

    try {
      const result = saveType === 'config' 
        ? await StorageManager.saveInterfaceConfig(presetName, config)
        : await StorageManagerAPI.saveModel(presetName, config);
      
      if (result.success) {
        // Identifiant du préréglage : timestamp pour une config, id BDD pour un modèle
        const presetId = saveType === 'config' ? result.timestamp : result.data?.id;

        // Conserver les données riches (base64, rôles, force) dans IndexedDB :
        // les métadonnées serveur ne suffisent pas à restaurer les vignettes
        if (presetId && config.attachedFiles?.length > 0) {
          await savePresetFiles(presetId, config.attachedFiles);
        }

        // Si c'est un modèle complet avec fichiers, les uploader
        if (saveType === 'model' && config.attachedFiles?.length > 0 && result.data?.id) {
          for (const fileData of config.attachedFiles) {
            if (fileData.file) {
              await StorageManagerAPI.uploadFileToCompleteModel(result.data.id, fileData.file);
            }
          }
        }
      }
      
      return result;
    } catch (error) {
      console.error('Erreur sauvegarde:', error);
      return { success: false, message: error.message };
    }
  };

  const handleSaveConfigWrapper = async () => {
    setIsSaving(true); // Activer l'état de chargement
    const result = await handleSaveConfig();
    setIsSaving(false); // Désactiver l'état de chargement
    
    if (result.success) {
      const successMessage = saveType === 'config' 
        ? `✅ Configuration "${presetName}" sauvegardée avec succès !`
        : `✅ Modèle Complet "${presetName}" sauvegardé avec succès !`;
      
      alert(successMessage);
      setShowSaveModal(false);
      setPresetName('');
    } else {
      alert('❌ ' + result.message);
    }
  };

  const handleLoadConfig = async (configId) => {
    setIsLoading(true);
    setLoadingItemId(configId);
    
    try {
      const result = loadType === 'config'
        ? await StorageManager.loadInterfaceConfig(configId)
        : await StorageManagerAPI.loadModel(configId);
      
      if (result.success) {
        const config = result.config;

        // Récupérer les pièces jointes riches depuis IndexedDB (base64 + rôles + force).
        // Si absentes, se rabattre sur la config du préréglage.
        const storedPresetFiles = await loadPresetFiles(configId);
        const attachedFiles = storedPresetFiles.length > 0
          ? storedPresetFiles
          : (config.attachedFiles || []);

        // Utiliser la fonction de chargement exposée par HomeFixed
        if (window.assistantRedacteurLoadState) {
          window.assistantRedacteurLoadState({
            projectData: config.projectData,
            selectedAI: config.selectedAI,
            content: config.content || '',
            attachedFiles,
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
            `- Pièces jointes : ${config.attachedFiles?.length || 0} fichier(s)\n` +
            `- Résultats générés : ${config.results?.length || 0} vignette(s)\n` +
            `- Thème : ${config.theme === 'dark' ? 'Nuit' : 'Jour'}\n\n` +
            `🎉 Tous vos posts sont de retour !`;
        
        alert(loadMessage);
        setShowLoadModal(false);
      } else {
        alert('❌ ' + result.message);
      }
    } catch (error) {
      console.error('Erreur chargement:', error);
      alert('Erreur lors du chargement');
    } finally {
      setIsLoading(false);
      setLoadingItemId(null);
    }
  };

  const handleDeleteConfig = async (configId) => {
    const typeLabel = loadType === 'config' ? 'configuration' : 'modèle';
    if (confirm(`Êtes-vous sûr de vouloir supprimer ce ${typeLabel} ?`)) {
      try {
        const result = loadType === 'config'
          ? await StorageManager.deleteInterfaceConfig(configId)
          : await StorageManagerAPI.deleteModel(configId);
        
        if (result.success) {
          // Recharger la liste appropriée
          if (loadType === 'config') {
            const configs = StorageManager.getSavedConfigs();
            setSavedConfigs(configs);
          } else {
            const models = await StorageManagerAPI.getSavedModels();
            setSavedConfigs(models);
          }
          alert('✅ ' + result.message);
        } else {
          alert('❌ ' + result.message);
        }
      } catch (error) {
        console.error('Erreur suppression:', error);
        alert('Erreur lors de la suppression');
      }
    }
  };

  const handleRenameConfig = async (configId, newName) => {
    if (!newName.trim()) {
      alert('Le nom ne peut pas être vide');
      return;
    }
    try {
      if (loadType === 'config') {
        // Renommer en localStorage
        const configs = StorageManager.getSavedConfigs();
        const configIndex = configs.findIndex(c => c.timestamp === configId);
        if (configIndex !== -1) {
          configs[configIndex].name = newName.trim();
          localStorage.setItem('assistantRedacteur_savedConfigs', JSON.stringify(configs));
          setSavedConfigs([...configs]);
        }
      } else {
        // Renommer via API
        await StorageManagerAPI.renameModel(configId, newName.trim());
        const models = await StorageManagerAPI.getSavedModels();
        setSavedConfigs(models);
      }
      setEditingItem(null);
    } catch (error) {
      console.error('Erreur renommage:', error);
      alert('Erreur lors du renommage');
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
        onClick={showMenu}
        onTouchStart={showMenu}
      ></div>

      {/* Menu amovible */}
      <div
        className={`menu-container ${isMenuVisible ? 'show' : ''} ${isMobileMenuOpen ? 'mobile-open' : ''}`}
        onMouseEnter={keepMenuOpen}
        onMouseLeave={hideMenuDelayed}
      >
        <div className="menu-header">
          <div className="menu-left">
            <img src="/Studio du Cap Brun.png" alt="Studio du Cap Brun" />
            <h1 className="main-title" onClick={() => navigate('/')} style={{cursor: 'pointer'}}>{home('appTitle')}</h1>
          </div>
          
          {/* Bouton hamburger pour mobile */}
          <button 
            className="hamburger-btn"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Menu"
          >
            <span className={`hamburger-line ${isMobileMenuOpen ? 'open' : ''}`}></span>
            <span className={`hamburger-line ${isMobileMenuOpen ? 'open' : ''}`}></span>
            <span className={`hamburger-line ${isMobileMenuOpen ? 'open' : ''}`}></span>
          </button>
          
          {/* Boutons desktop (cachés sur mobile) */}
          <div className="menu-buttons menu-buttons-desktop">
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
                  <span>{t('buttons.network')}</span>
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
        
        {/* Menu mobile déroulant */}
        {isMobileMenuOpen && (
          <div className="mobile-menu-dropdown">
            <button className="mobile-menu-item" onClick={() => handleMobileMenuClick('open')}>
              <i className="fas fa-folder-open"></i>
              <span>{t('buttons.open')}</span>
            </button>
            <button className="mobile-menu-item" onClick={() => handleMobileMenuClick('save')}>
              <i className="fas fa-save"></i>
              <span>{t('buttons.save')}</span>
            </button>
            <button className="mobile-menu-item" onClick={() => handleMobileMenuClick('analyze')}>
              <i className="fas fa-chart-bar"></i>
              <span>{t('buttons.analyze')}</span>
            </button>
            
            {isAuthenticated ? (
              <>
                <button className="mobile-menu-item" onClick={() => handleMobileMenuClick('account')}>
                  <i className="fas fa-user"></i>
                  <span>{t('buttons.account')}</span>
                </button>
                <button className="mobile-menu-item" onClick={() => handleMobileMenuClick('network')}>
                  <i className="fas fa-share-alt"></i>
                  <span>{t('buttons.network')}</span>
                </button>
                <button className="mobile-menu-item" onClick={() => handleMobileMenuClick('calendar')}>
                  <i className="fas fa-calendar-alt"></i>
                  <span>{t('buttons.calendar')}</span>
                </button>
                <button className="mobile-menu-item" onClick={() => handleMobileMenuClick('editor')}>
                  <i className="fas fa-edit"></i>
                  <span>{t('buttons.editor')}</span>
                </button>
                <button className="mobile-menu-item" onClick={() => handleMobileMenuClick('subscription')}>
                  <i className="fas fa-crown"></i>
                  <span>{t('buttons.subscription')}</span>
                </button>
                {(user?.role === 'admin' || user?.email === 'admin@studioducapbrun.com') && (
                  <button className="mobile-menu-item" onClick={() => handleMobileMenuClick('config')}>
                    <i className="fas fa-shield-alt"></i>
                    <span>Admin</span>
                  </button>
                )}
                <button className="mobile-menu-item logout" onClick={() => handleMobileMenuClick('logout')}>
                  <i className="fas fa-sign-out-alt"></i>
                  <span>{t('buttons.logout')}</span>
                </button>
              </>
            ) : (
              <button className="mobile-menu-item login" onClick={() => handleMobileMenuClick('login')}>
                <i className="fas fa-sign-in-alt"></i>
                <span>{t('buttons.login')}</span>
              </button>
            )}
            
            <div className="mobile-menu-footer">
              {/* Thème avec dropdown */}
              <div className="mobile-dropdown-container">
                <button className="mobile-menu-icon-btn" onClick={(e) => {
                  e.stopPropagation();
                  const dropdown = e.currentTarget.nextElementSibling;
                  dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
                }}>
                  <i className={`fas fa-${currentTheme === 'dark' ? 'moon' : 'sun'}`}></i>
                </button>
                <div className="mobile-dropdown-menu" style={{display: 'none'}}>
                  <button onClick={() => { 
                    if (currentTheme === 'light') toggleTheme(); 
                    setIsMobileMenuOpen(false); 
                  }}>
                    <i className="fas fa-moon"></i> Nuit
                  </button>
                  <button onClick={() => { 
                    if (currentTheme === 'dark') toggleTheme(); 
                    setIsMobileMenuOpen(false); 
                  }}>
                    <i className="fas fa-sun"></i> Jour
                  </button>
                </div>
              </div>
              
              {/* Langue avec dropdown */}
              <div className="mobile-dropdown-container">
                <button className="mobile-menu-icon-btn" onClick={(e) => {
                  e.stopPropagation();
                  const dropdown = e.currentTarget.nextElementSibling;
                  dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
                }}>
                  <i className="fas fa-globe"></i>
                  <span>{userLanguage.toUpperCase()}</span>
                </button>
                <div className="mobile-dropdown-menu" style={{display: 'none'}}>
                  <button onClick={() => { changeLanguage('fr'); setIsMobileMenuOpen(false); }}>
                    <span className="flag">🇫🇷</span> Français
                  </button>
                  <button onClick={() => { changeLanguage('en'); setIsMobileMenuOpen(false); }}>
                    <span className="flag">🇬🇧</span> English
                  </button>
                  <button onClick={() => { changeLanguage('es'); setIsMobileMenuOpen(false); }}>
                    <span className="flag">🇪🇸</span> Español
                  </button>
                  <button onClick={() => { changeLanguage('de'); setIsMobileMenuOpen(false); }}>
                    <span className="flag">🇩🇪</span> Deutsch
                  </button>
                </div>
              </div>
              
              <button className="mobile-menu-icon-btn" onClick={() => { setIsMobileMenuOpen(false); setShowHelpModal(true); }}>
                <span>?</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modale de choix - Enregistrer */}
      {showSaveChoiceModal && (
        <div className="modal-overlay" onClick={() => setShowSaveChoiceModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>{t('modals.saveChoice.title')}</h3>
            <p style={{fontSize: '0.9rem', color: '#666', marginBottom: '20px'}}>
              {t('modals.saveChoice.subtitle')}
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
                {t('modals.saveChoice.config')}
                <div style={{fontSize: '0.85rem', fontWeight: '400', marginTop: '5px', opacity: '0.9'}}>
                  {t('modals.saveChoice.configDesc')}
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
                {t('modals.saveChoice.completeModel')}
                <div style={{fontSize: '0.85rem', fontWeight: '400', marginTop: '5px', opacity: '0.9'}}>
                  {t('modals.saveChoice.completeModelDesc')}
                </div>
              </button>
            </div>
            <div className="modal-buttons" style={{marginTop: '20px'}}>
              <button onClick={() => setShowSaveChoiceModal(false)}>{t('modals.saveChoice.cancel')}</button>
            </div>
          </div>
        </div>
      )}

      {/* Modale de choix - Ouvrir */}
      {showLoadChoiceModal && (
        <div className="modal-overlay" onClick={() => setShowLoadChoiceModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>{t('modals.loadChoice.title')}</h3>
            <p style={{fontSize: '0.9rem', color: '#666', marginBottom: '20px'}}>
              {t('modals.loadChoice.subtitle')}
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
                {t('modals.loadChoice.config')}
                <div style={{fontSize: '0.85rem', fontWeight: '400', marginTop: '5px', opacity: '0.9'}}>
                  {t('modals.loadChoice.configDesc')}
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
                {t('modals.loadChoice.completeModel')}
                <div style={{fontSize: '0.85rem', fontWeight: '400', marginTop: '5px', opacity: '0.9'}}>
                  {t('modals.loadChoice.completeModelDesc')}
                </div>
              </button>
              <button 
                onClick={() => {
                  setShowLoadChoiceModal(false);
                  navigate('/stockage');
                }}
                style={{
                  padding: '15px 20px',
                  background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
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
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(56, 239, 125, 0.4)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <i className="fas fa-database" style={{marginRight: '10px'}}></i>
                {t('modals.loadChoice.storage')}
                <div style={{fontSize: '0.85rem', fontWeight: '400', marginTop: '5px', opacity: '0.9'}}>
                  {t('modals.loadChoice.storageDesc')}
                </div>
              </button>
            </div>
            <div className="modal-buttons" style={{marginTop: '20px'}}>
              <button onClick={() => setShowLoadChoiceModal(false)}>{t('modals.loadChoice.cancel')}</button>
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
              <button onClick={handleSaveConfigWrapper} disabled={isSaving} style={{opacity: isSaving ? 0.7 : 1}}>
                {isSaving ? (
                  <>
                    <i className="fas fa-spinner fa-spin" style={{marginRight: '8px'}}></i>
                    Enregistrement...
                  </>
                ) : (
                  'Sauvegarder'
                )}
              </button>
              <button onClick={() => setShowSaveModal(false)} disabled={isSaving}>Annuler</button>
            </div>
          </div>
        </div>
      )}

      {/* Modale de chargement */}
      {showLoadModal && (
        <div className="modal-overlay" onClick={() => { setShowLoadModal(false); setSelectedItems([]); setEditingItem(null); }}>
          <div className="modal-content modal-content-xlarge" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '700px', maxHeight: '80vh' }}>
            <h3>{loadType === 'config' ? 'Charger une Configuration' : 'Charger un Modèle Complet'}</h3>
            <p style={{fontSize: '0.9rem', color: '#666', marginBottom: '15px'}}>
              {loadType === 'config' 
                ? 'Sélectionnez un préréglage à charger'
                : 'Sélectionnez un modèle complet (avec contenu et résultats)'}
            </p>
            
            {/* Barre d'actions pour sélection multiple */}
            {savedConfigs.length > 0 && (
              <div style={{ display: 'flex', gap: '10px', marginBottom: '15px', alignItems: 'center', flexWrap: 'wrap' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px' }}>
                  <input
                    type="checkbox"
                    checked={selectedItems.length === savedConfigs.length && savedConfigs.length > 0}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedItems(savedConfigs.map(c => loadType === 'config' ? c.timestamp : c.id));
                      } else {
                        setSelectedItems([]);
                      }
                    }}
                    style={{ width: '18px', height: '18px', borderRadius: '50%', accentColor: '#ff6b2c', cursor: 'pointer' }}
                  />
                  Tout sélectionner
                </label>
                {selectedItems.length > 0 && (
                  <button
                    onClick={async () => {
                      // Suppression en lot sans confirmation individuelle
                      for (const id of selectedItems) {
                        try {
                          if (loadType === 'config') {
                            await StorageManager.deleteInterfaceConfig(id);
                          } else {
                            await StorageManagerAPI.deleteModel(id);
                          }
                          // Nettoyer les pièces jointes associées dans IndexedDB
                          await deletePresetFiles(id);
                        } catch (error) {
                          console.error('Erreur suppression:', error);
                        }
                      }
                      // Recharger la liste
                      if (loadType === 'config') {
                        const configs = StorageManager.getSavedConfigs();
                        setSavedConfigs(configs);
                      } else {
                        const models = await StorageManagerAPI.getSavedModels();
                        setSavedConfigs(models);
                      }
                      setSelectedItems([]);
                      alert(`✅ ${selectedItems.length} élément(s) supprimé(s)`);
                    }}
                    className="delete-btn"
                    style={{ padding: '6px 12px' }}
                  >
                    <i className="fas fa-trash"></i> Supprimer ({selectedItems.length})
                  </button>
                )}
              </div>
            )}
            
            <div className="config-list" style={{ maxHeight: '50vh', overflowY: 'auto' }}>
              {savedConfigs.length === 0 ? (
                <p style={{textAlign: 'center', color: '#999', padding: '20px'}}>
                  {loadType === 'config' ? 'Aucune configuration sauvegardée' : 'Aucun modèle sauvegardé'}
                </p>
              ) : (
                savedConfigs.map((config) => {
                  const itemId = loadType === 'config' ? config.timestamp : config.id;
                  const isSelected = selectedItems.includes(itemId);
                  const isEditing = editingItem === itemId;
                  const dateStr = config.timestamp || config.createdAt || config.created_at;
                  const displayDate = dateStr ? new Date(dateStr).toLocaleString('fr-FR') : 'Date inconnue';
                  
                  return (
                    <div key={itemId} className={`config-item ${isSelected ? 'selected' : ''}`} style={{ background: isSelected ? 'rgba(255, 107, 44, 0.1)' : undefined, padding: '6px 10px', minHeight: 'auto' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedItems([...selectedItems, itemId]);
                            } else {
                              setSelectedItems(selectedItems.filter(id => id !== itemId));
                            }
                          }}
                          style={{ 
                            width: '20px', 
                            height: '20px', 
                            borderRadius: '50%', 
                            accentColor: '#ff6b2c',
                            cursor: 'pointer',
                            flexShrink: 0
                          }}
                        />
                        <div className="config-info" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          {isEditing ? (
                            <input
                              type="text"
                              value={editingName}
                              onChange={(e) => setEditingName(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  handleRenameConfig(itemId, editingName);
                                } else if (e.key === 'Escape') {
                                  setEditingItem(null);
                                }
                              }}
                              autoFocus
                              style={{ padding: '4px 8px', fontSize: '14px', width: '100%' }}
                            />
                          ) : (
                            <strong style={{ fontSize: '13px' }}>{config.name}</strong>
                          )}
                          <small style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>{displayDate}</small>
                        </div>
                      </div>
                      <div className="config-actions">
                        {isEditing ? (
                          <>
                            <button onClick={() => handleRenameConfig(itemId, editingName)} className="load-btn" style={{ padding: '4px 8px' }}>
                              <i className="fas fa-check"></i>
                            </button>
                            <button onClick={() => setEditingItem(null)} className="delete-btn" style={{ padding: '4px 8px' }}>
                              <i className="fas fa-times"></i>
                            </button>
                          </>
                        ) : (
                          <>
                            <button 
                              onClick={() => { setEditingItem(itemId); setEditingName(config.name); }}
                              className="edit-btn"
                              title="Renommer"
                              style={{ padding: '4px 8px' }}
                            >
                              <i className="fas fa-pen"></i>
                            </button>
                            <button 
                              onClick={() => handleLoadConfig(itemId)}
                              className="load-btn"
                              disabled={isLoading}
                              style={{ opacity: loadingItemId === itemId ? 0.7 : 1 }}
                            >
                              {loadingItemId === itemId ? (
                                <>
                                  <i className="fas fa-spinner fa-spin"></i> Chargement...
                                </>
                              ) : (
                                <>
                                  <i className="fas fa-folder-open"></i> Charger
                                </>
                              )}
                            </button>
                            <button 
                              onClick={() => handleDeleteConfig(itemId)}
                              className="delete-btn"
                            >
                              <i className="fas fa-trash"></i>
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
            <div className="modal-buttons">
              <button onClick={() => { setShowLoadModal(false); setSelectedItems([]); setEditingItem(null); }}>Fermer</button>
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