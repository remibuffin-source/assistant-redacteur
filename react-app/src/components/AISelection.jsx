import { useState, useEffect } from 'react';
import { useAssistantAutoSave } from '../hooks/useLocalStorage';
import { getHomeText } from '../i18n/homeTranslations';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://api.assistant-redacteur.fr';

const AISelection = ({ selectedAI, onAISelect, contentTypes = { text: true, image: false, video: false } }) => {
  const [freeMode, setFreeMode] = useState(false);
  const [freeModeLoading, setFreeModeLoading] = useState(true);
  const { autoSaveData } = useAssistantAutoSave();
  const userLanguage = autoSaveData.language || 'fr';
  const t = (path) => getHomeText(userLanguage, path);

  // Détection du mode gratuit (pas de token ou 0 crédits)
  useEffect(() => {
    const checkFreeMode = async () => {
      const token = localStorage.getItem('token');
      
      console.log('🔍 AISelection - Vérification mode gratuit');
      console.log('Token présent:', !!token);
      
      // Pas de token = mode gratuit
      if (!token) {
        console.log('❌ Pas de token → MODE GRATUIT activé');
        setFreeMode(true);
        setFreeModeLoading(false);
        // Forcer Qwen3 en mode gratuit
        if (selectedAI !== 'qwen3') {
          onAISelect('qwen3');
        }
        return;
      }

      try {
        console.log('📡 Appel API /credits/balance...');
        const response = await fetch(`${API_BASE_URL}/credits/balance`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        console.log('📡 Réponse API:', response.status, response.ok);

        if (response.ok) {
          const data = await response.json();
          console.log('📦 Données API complètes:', JSON.stringify(data));
          
          const balance = data.credits?.balance ?? data.balance ?? 0;
          console.log('💰 Balance crédits:', balance, '(type:', typeof balance, ')');
          
          // Moins de 1 crédit = mode gratuit
          const isFreeMode = balance < 1 || balance === 0 || !balance;
          console.log('🔍 Test mode gratuit:', { balance, isFreeMode, condition: 'balance < 1' });
          
          if (isFreeMode) {
            console.log('🆓 MODE GRATUIT ACTIVÉ → Balance:', balance);
            setFreeMode(true);
            if (selectedAI !== 'qwen3') {
              console.log('🔄 Forçage de Qwen3');
              onAISelect('qwen3');
            }
          } else {
            console.log('✅ Mode normal → Balance:', balance);
            setFreeMode(false);
          }
        } else {
          console.log('⚠️ Erreur API (status:', response.status, ') → MODE GRATUIT par sécurité');
          setFreeMode(true);
        }
      } catch (error) {
        console.error('❌ Erreur vérification crédits:', error);
        setFreeMode(true);
      } finally {
        setFreeModeLoading(false);
      }
    };

    checkFreeMode();
    
    // Revérifier toutes les 10 secondes
    const interval = setInterval(checkFreeMode, 10000);
    return () => clearInterval(interval);
  }, []);
  
  // Fonction pour afficher l'info DeepL
  const showDeepLInfo = () => {
    alert(
      '📄 DeepL, formats pour les Pièces Jointes :\n\n' +
      '✅ FORMATS SUPPORTÉS :\n' +
      '• DOCX (Word 2007+)\n' +
      '• PPTX (PowerPoint 2007+)\n' +
      '• XLSX (Excel 2007+)\n' +
      '• PDF\n' +
      '• TXT, HTML, HTM\n' +
      '• XLF, XLIFF\n\n' +
      '❌ FORMATS NON SUPPORTÉS :\n' +
      '• ODT, ODS, ODP (OpenDocument)\n' +
      '• DOC, XLS, PPT (Office ancien)\n' +
      '• RTF, EPUB\n\n' +
      '💡 Convertissez vos fichiers ODT/DOC en DOCX ou PDF avant de les traduire.'
    );
  };
  const aiOptions = [
    {
      id: 'claude',
      name: 'Claude',
      icon: 'claude',
      description: 'Assistant conversationnel avancé',
      category: 'text'
    },
    {
      id: 'gpt4',
      name: 'GPT-5.6',
      icon: 'gpt4-new',
      description: 'Modèle de langage puissant',
      category: 'text'
    },
    {
      id: 'gemini',
      name: 'Gemini 3 Pro',
      icon: 'gemini-new',
      description: 'IA générative Google multimodale',
      category: 'text'
    },
    {
      id: 'nano-banana',
      name: 'Nano Banana',
      icon: 'nano-banana',
      description: 'Gemini 2.5 Flash - Génération d\'images',
      category: 'image'
    },
    {
      id: 'deepseek',
      name: 'Deepseek',
      icon: 'deepseek',
      description: 'IA conversationnelle avancée',
      category: 'text'
    },
    {
      id: 'grok',
      name: 'Grok',
      icon: 'grok',
      description: 'IA de X (Twitter)',
      category: 'text'
    },
    {
      id: 'kimi',
      name: 'Kimi',
      icon: 'kimi2',
      description: 'Assistant IA nouvelle génération',
      category: 'text'
    },
    {
      id: 'deepl',
      name: 'DeepL',
      icon: 'Deepl',
      description: 'Traduction professionnelle IA',
      category: 'text'
    },
    {
      id: 'elevenlabs',
      name: 'ElevenLabs',
      icon: 'elevenlabs',
      description: 'Synthèse vocale avancée',
      category: 'text',
      hidden: true // Masqué temporairement
    },
    {
      id: 'qwen3',
      name: 'Qwen3',
      icon: 'qwen3',
      description: 'IA multimodale avancée',
      category: 'text'
    },
    {
      id: 'seedream-text-to-image',
      name: 'SeedDream 5.0 TTI',
      icon: 'fal',
      iconExt: 'svg',
      description: 'Génération d\'images v5 Lite via Fal.ai',
      category: 'image'
    },
    {
      id: 'seedream-edit',
      name: 'SeedDream Edit',
      icon: 'fal',
      iconExt: 'svg',
      description: 'Édition d\'images via Fal.ai',
      category: 'image'
    },
    {
      id: 'gpt-image-2.6',
      name: 'GPT Image 2.6',
      icon: 'gpt4-new',
      description: 'OpenAI - Génération et édition réalistes',
      category: 'image'
    },
    {
      id: 'wan-2.6',
      name: 'WAN 2.6',
      icon: 'wan',
      description: 'Génération vidéo Text/Image/Video-to-Video',
      category: 'video',
      hidden: true // Masqué temporairement
    },
    {
      id: 'veo-3.1',
      name: 'Veo 3.1',
      icon: 'veo 3',
      description: 'Google Veo 3.1 - Vidéo IA haute qualité',
      category: 'video',
      hidden: true // Masqué temporairement
    }
  ];
  
  // Filtrer les IA selon les types de contenu sélectionnés
  const filteredAIOptions = aiOptions.filter(ai => {
    if (ai.hidden) return false;
    // Si aucun type n'est sélectionné, tout afficher
    if (!contentTypes.text && !contentTypes.image && !contentTypes.video) return true;
    // Sinon, filtrer selon la catégorie
    return contentTypes[ai.category];
  });

  const handleAISelect = (aiId) => {
    // En mode gratuit, seul Qwen3 est disponible
    if (freeMode && aiId !== 'qwen3') {
      return; // Ignorer le clic
    }
    // Si c'est DeepL, afficher d'abord l'info sur les formats supportés
    if (aiId === 'deepl') {
      showDeepLInfo();
    }
    onAISelect(aiId);
  };

  return (
    <div className="section-compact ai-section">
      <h3 className="section-title-compact">
        <i className="fas fa-robot"></i>
        {t('sections.aiSelection.title')}
      </h3>
      
      {/* Message mode gratuit */}
      {freeMode && !freeModeLoading && (
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          padding: '10px 15px',
          borderRadius: '8px',
          marginBottom: '15px',
          fontSize: '14px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <span style={{ fontSize: '18px' }}>🆓</span>
          <span><strong>Mode gratuit</strong> : seule l'IA Qwen3 est disponible. <a href="/subscription" style={{ color: '#ffd700', textDecoration: 'underline' }}>Passez en Premium</a> pour accéder à toutes les IA.</span>
        </div>
      )}

      <div className="ai-selection-grid">
        {filteredAIOptions.map((ai) => {
          const isDisabled = freeMode && ai.id !== 'qwen3';
          return (
          <div
            key={ai.id}
            className={`ai-btn-compact ${selectedAI === ai.id ? 'selected' : ''} ${isDisabled ? 'disabled' : ''}`}
            onClick={() => handleAISelect(ai.id)}
            data-ai={ai.id}
            style={isDisabled ? { opacity: 0.4, cursor: 'not-allowed', pointerEvents: 'none' } : {}}
            title={isDisabled ? 'Disponible en mode Premium' : ai.description}
          >
            <div className="ai-icon">
              {ai.icon === 'nano-banana' ? (
                <div style={{
                  fontSize: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '40px',
                  height: '40px'
                }}>
                  🍌
                </div>
              ) : (
                <>
                  <img
                    src={`/icons/${ai.icon}.${ai.iconExt || 'ico'}`}
                    alt={ai.name}
                    className="ai-icon-img"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'block';
                    }}
                  />
                  <div className={`ai-icon-fallback ${ai.icon}`} style={{display: 'none'}}></div>
                </>
              )}
            </div>
            <div className="ai-check"></div>
            <div className="ai-label">{ai.name}</div>
            {isDisabled && (
              <div style={{
                position: 'absolute',
                top: '5px',
                right: '5px',
                fontSize: '10px',
                background: 'rgba(0,0,0,0.6)',
                color: 'white',
                padding: '2px 5px',
                borderRadius: '4px'
              }}>🔒</div>
            )}
          </div>
        )})}
      </div>
    </div>
  );
};

export default AISelection;