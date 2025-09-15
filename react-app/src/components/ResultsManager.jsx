import { useState } from 'react';

const ResultsManager = ({ result, onCopy, onDownload }) => {
  const [activeTab, setActiveTab] = useState('current');

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const renderCurrentTab = () => {
    if (!result) {
      return (
        <div className="result-area">
          <p>Aucun résultat disponible. Lancez un traitement pour voir les résultats ici.</p>
        </div>
      );
    }

    return (
      <div className="result-area">
        {result.success && (
          <>
            <div className="alert alert-success">
              <i className="fas fa-check-circle"></i>
              Contenu généré avec succès!
            </div>
            <div className="results-grid">
              <div className="result-card">
                <div className="result-card-header">
                  <i className="fas fa-file-alt"></i>
                  <h4>Contenu généré</h4>
                </div>
                <div className="result-card-content">
                  <div className="result-preview">
                    {result.content.length > 200
                      ? `${result.content.substring(0, 200)}...`
                      : result.content
                    }
                  </div>
                  <div className="result-stats">
                    <span className="stat">
                      <i className="fas fa-font"></i>
                      {result.content.split(' ').length} mots
                    </span>
                    <span className="stat">
                      <i className="fas fa-clock"></i>
                      {Math.ceil(result.content.length / 1000)} min lecture
                    </span>
                  </div>
                </div>
                <div className="result-card-actions">
                  <button className="btn-view-full" onClick={() => setActiveTab('full')}>
                    <i className="fas fa-expand"></i> Voir en entier
                  </button>
                  <div className="action-buttons">
                    <button className="btn-action" onClick={onCopy} title="Copier">
                      <i className="fas fa-copy"></i>
                    </button>
                    <button className="btn-action" onClick={onDownload} title="Télécharger">
                      <i className="fas fa-download"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
        
        {!result.success && (
          <div className="alert alert-error">
            <i className="fas fa-exclamation-circle"></i>
            Erreur lors de la génération du contenu
          </div>
        )}
      </div>
    );
  };


  const renderFullContentTab = () => {
    if (!result) {
      return (
        <div className="result-area">
          <p>Aucun résultat disponible.</p>
        </div>
      );
    }

    return (
      <div className="full-content-view">
        <div className="full-content-header">
          <button className="btn-back" onClick={() => setActiveTab('current')}>
            <i className="fas fa-arrow-left"></i> Retour aux vignettes
          </button>
          <h4>Contenu complet</h4>
        </div>
        <div className="full-content">
          <pre>{result.content}</pre>
        </div>
        <div className="full-content-actions">
          <button className="btn-action-large" onClick={onCopy}>
            <i className="fas fa-copy"></i> Copier le contenu
          </button>
          <button className="btn-action-large" onClick={onDownload}>
            <i className="fas fa-download"></i> Télécharger
          </button>
        </div>
      </div>
    );
  };


  return (
    <div className="section">
      <h3 className="section-title">
        <i className="fas fa-cog"></i>
        Gestion des résultats
      </h3>
      
      <div className="results-tabs">
        {result && (
          <button
            className={`tab-btn ${activeTab === 'full' ? 'active' : ''}`}
            onClick={() => handleTabChange('full')}
            data-tab="full"
          >
            Vue complète
          </button>
        )}
      </div>
      
      <div className="results-content">
        <div className={`tab-content ${activeTab === 'full' ? 'active' : ''}`} id="full">
          {renderFullContentTab()}
        </div>
      </div>
    </div>
  );
};

export default ResultsManager;