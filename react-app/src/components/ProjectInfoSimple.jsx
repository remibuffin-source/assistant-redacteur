import { useState, useRef, useEffect, useCallback } from 'react';
import { useAssistantAutoSave } from '../hooks/useLocalStorage';
import { getHomeText } from '../i18n/homeTranslations';

// Détection mobile
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  return isMobile;
};

const ProjectInfoSimple = ({ data = {}, onDataChange = () => {}, onContentTypeChange = () => {}, onReset = () => {} }) => {
  const { autoSaveData } = useAssistantAutoSave();
  const userLanguage = autoSaveData.language || 'fr';
  const t = (path) => getHomeText(userLanguage, path);
  
  const isMobile = useIsMobile();
  const textareaRef = useRef(null);
  const [formData, setFormData] = useState({
    projectTitle: data.projectTitle || '',
    targetAudience: data.targetAudience || '',
    tone: data.tone || '',
    projectDescription: data.projectDescription || ''
  });
  
  // Types de contenu sélectionnés (Texte, Image, Vidéo)
  const [contentTypes, setContentTypes] = useState({
    text: true,
    image: false,
    video: false
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

  // Gérer le changement de type de contenu
  const handleContentTypeChange = (type) => {
    const newContentTypes = { ...contentTypes, [type]: !contentTypes[type] };
    setContentTypes(newContentTypes);
    // Transmettre au parent pour filtrer les IA et réinitialiser l'IA sélectionnée
    onContentTypeChange(newContentTypes);
  };

  // Fonction de réinitialisation
  const handleReset = () => {
    if (window.confirm('Voulez-vous réinitialiser tous les champs et options ?')) {
      // Réinitialiser les états locaux
      setFormData({
        projectTitle: '',
        targetAudience: '',
        tone: '',
        projectDescription: ''
      });
      setContentTypes({
        text: true,
        image: false,
        video: false
      });
      // Appeler la fonction de réinitialisation du parent
      onReset();
    }
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3 className="section-title" style={{ margin: 0 }}>
          <i className="fas fa-info-circle"></i>
          {t('sections.projectInfo.title')}
        </h3>
        <button
          onClick={handleReset}
          style={{
            padding: '8px 16px',
            background: 'rgba(255, 107, 53, 0.1)',
            border: '1px solid rgba(255, 107, 53, 0.3)',
            borderRadius: '6px',
            color: '#ff6b35',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: '500',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.target.style.background = 'rgba(255, 107, 53, 0.2)';
            e.target.style.borderColor = 'rgba(255, 107, 53, 0.5)';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'rgba(255, 107, 53, 0.1)';
            e.target.style.borderColor = 'rgba(255, 107, 53, 0.3)';
          }}
          title="Réinitialiser tous les champs et options"
        >
          <i className="fas fa-redo"></i>
          Reset
        </button>
      </div>
      <div className="section-content project-info-layout" style={{ width: '100%' }}>
        {isMobile ? (
          /* ===== LAYOUT MOBILE : compact, 2 colonnes ===== */
          <div style={{ width: '100%' }}>
            {/* Ligne 1 : Titre + Public cible côte à côte */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
              <div>
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
              <div>
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
            </div>

            {/* Ligne 2 : Ton + Type de contenu côte à côte */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '10px', alignItems: 'end', marginBottom: '10px' }}>
              <div>
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
              <div style={{ 
                display: 'flex', 
                gap: '6px', 
                alignItems: 'center',
                padding: '8px 10px',
                background: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '6px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                marginBottom: '2px'
              }}>
                {[
                  { id: 'text', label: 'Txt', icon: 'fa-font' },
                  { id: 'image', label: 'Img', icon: 'fa-image' }
                ].map(type => (
                  <label key={type.id} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    cursor: 'pointer',
                    padding: '4px 6px',
                    borderRadius: '4px',
                    background: contentTypes[type.id] ? 'rgba(255, 107, 53, 0.2)' : 'transparent',
                    transition: 'background 0.2s ease'
                  }}>
                    <input
                      type="checkbox"
                      checked={contentTypes[type.id]}
                      onChange={() => handleContentTypeChange(type.id)}
                      style={{ width: '14px', height: '14px', accentColor: '#ff6b35', cursor: 'pointer' }}
                    />
                    <i className={`fas ${type.icon}`} style={{ 
                      color: contentTypes[type.id] ? '#ff6b35' : 'var(--text-primary)',
                      fontSize: '12px'
                    }}></i>
                    <span style={{ 
                      fontSize: '11px',
                      color: contentTypes[type.id] ? '#ff6b35' : 'var(--text-primary)',
                      fontWeight: contentTypes[type.id] ? '600' : '400'
                    }}>
                      {type.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Description en dessous */}
            <div style={{ width: '100%' }}>
              <label htmlFor="projectDescription" style={labelStyle}>
                {t('sections.projectInfo.fields.description')}
              </label>
              <div className="project-description-container" style={{
                width: '100%',
                border: '1px solid rgba(0, 0, 0, 0.2)',
                borderRadius: '6px',
                background: '#ffffff !important',
                transition: 'border-color 0.2s ease',
                minHeight: '40px',
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
                    minHeight: '40px',
                    resize: 'both',
                    overflow: 'hidden',
                    border: 'none',
                    background: '#ffffff !important',
                    color: '#111111 !important',
                    padding: '10px',
                    outline: 'none',
                    fontSize: '14px',
                    lineHeight: '22px',
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
        ) : (
          /* ===== LAYOUT DESKTOP : 2 colonnes (champs + type contenu) ===== */
          <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start', width: '100%' }}>
            {/* Colonne gauche : tous les champs (prend toute la place) */}
            <div style={{ flex: '1', minWidth: 0 }}>
              {/* 3 champs raccourcis sur une ligne */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '15px' }}>
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
              
              {/* Description en dessous */}
              <div style={{ width: '100%' }}>
                <label htmlFor="projectDescription" style={labelStyle}>
                  {t('sections.projectInfo.fields.description')}
                </label>
                <div className="project-description-container" style={{
                  width: '100%',
                  border: '1px solid rgba(0, 0, 0, 0.2)',
                  borderRadius: '6px',
                  background: '#ffffff !important',
                  transition: 'border-color 0.2s ease',
                  minHeight: '40px',
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
                      minHeight: '40px',
                      resize: 'both',
                      overflow: 'hidden',
                      border: 'none',
                      background: '#ffffff !important',
                      color: '#111111 !important',
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
            
            {/* Colonne droite : Type de contenu (aligné avec les champs) */}
            <div style={{ 
              padding: '12px 16px',
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '8px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              width: '180px',
              flexShrink: 0,
              marginTop: '28px'
            }}>
              <label style={{ ...labelStyle, marginBottom: '12px' }}>
                Type de contenu
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {[
                  { id: 'text', label: 'Texte', icon: 'fa-font' },
                  { id: 'image', label: 'Image', icon: 'fa-image' }
                ].map(type => (
                  <label key={type.id} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    cursor: 'pointer',
                    padding: '6px 8px',
                    borderRadius: '4px',
                    background: contentTypes[type.id] ? 'rgba(255, 107, 53, 0.15)' : 'transparent',
                    transition: 'background 0.2s ease'
                  }}>
                    <input
                      type="checkbox"
                      checked={contentTypes[type.id]}
                      onChange={() => handleContentTypeChange(type.id)}
                      style={{ 
                        width: '16px', 
                        height: '16px', 
                        accentColor: '#ff6b35',
                        cursor: 'pointer'
                      }}
                    />
                    <i className={`fas ${type.icon}`} style={{ 
                      color: contentTypes[type.id] ? '#ff6b35' : '#000000',
                      width: '16px',
                      transition: 'color 0.2s ease'
                    }}></i>
                    <span style={{ 
                      fontSize: '13px',
                      color: contentTypes[type.id] ? '#ff6b35' : '#000000',
                      fontWeight: contentTypes[type.id] ? '600' : '400',
                      transition: 'color 0.2s ease, font-weight 0.2s ease'
                    }}>
                      {type.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectInfoSimple;
