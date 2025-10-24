import { useState, useRef, useEffect } from 'react';
import MenuBar from './MenuBar';
import './AdvancedEditor.css';

const AdvancedEditor = ({ content, onSave, onClose, onPublish, onSaveAsTemplate, onDelete }) => {
  const [editorContent, setEditorContent] = useState(content || '');
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [activeTool, setActiveTool] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [mediaType, setMediaType] = useState('image');
  const [webcamRecording, setWebcamRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const editorRef = useRef(null);
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordingIntervalRef = useRef(null);

  // Compteur de mots et caractères
  useEffect(() => {
    const words = editorContent.trim() ? editorContent.trim().split(/\s+/).length : 0;
    const chars = editorContent.length;
    setWordCount(words);
    setCharCount(chars);
  }, [editorContent]);

  // Fonctions de formatage de texte
  const formatText = (format) => {
    const selection = window.getSelection();
    if (selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    const selectedText = selection.toString();
    
    if (selectedText) {
      let formattedText = selectedText;
      
      switch(format) {
        case 'bold':
          formattedText = `<strong>${selectedText}</strong>`;
          break;
        case 'italic':
          formattedText = `<em>${selectedText}</em>`;
          break;
        case 'underline':
          formattedText = `<u>${selectedText}</u>`;
          break;
        case 'strike':
          formattedText = `<s>${selectedText}</s>`;
          break;
        default:
          return;
      }
      
      range.deleteContents();
      range.insertNode(document.createRange().createContextualFragment(formattedText));
      updateEditorContent();
    }
  };

  const insertList = (type) => {
    const selection = window.getSelection();
    if (selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    const listHTML = type === 'ul' ? '<ul><li>Element de liste</li></ul>' : '<ol><li>Element de liste</li></ol>';
    
    range.deleteContents();
    range.insertNode(document.createRange().createContextualFragment(listHTML));
    updateEditorContent();
  };

  const insertLink = () => {
    const url = prompt('Entrez l\'URL du lien:');
    const text = prompt('Texte du lien (optionnel):', url);
    
    if (url) {
      const linkHTML = `<a href="${url}" target="_blank">${text || url}</a>`;
      const selection = window.getSelection();
      
      if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        range.deleteContents();
        range.insertNode(document.createRange().createContextualFragment(linkHTML));
        updateEditorContent();
      }
    }
  };

  const insertEmoji = (emoji) => {
    const selection = window.getSelection();
    if (selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    range.deleteContents();
    range.insertNode(document.createTextNode(emoji));
    updateEditorContent();
    setShowEmojiPicker(false);
  };

  const formatTextColor = (color) => {
    const selection = window.getSelection();
    if (selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    const selectedText = selection.toString();
    
    if (selectedText) {
      const coloredText = `<span style="color: ${color};">${selectedText}</span>`;
      range.deleteContents();
      range.insertNode(document.createRange().createContextualFragment(coloredText));
      updateEditorContent();
    } else {
      document.execCommand('foreColor', false, color);
      updateEditorContent();
    }
  };

  const handleImageUpload = (event) => {
    const files = event.target.files;
    if (!files.length) return;

    Array.from(files).forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const imgHTML = `<img src="${e.target.result}" alt="${file.name}" style="max-width: 100%; height: auto;">`;
          insertAtCursor(imgHTML);
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const insertMediaByURL = () => {
    const url = prompt('Entrez l\'URL du média:');
    if (!url) return;

    let mediaHTML = '';
    if (mediaType === 'image') {
      mediaHTML = `<img src="${url}" alt="Image" style="max-width: 100%; height: auto;">`;
    } else if (mediaType === 'video') {
      mediaHTML = `<video src="${url}" controls style="max-width: 100%;"></video>`;
    } else if (mediaType === 'embed') {
      const code = prompt('Collez le code d\'intégration:');
      if (code) mediaHTML = code;
    }

    if (mediaHTML) {
      insertAtCursor(mediaHTML);
    }
    setShowMediaModal(false);
  };

  const startWebcamRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      videoRef.current.srcObject = stream;
      
      mediaRecorderRef.current = new MediaRecorder(stream);
      const chunks = [];
      
      mediaRecorderRef.current.ondataavailable = (e) => chunks.push(e.data);
      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const videoHTML = `<video src="${url}" controls style="max-width: 100%;"></video>`;
        insertAtCursor(videoHTML);
      };
      
      mediaRecorderRef.current.start();
      setWebcamRecording(true);
      
      // Timer d'enregistrement
      let seconds = 0;
      recordingIntervalRef.current = setInterval(() => {
        seconds++;
        setRecordingTime(seconds);
      }, 1000);
      
    } catch (error) {
      console.error('Erreur d\'accès à la webcam:', error);
      alert('Impossible d\'accéder à la webcam. Vérifiez les permissions.');
    }
  };

  const stopWebcamRecording = () => {
    if (mediaRecorderRef.current && webcamRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setWebcamRecording(false);
      clearInterval(recordingIntervalRef.current);
      setRecordingTime(0);
    }
  };

  const insertAtCursor = (html) => {
    const selection = window.getSelection();
    if (selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    range.deleteContents();
    range.insertNode(document.createRange().createContextualFragment(html));
    updateEditorContent();
  };

  const updateEditorContent = () => {
    if (editorRef.current) {
      setEditorContent(editorRef.current.innerHTML);
    }
  };

  const handleEditorInput = () => {
    updateEditorContent();
  };

  const handleKeyDown = (e) => {
    // Ctrl+Z pour annuler
    if (e.ctrlKey && e.key === 'z') {
      e.preventDefault();
      document.execCommand('undo');
      updateEditorContent();
    }
    // Ctrl+Y pour refaire
    if (e.ctrlKey && e.key === 'y') {
      e.preventDefault();
      document.execCommand('redo');
      updateEditorContent();
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="page-container">
      <MenuBar onHelp={() => {}} />
      <div className="page-content">
        <div className="advanced-editor-modal">
          <div className="editor-container">
            {/* Header */}
            <div className="editor-header">
              <h2>Éditeur Multimédia</h2>
              <div className="editor-stats">
                <span>{wordCount} mots</span>
                <span>{charCount} caractères</span>
              </div>
              <button className="close-btn" onClick={onClose}>
                <i className="fas fa-times"></i>
              </button>
            </div>

            {/* Barre d'outils principale */}
            <div className="editor-toolbar">
              <div className="toolbar-section">
                <button onClick={() => formatText('bold')} title="Gras (Ctrl+B)">
                  <i className="fas fa-bold"></i>
                </button>
                <button onClick={() => formatText('italic')} title="Italique (Ctrl+I)">
                  <i className="fas fa-italic"></i>
                </button>
                <button onClick={() => formatText('underline')} title="Souligné (Ctrl+U)">
                  <i className="fas fa-underline"></i>
                </button>
                <button onClick={() => formatText('strike')} title="Barré">
                  <i className="fas fa-strikethrough"></i>
                </button>
              </div>

              <div className="toolbar-section">
                <button onClick={() => insertList('ul')} title="Liste à puces">
                  <i className="fas fa-list-ul"></i>
                </button>
                <button onClick={() => insertList('ol')} title="Liste numérotée">
                  <i className="fas fa-list-ol"></i>
                </button>
                <button onClick={() => document.execCommand('formatBlock', false, 'blockquote')} title="Citation">
                  <i className="fas fa-quote-right"></i>
                </button>
              </div>

              <div className="toolbar-section">
                <button onClick={insertLink} title="Lien (Ctrl+K)">
                  <i className="fas fa-link"></i>
                </button>
                <button onClick={() => setShowMediaModal(true)} title="Insérer un média">
                  <i className="fas fa-image"></i>
                </button>
                <button onClick={() => setShowEmojiPicker(!showEmojiPicker)} title="Insérer un emoji">
                  <i className="fas fa-smile"></i>
                </button>
                <button onClick={() => fileInputRef.current?.click()} title="Insérer une image">
                  <i className="fas fa-upload"></i>
                </button>
              </div>

              <div className="toolbar-section">
                <select onChange={(e) => document.execCommand('fontName', false, e.target.value)}>
                  <option value="Arial">Arial</option>
                  <option value="Times New Roman">Times New Roman</option>
                  <option value="Courier New">Courier New</option>
                  <option value="Georgia">Georgia</option>
                </select>
                <select onChange={(e) => document.execCommand('fontSize', false, e.target.value)}>
                  <option value="1">Petit</option>
                  <option value="3">Normal</option>
                  <option value="5">Grand</option>
                  <option value="7">Très grand</option>
                </select>
              </div>

              <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                accept="image/*"
                multiple
                onChange={handleImageUpload}
              />
            </div>

            {/* Zone d'édition principale */}
            <div
              ref={editorRef}
              className="editor-content"
              contentEditable
              dangerouslySetInnerHTML={{ __html: editorContent }}
              onInput={handleEditorInput}
              onKeyDown={handleKeyDown}
              placeholder="Commencez à écrire votre contenu ici..."
            />

            {/* Picker d'emojis */}
            {showEmojiPicker && (
              <div className="emoji-picker">
                <div className="emoji-grid">
                  {[
                    '😀', '😂', '😍', '🥰', '😎', '🤩', '👍', '❤️', '🔥', '✨',
                    '🎉', '💯', '🌟', '💪', '🙌', '👏', '🤝', '💡', '📚', '🎯',
                    '📝', '🔍', '💼', '🎨', '🎭', '🎬', '🎵', '🎶', '🏆', '⚡',
                    '🌈', '🌞', '🌻', '🍀', '🎁', '🎄', '🎓', '🏅', '💎', '🔮',
                    '📱', '💻', '🎮', '🏖️', '🍕', '☕', '🎂', '🚀', '🌍', '💫'
                  ].map(emoji => (
                    <button key={emoji} onClick={() => insertEmoji(emoji)} className="emoji-btn">
                      {emoji}
                    </button>
                  ))}
                </div>
                <div className="text-colors">
                  <button onClick={() => formatTextColor('#000000')} style={{color: '#000000'}} title="Noir">
                    A
                  </button>
                  <button onClick={() => formatTextColor('#FF0000')} style={{color: '#FF0000'}} title="Rouge">
                    A
                  </button>
                  <button onClick={() => formatTextColor('#0000FF')} style={{color: '#0000FF'}} title="Bleu">
                    A
                  </button>
                  <button onClick={() => formatTextColor('#008000')} style={{color: '#008000'}} title="Vert">
                    A
                  </button>
                  <button onClick={() => formatTextColor('#ff6b2c')} style={{color: '#ff6b2c'}} title="Orange">
                    A
                  </button>
                  <button onClick={() => formatTextColor('#800080')} style={{color: '#800080'}} title="Violet">
                    A
                  </button>
                  <button onClick={() => formatTextColor('#FFD700')} style={{color: '#FFD700'}} title="Jaune">
                    A
                  </button>
                  <button onClick={() => formatTextColor('#FF69B4')} style={{color: '#FF69B4'}} title="Rose">
                    A
                  </button>
                  <button onClick={() => formatTextColor('#00CED1')} style={{color: '#00CED1'}} title="Turquoise">
                    A
                  </button>
                  <button onClick={() => formatTextColor('#8B4513')} style={{color: '#8B4513'}} title="Marron">
                    A
                  </button>
                </div>
                <button className="emoji-more" onClick={() => window.open('https://emojikeyboard.top/fr/#emojis-1', '_blank')}>
                  Plus d'emojis...
                </button>
              </div>
            )}

            {/* Modal d'insertion média */}
            {showMediaModal && (
              <div className="media-modal">
                <div className="media-modal-content">
                  <h3>Insérer un média</h3>
                  <div className="media-options">
                    <label>
                      <input
                        type="radio"
                        value="image"
                        checked={mediaType === 'image'}
                        onChange={(e) => setMediaType(e.target.value)}
                      />
                      Image
                    </label>
                    <label>
                      <input
                        type="radio"
                        value="video"
                        checked={mediaType === 'video'}
                        onChange={(e) => setMediaType(e.target.value)}
                      />
                      Vidéo
                    </label>
                    <label>
                      <input
                        type="radio"
                        value="embed"
                        checked={mediaType === 'embed'}
                        onChange={(e) => setMediaType(e.target.value)}
                      />
                      Code intégration
                    </label>
                  </div>
                  <div className="media-actions">
                    <button onClick={insertMediaByURL}>Insérer par URL</button>
                    <button onClick={() => setShowMediaModal(false)}>Annuler</button>
                  </div>
                </div>
              </div>
            )}

            {/* Enregistrement webcam */}
            <div className="webcam-section">
              <h4>Enregistrement Webcam</h4>
              <div className="webcam-controls">
                {!webcamRecording ? (
                  <button onClick={startWebcamRecording} className="btn-record">
                    <i className="fas fa-video"></i> Démarrer l'enregistrement
                  </button>
                ) : (
                  <>
                    <button onClick={stopWebcamRecording} className="btn-stop">
                      <i className="fas fa-stop"></i> Arrêter ({formatTime(recordingTime)})
                    </button>
                    <video ref={videoRef} autoPlay muted className="webcam-preview" />
                  </>
                )}
              </div>
            </div>

            {/* Actions finales */}
            <div className="editor-actions">
              <button onClick={onDelete} className="btn-delete">
                <i className="fas fa-trash"></i> Supprimer
              </button>
              <button onClick={onSaveAsTemplate} className="btn-template">
                <i className="fas fa-copy"></i> Modèle
              </button>
              <button onClick={() => onSave(editorContent)} className="btn-save">
                <i className="fas fa-save"></i> Enregistrer
              </button>
              <button onClick={() => onPublish(editorContent)} className="btn-publish">
                <i className="fas fa-paper-plane"></i> Diffusion
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedEditor;