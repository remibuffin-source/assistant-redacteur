import React, { useCallback, useState, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { dropboxService } from '../../services/dropboxService';

const FileUploader = ({ onUploadComplete, path = '' }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const uploadProgress = useRef({});

  const onDrop = useCallback(async (acceptedFiles) => {
    if (!acceptedFiles.length) return;

    setIsUploading(true);
    const results = [];
    
    for (const file of acceptedFiles) {
      try {
        uploadProgress.current[file.name] = 0;
        
        // Simuler la progression pour les petits fichiers
        const progressInterval = setInterval(() => {
          uploadProgress.current[file.name] = Math.min(
            uploadProgress.current[file.name] + 10,
            90
          );
          updateTotalProgress();
        }, 200);

        await dropboxService.uploadFile(file, path);
        
        clearInterval(progressInterval);
        uploadProgress.current[file.name] = 100;
        updateTotalProgress();
        
        results.push({
          name: file.name,
          status: 'success',
          path: `${path}/${file.name}`
        });
      } catch (error) {
        console.error(`Erreur lors du téléversement de ${file.name}:`, error);
        results.push({
          name: file.name,
          status: 'error',
          error: error.message
        });
      } finally {
        delete uploadProgress.current[file.name];
      }
    }

    setIsUploading(false);
    if (onUploadComplete) {
      onUploadComplete(results);
    }
  }, [path, onUploadComplete]);

  const updateTotalProgress = () => {
    const files = Object.keys(uploadProgress.current);
    if (files.length === 0) {
      setProgress(0);
      return;
    }
    
    const total = files.reduce((sum, file) => sum + uploadProgress.current[file], 0);
    setProgress(Math.round(total / files.length));
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    disabled: isUploading,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif'],
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    }
  });

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragActive
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-blue-400'
        } ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <input {...getInputProps()} />
        <div className="space-y-2">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            stroke="currentColor"
            fill="none"
            viewBox="0 0 48 48"
            aria-hidden="true"
          >
            <path
              d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <div className="flex text-sm text-gray-600">
            <p className="pl-1">
              {isDragActive
                ? 'Déposez les fichiers ici...'
                : 'Glissez-déposez des fichiers ici, ou cliquez pour sélectionner'}
            </p>
          </div>
          <p className="text-xs text-gray-500">
            Formats supportés : JPG, PNG, GIF, PDF, DOC, DOCX (max 10 Mo)
          </p>
        </div>
      </div>

      {isUploading && (
        <div className="mt-4">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Téléversement en cours...</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUploader;
