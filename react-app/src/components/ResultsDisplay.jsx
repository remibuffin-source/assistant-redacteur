const ResultsDisplay = ({ result, onCopy, onDownload }) => {
  if (!result) {
    return (
      <div className="section fade-in">
        <h3 className="section-title">
          <i className="fas fa-cog"></i>
          Résultats
        </h3>
        <div className="result-area">
          <p>Aucun résultat disponible. Lancez un traitement pour voir les résultats ici.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="section fade-in">
      <h3 className="section-title">
        <i className="fas fa-cog"></i>
        Résultats
      </h3>
      
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
    </div>
  );
};

export default ResultsDisplay;