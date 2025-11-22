import React, { useState, useEffect } from 'react';
import { dropboxService } from '../../services/dropboxService';

const FileList = ({ path = '', onFileSelect }) => {
  const [files, setFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPath, setCurrentPath] = useState(path);

  const fetchFiles = async (pathToFetch) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Si c'est la racine, on utilise le chemin de base
      const fullPath = pathToFetch || currentPath || '';
      const fileList = await dropboxService.listFiles(fullPath);
      
      // Trier les dossiers d'abord, puis les fichiers
      const sortedFiles = [...fileList].sort((a, b) => {
        if (a['.tag'] === 'folder' && b['.tag'] !== 'folder') return -1;
        if (a['.tag'] !== 'folder' && b['.tag'] === 'folder') return 1;
        return a.name.localeCompare(b.name);
      });
      
      setFiles(sortedFiles);
      setCurrentPath(fullPath);
    } catch (err) {
      console.error('Erreur lors de la récupération des fichiers:', err);
      setError('Impossible de charger les fichiers. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles(path);
  }, [path]);

  const handleFileClick = (file) => {
    if (file['.tag'] === 'folder') {
      fetchFiles(file.path_display);
    } else if (onFileSelect) {
      onFileSelect(file);
    }
  };

  const handleBack = () => {
    if (!currentPath) return;
    
    // Remonter d'un niveau
    const pathParts = currentPath.split('/').filter(Boolean);
    pathParts.pop(); // Enlever le dernier élément
    const newPath = pathParts.join('/');
    
    fetchFiles(newPath || '');
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const filteredFiles = files.filter(file => 
    file.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-700 rounded-md">
        <p>{error}</p>
        <button 
          onClick={() => fetchFiles(currentPath)}
          className="mt-2 px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200"
        >
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-4 border-b">
        <div className="flex items-center space-x-2 mb-4">
          {currentPath && (
            <button
              onClick={handleBack}
              className="p-2 text-gray-500 hover:text-gray-700"
              title="Dossier parent"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}
          <div className="flex-1">
            <input
              type="text"
              placeholder="Rechercher des fichiers..."
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        <div className="text-sm text-gray-500 mb-2">
          {currentPath || 'Dossier racine'}
        </div>
      </div>

      <div className="overflow-y-auto" style={{ maxHeight: '400px' }}>
        {filteredFiles.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            Aucun fichier trouvé
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nom
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Taille
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Modifié
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredFiles.map((file) => (
                <tr 
                  key={file.id} 
                  className={`hover:bg-gray-50 cursor-pointer ${file['.tag'] === 'folder' ? 'font-medium' : ''}`}
                  onClick={() => handleFileClick(file)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {file['.tag'] === 'folder' ? (
                        <svg className="h-5 w-5 text-yellow-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                        </svg>
                      ) : (
                        <svg className="h-5 w-5 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      )}
                      <span className="truncate max-w-xs">{file.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {file['.tag'] === 'file' ? formatFileSize(file.size) : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(file.client_modified || file.server_modified).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default FileList;
