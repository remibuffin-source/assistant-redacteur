import React, { useState, useEffect } from 'react';
import axios from 'axios';

// URL de base de l'API backend
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

const PostizConnect = ({ onConnectionChange }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [postizToken, setPostizToken] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    checkConnectionStatus();
  }, []);

  // Récupérer le token JWT depuis localStorage
  const getAuthHeaders = () => {
    const authData = localStorage.getItem('auth_data');
    if (authData) {
      try {
        const parsed = JSON.parse(authData);
        if (parsed.token) {
          return { Authorization: `Bearer ${parsed.token}` };
        }
      } catch (e) {
        console.error('Erreur parsing auth_data:', e);
      }
    }
    return {};
  };

  const checkConnectionStatus = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${API_URL}/postiz/auth/status`, {
        headers: getAuthHeaders()
      });
      setIsConnected(response.data.connected);
      if (onConnectionChange) {
        onConnectionChange(response.data.connected);
      }
    } catch (error) {
      console.error('Erreur vérification statut Postiz:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnect = async () => {
    if (!postizToken.trim()) {
      setError('Veuillez entrer votre token Postiz');
      return;
    }

    try {
      setIsConnecting(true);
      setError('');

      const response = await axios.post(`${API_URL}/postiz/auth/connect`, {
        postizToken: postizToken.trim()
      }, {
        headers: getAuthHeaders()
      });

      if (response.data.success) {
        setIsConnected(true);
        setShowModal(false);
        setPostizToken('');
        if (onConnectionChange) {
          onConnectionChange(true);
        }
      }
    } catch (error) {
      console.error('Erreur connexion Postiz:', error);
      setError(error.response?.data?.error || 'Erreur lors de la connexion à Postiz');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    if (!window.confirm('Êtes-vous sûr de vouloir déconnecter votre compte Postiz ?')) {
      return;
    }

    try {
      setIsLoading(true);
      await axios.post(`${API_URL}/postiz/auth/disconnect`, {}, {
        headers: getAuthHeaders()
      });
      setIsConnected(false);
      if (onConnectionChange) {
        onConnectionChange(false);
      }
    } catch (error) {
      console.error('Erreur déconnexion Postiz:', error);
      alert('Erreur lors de la déconnexion');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="postiz-connect-loading">
        <i className="fas fa-spinner fa-spin"></i> Vérification...
      </div>
    );
  }

  return (
    <div className="postiz-connect-container">
      {isConnected ? (
        <div className="postiz-connected">
          <div className="postiz-status">
            <i className="fas fa-check-circle" style={{ color: '#10b981' }}></i>
            <span>Compte Postiz connecté</span>
          </div>
          <button 
            onClick={handleDisconnect}
            className="btn-disconnect"
            disabled={isLoading}
          >
            <i className="fas fa-unlink"></i> Déconnecter
          </button>
        </div>
      ) : (
        <div className="postiz-disconnected" style={{ padding: '20px' }}>
          <button 
            onClick={() => setShowModal(true)}
            className="btn-connect"
            style={{ width: '100%', padding: '15px 30px', fontSize: '1.1rem' }}
          >
            <i className="fas fa-plug" style={{ fontSize: '1.12em' }}></i> Connecter Postiz
          </button>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Connecter votre compte Postiz</h3>
              <button 
                onClick={() => setShowModal(false)}
                className="modal-close"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            <div className="modal-body">
              <div className="instructions">
                <h4 style={{ color: '#2c3e50' }}>Comment obtenir votre token API ?</h4>
                <ol style={{ color: '#2c3e50' }}>
                  <li>
                    Créez votre compte gratuit sur{' '}
                    <a 
                      href="https://postiz.assistant-redacteur.fr" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      style={{ fontWeight: 'bold', color: '#667eea' }}
                    >
                      postiz.assistant-redacteur.fr
                    </a>
                  </li>
                  <li>
                    Une fois connecté, allez en bas à gauche dans{' '}
                    <a 
                      href="https://postiz.assistant-redacteur.fr/settings" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      style={{ fontWeight: 'bold', color: '#667eea', textDecoration: 'none' }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{ verticalAlign: 'middle', marginRight: '4px' }}>
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
                      </svg>
                      Paramètres
                    </a>
                  </li>
                  <li>→ <strong>API publique</strong></li>
                  <li>Révélez/Copiez votre <strong>token API personnel</strong></li>
                  <li>Collez-le ci-dessous pour connecter l'Assistant Rédacteur</li>
                </ol>
                <div style={{ marginTop: '15px', padding: '16px', background: '#f0f9ff', borderRadius: '8px' }}>
                  <label htmlFor="postiz-token" style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#2c3e50', fontSize: '0.95rem' }}>Token API Postiz</label>
                  <input
                    id="postiz-token"
                    type="text"
                    value={postizToken}
                    onChange={(e) => setPostizToken(e.target.value)}
                    placeholder="Collez votre token ici..."
                    className="form-control"
                    disabled={isConnecting}
                    style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.95rem' }}
                  />
                  {error && <div className="error-message" style={{ marginTop: '8px', color: '#dc2626', fontSize: '0.9rem' }}>{error}</div>}
                </div>
              </div>

              <div style={{ marginTop: '12px', padding: '10px 12px', background: '#fff', borderRadius: '6px', fontSize: '0.85rem', color: '#2c3e50', border: '1px solid #e5e7eb' }}>
                <i className="fas fa-shield-alt" style={{ color: '#667eea', marginRight: '8px' }}></i>
                <strong>Sécurité :</strong> Votre token est unique et personnel. Il est stocké de manière chiffrée.
              </div>

              <div className="modal-actions">
                <button 
                  onClick={() => setShowModal(false)}
                  className="btn-secondary"
                  disabled={isConnecting}
                >
                  Annuler
                </button>
                <button 
                  onClick={handleConnect}
                  className="btn-primary"
                  disabled={isConnecting}
                  style={{ opacity: isConnecting ? 0.7 : 1 }}
                >
                  {isConnecting ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i> Connexion...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-check"></i> Connecter
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .postiz-connect-container {
          padding: 1rem;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          background: #f9fafb;
        }

        .postiz-connected {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .postiz-status {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: 500;
        }

        .postiz-disconnected {
          text-align: center;
        }

        .postiz-info {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 1rem;
          color: #6b7280;
        }

        .btn-connect, .btn-disconnect {
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          transition: all 0.2s;
        }

        .btn-connect {
          background: #3b82f6;
          color: white;
        }

        .btn-connect:hover {
          background: #2563eb;
        }

        .btn-disconnect {
          background: #ef4444;
          color: white;
        }

        .btn-disconnect:hover {
          background: #dc2626;
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .modal-content {
          background: white;
          border-radius: 12px;
          max-width: 600px;
          width: 90%;
          max-height: 90vh;
          overflow-y: auto;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem;
          border-bottom: 1px solid #e5e7eb;
        }

        .modal-header h3 {
          margin: 0;
        }

        .modal-close {
          background: none;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
          color: #6b7280;
        }

        .modal-body {
          padding: 1.5rem;
        }

        .instructions {
          background: #f0f9ff;
          padding: 1rem;
          border-radius: 8px;
          margin-bottom: 1.5rem;
        }

        .instructions h4 {
          margin-top: 0;
          color: #1e40af;
        }

        .instructions ol {
          margin: 0.5rem 0 0 1.5rem;
          padding: 0;
        }

        .instructions li {
          margin-bottom: 0.5rem;
        }

        .instructions a {
          color: #3b82f6;
          text-decoration: none;
        }

        .instructions a:hover {
          text-decoration: underline;
        }

        .form-group {
          margin-bottom: 1.5rem;
        }

        .form-group label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 500;
        }

        .form-control {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 1rem;
        }

        .form-control:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .error-message {
          color: #ef4444;
          font-size: 0.875rem;
          margin-top: 0.5rem;
        }

        .modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 1rem;
          margin-top: 1.5rem;
        }

        .btn-primary, .btn-secondary {
          flex: 1;
          padding: 0.75rem 1.5rem;
          min-height: 44px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }

        .btn-primary {
          background: #3b82f6;
          color: white;
        }

        .btn-primary:hover:not(:disabled) {
          background: #2563eb;
        }

        .btn-secondary {
          background: #e5e7eb;
          color: #374151;
        }

        .btn-secondary:hover:not(:disabled) {
          background: #d1d5db;
        }

        button:disabled {
          cursor: not-allowed;
          opacity: 0.6;
        }
      `}</style>
    </div>
  );
};

export default PostizConnect;
