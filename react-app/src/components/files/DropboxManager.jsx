import React, { useState } from 'react';
import { dropboxService } from '../../services/dropboxService';
import FileUploader from './FileUploader';
import FileList from './FileList';

const DropboxManager = () => {
  const [currentPath, setCurrentPath] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  const handleUploadComplete = () => {
    // Rafraîchir la liste des fichiers après un téléversement réussi
    setRefreshKey(prev => prev + 1);
  };

  const handleFileSelect = (file) => {
    // Afficher les détails du fichier ou le télécharger
    console.log('Fichier sélectionné:', file);
    
    // Télécharger le fichier s'il n'est pas un dossier
    if (file['.tag'] !== 'folder') {
      dropboxService.downloadFile(file.path_display)
        .then(blob => {
          // Créer un lien de téléchargement
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = file.name;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
        })
        .catch(error => {
          console.error('Erreur lors du téléchargement:', error);
          alert('Impossible de télécharger le fichier');
        });
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Gestion des fichiers Dropbox
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Téléversez et gérez vos fichiers dans votre espace Dropbox
          </p>
        </div>
        
        <div className="px-4 py-5 sm:p-6">
          <>
            <div className="mb-6">
              <FileUploader 
                path={currentPath} 
                onUploadComplete={handleUploadComplete} 
              />
            </div>
            
            <div className="mt-8">
              <h4 className="text-lg font-medium text-gray-900 mb-4">
                Mes fichiers {currentPath && `dans ${currentPath}`}
              </h4>
              <FileList 
                key={refreshKey}
                path={currentPath}
                onFileSelect={handleFileSelect}
              />
            </div>
          </>
        </div>
      </div>
    </div>
  );
};

export default DropboxManager;
