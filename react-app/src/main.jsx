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
import AdminPricingPage from './components/AdminPricingPage'
import AdminCreditsPage from './components/AdminCreditsPage'
import PolitiqueCGV from './pages/PolitiqueCGV'
import DataDeletionStatus from './pages/DataDeletionStatus'
import SocialOnboardingPage from './pages/SocialOnboardingPage'
import InvoiceGenerator from './components/InvoiceGenerator'
import DevisGenerator from './components/DevisGenerator'
import WanVideoGenerator from './components/WanVideoGenerator'
import StockagePage from './components/StockagePage'

// Composant wrapper pour forcer le re-render lors des changements de route
function AppRoutes() {
  const location = useLocation();

  // Scroll en haut à chaque changement de route
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);
  
  // Générer une clé unique pour chaque route basée uniquement sur le pathname
  const getRouteKey = (path) => `${path}-${location.key || 'default'}`;
  
  return (
    <div className="route-transition fadeIn">
      <Routes location={location}>
        {/* Route publique - Page de connexion */}
        <Route path="/login" element={<LoginPage key={getRouteKey('/login')} />} />

        {/* Route publique - Vérification par email */}
        <Route path="/verify-email" element={<EmailVerification key={getRouteKey('/verify-email')} />} />

        {/* Route publique - Réinitialisation mot de passe */}
        <Route path="/reset-password" element={<ResetPassword key={getRouteKey('/reset-password')} />} />

        {/* Routes protégées - Administrateur uniquement */}
        <Route 
          path="/config-api" 
          element={<ConfigAPIPageFixed key={getRouteKey('/config-api')} />} 
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
        <Route 
          path="/admin-pricing" 
          element={
            <ProtectedRoute requireAdmin={true}>
              <AdminPricingPage key={getRouteKey('/admin-pricing')} />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin-credits" 
          element={
            <ProtectedRoute requireAdmin={true}>
              <AdminCreditsPage key={getRouteKey('/admin-credits')} />
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
          path="/social-onboarding" 
          element={
            <ProtectedRoute>
              <SocialOnboardingPage key={getRouteKey('/social-onboarding')} />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/calendar" 
          element={<CalendarPage key={getRouteKey('/calendar')} />} 
        />
        <Route 
          path="/account" 
          element={<AccountPageFixed key={getRouteKey('/account')} />} 
        />
        <Route 
          path="/subscription" 
          element={<SubscriptionPage key={getRouteKey('/subscription')} />} 
        />
        <Route 
          path="/editor" 
          element={<ContentEditorFixed key={getRouteKey('/editor')} />} 
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

        {/* Route publique - Politique & CGV */}
        <Route path="/politique-cgv" element={<PolitiqueCGV key={getRouteKey('/politique-cgv')} />} />

        {/* Route publique - Statut suppression données Meta */}
        <Route path="/data-deletion-status" element={<DataDeletionStatus key={getRouteKey('/data-deletion-status')} />} />

        {/* Route protégée - Facturier Studio du Cap Brun (Admin uniquement) */}
        <Route 
          path="/facturier" 
          element={
            <ProtectedRoute requireAdmin={true}>
              <InvoiceGenerator key={getRouteKey('/facturier')} />
            </ProtectedRoute>
          } 
        />

        {/* Route protégée - Devis Studio du Cap Brun (Admin uniquement) */}
        <Route 
          path="/devis" 
          element={
            <ProtectedRoute requireAdmin={true}>
              <DevisGenerator key={getRouteKey('/devis')} />
            </ProtectedRoute>
          } 
        />

        {/* Route protégée - Générateur de vidéos WAN 2.6 */}
        <Route 
          path="/wan-video" 
          element={
            <ProtectedRoute>
              <WanVideoGenerator key={getRouteKey('/wan-video')} />
            </ProtectedRoute>
          } 
        />

        {/* Route protégée - Stockage Serveur */}
        <Route 
          path="/stockage" 
          element={
            <ProtectedRoute>
              <StockagePage key={getRouteKey('/stockage')} />
            </ProtectedRoute>
          } 
        />

        {/* Route par défaut - Page d'accueil (publique TEMPORAIREMENT) */}
        <Route path="/" element={<HomeFixed key={getRouteKey('/')} />} />

        {/* Redirection pour les routes inconnues */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

const rootElement = document.getElementById('root');
const app = (
  <ErrorBoundary>
    <AuthProvider>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  </ErrorBoundary>
);

// StrictMode uniquement en développement pour éviter les erreurs DOM sur Safari
if (import.meta.env.DEV) {
  createRoot(rootElement).render(<StrictMode>{app}</StrictMode>);
} else {
  createRoot(rootElement).render(app);
}
