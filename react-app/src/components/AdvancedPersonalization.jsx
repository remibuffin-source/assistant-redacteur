import { useState, useCallback, useEffect } from 'react'
import { useAssistantAutoSave } from '../hooks/useLocalStorage'
import { getHomeText } from '../i18n/homeTranslations'

// Détection mobile
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 992);
  
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 992);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  return isMobile;
};

export default function AdvancedPersonalization({ data = {}, onChange }) {
  const { autoSaveData } = useAssistantAutoSave();
  const userLanguage = autoSaveData.language || 'fr';
  const t = (path) => getHomeText(userLanguage, path);
  const isMobile = useIsMobile();
  
  const [formData, setFormData] = useState({
    style: data.style || 'professionnel',
    length: data.length || 3,
    creativity: data.creativity || 3,
    adaptation: data.adaptation || 'web',
    ...data
  })

  // Synchroniser formData quand data change (lors du chargement d'un modèle)
  useEffect(() => {
    if (data && Object.keys(data).length > 0) {
      setFormData({
        style: data.style || 'professionnel',
        length: data.length || 3,
        creativity: data.creativity || 3,
        adaptation: data.adaptation || 'web',
        ...data
      });
    }
  }, [data]);

  const handleInputChange = useCallback((field, value) => {
    const newData = { ...formData, [field]: value }
    setFormData(newData)
    if (onChange) {
      onChange(newData)
    }
  }, [formData, onChange])

  const getLengthTooltip = (value) => {
    const lengths = {
      1: "30% du format standard",
      2: "65% du format standard", 
      3: "100% du format standard",
      4: "130% du format standard",
      5: "160% du format standard"
    }
    return lengths[value] || "100% du format standard"
  }

  const getCreativityTooltip = (value) => {
    const levels = {
      1: "Très conservateur",
      2: "Conservateur", 
      3: "Équilibré",
      4: "Créatif",
      5: "Très créatif"
    }
    return levels[value] || "Équilibré"
  }

  const sectionStyle = {
    background: 'var(--bg-secondary)',
    border: '1px solid var(--border-color)',
    borderRadius: '12px',
    padding: '25px',
    marginBottom: '25px',
    backdropFilter: 'blur(10px)',
    width: '100%'
  }

  const titleStyle = {
    color: 'var(--accent-color)',
    fontSize: '20px',
    fontWeight: '600',
    marginBottom: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  }

  const gridStyle = isMobile ? {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    marginTop: '10px'
  } : {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr',
    gap: '22px',
    marginTop: '10px'
  }
  
  const mobileRowStyle = {
    display: 'flex',
    gap: '8px',
    width: '100%'
  }
  
  const mobileBoxStyle = {
    flex: 1,
    minWidth: 0,
    maxWidth: '50%'
  }

  const optionGroupStyle = {
    background: 'var(--bg-secondary)',
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    padding: '22px',
    overflow: 'hidden'
  }
  
  const mobileOptionGroupStyle = {
    ...optionGroupStyle,
    padding: '16px'
  }

  const groupTitleStyle = {
    color: '#ff6b35',
    marginBottom: '16px',
    fontSize: '18px',
    margin: '35px 0 25px 0'
  }

  const radioGroupStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  }

  const radioLabelStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '11px',
    color: 'var(--text-primary)',
    fontSize: '15px',
    cursor: 'pointer'
  }

  const radioInputStyle = {
    width: '20px',
    height: '20px',
    minWidth: '20px',
    minHeight: '20px',
    margin: '0',
    flexShrink: 0
  }

  const sliderContainerStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '13px',
    marginTop: '35px',
    position: 'relative'
  }

  const sliderStyle = {
    flex: '1',
    height: '7px'
  }

  const sliderLabelStyle = {
    fontSize: '15px',
    color: 'var(--text-primary)',
    fontWeight: '500'
  }

  const tooltipStyle = {
    position: 'absolute',
    top: '-35px',
    left: '50%',
    transform: 'translateX(-50%)',
    background: 'rgba(44, 62, 80, 0.95)',
    color: '#ffffff',
    padding: '5px 10px',
    borderRadius: '6px',
    fontSize: '11px',
    whiteSpace: 'nowrap',
    zIndex: '1000',
    pointerEvents: 'none'
  }

  return (
    <div className="section" style={sectionStyle}>
      <h3 className="section-title" style={titleStyle}>
        <i className="fas fa-sliders-h"></i>
        {t('sections.advancedOptions.title')}
      </h3>
      
      <div style={gridStyle}>
        {isMobile ? (
          <>
            {/* Mobile : Longueur + Créativité en premier */}
            <div style={optionGroupStyle}>
              <h4 style={groupTitleStyle}>{t('sections.advancedOptions.length.title')}</h4>
              <div style={sliderContainerStyle}>
                <label style={sliderLabelStyle}>{t('sections.advancedOptions.length.shortLabel')}</label>
                <input 
                  type="range" 
                  min="1" 
                  max="5" 
                  value={formData.length}
                  onChange={(e) => handleInputChange('length', parseInt(e.target.value))}
                  style={sliderStyle}
                />
                <label style={sliderLabelStyle}>{t('sections.advancedOptions.length.longLabel')}</label>
                <div style={tooltipStyle}>
                  {getLengthTooltip(formData.length)}
                </div>
              </div>
              
              <h4 style={{...groupTitleStyle, marginTop: '35px'}}>{t('sections.advancedOptions.creativity.title')}</h4>
              <div style={{...sliderContainerStyle, marginTop: '40px'}}>
                <label style={sliderLabelStyle}>{t('sections.advancedOptions.creativity.conservative')}</label>
                <input 
                  type="range" 
                  min="1" 
                  max="5" 
                  value={formData.creativity}
                  onChange={(e) => handleInputChange('creativity', parseInt(e.target.value))}
                  style={sliderStyle}
                />
                <label style={sliderLabelStyle}>{t('sections.advancedOptions.creativity.creative')}</label>
                <div style={tooltipStyle}>
                  {getCreativityTooltip(formData.creativity)}
                </div>
              </div>
            </div>

            {/* Mobile : Style et Adaptation côte à côte */}
            <div style={mobileRowStyle}>
              <div style={{...mobileOptionGroupStyle, ...mobileBoxStyle}}>
                <h4 style={groupTitleStyle}>{t('sections.advancedOptions.style.title')}</h4>
                <div style={radioGroupStyle}>
                  {
                    [
                      { value: 'professionnel', label: t('sections.advancedOptions.style.professional') },
                      { value: 'creatif', label: t('sections.advancedOptions.style.creative') },
                      { value: 'academique', label: t('sections.advancedOptions.style.academic') },
                      { value: 'decontracte', label: t('sections.advancedOptions.style.casual') },
                      { value: 'persuasif', label: t('sections.advancedOptions.style.persuasive') },
                      { value: 'informatif', label: t('sections.advancedOptions.style.informative') }
                    ].map(option => (
                      <label key={option.value} style={radioLabelStyle}>
                        <input 
                          type="radio" 
                          name="style" 
                          value={option.value}
                          checked={formData.style === option.value}
                          onChange={(e) => handleInputChange('style', e.target.value)}
                          style={radioInputStyle}
                        />
                        {option.label}
                      </label>
                    ))
                  }
                </div>
              </div>

              <div style={{...mobileOptionGroupStyle, ...mobileBoxStyle}}>
                <h4 style={groupTitleStyle}>{t('sections.advancedOptions.adaptation.title')}</h4>
                <div style={radioGroupStyle}>
                  {
                    [
                      { value: 'web', label: t('sections.advancedOptions.adaptation.web') },
                      { value: 'print', label: t('sections.advancedOptions.adaptation.print') },
                      { value: 'social', label: t('sections.advancedOptions.adaptation.social') },
                      { value: 'presentation', label: t('sections.advancedOptions.adaptation.presentation') }
                    ].map(option => (
                      <label key={option.value} style={radioLabelStyle}>
                        <input 
                          type="radio" 
                          name="adaptation" 
                          value={option.value}
                          checked={formData.adaptation === option.value}
                          onChange={(e) => handleInputChange('adaptation', e.target.value)}
                          style={radioInputStyle}
                        />
                        {option.label}
                      </label>
                    ))
                  }
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Desktop : 3 colonnes */}
            <div style={optionGroupStyle}>
              <h4 style={groupTitleStyle}>{t('sections.advancedOptions.style.title')}</h4>
              <div style={radioGroupStyle}>
                {
                  [
                    { value: 'professionnel', label: t('sections.advancedOptions.style.professional') },
                    { value: 'creatif', label: t('sections.advancedOptions.style.creative') },
                    { value: 'academique', label: t('sections.advancedOptions.style.academic') },
                    { value: 'decontracte', label: t('sections.advancedOptions.style.casual') },
                    { value: 'persuasif', label: t('sections.advancedOptions.style.persuasive') },
                    { value: 'informatif', label: t('sections.advancedOptions.style.informative') }
                  ].map(option => (
                    <label key={option.value} style={radioLabelStyle}>
                      <input 
                        type="radio" 
                        name="style" 
                        value={option.value}
                        checked={formData.style === option.value}
                        onChange={(e) => handleInputChange('style', e.target.value)}
                        style={radioInputStyle}
                      />
                      {option.label}
                    </label>
                  ))
                }
              </div>
            </div>

            <div style={optionGroupStyle}>
              <h4 style={groupTitleStyle}>{t('sections.advancedOptions.length.title')}</h4>
              <div style={sliderContainerStyle}>
                <label style={sliderLabelStyle}>{t('sections.advancedOptions.length.shortLabel')}</label>
                <input 
                  type="range" 
                  min="1" 
                  max="5" 
                  value={formData.length}
                  onChange={(e) => handleInputChange('length', parseInt(e.target.value))}
                  style={sliderStyle}
                />
                <label style={sliderLabelStyle}>{t('sections.advancedOptions.length.longLabel')}</label>
                <div style={tooltipStyle}>
                  {getLengthTooltip(formData.length)}
                </div>
              </div>
              
              <h4 style={{...groupTitleStyle, marginTop: '35px'}}>{t('sections.advancedOptions.creativity.title')}</h4>
              <div style={{...sliderContainerStyle, marginTop: '40px'}}>
                <label style={sliderLabelStyle}>{t('sections.advancedOptions.creativity.conservative')}</label>
                <input 
                  type="range" 
                  min="1" 
                  max="5" 
                  value={formData.creativity}
                  onChange={(e) => handleInputChange('creativity', parseInt(e.target.value))}
                  style={sliderStyle}
                />
                <label style={sliderLabelStyle}>{t('sections.advancedOptions.creativity.creative')}</label>
                <div style={tooltipStyle}>
                  {getCreativityTooltip(formData.creativity)}
                </div>
              </div>
            </div>

            <div style={optionGroupStyle}>
              <h4 style={groupTitleStyle}>{t('sections.advancedOptions.adaptation.title')}</h4>
              <div style={radioGroupStyle}>
                {
                  [
                    { value: 'web', label: t('sections.advancedOptions.adaptation.web') },
                    { value: 'print', label: t('sections.advancedOptions.adaptation.print') },
                    { value: 'social', label: t('sections.advancedOptions.adaptation.social') },
                    { value: 'presentation', label: t('sections.advancedOptions.adaptation.presentation') }
                  ].map(option => (
                    <label key={option.value} style={radioLabelStyle}>
                      <input 
                        type="radio" 
                        name="adaptation" 
                        value={option.value}
                        checked={formData.adaptation === option.value}
                        onChange={(e) => handleInputChange('adaptation', e.target.value)}
                        style={radioInputStyle}
                      />
                      {option.label}
                    </label>
                  ))
                }
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
