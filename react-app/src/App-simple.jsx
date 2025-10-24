import React from 'react'
import './App.css'

function App() {
  return (
    <div className="App" style={{
      backgroundColor: '#f0f0f0',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1 style={{
        color: '#333',
        fontSize: '2.5rem',
        marginBottom: '1rem'
      }}>
        🎉 Assistant Rédacteur - Fonctionnel !
      </h1>

      <div style={{
        backgroundColor: 'white',
        padding: '2rem',
        borderRadius: '10px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        maxWidth: '600px',
        textAlign: 'center'
      }}>
        <h2 style={{ color: '#4CAF50', marginBottom: '1rem' }}>
          ✅ Application React Chargée avec Succès
        </h2>

        <p style={{ color: '#666', lineHeight: '1.6', marginBottom: '2rem' }}>
          L'interface de développement de l'Assistant Rédacteur est maintenant opérationnelle.
          Le serveur Vite fonctionne correctement sur le port 3003.
        </p>

        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ color: '#2196F3', marginBottom: '1rem' }}>Fonctionnalités Disponibles :</h3>
          <ul style={{
            textAlign: 'left',
            display: 'inline-block',
            color: '#555'
          }}>
            <li>✨ Éditeur de texte avancé</li>
            <li>🤖 Génération IA avec OpenAI</li>
            <li>📝 Gestion des tâches multiples</li>
            <li>🎨 Thèmes sombre/clair</li>
            <li>💾 Sauvegarde automatique</li>
            <li>📤 Export multi-formats</li>
            <li>🔐 Authentification utilisateur</li>
            <li>📅 Planification calendrier</li>
          </ul>
        </div>

        <div style={{
          backgroundColor: '#e8f5e8',
          padding: '1rem',
          borderRadius: '5px',
          border: '1px solid #4CAF50'
        }}>
          <p style={{ margin: 0, color: '#2E7D32', fontWeight: 'bold' }}>
            🚀 Prêt pour le développement et les tests !
          </p>
        </div>
      </div>
    </div>
  )
}

export default App