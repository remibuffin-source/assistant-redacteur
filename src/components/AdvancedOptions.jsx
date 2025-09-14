import { useState, useEffect } from 'react';

const AdvancedOptions = ({ options, onOptionsChange }) => {
  const [localOptions, setLocalOptions] = useState({
    style: 'professionnel',
    length: 3,
    creativity: 3,
    adaptation: 'web'
  });

  useEffect(() => {
    if (options) {
      setLocalOptions(options);
    }
  }, [options]);

  const handleOptionChange = (field, value) => {
    const newOptions = { ...localOptions, [field]: value };
    setLocalOptions(newOptions);
    onOptionsChange(newOptions);
  };

  const updateLengthTooltip = (value) => {
    const lengths = {
      1: "20% - Très court",
      2: "40% - Court",
      3: "60% - Moyen",
      4: "80% - Long",
      5: "100% - Très long"
    };
    return lengths[value];
  };

  return (
    <div className="section">
      <h3 className="section-title">
        <i className="fas fa-sliders-h"></i>
        Personnalisation avancée
      </h3>
      
      <div className="advanced-options-grid">
        {/* Style et état d'esprit */}
        <div className="option-group-original">
          <h4>Style et état d'esprit</h4>
          <div className="radio-group-original">
            <label>
              <input 
                type="radio" 
                name="style" 
                value="professionnel" 
                checked={localOptions.style === 'professionnel'}
                onChange={(e) => handleOptionChange('style', e.target.value)}
              />
              Professionnel
            </label>
            <label>
              <input 
                type="radio" 
                name="style" 
                value="creatif" 
                checked={localOptions.style === 'creatif'}
                onChange={(e) => handleOptionChange('style', e.target.value)}
              />
              Créatif
            </label>
            <label>
              <input 
                type="radio" 
                name="style" 
                value="academique" 
                checked={localOptions.style === 'academique'}
                onChange={(e) => handleOptionChange('style', e.target.value)}
              />
              Académique
            </label>
            <label>
              <input 
                type="radio" 
                name="style" 
                value="decontracte" 
                checked={localOptions.style === 'decontracte'}
                onChange={(e) => handleOptionChange('style', e.target.value)}
              />
              Décontracté
            </label>
            <label>
              <input 
                type="radio" 
                name="style" 
                value="persuasif" 
                checked={localOptions.style === 'persuasif'}
                onChange={(e) => handleOptionChange('style', e.target.value)}
              />
              Persuasif
            </label>
            <label>
              <input 
                type="radio" 
                name="style" 
                value="informatif" 
                checked={localOptions.style === 'informatif'}
                onChange={(e) => handleOptionChange('style', e.target.value)}
              />
              Informatif
            </label>
          </div>
        </div>

        {/* Longueur du contenu et créativité */}
        <div className="option-group-original">
          <h4>Longueur du contenu</h4>
          <div className="slider-container-original length-slider-container">
            <label>Court</label>
            <input 
              type="range" 
              id="lengthSlider" 
              min="1" 
              max="5" 
              value={localOptions.length}
              onChange={(e) => handleOptionChange('length', parseInt(e.target.value))}
            />
            <label>Long</label>
            <div className="length-tooltip">
              {updateLengthTooltip(localOptions.length)}
            </div>
          </div>
          
          <h4 style={{ marginTop: '22px' }}>Niveau de créativité</h4>
          <div className="slider-container-original">
            <label>Conservateur</label>
            <input 
              type="range" 
              id="creativitySlider" 
              min="1" 
              max="5" 
              value={localOptions.creativity}
              onChange={(e) => handleOptionChange('creativity', parseInt(e.target.value))}
            />
            <label>Créatif</label>
          </div>
        </div>

        {/* Adaptation au média */}
        <div className="option-group-original">
          <h4>Adaptation au média</h4>
          <div className="radio-group-original">
            <label>
              <input 
                type="radio" 
                name="adaptation" 
                value="web" 
                checked={localOptions.adaptation === 'web'}
                onChange={(e) => handleOptionChange('adaptation', e.target.value)}
              />
              Web/Digital
            </label>
            <label>
              <input 
                type="radio" 
                name="adaptation" 
                value="print" 
                checked={localOptions.adaptation === 'print'}
                onChange={(e) => handleOptionChange('adaptation', e.target.value)}
              />
              Littéraire/Print
            </label>
            <label>
              <input 
                type="radio" 
                name="adaptation" 
                value="social" 
                checked={localOptions.adaptation === 'social'}
                onChange={(e) => handleOptionChange('adaptation', e.target.value)}
              />
              Réseaux sociaux
            </label>
            <label>
              <input 
                type="radio" 
                name="adaptation" 
                value="presentation" 
                checked={localOptions.adaptation === 'presentation'}
                onChange={(e) => handleOptionChange('adaptation', e.target.value)}
              />
              Présentation
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedOptions;