import { useState, useRef, useEffect, useCallback } from 'react';
import MediaAISelector from './MediaAISelector';
import { useAssistantAutoSave } from '../hooks/useLocalStorage';
import { getHomeText } from '../i18n/homeTranslations';
import { buildReferencePrompt } from '../utils/referencePromptBuilder';

const UploadArea = ({ content, onContentChange, onFilesChange, onAIConfigChange, onRecordingToggle, onDictationToggle, attachedFiles = [], isImageMode = false, selectedAI = '', imageStrength = 0.7, onStrengthChange, onFileRoleChange }) => {
  // Les trois IA d'image (SeedDream TTI, SeedDream Edit, Nano Banana) acceptent
  // des images de référence. Pour SeedDream TTI, la présence de références
  // bascule automatiquement sur l'endpoint v5/lite/edit côté backend.
  const supportsReferenceImages = isImageMode;
  // SeedDream edit et Nano Banana supportent le slider de force
  const supportsStrength = supportsReferenceImages;
  // WAN 2.6 mode vidéo
  const isWanVideoMode = selectedAI === 'wan-2.6';
  const { autoSaveData } = useAssistantAutoSave();
  const userLanguage = autoSaveData.language || 'fr';
  const t = (path) => getHomeText(userLanguage, path);
  
  const [isRecording, setIsRecording] = useState(false);
  const [isDictating, setIsDictating] = useState(false);
  const [aiConfig, setAiConfig] = useState(null);
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);
  const recognitionRef = useRef(null);
  // État de dictée persistant entre les instances de SpeechRecognition
  const dictationActiveRef = useRef(false);
  const dictationBaseRef = useRef('');
  const dictationFinalRef = useRef('');
  const dictationRestartCountRef = useRef(0);

  // Callback pour recevoir la configuration IA et la transmettre au parent
  const handleAIConfigChange = (config) => {
    setAiConfig(config);
    console.log('📋 Configuration IA multimodale mise à jour:', config);
    // Transmettre au parent (HomeFixed)
    if (onAIConfigChange) {
      onAIConfigChange(config);
    }
  };

  const isDebug = () => typeof window !== 'undefined' && window.localStorage && localStorage.getItem('debugInput') === '1'

  const handleContentChange = (value) => {
    if (isDebug()) console.log('[UploadArea] onChange value.length=', value?.length)
    onContentChange(value);
  };

  // Mapper la langue de l'interface vers le code de langue pour la reconnaissance vocale
  const getSpeechLanguageCode = () => {
    const langMap = {
      'fr': 'fr-FR',
      'en': 'en-US',
      'es': 'es-ES',
      'de': 'de-DE'
    };
    return langMap[userLanguage] || 'fr-FR';
  };

  // Dictée vocale avec Wispr Flow ou Web Speech API
  const handleDictationToggle = async () => {
    if (!isDictating) {
      const speechLang = getSpeechLanguageCode();
      // Démarrer Wispr Flow
      try {
        // Vérifier si Wispr Flow est disponible
        if (window.wisprFlow) {
          console.log(`🎤 Démarrage Wispr Flow en ${speechLang}...`);
          const result = await window.wisprFlow.startDictation({
            language: speechLang,
            continuous: true,
            interimResults: true
          });
          
          if (result.text) {
            const existingContent = content ? content + ' ' : '';
            handleContentChange(existingContent + result.text);
          }
          
          setIsDictating(true);
          onDictationToggle();
        } else {
          // Fallback sur Web Speech API native
          console.log('🎤 Wispr Flow non détecté, utilisation Web Speech API...');
          startNativeSpeechRecognition();
        }
      } catch (error) {
        console.error('Erreur Wispr Flow:', error);
        
        // Fallback sur Web Speech API native
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
          startNativeSpeechRecognition();
        } else {
          alert('La reconnaissance vocale n\'est pas supportée par votre navigateur. Veuillez utiliser Chrome, Edge ou Safari.');
        }
      }
    } else {
      // Arrêter la dictée
      if (window.wisprFlow && window.wisprFlow.stopDictation) {
        window.wisprFlow.stopDictation();
      }

      dictationActiveRef.current = false;

      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          console.warn('Arrêt dictée:', e.message);
        }
        recognitionRef.current = null;
      }
      
      setIsDictating(false);
      onDictationToggle();
    }
  };
  
  // Fallback sur Web Speech API native
  // ⚠️ COMPORTEMENT VALIDÉ — NE PAS MODIFIER SANS VALIDATION (voir AGENTS.md §1)
  // - redémarrage automatique dans onend tant que dictationActiveRef est vrai
  // - no-speech / aborted ne doivent jamais arrêter la dictée
  // - AUCUN timeout de silence ne doit arrêter la reconnaissance
  const startNativeSpeechRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('La reconnaissance vocale n\'est pas supportée par ce navigateur. Utilisez Chrome, Edge ou Safari.');
      return;
    }

    const speechLang = getSpeechLanguageCode();
    console.log(`🎤 Reconnaissance vocale en ${speechLang}`);

    // Mémoriser le texte déjà présent : la dictée s'ajoute à la suite
    dictationBaseRef.current = content ? content + ' ' : '';
    dictationFinalRef.current = '';
    dictationRestartCountRef.current = 0;
    dictationActiveRef.current = true;

    const stopDictationUI = () => {
      dictationActiveRef.current = false;
      setIsDictating(false);
      onDictationToggle();
    };

    const createRecognition = () => {
      const recognition = new SpeechRecognition();
      recognition.lang = speechLang;
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      recognition.onresult = (event) => {
        // Du son est arrivé : le moteur fonctionne, on réarme le compteur
        dictationRestartCountRef.current = 0;

        let interimTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            dictationFinalRef.current += transcript + ' ';
          } else {
            interimTranscript += transcript;
          }
        }

        handleContentChange(
          dictationBaseRef.current + dictationFinalRef.current + interimTranscript
        );
      };

      recognition.onerror = (event) => {
        console.error('Erreur de reconnaissance vocale:', event.error);

        // Silences et interruptions normales : onend relancera automatiquement
        if (event.error === 'no-speech' || event.error === 'aborted') {
          return;
        }

        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          alert('❌ Permission micro refusée. Autorisez l\'accès au microphone dans les paramètres du navigateur.');
          stopDictationUI();
        } else if (event.error === 'audio-capture') {
          alert('❌ Aucun microphone détecté. Vérifiez votre matériel puis réessayez.');
          stopDictationUI();
        } else if (event.error === 'network') {
          alert('❌ La reconnaissance vocale du navigateur nécessite une connexion Internet. Vérifiez votre réseau puis réessayez.');
          stopDictationUI();
        }
      };

      recognition.onend = () => {
        // Arrêt volontaire : on ne relance pas
        if (!dictationActiveRef.current) {
          return;
        }

        // Chrome coupe après un silence ou au bout d'environ 60 s : on relance
        dictationRestartCountRef.current += 1;
        if (dictationRestartCountRef.current > 60) {
          stopDictationUI();
          alert('⚠️ La dictée s\'est interrompue plusieurs fois. Cliquez à nouveau sur le micro pour reprendre.');
          return;
        }

        setTimeout(() => {
          if (!dictationActiveRef.current) return;
          try {
            recognition.start();
          } catch {
            // L'instance est peut-être dans un état invalide : on en recrée une
            try {
              const next = createRecognition();
              recognitionRef.current = next;
              next.start();
            } catch (err) {
              console.error('Redémarrage de la dictée impossible:', err);
              stopDictationUI();
            }
          }
        }, 250);
      };

      recognitionRef.current = recognition;
      return recognition;
    };

    try {
      const recognition = createRecognition();
      recognition.start();
      setIsDictating(true);
      onDictationToggle();
    } catch (error) {
      console.error('Erreur démarrage reconnaissance:', error);
      dictationActiveRef.current = false;
      alert('❌ Impossible de démarrer la reconnaissance vocale. Vérifiez les permissions micro.');
    }
  };

  const handleRecordingToggle = () => {
    setIsRecording(!isRecording);
    onRecordingToggle();
  };

  const handleFileUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      // Convertir les fichiers en base64 pour les images (nécessaire pour les IA)
      const newFiles = await Promise.all(files.map(async (file) => {
        const fileData = {
          id: Date.now() + Math.random(),
          name: file.name,
          size: file.size,
          type: file.type,
          file: file,
          addedAt: new Date().toISOString()
        };
        
        // Si c'est une image, la convertir en base64 pour l'envoi à l'IA
        if (file.type?.startsWith('image/')) {
          try {
            const base64 = await new Promise((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = () => resolve(reader.result);
              reader.onerror = reject;
              reader.readAsDataURL(file);
            });
            fileData.base64 = base64;
            fileData.dataUrl = base64;
          } catch (err) {
            console.error('Erreur conversion image en base64:', err);
          }
        }
        
        return fileData;
      }));
      
      const updatedFiles = [...attachedFiles, ...newFiles];
      
      // Notifier le parent du changement de fichiers
      if (onFilesChange) {
        onFilesChange(updatedFiles);
      }
      
      // Afficher un message dans la zone de texte
      const fileNames = newFiles.map(f => f.name).join(', ');
      const message = `\n\n📎 Document(s) joint(s) : ${fileNames}\n`;
      handleContentChange(content + message);
      
      // Réinitialiser l'input pour permettre de joindre le même fichier à nouveau
      e.target.value = '';
    }
  };
  
  const handleRemoveFile = (fileId) => {
    const updatedFiles = attachedFiles.filter(f => f.id !== fileId);
    
    // Notifier le parent du changement de fichiers
    if (onFilesChange) {
      onFilesChange(updatedFiles);
    }
  };
  
  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const handleExtractFromWeb = () => {
    const url = prompt('Entrez l\'URL à extraire :');
    if (url) {
      handleContentChange(`Extraction en cours depuis : ${url}`);
      setTimeout(() => {
        handleContentChange(`Contenu extrait depuis : ${url}\n\n[Simulation du contenu extrait]`);
      }, 2000);
    }
  };

  // Fonction pour ajuster la hauteur du conteneur (même logique que ProjectInfoSimple)
  const adjustTextareaHeight = useCallback((element) => {
    if (!element) return;

    // Réinitialiser temporairement pour calcul
    element.style.cssText = `
      height: auto !important;
      overflow: hidden !important;
      min-height: 300px !important;
      max-height: none !important;
      resize: both !important;
      white-space: pre-wrap !important;
      word-wrap: break-word !important;
    `;

    // Calculer la hauteur nécessaire (au moins 300px)
    const minHeight = 300;
    const scrollHeight = element.scrollHeight;
    const newHeight = Math.max(minHeight, scrollHeight);

    // Appliquer la nouvelle hauteur avec !important
    element.style.cssText += `height: ${newHeight}px !important;`;
  }, []);

  // Ajuster la hauteur au chargement et à chaque changement de contenu
  useEffect(() => {
    adjustTextareaHeight(textareaRef.current);
  }, [content, adjustTextareaHeight]);

  // Gérer le redimensionnement de la fenêtre
  useEffect(() => {
    const handleResize = () => {
      adjustTextareaHeight(textareaRef.current);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [adjustTextareaHeight]);

  return (
    <div className="section">
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        marginBottom: '15px',
        gap: '20px',
        flexWrap: 'wrap'
      }}>
        <h3 className="section-title" style={{ margin: 0 }}>
          <i className="fas fa-cloud-upload-alt"></i>
          {t('sections.uploadArea.title')}
        </h3>
        
        {/* Sélecteur d'IA par type de média - masqué en mode image */}
        {!isImageMode && <MediaAISelector onAIConfigChange={handleAIConfigChange} />}
      </div>
      
      <div className="upload-area-large" id="uploadArea" style={{ 
        border: '1px solid rgba(255, 255, 255, 0.3)',
        borderRadius: '8px',
        background: 'rgba(255, 255, 255, 0.03)',
        transition: 'border-color 0.2s ease',
        width: '100%',
        boxSizing: 'border-box'
      }}>
        <textarea
          ref={textareaRef}
          id="directTextInput"
          placeholder={t('sections.uploadArea.placeholder')}
          value={content}
          onChange={(e) => {
            handleContentChange(e.target.value);
            adjustTextareaHeight(e.target);
          }}
          onKeyDown={(e) => { if (isDebug()) console.log('[UploadArea] onKeyDown key=', e.key) }}
          onFocus={(e) => {
            if (isDebug()) console.log('[UploadArea] React onFocus');
            e.target.parentElement.style.borderColor = 'rgba(255, 255, 255, 0.7)';
          }}
          onBlur={(e) => {
            if (isDebug()) console.log('[UploadArea] React onBlur');
            e.target.parentElement.style.borderColor = 'rgba(255, 255, 255, 0.3)';
          }}
          style={{
            width: '100%',
            minHeight: '300px',
            border: 'none',
            background: 'transparent',
            color: 'var(--text-primary)',
            padding: '12px',
            outline: 'none',
            fontSize: '16px',
            lineHeight: '24px',
            fontFamily: 'inherit',
            boxSizing: 'border-box',
            display: 'block',
            overflow: 'hidden',
            whiteSpace: 'pre-wrap',
            wordWrap: 'break-word',
            resize: 'none'
          }}
        />
      </div>
      
      <div className="upload-buttons-grid" style={{ marginTop: '10px' }}>
        {/* Dictée vocale - toujours visible (utile pour dicter le prompt en mode image/vidéo) */}
        <button 
          className={`upload-btn-large ${isDictating ? 'active' : ''}`}
          onClick={handleDictationToggle}
          title={isImageMode ? 'Dicter le prompt' : t('sections.uploadArea.buttons.dictationTooltip')}
        >
          <i className="fas fa-microphone"></i>
          <div className="tooltip-text">{isImageMode ? 'Dicter le prompt' : t('sections.uploadArea.buttons.dictation')}</div>
        </button>
        
        {/* Enregistrement audio - masqué en mode image sauf WAN */}
        {(!isImageMode || isWanVideoMode) && (
          <button 
            className={`upload-btn-large ${isRecording ? 'active' : ''}`}
            onClick={handleRecordingToggle}
            title={isWanVideoMode ? 'Enregistrer audio de référence' : t('sections.uploadArea.buttons.recordingTooltip')}
          >
            <i className="fas fa-wave-square"></i>
            <div className="tooltip-text">{isWanVideoMode ? 'Audio référence' : t('sections.uploadArea.buttons.recording')}</div>
          </button>
        )}
        
        {/* BOUTONS SPÉCIFIQUES WAN 2.6 */}
        {isWanVideoMode && (
          <>
            {/* Upload vidéo de référence */}
            <button 
              className="upload-btn-large upload-btn-video" 
              onClick={() => document.getElementById('videoFileInput').click()}
              title="Ajouter une vidéo de référence (pour Video-to-Video)"
              style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)' }}
            >
              <i className="fas fa-video"></i>
              <div className="tooltip-text">Vidéo référence</div>
            </button>
            
            {/* Upload image de référence */}
            <button 
              className="upload-btn-large upload-btn-image" 
              onClick={() => document.getElementById('imageFileInput').click()}
              title="Ajouter une image de référence (pour Image-to-Video)"
              style={{ background: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)' }}
            >
              <i className="fas fa-image"></i>
              <div className="tooltip-text">Image référence</div>
            </button>
            
            {/* Upload audio de référence */}
            <button 
              className="upload-btn-large upload-btn-audio" 
              onClick={() => document.getElementById('audioFileInput').click()}
              title="Ajouter un audio de référence"
              style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)' }}
            >
              <i className="fas fa-music"></i>
              <div className="tooltip-text">Audio référence</div>
            </button>
          </>
        )}
        
        {/* Pièces jointes - en mode image avec support référence, devient "Images de référence" */}
        {/* Masqué pour SeedDream text-to-image et WAN (qui a ses propres boutons) */}
        {!isWanVideoMode && (supportsReferenceImages || !isImageMode) && (
          <button className="upload-btn-large" onClick={handleFileUpload} title={supportsReferenceImages ? 'Ajouter des images de référence' : t('sections.uploadArea.buttons.attachTooltip')}>
            <i className={supportsReferenceImages ? 'fas fa-images' : 'fas fa-paperclip'}></i>
            <div className="tooltip-text">{supportsReferenceImages ? 'Images de référence' : t('sections.uploadArea.buttons.attach')}</div>
          </button>
        )}
        
        {/* Extraire du web - masqué en mode image */}
        {!isImageMode && (
          <button className="upload-btn-large" onClick={handleExtractFromWeb} title={t('sections.uploadArea.buttons.extractTooltip')}>
            <i className="fas fa-globe"></i>
            <div className="tooltip-text">{t('sections.uploadArea.buttons.extract')}</div>
          </button>
        )}
      </div>

      {/* Input fichier standard */}
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        accept={isImageMode && !isWanVideoMode ? ".jpg,.jpeg,.png,.gif,.webp,.bmp" : ".txt,.pdf,.docx,.pptx,.xlsx,.html,.htm,.xlf,.xliff,.md,.jpg,.jpeg,.png,.gif,.wav,.mp3,.aac,.aiff,.flac,.epub,.mp4,.mov,.webm,.avi"}
        multiple
        onChange={handleFileSelect}
      />
      
      {/* Inputs fichiers spécifiques WAN 2.6 */}
      {isWanVideoMode && (
        <>
          <input
            type="file"
            id="videoFileInput"
            style={{ display: 'none' }}
            accept=".mp4,.mov,.webm,.avi,.mkv"
            onChange={handleFileSelect}
          />
          <input
            type="file"
            id="imageFileInput"
            style={{ display: 'none' }}
            accept=".jpg,.jpeg,.png,.gif,.webp,.bmp"
            onChange={handleFileSelect}
          />
          <input
            type="file"
            id="audioFileInput"
            style={{ display: 'none' }}
            accept=".mp3,.wav,.aac,.flac,.ogg,.m4a"
            onChange={handleFileSelect}
          />
        </>
      )}
      
      {/* Liste des fichiers joints */}
      {attachedFiles.length > 0 && (
        <div style={{
          marginTop: '15px',
          padding: '12px',
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '8px',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <div style={{
            fontSize: '14px',
            fontWeight: '600',
            marginBottom: '10px',
            color: 'var(--text-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '8px',
            flexWrap: 'wrap'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <i className={supportsReferenceImages ? 'fas fa-images' : 'fas fa-paperclip'}></i>
              {supportsReferenceImages ? 'Images de référence' : t('sections.uploadArea.attachedFiles')} ({attachedFiles.length})
            </div>
          </div>
          
          {/* En mode images de référence : grille 2 colonnes (1ʳᵉ à gauche, 2ᵉ à droite) */}
          <style>{`
            .reference-files-grid {
              display: grid;
              grid-template-columns: repeat(2, minmax(0, 1fr));
              gap: 8px;
            }
            @media (max-width: 720px) {
              .reference-files-grid {
                grid-template-columns: 1fr;
              }
            }
          `}</style>
          <div
            className={supportsReferenceImages ? 'reference-files-grid' : undefined}
            style={supportsReferenceImages ? undefined : { display: 'flex', flexDirection: 'column', gap: '8px' }}
          >
            {attachedFiles.map((file, index) => {
              const isImage = file.type?.startsWith('image/');
              return (
              <div key={file.id} style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                padding: supportsReferenceImages ? '8px' : '8px 12px',
                background: 'rgba(255, 255, 255, 0.03)',
                borderRadius: '6px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                transition: 'all 0.2s ease',
                gap: supportsReferenceImages ? '10px' : '12px',
                minWidth: 0
              }}>
                {/* Vignette + numéro à gauche (84px = 120px - 30%) */}
                <div style={{ position: 'relative', flexShrink: 0, width: '84px' }}>
                  {isImage && (file.dataUrl || file.base64 || file.url) ? (
                    <img
                      src={file.dataUrl || file.base64 || file.url}
                      alt={file.name}
                      style={{ width: '84px', height: '84px', objectFit: 'cover', borderRadius: '8px', display: 'block' }}
                    />
                  ) : (
                    <div style={{
                      width: '84px',
                      height: '84px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: 'rgba(255, 255, 255, 0.05)',
                      borderRadius: '8px'
                    }}>
                      <i className={`fas fa-file${file.type?.includes('pdf') ? '-pdf' : file.type?.includes('image') ? '-image' : ''}`}
                         style={{ color: '#ff6b35', fontSize: '24px' }}></i>
                    </div>
                  )}
                  {supportsReferenceImages && isImage && (
                    <span style={{ position: 'absolute', top: '-5px', left: '-5px', background: '#ff6b2c', color: 'white', borderRadius: '50%', width: '20px', height: '20px', fontSize: '11px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                      {index + 1}
                    </span>
                  )}
                  <div
                    title={file.name}
                    style={{
                      width: '84px',
                      marginTop: '4px',
                      fontSize: '10px',
                      color: 'rgba(255, 255, 255, 0.65)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      textAlign: 'center'
                    }}
                  >
                    {file.name}
                  </div>
                </div>
                
                {/* Options à droite : coches rondes au-dessus, slider en dessous */}
                {supportsReferenceImages && isImage ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
                    {/* Coches rondes Style, Décor, Sujet */}
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      {['style', 'decor', 'sujet'].map(role => (
                        <label key={role} style={{ 
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '11px', 
                          color: file.roles?.includes(role) ? '#ff6b2c' : 'rgba(255,255,255,0.7)',
                          cursor: 'pointer'
                        }}>
                          <input
                            type="checkbox"
                            checked={file.roles?.includes(role) || false}
                            onChange={(e) => {
                              const newRoles = file.roles ? [...file.roles] : [];
                              if (e.target.checked) newRoles.push(role);
                              else { const idx = newRoles.indexOf(role); if (idx > -1) newRoles.splice(idx, 1); }
                              onFileRoleChange && onFileRoleChange(file.id, newRoles);
                            }}
                            style={{ width: '16px', height: '16px', borderRadius: '50%', accentColor: '#ff6b2c', cursor: 'pointer' }}
                          />
                          {role === 'style' ? 'Style' : role === 'decor' ? 'Décor' : 'Sujet'}
                        </label>
                      ))}
                    </div>
                    {/* Slider force */}
                    {supportsStrength && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)' }}>Force:</span>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={Math.round((file.strength ?? 0.7) * 100)}
                          onChange={(e) => {
                            const newStrength = parseInt(e.target.value) / 100;
                            onFileRoleChange && onFileRoleChange(file.id, file.roles || [], newStrength);
                          }}
                          style={{ flex: 1, cursor: 'pointer', maxWidth: supportsReferenceImages ? '110px' : '150px', minWidth: 0 }}
                        />
                        <span style={{ fontSize: '11px', color: '#ff6b2c', fontWeight: 'bold', minWidth: '35px' }}>{Math.round((file.strength ?? 0.7) * 100)}%</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {file.name}
                  </div>
                )}
                
                <button
                  onClick={() => handleRemoveFile(file.id)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'rgba(255, 255, 255, 0.5)',
                    cursor: 'pointer',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    transition: 'all 0.2s ease',
                    fontSize: '14px'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = 'rgba(255, 107, 53, 0.2)';
                    e.target.style.color = '#ff6b35';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = 'transparent';
                    e.target.style.color = 'rgba(255, 255, 255, 0.5)';
                  }}
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
            )})}
          </div>

          {/* Aperçu des consignes générées à partir des rôles et de la force */}
          {['seedream-text-to-image', 'seedream-edit', 'nano-banana', 'gpt-image-2.6'].includes(selectedAI)
            && attachedFiles.some(f => f.type?.startsWith('image/')) && (
            <details style={{ marginTop: '8px', fontSize: '11px', color: 'var(--text-secondary, #8a8a8a)' }}>
              <summary style={{ cursor: 'pointer', userSelect: 'none' }}>
                <i className="fas fa-wand-magic-sparkles" style={{ marginRight: '4px' }}></i>
                Consignes ajoutées au prompt (rôles + influence)
              </summary>
              <pre style={{
                whiteSpace: 'pre-wrap',
                margin: '6px 0 0',
                padding: '8px',
                background: 'rgba(255, 255, 255, 0.04)',
                borderRadius: '6px',
                fontSize: '10px',
                lineHeight: 1.4,
                color: 'var(--text-primary, #ddd)'
              }}>
                {buildReferencePrompt(
                  attachedFiles
                    .filter(f => f.type?.startsWith('image/'))
                    .map(f => ({
                      roles: f.roles || [],
                      strength: typeof f.strength === 'number' ? f.strength : (imageStrength || 0.7)
                    }))
                )}
              </pre>
            </details>
          )}
        </div>
      )}
    </div>
  );
};

export default UploadArea;
