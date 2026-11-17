import React, { useState, useEffect } from 'react';
import { metaApi, metaStorage } from '../../services/metaApi';
import './MetaConnect.css';

/**
 * Composant de connexion Facebook/Instagram
 */
export default function MetaConnect({ onConnect, onDisconnect }) {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [pages, setPages] = useState([]);
  const [selectedPage, setSelectedPage] = useState(null);
  const [error, setError] = useState(null);
  const [showPageSelector, setShowPageSelector] = useState(false);

  useEffect(() => {
    // Vérifier si déjà connecté
    const connected = metaStorage.isConnected();
    setIsConnected(connected);

    if (connected) {
      const savedPages = metaStorage.getPages();
      setPages(savedPages);
    }

    // Gérer le callback OAuth
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    
    if (code && !connected) {
      handleOAuthCallback(code);
    }
  }, []);

  /**
   * Gérer le callback OAuth après redirection
   */
  const handleOAuthCallback = async (code) => {
    setIsConnecting(true);
    setError(null);

    try {
      console.log('🔄 Échange du code OAuth...');
      
      const response = await metaApi.exchangeToken(code);

      if (response.success) {
        console.log('✅ Token obtenu avec succès');
        
        // Sauvegarder les données
        metaStorage.save(response.data);
        
        setPages(response.data.pages);
        setIsConnected(true);
        setShowPageSelector(true);

        // Nettoyer l'URL
        window.history.replaceState({}, document.title, window.location.pathname);

        if (onConnect) {
          onConnect(response.data);
        }
      } else {
        throw new Error(response.message || 'Erreur lors de la connexion');
      }
    } catch (error) {
      console.error('❌ Erreur OAuth:', error);
      setError(error.message);
    } finally {
      setIsConnecting(false);
    }
  };

  /**
   * Initier la connexion OAuth
   */
  const handleConnect = async () => {
    setIsConnecting(true);
    setError(null);

    try {
      console.log('🔄 Récupération de l\'URL d\'autorisation...');
      
      const response = await metaApi.getAuthUrl();

      if (response.success) {
        console.log('✅ Redirection vers Facebook...');
        window.location.href = response.authUrl;
      } else {
        throw new Error(response.message || 'Erreur lors de la récupération de l\'URL');
      }
    } catch (error) {
      console.error('❌ Erreur connexion:', error);
      setError(error.message);
      setIsConnecting(false);
    }
  };

  /**
   * Déconnexion
   */
  const handleDisconnect = () => {
    metaStorage.clear();
    setIsConnected(false);
    setPages([]);
    setSelectedPage(null);
    setShowPageSelector(false);

    if (onDisconnect) {
      onDisconnect();
    }
  };

  /**
   * Sélectionner une Page
   */
  const handleSelectPage = (page) => {
    setSelectedPage(page);
    setShowPageSelector(false);
  };

  return (
    <div className="meta-connect">
      {!isConnected ? (
        <div className="meta-connect-box">
          <h3>Connecter Facebook & Instagram</h3>
          <p>Publiez automatiquement sur vos Pages Facebook et comptes Instagram Business.</p>
          
          {error && (
            <div className="meta-error">
              <i className="fas fa-exclamation-circle"></i>
              {error}
            </div>
          )}

          <button
            className="btn-connect-meta"
            onClick={handleConnect}
            disabled={isConnecting}
            style={{ opacity: isConnecting ? 0.7 : 1 }}
          >
            {isConnecting ? (
              <>
                <i className="fas fa-spinner fa-spin"></i> Connexion en cours...
              </>
            ) : (
              <>
                <i className="fab fa-facebook"></i> Connecter avec Facebook
              </>
            )}
          </button>

          <div className="meta-info">
            <i className="fas fa-info-circle"></i>
            <span>Vous serez redirigé vers Facebook pour autoriser l'accès.</span>
          </div>
        </div>
      ) : (
        <div className="meta-connected">
          <div className="meta-status">
            <i className="fas fa-check-circle"></i>
            <span>Connecté à Facebook & Instagram</span>
          </div>

          {pages.length > 0 && (
            <div className="meta-pages">
              <h4>Pages disponibles ({pages.length})</h4>
              
              {showPageSelector ? (
                <div className="page-selector">
                  {pages.map(page => (
                    <div
                      key={page.id}
                      className="page-item"
                      onClick={() => handleSelectPage(page)}
                    >
                      <div className="page-info">
                        <i className="fab fa-facebook-square"></i>
                        <span className="page-name">{page.name}</span>
                      </div>
                      {page.instagram_business_account && (
                        <div className="instagram-badge">
                          <i className="fab fa-instagram"></i>
                          <span>Instagram lié</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : selectedPage ? (
                <div className="selected-page">
                  <div className="page-info">
                    <i className="fab fa-facebook-square"></i>
                    <span className="page-name">{selectedPage.name}</span>
                  </div>
                  <button
                    className="btn-change-page"
                    onClick={() => setShowPageSelector(true)}
                  >
                    Changer
                  </button>
                </div>
              ) : (
                <button
                  className="btn-select-page"
                  onClick={() => setShowPageSelector(true)}
                >
                  Sélectionner une Page
                </button>
              )}
            </div>
          )}

          <button
            className="btn-disconnect"
            onClick={handleDisconnect}
          >
            <i className="fas fa-sign-out-alt"></i> Déconnecter
          </button>
        </div>
      )}
    </div>
  );
}
