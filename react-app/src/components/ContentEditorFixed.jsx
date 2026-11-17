  
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAssistantAutoSave } from '../hooks/useLocalStorage';
import { getEditorText } from '../i18n/editorTranslations';
import MenuBar from './MenuBar';
import StorageManager from '../utils/StorageManager';
import StorageManagerAPI from '../utils/StorageManagerAPI';
import { contentModelsApi } from '../services/storageApi';
import './ContentEditor.css';

const ContentEditorFixed = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { autoSaveData } = useAssistantAutoSave();
  
  // Récupérer la langue depuis les données utilisateur
  const userLanguage = autoSaveData.language || 'fr';
  const t = (path) => getEditorText(userLanguage, path);
  const [content, setContent] = useState('');
  const [fileName, setFileName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [recordedChunks, setRecordedChunks] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [contentType, setContentType] = useState('all');
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showLoadModal, setShowLoadModal] = useState(false);
  const [modelName, setModelName] = useState('');
  const [savedModels, setSavedModels] = useState([]);
  const [showOpenPublications, setShowOpenPublications] = useState(false);
  const [savedPublicationsList, setSavedPublicationsList] = useState([]);
  const [saveDestination, setSaveDestination] = useState('model'); // 'model' | 'publication' | 'local'
  const [selectedModels, setSelectedModels] = useState([]); // Sélection multiple modèles
  const [editingModelId, setEditingModelId] = useState(null); // Modèle en cours de renommage
  const [editingModelName, setEditingModelName] = useState(''); // Nouveau nom
  const [isLoadingModel, setIsLoadingModel] = useState(false); // État de chargement
  const [loadingModelId, setLoadingModelId] = useState(null); // ID du modèle en cours de chargement
  const [isPublishing, setIsPublishing] = useState(false); // État de publication (Diffusion)
  const [isSendingEmail, setIsSendingEmail] = useState(false); // État d'envoi email
  const [attachedFiles, setAttachedFiles] = useState([]); // Pièces jointes
  const textareaRef = useRef(null);
  const openFileRef = useRef(null);
  const [showOpenChoice, setShowOpenChoice] = useState(false);
  const [currentAlignment, setCurrentAlignment] = useState('left'); // 'left', 'center', 'right'
  const [showFontSizeMenu, setShowFontSizeMenu] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailRecipients, setEmailRecipients] = useState('');
  const [emailSubject, setEmailSubject] = useState('');

  // Fonction utilitaire: ajuste la hauteur de la zone éditable selon le contenu
  const resizeEditor = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    const h = Math.max(200, el.scrollHeight);
    el.style.height = h + 'px';
  };

  // Fonction utilitaire moderne pour insérer du HTML (remplace document.execCommand)
  const insertHTMLAtCursor = (html) => {
    const editor = textareaRef.current;
    if (!editor) return;

    // S'assurer que l'éditeur a le focus
    if (document.activeElement !== editor) {
      editor.focus();
    }

    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      
      // Vérifier que le range est bien dans l'éditeur
      if (!editor.contains(range.commonAncestorContainer)) {
        // Si le range n'est pas dans l'éditeur, créer un nouveau range à la fin
        const newRange = document.createRange();
        newRange.selectNodeContents(editor);
        newRange.collapse(false);
        selection.removeAllRanges();
        selection.addRange(newRange);
        range.setStart(newRange.startContainer, newRange.startOffset);
        range.setEnd(newRange.endContainer, newRange.endOffset);
      }
      
      range.deleteContents();
      
      // Créer un élément temporaire pour parser le HTML
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = html;
      const fragment = document.createDocumentFragment();
      
      // Déplacer tous les nœuds du tempDiv vers le fragment
      while (tempDiv.firstChild) {
        fragment.appendChild(tempDiv.firstChild);
      }
      
      range.insertNode(fragment);
      
      // Ajouter un espace après pour faciliter la suite de la saisie
      const spaceNode = document.createTextNode('\u00A0');
      range.collapse(false);
      range.insertNode(spaceNode);
      
      // Déplacer le curseur après l'espace
      range.setStartAfter(spaceNode);
      range.setEndAfter(spaceNode);
      selection.removeAllRanges();
      selection.addRange(range);
      
      // Déclencher l'événement input pour mettre à jour le contenu
      handleContentChange();
    } else {
      // Si pas de sélection, ajouter à la fin
      editor.innerHTML += html + '<br>';
      handleContentChange();
      
      // Placer le curseur à la fin
      const newRange = document.createRange();
      newRange.selectNodeContents(editor);
      newRange.collapse(false);
      selection.removeAllRanges();
      selection.addRange(newRange);
    }
  };

  // Charger le contenu passé depuis les vignettes (location.state ou sessionStorage)
  useEffect(() => {
    // Vérifier d'abord le sessionStorage (pour nouvel onglet)
    const sessionData = sessionStorage.getItem('editorData');
    let dataToLoad = null;
    
    if (sessionData) {
      dataToLoad = JSON.parse(sessionData);
      // Nettoyer après utilisation
      sessionStorage.removeItem('editorData');
    } else if (location.state && location.state.content) {
      dataToLoad = location.state;
    }
    
    if (dataToLoad && dataToLoad.content) {
      const incoming = String(dataToLoad.content || '');
      const formatted = incoming
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/\n/g, '<br>');
      setContent(formatted);
      if (dataToLoad.title) {
        setFileName(dataToLoad.title);
      }
      // Appliquer LTR après injection
      setTimeout(() => enforceLTRInNode(textareaRef.current), 0);
    }
    
    // Gérer l'insertion d'image depuis Home
    if (location.state && location.state.imageToInsert) {
      const imageData = location.state.imageToInsert;
      // Utiliser la vignette pour l'affichage dans l'éditeur, avec lien vers l'original
      const displayUrl = imageData.vignetteUrl || imageData.imageUrl;
      const imageHtml = `<div class="editor-image-container" style="text-align: center; margin: 20px 0;">
        <a href="${imageData.imageUrl}" target="_blank" title="Cliquer pour voir l'image en taille réelle">
          <img src="${displayUrl}" alt="Image générée" style="max-width: 100%; height: auto; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); cursor: pointer;" data-full-url="${imageData.imageUrl}" />
        </a>
      </div><br>`;
      setContent(prev => prev + imageHtml);
      setFileName(`Image-${new Date().toLocaleDateString('fr-FR').replace(/\//g, '-')}`);
      
      // Auto-resize : s'assurer que la zone d'édition s'adapte à l'image
      const resizeEditor = () => {
        if (textareaRef.current) {
          textareaRef.current.style.minHeight = 'auto';
          textareaRef.current.style.minHeight = Math.max(400, textareaRef.current.scrollHeight + 100) + 'px';
        }
      };
      // Resize immédiat + après chargement image
      setTimeout(resizeEditor, 100);
      setTimeout(resizeEditor, 500);
      setTimeout(resizeEditor, 1000);
    }
    
    // Vérifier aussi le localStorage pour les images en attente
    const pendingImage = localStorage.getItem('pendingEditorImage');
    if (pendingImage && !location.state?.imageToInsert) {
      try {
        const imageData = JSON.parse(pendingImage);
        const displayUrl = imageData.vignetteUrl || imageData.imageUrl;
        const imageHtml = `<div class="editor-image-container" style="text-align: center; margin: 20px 0;">
          <a href="${imageData.imageUrl}" target="_blank" title="Cliquer pour voir l'image en taille réelle">
            <img src="${displayUrl}" alt="Image générée" style="max-width: 100%; height: auto; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); cursor: pointer;" data-full-url="${imageData.imageUrl}" />
          </a>
        </div><br>`;
        setContent(prev => prev + imageHtml);
        setFileName(`Image-${new Date().toLocaleDateString('fr-FR').replace(/\//g, '-')}`);
        localStorage.removeItem('pendingEditorImage');
        
        // Auto-resize avec plusieurs délais
        const resizeEditor = () => {
          if (textareaRef.current) {
            textareaRef.current.style.minHeight = 'auto';
            textareaRef.current.style.minHeight = Math.max(400, textareaRef.current.scrollHeight + 100) + 'px';
          }
        };
        setTimeout(resizeEditor, 100);
        setTimeout(resizeEditor, 500);
        setTimeout(resizeEditor, 1000);
      } catch (e) {
        console.error('Erreur parsing pendingEditorImage:', e);
      }
    }
  }, [location.state]);

  // Sauvegarde automatique temporaire de l'éditeur (avec pièces jointes)
  useEffect(() => {
    // Sérialiser les pièces jointes (sans les objets File non sérialisables)
    const serializableFiles = attachedFiles.map(f => ({
      name: f.name,
      type: f.type,
      size: f.size,
      url: f.url || f.base64 || null
    })).filter(f => f.url); // Garder seulement ceux avec une URL
    
    const tempData = {
      content,
      fileName,
      attachedFiles: serializableFiles,
      savedAt: new Date().toISOString()
    };
    try {
      localStorage.setItem('assistantRedacteur_temp_editor', JSON.stringify(tempData));
    } catch (e) {
      // Si trop gros, sauvegarder sans les fichiers
      const lightData = { content, fileName, attachedFiles: [], savedAt: new Date().toISOString() };
      localStorage.setItem('assistantRedacteur_temp_editor', JSON.stringify(lightData));
    }
  }, [content, fileName, attachedFiles]);

  // Restaurer les données temporaires de l'éditeur au chargement
  useEffect(() => {
    // Ne pas restaurer si on a des données entrantes (location.state ou sessionStorage)
    const sessionData = sessionStorage.getItem('editorData');
    const pendingImage = localStorage.getItem('pendingEditorImage');
    
    if (!location.state?.content && !location.state?.imageToInsert && !sessionData && !pendingImage) {
      const tempData = localStorage.getItem('assistantRedacteur_temp_editor');
      if (tempData) {
        try {
          const parsed = JSON.parse(tempData);
          const savedAt = new Date(parsed.savedAt);
          const now = new Date();
          const hoursDiff = (now - savedAt) / (1000 * 60 * 60);
          
          // Ne restaurer que si les données sont récentes (moins de 48h) et non vides
          if (hoursDiff < 48 && parsed.content && parsed.content.trim()) {
            setContent(parsed.content);
            if (parsed.fileName) setFileName(parsed.fileName);
            if (parsed.attachedFiles && parsed.attachedFiles.length > 0) {
              setAttachedFiles(parsed.attachedFiles);
            }
            console.log('✅ Contenu éditeur restauré depuis la dernière session');
          }
        } catch (e) {
          console.warn('Impossible de restaurer les données éditeur:', e);
        }
      }
    }
  }, []);

  // Les styles CSS sont déjà importés via l'import en haut du fichier
  // Pas besoin de useEffect pour les charger dynamiquement

  const htmlToPlainText = (html) => {
    try {
      // 1) Décoder les entités HTML pour transformer &lt;br&gt; en <br>
      const decoder = document.createElement('textarea');
      decoder.innerHTML = String(html || '');
      const decoded = decoder.value;

      // 2) Remplacer les balises de saut de ligne par \n AVANT extraction du texte
      const normalized = decoded
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<div\s*\/?>/gi, '\n')
        .replace(/<\/div>/gi, '\n');

      // 3) Extraire le texte
      const tmp = document.createElement('div');
      tmp.innerHTML = normalized;
      const text = tmp.textContent || tmp.innerText || '';
      // Nettoyer les marqueurs bidi accidentels
      return stripBidiMarks(text).replace(/\n{3,}/g, '\n\n');
    } catch {
      return '';
    }
  };

  // Auto-authentication pour la démo (utilise la clé attendue par useAuth)
  const autoLoginAttemptedRef = useRef(false);
  useEffect(() => {
    if (!isAuthenticated && !autoLoginAttemptedRef.current) {
      const isAutoDemoEnabled = localStorage.getItem('auto_login_demo') === '1';
      if (!isAutoDemoEnabled) {
        try {
          localStorage.setItem('auto_login_demo', '1');
          autoLoginAttemptedRef.current = true;
          // Rechargement unique pour permettre à useAuth de relire la clé
          window.location.reload();
        } catch {}
      }
    }
  }, [isAuthenticated]);

  // Compteur de mots et caractères
  useEffect(() => {
    const words = content.trim() ? content.trim().split(/\s+/).length : 0;
    const chars = content.length;
    setWordCount(words);
    setCharCount(chars);
  }, [content]);

  // Auto-resize: recalculer la hauteur après mise à jour de contenu
  useEffect(() => {
    resizeEditor();
  }, [content]);

  // Synchroniser le state "content" vers le DOM de la zone éditable quand il change depuis l'extérieur
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    // Ne pas écraser la saisie: n'écrire que si le DOM est différent du state
    const currentHtml = el.innerHTML || '';
    if (currentHtml !== content) {
      el.innerHTML = content || '';
      enforceLTRInNode(el);
      // Recalculer la hauteur après injection
      resizeEditor();
    }
  }, [content]);

  // Observer pour auto-resize sur mutations (collage, execCommand, images, etc.)
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    const observer = new MutationObserver(() => resizeEditor());
    observer.observe(el, { childList: true, subtree: true, characterData: true });
    // Appel initial
    resizeEditor();
    return () => observer.disconnect();
  }, []);

  const stripBidiMarks = (s) => {
    // Supprime les marqueurs directionnels invisibles RTL/LTR
    return s.replace(/[\u200E\u200F\u202A-\u202E\u2066-\u2069]/g, '');
  };

  // Assurer le focus avant d'utiliser execCommand
  const ensureFocus = () => {
    const el = textareaRef.current;
    if (el && document.activeElement !== el) {
      el.focus();
    }
  };

  // Détecter si le caret est dans une liste (ul/ol/li)
  const isInsideList = () => {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return false;
    let node = sel.anchorNode;
    let el = node && node.nodeType === 1 ? node : node?.parentElement;
    while (el) {
      const tag = el.tagName;
      if (tag === 'LI' || tag === 'UL' || tag === 'OL') return true;
      el = el.parentElement;
    }
    return false;
  };

  const enforceLTRInNode = (root) => {
    if (!root) return;
    // Force dir=ltr sur le conteneur et ses enfants éléments
    if (root.setAttribute) {
      root.setAttribute('dir', 'ltr');
      root.style.textAlign = 'left';
      root.style.writingMode = 'horizontal-tb';
    }
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT, null);
    while (walker.nextNode()) {
      const el = walker.currentNode;
      try {
        el.setAttribute('dir', 'ltr');
        if (el.getAttribute('dir') === 'rtl') el.setAttribute('dir', 'ltr');
        if (el.style) {
          el.style.direction = 'ltr';
          el.style.textAlign = 'left';
        }
      } catch {}
    }
  };

  const handleContentChange = (e) => {
    // Ne pas réécrire innerHTML pour éviter de déplacer le curseur
    enforceLTRInNode(textareaRef.current);
    const html = textareaRef.current?.innerHTML || '';
    // On met à jour l'état avec une version nettoyée mais sans modifier le DOM
    setContent(stripBidiMarks(html));
    // Auto-resize immédiatement après frappe
    requestAnimationFrame(resizeEditor);
  };

  const handlePaste = (e) => {
    // Sanitize à l'insertion pour éviter toute inversion et styles indésirables
    try {
      e.preventDefault();
      const text = (e.clipboardData || window.clipboardData).getData('text') || '';
      const cleaned = stripBidiMarks(text)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/\n/g, '<br>');
      document.execCommand('insertHTML', false, cleaned);
      setTimeout(() => { enforceLTRInNode(textareaRef.current); resizeEditor(); }, 0);
    } catch {}
  };

  // Handlers qui assurent le focus avant les commandes de liste
  const handleToggleUnorderedList = () => {
    ensureFocus();
    document.execCommand('insertUnorderedList', false, null);
  };

  const handleToggleOrderedList = () => {
    ensureFocus();
    document.execCommand('insertOrderedList', false, null);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      const recorder = new MediaRecorder(stream);
      
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          setRecordedChunks(prev => [...prev, event.data]);
        }
      };
      
      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
    } catch (error) {
      console.error('Erreur d\'accès à la webcam:', error);
      alert('Impossible d\'accéder à la webcam. Vérifiez les permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      mediaRecorder.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
    }
  };

  const deleteRecording = () => {
    setRecordedChunks([]);
  };

  const handleImageUpload = () => {
    fileInputRef.current?.click();
  };

  const saveToVPS = async () => {
    if (!fileName.trim() || !content.trim()) return;
    
    setIsSaving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      alert(`Contenu "${fileName}" sauvegardé avec succès sur le VPS !`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileAttachment = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.onchange = (e) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        // Créer une liste de fichiers avec icônes compactes
        const filesList = Array.from(files).map((file, index) => {
          const url = URL.createObjectURL(file);
          const safeName = (file.name || 'document').replace(/</g, '&lt;').replace(/>/g, '&gt;');
          
          // Convertir la taille en MB arrondi
          const fileSizeMB = (file.size / (1024 * 1024));
          const fileSize = fileSizeMB >= 1 
            ? Math.round(fileSizeMB) + ' MB' 
            : Math.max(1, Math.round(fileSizeMB * 10) / 10) + ' MB';
          
          const icon = getFileIcon(file.name);
          const uniqueId = `file-${Date.now()}-${index}`;
          
          return `<div id="${uniqueId}" class="attached-file-compact" style="display: inline-flex; align-items: center; max-width: 300px; height: 30px; margin: 5px 5px 5px 0; padding: 5px 8px; border: 1px solid #ddd; border-radius: 5px; background: #f9f9f9; position: relative; vertical-align: middle;">
            <i class="${icon}" style="font-size: 14px; margin-right: 6px; color: #007bff; flex-shrink: 0;"></i>
            <a href="${url}" download="${safeName}" target="_blank" style="color: #007bff; text-decoration: none; font-size: 12px; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; flex: 1; margin-right: 4px;">${safeName}</a>
            <span style="color: #666; font-size: 11px; margin-right: 4px; flex-shrink: 0;">${fileSize}</span>
            <button onclick="this.parentElement.remove(); return false;" style="background: #dc3545; color: white; border: none; border-radius: 3px; width: 18px; height: 18px; font-size: 12px; line-height: 1; cursor: pointer; padding: 0; flex-shrink: 0; display: flex; align-items: center; justify-content: center;" title="Supprimer">×</button>
          </div>`;
        });
        insertHTMLAtCursor(filesList.join('') + '<br>');
        setTimeout(() => resizeEditor(), 0);
      }
    };
    input.click();
  };

  const getFileIcon = (filename) => {
    const ext = filename.split('.').pop().toLowerCase();
    const iconMap = {
      'pdf': 'fas fa-file-pdf',
      'doc': 'fas fa-file-word',
      'docx': 'fas fa-file-word',
      'xls': 'fas fa-file-excel',
      'xlsx': 'fas fa-file-excel',
      'ppt': 'fas fa-file-powerpoint',
      'pptx': 'fas fa-file-powerpoint',
      'zip': 'fas fa-file-archive',
      'rar': 'fas fa-file-archive',
      'jpg': 'fas fa-file-image',
      'jpeg': 'fas fa-file-image',
      'png': 'fas fa-file-image',
      'gif': 'fas fa-file-image',
      'txt': 'fas fa-file-alt',
      'csv': 'fas fa-file-csv'
    };
    return iconMap[ext] || 'fas fa-file';
  };

  const applyTextColor = (color) => {
    const editor = textareaRef.current;
    if (!editor) return;
    editor.focus();
    document.execCommand('styleWithCSS', false, true);
    document.execCommand('foreColor', false, color);
    handleContentChange();
  };

  const applyHighlight = (color) => {
    const editor = textareaRef.current;
    if (!editor) return;
    editor.focus();
    document.execCommand('styleWithCSS', false, true);
    document.execCommand('hiliteColor', false, color);
    handleContentChange();
  };

  const applyFontSize = (size) => {
    const editor = textareaRef.current;
    if (!editor) return;
    editor.focus();
    document.execCommand('styleWithCSS', false, true);
    document.execCommand('fontSize', false, '7'); // Valeur temporaire
    
    // Remplacer par la taille exacte en px
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const container = range.commonAncestorContainer;
      let element = container.nodeType === 3 ? container.parentElement : container;
      
      // Trouver l'élément <font> créé par execCommand
      if (element.tagName === 'FONT' || element.style.fontSize) {
        element.style.fontSize = size + 'px';
      }
    }
    handleContentChange();
  };

  const openEmojiPicker = () => {
    // Fonction pour ouvrir le sélecteur d'emoji
    console.log('Ouverture sélecteur emoji');
  };

  const handleIndent = () => {
    const editor = textareaRef.current;
    if (!editor) return;
    editor.focus();
    document.execCommand('indent', false, null);
    handleContentChange();
  };

  const handleOutdent = () => {
    const editor = textareaRef.current;
    if (!editor) return;
    editor.focus();
    document.execCommand('outdent', false, null);
    handleContentChange();
  };

  // Fonction d'alignement cyclique
  const handleCycleAlignment = () => {
    const editor = textareaRef.current;
    if (!editor) return;
    editor.focus();
    
    let nextAlignment = 'left';
    
    if (currentAlignment === 'left') {
      nextAlignment = 'center';
    } else if (currentAlignment === 'center') {
      nextAlignment = 'right';
    } else {
      nextAlignment = 'left';
    }
    
    applyTextAlignment(nextAlignment);
    setCurrentAlignment(nextAlignment);
  };

  // Fonction simple pour appliquer l'alignement avec classes CSS
  const applyTextAlignment = (align) => {
    const editor = textareaRef.current;
    if (!editor) return;
    
    // S'assurer que l'éditeur a le focus (important pour Firefox)
    if (document.activeElement !== editor) {
      editor.focus();
    }
    
    const sel = window.getSelection();
    if (!sel.rangeCount) return;
    
    const range = sel.getRangeAt(0);
    let node = range.startContainer;
    
    // Trouver le parent de type élément
    while (node && node.nodeType !== 1) {
      node = node.parentNode;
    }
    
    // Trouver le bloc parent (div, p, h1, etc.)
    while (node && node !== editor) {
      const tag = node.tagName ? node.tagName.toLowerCase() : '';
      
      if (['div', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'li'].includes(tag)) {
        // Supprimer toutes les classes d'alignement
        node.classList.remove('align-left', 'align-center', 'align-right');
        // Ajouter la nouvelle classe
        node.classList.add(`align-${align}`);
        handleContentChange();
        return;
      }
      node = node.parentNode;
    }
    
    // Si pas de bloc trouvé, entourer SEULEMENT le contenu sélectionné dans un div
    if (sel.toString().length > 0) {
      // Il y a du texte sélectionné, l'entourer dans un div
      const div = document.createElement('div');
      div.classList.add(`align-${align}`);
      
      try {
        range.surroundContents(div);
      } catch (e) {
        // Si surroundContents échoue (sélection complexe), utiliser extractContents
        const contents = range.extractContents();
        div.appendChild(contents);
        range.insertNode(div);
      }
      
      // Replacer le curseur après le div
      range.setStartAfter(div);
      range.setEndAfter(div);
      sel.removeAllRanges();
      sel.addRange(range);
    } else {
      // Pas de sélection, créer un paragraphe vide avec l'alignement
      const p = document.createElement('p');
      p.classList.add(`align-${align}`);
      p.innerHTML = '<br>'; // Paragraphe vide éditable
      
      range.insertNode(p);
      
      // Placer le curseur dans le paragraphe
      const newRange = document.createRange();
      newRange.setStart(p, 0);
      newRange.setEnd(p, 0);
      sel.removeAllRanges();
      sel.addRange(newRange);
    }
    
    handleContentChange();
  };

  const handleAlignLeft = () => {
    const editor = textareaRef.current;
    if (!editor) return;
    editor.focus();
    applyTextAlignment('left');
    setCurrentAlignment('left');
  };

  const handleAlignCenter = () => {
    const editor = textareaRef.current;
    if (!editor) return;
    editor.focus();
    applyTextAlignment('center');
    setCurrentAlignment('center');
  };

  const handleAlignRight = () => {
    const editor = textareaRef.current;
    if (!editor) return;
    editor.focus();
    applyTextAlignment('right');
    setCurrentAlignment('right');
  };

  const handleInsertImage = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const uniqueId = `image-${Date.now()}`;
          const img = `<div id="${uniqueId}" class="resizable-media resizable-image" style="position: relative; width: 400px; margin: 10px auto; resize: both; overflow: auto; display: inline-block;" contenteditable="false">
            <button onclick="this.parentElement.remove(); return false;" style="position: absolute; top: -20px; right: -20px; background: #dc3545; color: white; border: none; border-radius: 50%; width: 48px; height: 48px; font-size: 32px; font-weight: bold; cursor: pointer; z-index: 10; box-shadow: 0 2px 8px rgba(0,0,0,0.4); line-height: 1; display: flex; align-items: center; justify-content: center;" title="Supprimer">×</button>
            <img src="${e.target.result}" style="width: 100%; height: 100%; display: block; object-fit: contain;" alt="Image insérée" />
          </div>`;
          insertHTMLAtCursor(img);
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  const handleInsertVideo = () => {
    const url = prompt('Entrez l\'URL de la vidéo (YouTube, Vimeo, etc.) :');
    if (url) {
      let embedCode = '';
      const uniqueId = `video-${Date.now()}`;
      
      // YouTube
      if (url.includes('youtube.com') || url.includes('youtu.be')) {
        const videoId = url.includes('youtu.be') 
          ? url.split('/').pop().split('?')[0]
          : url.split('v=')[1]?.split('&')[0];
        
        if (videoId) {
          embedCode = `<div id="${uniqueId}" class="resizable-media resizable-video" style="position: relative; width: 100%; max-width: 100%; margin: 10px auto; resize: both; overflow: auto; display: inline-block;" contenteditable="false">
            <button onclick="this.parentElement.remove(); return false;" style="position: absolute; top: -20px; right: -20px; background: #dc3545; color: white; border: none; border-radius: 50%; width: 48px; height: 48px; font-size: 32px; font-weight: bold; cursor: pointer; z-index: 10; box-shadow: 0 2px 8px rgba(0,0,0,0.4); line-height: 1; display: flex; align-items: center; justify-content: center;" title="Supprimer">×</button>
            <div style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden;">
              <iframe src="https://www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: auto;"></iframe>
            </div>
          </div>`;
        }
      }
      // Vimeo
      else if (url.includes('vimeo.com')) {
        const videoId = url.split('/').pop();
        embedCode = `<div id="${uniqueId}" class="resizable-media resizable-video" style="position: relative; width: 100%; max-width: 100%; margin: 10px auto; resize: both; overflow: auto; display: inline-block;" contenteditable="false">
          <button onclick="this.parentElement.remove(); return false;" style="position: absolute; top: -20px; right: -20px; background: #dc3545; color: white; border: none; border-radius: 50%; width: 48px; height: 48px; font-size: 32px; font-weight: bold; cursor: pointer; z-index: 10; box-shadow: 0 2px 8px rgba(0,0,0,0.4); line-height: 1; display: flex; align-items: center; justify-content: center;" title="Supprimer">×</button>
          <div style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden;">
            <iframe src="https://player.vimeo.com/video/${videoId}" frameborder="0" allowfullscreen style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: auto;"></iframe>
          </div>
        </div>`;
      }
      // URL directe
      else {
        embedCode = `<div id="${uniqueId}" class="resizable-media resizable-video" style="position: relative; width: 100%; max-width: 100%; margin: 10px auto; resize: both; overflow: auto; display: inline-block;" contenteditable="false">
          <button onclick="this.parentElement.remove(); return false;" style="position: absolute; top: -20px; right: -20px; background: #dc3545; color: white; border: none; border-radius: 50%; width: 48px; height: 48px; font-size: 32px; font-weight: bold; cursor: pointer; z-index: 10; box-shadow: 0 2px 8px rgba(0,0,0,0.4); line-height: 1; display: flex; align-items: center; justify-content: center;" title="Supprimer">×</button>
          <video controls style="width: 100%; height: auto; display: block;"><source src="${url}" type="video/mp4">Votre navigateur ne supporte pas la vidéo.</video>
        </div>`;
      }
      
      if (embedCode) {
        insertHTMLAtCursor(embedCode);
      } else {
        alert('URL de vidéo non reconnue. Veuillez utiliser une URL YouTube, Vimeo ou un lien direct vers un fichier vidéo.');
      }
    }
  };

  const handleInsertLink = () => {
    const selection = window.getSelection();
    const selectedText = selection.toString();
    
    if (selectedText) {
      // Si du texte est sélectionné, demander l'URL
      const url = prompt('Entrez l\'URL du lien :');
      if (url) {
        // Valider l'URL
        let validUrl = url;
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
          validUrl = 'https://' + url;
        }
        
        // Créer le lien avec le texte sélectionné
        const linkHTML = `<a href="${validUrl}" target="_blank" style="color: #007bff; text-decoration: underline;">${selectedText}</a>`;
        insertHTMLAtCursor(linkHTML);
      }
    } else {
      // Si aucun texte sélectionné, demander le texte et l'URL
      const linkText = prompt('Entrez le texte du lien :');
      if (linkText) {
        const url = prompt('Entrez l\'URL du lien :');
        if (url) {
          // Valider l'URL
          let validUrl = url;
          if (!url.startsWith('http://') && !url.startsWith('https://')) {
            validUrl = 'https://' + url;
          }
          
          // Créer le lien
          const linkHTML = `<a href="${validUrl}" target="_blank" style="color: #007bff; text-decoration: underline;">${linkText}</a>`;
          insertHTMLAtCursor(linkHTML);
        }
      }
    }
  };

  // Fonctions de gestion des modèles
  const handleSaveModel = async () => {
    if (!modelName.trim()) {
      alert('Veuillez saisir un nom pour le modèle');
      return;
    }

    if (!content.trim()) {
      alert('Aucun contenu à sauvegarder');
      return;
    }

    setIsSaving(true);

    try {
      // Sauvegarder le modèle via l'API
      const result = await StorageManagerAPI.saveContentModel(modelName, content, 'text');
      
      if (result.success) {
        // Si des fichiers sont attachés, les uploader
        if (attachedFiles.length > 0 && result.data?.id) {
          for (const fileData of attachedFiles) {
            await StorageManagerAPI.uploadFileToContentModel(result.data.id, fileData.file);
          }
        }
        
        alert(result.message);
        setShowSaveModal(false);
        setModelName('');
        setAttachedFiles([]); // Réinitialiser les fichiers attachés
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error('Erreur sauvegarde:', error);
      alert('Erreur lors de la sauvegarde du modèle');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLoadModels = async () => {
    try {
      console.log('🔵 [STEP 1] Début handleLoadModels');
      const models = await StorageManagerAPI.getSavedContentModels();
      console.log('🔵 [STEP 2] Modèles reçus:', models);
      console.log('🔵 [STEP 2.1] Nombre de modèles:', models?.length);
      console.log('🔵 [STEP 2.2] Premier modèle:', models?.[0]);
      setSavedModels(models);
      console.log('🔵 [STEP 3] setSavedModels appelé');
      setShowLoadModal(true);
      console.log('🔵 [STEP 4] Modal ouvert');
    } catch (error) {
      console.error('❌ [ERROR] Erreur chargement modèles:', error);
      alert('Erreur lors du chargement des modèles: ' + error.message);
    }
  };

  const handleLoadModel = async (model) => {
    setIsLoadingModel(true);
    setLoadingModelId(model.id);
    
    try {
      console.log('🟢 [LOAD] Début handleLoadModel');
      
      setContent(model.content);
      setFileName(model.name);
      
      // Charger les fichiers attachés si présents
      if (model.files && model.files.length > 0) {
        const filesData = model.files.map(f => ({
          name: f.originalName,
          size: f.fileSize,
          type: f.mimeType,
          file: null,
          id: f.id,
          url: f.filePath
        }));
        setAttachedFiles(filesData);
      } else {
        setAttachedFiles([]);
      }
      
      setShowLoadModal(false);
      alert('✅ Modèle chargé avec succès!');
    } catch (error) {
      console.error('❌ [LOAD ERROR] Erreur chargement modèle:', error);
      alert('Erreur lors du chargement du modèle: ' + error.message);
    } finally {
      setIsLoadingModel(false);
      setLoadingModelId(null);
    }
  };

  const handleDeleteModel = async (modelId) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce modèle ?')) {
      try {
        const result = await StorageManagerAPI.deleteContentModel(modelId);
        
        if (result.success) {
          // Rafraîchir la liste
          const models = await StorageManagerAPI.getSavedContentModels();
          setSavedModels(models);
          alert('Modèle supprimé avec succès');
        } else {
          alert(result.message);
        }
      } catch (error) {
        console.error('Erreur suppression:', error);
        alert('Erreur lors de la suppression du modèle');
      }
    }
  };

  // --- Ouvrir: choix Modèles ou Explorateur (Publications)
  const handleOpenPublications = () => {
    setShowOpenChoice(true);
  };

  const handleOpenPublicationSelect = (pub) => {
    console.log('🟡 [PUB LOAD] Début handleOpenPublicationSelect');
    console.log('🟡 [PUB LOAD] Publication reçue:', pub);
    console.log('🟡 [PUB LOAD] pub.content:', pub.content);
    console.log('🟡 [PUB LOAD] pub.title:', pub.title);
    setContent(pub.content || '');
    console.log('🟡 [PUB LOAD] setContent appelé');
    setFileName(pub.title || '');
    console.log('🟡 [PUB LOAD] setFileName appelé');
    setShowOpenPublications(false);
    console.log('🟡 [PUB LOAD] Modal fermé - Publication chargée ✅');
    alert('✅ Publication chargée avec succès!');
  };

  // --- Ouvrir une publication
  const handleLoadPublications = async () => {
    try {
      console.log('🟠 [PUB STEP 1] Début handleLoadPublications');
      const publications = await StorageManagerAPI.getSavedPublications();
      console.log('🟠 [PUB STEP 2] Publications reçues:', publications);
      console.log('🟠 [PUB STEP 2.1] Nombre de publications:', publications?.length);
      console.log('🟠 [PUB STEP 2.2] Première publication:', publications?.[0]);
      setSavedPublicationsList(publications);
      console.log('🟠 [PUB STEP 3] setSavedPublicationsList appelé');
      setShowOpenPublications(true);
      console.log('🟠 [PUB STEP 4] Modal ouvert');
    } catch (error) {
      console.error('❌ [PUB ERROR] Erreur chargement publications:', error);
      alert('Erreur lors du chargement des publications: ' + error.message);
    }
  };

  // --- Ouvrir depuis l'ordinateur local (HTML ou ZIP)
  const openFromLocalComputer = () => {
    setShowOpenChoice(false);
    openFileRef.current?.click();
  };

  // --- Envoi par email (mailto)
  const handleOpenEmailModal = () => {
    setEmailSubject(fileName || 'Mon article');
    setShowEmailModal(true);
  };

  const handleSendEmail = async () => {
    const editor = textareaRef.current;
    if (!editor) return;
    
    setIsSendingEmail(true);

    // Fonction pour convertir HTML en texte formaté avec retours à la ligne
    const htmlToFormattedText = (htmlContent) => {
      const temp = document.createElement('div');
      temp.innerHTML = htmlContent;
      
      let formattedText = '';
      
      const processNode = (node) => {
        if (node.nodeType === Node.TEXT_NODE) {
          formattedText += node.textContent;
        } else if (node.nodeType === Node.ELEMENT_NODE) {
          const tagName = node.tagName.toLowerCase();
          
          if (['p', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(tagName)) {
            if (formattedText && !formattedText.endsWith('\n\n')) {
              formattedText += '\n\n';
            }
          } else if (tagName === 'br') {
            formattedText += '\n';
            return;
          } else if (tagName === 'li') {
            formattedText += '\n• ';
          } else if (tagName === 'ul' || tagName === 'ol') {
            formattedText += '\n';
          }
          
          node.childNodes.forEach(child => processNode(child));
          
          if (['p', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'blockquote'].includes(tagName)) {
            if (!formattedText.endsWith('\n')) {
              formattedText += '\n';
            }
          }
        }
      };
      
      temp.childNodes.forEach(node => processNode(node));
      formattedText = formattedText.replace(/\n{3,}/g, '\n\n');
      
      return formattedText.trim();
    };
    
    // Récupérer le contenu HTML
    const htmlContent = editor.innerHTML;
    const textContent = htmlToFormattedText(htmlContent);
    
    try {
      // Envoyer l'email via l'API backend
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://api.assistant-redacteur.fr';
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_BASE_URL}/email/send-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify({
          to: emailRecipients.trim(),
          subject: emailSubject.trim(),
          html: htmlContent
        })
      });

      const data = await response.json();

      if (data.success) {
        alert('✅ Email envoyé avec succès !');
        
        // Fermer la modal
        setShowEmailModal(false);
        setEmailRecipients('');
      } else {
        throw new Error(data.error || 'Erreur lors de l\'envoi');
      }
      
    } catch (error) {
      console.error('Erreur envoi email:', error);
      alert(
        '❌ Erreur lors de l\'envoi de l\'email.\n\n' +
        'Détails : ' + error.message + '\n\n' +
        'Vérifiez que le serveur backend est démarré.'
      );
    } finally {
      setIsSendingEmail(false);
    }
  };

  const handleExplorerChange = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    
    // Gérer les fichiers ZIP
    if (file.name.toLowerCase().endsWith('.zip')) {
      try {
        const JSZip = (await import('jszip')).default;
        const zip = await JSZip.loadAsync(file);
        
        // Chercher le fichier HTML principal
        let htmlFile = null;
        let htmlContent = '';
        
        for (const [filename, zipEntry] of Object.entries(zip.files)) {
          if (filename.endsWith('.html') && !filename.includes('/')) {
            htmlFile = filename;
            htmlContent = await zipEntry.async('string');
            break;
          }
        }
        
        if (htmlContent) {
          setFileName(htmlFile.replace('.html', ''));
          setContent(htmlContent);
          
          // Charger les pièces jointes
          const attachments = [];
          for (const [filename, zipEntry] of Object.entries(zip.files)) {
            if (filename.startsWith('attachments/') && !zipEntry.dir) {
              const blob = await zipEntry.async('blob');
              const attachmentName = filename.replace('attachments/', '');
              attachments.push({
                id: Date.now() + Math.random(),
                name: attachmentName,
                size: blob.size,
                type: blob.type,
                file: new File([blob], attachmentName, { type: blob.type }),
                addedAt: new Date().toISOString()
              });
            }
          }
          
          if (attachments.length > 0) {
            setAttachedFiles(attachments);
            alert(`Fichier chargé avec ${attachments.length} pièce(s) jointe(s)`);
          }
          
          setTimeout(() => enforceLTRInNode(textareaRef.current), 0);
        } else {
          alert('Aucun fichier HTML trouvé dans le ZIP');
        }
      } catch (err) {
        console.error('Erreur lecture ZIP:', err);
        alert('Impossible de lire le fichier ZIP');
      }
      e.target.value = '';
      return;
    }
    
    // Gérer les fichiers normaux (JSON, TXT, HTML)
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        if (file.name.toLowerCase().endsWith('.json')) {
          const data = JSON.parse(ev.target.result);
          const title = data.title || file.name.replace(/\.json$/i, '');
          const body = data.content || '';
          const cleaned = stripBidiMarks(body);
          setFileName(title);
          setContent(cleaned);
          setTimeout(() => enforceLTRInNode(textareaRef.current), 0);
        } else {
          const text = ev.target.result;
          const cleaned = stripBidiMarks(String(text))
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/\n/g, '<br>');
          setFileName(file.name.replace(/\.(txt|html)$/i, ''));
          setContent(cleaned);
          setTimeout(() => enforceLTRInNode(textareaRef.current), 0);
        }
      } catch (err) {
        alert('Impossible de lire le fichier sélectionné.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // --- Export local avec pièces jointes
  const handleLocalExport = async () => {
    try {
      const JSZip = (await import('jszip')).default;
      const zip = new JSZip();
      
      const exportFileName = fileName || 'publication';
      
      // Ajouter le contenu principal
      zip.file(`${exportFileName}.html`, content);
      
      // Ajouter les pièces jointes si elles existent
      if (attachedFiles && attachedFiles.length > 0) {
        const attachmentsFolder = zip.folder('attachments');
        
        for (const attachment of attachedFiles) {
          if (attachment.file) {
            const fileData = await attachment.file.arrayBuffer();
            attachmentsFolder.file(attachment.name, fileData);
          }
        }
      }
      
      // Générer le ZIP et le télécharger
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${exportFileName}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      setShowSaveModal(false);
      alert('Fichier téléchargé avec succès !');
    } catch (error) {
      console.error('Erreur export local:', error);
      alert('Erreur lors de l\'export: ' + error.message);
    }
  };

  // --- Enregistrer: dispatcher vers Modèles ou Publications
  const handleSaveDispatch = async () => {
    if (!content.trim()) {
      alert('Aucun contenu à enregistrer');
      return;
    }

    setIsSaving(true);

    try {
      if (saveDestination === 'model') {
        if (!modelName.trim()) {
          alert('Veuillez saisir un nom pour le modèle');
          setIsSaving(false);
          return;
        }
        const result = await StorageManagerAPI.saveContentModel(modelName, content, 'text');
        if (result.success) {
          alert(result.message);
          setShowSaveModal(false);
          setModelName('');
        } else {
          alert(result.message);
        }
      } else if (saveDestination === 'local') {
        // Export local avec pièces jointes
        await handleLocalExport();
        setShowSaveModal(false);
      } else {
        const title = fileName || 'Publication sans titre';
        const result = await StorageManagerAPI.saveScheduledPublication(
          title,
          content,
          new Date().toISOString(),
          ['web']
        );
        if (result.success) {
          alert(`Publication "${title}" enregistrée dans Publications`);
          setShowSaveModal(false);
        } else {
          alert(result.message);
        }
      }
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement:', error);
      alert('Erreur lors de l\'enregistrement: ' + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteContent = () => {
    if (confirm('Êtes-vous sûr de vouloir supprimer tout le contenu ?')) {
      setContent('');
      setFileName('');
    }
  };

  const handlePublish = async () => {
    if (!content.trim()) {
      alert('Aucun contenu à publier');
      return;
    }
    
    setIsPublishing(true);
    
    const publicationTitle = fileName || 'Publication sans titre';
    // Préserver le HTML (avec <br>) pour la diffusion et l'enregistrement
    const currentHtml = textareaRef.current?.innerHTML ?? content;
    const publishDate = new Date().toISOString();
    
    try {
      // Sauvegarder dans MySQL via l'API
      const result = await StorageManagerAPI.saveScheduledPublication(
        publicationTitle,
        currentHtml,
        publishDate,
        ['web']
      );

      if (result.success) {
        const payload = {
          title: publicationTitle,
          content: currentHtml,
          publishDate,
          platforms: ['web'],
          publicationId: result.data?.id || Date.now()
        };
        try {
          localStorage.setItem('editor_to_calendar', JSON.stringify(payload));
        } catch {}
        // Ouvrir le calendrier dans un nouvel onglet/fenêtre
        const url = `${window.location.origin}/calendar`;
        window.open(url, '_blank', 'noopener');
      } else {
        alert('Erreur lors de la sauvegarde : ' + result.message);
      }
    } catch (error) {
      console.error('Erreur lors de la publication:', error);
      alert('Erreur lors de la sauvegarde de la publication');
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="page-container editor-page">
      <MenuBar onHelp={() => {}} />
      <div className="page-content">
        <div className="content-editor">

          {/* Header avec titre et boutons principaux */}
          <div className="editor-header-new">
            <div className="header-left">
              <h2>{t('title')}</h2>
            </div>
            <div className="header-buttons">
              <button className="btn-header" onClick={handleOpenPublications}>
                <i className="fas fa-folder-open"></i>
                {t('buttons.open')}
              </button>
              <button className="btn-header" onClick={handleOpenPublications}>
                <i className="fas fa-folder-open"></i>
                {t('buttons.model')}
              </button>
              <button className="btn-header" onClick={() => setShowSaveModal(true)}>
                <i className="fas fa-save"></i>
                {t('buttons.save')}
              </button>
              <button className="btn-header btn-delete" onClick={handleDeleteContent}>
                <i className="fas fa-trash"></i>
                {t('buttons.delete')}
              </button>
            </div>
          </div>

          {/* Zone d'édition principale */}
          <div className="editor-main-area">
            {/* Barre d'outils avec champ nom réduit */}
            <div className="editor-toolbar-with-filename">
              <div className="toolbar-left">
                <button className="tool-btn" title={t('toolbar.bold')} onClick={() => document.execCommand('bold')}>
                  <i className="fas fa-bold"></i>
                </button>
                <button className="tool-btn" title={t('toolbar.italic')} onClick={() => document.execCommand('italic')}>
                  <i className="fas fa-italic"></i>
                </button>
                <button className="tool-btn" title={t('toolbar.underline')} onClick={() => document.execCommand('underline')}>
                  <i className="fas fa-underline"></i>
                </button>
                
                {/* Couleur du texte */}
                <div className="color-picker-group">
                  <button className="tool-btn" title={t('toolbar.textColor')}>
                    <i className="fas fa-palette"></i>
                  </button>
                  <input 
                    type="color" 
                    onChange={(e) => applyTextColor(e.target.value)}
                    className="color-input"
                  />
                </div>
                
                {/* Surlignage */}
                <div className="color-picker-group">
                  <button className="tool-btn" title={t('toolbar.highlight')}>
                    <i className="fas fa-highlighter"></i>
                  </button>
                  <input 
                    type="color" 
                    onChange={(e) => applyHighlight(e.target.value)}
                    className="color-input"
                  />
                </div>
                
                {/* Taille de police */}
                <div style={{position: 'relative', display: 'inline-block'}}>
                  <button className="tool-btn" title="Taille de police" onClick={() => setShowFontSizeMenu(!showFontSizeMenu)}>
                    <i className="fas fa-text-height"></i>
                  </button>
                  {showFontSizeMenu && (
                    <div style={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      background: 'white',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                      zIndex: 1000,
                      minWidth: '140px',
                      marginTop: '2px'
                    }}>
                      <button 
                        onClick={() => { applyFontSize(9); setShowFontSizeMenu(false); }}
                        style={{
                          display: 'block',
                          width: '100%',
                          padding: '8px 12px',
                          border: 'none',
                          background: 'white',
                          textAlign: 'left',
                          cursor: 'pointer',
                          fontSize: '9px'
                        }}
                        onMouseEnter={(e) => e.target.style.background = '#f0f0f0'}
                        onMouseLeave={(e) => e.target.style.background = 'white'}
                      >
                        Minuscule (9px)
                      </button>
                      <button 
                        onClick={() => { applyFontSize(12); setShowFontSizeMenu(false); }}
                        style={{
                          display: 'block',
                          width: '100%',
                          padding: '8px 12px',
                          border: 'none',
                          background: 'white',
                          textAlign: 'left',
                          cursor: 'pointer',
                          fontSize: '12px'
                        }}
                        onMouseEnter={(e) => e.target.style.background = '#f0f0f0'}
                        onMouseLeave={(e) => e.target.style.background = 'white'}
                      >
                        Petite (12px)
                      </button>
                      <button 
                        onClick={() => { applyFontSize(16); setShowFontSizeMenu(false); }}
                        style={{
                          display: 'block',
                          width: '100%',
                          padding: '8px 12px',
                          border: 'none',
                          background: 'white',
                          textAlign: 'left',
                          cursor: 'pointer',
                          fontSize: '16px'
                        }}
                        onMouseEnter={(e) => e.target.style.background = '#f0f0f0'}
                        onMouseLeave={(e) => e.target.style.background = 'white'}
                      >
                        Moyenne (16px)
                      </button>
                      <button 
                        onClick={() => { applyFontSize(24); setShowFontSizeMenu(false); }}
                        style={{
                          display: 'block',
                          width: '100%',
                          padding: '8px 12px',
                          border: 'none',
                          background: 'white',
                          textAlign: 'left',
                          cursor: 'pointer',
                          fontSize: '24px'
                        }}
                        onMouseEnter={(e) => e.target.style.background = '#f0f0f0'}
                        onMouseLeave={(e) => e.target.style.background = 'white'}
                      >
                        Grosse (24px)
                      </button>
                      <button 
                        onClick={() => { applyFontSize(30); setShowFontSizeMenu(false); }}
                        style={{
                          display: 'block',
                          width: '100%',
                          padding: '8px 12px',
                          border: 'none',
                          background: 'white',
                          textAlign: 'left',
                          cursor: 'pointer',
                          fontSize: '30px'
                        }}
                        onMouseEnter={(e) => e.target.style.background = '#f0f0f0'}
                        onMouseLeave={(e) => e.target.style.background = 'white'}
                      >
                        Énorme (30px)
                      </button>
                    </div>
                  )}
                </div>
                
                <button className="tool-btn" title={t('toolbar.bulletList')} onClick={handleToggleUnorderedList}>
                  <i className="fas fa-list-ul"></i>
                </button>
                <button className="tool-btn" title={t('toolbar.numberedList')} onClick={handleToggleOrderedList}>
                  <i className="fas fa-list-ol"></i>
                </button>
                
                <button className="tool-btn" title={t('toolbar.indent')} onClick={handleIndent}>
                  <i className="fas fa-indent"></i>
                </button>
                
                <button className="tool-btn" title={t('toolbar.outdent')} onClick={handleOutdent}>
                  <i className="fas fa-outdent"></i>
                </button>
                
                <button className="tool-btn" title={`Alignement : ${currentAlignment === 'left' ? 'Gauche' : currentAlignment === 'center' ? 'Centre' : 'Droite'}`} onClick={handleCycleAlignment}>
                  <i className={`fas fa-align-${currentAlignment}`}></i>
                </button>
                
                <button className="tool-btn" title={t('toolbar.insertImage')} onClick={handleInsertImage}>
                  <i className="fas fa-image"></i>
                </button>
                
                <button className="tool-btn" title={t('toolbar.insertVideo')} onClick={handleInsertVideo}>
                  <i className="fas fa-video"></i>
                </button>
                
                <button className="tool-btn" title={t('toolbar.insertLink')} onClick={handleInsertLink}>
                  <i className="fas fa-link"></i>
                </button>
                
                <button className="tool-btn" title={t('toolbar.insertEmoji')} onClick={() => window.open('https://emojikeyboard.top/fr/#emojis-1', '_blank')}>
                  <i className="fas fa-smile"></i>
                </button>
                
                <button className="tool-btn" title={t('toolbar.attachFile')} onClick={handleFileAttachment}>
                  <i className="fas fa-paperclip"></i>
                </button>
              </div>
              
              {/* Champ nom réduit de 70% */}
              <div className="filename-container">
                <input
                  type="text"
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                  placeholder={t('filename.placeholder')}
                  className="filename-input-small"
                />
              </div>
            </div>

            {/* Zone de texte principale */}
            <div
              ref={textareaRef}
              contentEditable={true}
              suppressContentEditableWarning={true}
              dir="ltr"
              lang="fr"
              onInput={handleContentChange}
              onPaste={handlePaste}
              onKeyDown={(e) => {
                // Enter: laisser le navigateur gérer si on est dans une liste, sinon insérer un paragraphe visuel
                if (e.key === 'Enter' && !e.shiftKey) {
                  if (isInsideList()) {
                    // Laisser le comportement par défaut pour créer le prochain <li>
                    return;
                  }
                  e.preventDefault();
                  document.execCommand('insertHTML', false, '<br><br>');
                }
              }}
              className="editor-content-ltr"
              data-placeholder={t('editor.placeholder')}
            />
            {/* Input fichier caché pour ouvrir depuis l'explorateur (Publications) */}
            <input
              type="file"
              ref={openFileRef}
              style={{ display: 'none' }}
              accept=".json,.txt,.html,.zip,text/*,application/zip"
              onChange={handleExplorerChange}
            />

            {/* Contrôles webcam et diffusion sur la même ligne */}
            <div className="webcam-controls-bottom">
              <div className="webcam-section">
                <h4>{t('webcam.title')}</h4>
                <button 
                  className={`btn-record ${isRecording ? 'recording' : ''}`}
                  onClick={isRecording ? stopRecording : startRecording}
                >
                  <i className={`fas fa-${isRecording ? 'stop' : 'video'}`}></i>
                  {t('webcam.start')}
                </button>
                {recordedChunks.length > 0 && (
                  <button className="btn-delete-recording" onClick={deleteRecording}>
                    <i className="fas fa-trash"></i>
                    {t('webcam.delete')}
                  </button>
                )}
              </div>
              
              {/* Bouton Envoyer par email */}
              <div className="email-section" style={{marginRight: '10px'}}>
                <button 
                  className="btn-email-inline" 
                  onClick={handleOpenEmailModal}
                  style={{
                    padding: '10px 20px',
                    background: '#17a2b8',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => e.target.style.background = '#138496'}
                  onMouseLeave={(e) => e.target.style.background = '#17a2b8'}
                >
                  <i className="fas fa-envelope"></i>
                  Envoyer par email
                </button>
              </div>
              
              {/* Bouton Diffusion sur la même ligne */}
              <div className="diffusion-section">
                <button 
                  className="btn-publish-inline" 
                  onClick={handlePublish}
                  disabled={isPublishing}
                  style={{ opacity: isPublishing ? 0.7 : 1 }}
                >
                  {isPublishing ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i>
                      Envoi en cours...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-paper-plane"></i>
                      {t('buttons.publish')}
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Statistiques */}
            <div className="editor-stats">
              <span>{wordCount} {t('stats.words')}</span>
              <span>{charCount} {t('stats.characters')}</span>
            </div>
          </div>

        </div>
      </div>

      {/* Modale de sauvegarde (Modèles ou Publications) */}
      {showSaveModal && (
        <div className="modal-overlay" onClick={() => setShowSaveModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>{t('modals.save.title')}</h3>
            <div style={{ display: 'flex', gap: '8px', marginBottom: 12, flexWrap: 'nowrap', alignItems: 'center' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 4, whiteSpace: 'nowrap' }}>
                <input
                  type="radio"
                  name="saveDest"
                  checked={saveDestination === 'model'}
                  onChange={() => setSaveDestination('model')}
                />
                <span style={{ fontSize: '14px' }}>{t('modals.save.modelFolder')}</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 4, whiteSpace: 'nowrap' }}>
                <input
                  type="radio"
                  name="saveDest"
                  checked={saveDestination === 'publication'}
                  onChange={() => setSaveDestination('publication')}
                />
                <span style={{ fontSize: '14px' }}>{t('modals.save.publicationFolder')}</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 4, whiteSpace: 'nowrap' }}>
                <input
                  type="radio"
                  name="saveDest"
                  checked={saveDestination === 'local'}
                  onChange={() => setSaveDestination('local')}
                />
                <span style={{ fontSize: '14px' }}>{t('modals.save.myComputer')}</span>
              </label>
            </div>

            {saveDestination === 'model' ? (
              <>
                <input
                  type="text"
                  placeholder={t('modals.save.modelName')}
                  value={modelName}
                  onChange={(e) => setModelName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSaveDispatch()}
                />
              </>
            ) : saveDestination === 'local' ? (
              <>
                <input
                  type="text"
                  placeholder={t('modals.save.fileNamePlaceholder')}
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                />
                <p style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>
                  {t('modals.save.zipDescription')}
                </p>
              </>
            ) : (
              <>
                <input
                  type="text"
                  placeholder={t('modals.save.publicationTitle')}
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                />
              </>
            )}

            <div className="modal-buttons">
              <button onClick={handleSaveDispatch} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <i className="fas fa-spinner fa-spin" style={{ marginRight: '8px' }}></i>
                    {t('modals.save.saving')}
                  </>
                ) : (
                  t('modals.save.saveButton')
                )}
              </button>
              <button onClick={() => setShowSaveModal(false)} disabled={isSaving}>{t('modals.save.cancel')}</button>
            </div>
          </div>
        </div>
      )}

      {/* Choix d'ouverture: Modèles, Publications ou Mon ordinateur */}
      {showOpenChoice && (
        <div className="modal-overlay" onClick={() => setShowOpenChoice(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>{t('modals.openChoice.title')}</h3>
            <div className="modal-buttons" style={{ display:'flex', flexDirection: 'column', gap:12 }}>
              <button onClick={() => { console.log('🔴 [CLICK] Bouton "Ouvrir un modèle" cliqué'); setShowOpenChoice(false); handleLoadModels(); }} style={{ width: '100%' }}>
                <i className="fas fa-folder"></i> {t('modals.openChoice.openModel')}
              </button>
              <button onClick={() => { console.log('🔴 [CLICK] Bouton "Ouvrir une publication" cliqué'); setShowOpenChoice(false); handleLoadPublications(); }} style={{ width: '100%' }}>
                <i className="fas fa-newspaper"></i> {t('modals.openChoice.openPublication')}
              </button>
              <button onClick={openFromLocalComputer} style={{ width: '100%' }}>
                <i className="fas fa-laptop"></i> {t('modals.openChoice.myComputer')}
              </button>
            </div>
            <div className="modal-buttons" style={{ marginTop: '1rem' }}>
              <button onClick={() => setShowOpenChoice(false)}>{t('modals.openChoice.cancel')}</button>
            </div>
          </div>
        </div>
      )}

      {/* Modale de chargement des modèles */}
      {showLoadModal && (
        <div className="modal-overlay" onClick={() => { setShowLoadModal(false); setSelectedModels([]); setEditingModelId(null); }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px', maxHeight: '70vh' }}>
            <h3>{t('modals.loadModel.title')}</h3>
            
            {/* Barre d'actions pour sélection multiple */}
            {savedModels.length > 0 && (
              <div style={{ display: 'flex', gap: '10px', marginBottom: '15px', alignItems: 'center', flexWrap: 'wrap' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px' }}>
                  <input
                    type="checkbox"
                    checked={selectedModels.length === savedModels.length && savedModels.length > 0}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedModels(savedModels.map(m => m.id));
                      } else {
                        setSelectedModels([]);
                      }
                    }}
                    style={{ width: '18px', height: '18px', borderRadius: '50%', accentColor: '#ff6b2c', cursor: 'pointer' }}
                  />
                  Tout sélectionner
                </label>
                {selectedModels.length > 0 && (
                  <button
                    onClick={async () => {
                      if (confirm(`Supprimer ${selectedModels.length} modèle(s) ?`)) {
                        for (const id of selectedModels) {
                          try {
                            await handleDeleteModel(id);
                          } catch (error) {
                            console.error('Erreur suppression:', error);
                          }
                        }
                        setSelectedModels([]);
                      }
                    }}
                    className="delete-btn"
                    style={{ padding: '6px 12px' }}
                  >
                    <i className="fas fa-trash"></i> Supprimer ({selectedModels.length})
                  </button>
                )}
              </div>
            )}
            
            <div className="config-list" style={{ maxHeight: '45vh', overflowY: 'auto' }}>
              {savedModels.length === 0 ? (
                <p>{t('modals.loadModel.noModels')}</p>
              ) : (
                savedModels.map((model) => {
                  const isSelected = selectedModels.includes(model.id);
                  const isEditing = editingModelId === model.id;
                  return (
                    <div key={model.id} className="config-item" style={{ background: isSelected ? 'rgba(255, 107, 44, 0.1)' : undefined, padding: '8px 12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedModels([...selectedModels, model.id]);
                            } else {
                              setSelectedModels(selectedModels.filter(id => id !== model.id));
                            }
                          }}
                          style={{ width: '18px', height: '18px', borderRadius: '50%', accentColor: '#ff6b2c', cursor: 'pointer', flexShrink: 0 }}
                        />
                        <div className="config-info" style={{ flex: 1 }}>
                          {isEditing ? (
                            <input
                              type="text"
                              value={editingModelName}
                              onChange={(e) => setEditingModelName(e.target.value)}
                              onKeyDown={async (e) => {
                                if (e.key === 'Enter' && editingModelName.trim()) {
                                  try {
                                    await contentModelsApi.update(model.id, { name: editingModelName.trim() });
                                    const result = await contentModelsApi.getAll();
                                    setSavedModels(result.data || []);
                                    setEditingModelId(null);
                                  } catch (error) {
                                    console.error('Erreur renommage:', error);
                                  }
                                } else if (e.key === 'Escape') {
                                  setEditingModelId(null);
                                }
                              }}
                              autoFocus
                              style={{ padding: '4px 8px', fontSize: '14px', width: '100%' }}
                            />
                          ) : (
                            <strong>{model.name}</strong>
                          )}
                          <small>{new Date(model.createdAt || model.updatedAt).toLocaleString()}</small>
                        </div>
                      </div>
                      <div className="config-actions">
                        {isEditing ? (
                          <>
                            <button onClick={async () => {
                              if (editingModelName.trim()) {
                                try {
                                  await contentModelsApi.update(model.id, { name: editingModelName.trim() });
                                  const result = await contentModelsApi.getAll();
                                  setSavedModels(result.data || []);
                                  setEditingModelId(null);
                                } catch (error) {
                                  console.error('Erreur renommage:', error);
                                }
                              }
                            }} className="load-btn" style={{ padding: '4px 8px' }}>
                              <i className="fas fa-check"></i>
                            </button>
                            <button onClick={() => setEditingModelId(null)} className="delete-btn" style={{ padding: '4px 8px' }}>
                              <i className="fas fa-times"></i>
                            </button>
                          </>
                        ) : (
                          <>
                            <button 
                              onClick={() => { setEditingModelId(model.id); setEditingModelName(model.name); }}
                              title="Renommer"
                              style={{ padding: '4px 8px', background: '#17a2b8', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                            >
                              <i className="fas fa-pen"></i>
                            </button>
                            <button 
                              onClick={() => handleLoadModel(model)}
                              disabled={isLoadingModel}
                              style={{ opacity: loadingModelId === model.id ? 0.7 : 1 }}
                            >
                              {loadingModelId === model.id ? (
                                <>
                                  <i className="fas fa-spinner fa-spin" style={{ marginRight: '5px' }}></i>
                                  Chargement...
                                </>
                              ) : (
                                t('modals.loadModel.load')
                              )}
                            </button>
                            <button 
                              onClick={() => handleDeleteModel(model.id)}
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
              <button onClick={() => { setShowLoadModal(false); setSelectedModels([]); setEditingModelId(null); }}>{t('modals.loadModel.close')}</button>
            </div>
          </div>
        </div>
      )}

      {/* Modale d'ouverture des Publications */}
      {showOpenPublications && (
        <div className="modal-overlay" onClick={() => setShowOpenPublications(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>{t('modals.openPublication.title')}</h3>
            <div className="config-list">
              {savedPublicationsList.length === 0 ? (
                <p>{t('modals.openPublication.noPublications')}</p>
              ) : (
                savedPublicationsList.map((pub) => (
                  <div key={pub.id} className="config-item">
                    <div className="config-info">
                      <strong>{pub.title || t('modals.openPublication.untitled')}</strong>
                      <small>{new Date(pub.publishDate || pub.createdAt || pub.updatedAt).toLocaleString()}</small>
                    </div>
                    <div className="config-actions">
                      <button onClick={() => handleOpenPublicationSelect(pub)}>{t('modals.openPublication.open')}</button>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="modal-buttons">
              <button onClick={() => setShowOpenPublications(false)}>{t('modals.openPublication.close')}</button>
            </div>
          </div>
        </div>
      )}

      {/* Modale d'envoi par email */}
      {showEmailModal && (
        <div className="modal-overlay" onClick={() => setShowEmailModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{maxWidth: '500px'}}>
            <h3>
              <i className="fas fa-envelope" style={{marginRight: '10px', color: '#17a2b8'}}></i>
              Envoyer par email
            </h3>
            
            <div style={{marginBottom: '20px'}}>
              <label style={{display: 'block', marginBottom: '8px', fontWeight: '500'}}>
                Destinataire(s) :
                <span style={{fontSize: '12px', color: '#666', marginLeft: '5px'}}>
                  (séparez par des virgules pour plusieurs destinataires)
                </span>
              </label>
              <input
                type="text"
                value={emailRecipients}
                onChange={(e) => setEmailRecipients(e.target.value)}
                placeholder="exemple@email.com, autre@email.com"
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
              />
            </div>

            <div style={{marginBottom: '20px'}}>
              <label style={{display: 'block', marginBottom: '8px', fontWeight: '500'}}>
                Sujet :
              </label>
              <input
                type="text"
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
                placeholder="Sujet de l'email"
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
              />
            </div>

            <div style={{
              padding: '15px',
              background: '#f8f9fa',
              borderRadius: '4px',
              marginBottom: '20px',
              border: '1px solid #e9ecef'
            }}>
              <div style={{display: 'flex', alignItems: 'center', marginBottom: '8px'}}>
                <i className="fas fa-info-circle" style={{color: '#17a2b8', marginRight: '8px'}}></i>
                <strong style={{fontSize: '14px'}}>Comment ça fonctionne ?</strong>
              </div>
              <p style={{fontSize: '13px', color: '#666', margin: 0, lineHeight: '1.5'}}>
                L'email sera <strong>envoyé directement</strong> depuis le serveur avec le formatage HTML préservé (gras, couleurs, listes, etc.). 
                Aucune manipulation nécessaire !
              </p>
            </div>

            <div className="modal-buttons" style={{display: 'flex', gap: '10px', justifyContent: 'flex-end'}}>
              <button 
                onClick={() => setShowEmailModal(false)}
                style={{
                  padding: '10px 20px',
                  background: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Annuler
              </button>
              <button 
                onClick={handleSendEmail}
                disabled={!emailRecipients.trim() || isSendingEmail}
                style={{
                  padding: '10px 20px',
                  background: (!emailRecipients.trim() || isSendingEmail) ? '#ccc' : '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: (!emailRecipients.trim() || isSendingEmail) ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  opacity: isSendingEmail ? 0.7 : 1
                }}
                title="Envoyer l'email"
              >
                {isSendingEmail ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i>
                    Envoi en cours...
                  </>
                ) : (
                  <>
                    <i className="fas fa-paper-plane"></i>
                    Envoyer par email
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContentEditorFixed;
