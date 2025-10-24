import { useState, useEffect } from 'react';
import { useTheme } from '../hooks/useTheme'
import { useAssistantAutoSave } from '../hooks/useLocalStorage';
import { getHomeText } from '../i18n/homeTranslations';
import MenuBar from './MenuBar'
import ProjectInfoSimple from './ProjectInfoSimple'
import AISelection from './AISelection'
import UploadArea from './UploadArea'
import ProcessingTasks from './ProcessingTasks'
import OutputFormats from './OutputFormats'
import ResultsGrid from './ResultsGrid'
import AdvancedPersonalization from './AdvancedPersonalization'
import HelpModal from './HelpModal'
export default function HomeFixed() {
  const { autoSaveData } = useAssistantAutoSave();
  const userLanguage = autoSaveData.language || 'fr';
  const t = (path) => getHomeText(userLanguage, path);
  // Appliquer le thème dès le démarrage
  useTheme();

  // Debug temporaire - vérifier que les variables CSS sont définies
  useEffect(() => {
    const checkThemeVariables = () => {
      const body = document.body;
      const computedStyle = getComputedStyle(body);
      const bgPrimary = computedStyle.getPropertyValue('--bg-primary');
      const textPrimary = computedStyle.getPropertyValue('--text-primary');

      console.log('Variables CSS du thème:', {
        'data-theme': body.getAttribute('data-theme'),
        '--bg-primary': bgPrimary,
        '--text-primary': textPrimary,
        'background': computedStyle.backgroundColor,
        'color': computedStyle.color
      });

      // Si les variables ne sont pas définies, forcer le thème
      if (!bgPrimary || bgPrimary === '') {
        console.warn('Variables CSS du thème non définies, application forcée...');
        body.setAttribute('data-theme', 'dark');
      }
    };

    // Vérifier après un petit délai pour laisser le temps au thème de s'appliquer
    const timer = setTimeout(checkThemeVariables, 100);

    return () => clearTimeout(timer);
  }, []);
  useEffect(() => {
    const css = `
      /* FORCE l'espacement uniforme de 25px sur toute la page Home */
      .main-container > .section { 
        margin-top: 25px !important; 
        margin-bottom: 0 !important;
      }
      .main-container > .section:first-child { 
        margin-top: 0 !important; 
      }
      .main-container > .section-compact { 
        margin-top: 25px !important; 
        margin-bottom: 0 !important; 
      }
      .main-container > .section:nth-child(3),
      .main-container > .section:nth-child(4),
      .main-container > .section:nth-child(5) { 
        margin-top: 25px !important; 
      }
      
      /* FORCE le fond blanc pour la description du projet */
      .project-description-container {
        background: #ffffff !important;
        border: 1px solid rgba(0, 0, 0, 0.2) !important;
        min-height: 40px !important;
      }
      
      .project-description-container textarea {
        background: transparent !important;
        color: #111111 !important;
        min-height: 40px !important;
      }

      /* MODE JOUR - Adoucir le fond et renforcer les bordures */
      [data-theme="light"] .section,
      [data-theme="light"] .section-compact {
        background: rgba(248, 250, 252, 0.9) !important; /* Fond adouci avec 10% de gris */
        border: 1px solid rgba(0, 0, 0, 0.26) !important; /* Bordure renforcée de 30% */
      }

      [data-theme="light"] .project-description-container {
        background: #f7f7f7 !important; /* Fond légèrement grisé au lieu de blanc pur */
        border: 1px solid rgba(0, 0, 0, 0.26) !important; /* Bordure renforcée */
      }

      /* Boutons en position OFF - 10% de gris en plus en mode jour */
      [data-theme="light"] .ai-btn-compact:not(.selected) .ai-icon,
      [data-theme="light"] .task-btn-original:not(.selected),
      [data-theme="light"] .format-btn-original:not(.selected) {
        background: rgba(229, 231, 235, 0.9) !important; /* 10% de gris en plus */
      }
    `;
    const id = '__home_spacing_overrides__';
    if (!document.getElementById(id)) {
      const el = document.createElement('style');
      el.id = id;
      el.textContent = css;
      document.head.appendChild(el);
    }
  }, []);
  const [projectData, setProjectData] = useState({
    projectTitle: '',
    targetAudience: '',
    tone: '',
    projectDescription: ''
  })
  const [selectedAI, setSelectedAI] = useState('gpt4')
  const [content, setContent] = useState('')
  const [attachedFiles, setAttachedFiles] = useState([])
  const [mediaAIConfig, setMediaAIConfig] = useState(null) // Configuration IA multimodales
  const [selectedTasks, setSelectedTasks] = useState(['rewrite'])
  const [selectedFormats, setSelectedFormats] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [results, setResults] = useState([])
  const [isRecording, setIsRecording] = useState(false)
  const [isDictating, setIsDictating] = useState(false)
  const [showHelpModal, setShowHelpModal] = useState(false)
  const [advancedOptions, setAdvancedOptions] = useState({
    style: 'professionnel',
    length: 3,
    creativity: 3,
    adaptation: 'web'
  })

  // Exposer tous les états pour la sauvegarde
  useEffect(() => {
    window.assistantRedacteurState = {
      projectData,
      selectedAI,
      content,
      selectedTasks,
      selectedFormats,
      advancedOptions,
      results
    };
  }, [projectData, selectedAI, content, selectedTasks, selectedFormats, advancedOptions, results]);

  // Fonction pour charger un état complet
  const loadState = (state) => {
    if (state.projectData) setProjectData(state.projectData);
    if (state.selectedAI) setSelectedAI(state.selectedAI);
    if (state.content) setContent(state.content);
    if (state.selectedTasks) setSelectedTasks(state.selectedTasks);
    if (state.selectedFormats) setSelectedFormats(state.selectedFormats);
    if (state.advancedOptions) setAdvancedOptions(state.advancedOptions);
    if (state.results) setResults(state.results);
  };

  // Exposer la fonction de chargement
  useEffect(() => {
    window.assistantRedacteurLoadState = loadState;
  }, []);

  const handleTaskToggle = (taskId) => {
    setSelectedTasks(prev => prev.includes(taskId) ? prev.filter(id => id !== taskId) : [...prev, taskId])
  }

  const handleFormatToggle = (formatId) => {
    setSelectedFormats(prev => prev.includes(formatId) ? prev.filter(id => id !== formatId) : [...prev, formatId])
  }

  // Fonction pour détecter le type de média d'un fichier
  const detectMediaType = (file) => {
    if (!file) return null;
    
    const fileName = file.name.toLowerCase();
    const fileType = file.type.toLowerCase();
    
    // Images
    if (fileType.startsWith('image/') || /\.(jpg|jpeg|png|gif|bmp|webp|svg)$/.test(fileName)) {
      return 'image';
    }
    
    // Audio
    if (fileType.startsWith('audio/') || /\.(mp3|wav|ogg|m4a|flac|aac)$/.test(fileName)) {
      return 'audio';
    }
    
    // Tableaux Excel
    if (fileType.includes('spreadsheet') || /\.(xlsx|xls|csv)$/.test(fileName)) {
      return 'spreadsheet';
    }
    
    // Documents texte (PDF, Word, etc.)
    if (fileType.includes('pdf') || fileType.includes('document') || 
        /\.(pdf|doc|docx|txt|rtf|odt)$/.test(fileName)) {
      return 'text';
    }
    
    // Par défaut, considérer comme texte
    return 'text';
  };

  const handleGenerate = async () => {
    if (!content.trim() && attachedFiles.length === 0) {
      alert('Veuillez saisir du contenu ou attacher un fichier avant de lancer la génération.');
      return;
    }
    
    if (!selectedAI) {
      alert('Veuillez sélectionner une IA avant de lancer la génération.');
      return;
    }

    if (selectedFormats.length === 0) {
      alert('Veuillez sélectionner au moins un format de sortie.');
      return;
    }
    
    setIsLoading(true)
    
    try {
      // ARCHITECTURE MATRICE : Chaque tâche × Chaque format
      // Si 2 tâches et 2 formats → 4 résultats distincts
      const newResults = [];
      let delayCounter = 0;
      
      // Boucle sur chaque TÂCHE sélectionnée
      for (const task of selectedTasks) {
        // Pour chaque tâche, générer TOUS les formats
        const taskResults = await Promise.all(
          selectedFormats.map(async (format) => {
            // Délai progressif pour éviter de surcharger les API
            await new Promise(r => setTimeout(r, delayCounter * 500));
            delayCounter++;
            
            // Déterminer l'IA à utiliser et le contenu à traiter
            let aiToUse = selectedAI;
            let contentToProcess = content;
            
            // Si un fichier est attaché
            if (attachedFiles.length > 0) {
              const file = attachedFiles[0];
              
              // Cas spécial : DeepL pour traduction de documents
              if (selectedAI === 'deepl') {
                contentToProcess = { file: file.file };
              } 
              // Autres IA : utiliser l'IA multimodale appropriée
              else if (mediaAIConfig) {
                const mediaType = detectMediaType(file.file);
                console.log(`📎 Fichier détecté : ${file.name} (type: ${mediaType})`);
                
                // Utiliser l'IA configurée pour ce type de média
                if (mediaType && mediaAIConfig[mediaType]) {
                  aiToUse = mediaAIConfig[mediaType];
                  console.log(`🤖 IA sélectionnée pour ${mediaType} : ${aiToUse}`);
                }
                
                // Passer le fichier avec le contenu textuel
                contentToProcess = {
                  text: content,
                  file: file.file,
                  mediaType: mediaType
                };
              }
            }
            
            const generatedContent = await generateContentForFormat(
              format, 
              contentToProcess, 
              aiToUse, 
              [task], // UNE SEULE tâche par flux
              advancedOptions,
              projectData
            );
            
            // Créer le résultat de base
            const result = {
              id: Date.now() + delayCounter,
              task: task,
              format: format,
              title: `${getTaskTitle(task)} - ${getFormatTitle(format)}`,
              content: typeof generatedContent === 'object' && generatedContent.content 
                ? generatedContent.content 
                : generatedContent
            };
            
            // Si c'est un objet avec documentUrl (document traduit DeepL), ajouter les propriétés
            if (typeof generatedContent === 'object' && generatedContent.documentUrl) {
              result.documentUrl = generatedContent.documentUrl;
              result.fileName = generatedContent.fileName;
              result.model = generatedContent.model;
            }
            
            return result;
          })
        );
        
        newResults.push(...taskResults);
      }
      
      setResults(prev => [...prev, ...newResults]);
    } catch (error) {
      console.error('Erreur lors de la génération:', error);
      alert(`Erreur lors de la génération: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  }

  const getTaskTitle = (task) => {
    const titles = {
      resume: 'Résumer',
      develop: 'Développer',
      correct: 'Corriger',
      ideas: 'Idées Supplémentaires',
      extract: 'Extraire Arguments',
      rewrite: 'Réécriture',
      analyze: 'Analyse',
      translate: 'Traduction'
    };
    return titles[task] || task;
  }

  const getFormatTitle = (format) => {
    const titles = {
      // Réseaux sociaux
      'post-facebook': 'Publication Facebook',
      'post-instagram': 'Post Instagram',
      'post-x': 'Tweet X',
      'post-linkedin': 'Post LinkedIn',
      'video-youtube': 'Description YouTube',
      'video-tiktok': 'TikTok',
      
      // Communication
      'newsletter': 'Newsletter Email',
      'story': 'Story',
      'reel': 'Reel',
      'carousel': 'Carrousel',
      'my-blog': 'Article de Blog',
      'my-website': 'Contenu Web',
      
      // Écriture
      'dialogue': 'Dialogue',
      'litteraire': 'Littéraire',
      'arguments': 'Arguments commerciaux',
      'explicatifs': 'Textes explicatifs'
    };
    return titles[format] || 'Contenu généré';
  }

  const handleDeleteResult = (resultId) => {
    setResults(prev => prev.filter(result => result.id !== resultId));
  }

  const generateContentForFormat = async (format, baseContent, ai, tasks, advOptions, projData) => {
    // Import du service IA
    const { AIService } = await import('../services/aiService');
    
    try {
      // Préparer les données pour l'IA
      const aiData = {
        content: baseContent,
        projectData: projData,
        tasks: tasks,
        advancedOptions: advOptions,
        format: format
      };

      // Appeler le service IA avec compilation complète des paramètres
      const result = await AIService.generateContent(ai, aiData);
      
      if (result.success) {
        // Si c'est un document DeepL (avec documentUrl), retourner l'objet complet
        if (result.documentUrl && result.fileName) {
          return result; // Retourne {content, documentUrl, fileName, model}
        }
        // Sinon, retourner juste le contenu (texte)
        return result.content;
      } else {
        // En cas d'erreur, retourner le contenu avec message d'erreur
        return result.content || `⚠️ Erreur: ${result.error}\n\n${baseContent}`;
      }
      
    } catch (error) {
      console.error('Erreur génération format:', error);
      
      // Fallback: formatage simple si l'IA échoue
      return generateSimpleFallback(format, baseContent, advOptions, projData);
    }
  }

  const generateSimpleFallback = (format, baseContent, advOptions, projData) => {
    // Extraire le texte si baseContent est un objet (avec fichier attaché)
    const textContent = typeof baseContent === 'object' && baseContent.text 
      ? baseContent.text 
      : (typeof baseContent === 'string' ? baseContent : '');
    
    // Si c'est un objet avec fichier, on ne peut pas faire de fallback simple
    if (typeof baseContent === 'object' && baseContent.file) {
      return '⚠️ Impossible de traiter le fichier sans IA. Veuillez réessayer avec une connexion IA active.';
    }
    
    // Calcul du pourcentage basé sur advancedOptions.length
    const lengthPercentages = {
      1: 0.30, // 30%
      2: 0.65, // 65%
      3: 1.00, // 100%
      4: 1.30, // 130%
      5: 1.60  // 160%
    };
    
    const lengthMultiplier = lengthPercentages[advOptions?.length || 3] || 1.00;
    
    // Longueurs de base pour chaque format (100%)
    const baseLengths = {
      'post-facebook': 400,
      'post-instagram': 2200,
      'post-twitter': 280,
      'post-linkedin': 1300,
      'video-youtube': 5000,
      'video-tiktok': 150,
      'newsletter-email': textContent.length,
      'story-instagram': 100,
      'reel-instagram': 200,
      'carousel-instagram': 300,
      'my-blog': textContent.length,
      'my-website': textContent.length,
      'dialogue': textContent.length,
      'litteraire': textContent.length,
      'arguments': 150,
      'explicatifs': textContent.length
    };
    
    const targetLength = Math.floor((baseLengths[format] || textContent.length) * lengthMultiplier);
    const truncatedContent = textContent.substring(0, targetLength);
    
    const adaptations = {
      'post-facebook': `🚀 ${truncatedContent}${truncatedContent.length < textContent.length ? '...' : ''}\n\n#Tendance #Innovation`,
      'post-instagram': `✨ ${truncatedContent}${truncatedContent.length < textContent.length ? '...' : ''}\n\n#Style #Inspiration #MustSee`,
      'post-twitter': `🔥 ${truncatedContent}${truncatedContent.length < textContent.length ? '...' : ''} #Thread`,
      'post-linkedin': `💼 ${truncatedContent}${truncatedContent.length < textContent.length ? '...' : ''}\n\n#Professionnel #Réseau`,
      'video-youtube': `📹 ${projData?.projectTitle || 'Titre'} | Description\n\n${truncatedContent}\n\n⭐ TIMESTAMPS :\n00:00 Introduction`,
      'video-tiktok': `🎵 ${truncatedContent} #TikTok #Viral`,
      newsletter: `Objet: ${projData?.projectTitle || 'Newsletter'}\n\n${truncatedContent}`,
      story: `📱 ${truncatedContent}`,
      reel: `🎬 ${truncatedContent}`,
      carousel: `📸 ${truncatedContent}`,
      'my-blog': `# ${projData?.projectTitle || 'Article'}\n\n${truncatedContent}`,
      'my-website': truncatedContent,
      dialogue: truncatedContent,
      litteraire: truncatedContent,
      arguments: `💡 ${truncatedContent}`,
      explicatifs: `ℹ️ ${truncatedContent}`
    };
    
    return adaptations[format] || truncatedContent;
  }

  const handleRecordingToggle = () => {
    setIsRecording(!isRecording);
  }

  const handleDictationToggle = () => {
    setIsDictating(!isDictating);
  }

  return (
    <div className="App">
      <MenuBar onHelp={() => setShowHelpModal(true)} />
      <div className="main-container">
        <ProjectInfoSimple data={projectData} onDataChange={setProjectData} />
        <AISelection selectedAI={selectedAI} onAISelect={setSelectedAI} />
        <UploadArea 
          content={content} 
          onContentChange={setContent}
          onFilesChange={setAttachedFiles}
          onAIConfigChange={setMediaAIConfig}
          onRecordingToggle={handleRecordingToggle}
          onDictationToggle={handleDictationToggle}
        />
        <ProcessingTasks selectedTasks={selectedTasks} onTaskToggle={handleTaskToggle} />
        <OutputFormats selectedFormats={selectedFormats} onFormatToggle={handleFormatToggle} />

        <AdvancedPersonalization 
          data={advancedOptions}
          onChange={setAdvancedOptions}
        />

        <div className="generate-section">
          <button className={`generate-btn ${isLoading ? 'loading' : ''}`} onClick={handleGenerate} disabled={isLoading || !selectedAI || !content.trim()}>
            {isLoading ? (<><div className="loader"></div>{t('sections.generateButton.inProgress')}</>) : (<><i className="fas fa-rocket"></i> {t('sections.generateButton.launch')}</>)}
          </button>
        </div>

        <ResultsGrid results={results} onDelete={handleDeleteResult} />
      </div>

      {showHelpModal && (
        <HelpModal onClose={() => setShowHelpModal(false)} />
      )}
    </div>
  )
}
