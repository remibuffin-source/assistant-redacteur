import { useState, useRef } from 'react';

const UploadArea = ({ content, onContentChange, onRecordingToggle, onDictationToggle }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isDictating, setIsDictating] = useState(false);
  const fileInputRef = useRef(null);

  const handleContentChange = (value) => {
    onContentChange(value);
  };

  const handleDirectInput = () => {
    const textarea = document.getElementById('directTextInput');
    if (textarea) {
      textarea.focus();
    }
  };

  const handleDictationToggle = () => {
    setIsDictating(!isDictating);
    onDictationToggle();
  };

  const handleRecordingToggle = () => {
    setIsRecording(!isRecording);
    onRecordingToggle();
  };

  const handleFileUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        handleContentChange(`Fichier chargé : ${file.name}\n\n${e.target.result}`);
      };
      reader.readAsText(file);
    }
  };

  const handleExtractFromWeb = () => {
    const url = prompt('Entrez l\'URL à extraire :');
    if (url) {
      handleContentChange(`Extraction en cours depuis : ${url}`);
      setTimeout(() => {
        handleContentChange(`Contenu extrait depuis : ${url}\n\n[Simulation du contenu extrait]`);
      }, 2000);
    }
  };

  return (
    <div className="section">
      <h3 className="section-title">
        <i className="fas fa-cloud-upload-alt"></i>
        Zone de Collecte
      </h3>
      
      <div className="upload-area-large" id="uploadArea">
        <textarea 
          id="directTextInput"
          placeholder="Collez votre contenu ici ou utilisez les boutons ci-dessous..."
          value={content}
          onChange={(e) => handleContentChange(e.target.value)}
        />
      </div>
      
      <div className="upload-buttons-grid">
        <button className="upload-btn-large" onClick={handleDirectInput}>
          <i className="fas fa-edit"></i>
          <div className="tooltip-text">Saisie directe</div>
        </button>
        
        <button 
          className={`upload-btn-large ${isDictating ? 'active' : ''}`}
          onClick={handleDictationToggle}
        >
          <i className="fas fa-microphone"></i>
          <div className="tooltip-text">Dictée vocale</div>
        </button>
        
        <button 
          className={`upload-btn-large ${isRecording ? 'active' : ''}`}
          onClick={handleRecordingToggle}
        >
          <i className="fas fa-wave-square"></i>
          <div className="tooltip-text">Enregistrement audio</div>
        </button>
        
        <button className="upload-btn-large" onClick={handleFileUpload}>
          <i className="fas fa-file-upload"></i>
          <div className="tooltip-text">Charger un fichier</div>
        </button>
        
        <button className="upload-btn-large" onClick={handleExtractFromWeb}>
          <i className="fas fa-globe"></i>
          <div className="tooltip-text">Extraire du web</div>
        </button>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        accept=".txt,.pdf,.doc,.docx"
        onChange={handleFileSelect}
      />
    </div>
  );
};

export default UploadArea;