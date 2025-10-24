import { useState, useEffect } from 'react';
import StorageManager from '../utils/StorageManager';
import './ContentLibrary.css';

const ContentLibrary = () => {
  const [contents, setContents] = useState([]);
  const [filteredContents, setFilteredContents] = useState([]);
  const [selectedContent, setSelectedContent] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [loading, setLoading] = useState(true);

  // États pour les filtres
  const [filters, setFilters] = useState({
    search: '',
    type_media: 'all',
    plateforme_cible: 'all',
    statut: 'all',
    tags: []
  });

  // États pour la création/édition
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content: '',
    type_media: 'text',
    plateforme_cible: [],
    statut: 'Brouillon',
    tags: ''
  });

  // Plateformes disponibles
  const platforms = [
    { id: 'facebook', name: 'Facebook', icon: 'fab fa-facebook-f', color: '#1877F2' },
    { id: 'instagram', name: 'Instagram', icon: 'fab fa-instagram', color: '#E4405F' },
    { id: 'twitter', name: 'X (Twitter)', icon: 'fab fa-twitter', color: '#1DA1F2' },
    { id: 'linkedin', name: 'LinkedIn', icon: 'fab fa-linkedin-in', color: '#0A66C2' },
    { id: 'blog', name: 'Blog', icon: 'fas fa-blog', color: '#6B46C1' },
    { id: 'youtube', name: 'YouTube', icon: 'fab fa-youtube', color: '#FF0000' },
    { id: 'tiktok', name: 'TikTok', icon: 'fab fa-tiktok', color: '#000000' }
  ];

  const contentTypes = [
    { id: 'text', name: 'Texte', icon: 'fas fa-font' },
    { id: 'image', name: 'Image', icon: 'fas fa-image' },
    { id: 'video', name: 'Vidéo', icon: 'fas fa-video' }
  ];

  const statusOptions = [
    { id: 'Brouillon', name: 'Brouillon', color: '#6B7280' },
    { id: 'En attente', name: 'En attente', color: '#F59E0B' },
    { id: 'Validé', name: 'Validé', color: '#10B981' },
    { id: 'Publié', name: 'Publié', color: '#3B82F6' },
    { id: 'Échec', name: 'Échec', color: '#EF4444' }
  ];

  useEffect(() => {
    loadContents();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [contents, filters]);

  const loadContents = async () => {
    setLoading(true);
    try {
      const libraryContents = StorageManager.getContentLibrary();
      setContents(libraryContents);
    } catch (error) {
      console.error('Erreur lors du chargement des contenus:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    const filtered = StorageManager.filterContentLibrary(filters);
    setFilteredContents(filtered);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleCreateContent = () => {
    setFormData({
      title: '',
      description: '',
      content: '',
      type_media: 'text',
      plateforme_cible: [],
      statut: 'Brouillon',
      tags: ''
    });
    setShowCreateModal(true);
  };

  const handleEditContent = (content) => {
    setSelectedContent(content);
    setFormData({
      title: content.title,
      description: content.description,
      content: content.content,
      type_media: content.type_media,
      plateforme_cible: content.plateforme_cible,
      statut: content.statut,
      tags: content.tags.join(', ')
    });
    setShowEditModal(true);
  };

  const handleSaveContent = async () => {
    try {
      const contentData = {
        ...formData,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        plateforme_cible: formData.plateforme_cible
      };

      if (showCreateModal) {
        await StorageManager.saveContentLibrary(contentData);
      } else if (selectedContent) {
        await StorageManager.updateContentLibrary(selectedContent.id, contentData);
      }

      await loadContents();
      setShowCreateModal(false);
      setShowEditModal(false);
      setSelectedContent(null);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      alert('Erreur lors de la sauvegarde du contenu');
    }
  };

  const handleDeleteContent = async (contentId) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce contenu ?')) return;

    try {
      await StorageManager.deleteContentLibrary(contentId);
      await loadContents();
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      alert('Erreur lors de la suppression');
    }
  };

  const handleImportFromResults = async (resultData) => {
    try {
      await StorageManager.importFromResults(resultData);
      await loadContents();
      alert('Contenu importé avec succès !');
    } catch (error) {
      console.error('Erreur lors de l\'import:', error);
      alert('Erreur lors de l\'import');
    }
  };

  const handleFileImport = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      await StorageManager.importFromFile(file, {
        plateforme_cible: ['blog']
      });
      await loadContents();
      setShowImportModal(false);
      alert('Fichier importé avec succès !');
    } catch (error) {
      console.error('Erreur lors de l\'import du fichier:', error);
      alert('Erreur lors de l\'import du fichier');
    }
  };

  const getStats = () => {
    return StorageManager.getLibraryStats();
  };

  if (loading) {
    return <div className="content-library loading">Chargement...</div>;
  }

  return (
    <div className="content-library">
      {/* En-tête */}
      <div className="library-header">
        <div className="header-content">
          <h1>Bibliothèque de Contenus</h1>
          <p>Gérez tous vos contenus multimédias</p>
        </div>

        <div className="header-actions">
          <button className="btn-secondary" onClick={() => document.getElementById('file-import')?.click()}>
            <i className="fas fa-upload"></i>
            Importer
          </button>
          {/* Bouton "Créer" supprimé selon demande */}
        </div>
      </div>

      {/* Statistiques supprimées selon demande */}

      {/* Input file caché pour import direct */}
      <input
        type="file"
        accept=".txt,.md,.html,.jpg,.jpeg,.png,.gif,.mp4,.mov"
        onChange={handleFileImport}
        style={{ display: 'none' }}
        id="file-import"
      />

      {/* Filtres */}
      <div className="library-filters">
        <div className="filter-group">
          <input
            type="text"
            placeholder="Rechercher..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filter-group">
          <select
            value={filters.type_media}
            onChange={(e) => handleFilterChange('type_media', e.target.value)}
          >
            <option value="all">Tous types</option>
            {contentTypes.map(type => (
              <option key={type.id} value={type.id}>{type.name}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <select
            value={filters.plateforme_cible}
            onChange={(e) => handleFilterChange('plateforme_cible', e.target.value)}
          >
            <option value="all">Toutes plateformes</option>
            {platforms.map(platform => (
              <option key={platform.id} value={platform.id}>{platform.name}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <select
            value={filters.statut}
            onChange={(e) => handleFilterChange('statut', e.target.value)}
          >
            <option value="all">Tous statuts</option>
            {statusOptions.map(status => (
              <option key={status.id} value={status.id}>{status.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Vue galerie/liste */}
      <div className="library-content">
        {filteredContents.length === 0 ? (
          <div className="empty-state">
            <i className="fas fa-inbox"></i>
            <h3>Aucun contenu trouvé</h3>
            <p>Créez votre premier contenu ou ajustez vos filtres</p>
          </div>
        ) : (
          <div className="content-grid">
            {filteredContents.map(content => (
              <div key={content.id} className="content-card">
                <div className="content-header">
                  <div className="content-type">
                    <i className={contentTypes.find(t => t.id === content.type_media)?.icon || 'fas fa-file'}></i>
                    <span>{contentTypes.find(t => t.id === content.type_media)?.name}</span>
                  </div>
                  <div className="content-status" style={{ backgroundColor: statusOptions.find(s => s.id === content.statut)?.color }}>
                    {content.statut}
                  </div>
                </div>

                <div className="content-body">
                  <h3 className="content-title">{content.title}</h3>
                  {content.description && (
                    <p className="content-description">{content.description}</p>
                  )}

                  <div className="content-platforms">
                    {content.plateforme_cible.map(platformId => {
                      const platform = platforms.find(p => p.id === platformId);
                      return platform ? (
                        <div key={platformId} className="platform-badge" style={{ backgroundColor: platform.color }}>
                          <i className={platform.icon}></i>
                          {platform.name}
                        </div>
                      ) : null;
                    })}
                  </div>

                  {content.tags.length > 0 && (
                    <div className="content-tags">
                      {content.tags.map(tag => (
                        <span key={tag} className="tag">{tag}</span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="content-actions">
                  <button onClick={() => handleEditContent(content)} className="btn-edit">
                    <i className="fas fa-edit"></i>
                  </button>
                  <button onClick={() => handleDeleteContent(content.id)} className="btn-delete">
                    <i className="fas fa-trash"></i>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de création */}
      {(showCreateModal || showEditModal) && (
        <div className="modal-overlay" onClick={() => {
          setShowCreateModal(false);
          setShowEditModal(false);
          setSelectedContent(null);
        }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>{showCreateModal ? 'Créer un contenu' : 'Modifier le contenu'}</h3>

            <div className="form-grid">
              <div className="form-group">
                <label>Titre *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="Titre du contenu"
                  required
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Description du contenu"
                  rows={3}
                />
              </div>

              <div className="form-group">
                <label>Type de média</label>
                <select
                  value={formData.type_media}
                  onChange={(e) => setFormData({...formData, type_media: e.target.value})}
                >
                  {contentTypes.map(type => (
                    <option key={type.id} value={type.id}>{type.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Statut</label>
                <select
                  value={formData.statut}
                  onChange={(e) => setFormData({...formData, statut: e.target.value})}
                >
                  {statusOptions.map(status => (
                    <option key={status.id} value={status.id}>{status.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Contenu</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({...formData, content: e.target.value})}
                  placeholder="Contenu principal"
                  rows={6}
                />
              </div>

              <div className="form-group">
                <label>Plateformes cibles</label>
                <div className="platforms-checkboxes">
                  {platforms.map(platform => (
                    <label key={platform.id} className="platform-checkbox">
                      <input
                        type="checkbox"
                        checked={formData.plateforme_cible.includes(platform.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({
                              ...formData,
                              plateforme_cible: [...formData.plateforme_cible, platform.id]
                            });
                          } else {
                            setFormData({
                              ...formData,
                              plateforme_cible: formData.plateforme_cible.filter(p => p !== platform.id)
                            });
                          }
                        }}
                      />
                      <div className="platform-option">
                        <i className={platform.icon} style={{ color: platform.color }}></i>
                        {platform.name}
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>Tags (séparés par des virgules)</label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData({...formData, tags: e.target.value})}
                  placeholder="tag1, tag2, tag3"
                />
              </div>
            </div>

            <div className="modal-actions">
              <button onClick={() => {
                setShowCreateModal(false);
                setShowEditModal(false);
                setSelectedContent(null);
              }}>
                Annuler
              </button>
              <button className="btn-primary" onClick={handleSaveContent}>
                {showCreateModal ? 'Créer' : 'Modifier'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContentLibrary;
