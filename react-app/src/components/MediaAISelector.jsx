import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useAssistantAutoSave } from '../hooks/useLocalStorage';
import { getHomeText } from '../i18n/homeTranslations';

const MediaAISelector = ({ onAIConfigChange }) => {
  const { autoSaveData } = useAssistantAutoSave();
  const userLanguage = autoSaveData.language || 'fr';
  const t = (path) => getHomeText(userLanguage, path);
  
  // Configuration par défaut des IA par type de média
  const defaultConfig = {
    text: 'gpt-4o-mini',
    audio: 'whisper-large-v3',
    image: 'gemini-2.5-flash',
    spreadsheet: 'gpt-4o',
    web: 'claude-4.5-sonnet'
  };
  
  const [aiConfig, setAiConfig] = useState(defaultConfig);
  const [isConfigLoaded, setIsConfigLoaded] = useState(false);

  // Charger la configuration depuis l'API au démarrage
  useEffect(() => {
    const loadConfig = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.log('⚠️ Pas de token, utilisation config par défaut');
          setIsConfigLoaded(true);
          return;
        }

        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/media-ai-config`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.config) {
            setAiConfig(data.config);
            console.log('✅ Configuration IA multimodale chargée depuis le serveur:', data.config);
          }
        }
      } catch (error) {
        console.error('❌ Erreur chargement config IA:', error);
      } finally {
        setIsConfigLoaded(true);
      }
    };

    loadConfig();
  }, []);

  // Fonction pour traduire les infos des IA
  const translateAIInfo = (key) => {
    const translations = {
      'Très rapide': t('sections.uploadArea.aiSelector.aiInfo.veryFast'),
      'Rapide': t('sections.uploadArea.aiSelector.aiInfo.fast'),
      'Moyen': t('sections.uploadArea.aiSelector.aiInfo.medium'),
      'Bonne': t('sections.uploadArea.aiSelector.aiInfo.good'),
      'Très bonne': t('sections.uploadArea.aiSelector.aiInfo.veryGood'),
      'Excellente': t('sections.uploadArea.aiSelector.aiInfo.excellent'),
      'Exceptionnelle': t('sections.uploadArea.aiSelector.aiInfo.exceptional')
    };
    return translations[key] || key;
  };

  // Liste des IA disponibles avec leurs caractéristiques
  const availableAIs = {
    'gpt-4o-mini': {
      name: 'GPT-4o Mini',
      provider: 'OpenAI',
      cost: '$0.15/1M tokens',
      speed: 'Très rapide',
      quality: 'Bonne',
      icon: '⚡'
    },
    'gpt-4o': {
      name: 'GPT-4o',
      provider: 'OpenAI',
      cost: '$5.00/1M tokens',
      speed: 'Rapide',
      quality: 'Excellente',
      icon: '🚀'
    },
    'gpt-4o-vision': {
      name: 'GPT-4o Vision',
      provider: 'OpenAI',
      cost: '$5.00/1M tokens',
      speed: 'Rapide',
      quality: 'Excellente',
      icon: '👁️'
    },
    'claude-4.5-sonnet': {
      name: 'Claude 4.5 Sonnet',
      provider: 'Anthropic',
      cost: '$3.00/1M tokens',
      speed: 'Rapide',
      quality: 'Excellente',
      icon: '🎯'
    },
    'claude-3-opus': {
      name: 'Claude 3 Opus',
      provider: 'Anthropic',
      cost: '$15.00/1M tokens',
      speed: 'Moyen',
      quality: 'Exceptionnelle',
      icon: '💎'
    },
    'whisper-large-v3': {
      name: 'Whisper Large v3',
      provider: 'OpenAI',
      cost: '$0.006/min',
      speed: 'Rapide',
      quality: 'Excellente',
      icon: '🎤'
    },
    'elevenlabs': {
      name: 'ElevenLabs',
      provider: 'ElevenLabs',
      cost: '$0.30/1K chars',
      speed: 'Rapide',
      quality: 'Excellente',
      icon: '🔊'
    },
    'gemini-3-pro': {
      name: 'Gemini 3 Pro',
      provider: 'Google via OpenRouter',
      cost: '$2.50/1M tokens',
      speed: 'Rapide',
      quality: 'Exceptionnelle',
      icon: '💎',
      model: 'google/gemini-3.1-pro-preview'
    },
    'gemini-2.5-flash': {
      name: 'Gemini 2.5 Flash (Nano Banana)',
      provider: 'Google via OpenRouter',
      cost: '$0.15/1M tokens',
      speed: 'Très rapide',
      quality: 'Excellente - Génération d\'images',
      icon: '🍌',
      model: 'google/gemini-2.5-flash-image'
    },
    'deepseek-v3': {
      name: 'DeepSeek V3',
      provider: 'DeepSeek',
      cost: '$0.27/1M tokens',
      speed: 'Très rapide',
      quality: 'Très bonne',
      icon: '🧠'
    },
    'grok-4': {
      name: 'Grok 4 Fast Reasoning',
      provider: 'xAI',
      cost: '$0.50/1M tokens',
      speed: 'Très rapide',
      quality: 'Excellente',
      icon: '🤖'
    },
    'qwen3': {
      name: 'Qwen3',
      provider: 'Alibaba Cloud',
      cost: '$0.40/1M tokens',
      speed: 'Très rapide',
      quality: 'Excellente',
      icon: '🌟'
    },
    'glm': {
      name: 'GLM 5.3',
      provider: 'Z.AI via OpenRouter',
      cost: '$0.07/1M tokens',
      speed: 'Très rapide',
      quality: 'Excellente',
      icon: '🔷',
      model: 'z-ai/glm-5.3'
    }
  };

  // Types de médias avec leurs IA recommandées
  const mediaTypes = {
    text: {
      label: t('sections.uploadArea.aiSelector.text'),
      icon: '📝',
      recommendedAIs: ['gpt-4o-mini', 'gpt-4o', 'claude-4.5-sonnet', 'claude-3-opus', 'gemini-3-pro', 'deepseek-v3', 'grok-4', 'qwen3', 'glm'],
      defaultAI: 'gpt-4o-mini'
    },
    audio: {
      label: t('sections.uploadArea.aiSelector.audio'),
      icon: '🎵',
      recommendedAIs: ['whisper-large-v3', 'elevenlabs'],
      defaultAI: 'whisper-large-v3'
    },
    image: {
      label: t('sections.uploadArea.aiSelector.image'),
      icon: '🖼️',
      recommendedAIs: ['gemini-2.5-flash', 'gpt-4o-vision', 'claude-4.5-sonnet', 'gemini-3-pro', 'grok-4', 'qwen3'],
      defaultAI: 'gemini-2.5-flash'
    },
    spreadsheet: {
      label: t('sections.uploadArea.aiSelector.table'),
      icon: '📊',
      recommendedAIs: ['gpt-4o', 'claude-4.5-sonnet', 'gemini-3-pro', 'gpt-4o-mini', 'deepseek-v3', 'grok-4', 'qwen3', 'glm'],
      defaultAI: 'gpt-4o'
    },
    web: {
      label: t('sections.uploadArea.aiSelector.website'),
      icon: '🌐',
      recommendedAIs: ['claude-4.5-sonnet', 'gpt-4o', 'gemini-3-pro', 'gpt-4o-mini', 'deepseek-v3', 'grok-4', 'qwen3', 'glm'],
      defaultAI: 'claude-4.5-sonnet'
    }
  };

  // Notifier le parent à chaque changement
  useEffect(() => {
    // Ne notifier que si la config est chargée (éviter de notifier avec la config par défaut au démarrage)
    if (isConfigLoaded && onAIConfigChange) {
      onAIConfigChange(aiConfig);
    }
  }, [aiConfig, onAIConfigChange, isConfigLoaded]);

  const handleAIChange = (mediaType, aiModel) => {
    setAiConfig(prev => ({
      ...prev,
      [mediaType]: aiModel
    }));
  };

  // Vérifier si l'utilisateur est admin
  const isAdmin = typeof window !== 'undefined' && localStorage.getItem('isAdmin') === 'true';

  // Profils prédéfinis
  const profiles = {
    fast: {
      name: t('sections.uploadArea.aiSelector.profiles.fast'),
      icon: '🚀',
      description: t('sections.uploadArea.aiSelector.profiles.fastDesc'),
      config: {
        text: 'kimi',
        audio: 'qwen3',
        image: 'gemini-2.5-flash',
        spreadsheet: 'qwen3',
        web: 'qwen3'
      }
    },
    balanced: {
      name: t('sections.uploadArea.aiSelector.profiles.balancedNew'),
      icon: '⚖️',
      description: t('sections.uploadArea.aiSelector.profiles.balancedDesc'),
      config: {
        text: 'deepseek-chat',
        audio: 'qwen3',
        image: 'gemini-2.5-flash',
        spreadsheet: 'claude-4.5-sonnet',
        web: 'claude-4.5-sonnet'
      }
    },
    precise: {
      name: t('sections.uploadArea.aiSelector.profiles.precise'),
      icon: '🎯',
      description: t('sections.uploadArea.aiSelector.profiles.preciseDesc'),
      config: {
        text: 'claude-4.5-sonnet',
        audio: 'claude-4.5-sonnet',
        image: 'gemini-3-pro',
        spreadsheet: 'gemini-3-pro',
        web: 'gemini-3-pro'
      }
    }
  };

  const applyProfile = (profileKey) => {
    setAiConfig(profiles[profileKey].config);
  };

  const resetToDefaults = () => {
    const defaults = {};
    Object.keys(mediaTypes).forEach(type => {
      defaults[type] = mediaTypes[type].defaultAI;
    });
    setAiConfig(defaults);
  };

  const getAIInfo = (aiModel) => {
    return availableAIs[aiModel] || {};
  };

  // Profils prédéfinis (existants)
  const profileOrder = ['fast', 'balanced', 'precise'];

  const getProfileIndex = (config) => profileOrder.findIndex(k => JSON.stringify(profiles[k].config) === JSON.stringify(config));
  const [profileIndex, setProfileIndex] = useState(getProfileIndex(aiConfig) >= 0 ? getProfileIndex(aiConfig) : 1);
  const [showPdfPopup, setShowPdfPopup] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [configProfileKey, setConfigProfileKey] = useState(null);
  const [tempProfileConfig, setTempProfileConfig] = useState(null);

  useEffect(() => {
    // Garder l'index aligné si config change via sélection individuelle
    const idx = getProfileIndex(aiConfig);
    if (idx !== -1 && idx !== profileIndex) setProfileIndex(idx);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aiConfig]);

  const handleApplyProfileIndex = (idx) => {
    const key = profileOrder[idx];
    setProfileIndex(idx);
    applyProfile(key);
  };

  const getMediaIconClass = (type) => {
    switch (type) {
      case 'text': return 'fas fa-file-alt';
      case 'audio': return 'fas fa-microphone';
      case 'image': return 'fas fa-image';
      case 'spreadsheet': return 'fas fa-table';
      case 'web': return 'fas fa-globe';
      default: return 'fas fa-file-alt';
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-end',
      gap: '16px',
      flexWrap: 'wrap',
      flex: 1
    }}>
      {/* Sélection de profils - 3 boutons côte à côte */}
      <div 
        style={{
          display: 'flex',
          gap: '12px',
          alignItems: 'center',
          flexWrap: 'wrap'
        }}
        title={t('sections.uploadArea.aiSelector.profileTooltip')}
      >
        {profileOrder.map((key, idx) => {
          const profile = profiles[key];
          const isActive = idx === profileIndex;
          
          return (
            <div
              key={key}
              className={`profile-btn ${isActive ? 'active' : ''}`}
              onClick={() => handleApplyProfileIndex(idx)}
              title={profile.description}
              style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'flex-start',
                gap: '12px',
                cursor: 'pointer',
                padding: '10px 20px',
                borderRadius: '10px',
                border: isActive ? '2px solid #ff6b35' : '2px solid rgba(255, 255, 255, 0.2)',
                background: isActive ? 'rgba(255, 107, 53, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                transition: 'all 0.3s ease',
                minWidth: '200px',
                maxWidth: '300px',
                boxShadow: isActive ? '0 4px 12px rgba(255, 107, 53, 0.3)' : '0 2px 6px rgba(0, 0, 0, 0.2)',
                transform: isActive ? 'translateY(-2px)' : 'translateY(0)',
                position: 'relative'
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'rgba(255, 107, 53, 0.1)';
                  e.currentTarget.style.borderColor = 'rgba(255, 107, 53, 0.5)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }
              }}
            >
              {/* Icône */}
              <div style={{
                fontSize: '22px',
                lineHeight: 1,
                flexShrink: 0
              }}>
                {profile.icon}
              </div>
              
              {/* Titre */}
              <div style={{
                fontSize: '14px',
                fontWeight: '700',
                color: isActive ? '#ff6b35' : 'var(--text-primary)',
                flex: 1
              }}>
                {profile.name}
              </div>
              
              {/* Engrenage (visible uniquement pour admin) */}
              {isAdmin && (
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    setConfigProfileKey(key);
                    // Utiliser la config actuelle (chargée depuis la DB) au lieu du profil prédéfini
                    setTempProfileConfig({ ...aiConfig });
                    setShowConfigModal(true);
                  }}
                  style={{
                    width: '26px',
                    height: '26px',
                    borderRadius: '50%',
                    background: 'rgba(255, 107, 53, 0.2)',
                    border: '1px solid #ff6b35',
                    color: '#ff6b35',
                    fontSize: '13px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    flexShrink: 0,
                    zIndex: 10
                  }}
                  title="Configurer ce profil"
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#ff6b35';
                    e.currentTarget.style.color = 'white';
                    e.currentTarget.style.transform = 'scale(1.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 107, 53, 0.2)';
                    e.currentTarget.style.color = '#ff6b35';
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.8,11.69,4.8,12s0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z"/>
                  </svg>
                </div>
              )}
              
              {/* Checkmark (visible uniquement si actif) */}
              {isActive && (
                <div style={{
                  position: 'absolute',
                  top: '6px',
                  right: '6px',
                  color: '#ff6b35',
                  fontSize: '14px',
                  fontWeight: 'bold'
                }}>
                  ✓
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Bouton d'aide avec popup PDF — masqué */}
      <div
        onClick={() => setShowPdfPopup(true)}
        style={{
          display: 'none',
          alignItems: 'center',
          justifyContent: 'center',
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          background: 'rgba(255, 107, 44, 0.1)',
          border: '2px solid #ff6b35',
          color: '#ff6b35',
          fontSize: '20px',
          fontWeight: '700',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          boxShadow: '0 2px 8px rgba(255, 107, 44, 0.2)',
          flexShrink: 0
        }}
        title="Informations sur les IA disponibles"
        onMouseEnter={(e) => {
          e.currentTarget.style.background = '#ff6b35';
          e.currentTarget.style.color = 'white';
          e.currentTarget.style.transform = 'scale(1.1)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(255, 107, 44, 0.1)';
          e.currentTarget.style.color = '#ff6b35';
          e.currentTarget.style.transform = 'scale(1)';
        }}
      >
        ?
      </div>

      {/* Modal de configuration des profils */}
      {showConfigModal && configProfileKey && createPortal(
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.85)',
            zIndex: 99999999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          onClick={() => setShowConfigModal(false)}
        >
          <div
            style={{
              background: 'var(--bg-primary)',
              borderRadius: '16px',
              padding: '32px',
              maxWidth: '800px',
              width: '90%',
              maxHeight: '80vh',
              overflow: 'auto',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
              border: '2px solid #ff6b35'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* En-tête */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '24px',
              paddingBottom: '16px',
              borderBottom: '2px solid rgba(255, 107, 53, 0.3)'
            }}>
              <h2 style={{
                margin: 0,
                fontSize: '24px',
                fontWeight: '700',
                color: '#ff6b35',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <span style={{ fontSize: '28px' }}>{profiles[configProfileKey].icon}</span>
                Configuration : {profiles[configProfileKey].name}
              </h2>
              <button
                onClick={() => setShowConfigModal(false)}
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: '#ff6b35',
                  border: 'none',
                  color: 'white',
                  fontSize: '24px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#e55a25';
                  e.currentTarget.style.transform = 'scale(1.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#ff6b35';
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                ×
              </button>
            </div>

            {/* Description */}
            <p style={{
              color: 'var(--text-secondary)',
              marginBottom: '32px',
              fontSize: '14px'
            }}>
              {profiles[configProfileKey].description}
            </p>

            {/* Configuration par type de média */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {Object.entries(mediaTypes).map(([type, config]) => {
                const currentAI = tempProfileConfig?.[type] || profiles[configProfileKey].config[type];
                const aiInfo = getAIInfo(currentAI);

                return (
                  <div key={type} style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '12px',
                    padding: '20px',
                    border: '1px solid rgba(255, 107, 53, 0.2)'
                  }}>
                    {/* Titre du type de média */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      marginBottom: '16px'
                    }}>
                      <i className={`${getMediaIconClass(type)}`} style={{ color: '#ff6b35', fontSize: '20px' }}></i>
                      <h3 style={{
                        margin: 0,
                        fontSize: '18px',
                        fontWeight: '600',
                        color: 'var(--text-primary)'
                      }}>
                        {config.label}
                      </h3>
                    </div>

                    {/* Sélection de l'IA */}
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                      gap: '12px'
                    }}>
                      {config.recommendedAIs.map(aiModel => {
                        const ai = availableAIs[aiModel];
                        const isSelected = currentAI === aiModel;

                        return (
                          <div
                            key={aiModel}
                            onClick={() => {
                              // Mettre à jour la configuration temporaire
                              setTempProfileConfig(prev => ({
                                ...prev,
                                [type]: aiModel
                              }));
                            }}
                            style={{
                              padding: '12px',
                              borderRadius: '8px',
                              border: isSelected ? '2px solid #ff6b35' : '2px solid rgba(255, 255, 255, 0.1)',
                              background: isSelected ? 'rgba(255, 107, 53, 0.2)' : 'rgba(255, 255, 255, 0.03)',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease',
                              position: 'relative'
                            }}
                            onMouseEnter={(e) => {
                              if (!isSelected) {
                                e.currentTarget.style.background = 'rgba(255, 107, 53, 0.1)';
                                e.currentTarget.style.borderColor = 'rgba(255, 107, 53, 0.5)';
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (!isSelected) {
                                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                              }
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                              <span style={{ fontSize: '20px' }}>{ai.icon}</span>
                              <div style={{ fontWeight: '600', fontSize: '14px', color: 'var(--text-primary)' }}>
                                {ai.name}
                              </div>
                            </div>
                            <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                              {ai.cost}
                            </div>
                            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                              {translateAIInfo(ai.speed)} • {translateAIInfo(ai.quality)}
                            </div>
                            {isSelected && (
                              <div style={{
                                position: 'absolute',
                                top: '8px',
                                right: '8px',
                                color: '#ff6b35',
                                fontSize: '16px'
                              }}>
                                ✓
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Boutons d'action */}
            <div style={{
              display: 'flex',
              gap: '12px',
              marginTop: '32px',
              paddingTop: '24px',
              borderTop: '2px solid rgba(255, 107, 53, 0.3)'
            }}>
              <button
                onClick={async () => {
                  // Appliquer la configuration temporaire
                  if (tempProfileConfig) {
                    setAiConfig(tempProfileConfig);
                    onAIConfigChange?.(tempProfileConfig);
                    
                    // Si admin, sauvegarder sur le serveur
                    if (isAdmin) {
                      try {
                        const token = localStorage.getItem('token');
                        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/media-ai-config`, {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                          },
                          body: JSON.stringify({ config: tempProfileConfig })
                        });
                        
                        if (response.ok) {
                          const data = await response.json();
                          console.log('✅ Configuration sauvegardée sur le serveur:', data);
                          alert('✅ Configuration sauvegardée avec succès pour tous les utilisateurs !');
                        } else {
                          const error = await response.json();
                          console.error('❌ Erreur sauvegarde:', error);
                          alert(`❌ Erreur: ${error.error || 'Impossible de sauvegarder'}`);
                        }
                      } catch (error) {
                        console.error('❌ Erreur réseau:', error);
                        alert('❌ Erreur de connexion au serveur');
                      }
                    }
                  }
                  setShowConfigModal(false);
                }}
                style={{
                  flex: 1,
                  padding: '14px 24px',
                  borderRadius: '8px',
                  background: '#ff6b35',
                  border: 'none',
                  color: 'white',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#e55a25';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#ff6b35';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                ✓ {isAdmin ? t('sections.uploadArea.aiSelector.configModal.saveForAll') : t('sections.uploadArea.aiSelector.configModal.apply')}
              </button>
              <button
                onClick={() => setShowConfigModal(false)}
                style={{
                  padding: '14px 24px',
                  borderRadius: '8px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '2px solid rgba(255, 255, 255, 0.2)',
                  color: 'var(--text-primary)',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                }}
              >
                {t('sections.uploadArea.aiSelector.configModal.cancel')}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Popup PDF */}
      {showPdfPopup && createPortal(
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.85)',
            zIndex: 99999999
          }}
          onClick={() => setShowPdfPopup(false)}
        >
          <div
            style={{
              position: 'absolute',
              top: '20px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '90%',
              maxWidth: '1200px',
              height: 'calc(100vh - 40px)',
              background: 'white',
              borderRadius: '12px',
              overflow: 'hidden',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowPdfPopup(false)}
              style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: '#ff6b35',
                border: 'none',
                color: 'white',
                fontSize: '24px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000000,
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#e55a25';
                e.currentTarget.style.transform = 'scale(1.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#ff6b35';
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              ×
            </button>
            <embed
              src={`/Infos%20IA${userLanguage !== 'fr' ? `_${userLanguage}` : ''}.pdf#view=FitH&toolbar=0&navpanes=0&scrollbar=1&statusbar=0&messages=0&zoom=100`}
              type="application/pdf"
              style={{
                width: '100%',
                height: '100%',
                border: 'none'
              }}
              title="Informations sur les IA"
              onError={(e) => {
                // Si le PDF traduit n'existe pas, charger la version française
                if (userLanguage !== 'fr') {
                  e.target.src = '/Infos%20IA.pdf#view=FitH&toolbar=0&navpanes=0&scrollbar=1&statusbar=0&messages=0&zoom=100';
                }
              }}
            />
          </div>
        </div>,
        document.body
      )}

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(-5px);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default MediaAISelector;
