import { useState, useEffect, useRef } from 'react';
import { DEEPL_LANGUAGES, detectTargetLanguage } from '../utils/languageDetector';

const ProjectInfo = ({ data, onDataChange }) => {
  const projectTitleRef = useRef(null);
  const targetAudienceRef = useRef(null);
  const toneRef = useRef(null);
  const projectDescriptionRef = useRef(null);
  const [formData, setFormData] = useState({
    projectTitle: '',
    targetAudience: '',
    tone: '',
    projectDescription: '',
    targetLanguage: 'EN' // Langue cible pour DeepL
  });
  const [detectedLanguage, setDetectedLanguage] = useState(null);

  useEffect(() => {
    if (data) {
      setFormData(data);
    }
  }, [data]);

  const handleInputChange = (field, value) => {
    const newData = { ...formData, [field]: value };
    setFormData(newData);
    onDataChange(newData);
    
    // Détection intelligente de la langue dans la description
    if (field === 'projectDescription' && value) {
      const detected = detectTargetLanguage(value);
      setDetectedLanguage(detected);
    }
  };

  // Force l'écriture dans les zones de texte avec JavaScript - SOLUTION ULTRA-RADICALE
  useEffect(() => {
    const forceTextInputs = () => {
      const inputs = [
        projectTitleRef.current,
        targetAudienceRef.current,
        toneRef.current,
        projectDescriptionRef.current
      ];

      inputs.forEach(input => {
        if (input) {
          // Supprime tous les styles existants et force les nouveaux
          input.removeAttribute('style');
          input.removeAttribute('readonly');
          input.removeAttribute('disabled');
          
          // Force les propriétés d'écriture avec setProperty pour éviter l'écrasement
          input.style.setProperty('pointer-events', 'auto', 'important');
          input.style.setProperty('user-select', 'text', 'important');
          input.style.setProperty('-webkit-user-select', 'text', 'important');
          input.style.setProperty('-moz-user-select', 'text', 'important');
          input.style.setProperty('-ms-user-select', 'text', 'important');
          input.style.setProperty('cursor', 'text', 'important');
          input.style.setProperty('z-index', '10000', 'important');
          input.style.setProperty('position', 'relative', 'important');
          input.style.setProperty('background-color', 'rgba(255, 255, 255, 0.97)', 'important');
          input.style.setProperty('color', '#1a1a1a', 'important');
          input.style.setProperty('border', '1px solid rgba(255, 255, 255, 0.3)', 'important');
          input.style.setProperty('border-radius', '10px', 'important');
          input.style.setProperty('padding', input.tagName === 'TEXTAREA' ? '15px' : '10px 12px', 'important');
          input.style.setProperty('font-size', '14px', 'important');
          input.style.setProperty('font-family', "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif", 'important');
          input.style.setProperty('direction', 'ltr', 'important');
          input.style.setProperty('text-align', 'left', 'important');
          input.style.setProperty('outline', 'none', 'important');
          input.style.setProperty('-webkit-appearance', 'none', 'important');
          input.style.setProperty('-moz-appearance', 'none', 'important');
          input.style.setProperty('appearance', 'none', 'important');
          input.style.setProperty('opacity', '1', 'important');
          input.style.setProperty('visibility', 'visible', 'important');
          input.style.setProperty('display', 'block', 'important');
          input.style.setProperty('width', '100%', 'important');
          input.style.setProperty('box-sizing', 'border-box', 'important');
          
          // Propriétés ultra-forcées (sans contentEditable qui bloque la saisie)
          input.style.setProperty('-webkit-user-modify', 'read-write', 'important');
          input.style.setProperty('-moz-user-modify', 'read-write', 'important');
          input.style.setProperty('user-modify', 'read-write', 'important');
          input.style.setProperty('-webkit-text-fill-color', '#1a1a1a', 'important');

          // Force les attributs HTML (sans contenteditable)
          input.setAttribute('spellcheck', 'false');
          input.removeAttribute('readonly');
          input.removeAttribute('disabled');
          input.removeAttribute('contenteditable'); // S'assurer que contenteditable est retiré
          
          // Événements pour s'assurer que l'input fonctionne
          input.addEventListener('focus', (e) => {
            e.target.style.setProperty('border-color', '#ff6b2c', 'important');
            e.target.style.setProperty('box-shadow', '0 0 0 2px rgba(255, 107, 44, 0.2)', 'important');
          });
          
          input.addEventListener('blur', (e) => {
            e.target.style.setProperty('border-color', 'rgba(255, 255, 255, 0.3)', 'important');
            e.target.style.setProperty('box-shadow', 'none', 'important');
          });
          
          // Force le focus pour tester
          input.addEventListener('click', (e) => {
            e.target.focus();
          });
        }
      });
    };

    // Applique immédiatement et répète plusieurs fois
    forceTextInputs();
    const timer1 = setTimeout(forceTextInputs, 100);
    const timer2 = setTimeout(forceTextInputs, 500);
    const timer3 = setTimeout(forceTextInputs, 1000);
    
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, []);

  return (
    <div className="section">
      <h3 className="section-title project-info-title">
        <i className="fas fa-info-circle"></i>
        Informations du Projet
      </h3>
      
      {/* Nouvelle disposition: 3 champs sur une ligne horizontale */}
      <div className="project-info-layout" style={{ marginTop: '15px' }}>
        <div className="project-fields-horizontal">
          <div className="form-group" style={{ flex: '1', marginRight: '15px' }}>
            <label htmlFor="projectTitle">Titre du projet</label>
            <input
              ref={projectTitleRef}
              type="text"
              id="projectTitle"
              placeholder="Nom de votre projet"
              value={formData.projectTitle}
              onChange={(e) => handleInputChange('projectTitle', e.target.value)}
              style={{ height: '38px' }}
            />
          </div>

          <div className="form-group tooltip-container" data-tooltip="Décrivez précisément qui sont vos lecteurs cibles : âge, profession, centres d'intérêt, niveau d'expertise, besoins spécifiques" style={{ flex: '1', marginRight: '15px' }}>
            <label htmlFor="targetAudience">Public cible</label>
            <input
              ref={targetAudienceRef}
              type="text"
              id="targetAudience"
              placeholder="Votre audience"
              value={formData.targetAudience}
              onChange={(e) => handleInputChange('targetAudience', e.target.value)}
              style={{ height: '38px' }}
            />
          </div>

          <div className="form-group tooltip-container" data-tooltip="Définissez le style de communication souhaité : professionnel, décontracté, expert, pédagogique, commercial, inspirant, technique, etc." style={{ flex: '1' }}>
            <label htmlFor="tone">Ton souhaité</label>
            <input
              ref={toneRef}
              type="text"
              id="tone"
              placeholder="Style de rédaction"
              value={formData.tone}
              onChange={(e) => handleInputChange('tone', e.target.value)}
              style={{ height: '38px' }}
            />
          </div>
        </div>

        {/* Langue cible pour DeepL */}
        <div className="project-language" style={{ marginTop: '20px' }}>
          <div className="form-group tooltip-container" data-tooltip="Sélectionnez la langue cible pour la traduction DeepL. Vous pouvez aussi écrire 'traduire en anglais' dans la description, DeepL le comprendra !">
            <label htmlFor="targetLanguage">
              <i className="fas fa-globe" style={{ marginRight: '8px', color: '#ff6b2c' }}></i>
              Langue Cible (pour DeepL)
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <select
                id="targetLanguage"
                value={formData.targetLanguage}
                onChange={(e) => handleInputChange('targetLanguage', e.target.value)}
                style={{
                  flex: '1',
                  height: '38px',
                  padding: '0 12px',
                  backgroundColor: 'rgba(255, 255, 255, 0.97)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  borderRadius: '10px',
                  fontSize: '14px',
                  color: '#1a1a1a',
                  cursor: 'pointer',
                  outline: 'none'
                }}
              >
                {DEEPL_LANGUAGES.map(lang => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name} ({lang.nativeName})
                  </option>
                ))}
              </select>
              {detectedLanguage && detectedLanguage !== formData.targetLanguage && (
                <button
                  type="button"
                  onClick={() => handleInputChange('targetLanguage', detectedLanguage)}
                  style={{
                    padding: '8px 15px',
                    backgroundColor: '#ff6b2c',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '13px',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    fontWeight: '500'
                  }}
                  title={`Langue détectée dans la description : ${DEEPL_LANGUAGES.find(l => l.code === detectedLanguage)?.name}`}
                >
                  <i className="fas fa-magic" style={{ marginRight: '5px' }}></i>
                  Utiliser {DEEPL_LANGUAGES.find(l => l.code === detectedLanguage)?.name}
                </button>
              )}
            </div>
            {detectedLanguage && (
              <div style={{
                marginTop: '8px',
                padding: '8px 12px',
                backgroundColor: 'rgba(255, 107, 44, 0.1)',
                borderLeft: '3px solid #ff6b2c',
                borderRadius: '5px',
                fontSize: '13px',
                color: '#1a1a1a'
              }}>
                <i className="fas fa-lightbulb" style={{ marginRight: '8px', color: '#ff6b2c' }}></i>
                <strong>Langue détectée :</strong> {DEEPL_LANGUAGES.find(l => l.code === detectedLanguage)?.name}
              </div>
            )}
          </div>
        </div>

        <div className="project-description" style={{ marginTop: '20px' }}>
          <div className="form-group tooltip-container" data-tooltip="Décrivez en détail votre projet, ses objectifs, le contexte, les contraintes particulières et toute information utile pour l'IA. Pour DeepL, vous pouvez écrire 'traduire en anglais' et la langue sera détectée automatiquement !">
            <label htmlFor="projectDescription">Description du projet</label>
            <textarea
              ref={projectDescriptionRef}
              id="projectDescription"
              placeholder="Décrivez votre projet en détail... (ex: 'Traduire ce contenu en anglais pour le marché américain')" 
              value={formData.projectDescription}
              onChange={(e) => {
                handleInputChange('projectDescription', e.target.value);
                // Auto-resize
                e.target.style.height = 'auto';
                e.target.style.height = Math.max(72, e.target.scrollHeight) + 'px';
              }}
              style={{ 
                minHeight: '72px', // 3 lignes
                height: '72px',
                resize: 'vertical',
                overflow: 'hidden'
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};