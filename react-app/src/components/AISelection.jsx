import { useAssistantAutoSave } from '../hooks/useLocalStorage';
import { getHomeText } from '../i18n/homeTranslations';

const AISelection = ({ selectedAI, onAISelect }) => {
  const { autoSaveData } = useAssistantAutoSave();
  const userLanguage = autoSaveData.language || 'fr';
  const t = (path) => getHomeText(userLanguage, path);
  
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
      description: 'Assistant conversationnel avancé'
    },
    {
      id: 'gpt4',
      name: 'GPT-4',
      icon: 'gpt4-new',
      description: 'Modèle de langage puissant'
    },
    {
      id: 'gemini',
      name: 'Gemini',
      icon: 'gemini-new',
      description: 'IA générative Google'
    },
    {
      id: 'deepseek',
      name: 'Deepseek',
      icon: 'deepseek',
      description: 'IA conversationnelle avancée'
    },
    {
      id: 'grok',
      name: 'Grok',
      icon: 'grok',
      description: 'IA de X (Twitter)'
    },
    {
      id: 'kimi2',
      name: 'Kimi2',
      icon: 'kimi2',
      description: 'Assistant IA nouvelle génération'
    },
    {
      id: 'deepl',
      name: 'DeepL',
      icon: 'Deepl',
      description: 'Traduction professionnelle IA'
    },
    {
      id: 'elevenlabs',
      name: 'ElevenLabs',
      icon: 'elevenlabs',
      description: 'Synthèse vocale avancée'
    },
    {
      id: 'qwen3',
      name: 'Qwen3',
      icon: 'qwen3',
      description: 'IA multimodale avancée'
    }
  ];

  const handleAISelect = (aiId) => {
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
      
      <div className="ai-selection-grid">
        {aiOptions.map((ai) => (
          <div
            key={ai.id}
            className={`ai-btn-compact ${selectedAI === ai.id ? 'selected' : ''}`}
            onClick={() => handleAISelect(ai.id)}
            data-ai={ai.id}
          >
            <div className="ai-icon">
              <img
                src={`/icons/${ai.icon}.ico`}
                alt={ai.name}
                className="ai-icon-img"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'block';
                }}
              />
              <div className={`ai-icon-fallback ${ai.icon}`} style={{display: 'none'}}></div>
            </div>
            <div className="ai-check"></div>
            <div className="ai-label">{ai.name}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AISelection;