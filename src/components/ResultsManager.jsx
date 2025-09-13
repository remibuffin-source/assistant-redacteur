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
            <div className="result-content">
              <pre>{result.content}</pre>
            </div>
            <div className="result-actions">
              <button className="btn btn-secondary" onClick={onCopy}>
                <i className="fas fa-copy"></i> Copier
              </button>
              <button className="btn btn-secondary" onClick={onDownload}>
                <i className="fas fa-download"></i> Télécharger
              </button>
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

  const renderHistoryTab = () => {
    const historyData = JSON.parse(localStorage.getItem('projectHistory') || '[]');
    
    return (
      <div className="history-list">
        {historyData.length === 0 ? (
          <p>Aucun historique disponible</p>
        ) : (
          <ul>
            {historyData.map((project, index) => (
              <li key={index}>
                <strong>{project.title || 'Projet sans nom'}</strong> - {new Date(project.timestamp).toLocaleDateString()}
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  };

  const renderCompareTab = () => {
    return (
      <div className="comparison-view">
        <p>Sélectionnez des résultats à comparer</p>
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
        <button 
          className={`tab-btn ${activeTab === 'current' ? 'active' : ''}`}
          onClick={() => handleTabChange('current')}
          data-tab="current"
        >
          Résultat actuel
        </button>
        <button 
          className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => handleTabChange('history')}
          data-tab="history"
        >
          Historique
        </button>
        <button 
          className={`tab-btn ${activeTab === 'compare' ? 'active' : ''}`}
          onClick={() => handleTabChange('compare')}
          data-tab="compare"
        >
          Comparaison
        </button>
      </div>
      
      <div className="results-content">
        <div className={`tab-content ${activeTab === 'current' ? 'active' : ''}`} id="current">
          {renderCurrentTab()}
        </div>
        
        <div className={`tab-content ${activeTab === 'history' ? 'active' : ''}`} id="history">
          {renderHistoryTab()}
        </div>
        
        <div className={`tab-content ${activeTab === 'compare' ? 'active' : ''}`} id="compare">
          {renderCompareTab()}
        </div>
      </div>
    </div>
  );
};

export default ResultsManager;