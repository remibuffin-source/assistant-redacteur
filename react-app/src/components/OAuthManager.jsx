import React, { useState, useEffect } from 'react';
import { apiService, socketService } from '../services/apiService';
import './OAuthManager.css';

/**
 * Composant de gestion des connexions OAuth
 */
const OAuthManager = ({ onConnectionChange }) => {
  const [platforms, setPlatforms] = useState([]);
  const [connectedAccounts, setConnectedAccounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadPlatforms();
    loadConnectedAccounts();

    // Écouter les mises à jour Socket.IO
    socketService.onPublicationStatus((data) => {
      if (data.type === 'oauth_connected' || data.type === 'oauth_disconnected') {
        loadConnectedAccounts();
      }
    });

    return () => {
      socketService.removeAllListeners();
    };
  }, []);

  const loadPlatforms = async () => {
    try {
      const response = await apiService.getOAuthPlatforms();
      if (response.success) {
        setPlatforms(response.data);
      }
    } catch (error) {
      setError('Failed to load OAuth platforms');
      console.error('Load platforms error:', error);
    }
  };

  const loadConnectedAccounts = async () => {
    try {
      setLoading(true);
      const response = await apiService.getOAuthStatus();
      if (response.success) {
        setConnectedAccounts(response.data);
        onConnectionChange && onConnectionChange(response.data);
      }
    } catch (error) {
      setError('Failed to load connected accounts');
      console.error('Load accounts error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthConnect = (platform) => {
    // Rediriger vers l'URL OAuth du backend
    const redirectUrl = `${window.location.origin}/oauth/callback`;
    const state = btoa(JSON.stringify({ redirectUrl }));

    window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/oauth/${platform.id}?state=${state}`;
  };

  const handleDisconnect = async (platformId) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir déconnecter votre compte ${platformId} ?`)) {
      return;
    }

    try {
      const response = await apiService.disconnectSocialAccount(platformId);
      if (response.success) {
        await loadConnectedAccounts();
      }
    } catch (error) {
      setError(`Failed to disconnect ${platformId}`);
      console.error('Disconnect error:', error);
    }
  };

  if (loading) {
    return (
      <div className="oauth-manager loading">
        <div className="loading-spinner">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="oauth-manager">
      <div className="oauth-header">
        <h3>Connexions Réseaux Sociaux</h3>
        <p>Connectez vos comptes pour publier automatiquement</p>
      </div>

      {error && (
        <div className="error-message">
          {error}
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}

      <div className="platforms-grid">
        {platforms.map((platform) => (
          <div key={platform.id} className={`platform-card ${!platform.available ? 'disabled' : ''}`}>
            <div className="platform-header">
              <div className="platform-icon">
                <i className={platform.icon}></i>
              </div>
              <div className="platform-info">
                <h4>{platform.name}</h4>
                <p>{platform.description}</p>
              </div>
            </div>

            <div className="platform-status">
              {connectedAccounts[platform.id]?.connected ? (
                <div className="connected-status">
                  <span className="status-indicator connected"></span>
                  <span>Connecté</span>
                  <div className="account-info">
                    <small>{connectedAccounts[platform.id].account?.name}</small>
                    {connectedAccounts[platform.id].account?.displayName && (
                      <small className="display-name">
                        ({connectedAccounts[platform.id].account.displayName})
                      </small>
                    )}
                  </div>
                </div>
              ) : (
                <div className="disconnected-status">
                  <span className="status-indicator disconnected"></span>
                  <span>Non connecté</span>
                </div>
              )}
            </div>

            <div className="platform-actions">
              {connectedAccounts[platform.id]?.connected ? (
                <button
                  className="btn-disconnect"
                  onClick={() => handleDisconnect(platform.id)}
                >
                  Déconnecter
                </button>
              ) : (
                <button
                  className="btn-connect"
                  onClick={() => handleOAuthConnect(platform)}
                  disabled={!platform.available}
                >
                  {platform.available ? 'Connecter' : 'Bientôt disponible'}
                </button>
              )}
            </div>

            {!platform.available && (
              <div className="platform-overlay">
                <span>Bientôt disponible</span>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="oauth-info">
        <div className="info-item">
          <i className="fas fa-shield-alt"></i>
          <span>Vos données sont chiffrées et sécurisées</span>
        </div>
        <div className="info-item">
          <i className="fas fa-clock"></i>
          <span>Les publications sont automatiques selon votre calendrier</span>
        </div>
        <div className="info-item">
          <i className="fas fa-chart-line"></i>
          <span>Analysez les performances de vos publications</span>
        </div>
      </div>
    </div>
  );
};

export default OAuthManager;
