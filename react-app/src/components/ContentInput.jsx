import { useState, useEffect } from 'react';

const ContentInput = ({ content, onContentChange }) => {
  const [inputContent, setInputContent] = useState('');

  useEffect(() => {
    if (content) {
      setInputContent(content);
    }
  }, [content]);

  const handleContentChange = (value) => {
    setInputContent(value);
    onContentChange(value);
  };

  return (
    <div className="section fade-in">
      <h3 className="section-title">
        <i className="fas fa-cloud-upload-alt"></i>
        Zone de Collecte
      </h3>
      
      <div className="form-group">
        <label htmlFor="contentInput">Contenu à traiter</label>
        <textarea
          id="contentInput"
          placeholder="Collez votre contenu ici..."
          value={inputContent}
          onChange={(e) => handleContentChange(e.target.value)}
        />
      </div>
    </div>
  );
};

export default ContentInput;