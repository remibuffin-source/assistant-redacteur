import { useState, useEffect, useRef } from 'react';
import { useTheme } from '../hooks/useTheme'
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
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
import ImageOptions from './ImageOptions'
import ImagePersonalization from './ImagePersonalization'
import VideoOptions from './VideoOptions'
import HelpModal from './HelpModal'
import {
  saveAttachedFiles as saveAttachedFilesToDb,
  loadAttachedFiles as loadAttachedFilesFromDb,
  clearAttachedFiles as clearAttachedFilesFromDb,
  normalizeAttachedFiles
} from '../utils/referenceImageStore'

// Pop-up ciblé selon la cause de l'erreur fournisseur (anti-spam : plusieurs
// formats sont générés en parallèle et partagent la même erreur)
let lastProviderAlert = { key: '', at: 0 };
function showProviderAlert(code, message) {
  const key = `${code}:${String(message).slice(0, 80)}`;
  const now = Date.now();
  if (lastProviderAlert.key === key && now - lastProviderAlert.at < 5000) return;
  lastProviderAlert = { key, at: now };

  if (code === 'model') {
    alert(`🤖 Modèle IA obsolète ou indisponible\n\n${message}`);
  } else if (code === 'credits' || code === 'payment') {
    alert(`💳 Crédits épuisés chez le fournisseur\n\n${message}`);
  } else if (code === 'auth') {
    alert(`🔑 Problème de clé API\n\n${message}`);
  } else if (code === 'rate_limit') {
    alert(`⏳ Limite de requêtes atteinte\n\n${message}`);
  }
}

export default function HomeFixed() {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const navigate = useNavigate();
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
  
  // Rediriger vers login si non authentifié (attendre la fin du chargement)
  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, isAuthLoading, navigate]);
  
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
  const [imageOptions, setImageOptions] = useState({
    count: 1,
    size: 'auto_2K',
    ratio: '1:1',
    enhancePromptMode: 'standard',
    seed: null
  })
  const [imagePersonalization, setImagePersonalization] = useState({
    style: '',
    mood: '',
    lighting: '',
    quality: 'standard',
    modifiers: [],
    negativePrompt: ''
  })
  const [videoOptions, setVideoOptions] = useState({
    provider: 'wan',
    wanModel: 'text-to-video',
    veoModel: 'veo3_fast',
    veoGenerationType: 'TEXT_2_VIDEO',
    duration: 5,
    ratio: '16:9',
    resolution: '720p',
    multiShots: true,
    enableAudio: true,
    seed: null,
    watermark: '',
    enableTranslation: true
  })
  const [pollingTasks, setPollingTasks] = useState(new Map())
  
  // Types de contenu sélectionnés (pour filtrer les IA)
  const [contentTypes, setContentTypes] = useState({
    text: true,
    image: false,
    video: false
  })

  // Exposer tous les états pour la sauvegarde
  useEffect(() => {
    window.assistantRedacteurState = {
      projectData,
      selectedAI,
      content,
      attachedFiles,
      selectedTasks,
      selectedFormats,
      advancedOptions,
      imageOptions,
      results
    };
    
    // Sauvegarde automatique temporaire.
    // Les pièces jointes sont persistées séparément dans IndexedDB
    // (referenceImageStore) : localStorage est trop limité pour les images base64.
    const tempData = {
      projectData,
      selectedAI,
      content,
      attachedFiles: [],
      selectedTasks,
      selectedFormats,
      advancedOptions,
      imageOptions,
      imagePersonalization,
      contentTypes,
      results,
      savedAt: new Date().toISOString()
    };
    try {
      localStorage.setItem('assistantRedacteur_temp_home', JSON.stringify(tempData));
    } catch (e) {
      if (e.name === 'QuotaExceededError') {
        console.warn('Sauvegarde locale impossible (quota dépassé)');
      }
    }
  }, [projectData, selectedAI, content, attachedFiles, selectedTasks, selectedFormats, advancedOptions, imageOptions, imagePersonalization, contentTypes, results]);

  // Persister les images de référence / pièces jointes dans IndexedDB
  const filesRestoredRef = useRef(false);
  useEffect(() => {
    const timer = setTimeout(() => {
      // Ne rien écraser avant que la restauration initiale soit terminée
      if (!filesRestoredRef.current) return;
      if (attachedFiles.length > 0) {
        saveAttachedFilesToDb(attachedFiles);
      } else {
        clearAttachedFilesFromDb();
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [attachedFiles]);

  // Restaurer les images de référence au chargement (même après fermeture du navigateur)
  useEffect(() => {
    let cancelled = false;
    loadAttachedFilesFromDb().then(files => {
      filesRestoredRef.current = true;
      if (!cancelled && files.length > 0) {
        setAttachedFiles(prev => (prev.length > 0 ? prev : files));
        console.log(`✅ ${files.length} pièce(s) jointe(s) restaurée(s) depuis IndexedDB`);
      }
    });
    return () => { cancelled = true; };
  }, []);

  // Charger les vidéos sauvegardées au démarrage
  useEffect(() => {
    const loadSavedVideos = async () => {
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://api.assistant-redacteur.fr';
      const token = localStorage.getItem('token');
      
      if (!token) return;
      
      try {
        const response = await fetch(`${API_BASE_URL}/videos`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.videos && data.videos.length > 0) {
            // Ajouter les vidéos aux résultats
            const videoResults = data.videos.map(video => {
              // Détecter le provider : si taskId existe, c'est Veo, sinon WAN
              const isVeo = !!video.taskId;
              const provider = isVeo ? 'veo' : 'wan';
              const aiProvider = isVeo ? 'veo-3.1' : 'wan-2.6';
              
              return {
                id: video.id,
                task: 'video-generation',
                format: 'video',
                title: video.content || `Vidéo ${aiProvider}`,
                content: video.content,
                taskId: video.taskId,
                status: 'success',
                creditsUsed: video.creditsUsed,
                aiProvider: aiProvider,
                provider: provider,
                isVideo: true,
                progress: 'Vidéo prête !',
                videoUrl: video.videoUrl,
                videoPath: video.videoPath,
                videoId: video.videoId,
                createdAt: video.createdAt
              };
            });
            
            setResults(prev => [...videoResults, ...prev]);
            console.log(`✅ ${videoResults.length} vidéo(s) chargée(s) depuis la base de données`);
          }
        }
      } catch (error) {
        console.error('Erreur chargement vidéos:', error);
      }
    };
    
    loadSavedVideos();
  }, []); // Exécuter une seule fois au démarrage

  // Fonction pour démarrer le polling d'une tâche vidéo (WAN ou Veo)
  const startPolling = (taskId, resultId, provider = 'wan') => {
    const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://api.assistant-redacteur.fr';
    const token = localStorage.getItem('token');
    
    // Endpoint selon le provider
    const endpoint = provider === 'veo' ? `/veo/task/${taskId}` : `/wan/task/${taskId}`;
    
    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        const data = await response.json();
        
        if (data.success) {
          const taskStatus = data.task;
          
          // Mettre à jour le résultat avec le statut
          setResults(prev => prev.map(r => {
            if (r.id === resultId) {
              return {
                ...r,
                status: taskStatus.state,
                progress: taskStatus.state === 'queuing' ? 'En file d\'attente...' :
                         taskStatus.state === 'processing' ? 'Génération en cours...' :
                         taskStatus.state === 'success' ? 'Terminé !' :
                         taskStatus.state === 'failed' ? 'Échec' : taskStatus.state
              };
            }
            return r;
          }));
          
          // Si la tâche est terminée (succès ou échec), arrêter le polling
          if (taskStatus.state === 'success' || taskStatus.state === 'failed') {
            clearInterval(pollInterval);
            setPollingTasks(prev => {
              const newMap = new Map(prev);
              newMap.delete(taskId);
              return newMap;
            });
            
            if (taskStatus.state === 'success' && data.video) {
              // Construire l'URL complète de la vidéo
              const fullVideoUrl = data.video.url.startsWith('http') 
                ? data.video.url 
                : `${API_BASE_URL}${data.video.url}`;
              
              // Mettre à jour avec la vidéo finale
              setResults(prev => prev.map(r => {
                if (r.id === resultId) {
                  return {
                    ...r,
                    status: 'success',
                    progress: 'Vidéo prête !',
                    videoUrl: fullVideoUrl,
                    videoPath: data.video.filePath,
                    videoId: data.video.id
                  };
                }
                return r;
              }));
              
              console.log('✅ Vidéo WAN prête:', fullVideoUrl);
            } else if (taskStatus.state === 'failed') {
              alert(`❌ Échec de la génération vidéo: ${taskStatus.failReason || 'Erreur inconnue'}`);
            }
          }
        }
      } catch (error) {
        console.error('Erreur polling WAN:', error);
      }
    }, 10000); // Vérifier toutes les 10 secondes
    
    // Stocker l'intervalle pour pouvoir l'arrêter plus tard
    setPollingTasks(prev => new Map(prev).set(taskId, pollInterval));
  };

  // Nettoyer les intervalles de polling au démontage du composant
  useEffect(() => {
    return () => {
      pollingTasks.forEach(interval => clearInterval(interval));
    };
  }, [pollingTasks]);

  // Charger les vidéos WAN au démarrage
  useEffect(() => {
    const loadWanVideos = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://api.assistant-redacteur.fr';
        const response = await fetch(`${API_BASE_URL}/videos`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.videos && data.videos.length > 0) {
            // Ajouter les vidéos aux résultats
            setResults(prev => {
              // Éviter les doublons
              const existingIds = new Set(prev.map(r => r.videoId));
              const newVideos = data.videos.filter(v => !existingIds.has(v.videoId));
              return [...newVideos, ...prev];
            });
            console.log(`✅ ${data.videos.length} vidéos WAN chargées`);
          }
        }
      } catch (error) {
        console.error('Erreur chargement vidéos WAN:', error);
      }
    };

    loadWanVideos();
  }, []);

  // Restaurer les données temporaires au chargement
  useEffect(() => {
    const tempData = localStorage.getItem('assistantRedacteur_temp_home');
    if (tempData) {
      try {
        const parsed = JSON.parse(tempData);
        // Ne restaurer que si les données sont récentes (moins de 48h)
        const savedAt = new Date(parsed.savedAt);
        const now = new Date();
        const hoursDiff = (now - savedAt) / (1000 * 60 * 60);
        
        if (hoursDiff < 48) {
          if (parsed.projectData) setProjectData(parsed.projectData);
          if (parsed.selectedAI) setSelectedAI(parsed.selectedAI);
          if (parsed.content) setContent(parsed.content);
          if (parsed.attachedFiles && parsed.attachedFiles.length > 0) {
            // Restaurer les fichiers attachés (déjà en format sérialisé avec base64)
            setAttachedFiles(parsed.attachedFiles);
          }
          if (parsed.selectedTasks) setSelectedTasks(parsed.selectedTasks);
          if (parsed.selectedFormats) setSelectedFormats(parsed.selectedFormats);
          if (parsed.advancedOptions) setAdvancedOptions(parsed.advancedOptions);
          if (parsed.imageOptions) setImageOptions(parsed.imageOptions);
          if (parsed.imagePersonalization) setImagePersonalization(parsed.imagePersonalization);
          if (parsed.contentTypes) setContentTypes(parsed.contentTypes);
          if (parsed.results) setResults(parsed.results);
          console.log('✅ Données temporaires restaurées depuis la dernière session (Home)');
        }
      } catch (e) {
        console.warn('Impossible de restaurer les données temporaires:', e);
      }
    }
  }, []);

  // Fonction pour charger un état complet
  const loadState = (state) => {
    if (state.projectData) setProjectData(state.projectData);
    if (state.selectedAI) setSelectedAI(state.selectedAI);
    if (state.content) setContent(state.content);
    if (state.attachedFiles) setAttachedFiles(normalizeAttachedFiles(state.attachedFiles));
    if (state.selectedTasks) setSelectedTasks(state.selectedTasks);
    if (state.selectedFormats) setSelectedFormats(state.selectedFormats);
    if (state.advancedOptions) setAdvancedOptions(state.advancedOptions);
    if (state.imageOptions) setImageOptions(state.imageOptions);
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
    // CAS SPÉCIAL : Génération vidéo (WAN 2.6 ou Veo 3.1)
    if (selectedAI === 'wan-2.6' || selectedAI === 'veo-3.1') {
      if (!content.trim()) {
        alert('Veuillez saisir une description pour générer la vidéo.');
        return;
      }
      
      setIsLoading(true);
      
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          alert('Vous devez être connecté pour générer des vidéos.');
          setIsLoading(false);
          return;
        }
        
        // Déterminer le provider et le modèle
        const provider = videoOptions.provider || 'wan';
        const isVeo = provider === 'veo';
        const wanModel = videoOptions.wanModel || 'text-to-video';
        const veoModel = videoOptions.veoModel || 'veo3_fast';
        const veoGenerationType = videoOptions.veoGenerationType || 'TEXT_2_VIDEO';
        
        // Préparer les fichiers de référence
        const referenceImages = attachedFiles.filter(file => 
          file.type?.startsWith('image/') || /\.(jpg|jpeg|png|gif|webp)$/i.test(file.name)
        );
        
        const referenceVideos = attachedFiles.filter(file => 
          file.type?.startsWith('video/') || /\.(mp4|mov|webm|avi|mkv)$/i.test(file.name)
        );
        
        // WAN 2.6 ne supporte pas les fichiers audio de référence
        const referenceAudios = attachedFiles.filter(file => 
          file.type?.startsWith('audio/') || /\.(mp3|wav|aac|flac|ogg|m4a)$/i.test(file.name)
        );
        
        // Avertir si des fichiers audio sont attachés (WAN uniquement)
        if (!isVeo && referenceAudios.length > 0) {
          alert('⚠️ WAN 2.6 ne supporte pas les fichiers audio de référence. Seules les images et vidéos sont acceptées.');
          setIsLoading(false);
          return;
        }
        
        // Veo ne supporte pas les vidéos de référence
        if (isVeo && referenceVideos.length > 0) {
          alert('⚠️ Veo 3.1 ne supporte que les images de référence (pas de vidéos).');
          setIsLoading(false);
          return;
        }
        
        // Déterminer l'endpoint selon le provider
        let endpoint;
        let requestBody;
        let requestHeaders = {
          'Authorization': `Bearer ${token}`
        };
        
        console.log('🔍 DEBUG VIDEO - provider:', provider);
        console.log('🔍 DEBUG VIDEO - content:', content);
        console.log('🔍 DEBUG VIDEO - attachedFiles:', attachedFiles);
        console.log('🔍 DEBUG VIDEO - videoOptions:', videoOptions);
        
        // ========== LOGIQUE VEO 3.1 ==========
        if (isVeo) {
          // Veo supporte text-to-video et image-to-video
          const needsImages = veoGenerationType !== 'TEXT_2_VIDEO';
          
          if (needsImages && referenceImages.length === 0) {
            alert(`Pour ${veoGenerationType}, veuillez attacher au moins une image.`);
            setIsLoading(false);
            return;
          }
          
          // Validation REFERENCE_2_VIDEO
          if (veoGenerationType === 'REFERENCE_2_VIDEO') {
            if (veoModel !== 'veo3_fast') {
              alert('⚠️ REFERENCE_2_VIDEO nécessite le modèle veo3_fast');
              setIsLoading(false);
              return;
            }
            if (videoOptions.ratio !== '16:9') {
              alert('⚠️ REFERENCE_2_VIDEO nécessite le ratio 16:9');
              setIsLoading(false);
              return;
            }
          }
          
          // Endpoint selon le type
          if (needsImages) {
            endpoint = '/veo/image-to-video';
            
            // FormData pour les images
            const formData = new FormData();
            formData.append('prompt', content);
            formData.append('model', veoModel);
            formData.append('aspectRatio', videoOptions.ratio || '16:9');
            formData.append('generationType', veoGenerationType);
            formData.append('enableTranslation', videoOptions.enableTranslation !== false);
            
            if (videoOptions.seed) {
              formData.append('seeds', videoOptions.seed);
            }
            if (videoOptions.watermark) {
              formData.append('watermark', videoOptions.watermark);
            }
            
            // Ajouter les images (max 2 pour FIRST_AND_LAST_FRAMES, max 3 pour REFERENCE)
            const maxImages = veoGenerationType === 'REFERENCE_2_VIDEO' ? 3 : 2;
            for (let i = 0; i < Math.min(referenceImages.length, maxImages); i++) {
              const imageFile = referenceImages[i];
              if (imageFile.file) {
                formData.append('images', imageFile.file);
              } else if (imageFile.base64 || imageFile.dataUrl) {
                const base64Data = (imageFile.base64 || imageFile.dataUrl).split(',')[1];
                const blob = await fetch(`data:${imageFile.type};base64,${base64Data}`).then(r => r.blob());
                formData.append('images', blob, imageFile.name || `image${i}.jpg`);
              }
            }
            
            requestBody = formData;
          } else {
            // Text-to-video : JSON
            endpoint = '/veo/text-to-video';
            requestBody = JSON.stringify({
              prompt: content,
              model: veoModel,
              aspectRatio: videoOptions.ratio || '16:9',
              seeds: videoOptions.seed || null,
              watermark: videoOptions.watermark || null,
              enableTranslation: videoOptions.enableTranslation !== false
            });
            requestHeaders['Content-Type'] = 'application/json';
          }
        }
        // ========== LOGIQUE WAN 2.6 ==========
        else {
          // Paramètres communs WAN
          const commonParams = {
            prompt: content,
            duration: videoOptions.duration || 5,
            aspectRatio: videoOptions.ratio || '16:9',
            resolution: videoOptions.resolution || '720p',
            multiShots: videoOptions.multiShots !== false,
            enableAudio: videoOptions.enableAudio !== false
          };
          
          if (videoOptions.seed) {
            commonParams.seed = videoOptions.seed;
          }
          
          // Gérer les fichiers selon le modèle WAN
          if (wanModel === 'image-to-video') {
            if (referenceImages.length === 0) {
              alert('Pour Image-to-Video, veuillez attacher une image.');
              setIsLoading(false);
              return;
            }
            endpoint = '/wan/image-to-video';
            
            const formData = new FormData();
            Object.keys(commonParams).forEach(key => {
              formData.append(key, commonParams[key]);
            });
            
            const imageFile = referenceImages[0];
            if (imageFile.file) {
              formData.append('image', imageFile.file);
            } else if (imageFile.base64 || imageFile.dataUrl) {
              const base64Data = (imageFile.base64 || imageFile.dataUrl).split(',')[1];
              const blob = await fetch(`data:${imageFile.type};base64,${base64Data}`).then(r => r.blob());
              formData.append('image', blob, imageFile.name || 'image.jpg');
            }
            
            requestBody = formData;
            
          } else if (wanModel === 'video-to-video') {
            if (referenceVideos.length === 0) {
              alert('Pour Video-to-Video, veuillez attacher une vidéo.');
              setIsLoading(false);
              return;
            }
            endpoint = '/wan/video-to-video';
            
            const formData = new FormData();
            Object.keys(commonParams).forEach(key => {
              formData.append(key, commonParams[key]);
            });
            
            const videoFile = referenceVideos[0];
            if (videoFile.file) {
              formData.append('video', videoFile.file);
            } else if (videoFile.base64 || videoFile.dataUrl) {
              const base64Data = (videoFile.base64 || videoFile.dataUrl).split(',')[1];
              const blob = await fetch(`data:${videoFile.type};base64,${base64Data}`).then(r => r.blob());
              formData.append('video', blob, videoFile.name || 'video.mp4');
            }
            
            if (referenceAudios.length > 0) {
              const audioFile = referenceAudios[0];
              if (audioFile.file) {
                formData.append('audio', audioFile.file);
              } else if (audioFile.base64 || audioFile.dataUrl) {
                const base64Data = (audioFile.base64 || audioFile.dataUrl).split(',')[1];
                const blob = await fetch(`data:${audioFile.type};base64,${base64Data}`).then(r => r.blob());
                formData.append('audio', blob, audioFile.name || 'audio.mp3');
              }
            }
            
            requestBody = formData;
            
          } else {
            // text-to-video WAN
            endpoint = '/wan/text-to-video';
            requestBody = JSON.stringify(commonParams);
            requestHeaders['Content-Type'] = 'application/json';
          }
        }
        
        const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://api.assistant-redacteur.fr';
        
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
          method: 'POST',
          headers: requestHeaders,
          body: requestBody
        });
        
        const result = await response.json();
        
        if (result.success) {
          const videoResultId = Date.now();
          const providerName = isVeo ? 'Veo 3.1' : 'WAN 2.6';
          const modelName = isVeo ? veoModel : wanModel;
          
          const videoResult = {
            id: videoResultId,
            task: 'video-generation',
            format: 'video',
            title: `Vidéo ${providerName} - ${modelName}`,
            content: content,
            taskId: result.taskId,
            status: 'processing',
            creditsUsed: result.creditsUsed,
            aiProvider: isVeo ? 'veo-3.1' : 'wan-2.6',
            provider: provider,
            isVideo: true,
            progress: 'En cours de génération...'
          };
          setResults(prev => [...prev, videoResult]);
          
          // Démarrer le polling pour cette tâche
          startPolling(result.taskId, videoResultId, provider);
          
          alert(`✅ Génération ${providerName} lancée !\nTask ID: ${result.taskId}\nCrédits utilisés: ${result.creditsUsed}\n\nLa vidéo sera disponible dans quelques minutes.`);
        } else {
          alert(result.error || 'Erreur lors de la génération de la vidéo');
        }
      } catch (error) {
        console.error('Erreur génération vidéo:', error);
        alert(`Erreur: ${error.message}`);
      } finally {
        setIsLoading(false);
      }
      return;
    }

    // Détecter si c'est une IA d'image
    const isImageAI = ['seedream-text-to-image', 'seedream-edit', 'nano-banana'].includes(selectedAI);
    
    if (!content.trim() && attachedFiles.length === 0) {
      alert(isImageAI ? 'Veuillez saisir une description pour générer l\'image.' : 'Veuillez saisir du contenu ou attacher un fichier avant de lancer la génération.');
      return;
    }
    
    if (!selectedAI) {
      alert('Veuillez sélectionner une IA avant de lancer la génération.');
      return;
    }

    // Pour les IA d'image, pas besoin de formats ni de tâches
    if (!isImageAI && selectedFormats.length === 0) {
      alert('Veuillez sélectionner au moins un format de sortie.');
      return;
    }
    
    setIsLoading(true)
    
    try {
      // CAS SPÉCIAL : Génération d'images
      if (isImageAI) {
        const { AIService } = await import('../services/aiService');
        
        // Enrichir le prompt avec les options de personnalisation
        let enrichedPrompt = content;
        const mods = [];
        if (imagePersonalization.style) mods.push(`${imagePersonalization.style} style`);
        if (imagePersonalization.mood) mods.push(`${imagePersonalization.mood} mood`);
        if (imagePersonalization.lighting) mods.push(`${imagePersonalization.lighting} lighting`);
        if (imagePersonalization.quality && imagePersonalization.quality !== 'standard') mods.push(`${imagePersonalization.quality} quality`);
        if (imagePersonalization.modifiers && imagePersonalization.modifiers.length > 0) {
          mods.push(...imagePersonalization.modifiers);
        }
        if (mods.length > 0) {
          enrichedPrompt = `${content}, ${mods.join(', ')}`;
        }
        
        // Extraire les images de référence des pièces jointes
        const referenceImages = attachedFiles
          .filter(file => file.type?.startsWith('image/') || /\.(jpg|jpeg|png|gif|webp)$/i.test(file.name))
          .map(file => file.base64 || file.dataUrl || file.url)
          .filter(Boolean);
        
        const result = await AIService.generateImage(selectedAI, {
          content: enrichedPrompt,
          imageOptions: imageOptions,
          negativePrompt: imagePersonalization.negativePrompt || '',
          referenceImages: referenceImages,
          strength: imagePersonalization.strength || 0.7
        });
        
        if (result.success) {
          const imageResults = (result.imageUrls || [result.imageUrl]).map((url, index) => ({
            id: Date.now() + index,
            task: 'image-generation',
            format: 'image',
            title: `Image générée ${index + 1}`,
            imageUrl: url,
            content: content,
            seed: result.seed || null,
            creditsDeducted: result.creditsDeducted,
            aiProvider: selectedAI // Stocker l'IA utilisée pour afficher le logo
          }));
          setResults(prev => [...prev, ...imageResults]);
        } else {
          if (result.code) {
            showProviderAlert(result.code, result.error);
          } else {
            alert(result.error || 'Erreur lors de la génération de l\'image');
          }
        }
        setIsLoading(false);
        return;
      }
      
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
            
            // CAS SPÉCIAL : Si task='none', passer un tableau vide pour les tâches
            // L'IA sera quand même appelée avec le format, les options avancées et les infos projet
            const tasksToApply = task === 'none' ? [] : [task];
            
            const generatedContent = await generateContentForFormat(
              format, 
              contentToProcess, 
              aiToUse, 
              tasksToApply, // Tableau vide si 'none', sinon la tâche sélectionnée
              advancedOptions,
              projectData
            );
            
            // Si c'est une génération d'images multiples
            if (typeof generatedContent === 'object' && generatedContent.imageUrls && generatedContent.imageUrls.length > 0) {
              return generatedContent.imageUrls.map((url, index) => ({
                id: Date.now() + delayCounter + index,
                task: task,
                format: format,
                title: `Image générée ${index + 1}`,
                imageUrl: url,
                content: ''
              }));
            }
            
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
            
            // Si c'est une image unique
            if (typeof generatedContent === 'object' && generatedContent.imageUrl) {
              result.imageUrl = generatedContent.imageUrl;
            }
            
            return result;
          })
        );
        
        // Aplatir les résultats (certains peuvent être des tableaux d'images)
        newResults.push(...taskResults.flat());
      }
      
      setResults(prev => [...prev, ...newResults]);
    } catch (error) {
      console.error('Erreur lors de la génération:', error);
      if (error.code) {
        showProviderAlert(error.code, error.message);
      } else {
        alert(`Erreur lors de la génération: ${error.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  }

  const getTaskTitle = (task) => {
    const titles = {
      none: 'Aucun traitement',
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
      'none': 'Aucun format',
      
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
      // CAS SPÉCIAL : Si format='none', passer null pour ne pas appliquer de format
      // L'IA sera quand même appelée avec les tâches, les options avancées et les infos projet
      const formatToApply = format === 'none' ? null : format;
      
      // Préparer les données pour l'IA
      const aiData = {
        content: baseContent,
        projectData: projData,
        tasks: tasks,
        advancedOptions: advOptions,
        imageOptions: imageOptions, // Ajout des options d'image
        format: formatToApply
      };

      // Appeler le service IA avec compilation complète des paramètres
      const result = await AIService.generateContent(ai, aiData);
      
      if (result.success) {
        // Si c'est un document DeepL (avec documentUrl), retourner l'objet complet
        if (result.documentUrl && result.fileName) {
          return result; // Retourne {content, documentUrl, fileName, model}
        }
        // Si c'est une génération d'image (avec imageUrl ou imageUrls)
        if (result.imageUrl || result.imageUrls) {
          return result; // Retourne {imageUrl, imageUrls, creditsDeducted}
        }
        // Sinon, retourner juste le contenu (texte)
        return result.content;
      } else {
        // Pop-up explicite : modèle obsolète, crédits fournisseur, clé API...
        showProviderAlert(result.code, result.error);
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

  // Fonction de réinitialisation complète
  const handleReset = () => {
    setProjectData({
      projectTitle: '',
      targetAudience: '',
      tone: '',
      projectDescription: ''
    });
    setSelectedAI('gpt4');
    setContent('');
    setAttachedFiles([]);
    clearAttachedFilesFromDb();
    setMediaAIConfig(null);
    setSelectedTasks(['rewrite']);
    setSelectedFormats([]);
    setResults([]);
    setAdvancedOptions({
      style: 'professionnel',
      length: 3,
      creativity: 3,
      adaptation: 'web'
    });
    setImageOptions({
      count: 1,
      size: 'auto_2K',
      ratio: '1:1',
      enhancePromptMode: 'standard',
      seed: null
    });
    setImagePersonalization({
      style: '',
      mood: '',
      lighting: '',
      quality: 'standard',
      modifiers: [],
      negativePrompt: ''
    });
    setContentTypes({
      text: true,
      image: false,
      video: false
    });
    console.log('✅ Réinitialisation complète effectuée');
  }

  // Gérer le changement de type de contenu avec réinitialisation de l'IA
  const handleContentTypeChange = (newContentTypes) => {
    setContentTypes(newContentTypes);
    
    // Si on passe en mode texte uniquement, réinitialiser l'IA si c'était une IA d'image
    if (newContentTypes.text && !newContentTypes.image && !newContentTypes.video) {
      if (['seedream-text-to-image', 'seedream-edit', 'nano-banana'].includes(selectedAI)) {
        setSelectedAI('gpt4');
        console.log('🔄 Passage en mode texte : IA réinitialisée à GPT-4');
      }
    }
    
    // Si on passe en mode image uniquement, réinitialiser l'IA si c'était une IA de texte
    if (!newContentTypes.text && newContentTypes.image && !newContentTypes.video) {
      if (!['seedream-text-to-image', 'seedream-edit', 'nano-banana'].includes(selectedAI)) {
        setSelectedAI('seedream-text-to-image');
        console.log('🔄 Passage en mode image : IA réinitialisée à Seedream');
      }
    }
  }

  return (
    <div className="App">
      <MenuBar onHelp={() => setShowHelpModal(true)} />
      <div className="main-container">
        <ProjectInfoSimple data={projectData} onDataChange={setProjectData} onContentTypeChange={handleContentTypeChange} onReset={handleReset} />
        <AISelection selectedAI={selectedAI} onAISelect={setSelectedAI} contentTypes={contentTypes} />

        <UploadArea 
          content={content} 
          onContentChange={setContent}
          attachedFiles={attachedFiles}
          onFilesChange={setAttachedFiles}
          onAIConfigChange={setMediaAIConfig}
          onRecordingToggle={handleRecordingToggle}
          onDictationToggle={handleDictationToggle}
          isImageMode={['seedream-text-to-image', 'seedream-edit', 'nano-banana', 'wan-2.6', 'veo-3.1'].includes(selectedAI)}
          selectedAI={selectedAI}
          imageStrength={imagePersonalization.strength || 0.7}
          onStrengthChange={(value) => setImagePersonalization(prev => ({ ...prev, strength: value }))}
          onFileRoleChange={(fileId, roles, strength) => {
            setAttachedFiles(prev => prev.map(f => f.id === fileId ? { ...f, roles, ...(strength !== undefined && { strength }) } : f));
          }}
        />
        
        {/* Masquer les tâches de traitement pour les IA d'image et vidéo */}
        {!['seedream-text-to-image', 'seedream-edit', 'nano-banana', 'wan-2.6', 'veo-3.1'].includes(selectedAI) && (
          <ProcessingTasks selectedTasks={selectedTasks} onTaskToggle={handleTaskToggle} />
        )}
        
        {/* Masquer les formats de sortie pour les IA d'image et vidéo */}
        {!['seedream-text-to-image', 'seedream-edit', 'nano-banana', 'wan-2.6', 'veo-3.1'].includes(selectedAI) && (
          <OutputFormats selectedFormats={selectedFormats} onFormatToggle={handleFormatToggle} />
        )}

        {/* Options vidéo pour WAN 2.6 et Veo 3.1 - MASQUÉ TEMPORAIREMENT */}
        {/* {(selectedAI === 'wan-2.6' || selectedAI === 'veo-3.1') && (
          <VideoOptions 
            videoOptions={videoOptions}
            setVideoOptions={setVideoOptions}
            contentTypes={contentTypes}
          />
        )} */}

        {/* Personnalisation avancée : différente selon le type d'IA */}
        {['seedream-text-to-image', 'seedream-edit', 'nano-banana'].includes(selectedAI) ? (
          <ImagePersonalization 
            options={imagePersonalization}
            onOptionsChange={setImagePersonalization}
            imageOptions={imageOptions}
            onImageOptionsChange={setImageOptions}
            selectedAI={selectedAI}
            attachedFiles={attachedFiles}
            isVideoMode={false}
          />
        ) : !['wan-2.6', 'veo-3.1'].includes(selectedAI) && (
          <AdvancedPersonalization 
            data={advancedOptions}
            onChange={setAdvancedOptions}
          />
        )}

        <div className="generate-section">
          <button className={`generate-btn ${isLoading ? 'loading' : ''}`} onClick={handleGenerate} disabled={isLoading || !selectedAI || !content.trim()}>
            {isLoading ? (<><div className="loader"></div>{t('sections.generateButton.inProgress')}</>) : (<><i className="fas fa-rocket"></i> {t('sections.generateButton.launch')}</>)}
          </button>
        </div>

        <ResultsGrid results={results} onDelete={handleDeleteResult} isImageMode={['seedream-text-to-image', 'seedream-edit', 'nano-banana'].includes(selectedAI)} />
      </div>

      {showHelpModal && (
        <HelpModal onClose={() => setShowHelpModal(false)} />
      )}
    </div>
  )
}
