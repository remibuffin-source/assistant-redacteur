import { useState, useEffect } from 'react';

const ProjectInfo = ({ data, onDataChange }) => {
  const [formData, setFormData] = useState({
    projectTitle: '',
    targetAudience: '',
    tone: '',
    projectDescription: ''
  });

  useEffect(() => {
    if (data) {
      setFormData(data);
    }
  }, [data]);

  const handleInputChange = (field, value) => {
    const newData = { ...formData, [field]: value };
    setFormData(newData);
    onDataChange(newData);
  };

  return (
    <div className="section-compact">
      <h3 className="section-title-compact">
        <i className="fas fa-info-circle"></i>
        Informations du Projet
      </h3>
      
      {/* Titre du projet */}
      <div className="form-group">
        <label htmlFor="projectTitle">Titre du projet</label>
        <input
          type="text"
          id="projectTitle"
          placeholder="Nom de votre projet"
          value={formData.projectTitle}
          onChange={(e) => handleInputChange('projectTitle', e.target.value)}
          data-tooltip="Donnez un nom descriptif à votre projet pour le retrouver facilement dans l'historique et organiser vos créations"
        />
      </div>

      {/* Public cible avec infobulle améliorée */}
      <div className="form-group">
        <label htmlFor="targetAudience">Public cible</label>
        <input
          type="text"
          id="targetAudience"
          placeholder="Ex: Professionnels 30-45 ans, secteur tech"
          value={formData.targetAudience}
          onChange={(e) => handleInputChange('targetAudience', e.target.value)}
          data-tooltip="Décrivez précisément votre audience : âge, profession, centres d'intérêt, niveau d'expertise, besoins spécifiques. Ex: 'Jeunes entrepreneurs 25-35 ans recherchant des conseils pratiques en marketing digital'"
        />
      </div>

      {/* Ton souhaité avec infobulle améliorée */}
      <div className="form-group">
        <label htmlFor="tone">Ton souhaité</label>
        <input
          type="text"
          id="tone"
          placeholder="Ex: Professionnel et engageant"
          value={formData.tone}
          onChange={(e) => handleInputChange('tone', e.target.value)}
          data-tooltip="Définissez le style de communication : professionnel, décontracté, expert, pédagogique, commercial, inspirant, technique, humoristique. Ex: 'Ton professionnel mais accessible avec une touche d'enthousiasme'"
        />
      </div>

      {/* Description du projet */}
      <div className="form-group">
        <label htmlFor="projectDescription">Description du projet</label>
        <textarea
          id="projectDescription"
          placeholder="Décrivez votre projet, ses objectifs et le contexte..."
          value={formData.projectDescription}
          onChange={(e) => handleInputChange('projectDescription', e.target.value)}
          data-tooltip="Décrivez en détail votre projet : objectifs principaux, contexte spécifique, contraintes particulières, informations clés à inclure, et toute directive utile pour guider l'IA dans la création du contenu"
        />
      </div>
    </div>
  );
};

export default ProjectInfo;