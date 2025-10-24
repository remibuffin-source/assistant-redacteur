import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

/**
 * Composant ProtectedRoute pour gérer l'accès aux routes protégées
 * @param {Object} props - Propriétés du composant
 * @param {React.Component} props.children - Composant enfant à protéger
 * @param {boolean} props.requireAdmin - Si true, nécessite des droits administrateur
 * @param {string} props.redirectTo - Route de redirection par défaut (défaut: '/login')
 */
const ProtectedRoute = ({
  children,
  requireAdmin = false,
  redirectTo = '/login'
}) => {
  const { user, isLoading, isAuthenticated } = useAuth();
  const location = useLocation();

  // Afficher un indicateur de chargement pendant la vérification de l'authentification
  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Vérification de l'authentification...</p>
      </div>
    );
  }

  // Rediriger vers la page de connexion si l'utilisateur n'est pas authentifié
  if (!isAuthenticated) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // Vérifier les droits administrateur si requis
  if (requireAdmin) {
    const isAdmin = user?.role === 'admin' || user?.email === 'admin@studioducapbrun.com';
    
    if (!isAdmin) {
      return (
        <div className="access-denied" style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          padding: '20px',
          textAlign: 'center'
        }}>
          <i className="fas fa-shield-alt" style={{ fontSize: '64px', color: '#ff6b2c', marginBottom: '20px' }}></i>
          <h2 style={{ fontSize: '28px', marginBottom: '10px' }}>Accès refusé</h2>
          <p style={{ fontSize: '16px', color: '#666', marginBottom: '30px' }}>
            Vous n'avez pas les droits administrateur nécessaires pour accéder à cette page.
          </p>
          <button 
            onClick={() => window.location.href = '/'}
            style={{
              padding: '12px 24px',
              fontSize: '16px',
              backgroundColor: '#ff6b2c',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#e55a2b'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#ff6b2c'}
          >
            Retour à l'accueil
          </button>
        </div>
      );
    }
  }

  // Rendre le composant enfant si toutes les vérifications passent
  return children;
};

export default ProtectedRoute;
