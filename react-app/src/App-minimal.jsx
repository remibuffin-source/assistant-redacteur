import React, { useState } from 'react'
import './App.css'

function App() {
  const [content, setContent] = useState('')
  const [result, setResult] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleGenerate = async () => {
    if (!content.trim()) {
      alert('Veuillez entrer du contenu à traiter')
      return
    }

    setIsLoading(true)
    setResult('')

    // Simulation de génération IA
    setTimeout(() => {
      const generatedContent = `# Contenu généré par Assistant Rédactionnel

## Analyse de votre contenu

Votre contenu original fait ${content.length} caractères.

## Contenu optimisé

${content}

---

*Généré automatiquement le ${new Date().toLocaleString('fr-FR')}*
      `.trim()

      setResult(generatedContent)
      setIsLoading(false)
    }, 2000)
  }

  const handleCopy = () => {
    if (result) {
      navigator.clipboard.writeText(result)
      alert('Contenu copié !')
    }
  }

  return (
    <div className="App" style={{
      backgroundColor: '#f5f5f5',
      minHeight: '100vh',
      fontFamily: 'Arial, sans-serif'
    }}>
      {/* Menu simplifié */}
      <div style={{
        backgroundColor: '#2c3e50',
        color: 'white',
        padding: '1rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <h1 style={{ margin: 0, fontSize: '1.5rem' }}>Assistant Rédactionnel</h1>
        </div>
        <div>
          <span style={{ marginRight: '1rem' }}>Version Minimale Fonctionnelle</span>
          <button
            style={{
              background: 'none',
              border: '1px solid white',
              color: 'white',
              padding: '0.5rem 1rem',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
            onClick={() => alert('Aide - Version minimale de l\'assistant')}
          >
            ?
          </button>
        </div>
      </div>

      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '2rem'
      }}>
        {/* Section de saisie */}
        <div style={{
          backgroundColor: 'white',
          padding: '2rem',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          marginBottom: '2rem'
        }}>
          <h2 style={{ color: '#333', marginBottom: '1rem' }}>Contenu à traiter</h2>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Entrez votre contenu ici..."
            style={{
              width: '100%',
              minHeight: '200px',
              padding: '1rem',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '1rem',
              fontFamily: 'inherit',
              resize: 'vertical'
            }}
          />
        </div>

        {/* Bouton de génération */}
        <div style={{
          textAlign: 'center',
          marginBottom: '2rem'
        }}>
          <button
            onClick={handleGenerate}
            disabled={isLoading || !content.trim()}
            style={{
              backgroundColor: isLoading ? '#ccc' : '#4CAF50',
              color: 'white',
              border: 'none',
              padding: '1rem 2rem',
              fontSize: '1.2rem',
              borderRadius: '8px',
              cursor: isLoading || !content.trim() ? 'not-allowed' : 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            {isLoading ? (
              <>
                <div style={{
                  width: '20px',
                  height: '20px',
                  border: '2px solid #fff',
                  borderTop: '2px solid transparent',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }}></div>
                Génération en cours...
              </>
            ) : (
              <>
                🚀 Lancer la génération
              </>
            )}
          </button>
        </div>

        {/* Résultats */}
        {result && (
          <div style={{
            backgroundColor: 'white',
            padding: '2rem',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1rem'
            }}>
              <h2 style={{ color: '#333', margin: 0 }}>Résultat généré</h2>
              <button
                onClick={handleCopy}
                style={{
                  backgroundColor: '#2196F3',
                  color: 'white',
                  border: 'none',
                  padding: '0.5rem 1rem',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                📋 Copier
              </button>
            </div>
            <div style={{
              backgroundColor: '#f9f9f9',
              padding: '1rem',
              borderRadius: '4px',
              border: '1px solid #eee',
              whiteSpace: 'pre-wrap',
              fontFamily: 'monospace',
              maxHeight: '400px',
              overflowY: 'auto'
            }}>
              {result}
            </div>
          </div>
        )}
      </div>

      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  )
}

export default App