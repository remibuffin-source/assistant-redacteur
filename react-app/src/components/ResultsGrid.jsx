import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAssistantAutoSave } from '../hooks/useLocalStorage';
import { getHomeText } from '../i18n/homeTranslations';

const ResultsGrid = ({ results = [], onDelete }) => {
  const navigate = useNavigate();
  const { autoSaveData } = useAssistantAutoSave();
  const userLanguage = autoSaveData.language || 'fr';
  const t = (path) => getHomeText(userLanguage, path);

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

  return (
    <div className="section">
      <h3 className="section-title">
        <i className="fas fa-th-large"></i>
        {t('sections.resultsManager.title')}
      </h3>
      
      {displayResults.length === 0 ? (
        <div className="no-results">
          <p>{t('sections.resultsManager.noResults')}</p>
        </div>
      ) : (
        <div className="results-grid-container">
          <div className="results-grid">
            {displayResults.map((result) => (
              /* Si c'est un document (avec documentUrl), afficher une carte de fichier au lieu d'une vignette */
              result.documentUrl && result.fileName ? (
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
    </div>
  );
};

export default ResultsGrid;
