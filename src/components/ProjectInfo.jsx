import { useState, useEffect } from 'react';

const ProjectInfo = ({ data, onDataChange }) => {
  const [formData, setFormData] = useState({
    projectTitle: '',
    targetAudience: '',
    keywords: '',
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
      
      {/* Première ligne : Titre du projet & Public cible */}
      <div className="form-row">
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
        <div className="form-group">
          <label htmlFor="targetAudience">Public cible</label>
          <input
            type="text"
            id="targetAudience"
            placeholder="Votre audience"
            value={formData.targetAudience}
            onChange={(e) => handleInputChange('targetAudience', e.target.value)}
            data-tooltip="Décrivez précisément qui sont vos lecteurs cibles : âge, profession, centres d'intérêt, niveau d'expertise, besoins spécifiques"
          />
        </div>
      </div>

      {/* Deuxième ligne : Mots-clés & Ton souhaité */}
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="keywords">Mots-clés</label>
          <input
            type="text"
            id="keywords"
            placeholder="Mots-clés principaux"
            value={formData.keywords}
            onChange={(e) => handleInputChange('keywords', e.target.value)}
            data-tooltip="Listez les mots-clés principaux que vous souhaitez voir apparaître dans le contenu pour optimiser le référencement et la pertinence du message"
          />
        </div>
        <div className="form-group">
          <label htmlFor="tone">Ton souhaité</label>
          <input
            type="text"
            id="tone"
            placeholder="Style de rédaction"
            value={formData.tone}
            onChange={(e) => handleInputChange('tone', e.target.value)}
            data-tooltip="Définissez le style de communication souhaité : professionnel, décontracté, expert, pédagogique, commercial, inspirant, technique, etc."
          />
        </div>
      </div>

      {/* Description du projet */}
      <div className="form-group">
        <label htmlFor="projectDescription">Description du projet</label>
        <textarea
          id="projectDescription"
          placeholder="Décrivez votre projet en détail..."
          value={formData.projectDescription}
          onChange={(e) => handleInputChange('projectDescription', e.target.value)}
          data-tooltip="Décrivez en détail votre projet, ses objectifs, le contexte, les contraintes particulières et toute information utile pour l'IA"
        />
      </div>
    </div>
  );
};

export default ProjectInfo;