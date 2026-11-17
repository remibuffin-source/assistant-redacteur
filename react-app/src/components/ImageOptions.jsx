import React from 'react';
import './ImageOptions.css';

const ImageOptions = ({ options, onOptionsChange }) => {
  const handleChange = (field, value) => {
    onOptionsChange({ ...options, [field]: value });
  };

  return (
    <div className="section-compact image-options-section">
      <h3 className="section-title-compact">
        <i className="fas fa-sliders-h"></i>
        Options de génération d'image
      </h3>
      
      <div className="image-options-grid">
        {/* Nombre d'images */}
        <div className="option-group">
          <label>Nombre d'images</label>
          <div className="option-controls">
            {[1, 2, 3, 4].map(num => (
              <button
                key={num}
                className={`option-btn ${options.count === num ? 'active' : ''}`}
                onClick={() => handleChange('count', num)}
              >
                {num}
              </button>
            ))}
          </div>
        </div>

        {/* Format / Ratio */}
        <div className="option-group">
          <label>Format</label>
          <div className="option-controls">
            <button
              className={`option-btn ${options.ratio === 'square' ? 'active' : ''}`}
              onClick={() => handleChange('ratio', 'square')}
              title="Carré (1:1)"
            >
              <i className="far fa-square"></i> Carré
            </button>
            <button
              className={`option-btn ${options.ratio === 'portrait' ? 'active' : ''}`}
              onClick={() => handleChange('ratio', 'portrait')}
              title="Portrait (9:16)"
            >
              <i className="fas fa-mobile-alt"></i> Portrait
            </button>
            <button
              className={`option-btn ${options.ratio === 'landscape' ? 'active' : ''}`}
              onClick={() => handleChange('ratio', 'landscape')}
              title="Paysage (16:9)"
            >
              <i className="fas fa-tv"></i> Paysage
            </button>
          </div>
        </div>

        {/* Taille / Qualité */}
        <div className="option-group">
          <label>Taille</label>
          <div className="option-controls">
            <button
              className={`option-btn ${options.size === 'standard' ? 'active' : ''}`}
              onClick={() => handleChange('size', 'standard')}
            >
              Standard
            </button>
            <button
              className={`option-btn ${options.size === 'hd' ? 'active' : ''}`}
              onClick={() => handleChange('size', 'hd')}
            >
              HD
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageOptions;
