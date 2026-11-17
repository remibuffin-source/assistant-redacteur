import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAssistantAutoSave } from '../hooks/useLocalStorage';
import { useAuth } from '../hooks/useAuth';
import MenuBar from './MenuBar';
import './StockagePage.css';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

// Composant pour afficher une image avec authentification
const AuthImage = ({ src, alt, onError, style, className }) => {
  const imgRef = useRef(null);
  const [blobUrl, setBlobUrl] = useState(null);
  
  useEffect(() => {
    let cancelled = false;
    const token = localStorage.getItem('token');
    if (!src || !token) return;
    
    fetch(src, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => {
        if (!res.ok) throw new Error('Failed');
        return res.blob();
      })
      .then(blob => {
        if (!cancelled) setBlobUrl(URL.createObjectURL(blob));
      })
      .catch(() => {
        if (!cancelled && onError && imgRef.current) onError({ target: imgRef.current });
      });
    
    return () => { cancelled = true; if (blobUrl) URL.revokeObjectURL(blobUrl); };
  }, [src]);
  
  if (!blobUrl) return <i className="fas fa-image" style={{ fontSize: '2.5rem', color: '#10b981' }}></i>;
  return <img ref={imgRef} src={blobUrl} alt={alt} style={style} className={className} />;
};

const StockagePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { autoSaveData } = useAssistantAutoSave();
  const userLanguage = autoSaveData.language || 'fr';

  const [files, setFiles] = useState([]);
  const [currentPath, setCurrentPath] = useState('/');
  const [pathHistory, setPathHistory] = useState(['/']);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [storageUsage, setStorageUsage] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' ou 'list'
  const [previewFile, setPreviewFile] = useState(null);
  const [showNewFolderModal, setShowNewFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [sortBy, setSortBy] = useState('name'); // 'name', 'size', 'date'
  const [sortOrder, setSortOrder] = useState('asc');
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [moveFile, setMoveFile] = useState(null);
  const [availableFolders, setAvailableFolders] = useState([]);
  const [previewBlobUrl, setPreviewBlobUrl] = useState(null);

  // Traductions
  const translations = {
    fr: {
      title: 'Stockage Serveur',
      subtitle: 'Gérez vos fichiers stockés sur le serveur',
      upload: 'Envoyer un fichier',
      newFolder: 'Nouveau dossier',
      delete: 'Supprimer',
      download: 'Télécharger',
      back: 'Retour',
      home: 'Accueil',
      emptyFolder: 'Ce dossier est vide',
      dragDrop: 'Glissez-déposez vos fichiers ici',
      or: 'ou',
      browse: 'Parcourir',
      usage: 'Espace utilisé',
      of: 'sur',
      files: 'fichier(s)',
      folders: 'dossier(s)',
      size: 'Taille',
      modified: 'Modifié le',
      name: 'Nom',
      type: 'Type',
      cancel: 'Annuler',
      create: 'Créer',
      folderName: 'Nom du dossier',
      confirmDelete: 'Êtes-vous sûr de vouloir supprimer',
      uploading: 'Envoi en cours...',
      loading: 'Chargement...',
      preview: 'Aperçu',
      close: 'Fermer',
      selected: 'sélectionné(s)',
      selectAll: 'Tout sélectionner',
      deselectAll: 'Tout désélectionner',
      grid: 'Grille',
      list: 'Liste',
      sortName: 'Nom',
      sortSize: 'Taille',
      sortDate: 'Date',
      backToHome: 'Retour à l\'accueil',
      move: 'Déplacer',
      moveTo: 'Déplacer vers',
      moveToRoot: 'Racine'
    },
    en: {
      title: 'Server Storage',
      subtitle: 'Manage your files stored on the server',
      upload: 'Upload file',
      newFolder: 'New folder',
      delete: 'Delete',
      download: 'Download',
      back: 'Back',
      home: 'Home',
      emptyFolder: 'This folder is empty',
      dragDrop: 'Drag and drop your files here',
      or: 'or',
      browse: 'Browse',
      usage: 'Space used',
      of: 'of',
      files: 'file(s)',
      folders: 'folder(s)',
      size: 'Size',
      modified: 'Modified',
      name: 'Name',
      type: 'Type',
      cancel: 'Cancel',
      create: 'Create',
      folderName: 'Folder name',
      confirmDelete: 'Are you sure you want to delete',
      uploading: 'Uploading...',
      loading: 'Loading...',
      preview: 'Preview',
      close: 'Close',
      selected: 'selected',
      selectAll: 'Select all',
      deselectAll: 'Deselect all',
      grid: 'Grid',
      list: 'List',
      sortName: 'Name',
      sortSize: 'Size',
      sortDate: 'Date',
      backToHome: 'Back to home',
      move: 'Move',
      moveTo: 'Move to',
      moveToRoot: 'Root'
    },
    es: {
      title: 'Almacenamiento Servidor',
      subtitle: 'Gestione sus archivos almacenados en el servidor',
      upload: 'Subir archivo',
      newFolder: 'Nueva carpeta',
      delete: 'Eliminar',
      download: 'Descargar',
      back: 'Atrás',
      home: 'Inicio',
      emptyFolder: 'Esta carpeta está vacía',
      dragDrop: 'Arrastre y suelte sus archivos aquí',
      or: 'o',
      browse: 'Explorar',
      usage: 'Espacio utilizado',
      of: 'de',
      files: 'archivo(s)',
      folders: 'carpeta(s)',
      size: 'Tamaño',
      modified: 'Modificado',
      name: 'Nombre',
      type: 'Tipo',
      cancel: 'Cancelar',
      create: 'Crear',
      folderName: 'Nombre de carpeta',
      confirmDelete: '¿Está seguro de que desea eliminar',
      uploading: 'Subiendo...',
      loading: 'Cargando...',
      preview: 'Vista previa',
      close: 'Cerrar',
      selected: 'seleccionado(s)',
      selectAll: 'Seleccionar todo',
      deselectAll: 'Deseleccionar todo',
      grid: 'Cuadrícula',
      list: 'Lista',
      sortName: 'Nombre',
      sortSize: 'Tamaño',
      sortDate: 'Fecha',
      backToHome: 'Volver al inicio',
      move: 'Mover',
      moveTo: 'Mover a',
      moveToRoot: 'Raíz'
    },
    de: {
      title: 'Server-Speicher',
      subtitle: 'Verwalten Sie Ihre auf dem Server gespeicherten Dateien',
      upload: 'Datei hochladen',
      newFolder: 'Neuer Ordner',
      delete: 'Löschen',
      download: 'Herunterladen',
      back: 'Zurück',
      home: 'Startseite',
      emptyFolder: 'Dieser Ordner ist leer',
      dragDrop: 'Dateien hierher ziehen',
      or: 'oder',
      browse: 'Durchsuchen',
      usage: 'Genutzter Speicher',
      of: 'von',
      files: 'Datei(en)',
      folders: 'Ordner',
      size: 'Größe',
      modified: 'Geändert',
      name: 'Name',
      type: 'Typ',
      cancel: 'Abbrechen',
      create: 'Erstellen',
      folderName: 'Ordnername',
      confirmDelete: 'Sind Sie sicher, dass Sie löschen möchten',
      uploading: 'Wird hochgeladen...',
      loading: 'Laden...',
      preview: 'Vorschau',
      close: 'Schließen',
      selected: 'ausgewählt',
      selectAll: 'Alles auswählen',
      deselectAll: 'Auswahl aufheben',
      grid: 'Raster',
      list: 'Liste',
      sortName: 'Name',
      sortSize: 'Größe',
      sortDate: 'Datum',
      backToHome: 'Zurück zur Startseite',
      move: 'Verschieben',
      moveTo: 'Verschieben nach',
      moveToRoot: 'Stammverzeichnis'
    }
  };

  const t = (key) => (translations[userLanguage] || translations.fr)[key] || key;

  const getToken = () => localStorage.getItem('token');

  const apiRequest = async (endpoint, options = {}) => {
    const token = getToken();
    const isFormData = options.body instanceof FormData;
    const headers = {};
    
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    if (!isFormData) {
      headers['Content-Type'] = 'application/json';
    }
    
    const config = {
      ...options,
      headers
    };
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Erreur HTTP ${response.status}`);
    }
    return response;
  };

  // Charger les fichiers du dossier courant
  const loadFiles = useCallback(async (path = '/') => {
    setIsLoading(true);
    try {
      const response = await apiRequest(`/storage/browse?path=${encodeURIComponent(path)}`);
      const data = await response.json();
      if (data.success) {
        setFiles(data.files || []);
      }
    } catch (error) {
      console.error('Erreur chargement fichiers:', error);
      setFiles([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Charger l'utilisation du stockage
  const loadStorageUsage = useCallback(async () => {
    try {
      const response = await apiRequest('/storage/usage');
      const data = await response.json();
      if (data.success) {
        setStorageUsage(data.data);
      }
    } catch (error) {
      console.error('Erreur chargement stockage:', error);
    }
  }, []);

  useEffect(() => {
    loadFiles(currentPath);
    loadStorageUsage();
  }, [currentPath, loadFiles, loadStorageUsage]);

  // Navigation dans les dossiers
  const navigateToFolder = (folderPath) => {
    setSelectedFiles([]);
    setPathHistory(prev => [...prev, folderPath]);
    setCurrentPath(folderPath);
  };

  const navigateBack = () => {
    if (pathHistory.length > 1) {
      const newHistory = [...pathHistory];
      newHistory.pop();
      const prevPath = newHistory[newHistory.length - 1];
      setPathHistory(newHistory);
      setCurrentPath(prevPath);
      setSelectedFiles([]);
    }
  };

  const navigateHome = () => {
    setPathHistory(['/']);
    setCurrentPath('/');
    setSelectedFiles([]);
  };

  // Upload de fichier
  const handleFileUpload = async (fileList) => {
    if (!fileList || fileList.length === 0) return;

    setIsUploading(true);
    try {
      for (const file of fileList) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('folder', currentPath === '/' ? '.' : currentPath);

        await apiRequest('/storage/upload', {
          method: 'POST',
          body: formData
        });
      }
      await loadFiles(currentPath);
      await loadStorageUsage();
    } catch (error) {
      console.error('Erreur upload:', error);
      alert('Erreur lors de l\'envoi : ' + error.message);
    } finally {
      setIsUploading(false);
    }
  };

  // Suppression de fichier
  const handleDelete = async (filePath) => {
    if (!confirm(`${t('confirmDelete')} "${filePath.split('/').pop()}" ?`)) return;

    try {
      await apiRequest('/storage/delete', {
        method: 'DELETE',
        body: JSON.stringify({ path: filePath })
      });
      await loadFiles(currentPath);
      await loadStorageUsage();
      setSelectedFiles(prev => prev.filter(f => f !== filePath));
    } catch (error) {
      console.error('Erreur suppression:', error);
      alert('Erreur lors de la suppression : ' + error.message);
    }
  };

  // Suppression multiple
  const handleDeleteSelected = async () => {
    if (selectedFiles.length === 0) return;
    if (!confirm(`${t('confirmDelete')} ${selectedFiles.length} ${t('files')} ?`)) return;

    for (const filePath of selectedFiles) {
      try {
        await apiRequest('/storage/delete', {
          method: 'DELETE',
          body: JSON.stringify({ path: filePath })
        });
      } catch (error) {
        console.error('Erreur suppression:', filePath, error);
      }
    }
    setSelectedFiles([]);
    await loadFiles(currentPath);
    await loadStorageUsage();
  };

  // Créer un dossier
  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;
    try {
      const folderPath = currentPath === '/' 
        ? newFolderName.trim() 
        : `${currentPath}/${newFolderName.trim()}`;
      await apiRequest('/storage/folder', {
        method: 'POST',
        body: JSON.stringify({ folder: folderPath })
      });
      setShowNewFolderModal(false);
      setNewFolderName('');
      await loadFiles(currentPath);
    } catch (error) {
      console.error('Erreur création dossier:', error);
      alert('Erreur : ' + error.message);
    }
  };

  // Télécharger un fichier
  const handleDownload = async (file) => {
    try {
      const token = getToken();
      const response = await fetch(
        `${API_BASE_URL}/storage/download?path=${encodeURIComponent(file.path)}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!response.ok) throw new Error('Erreur téléchargement');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Erreur téléchargement:', error);
      alert('Erreur : ' + error.message);
    }
  };

  // Preview d'image avec authentification
  const openPreview = async (file) => {
    setPreviewFile(file);
    try {
      const token = getToken();
      const imageUrl = file.url || file.thumbnailUrl;
      const response = await fetch(`${API_BASE_URL}${imageUrl}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Erreur chargement image');
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      setPreviewBlobUrl(blobUrl);
    } catch (error) {
      console.error('Erreur preview:', error);
      setPreviewBlobUrl(null);
    }
  };

  const closePreview = () => {
    if (previewBlobUrl) URL.revokeObjectURL(previewBlobUrl);
    setPreviewBlobUrl(null);
    setPreviewFile(null);
  };

  // Déplacer un fichier
  const openMoveModal = (file) => {
    setMoveFile(file);
    // Récupérer les dossiers disponibles depuis la racine
    const folders = files.filter(f => f.type === 'directory');
    setAvailableFolders(folders);
    setShowMoveModal(true);
  };

  const handleMoveFile = async (destinationFolder) => {
    if (!moveFile) return;
    try {
      await apiRequest('/storage/move', {
        method: 'POST',
        body: JSON.stringify({
          sourcePath: moveFile.path,
          destinationFolder: destinationFolder
        })
      });
      setShowMoveModal(false);
      setMoveFile(null);
      await loadFiles(currentPath);
    } catch (error) {
      console.error('Erreur déplacement:', error);
      alert('Erreur : ' + error.message);
    }
  };

  // Sélection de fichier
  const toggleFileSelection = (filePath) => {
    setSelectedFiles(prev => 
      prev.includes(filePath) 
        ? prev.filter(f => f !== filePath) 
        : [...prev, filePath]
    );
  };

  // Drag & Drop
  const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = (e) => { e.preventDefault(); setIsDragging(false); };
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileUpload(e.dataTransfer.files);
  };

  // Tri des fichiers
  const sortedFiles = [...files].sort((a, b) => {
    // Dossiers en premier toujours
    if (a.type === 'directory' && b.type !== 'directory') return -1;
    if (a.type !== 'directory' && b.type === 'directory') return 1;

    let comparison = 0;
    if (sortBy === 'name') comparison = a.name.localeCompare(b.name);
    else if (sortBy === 'size') comparison = (a.size || 0) - (b.size || 0);
    else if (sortBy === 'date') comparison = new Date(a.modifiedAt) - new Date(b.modifiedAt);

    return sortOrder === 'asc' ? comparison : -comparison;
  });

  // Formatage de la taille
  const formatSize = (bytes) => {
    if (!bytes) return '-';
    if (bytes < 1024) return `${bytes} o`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} Go`;
  };

  // Formatage de la date
  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString(userLanguage === 'fr' ? 'fr-FR' : userLanguage, {
      year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  // Icône selon le type de fichier
  const getFileIcon = (file) => {
    if (file.type === 'directory') return 'fas fa-folder';
    if (file.type === 'image') return 'fas fa-image';
    const ext = file.name.split('.').pop().toLowerCase();
    const iconMap = {
      pdf: 'fas fa-file-pdf', doc: 'fas fa-file-word', docx: 'fas fa-file-word',
      xls: 'fas fa-file-excel', xlsx: 'fas fa-file-excel', csv: 'fas fa-file-csv',
      ppt: 'fas fa-file-powerpoint', pptx: 'fas fa-file-powerpoint',
      zip: 'fas fa-file-archive', rar: 'fas fa-file-archive', tar: 'fas fa-file-archive',
      mp4: 'fas fa-file-video', avi: 'fas fa-file-video', mov: 'fas fa-file-video', webm: 'fas fa-file-video',
      mp3: 'fas fa-file-audio', wav: 'fas fa-file-audio', ogg: 'fas fa-file-audio',
      js: 'fas fa-file-code', jsx: 'fas fa-file-code', ts: 'fas fa-file-code',
      html: 'fas fa-file-code', css: 'fas fa-file-code', json: 'fas fa-file-code',
      txt: 'fas fa-file-alt', md: 'fas fa-file-alt'
    };
    return iconMap[ext] || 'fas fa-file';
  };

  const getFileColor = (file) => {
    if (file.type === 'directory') return '#f59e0b';
    if (file.type === 'image') return '#10b981';
    const ext = file.name.split('.').pop().toLowerCase();
    const colorMap = {
      pdf: '#ef4444', doc: '#3b82f6', docx: '#3b82f6',
      xls: '#22c55e', xlsx: '#22c55e', csv: '#22c55e',
      mp4: '#8b5cf6', avi: '#8b5cf6', mov: '#8b5cf6',
      mp3: '#ec4899', wav: '#ec4899',
      zip: '#f97316', rar: '#f97316'
    };
    return colorMap[ext] || '#6b7280';
  };

  // Breadcrumb
  const getBreadcrumbs = () => {
    if (currentPath === '/') return [{ name: t('home'), path: '/' }];
    const parts = currentPath.split('/').filter(Boolean);
    const crumbs = [{ name: t('home'), path: '/' }];
    let acc = '';
    for (const part of parts) {
      acc += '/' + part;
      crumbs.push({ name: part, path: acc });
    }
    return crumbs;
  };

  return (
    <div className="page-container">
      <MenuBar />
      <div className="stockage-page">
        {/* Header */}
        <div className="stockage-header">
          <div className="stockage-header-left">
            <button className="stockage-back-btn" onClick={() => navigate('/')}>
              <i className="fas fa-arrow-left"></i> {t('backToHome')}
            </button>
            <h1><i className="fas fa-database"></i> {t('title')}</h1>
            <p className="stockage-subtitle">{t('subtitle')}</p>
          </div>
          {storageUsage && (
            <div className="stockage-usage">
              <div className="stockage-usage-text">
                <i className="fas fa-hdd"></i>
                <span>{t('usage')} : <strong>{formatSize(storageUsage.totalBytes || 0)}</strong></span>
                {storageUsage.limitBytes && (
                  <span className="stockage-usage-quota"> {t('of')} {formatSize(storageUsage.limitBytes)}</span>
                )}
              </div>
              {storageUsage.limitBytes && (
                <div className="stockage-usage-bar">
                  <div 
                    className="stockage-usage-fill"
                    style={{ width: `${Math.min(100, ((storageUsage.totalBytes || 0) / storageUsage.limitBytes) * 100)}%` }}
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Toolbar */}
        <div className="stockage-toolbar">
          <div className="stockage-toolbar-left">
            {/* Breadcrumb */}
            <div className="stockage-breadcrumb">
              {getBreadcrumbs().map((crumb, i) => (
                <span key={crumb.path}>
                  {i > 0 && <i className="fas fa-chevron-right stockage-breadcrumb-sep"></i>}
                  <button 
                    className={`stockage-breadcrumb-item ${crumb.path === currentPath ? 'active' : ''}`}
                    onClick={() => { setPathHistory(['/']); setCurrentPath(crumb.path); setSelectedFiles([]); }}
                  >
                    {i === 0 && <i className="fas fa-home"></i>} {crumb.name}
                  </button>
                </span>
              ))}
            </div>
          </div>
          <div className="stockage-toolbar-right">
            {/* Actions */}
            <label className="stockage-btn stockage-btn-primary" style={{ opacity: isUploading ? 0.7 : 1 }}>
              {isUploading ? (
                <><i className="fas fa-spinner fa-spin"></i> {t('uploading')}</>
              ) : (
                <><i className="fas fa-upload"></i> {t('upload')}</>
              )}
              <input 
                type="file" 
                multiple 
                style={{ display: 'none' }} 
                onChange={(e) => handleFileUpload(e.target.files)}
                disabled={isUploading}
              />
            </label>
            <button className="stockage-btn stockage-btn-secondary" onClick={() => setShowNewFolderModal(true)}>
              <i className="fas fa-folder-plus"></i> {t('newFolder')}
            </button>
            {selectedFiles.length > 0 && (
              <button className="stockage-btn stockage-btn-danger" onClick={handleDeleteSelected}>
                <i className="fas fa-trash"></i> {t('delete')} ({selectedFiles.length})
              </button>
            )}
            <div className="stockage-view-toggle">
              <button 
                className={`stockage-view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                onClick={() => setViewMode('grid')}
                title={t('grid')}
              >
                <i className="fas fa-th"></i>
              </button>
              <button 
                className={`stockage-view-btn ${viewMode === 'list' ? 'active' : ''}`}
                onClick={() => setViewMode('list')}
                title={t('list')}
              >
                <i className="fas fa-list"></i>
              </button>
            </div>
          </div>
        </div>

        {/* Zone de contenu avec Drag & Drop */}
        <div 
          className={`stockage-content ${isDragging ? 'dragging' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {isDragging && (
            <div className="stockage-drop-overlay">
              <i className="fas fa-cloud-upload-alt"></i>
              <p>{t('dragDrop')}</p>
            </div>
          )}

          {isLoading ? (
            <div className="stockage-loading">
              <i className="fas fa-spinner fa-spin"></i>
              <p>{t('loading')}</p>
            </div>
          ) : sortedFiles.length === 0 ? (
            <div className="stockage-empty">
              <i className="fas fa-folder-open"></i>
              <p>{t('emptyFolder')}</p>
              <p className="stockage-empty-hint">{t('dragDrop')}</p>
            </div>
          ) : viewMode === 'grid' ? (
            /* Vue Grille */
            <div className="stockage-grid">
              {sortedFiles.map((file) => (
                <div 
                  key={file.path}
                  className={`stockage-grid-item ${selectedFiles.includes(file.path) ? 'selected' : ''}`}
                  onClick={() => {
                    if (file.type === 'directory') {
                      navigateToFolder(file.path);
                    } else {
                      toggleFileSelection(file.path);
                    }
                  }}
                  onDoubleClick={() => {
                    if (file.type === 'image') openPreview(file);
                  }}
                >
                  <div className="stockage-grid-item-check">
                    <input 
                      type="checkbox"
                      checked={selectedFiles.includes(file.path)}
                      onChange={(e) => { e.stopPropagation(); toggleFileSelection(file.path); }}
                    />
                  </div>
                  {file.type === 'image' && file.thumbnailUrl ? (
                    <div className="stockage-grid-thumb">
                      <AuthImage 
                        src={`${API_BASE_URL}${file.thumbnailUrl}`} 
                        alt={file.name}
                      />
                    </div>
                  ) : (
                    <div className="stockage-grid-icon" style={{ color: getFileColor(file) }}>
                      <i className={getFileIcon(file)}></i>
                    </div>
                  )}
                  <div className="stockage-grid-name" title={file.name}>{file.name}</div>
                  <div className="stockage-grid-meta">
                    {file.type === 'directory' 
                      ? `${file.count || 0} ${t('files')}` 
                      : formatSize(file.size)}
                  </div>
                  <div className="stockage-grid-actions">
                    {file.type !== 'directory' && (
                      <>
                        {file.type === 'image' && (
                          <button title={t('preview')} onClick={(e) => { e.stopPropagation(); openPreview(file); }}>
                            <i className="fas fa-eye"></i>
                          </button>
                        )}
                        <button title={t('download')} onClick={(e) => { e.stopPropagation(); handleDownload(file); }}>
                          <i className="fas fa-download"></i>
                        </button>
                        <button title={t('move')} onClick={(e) => { e.stopPropagation(); openMoveModal(file); }}>
                          <i className="fas fa-arrows-alt"></i>
                        </button>
                      </>
                    )}
                    <button title={t('delete')} onClick={(e) => { e.stopPropagation(); handleDelete(file.path); }}>
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Vue Liste */
            <div className="stockage-list">
              <div className="stockage-list-header">
                <div className="stockage-list-check">
                  <input 
                    type="checkbox"
                    checked={selectedFiles.length === files.filter(f => f.type !== 'directory').length && files.length > 0}
                    onChange={() => {
                      if (selectedFiles.length === files.filter(f => f.type !== 'directory').length) {
                        setSelectedFiles([]);
                      } else {
                        setSelectedFiles(files.filter(f => f.type !== 'directory').map(f => f.path));
                      }
                    }}
                  />
                </div>
                <div className="stockage-list-col-name" onClick={() => { setSortBy('name'); setSortOrder(s => s === 'asc' ? 'desc' : 'asc'); }}>
                  {t('name')} {sortBy === 'name' && <i className={`fas fa-sort-${sortOrder === 'asc' ? 'up' : 'down'}`}></i>}
                </div>
                <div className="stockage-list-col-size" onClick={() => { setSortBy('size'); setSortOrder(s => s === 'asc' ? 'desc' : 'asc'); }}>
                  {t('size')} {sortBy === 'size' && <i className={`fas fa-sort-${sortOrder === 'asc' ? 'up' : 'down'}`}></i>}
                </div>
                <div className="stockage-list-col-date" onClick={() => { setSortBy('date'); setSortOrder(s => s === 'asc' ? 'desc' : 'asc'); }}>
                  {t('modified')} {sortBy === 'date' && <i className={`fas fa-sort-${sortOrder === 'asc' ? 'up' : 'down'}`}></i>}
                </div>
                <div className="stockage-list-col-actions"></div>
              </div>
              {sortedFiles.map((file) => (
                <div 
                  key={file.path}
                  className={`stockage-list-row ${selectedFiles.includes(file.path) ? 'selected' : ''}`}
                  onClick={() => {
                    if (file.type === 'directory') navigateToFolder(file.path);
                    else toggleFileSelection(file.path);
                  }}
                >
                  <div className="stockage-list-check">
                    <input 
                      type="checkbox"
                      checked={selectedFiles.includes(file.path)}
                      onChange={(e) => { e.stopPropagation(); toggleFileSelection(file.path); }}
                    />
                  </div>
                  <div className="stockage-list-col-name">
                    <i className={getFileIcon(file)} style={{ color: getFileColor(file), marginRight: '10px' }}></i>
                    {file.name}
                  </div>
                  <div className="stockage-list-col-size">
                    {file.type === 'directory' ? `${file.count || 0} ${t('files')}` : formatSize(file.size)}
                  </div>
                  <div className="stockage-list-col-date">{formatDate(file.modifiedAt)}</div>
                  <div className="stockage-list-col-actions">
                    {file.type === 'image' && (
                      <button title={t('preview')} onClick={(e) => { e.stopPropagation(); openPreview(file); }}>
                        <i className="fas fa-eye"></i>
                      </button>
                    )}
                    {file.type !== 'directory' && (
                      <>
                        <button title={t('download')} onClick={(e) => { e.stopPropagation(); handleDownload(file); }}>
                          <i className="fas fa-download"></i>
                        </button>
                        <button title={t('move')} onClick={(e) => { e.stopPropagation(); openMoveModal(file); }}>
                          <i className="fas fa-arrows-alt"></i>
                        </button>
                      </>
                    )}
                    <button title={t('delete')} onClick={(e) => { e.stopPropagation(); handleDelete(file.path); }}>
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal nouveau dossier */}
        {showNewFolderModal && (
          <div className="stockage-modal-overlay" onClick={() => setShowNewFolderModal(false)}>
            <div className="stockage-modal" onClick={(e) => e.stopPropagation()}>
              <h3><i className="fas fa-folder-plus"></i> {t('newFolder')}</h3>
              <input
                type="text"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder={t('folderName')}
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && handleCreateFolder()}
              />
              <div className="stockage-modal-buttons">
                <button className="stockage-btn stockage-btn-secondary" onClick={() => setShowNewFolderModal(false)}>
                  {t('cancel')}
                </button>
                <button className="stockage-btn stockage-btn-primary" onClick={handleCreateFolder}>
                  {t('create')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal déplacer fichier */}
        {showMoveModal && moveFile && (
          <div className="stockage-modal-overlay" onClick={() => setShowMoveModal(false)}>
            <div className="stockage-modal" onClick={(e) => e.stopPropagation()}>
              <h3><i className="fas fa-arrows-alt"></i> {t('moveTo')}</h3>
              <p style={{ marginBottom: '15px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                {moveFile.name}
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {currentPath !== '/' && (
                  <button 
                    className="stockage-btn stockage-btn-secondary" 
                    style={{ width: '100%', justifyContent: 'flex-start' }}
                    onClick={() => handleMoveFile('/')}
                  >
                    <i className="fas fa-home"></i> {t('moveToRoot')}
                  </button>
                )}
                {availableFolders.map(folder => (
                  <button 
                    key={folder.path}
                    className="stockage-btn stockage-btn-secondary" 
                    style={{ width: '100%', justifyContent: 'flex-start' }}
                    onClick={() => handleMoveFile(folder.path)}
                  >
                    <i className="fas fa-folder" style={{ color: '#f59e0b' }}></i> {folder.name}
                  </button>
                ))}
                {availableFolders.length === 0 && currentPath === '/' && (
                  <p style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.85rem', padding: '10px' }}>
                    Aucun dossier disponible
                  </p>
                )}
              </div>
              <div className="stockage-modal-buttons">
                <button className="stockage-btn stockage-btn-secondary" onClick={() => setShowMoveModal(false)}>
                  {t('cancel')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal aperçu image */}
        {previewFile && (
          <div className="stockage-modal-overlay" onClick={closePreview}>
            <div className="stockage-preview-modal" onClick={(e) => e.stopPropagation()}>
              <div className="stockage-preview-header">
                <h3>{previewFile.name}</h3>
                <button onClick={closePreview}><i className="fas fa-times"></i></button>
              </div>
              <div className="stockage-preview-body">
                {previewBlobUrl ? (
                  <img src={previewBlobUrl} alt={previewFile.name} />
                ) : (
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '40px' }}>
                    <i className="fas fa-spinner fa-spin" style={{ fontSize: '2rem', color: 'var(--text-secondary)' }}></i>
                  </div>
                )}
              </div>
              <div className="stockage-preview-footer">
                <span>{formatSize(previewFile.size)}</span>
                <button className="stockage-btn stockage-btn-primary" onClick={() => handleDownload(previewFile)}>
                  <i className="fas fa-download"></i> {t('download')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StockagePage;
