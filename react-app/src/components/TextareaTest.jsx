import React, { useRef, useEffect, useState } from 'react';

// Styles globaux pour masquer les barres de défilement
const styles = `
  .auto-resize-textarea {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  .auto-resize-textarea::-webkit-scrollbar {
    display: none;
    width: 0;
    height: 0;
  }
`;

// Ajouter les styles globaux
const styleElement = document.createElement('style');
styleElement.textContent = styles;
document.head.appendChild(styleElement);

// Solution simple et fiable inspirée des éditeurs de chat
const TextareaTest = () => {
  const textareaRef = useRef(null);
  const [content, setContent] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  
  // Fonction pour ajuster la hauteur
  const adjustHeight = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    
    // Sauvegarder la position du curseur
    const cursorPosition = textarea.selectionStart;
    
    // Réinitialiser la hauteur
    textarea.style.height = 'auto';
    
    // Définir la nouvelle hauteur (avec minimum de 3 lignes)
    textarea.style.height = 'auto';
    const newHeight = Math.max(72, textarea.scrollHeight); // 72px = 3 lignes de 24px
    textarea.style.height = `${newHeight}px`;
    
    // Restaurer la position du curseur
    textarea.setSelectionRange(cursorPosition, cursorPosition);
  };
  
  // Gérer le changement de contenu
  const handleChange = (e) => {
    setContent(e.target.value);
    // Utiliser requestAnimationFrame pour s'assurer que le DOM est mis à jour
    requestAnimationFrame(() => {
      adjustHeight();
    });
  };
  
  // Ajuster la hauteur au chargement et au redimensionnement
  useEffect(() => {
    adjustHeight();
    
    const handleResize = () => adjustHeight();
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div style={{
      maxWidth: '800px',
      margin: '40px auto',
      padding: '20px',
      backgroundColor: '#1a1a1a',
      borderRadius: '8px',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h2 style={{ 
        color: '#ff6b2c', 
        textAlign: 'center',
        marginBottom: '30px'
      }}>
        Test de Zone de Texte Auto-ajustable
      </h2>
      
      <div style={{
        marginBottom: '20px',
        padding: '15px',
        backgroundColor: '#2a2a2a',
        borderRadius: '6px',
        border: '1px solid #333',
        width: '100%',
        boxSizing: 'border-box'
      }}>
        <p style={{ color: '#ddd', marginBottom: '10px' }}>
          Tapez dans la zone de texte ci-dessous. Elle doit s'agrandir automatiquement pour s'adapter au contenu.
        </p>
        
        <div style={{
          position: 'relative',
          width: '100%',
          boxSizing: 'border-box'
        }}>
          <div style={{
            position: 'relative',
            width: '100%',
            minHeight: '72px',
            backgroundColor: 'rgba(0, 0, 0, 0.2)',
            borderRadius: '4px',
            border: `1px solid ${isFocused ? '#ff8c5a' : '#ff6b2c'}`,
            transition: 'border-color 0.2s ease',
            overflow: 'hidden'
          }}>
            <textarea
              className="auto-resize-textarea"
              ref={textareaRef}
              value={content}
              placeholder="Tapez quelque chose..."
              onChange={handleChange}
              style={{
                width: '100%',
                minHeight: '72px',
                resize: 'none',
                overflow: 'hidden',
                border: 'none',
                background: 'transparent',
                color: '#ffffff',
                padding: '12px',
                outline: 'none',
                fontSize: '16px',
                lineHeight: '24px',
                boxSizing: 'border-box',
                display: 'block',
                fontFamily: 'Arial, sans-serif',
                margin: 0,
                WebkitAppearance: 'none',
                MozAppearance: 'none',
                appearance: 'none'
              }}
              rows={3}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
            />
          </div>
        </div>
      </div>
      
      <div style={{
        marginTop: '30px',
        padding: '15px',
        backgroundColor: '#2a2a2a',
        borderRadius: '6px',
        border: '1px solid #333'
      }}>
        <h3 style={{ color: '#ff8c5a', marginTop: 0 }}>Instructions :</h3>
        <ul style={{
          color: '#ddd',
          paddingLeft: '20px',
          margin: '10px 0 0 0'
        }}>
          <li>La zone de texte doit avoir une hauteur minimale de 3 lignes</li>
          <li>Elle doit s'agrandir automatiquement quand vous tapez du texte</li>
          <li>Les barres de défilement ne doivent pas apparaître</li>
          <li>Le texte doit être bien lisible avec un bon contraste</li>
        </ul>
      </div>
    </div>
  );
};

export default TextareaTest;
