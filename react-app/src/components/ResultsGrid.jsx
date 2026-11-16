import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAssistantAutoSave } from '../hooks/useLocalStorage';
import { getHomeText } from '../i18n/homeTranslations';

const ResultsGrid = ({ results = [], onDelete, isImageMode = false }) => {
  const navigate = useNavigate();
  const { autoSaveData } = useAssistantAutoSave();
  const userLanguage = autoSaveData.language || 'fr';
  const t = (path) => getHomeText(userLanguage, path);
  
  // État pour le modal d'image plein écran
  const [fullscreenImage, setFullscreenImage] = useState(null);
  
  // Gestion de la touche Échap pour fermer le modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && fullscreenImage) {
        setFullscreenImage(null);
      }
    };
    
    if (fullscreenImage) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [fullscreenImage]);

  // Données d'exemple pour les vignettes
  const exampleResults = [
    {
      id: 1,
      format: 'facebook',
      title: t('sections.exampleTitles.facebook'),
      content: t('sections.exampleContents.facebook'),
      logo: 'fab fa-facebook',
      color: '#1877F2'
    },
    {
      id: 2,
      format: 'instagram',
      title: t('sections.exampleTitles.instagram'),
      content: t('sections.exampleContents.instagram'),
      logo: 'fab fa-instagram',
      color: '#E4405F'
    },
    {
      id: 3,
      format: 'twitter',
      title: t('sections.exampleTitles.twitter'),
      content: t('sections.exampleContents.twitter'),
      logo: 'fab fa-twitter',
      color: '#1DA1F2'
    },
    {
      id: 4,
      format: 'newsletter',
      title: t('sections.exampleTitles.newsletter'),
      content: t('sections.exampleContents.newsletter'),
      logo: 'fas fa-envelope',
      color: '#FF6B35'
    },
    {
      id: 5,
      format: 'youtube',
      title: t('sections.exampleTitles.youtube'),
      content: t('sections.exampleContents.youtube'),
      logo: 'fab fa-youtube',
      color: '#FF0000'
    }
  ];

  const displayResults = results.length > 0 ? results : exampleResults;

  const handleView = (result) => {
    // Ouvrir l'éditeur dans un nouvel onglet
    const editorUrl = '/editor';
    const editorData = {
      content: result.content,
      format: result.format,
      title: result.title
    };
    
    // Stocker temporairement les données pour le nouvel onglet
    sessionStorage.setItem('editorData', JSON.stringify(editorData));
    
    // Ouvrir dans un nouvel onglet
    window.open(editorUrl, '_blank');
  };

  const handleDelete = (resultId) => {
    if (window.confirm(t('sections.resultsManager.confirmDelete'))) {
      if (onDelete) {
        onDelete(resultId);
      }
    }
  };

  const getFormatIcon = (format) => {
    const icons = {
      // Réseaux sociaux
      'post-facebook': 'fab fa-facebook',
      'post-instagram': 'fab fa-instagram',
      'post-x': 'fab fa-twitter',
      'post-linkedin': 'fab fa-linkedin',
      'video-youtube': 'fab fa-youtube',
      'video-tiktok': 'fab fa-tiktok',
      
      // Communication
      'newsletter': 'fas fa-envelope',
      'story': 'fas fa-camera',
      'reel': 'fas fa-video',
      'carousel': 'fas fa-images',
      'my-blog': 'fas fa-blog',
      'my-website': 'fas fa-globe',
      
      // Écriture
      'dialogue': 'fas fa-comments',
      'litteraire': 'fas fa-book',
      'arguments': 'fas fa-bullhorn',
      'explicatifs': 'fas fa-info-circle',
      
      // Anciens formats (compatibilité)
      facebook: 'fab fa-facebook',
      instagram: 'fab fa-instagram',
      twitter: 'fab fa-twitter',
      linkedin: 'fab fa-linkedin',
      youtube: 'fab fa-youtube',
      tiktok: 'fab fa-tiktok',
      blog: 'fas fa-blog',
      website: 'fas fa-globe'
    };
    return icons[format] || 'fas fa-file-alt';
  };

  const getFormatColor = (format) => {
    const colors = {
      // Réseaux sociaux
      'post-facebook': '#1877F2',
      'post-instagram': '#E4405F',
      'post-x': '#1DA1F2',
      'post-linkedin': '#0A66C2',
      'video-youtube': '#FF0000',
      'video-tiktok': '#000000',
      
      // Communication
      'newsletter': '#FF6B35',
      'story': '#E4405F',
      'reel': '#E4405F',
      'carousel': '#E4405F',
      'my-blog': '#FF6B35',
      'my-website': '#6B7280',
      
      // Écriture
      'dialogue': '#9B59B6',
      'litteraire': '#34495E',
      'arguments': '#F39C12',
      'explicatifs': '#3498DB',
      
      // Anciens formats (compatibilité)
      facebook: '#1877F2',
      instagram: '#E4405F',
      twitter: '#1DA1F2',
      linkedin: '#0A66C2',
      youtube: '#FF0000',
      tiktok: '#000000',
      blog: '#FF6B35',
      website: '#6B7280'
    };
    return colors[format] || '#6B7280';
  };

  // Fonction pour télécharger une image
  const handleDownloadImage = async (imageUrl, filename) => {
    try {
      const response = await fetch(imageUrl);
      let blob = await response.blob();
      
      // Si l'image est en WebP, la convertir en PNG via Canvas
      if (blob.type === 'image/webp' || imageUrl.endsWith('.webp')) {
        const img = new Image();
        const blobUrl = window.URL.createObjectURL(blob);
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
          img.src = blobUrl;
        });
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        window.URL.revokeObjectURL(blobUrl);
        blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
      }
      
      // Forcer l'extension .png dans le nom de fichier
      const dlFilename = filename.replace(/\.\w+$/, '.png');
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = dlFilename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erreur lors du téléchargement:', error);
      alert('Erreur lors du téléchargement de l\'image');
    }
  };

  // Fonction pour envoyer une image vers l'éditeur
  const handleSendImageToEditor = async (result) => {
    try {
      const token = localStorage.getItem('token');
      let finalImageUrl = result.imageUrl;
      
      // Stocker l'image sur le serveur si c'est une URL externe (Fal.ai)
      if (token && result.imageUrl && !result.imageUrl.includes('api.assistant-redacteur.fr')) {
        try {
          const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://api.assistant-redacteur.fr';
          const storeResponse = await fetch(`${API_BASE_URL}/ai/image/store`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              imageUrl: result.imageUrl,
              prompt: result.content || '',
              originalId: result.id
            })
          });
          
          if (storeResponse.ok) {
            const storeData = await storeResponse.json();
            if (storeData.success && storeData.storedUrl) {
              finalImageUrl = storeData.storedUrl;
              console.log('✅ Image stockée sur le serveur:', finalImageUrl);
            }
          }
        } catch (storeError) {
          console.warn('⚠️ Impossible de stocker l\'image sur le serveur, utilisation de l\'URL originale:', storeError);
        }
      }
      
      // Utiliser la vignette si disponible, sinon l'image complète
      const vignetteUrl = result.vignetteUrl || finalImageUrl.replace(/\.(\w+)$/, '_vignette.$1');
      
      // Stocker l'image dans le localStorage pour la récupérer dans l'éditeur
      const imageData = {
        id: result.id,
        imageUrl: finalImageUrl,
        vignetteUrl: vignetteUrl,
        prompt: result.content || '',
        createdAt: new Date().toISOString()
      };
      
      // Sauvegarder dans localStorage
      localStorage.setItem('pendingEditorImage', JSON.stringify(imageData));
      
      // Naviguer vers l'éditeur avec la vignette pour l'affichage
      navigate('/editor', { state: { imageToInsert: imageData } });
    } catch (error) {
      console.error('Erreur lors de l\'envoi vers l\'éditeur:', error);
      alert('Erreur lors de l\'envoi vers l\'éditeur');
    }
  };

  // Fonction pour envoyer une image vers le calendrier
  const handleSendImageToCalendar = async (result) => {
    try {
      const token = localStorage.getItem('token');
      let finalImageUrl = result.imageUrl;
      
      // Stocker l'image sur le serveur si c'est une URL externe
      if (token && result.imageUrl && !result.imageUrl.includes('api.assistant-redacteur.fr')) {
        try {
          const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://api.assistant-redacteur.fr';
          const storeResponse = await fetch(`${API_BASE_URL}/ai/image/store`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              imageUrl: result.imageUrl,
              prompt: result.content || '',
              originalId: result.id
            })
          });
          
          if (storeResponse.ok) {
            const storeData = await storeResponse.json();
            if (storeData.success && storeData.storedUrl) {
              finalImageUrl = storeData.storedUrl;
            }
          }
        } catch (storeError) {
          console.warn('⚠️ Impossible de stocker l\'image:', storeError);
        }
      }
      
      // Utiliser la vignette si disponible
      const vignetteUrl = result.vignetteUrl || finalImageUrl.replace(/\.(\w+)$/, '_vignette.$1');
      
      // Créer une publication avec l'image
      const imagePublication = {
        id: Date.now(),
        title: `Image - ${new Date().toLocaleDateString('fr-FR')}`,
        content: result.content || '',
        imageUrl: finalImageUrl,
        vignetteUrl: vignetteUrl,
        prompt: result.content || '',
        publishDate: new Date().toISOString(),
        platforms: ['instagram', 'facebook'],
        type: 'image'
      };
      
      // Stocker dans localStorage pour le calendrier
      localStorage.setItem('pendingCalendarImage', JSON.stringify(imagePublication));
      
      // Ouvrir le calendrier dans une nouvelle fenêtre
      window.open('/calendar', '_blank', 'width=1400,height=900,menubar=no,toolbar=no,location=no,status=no');
    } catch (error) {
      console.error('Erreur lors de l\'envoi vers le calendrier:', error);
      alert('Erreur lors de l\'envoi vers le calendrier');
    }
  };

  return (
    <div className="section">
      <h3 className="section-title">
        <i className={isImageMode ? "fas fa-images" : "fas fa-th-large"}></i>
        {isImageMode ? 'Gestion des images' : t('sections.resultsManager.title')}
      </h3>
      
      {displayResults.length === 0 ? (
        <div className="no-results">
          <p>{t('sections.resultsManager.noResults')}</p>
        </div>
      ) : (
        <div className="results-grid-container">
          <div className="results-grid">
            {displayResults.map((result) => (
              /* Si c'est une vidéo WAN ou Veo */
              result.isVideo ? (
                <div key={result.id} className="video-card">
                  <div className="vignette-header">
                    <div className="format-info">
                      <i className="fas fa-video" style={{color: '#ff6b2c'}}></i>
                      <span className="format-title">
                        {result.provider === 'veo' || result.aiProvider === 'veo-3.1' ? 'Veo 3.1' : 'WAN 2.6'}
                      </span>
                    </div>
                    <div className="vignette-actions">
                      {result.videoUrl && (
                        <>
                          <a href={result.videoUrl} download={`wan-video-${result.id}.mp4`} className="action-btn view-btn" title="Télécharger">
                            <i className="fas fa-download"></i>
                          </a>
                          <button 
                            className="action-btn edit-btn" 
                            onClick={() => window.open(result.videoUrl, '_blank')}
                            title="Ouvrir dans un nouvel onglet"
                            style={{background: 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)'}}
                          >
                            <i className="fas fa-external-link-alt"></i>
                          </button>
                        </>
                      )}
                      <button 
                        className="action-btn delete-btn" 
                        onClick={() => handleDelete(result.id)}
                        title={t('sections.resultsManager.actions.delete')}
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                  </div>
                  
                  {/* Affichage selon le statut */}
                  {result.status === 'processing' || result.status === 'queuing' ? (
                    <div style={{
                      padding: '40px',
                      textAlign: 'center',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      borderRadius: '8px',
                      color: 'white'
                    }}>
                      <i className="fas fa-spinner fa-spin" style={{fontSize: '48px', marginBottom: '20px'}}></i>
                      <p style={{fontSize: '16px', fontWeight: '500', marginBottom: '10px'}}>{result.progress}</p>
                      <p style={{fontSize: '14px', opacity: 0.9}}>Task ID: {result.taskId}</p>
                      <p style={{fontSize: '12px', opacity: 0.7, marginTop: '10px'}}>Vérification automatique toutes les 10 secondes...</p>
                    </div>
                  ) : result.status === 'success' && result.videoUrl ? (
                    <div style={{position: 'relative'}}>
                      <video 
                        src={result.videoUrl} 
                        controls 
                        style={{
                          width: '100%',
                          borderRadius: '8px',
                          maxHeight: '400px'
                        }}
                      />
                      <div style={{
                        marginTop: '10px',
                        padding: '10px',
                        background: '#f0fdf4',
                        borderRadius: '6px',
                        fontSize: '14px',
                        color: '#166534'
                      }}>
                        <i className="fas fa-check-circle"></i> Vidéo générée avec succès
                      </div>
                    </div>
                  ) : result.status === 'failed' ? (
                    <div style={{
                      padding: '40px',
                      textAlign: 'center',
                      background: '#fee2e2',
                      borderRadius: '8px',
                      color: '#991b1b'
                    }}>
                      <i className="fas fa-exclamation-triangle" style={{fontSize: '48px', marginBottom: '20px'}}></i>
                      <p style={{fontSize: '16px', fontWeight: '500'}}>Échec de la génération</p>
                      <p style={{fontSize: '14px', marginTop: '10px'}}>Task ID: {result.taskId}</p>
                    </div>
                  ) : (
                    <div style={{
                      padding: '40px',
                      textAlign: 'center',
                      background: '#f3f4f6',
                      borderRadius: '8px'
                    }}>
                      <i className="fas fa-hourglass-half" style={{fontSize: '48px', marginBottom: '20px', color: '#6b7280'}}></i>
                      <p style={{fontSize: '16px', fontWeight: '500', color: '#374151'}}>En attente...</p>
                    </div>
                  )}
                  
                  {/* Prompt utilisé */}
                  {result.content && (
                    <div style={{
                      marginTop: '15px',
                      padding: '12px',
                      background: '#f9fafb',
                      borderRadius: '6px',
                      fontSize: '13px',
                      color: '#4b5563',
                      borderLeft: '3px solid #ff6b2c'
                    }}>
                      <strong>Prompt:</strong> {result.content.substring(0, 100)}{result.content.length > 100 ? '...' : ''}
                    </div>
                  )}
                </div>
              ) : result.imageUrl ? (
                <div key={result.id} className="image-card">
                  {/* Header avec actions en haut (comme pour le texte) */}
                  <div className="vignette-header">
                    <div className="format-info">
                      {/* Afficher le logo de l'IA utilisée */}
                      {result.aiProvider === 'seedream-v4' || result.aiProvider === 'seedream' || result.aiProvider === 'seedream-edit' || result.aiProvider === 'seedream-text-to-image' ? (
                        <span style={{display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '24px', height: '24px', background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', borderRadius: '4px', color: 'white', fontSize: '12px', fontWeight: 'bold'}}>SD</span>
                      ) : result.aiProvider === 'nano-banana' || result.aiProvider === 'google/gemini-2.5-flash-image' ? (
                        <span style={{display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '24px', height: '24px', background: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)', borderRadius: '4px', fontSize: '14px'}}>🍌</span>
                      ) : (typeof result.aiProvider === 'string' && result.aiProvider.startsWith('gpt-image')) ? (
                        <span style={{display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '24px', height: '24px', background: 'linear-gradient(135deg, #10a37f 0%, #1a7f64 100%)', borderRadius: '4px', color: 'white', fontSize: '10px', fontWeight: 'bold'}}>GPT</span>
                      ) : (
                        <i className="fas fa-image"></i>
                      )}
                      <span className="format-title">{
                        result.aiProvider === 'seedream-v4' || result.aiProvider === 'seedream' || result.aiProvider === 'seedream-edit' || result.aiProvider === 'seedream-text-to-image' ? 'SeedDream' :
                        result.aiProvider === 'nano-banana' || result.aiProvider === 'google/gemini-2.5-flash-image' ? 'Nano Banana' :
                        (typeof result.aiProvider === 'string' && result.aiProvider.startsWith('gpt-image')) ? 'GPT Image' :
                        ''
                      }</span>
                    </div>
                    <div className="vignette-actions">
                      <button 
                        className="action-btn edit-btn" 
                        onClick={() => handleSendImageToEditor(result)}
                        title="Envoyer vers l'éditeur"
                        style={{background: 'linear-gradient(135deg, #ff6b2c 0%, #ff8f5a 100%)'}}
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                      <button 
                        className="action-btn calendar-btn" 
                        onClick={() => handleSendImageToCalendar(result)}
                        title="Programmer dans le calendrier"
                        style={{background: 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)'}}
                      >
                        <i className="fas fa-calendar-plus"></i>
                      </button>
                      <button 
                        className="action-btn view-btn" 
                        onClick={() => handleDownloadImage(result.imageUrl, `generation-${result.id}.png`)}
                        title="Télécharger"
                      >
                        <i className="fas fa-download"></i>
                      </button>
                      <button 
                        className="action-btn delete-btn" 
                        onClick={() => handleDelete(result.id)}
                        title={t('sections.resultsManager.actions.delete')}
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                  </div>
                  {/* Image cliquable pour agrandir */}
                  <img 
                    src={result.imageUrl} 
                    alt="Génération IA" 
                    className="generated-image" 
                    onClick={() => setFullscreenImage(result.imageUrl)}
                    title="Cliquer pour agrandir"
                  />
                  {/* Afficher le seed si disponible */}
                  {result.seed && (
                    <div style={{
                      padding: '4px 8px',
                      fontSize: '11px',
                      color: 'rgba(255,255,255,0.5)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      cursor: 'pointer'
                    }}
                    onClick={() => {
                      navigator.clipboard.writeText(String(result.seed));
                      alert(`Seed ${result.seed} copié !`);
                    }}
                    title="Cliquer pour copier le seed"
                    >
                      <i className="fas fa-dice" style={{fontSize: '10px'}}></i>
                      Seed: {result.seed}
                      <i className="fas fa-copy" style={{fontSize: '9px', marginLeft: '2px'}}></i>
                    </div>
                  )}
                </div>
              ) : result.documentUrl && result.fileName ? (
                <div key={result.id} className="file-card" style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '12px',
                  padding: '30px',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '20px',
                  minHeight: '280px',
                  position: 'relative',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                  border: '2px solid transparent'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 4px 16px rgba(255, 107, 44, 0.2)';
                  e.currentTarget.style.borderColor = '#ff6b2c';
                  e.currentTarget.style.transform = 'translateY(-4px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
                  e.currentTarget.style.borderColor = 'transparent';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
                >
                  {/* Bouton de suppression en haut à droite */}
                  <button 
                    className="action-btn delete-btn" 
                    onClick={() => handleDelete(result.id)}
                    title={t('sections.resultsManager.actions.delete')}
                    style={{
                      position: 'absolute',
                      top: '10px',
                      right: '10px',
                      backgroundColor: '#ff4444',
                      color: 'white',
                      border: 'none',
                      borderRadius: '50%',
                      width: '32px',
                      height: '32px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#cc0000';
                      e.currentTarget.style.transform = 'scale(1.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#ff4444';
                      e.currentTarget.style.transform = 'scale(1)';
                    }}
                  >
                    <i className="fas fa-trash"></i>
                  </button>

                  {/* Icône de fichier 48px */}
                  <div style={{
                    fontSize: '48px',
                    color: '#ff6b2c'
                  }}>
                    <i className="fas fa-file-pdf"></i>
                  </div>
                  
                  {/* Nom du fichier */}
                  <div style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    color: '#333',
                    textAlign: 'center',
                    wordBreak: 'break-word',
                    maxWidth: '100%'
                  }}>
                    {result.fileName}
                  </div>
                  
                  {/* Type de fichier */}
                  <div style={{
                    fontSize: '13px',
                    color: '#666',
                    backgroundColor: '#f0f0f0',
                    padding: '4px 12px',
                    borderRadius: '12px',
                    fontWeight: '500'
                  }}>
                    {result.fileName.split('.').pop().toUpperCase()}
                  </div>
                  
                  {/* Bouton de téléchargement */}
                  <a
                    href={result.documentUrl}
                    download={`traduit_${result.fileName}`}
                    onClick={(e) => e.stopPropagation()}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '12px 24px',
                      backgroundColor: '#ff6b2c',
                      color: 'white',
                      textDecoration: 'none',
                      borderRadius: '8px',
                      fontWeight: '600',
                      fontSize: '14px',
                      transition: 'all 0.3s ease',
                      boxShadow: '0 2px 8px rgba(255, 107, 44, 0.3)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#ff5a1a';
                      e.currentTarget.style.transform = 'scale(1.05)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(255, 107, 44, 0.4)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#ff6b2c';
                      e.currentTarget.style.transform = 'scale(1)';
                      e.currentTarget.style.boxShadow = '0 2px 8px rgba(255, 107, 44, 0.3)';
                    }}
                  >
                    <i className="fas fa-download"></i>
                    <span>Télécharger</span>
                  </a>
                  
                  {/* Badge DeepL */}
                  <div style={{
                    fontSize: '11px',
                    color: '#999',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    <i className="fas fa-language"></i>
                    <span>Traduction DeepL</span>
                  </div>
                </div>
              ) : (
                /* Sinon, afficher la vignette normale */
                <div key={result.id} className="result-vignette">
                  <div className="vignette-header">
                    <div className="format-info">
                      <i 
                        className={getFormatIcon(result.format)} 
                        style={{ color: getFormatColor(result.format) }}
                      ></i>
                      <span className="format-title">{result.title}</span>
                    </div>
                    <div className="vignette-actions">
                      <button 
                        className="action-btn view-btn" 
                        onClick={() => handleView(result)}
                        title={t('sections.resultsManager.actions.view')}
                      >
                        <i className="fas fa-eye"></i>
                      </button>
                      <button 
                        className="action-btn delete-btn" 
                        onClick={() => handleDelete(result.id)}
                        title={t('sections.resultsManager.actions.delete')}
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                  </div>
                  
                  <div className="vignette-content">
                    <div
                      className="content-preview"
                      style={{ color: '#000000', background: '#ffffff' }}
                    >
                      {result.content}
                    </div>
                  </div>
                  
                  <div className="vignette-footer">
                    <div className="content-stats">
                      <span className="stat">
                        <i className="fas fa-font"></i>
                        {result.content.split(' ').length} {t('sections.resultsManager.stats.words')}
                      </span>
                      <span className="stat">
                        <i className="fas fa-clock"></i>
                        {Math.ceil(result.content.length / 1000)} {t('sections.resultsManager.stats.min')}
                      </span>
                    </div>
                  </div>
                </div>
              )
            ))}
          </div>
        </div>
      )}
      
      {/* Modal pour afficher l'image en plein écran */}
      {fullscreenImage && (
        <div 
          className="image-modal-overlay" 
          onClick={() => setFullscreenImage(null)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            cursor: 'pointer'
          }}
        >
          <button 
            onClick={(e) => { e.stopPropagation(); setFullscreenImage(null); }}
            style={{
              position: 'fixed',
              top: '30px',
              right: '30px',
              background: 'rgba(255, 107, 44, 0.9)',
              border: '2px solid white',
              borderRadius: '50%',
              width: '60px',
              height: '60px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 10002,
              boxShadow: '0 4px 20px rgba(0,0,0,0.5)'
            }}
          >
            <i className="fas fa-times" style={{ fontSize: '28px', color: 'white', pointerEvents: 'none' }}></i>
          </button>
          <img 
            src={fullscreenImage} 
            alt="Image en plein écran" 
            className="image-modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '90vw',
              maxHeight: '90vh',
              objectFit: 'contain',
              borderRadius: '8px',
              cursor: 'default'
            }}
          />
        </div>
      )}
    </div>
  );
};

export default ResultsGrid;
