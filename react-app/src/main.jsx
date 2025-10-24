import React, { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import './styles/global.css'
import ConfigAPIPageFixed from './components/ConfigAPIPageFixed'
import NetworkAPIPage from './components/NetworkAPIPage'
import AdminPromptBuilder from './components/AdminPromptBuilder'
import CalendarPage from './components/CalendarPage'
import LoginPage from './components/LoginPage'
import AccountPageFixed from './components/AccountPageFixed'
import ResultsManagementPage from './components/ResultsManagementPage'
import SubscriptionPage from './components/SubscriptionPage'
import AdvancedEditor from './components/AdvancedEditor'
import ContentEditorFixed from './components/ContentEditorFixed'
import HomeFixed from './components/HomeFixed'
import ErrorBoundary from './components/ErrorBoundary'
import TextareaTest from './components/TextareaTest'
import ProtectedRoute from './components/ProtectedRoute'
import { AuthProvider } from './components/AuthProvider'
import EmailVerification from './components/EmailVerification'
import ResetPassword from './components/ResetPassword'
import AdminPage from './components/AdminPage'

// Composant wrapper pour forcer le re-render lors des changements de route
function AppRoutes() {
  const location = useLocation();
  const [displayLocation, setDisplayLocation] = React.useState(location);
  const [transitionStage, setTransitionStage] = React.useState("fadeIn");
  const [renderKey, setRenderKey] = React.useState(0);

  // Effet pour gérer la transition entre les pages
  React.useEffect(() => {
    if (location.pathname !== displayLocation.pathname || 
        location.key !== displayLocation.key) {
      setTransitionStage("fadeOut");
    }
  }, [location]);

  // Effet pour finaliser la transition
  React.useEffect(() => {
    if (transitionStage === "fadeOut") {
      const timer = setTimeout(() => {
        setDisplayLocation(location);
        setRenderKey(prev => prev + 1); // Incrémenter pour forcer le re-render
        setTransitionStage("fadeIn");
      }, 50); // Très court délai pour forcer le démontage/remontage
      return () => clearTimeout(timer);
    }
  }, [transitionStage, location]);

  // Scroll en haut à chaque changement de route
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [displayLocation.pathname]);
  
  // Générer une clé unique pour chaque route
  const getRouteKey = (path) => `${path}-${renderKey}-${displayLocation.key}`;
  
  return (
    <div className={`route-transition ${transitionStage}`}>
      <Routes location={displayLocation}>
        {/* Route publique - Page de connexion */}
        <Route path="/login" element={<LoginPage key={getRouteKey('/login')} />} />

        {/* Route publique - Vérification par email */}
        <Route path="/verify-email" element={<EmailVerification key={getRouteKey('/verify-email')} />} />

        {/* Route publique - Réinitialisation mot de passe */}
        <Route path="/reset-password" element={<ResetPassword key={getRouteKey('/reset-password')} />} />

        {/* Routes protégées - Administrateur uniquement */}
        <Route 
          path="/config-api" 
          element={
            <ProtectedRoute requireAdmin={true}>
              <ConfigAPIPageFixed key={getRouteKey('/config-api')} />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin-prompt-builder" 
          element={
            <ProtectedRoute requireAdmin={true}>
              <AdminPromptBuilder key={getRouteKey('/admin-prompt-builder')} />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute requireAdmin={true}>
              <AdminPage key={getRouteKey('/admin')} />
            </ProtectedRoute>
          } 
        />

        {/* Routes protégées - Utilisateurs authentifiés */}
        <Route 
          path="/network-api" 
          element={
            <ProtectedRoute>
              <NetworkAPIPage key={getRouteKey('/network-api')} />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/calendar" 
          element={
            <ProtectedRoute>
              <CalendarPage key={getRouteKey('/calendar')} />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/account" 
          element={
            <ProtectedRoute>
              <AccountPageFixed key={getRouteKey('/account')} />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/subscription" 
          element={
            <ProtectedRoute>
              <SubscriptionPage key={getRouteKey('/subscription')} />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/editor" 
          element={
            <ProtectedRoute>
              <ContentEditorFixed key={getRouteKey('/editor')} />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/advanced-editor" 
          element={
            <ProtectedRoute>
              <AdvancedEditor key={getRouteKey('/advanced-editor')} />
            </ProtectedRoute>
          } 
        />

        {/* Route publique pour les tests */}
        <Route path="/test-textarea" element={<TextareaTest key={getRouteKey('/test-textarea')} />} />

        {/* Route par défaut - Page d'accueil (publique TEMPORAIREMENT) */}
        <Route path="/" element={<HomeFixed key={getRouteKey('/')} />} />

        {/* Redirection pour les routes inconnues */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <AuthProvider>
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </ErrorBoundary>
  </StrictMode>,
)
