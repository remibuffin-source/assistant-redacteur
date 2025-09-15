import { useState, useEffect } from 'react';
import { useAssistantAutoSave } from '../hooks/useLocalStorage';
import { useNavigate } from 'react-router-dom';
import './ResultsManagementPage.css';

const ResultsManagementPage = () => {
  const { autoSaveData } = useAssistantAutoSave();
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState('grid');
  const [selectedContent, setSelectedContent] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPlatform, setFilterPlatform] = useState('all');
  const [filterType, setFilterType] = useState('all');

  // Données de démonstration pour les résultats
  const [contents, setContents] = useState([
    {
      id: 1,
      title: 'Introduction à l\'IA générative',
      content: 'L\'intelligence artificielle générative révolutionne la création de contenu...',
      platforms: ['instagram', 'twitter', 'linkedin'],
      contentType: 'article',
      status: 'published',
      createdAt: '2024-01-15T10:30:00Z',
      publishedAt: '2024-01-16T14:00:00Z',
      metrics: { views: 1250, likes: 89, shares: 45 }
    },
    {
      id: 2,
      title: 'Les tendances marketing 2024',
      content: 'Découvrez les tendances marketing qui vont dominer cette année...',
      platforms: ['facebook', 'linkedin'],
      contentType: 'post',
      status: 'draft',
      createdAt: '2024-01-14T16:45:00Z',
      metrics: { views: 0, likes: 0, shares: 0 }
    },
    {
      id: 3,
      title: 'Guide complet du SEO',
      content: 'Optimisez votre référencement avec ces techniques éprouvées...',
      platforms: ['blog', 'website'],
      contentType: 'article',
      status: 'scheduled',
      createdAt: '2024-01-13T09:15:00Z',
      scheduledAt: '2024-01-20T10:00:00Z',
      metrics: { views: 0, likes: 0, shares: 0 }
    }
  ]);

  // Plateformes supportées
  const platforms = [
    { id: 'instagram', name: 'Instagram', icon: 'fab fa-instagram', color: '#E1306C' },
    { id: 'twitter', name: 'Twitter/X', icon: 'fab fa-twitter', color: '#1DA1F2' },
    { id: 'facebook', name: 'Facebook', icon: 'fab fa-facebook', color: '#1877F2' },
    { id: 'linkedin', name: 'LinkedIn', icon: 'fab fa-linkedin', color: '#0077B5' },
    { id: 'blog', name: 'Blog', icon: 'fas fa-blog', color: '#21759B' },
    { id: 'website', name: 'Site Web', icon: 'fas fa-globe', color: '#4CAF50' }
  ];

  // Types de contenu
  const contentTypes = [
    { id: 'post', name: 'Post', icon: 'fas fa-newspaper' },
    { id: 'article', name: 'Article', icon: 'fas fa-file-alt' },
    { id: 'video', name: 'Vidéo', icon: 'fas fa-video' },
    { id: 'story', name: 'Story', icon: 'fas fa-camera' }
  ];

  // Filtrage des contenus
  const filteredContents = contents.filter(content => {
    const matchesSearch = content.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         content.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPlatform = filterPlatform === 'all' || content.platforms.includes(filterPlatform);
    const matchesType = filterType === 'all' || content.contentType === filterType;
    
    return matchesSearch && matchesPlatform && matchesType;
  });

  const handleEditContent = (content) => {
    setSelectedContent(content);
    setIsEditing(true);
  };

  const handleSaveContent = (updatedContent) => {
    setContents(prev => prev.map(c => c.id === updatedContent.id ? updatedContent : c));
    setIsEditing(false);
    setSelectedContent(null);
  };

  const handleDeleteContent = (contentId) => {
    setContents(prev => prev.filter(c => c.id !== contentId));
    if (selectedContent?.id === contentId) {
      setIsEditing(false);
      setSelectedContent(null);
    }
  };

  const handleScheduleContent = (contentId) => {
    setContents(prev => prev.map(c => 
      c.id === contentId ? { ...c, status: 'scheduled', scheduledAt: new Date().toISOString() } : c
    ));
  };

  const handlePublishContent = (contentId) => {
    setContents(prev => prev.map(c => 
      c.id === contentId ? { ...c, status: 'published', publishedAt: new Date().toISOString() } : c
    ));
  };

  const handleExportContent = (content, format) => {
    let contentStr = '';
    
    switch(format) {
      case 'txt':
        contentStr = `${content.title}\n\n${content.content}`;
        break;
      case 'html':
        contentStr = `<h1>${content.title}</h1>\n<p>${content.content}</p>`;
        break;
      case 'json':
        contentStr = JSON.stringify(content, null, 2);
        break;
      default:
        contentStr = content.content;
    }

    const blob = new Blob([contentStr], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${content.title.replace(/\s+/g, '_')}.${format}`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const renderGridView = () => (
    <div className="grid-view">
      <div className="grid-header">
        <h3>Vue Grille des contenus</h3>
        <div className="grid-controls">
          <div className="search-box">
            <i className="fas fa-search"></i>
            <input
              type="text"
              placeholder="Rechercher un contenu..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            value={filterPlatform}
            onChange={(e) => setFilterPlatform(e.target.value)}
          >
            <option value="all">Toutes les plateformes</option>
            {platforms.map(platform => (
              <option key={platform.id} value={platform.id}>{platform.name}</option>
            ))}
          </select>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="all">Tous les types</option>
            {contentTypes.map(type => (
              <option key={type.id} value={type.id}>{type.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="content-grid">
        {filteredContents.map(content => (
          <div key={content.id} className="content-card">
            <div className="card-header">
              <div className="content-type">
                <i className={contentTypes.find(t => t.id === content.contentType)?.icon}></i>
                <span>{contentTypes.find(t => t.id === content.contentType)?.name}</span>
              </div>
              <div className={`status-badge ${content.status}`}>
                {content.status === 'published' && 'Publié'}
                {content.status === 'draft' && 'Brouillon'}
                {content.status === 'scheduled' && 'Programmé'}
              </div>
            </div>

            <div className="card-content">
              <h4 className="content-title">{content.title}</h4>
              <p className="content-preview">
                {content.content.length > 100 
                  ? `${content.content.substring(0, 100)}...` 
                  : content.content
                }
              </p>
            </div>

            <div className="card-platforms">
              {content.platforms.map(platform => (
                <i
                  key={platform}
                  className={platforms.find(p => p.id === platform)?.icon}
                  title={platforms.find(p => p.id === platform)?.name}
                  style={{ color: platforms.find(p => p.id === platform)?.color }}
                ></i>
              ))}
            </div>

            <div className="card-metrics">
              {content.metrics && (
                <>
                  <span className="metric">
                    <i className="fas fa-eye"></i>
                    {content.metrics.views}
                  </span>
                  <span className="metric">
                    <i className="fas fa-heart"></i>
                    {content.metrics.likes}
                  </span>
                  <span className="metric">
                    <i className="fas fa-share"></i>
                    {content.metrics.shares}
                  </span>
                </>
              )}
            </div>

            <div className="card-actions">
              <button
                className="btn-action"
                onClick={() => handleEditContent(content)}
                title="Modifier"
              >
                <i className="fas fa-edit"></i>
              </button>
              <button
                className="btn-action"
                onClick={() => handleExportContent(content, 'txt')}
                title="Exporter"
              >
                <i className="fas fa-download"></i>
              </button>
              {content.status === 'draft' && (
                <button
                  className="btn-action"
                  onClick={() => handleScheduleContent(content.id)}
                  title="Programmer"
                >
                  <i className="fas fa-calendar-plus"></i>
                </button>
              )}
              {content.status === 'scheduled' && (
                <button
                  className="btn-action"
                  onClick={() => handlePublishContent(content.id)}
                  title="Publier maintenant"
                >
                  <i className="fas fa-paper-plane"></i>
                </button>
              )}
              <button
                className="btn-action danger"
                onClick={() => handleDeleteContent(content.id)}
                title="Supprimer"
              >
                <i className="fas fa-trash"></i>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderEditorModal = () => (
    <div className="modal-overlay">
      <div className="modal-content large">
        <div className="modal-header">
          <h3>Éditeur de contenu</h3>
          <button className="close-btn" onClick={() => {
            setIsEditing(false);
            setSelectedContent(null);
          }}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="editor-container">
          <div className="editor-toolbar">
            <div className="toolbar-group">
              <button className="toolbar-btn" title="Gras">
                <i className="fas fa-bold"></i>
              </button>
              <button className="toolbar-btn" title="Italique">
                <i className="fas fa-italic"></i>
              </button>
              <button className="toolbar-btn" title="Souligné">
                <i className="fas fa-underline"></i>
              </button>
            </div>
            
            <div className="toolbar-group">
              <button className="toolbar-btn" title="Liste à puces">
                <i className="fas fa-list-ul"></i>
              </button>
              <button className="toolbar-btn" title="Liste numérotée">
                <i className="fas fa-list-ol"></i>
              </button>
              <button className="toolbar-btn" title="Citation">
                <i className="fas fa-quote-right"></i>
              </button>
            </div>

            <div className="toolbar-group">
              <button className="toolbar-btn" title="Lien">
                <i className="fas fa-link"></i>
              </button>
              <button className="toolbar-btn" title="Image">
                <i className="fas fa-image"></i>
              </button>
              <button className="toolbar-btn" title="Vidéo">
                <i className="fas fa-video"></i>
              </button>
            </div>

            <div className="toolbar-group">
              <select className="font-select">
                <option>Arial</option>
                <option>Times New Roman</option>
                <option>Courier New</option>
              </select>
              <select className="size-select">
                <option>12px</option>
                <option>14px</option>
                <option>16px</option>
                <option>18px</option>
                <option>24px</option>
              </select>
            </div>
          </div>

          <div className="editor-content">
            <div className="form-group">
              <label>Titre du contenu</label>
              <input
                type="text"
                value={selectedContent.title}
                onChange={(e) => setSelectedContent(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Titre de votre contenu..."
              />
            </div>

            <div className="form-group">
              <label>Contenu</label>
              <textarea
                value={selectedContent.content}
                onChange={(e) => setSelectedContent(prev => ({ ...prev, content: e.target.value }))}
                placeholder="Écrivez votre contenu ici..."
                rows="12"
                className="content-textarea"
              />
            </div>

            <div className="form-group">
              <label>Plateformes de destination</label>
              <div className="platforms-grid">
                {platforms.map(platform => (
                  <label key={platform.id} className="platform-checkbox">
                    <input
                      type="checkbox"
                      checked={selectedContent.platforms.includes(platform.id)}
                      onChange={(e) => {
                        const updatedPlatforms = e.target.checked
                          ? [...selectedContent.platforms, platform.id]
                          : selectedContent.platforms.filter(p => p !== platform.id);
                        setSelectedContent(prev => ({ ...prev, platforms: updatedPlatforms }));
                      }}
                    />
                    <div className="platform-card" style={{ borderColor: platform.color }}>
                      <i className={platform.icon} style={{ color: platform.color }}></i>
                      <span>{platform.name}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="modal-actions">
          <button
            className="btn-secondary"
            onClick={() => {
              setIsEditing(false);
              setSelectedContent(null);
            }}
          >
            Annuler
          </button>
          <div className="export-actions">
            <button
              className="btn-action"
              onClick={() => handleExportContent(selectedContent, 'txt')}
              title="Exporter en TXT"
            >
              <i className="fas fa-file-alt"></i> TXT
            </button>
            <button
              className="btn-action"
              onClick={() => handleExportContent(selectedContent, 'html')}
              title="Exporter en HTML"
            >
              <i className="fas fa-code"></i> HTML
            </button>
            <button
              className="btn-action"
              onClick={() => handleExportContent(selectedContent, 'json')}
              title="Exporter en JSON"
            >
              <i className="fas fa-file-code"></i> JSON
            </button>
          </div>
          <button
            className="btn-primary"
            onClick={() => handleSaveContent(selectedContent)}
          >
            <i className="fas fa-save"></i>
            Sauvegarder
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="results-management-page">
      <div className="page-header">
        <button className="back-btn" onClick={() => navigate('/')}>
          <i className="fas fa-arrow-left"></i>
          Retour à l'application
        </button>
        <div className="header-content">
          <h1>Gestion et Publication des Résultats</h1>
          <p>Gérez, modifiez et publiez tous vos contenus générés</p>
        </div>
      </div>

      <div className="view-controls">
        <button 
          className={`view-btn ${activeView === 'grid' ? 'active' : ''}`}
          onClick={() => setActiveView('grid')}
        >
          <i className="fas fa-th"></i>
          Grille
        </button>
        <button 
          className={`view-btn ${activeView === 'list' ? 'active' : ''}`}
          onClick={() => setActiveView('list')}
        >
          <i className="fas fa-list"></i>
          Liste
        </button>
      </div>

      {activeView === 'grid' && renderGridView()}
      {activeView === 'list' && (
        <div className="list-view">
          <h3>Vue Liste des contenus</h3>
          {/* TODO: Implémenter la vue liste détaillée */}
        </div>
      )}

      {isEditing && renderEditorModal()}
    </div>
  );
};

export default ResultsManagementPage;