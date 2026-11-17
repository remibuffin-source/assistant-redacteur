import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MenuBar from './MenuBar';
import './StorageBrowser.css';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://api.assistant-redacteur.fr';

const StorageBrowser = () => {
  const navigate = useNavigate();
  const [currentPath, setCurrentPath] = useState('/');
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

  useEffect(() => {
    loadFiles(currentPath);
  }, [currentPath]);

  // Gestion de la touche Échap pour fermer la preview
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && previewImage) {
        setPreviewImage(null);
      }
    };
    
    if (previewImage) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [previewImage]);

  const loadFiles = async (path) => {
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Vous devez être connecté pour accéder au stockage');
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/storage/browse?path=${encodeURIComponent(path)}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Erreur lors du chargement des fichiers');
      }

      const data = await response.json();
      setFiles(data.files || []);
    } catch (err) {
      console.error('Erreur:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleNavigate = (item) => {
    if (item.type === 'directory') {
      setCurrentPath(item.path);
    } else if (item.type === 'image') {
      setPreviewImage(item);
    } else {
      setSelectedFile(item);
    }
  };

  const handleGoUp = () => {
    if (currentPath === '/') return;
    const parts = currentPath.split('/').filter(p => p);
    parts.pop();
    setCurrentPath('/' + parts.join('/'));
  };

  const handleDelete = async (item) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer "${item.name}" ?`)) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/storage/delete`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ path: item.path })
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la suppression');
      }

      loadFiles(currentPath);
    } catch (err) {
      alert('Erreur: ' + err.message);
    }
  };

  const handleDownload = (item) => {
    const token = localStorage.getItem('token');
    window.open(`${API_BASE_URL}/storage/download?path=${encodeURIComponent(item.path)}&token=${token}`, '_blank');
  };

  const getFileIcon = (item) => {
    if (item.type === 'directory') return 'fa-folder';
    if (item.type === 'image') return 'fa-image';
    if (item.name.endsWith('.pdf')) return 'fa-file-pdf';
    if (item.name.endsWith('.doc') || item.name.endsWith('.docx')) return 'fa-file-word';
    if (item.name.endsWith('.json')) return 'fa-file-code';
    return 'fa-file';
  };

  const getFileColor = (item) => {
    if (item.type === 'directory') return '#f59e0b';
    if (item.type === 'image') return '#10b981';
    if (item.name.endsWith('.pdf')) return '#ef4444';
    if (item.name.endsWith('.doc') || item.name.endsWith('.docx')) return '#3b82f6';
    return '#6b7280';
  };

  const formatSize = (bytes) => {
    if (!bytes) return '-';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="storage-browser-page">
      <MenuBar />
      
      <div className="storage-container">
        <div className="storage-header">
          <h1>
            <i className="fas fa-database"></i>
            Gestionnaire de Stockage
          </h1>
          <p>Gérez vos fichiers, images et données</p>
        </div>

        <div className="storage-toolbar">
          <div className="breadcrumb">
            <button onClick={() => setCurrentPath('/')} className="breadcrumb-home">
              <i className="fas fa-home"></i>
            </button>
            {currentPath.split('/').filter(p => p).map((part, index, arr) => (
              <span key={index}>
                <span className="breadcrumb-separator">/</span>
                <button 
                  onClick={() => setCurrentPath('/' + arr.slice(0, index + 1).join('/'))}
                  className="breadcrumb-part"
                >
                  {part}
                </button>
              </span>
            ))}
          </div>
          
          <div className="toolbar-actions">
            <button onClick={() => loadFiles(currentPath)} className="refresh-btn">
              <i className="fas fa-sync-alt"></i>
              Actualiser
            </button>
            <button onClick={() => navigate('/')} className="back-btn">
              <i className="fas fa-arrow-left"></i>
              Retour
            </button>
          </div>
        </div>

        {loading ? (
          <div className="storage-loading">
            <div className="loader"></div>
            <p>Chargement des fichiers...</p>
          </div>
        ) : error ? (
          <div className="storage-error">
            <i className="fas fa-exclamation-triangle"></i>
            <p>{error}</p>
            <button onClick={() => loadFiles(currentPath)}>Réessayer</button>
          </div>
        ) : (
          <div className="files-grid">
            {currentPath !== '/' && (
              <div className="file-card folder-up" onClick={handleGoUp}>
                <div className="file-icon" style={{ color: '#6b7280' }}>
                  <i className="fas fa-level-up-alt"></i>
                </div>
                <div className="file-name">..</div>
                <div className="file-meta">Dossier parent</div>
              </div>
            )}
            
            {files.length === 0 && currentPath === '/' ? (
              <div className="empty-folder">
                <i className="fas fa-folder-open"></i>
                <p>Ce dossier est vide</p>
              </div>
            ) : (
              files.map((item, index) => (
                <div 
                  key={index} 
                  className={`file-card ${item.type}`}
                  onClick={() => handleNavigate(item)}
                >
                  {item.type === 'image' && item.thumbnailUrl ? (
                    <div className="file-thumbnail">
                      <img src={item.thumbnailUrl} alt={item.name} />
                    </div>
                  ) : (
                    <div className="file-icon" style={{ color: getFileColor(item) }}>
                      <i className={`fas ${getFileIcon(item)}`}></i>
                    </div>
                  )}
                  <div className="file-name" title={item.name}>{item.name}</div>
                  <div className="file-meta">
                    {item.type === 'directory' ? (
                      <span>{item.count || 0} éléments</span>
                    ) : (
                      <span>{formatSize(item.size)}</span>
                    )}
                  </div>
                  {item.type !== 'directory' && (
                    <div className="file-actions">
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleDownload(item); }}
                        title="Télécharger"
                      >
                        <i className="fas fa-download"></i>
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleDelete(item); }}
                        title="Supprimer"
                        className="delete-action"
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Modal de prévisualisation d'image */}
      {previewImage && (
        <div className="image-preview-modal" onClick={() => setPreviewImage(null)}>
          <button className="close-preview" onClick={() => setPreviewImage(null)}>
            <i className="fas fa-times"></i>
          </button>
          <div className="preview-content" onClick={(e) => e.stopPropagation()}>
            <img src={previewImage.url || previewImage.thumbnailUrl} alt={previewImage.name} />
            <div className="preview-info">
              <h3>{previewImage.name}</h3>
              <p>{formatSize(previewImage.size)} • {formatDate(previewImage.modifiedAt)}</p>
              <div className="preview-actions">
                <button onClick={() => handleDownload(previewImage)}>
                  <i className="fas fa-download"></i> Télécharger
                </button>
                <button onClick={() => { handleDelete(previewImage); setPreviewImage(null); }} className="delete-btn">
                  <i className="fas fa-trash"></i> Supprimer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StorageBrowser;
