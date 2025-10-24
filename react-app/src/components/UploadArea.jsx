import { useState, useRef, useEffect, useCallback } from 'react';
import MediaAISelector from './MediaAISelector';
import { useAssistantAutoSave } from '../hooks/useLocalStorage';
import { getHomeText } from '../i18n/homeTranslations';

const UploadArea = ({ content, onContentChange, onFilesChange, onAIConfigChange, onRecordingToggle, onDictationToggle }) => {
  const { autoSaveData } = useAssistantAutoSave();
  const userLanguage = autoSaveData.language || 'fr';
  const t = (path) => getHomeText(userLanguage, path);
  
  const [isRecording, setIsRecording] = useState(false);
  const [isDictating, setIsDictating] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState([]);
  const [aiConfig, setAiConfig] = useState(null);
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);
  const recognitionRef = useRef(null);

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

  // Dictée vocale avec Wispr Flow ou Web Speech API
  const handleDictationToggle = async () => {
    if (!isDictating) {
      // Démarrer Wispr Flow
      try {
        // Vérifier si Wispr Flow est disponible
        if (window.wisprFlow) {
          console.log('🎤 Démarrage Wispr Flow...');
          const result = await window.wisprFlow.startDictation({
            language: 'fr-FR',
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
      
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        recognitionRef.current = null;
      }
      
      setIsDictating(false);
      onDictationToggle();
    }
  };
  
  // Fallback sur Web Speech API native
  const startNativeSpeechRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.lang = 'fr-FR';
    recognition.continuous = true;
    recognition.interimResults = true;
    
    let finalTranscript = '';
    
    recognition.onresult = (event) => {
      let interimTranscript = '';
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' ';
        } else {
          interimTranscript += transcript;
        }
      }
      
      const existingContent = content ? content + ' ' : '';
      handleContentChange(existingContent + finalTranscript + interimTranscript);
    };
    
    recognition.onerror = (event) => {
      console.error('Erreur de reconnaissance vocale:', event.error);
      setIsDictating(false);
      onDictationToggle();
    };
    
    recognition.onend = () => {
      if (isDictating) {
        // Redémarrer si toujours actif
        recognition.start();
      } else {
        setIsDictating(false);
        onDictationToggle();
      }
    };
    
    recognition.start();
    recognitionRef.current = recognition;
    setIsDictating(true);
    onDictationToggle();
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

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      // Ajouter les fichiers à la liste des pièces jointes
      const newFiles = files.map(file => ({
        id: Date.now() + Math.random(),
        name: file.name,
        size: file.size,
        type: file.type,
        file: file,
        addedAt: new Date().toISOString()
      }));
      
      const updatedFiles = [...attachedFiles, ...newFiles];
      setAttachedFiles(updatedFiles);
      
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
    setAttachedFiles(updatedFiles);
    
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
        
        {/* Sélecteur d'IA par type de média */}
        <MediaAISelector onAIConfigChange={handleAIConfigChange} />
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
        <button 
          className={`upload-btn-large ${isDictating ? 'active' : ''}`}
          onClick={handleDictationToggle}
          title={t('sections.uploadArea.buttons.dictationTooltip')}
        >
          <i className="fas fa-microphone"></i>
          <div className="tooltip-text">{t('sections.uploadArea.buttons.dictation')}</div>
        </button>
        
        <button 
          className={`upload-btn-large ${isRecording ? 'active' : ''}`}
          onClick={handleRecordingToggle}
          title={t('sections.uploadArea.buttons.recordingTooltip')}
        >
          <i className="fas fa-wave-square"></i>
          <div className="tooltip-text">{t('sections.uploadArea.buttons.recording')}</div>
        </button>
        
        <button className="upload-btn-large" onClick={handleFileUpload} title={t('sections.uploadArea.buttons.attachTooltip')}>
          <i className="fas fa-paperclip"></i>
          <div className="tooltip-text">{t('sections.uploadArea.buttons.attach')}</div>
        </button>
        
        <button className="upload-btn-large" onClick={handleExtractFromWeb} title={t('sections.uploadArea.buttons.extractTooltip')}>
          <i className="fas fa-globe"></i>
          <div className="tooltip-text">{t('sections.uploadArea.buttons.extract')}</div>
        </button>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        accept=".txt,.pdf,.docx,.pptx,.xlsx,.html,.htm,.xlf,.xliff,.md,.jpg,.jpeg,.png,.gif,.wav,.mp3,.aac,.aiff,.flac,.epub"
        multiple
        onChange={handleFileSelect}
      />
      
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
            gap: '8px'
          }}>
            <i className="fas fa-paperclip"></i>
            {t('sections.uploadArea.attachedFiles')} ({attachedFiles.length})
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {attachedFiles.map(file => (
              <div key={file.id} style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 12px',
                background: 'rgba(255, 255, 255, 0.03)',
                borderRadius: '6px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                transition: 'all 0.2s ease'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
                  <i className={`fas fa-file${
                    file.type.includes('pdf') ? '-pdf' : 
                    file.type.includes('word') || file.name.endsWith('.doc') || file.name.endsWith('.docx') || file.name.endsWith('.odt') ? '-word' : 
                    file.type.includes('image') ? '-image' : 
                    file.type.includes('excel') || file.type.includes('sheet') || file.name.endsWith('.xlsx') || file.name.endsWith('.xls') ? '-excel' : 
                    file.type.includes('powerpoint') || file.type.includes('presentation') || file.name.endsWith('.ppt') || file.name.endsWith('.pptx') ? '-powerpoint' : 
                    file.type.includes('audio') || file.name.endsWith('.wav') || file.name.endsWith('.mp3') || file.name.endsWith('.aac') || file.name.endsWith('.aiff') || file.name.endsWith('.flac') ? '-audio' :
                    file.name.endsWith('.md') ? '-code' :
                    file.name.endsWith('.epub') ? '-alt' :
                    ''
                  }`} 
                     style={{ color: '#ff6b35', fontSize: '18px' }}></i>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: '14px',
                      color: 'var(--text-primary)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {file.name}
                    </div>
                    <div style={{
                      fontSize: '12px',
                      color: 'rgba(255, 255, 255, 0.5)',
                      marginTop: '2px'
                    }}>
                      {formatFileSize(file.size)}
                    </div>
                  </div>
                </div>
                
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
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadArea;
