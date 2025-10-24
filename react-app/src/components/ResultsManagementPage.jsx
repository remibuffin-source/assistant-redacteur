import { useState, useEffect } from 'react';
import { useAssistantAutoSave } from '../hooks/useLocalStorage';
import { useNavigate } from 'react-router-dom';
import MenuBar from './MenuBar';
import AdvancedEditor from './AdvancedEditor';
import './ResultsManagementPage.css';

const ResultsManagementPage = () => {
  const { autoSaveData } = useAssistantAutoSave();
  const navigate = useNavigate();
  const [contents, setContents] = useState([]);
  const [selectedContent, setSelectedContent] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  // Types de contenu
  const contentTypes = [
    { id: 'post', name: 'Post', icon: 'fas fa-newspaper', color: '#4F46E5' },
    { id: 'article', name: 'Article', icon: 'fas fa-file-alt', color: '#10B981' },
    { id: 'video', name: 'Vidéo', icon: 'fas fa-video', color: '#EF4444' },
    { id: 'story', name: 'Story', icon: 'fas fa-camera', color: '#F59E0B' }
  ];

  // Charger les contenus depuis le stockage local
  useEffect(() => {
    const savedContents = JSON.parse(localStorage.getItem('editorContents') || '[]');
    setContents(savedContents);
  }, []);

  const saveContents = (newContents) => {
    setContents(newContents);
    localStorage.setItem('editorContents', JSON.stringify(newContents));
  };

  // Filtrage des contenus
  const filteredContents = contents.filter(content => {
    const matchesSearch = content.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         content.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || content.type === filterType;
    
    return matchesSearch && matchesType;
  });

  const handleEditContent = (content) => {
    setSelectedContent(content);
    setIsEditing(true);
  };

  const handleCreateNew = () => {
    setSelectedContent({
      id: Date.now(),
      title: 'Nouveau contenu',
      content: '',
      type: 'post',
      createdAt: new Date().toISOString(),
      status: 'draft'
    });
    setIsEditing(true);
  };

  const handleSaveContent = (content) => {
    const updatedContents = selectedContent.id 
      ? contents.map(c => c.id === selectedContent.id ? { ...selectedContent, content } : c)
      : [...contents, { ...selectedContent, content, id: Date.now() }];
    
    saveContents(updatedContents);
    setIsEditing(false);
    setSelectedContent(null);
  };

  const handlePublishContent = (content) => {
    const updatedContents = contents.map(c => 
      c.id === selectedContent.id ? { ...c, content, status: 'published', publishedAt: new Date().toISOString() } : c
    );
    saveContents(updatedContents);
    setIsEditing(false);
    setSelectedContent(null);
    alert('Contenu publié avec succès !');
  };

  const handleSaveAsTemplate = (content) => {
    const template = {
      ...selectedContent,
      content,
      isTemplate: true,
      templateName: prompt('Nom du modèle:') || `Modèle ${Date.now()}`
    };
    
    const templates = JSON.parse(localStorage.getItem('contentTemplates') || '[]');
    localStorage.setItem('contentTemplates', JSON.stringify([...templates, template]));
    alert('Modèle sauvegardé avec succès !');
  };

  const handleDeleteContent = () => {
    const updatedContents = contents.filter(c => c.id !== selectedContent.id);
    saveContents(updatedContents);
    setIsEditing(false);
    setSelectedContent(null);
  };

  const renderContentGrid = () => (
    <div className="editor-grid-view">
      <div className="editor-header">
        <div className="header-content">
          <h1>Éditeur de Contenus</h1>
          <p>Gérez et modifiez tous vos contenus générés</p>
        </div>
      </div>

      <div className="editor-controls">
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
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
        >
          <option value="all">Tous les types</option>
          {contentTypes.map(type => (
            <option key={type.id} value={type.id}>{type.name}</option>
          ))}
        </select>

        <button className="btn-create" onClick={handleCreateNew}>
          <i className="fas fa-plus"></i>
          Nouveau contenu
        </button>
      </div>

      <div className="content-grid">
        {filteredContents.map(content => (
          <div key={content.id} className="content-card" onClick={() => handleEditContent(content)}>
            <div className="card-header">
              <div className="content-type" style={{ color: contentTypes.find(t => t.id === content.type)?.color }}>
                <i className={contentTypes.find(t => t.id === content.type)?.icon}></i>
                <span>{contentTypes.find(t => t.id === content.type)?.name}</span>
              </div>
              <div className={`status-badge ${content.status}`}>
                {content.status === 'published' && 'Publié'}
                {content.status === 'draft' && 'Brouillon'}
              </div>
            </div>

            <div className="card-content">
              <h4 className="content-title">{content.title}</h4>
              <div 
                className="content-preview"
                dangerouslySetInnerHTML={{ 
                  __html: content.content.length > 100 
                    ? `${content.content.substring(0, 100)}...` 
                    : content.content 
                }}
              />
            </div>

            <div className="card-footer">
              <span className="content-date">
                {new Date(content.createdAt).toLocaleDateString('fr-FR')}
              </span>
              <span className="word-count">
                {content.content.split(' ').length} mots
              </span>
            </div>
          </div>
        ))}

        {filteredContents.length === 0 && (
          <div className="empty-state">
            <i className="fas fa-file-alt"></i>
            <h3>Aucun contenu</h3>
            <p>Créez votre premier contenu pour commencer</p>
            <button className="btn-create-large" onClick={handleCreateNew}>
              <i className="fas fa-plus"></i>
              Créer un contenu
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="page-container">
      <MenuBar onHelp={() => {}} />
      <div className="page-content">
        <div className="results-management-page">
          {!isEditing && renderContentGrid()}
          
          {isEditing && selectedContent && (
            <AdvancedEditor
              content={selectedContent.content}
              onSave={handleSaveContent}
              onClose={() => {
                setIsEditing(false);
                setSelectedContent(null);
              }}
              onPublish={handlePublishContent}
              onSaveAsTemplate={handleSaveAsTemplate}
              onDelete={handleDeleteContent}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ResultsManagementPage;