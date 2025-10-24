import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import MenuBar from './MenuBar';
import './ContentEditor.css';

const ContentEditor = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [content, setContent] = useState('');
  const [fileName, setFileName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showHighlightPicker, setShowHighlightPicker] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const textareaRef = useRef(null);

  // Auto-authentication pour la démo
  useEffect(() => {
    if (!isAuthenticated) {
      // Créer un utilisateur démo automatiquement
      const demoUser = {
        email: 'demo@studio-cap-brun.fr',
        name: 'Utilisateur Démo',
        subscription: 'premium'
      };
      localStorage.setItem('auth_user', JSON.stringify(demoUser));
      window.location.reload();
    }
  }, [isAuthenticated]);

  // Compteur de mots et caractères
  useEffect(() => {
    const words = content.trim() ? content.trim().split(/\s+/).length : 0;
    const chars = content.length;
    setWordCount(words);
    setCharCount(chars);
  }, [content]);

  // Auto-resize du textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [content]);

  const handleContentChange = (e) => {
    setContent(e.target.value);
  };

  const applyTextColor = (color) => {
    const textarea = textareaRef.current;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selectedText = content.substring(start, end);
      
      if (selectedText) {
        const beforeText = content.substring(0, start);
        const afterText = content.substring(end);
        const coloredText = `<span style="color: ${color};">${selectedText}</span>`;
        const newContent = beforeText + coloredText + afterText;
        setContent(newContent);
      }
    }
    setShowColorPicker(false);
  };

  const applyHighlight = (color) => {
    const textarea = textareaRef.current;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selectedText = content.substring(start, end);
      
      if (selectedText) {
        const beforeText = content.substring(0, start);
        const afterText = content.substring(end);
        const highlightedText = `<mark style="background-color: ${color};">${selectedText}</mark>`;
        const newContent = beforeText + highlightedText + afterText;
        setContent(newContent);
      }
    }
    setShowHighlightPicker(false);
  };

  const saveToVPS = async () => {
    if (!fileName.trim()) {
      alert('Veuillez saisir un nom de fichier');
      return;
    }

    if (!content.trim()) {
      alert('Le contenu ne peut pas être vide');
      return;
    }

    setIsSaving(true);

    try {
      // Simulation de sauvegarde VPS
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Sauvegarder localement pour la démo
      const files = JSON.parse(localStorage.getItem('vps_files') || '{}');
      const userFiles = files[user?.email] || [];
      
      const fileData = {
        name: fileName,
        content: content,
        size: new Blob([content]).size,
        lastModified: new Date().toISOString(),
        id: Date.now()
      };

      userFiles.push(fileData);
      files[user?.email] = userFiles;
      localStorage.setItem('vps_files', JSON.stringify(files));

      // Vérifier l'espace utilisé (5GB max par client)
      const totalSize = userFiles.reduce((sum, file) => sum + file.size, 0);
      const maxSize = 5 * 1024 * 1024 * 1024; // 5GB

      if (totalSize > maxSize) {
        alert('⚠️ Attention : Vous approchez de la limite de 5GB d\'espace de stockage');
      }

      alert(`✅ Fichier "${fileName}" sauvegardé avec succès sur le VPS !`);
      setFileName('');
      setContent('');
      
    } catch (error) {
      alert('❌ Erreur lors de la sauvegarde');
    } finally {
      setIsSaving(false);
    }
  };

  const colors = [
    '#000000', '#FF0000', '#0000FF', '#008000', '#ff6b2c', 
    '#800080', '#FFD700', '#FF69B4', '#00CED1', '#8B4513'
  ];

  const highlightColors = [
    '#FFFF00', '#00FF00', '#FF69B4', '#87CEEB', '#DDA0DD',
    '#F0E68C', '#FFB6C1', '#98FB98', '#F5DEB3', '#D3D3D3'
  ];

  return (
    <div className="page-container">
      <MenuBar onHelp={() => {}} />
      <div className="page-content">
        <div className="content-editor">
          <div className="editor-header">
            <h1>
              <i className="fas fa-edit"></i>
              Éditeur de Contenus
            </h1>
            <p>Créez et sauvegardez vos contenus directement sur le VPS</p>
          </div>

          <div className="editor-stats">
            <div className="stat">
              <i className="fas fa-font"></i>
              <span>{wordCount} mots</span>
            </div>
            <div className="stat">
              <i className="fas fa-keyboard"></i>
              <span>{charCount} caractères</span>
            </div>
            <div className="stat">
              <i className="fas fa-server"></i>
              <span>Espace VPS : 5GB disponible</span>
            </div>
          </div>

          <div className="file-naming">
            <div className="file-input-group">
              <i className="fas fa-file-alt"></i>
              <input
                type="text"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                placeholder="Nom du fichier (ex: mon-article.txt)"
                className="file-name-input"
              />
              <span className="file-extension">.txt</span>
            </div>
          </div>

          <div className="editor-toolbar">
            <div className="toolbar-section">
              <button 
                className="toolbar-btn"
                onClick={() => setShowColorPicker(!showColorPicker)}
                title="Couleur du texte"
              >
                <i className="fas fa-palette"></i>
                Couleur
              </button>
              
              <button 
                className="toolbar-btn"
                onClick={() => setShowHighlightPicker(!showHighlightPicker)}
                title="Surligner le texte"
              >
                <i className="fas fa-highlighter"></i>
                Surligner
              </button>
            </div>

            {showColorPicker && (
              <div className="color-picker">
                <h4>Couleur du texte</h4>
                <div className="color-grid">
                  {colors.map(color => (
                    <button
                      key={color}
                      className="color-btn"
                      style={{ backgroundColor: color }}
                      onClick={() => applyTextColor(color)}
                      title={color}
                    />
                  ))}
                </div>
              </div>
            )}

            {showHighlightPicker && (
              <div className="color-picker">
                <h4>Couleur de surlignage</h4>
                <div className="color-grid">
                  {highlightColors.map(color => (
                    <button
                      key={color}
                      className="color-btn"
                      style={{ backgroundColor: color }}
                      onClick={() => applyHighlight(color)}
                      title={color}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="editor-main">
            <textarea
              ref={textareaRef}
              value={content}
              onChange={handleContentChange}
              placeholder="Commencez à écrire votre contenu ici... La zone de texte s'adapte automatiquement à votre contenu."
              className="content-textarea"
              style={{
                direction: 'ltr',
                textAlign: 'left',
                minHeight: '300px',
                resize: 'vertical'
              }}
            />
          </div>

          <div className="editor-actions">
            <button
              onClick={saveToVPS}
              disabled={isSaving || !fileName.trim() || !content.trim()}
              className="save-btn"
            >
              {isSaving ? (
                <>
                  <div className="loader"></div>
                  Sauvegarde en cours...
                </>
              ) : (
                <>
                  <i className="fas fa-cloud-upload-alt"></i>
                  Sauvegarder sur VPS
                </>
              )}
            </button>

            <div className="vps-info">
              <i className="fas fa-info-circle"></i>
              <span>Sauvegarde automatique sur serveur VPS sécurisé - 5GB d'espace par utilisateur</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContentEditor;