import { useState, useRef, useEffect, useCallback } from 'react';
import { useAssistantAutoSave } from '../hooks/useLocalStorage';
import { getHomeText } from '../i18n/homeTranslations';

const ProjectInfoSimple = ({ data = {}, onDataChange = () => {} }) => {
  const { autoSaveData } = useAssistantAutoSave();
  const userLanguage = autoSaveData.language || 'fr';
  const t = (path) => getHomeText(userLanguage, path);
  
  const textareaRef = useRef(null);
  const [formData, setFormData] = useState({
    projectTitle: data.projectTitle || '',
    targetAudience: data.targetAudience || '',
    tone: data.tone || '',
    projectDescription: data.projectDescription || ''
  });

  // Historique des valeurs précédentes
  const [audienceHistory, setAudienceHistory] = useState([]);
  const [toneHistory, setToneHistory] = useState([]);

  // Charger l'historique au montage
  useEffect(() => {
    const savedAudiences = JSON.parse(localStorage.getItem('audienceHistory') || '[]');
    const savedTones = JSON.parse(localStorage.getItem('toneHistory') || '[]');
    setAudienceHistory(savedAudiences);
    setToneHistory(savedTones);
  }, []);

  // Mise à jour du state si les props changent
  useEffect(() => {
    setFormData({
      projectTitle: data.projectTitle || '',
      targetAudience: data.targetAudience || '',
      tone: data.tone || '',
      projectDescription: data.projectDescription || ''
    });
  }, [data]);

  const handleInputChange = (field, value) => {
    const newData = { ...formData, [field]: value };
    setFormData(newData);
    // Transmettre les changements au parent (HomeFixed)
    onDataChange(newData);
  };

  // Sauvegarder dans l'historique quand le champ perd le focus
  const saveToHistory = (field, value) => {
    if (!value || value.trim().length < 2) return;

    if (field === 'targetAudience') {
      const newHistory = [value, ...audienceHistory.filter(item => item !== value)].slice(0, 10);
      setAudienceHistory(newHistory);
      localStorage.setItem('audienceHistory', JSON.stringify(newHistory));
    } else if (field === 'tone') {
      const newHistory = [value, ...toneHistory.filter(item => item !== value)].slice(0, 10);
      setToneHistory(newHistory);
      localStorage.setItem('toneHistory', JSON.stringify(newHistory));
    }
  };

  // Fonction robuste pour ajuster la hauteur du textarea (inspiré de l'exemple CSS)
  const adjustTextareaHeight = useCallback((element) => {
    if (!element) return;

    // Réinitialiser temporairement pour calcul
    element.style.cssText = `
      height: auto !important;
      overflow: hidden !important;
      min-height: 40px !important;
      max-height: none !important;
      resize: both !important;
      white-space: pre-wrap !important;
      word-wrap: break-word !important;
    `;

    // Calculer la hauteur nécessaire
    const lineHeight = 24; // Hauteur d'une ligne en px
    const minHeight = 40; // 40px minimum (~1 ligne au lieu de 100px)
    const scrollHeight = element.scrollHeight;
    const newHeight = Math.max(minHeight, scrollHeight);

    // Appliquer la nouvelle hauteur avec !important pour surcharger CSS global
    element.style.cssText += `height: ${newHeight}px !important;`;
  }, []);

  // Effet pour gérer le redimensionnement initial et les changements de contenu
  useEffect(() => {
    if (textareaRef.current) {
      adjustTextareaHeight(textareaRef.current);
    }
  }, [formData.projectDescription, adjustTextareaHeight]);

  // Gérer le redimensionnement de la fenêtre
  useEffect(() => {
    const handleResize = () => {
      if (textareaRef.current) {
        adjustTextareaHeight(textareaRef.current);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [adjustTextareaHeight]);

  // Styles communs
  const inputStyle = {
    width: '100%',
    height: '45px',
    border: 'none',
    borderBottom: '2px solid rgba(255, 255, 255, 0.3)',
    background: 'transparent',
    color: 'var(--text-primary)',
    padding: '12px 0',
    outline: 'none',
    borderRadius: '0',
    fontSize: '16px',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s ease'
  };

  const labelStyle = {
    display: 'block',
    marginBottom: '8px',
    color: 'var(--label-color)',
    fontSize: '14px',
    fontWeight: '500'
  };

  return (
    <div className="section" style={{ width: '100%', margin: '0 auto' }}>
      <h3 className="section-title" style={{ marginBottom: '20px' }}>
        <i className="fas fa-info-circle"></i>
        {t('sections.projectInfo.title')}
      </h3>
      <div className="section-content" style={{ width: '100%' }}>
        {/* Ligne unique : Titre du projet, Public cible & Ton souhaité */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px', marginBottom: '15px' }}>
          <div style={{ width: '100%' }}>
            <label htmlFor="projectTitle" style={labelStyle}>
              {t('sections.projectInfo.fields.projectTitle')}
            </label>
            <input
              type="text"
              id="projectTitle"
              placeholder={t('sections.projectInfo.fields.projectTitlePlaceholder')}
              value={formData.projectTitle}
              onChange={(e) => handleInputChange('projectTitle', e.target.value)}
              style={inputStyle}
            />
          </div>
          <div style={{ width: '100%' }}>
            <label htmlFor="targetAudience" style={labelStyle}>
              {t('sections.projectInfo.fields.targetAudience')}
            </label>
            <input
              type="text"
              id="targetAudience"
              list="audienceHistoryList"
              placeholder={t('sections.projectInfo.fields.targetAudiencePlaceholder')}
              value={formData.targetAudience}
              onChange={(e) => handleInputChange('targetAudience', e.target.value)}
              onBlur={(e) => saveToHistory('targetAudience', e.target.value)}
              style={inputStyle}
              title={t('sections.projectInfo.fields.targetAudienceTooltip')}
            />
            <datalist id="audienceHistoryList">
              {audienceHistory.map((item, index) => (
                <option key={index} value={item} />
              ))}
            </datalist>
          </div>
          <div style={{ width: '100%' }}>
            <label htmlFor="tone" style={labelStyle}>
              {t('sections.projectInfo.fields.tone')}
            </label>
            <input
              type="text"
              id="tone"
              list="toneHistoryList"
              placeholder={t('sections.projectInfo.fields.tonePlaceholder')}
              value={formData.tone}
              onChange={(e) => handleInputChange('tone', e.target.value)}
              onBlur={(e) => saveToHistory('tone', e.target.value)}
              style={inputStyle}
              title={t('sections.projectInfo.fields.toneTooltip')}
            />
            <datalist id="toneHistoryList">
              {toneHistory.map((item, index) => (
                <option key={index} value={item} />
              ))}
            </datalist>
          </div>
        </div>
        
        {/* Zone de description */}
        <div style={{ width: '100%' }}>
          <label htmlFor="projectDescription" style={labelStyle}>
            {t('sections.projectInfo.fields.description')}
          </label>
          <div className="project-description-container" style={{
            width: '100%',
            border: '1px solid rgba(0, 0, 0, 0.2)',
            borderRadius: '6px',
            background: '#ffffff !important', // Fond blanc forcé même en mode nuit
            transition: 'border-color 0.2s ease',
            minHeight: '40px', // Réduit à 1 ligne (~40px)
            display: 'flex',
            alignItems: 'stretch',
            boxSizing: 'border-box'
          }}>
            <textarea
              id="projectDescription"
              ref={textareaRef}
              placeholder={t('sections.projectInfo.fields.descriptionPlaceholder')}
              value={formData.projectDescription}
              onChange={(e) => handleInputChange('projectDescription', e.target.value)}
              onInput={(e) => adjustTextareaHeight(e.target)}
              onFocus={(e) => (e.target.parentElement.style.borderColor = 'rgba(0, 0, 0, 0.35)')}
              onBlur={(e) => (e.target.parentElement.style.borderColor = 'rgba(0, 0, 0, 0.2)')}
              style={{
                width: '100%',
                height: '100%',
                minHeight: '40px', // Réduit à 1 ligne
                resize: 'both',
                overflow: 'hidden',
                border: 'none',
                background: '#ffffff !important',
                color: '#111111 !important', // Texte noir sur fond blanc forcé en tous modes
                padding: '12px',
                outline: 'none',
                fontSize: '16px',
                lineHeight: '24px',
                fontFamily: 'inherit',
                boxSizing: 'border-box',
                display: 'block',
                transition: 'none',
                whiteSpace: 'pre-wrap',
                wordWrap: 'break-word',
                WebkitOverflowScrolling: 'touch',
                msOverflowStyle: 'none',
                scrollbarWidth: 'none'
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectInfoSimple;
