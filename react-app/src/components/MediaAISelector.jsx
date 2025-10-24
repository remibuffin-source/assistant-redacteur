import { useState, useEffect, useRef } from 'react';
import { useAssistantAutoSave } from '../hooks/useLocalStorage';
import { getHomeText } from '../i18n/homeTranslations';

const MediaAISelector = ({ onAIConfigChange }) => {
  const { autoSaveData } = useAssistantAutoSave();
  const userLanguage = autoSaveData.language || 'fr';
  const t = (path) => getHomeText(userLanguage, path);
  
  const [hoveredMedia, setHoveredMedia] = useState(null);
  const dropdownRefs = useRef({});
  const hoverTimerRef = useRef(null);
  // Configuration par défaut des IA par type de média
  const [aiConfig, setAiConfig] = useState({
    text: 'gpt-4o-mini',
    audio: 'whisper-large-v3',
    image: 'gpt-4o-vision',
    spreadsheet: 'gpt-4o',
    web: 'claude-3.5-sonnet'
  });

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
    'claude-3.5-sonnet': {
      name: 'Claude 3.5 Sonnet',
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
    'gemini-pro': {
      name: 'Gemini Pro',
      provider: 'Google',
      cost: '$0.50/1M tokens',
      speed: 'Très rapide',
      quality: 'Très bonne',
      icon: '✨'
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
    }
  };

  // Types de médias avec leurs IA recommandées
  const mediaTypes = {
    text: {
      label: t('sections.uploadArea.aiSelector.text'),
      icon: '📝',
      recommendedAIs: ['gpt-4o-mini', 'gpt-4o', 'claude-3.5-sonnet', 'claude-3-opus', 'gemini-pro', 'deepseek-v3', 'grok-4'],
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
      recommendedAIs: ['gpt-4o-vision', 'claude-3.5-sonnet', 'gemini-pro', 'grok-4'],
      defaultAI: 'gpt-4o-vision'
    },
    spreadsheet: {
      label: t('sections.uploadArea.aiSelector.table'),
      icon: '📊',
      recommendedAIs: ['gpt-4o', 'claude-3.5-sonnet', 'gpt-4o-mini', 'deepseek-v3', 'grok-4'],
      defaultAI: 'gpt-4o'
    },
    web: {
      label: t('sections.uploadArea.aiSelector.website'),
      icon: '🌐',
      recommendedAIs: ['claude-3.5-sonnet', 'gpt-4o', 'gpt-4o-mini', 'deepseek-v3', 'grok-4'],
      defaultAI: 'claude-3.5-sonnet'
    }
  };

  // Notifier le parent à chaque changement
  useEffect(() => {
    if (onAIConfigChange) {
      onAIConfigChange(aiConfig);
    }
  }, [aiConfig, onAIConfigChange]);

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
      name: 'Rapide',
      icon: '🚀',
      description: 'Ultra-rapide, moins détaillé et pas cher ou gratuit',
      config: {
        text: 'gpt-4o-mini',
        audio: 'whisper-large-v3',
        image: 'gemini-pro',
        spreadsheet: 'gpt-4o-mini',
        web: 'gpt-4o-mini'
      }
    },
    balanced: {
      name: 'Équilibré',
      icon: '⚖️',
      description: 'Bon compromis vitesse/qualité',
      config: {
        text: 'gpt-4o',
        audio: 'whisper-large-v3',
        image: 'gpt-4o-vision',
        spreadsheet: 'claude-3.5-sonnet',
        web: 'claude-3.5-sonnet'
      }
    },
    precise: {
      name: 'Précis',
      icon: '🎯',
      description: 'Max de détails et analyse HQ, plus lent et plus cher',
      config: {
        text: 'claude-3-opus',
        audio: 'whisper-large-v3',
        image: 'gpt-4o-vision',
        spreadsheet: 'claude-3.5-sonnet',
        web: 'claude-3.5-sonnet'
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
  const [dropdownPos, setDropdownPos] = useState({ openFor: null, top: 0, left: 0, width: 0 });
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

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
      {/* Ligne des médias (gauche) - Visible uniquement pour les admins */}
      {isAdmin && (
      <div style={{
        display: 'flex',
        gap: '12px',
        alignItems: 'center',
        flexWrap: 'wrap',
        justifyContent: 'flex-end'
      }}>
        {Object.entries(mediaTypes).map(([type, config]) => {
          const selectedAI = aiConfig[type];
          const aiInfo = getAIInfo(selectedAI);
          const isHovered = hoveredMedia === type;

          return (
            <div
              key={type}
              style={{
                position: 'relative',
                textAlign: 'center'
              }}
              onMouseEnter={(e) => {
                if (hoverTimerRef.current) {
                  clearTimeout(hoverTimerRef.current);
                  hoverTimerRef.current = null;
                }
                setHoveredMedia(type);
                // Pas besoin de calculer la position, on utilise position: absolute
                setDropdownPos({ openFor: type, top: 0, left: 0, width: 0 });
              }}
              onMouseLeave={() => {
                if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
                hoverTimerRef.current = setTimeout(() => {
                  setHoveredMedia(null);
                  hoverTimerRef.current = null;
                }, 1000);
              }}
            >
              {/* Titre du média (2x plus gros, icône orange + label sur une ligne) */}
              <div 
                style={{
                  fontSize: '24px',
                  fontWeight: '600',
                  color: 'var(--text-primary)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  marginBottom: '4px',
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
                title={`${t('sections.uploadArea.aiSelector.selectAI')} ${config.label}`}
              >
                <i className={`${getMediaIconClass(type)}`} style={{ color: '#ff6b35', fontSize: '22px', lineHeight: 1 }}></i>
                <span style={{ fontSize: '14px' }}>{config.label}</span>
              </div>

              {/* Nom de l'IA sélectionnée (sous-titre) */}
              <div style={{
                fontSize: '11px',
                color: 'rgba(255, 255, 255, 0.5)',
                marginTop: '4px'
              }}>
                {aiInfo.name}
              </div>

              {/* Menu déroulant au hover */}
              {isHovered && dropdownPos.openFor === type && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  marginTop: '5px',
                  background: 'var(--bg-primary)',
                  borderRadius: '8px',
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5)',
                  border: '1px solid var(--border-color)',
                  padding: '4px',
                  minWidth: '240px',
                  zIndex: 999999,
                  animation: 'fadeIn 0.2s ease'
                }}
                onMouseEnter={() => {
                  if (hoverTimerRef.current) {
                    clearTimeout(hoverTimerRef.current);
                    hoverTimerRef.current = null;
                  }
                }}
                onMouseLeave={() => {
                  if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
                  hoverTimerRef.current = setTimeout(() => {
                    setHoveredMedia(null);
                    setDropdownPos({ openFor: null, top: 0, left: 0 });
                    hoverTimerRef.current = null;
                  }, 1000);
                }}
                >
                  {config.recommendedAIs.map(aiModel => {
                    const ai = availableAIs[aiModel];
                    const isSelected = selectedAI === aiModel;

                    return (
                      <div
                        key={aiModel}
                        onClick={() => handleAIChange(type, aiModel)}
                        style={{
                          padding: '6px 10px',
                          cursor: 'pointer',
                          borderRadius: '6px',
                          background: isSelected ? 'rgba(255, 107, 53, 0.2)' : 'transparent',
                          transition: 'all 0.2s ease',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          color: 'var(--text-primary)',
                          fontSize: '13px'
                        }}
                        onMouseEnter={(e) => {
                          if (!isSelected) e.currentTarget.style.background = 'rgba(255, 107, 44, 0.1)';
                        }}
                        onMouseLeave={(e) => {
                          if (!isSelected) e.currentTarget.style.background = 'transparent';
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
                          <span style={{ fontSize: '16px' }}>{ai.icon}</span>
                          <div style={{ textAlign: 'left' }}>
                            <div style={{ fontWeight: '600' }}>{ai.name}</div>
                            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '1px' }}>
                              {ai.cost} • {translateAIInfo(ai.quality)}
                            </div>
                          </div>
                        </div>
                        {isSelected && (
                          <span style={{ color: '#ff6b35', fontSize: '16px' }}>✓</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
      )}

      {/* Sélection de profils - 3 boutons côte à côte */}
      <div 
        style={{
          display: 'flex',
          gap: '12px',
          alignItems: 'center',
          flexWrap: 'wrap'
        }}
        title="Déterminez la qualité d'analyse des contenus que vous fournissez."
      >
        {profileOrder.map((key, idx) => {
          const profile = profiles[key];
          const isActive = idx === profileIndex;
          
          return (
            <div
              key={key}
              onClick={() => handleApplyProfileIndex(idx)}
              title="Déterminez la qualité d'analyse des contenus que vous fournissez."
              style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                gap: '10px',
                cursor: 'pointer',
                padding: '6px 16px',
                borderRadius: '10px',
                border: isActive ? '2px solid #ff6b35' : '2px solid rgba(255, 255, 255, 0.2)',
                background: isActive ? 'rgba(255, 107, 53, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                transition: 'all 0.3s ease',
                minWidth: '160px',
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
              <div style={{
                fontSize: '25.6px',
                lineHeight: 1,
                flexShrink: 0
              }}>
                {profile.icon}
              </div>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '3px',
                flex: 1
              }}>
                <div style={{
                  fontSize: '14px',
                  fontWeight: '700',
                  color: isActive ? '#ff6b35' : 'var(--text-primary)',
                  textAlign: 'left'
                }}>
                  {profile.name}
                </div>
                <div style={{
                  fontSize: '11px',
                  color: 'var(--text-secondary)',
                  textAlign: 'left',
                  lineHeight: 1.3
                }}>
                  {profile.description}
                </div>
              </div>
              {isActive && (
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

      {/* Menu déroulant Profil (ancien - caché) */}
      {isAdmin && (
      <div style={{ position: 'relative' }}>
        <div 
          onClick={() => setShowProfileDropdown(!showProfileDropdown)}
          title={t('sections.uploadArea.aiSelector.profileTooltip')}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '4px',
            cursor: 'pointer',
            padding: '10px 14px',
            borderRadius: '8px',
            border: '2px solid #4a90e2',
            background: 'rgba(74, 144, 226, 0.15)',
            transition: 'all 0.2s ease',
            minWidth: '104px',
            boxShadow: '0 2px 8px rgba(74, 144, 226, 0.2)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(74, 144, 226, 0.25)';
            e.currentTarget.style.borderColor = '#357abd';
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(74, 144, 226, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(74, 144, 226, 0.15)';
            e.currentTarget.style.borderColor = '#4a90e2';
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 2px 8px rgba(74, 144, 226, 0.2)';
          }}
        >
          <div style={{
            fontSize: '14px',
            fontWeight: '700',
            color: 'var(--text-primary)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            textShadow: '0 1px 2px rgba(0, 0, 0, 0.1)'
          }}>
            <i className="fas fa-sliders-h" style={{ fontSize: '13px' }}></i>
            {t('sections.uploadArea.aiSelector.profile')}
          </div>
          <div style={{
            fontSize: '14px',
            color: 'var(--text-primary)',
            fontWeight: '600',
            textShadow: '0 1px 2px rgba(0, 0, 0, 0.1)'
          }}>
            {profiles[profileOrder[profileIndex]].name}
          </div>
        </div>

        {showProfileDropdown && (
          <div 
            style={{
              position: 'absolute',
              top: '100%',
              left: '0',
              marginTop: '4px',
              background: 'var(--bg-primary)',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5)',
              minWidth: '160px',
              zIndex: 999999,
              overflow: 'hidden'
            }}
            onMouseLeave={() => setShowProfileDropdown(false)}
          >
            {profileOrder.map((key, idx) => {
              const active = idx === profileIndex;
              return (
                <div
                  key={key}
                  onClick={() => {
                    handleApplyProfileIndex(idx);
                    setShowProfileDropdown(false);
                  }}
                  style={{
                    padding: '12px 16px',
                    cursor: 'pointer',
                    background: active ? 'rgba(255, 107, 44, 0.2)' : 'transparent',
                    color: active ? '#ff6b35' : 'var(--text-primary)',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '10px',
                    fontWeight: active ? '600' : '400'
                  }}
                  onMouseEnter={(e) => {
                    if (!active) e.currentTarget.style.background = 'rgba(255, 107, 44, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    if (!active) e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <span>{profiles[key].name}</span>
                  {active && <i className="fas fa-check" style={{ color: '#ff6b35', fontSize: '12px' }}></i>}
                </div>
              );
            })}
          </div>
        )}
      </div>
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
