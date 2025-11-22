import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import SimplePreview from './components/SimplePreview';
import CalendarPage from './components/CalendarPage';
import DropboxManager from './components/files/DropboxManager';

// Composant de protection de route
const ProtectedRoute = ({ children }) => {
  if (!dropboxService.isAuthenticated()) {
    return <Navigate to="/" replace state={{ from: window.location.pathname }} />;
  }
  return children;
};

// Layout de l'application avec navigation
const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <span className="text-xl font-bold text-blue-600">Assistant Rédacteur</span>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <a
                  href="/"
                  className="border-blue-500 text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  Accueil
                </a>
                <a
                  href="/calendar"
                  className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  Calendrier
                </a>
                <a
                  href="/files"
                  className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  Mes Fichiers
                </a>
              </div>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:items-center">
              {dropboxService.isAuthenticated() ? (
                <span className="inline-flex items-center px-4 py-2 text-sm text-gray-700">
                  <span className="text-green-500 mr-2">●</span>
                  Connecté à Dropbox
                </span>
              ) : (
                <a
                  href={dropboxService.getAuthUrl()}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <svg className="-ml-1 mr-2 h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M6 1L2 5.5 6 10l4-4.5L6 1zM2 12.5L6 17l4-4.5L6 8l-4 4.5zM6 23l4-4.5L6 14l-4 4.5L6 23zM17 8v8h5.5L24 12l-1.5-2L17 8z" />
                  </svg>
                  Se connecter à Dropbox
                </a>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={
          <Layout>
            <SimplePreview />
          </Layout>
        } />
        <Route path="/calendar" element={
          <Layout>
            <ProtectedRoute>
              <CalendarPage />
            </ProtectedRoute>
          </Layout>
        } />
        <Route path="/files" element={
          <Layout>
            <ProtectedRoute>
              <DropboxManager />
            </ProtectedRoute>
          </Layout>
        } />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
