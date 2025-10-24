import { useState } from 'react'
import './App.css'

// Test simple sans imports de composants externes
function App() {
  const [content, setContent] = useState('')
  const [result, setResult] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleGenerate = () => {
    if (!content.trim()) return

    setIsLoading(true)
    setResult('')

    setTimeout(() => {
      setResult(`Contenu généré:\n\n${content}\n\n[Traitement terminé]`)
      setIsLoading(false)
    }, 1000)
  }

  return (
    <div className="App">
      <div style={{
        backgroundColor: '#2c3e50',
        color: 'white',
        padding: '20px',
        textAlign: 'center'
      }}>
        <h1>Assistant Rédactionnel - Mode Debug</h1>
        <p>Cette version teste l'affichage de base</p>
      </div>

      <div style={{
        maxWidth: '800px',
        margin: '20px auto',
        padding: '20px'
      }}>
        <h2>Test de Fonctionnalité</h2>

        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Tapez quelque chose..."
          style={{
            width: '100%',
            height: '150px',
            marginBottom: '20px',
            padding: '10px'
          }}
        />

        <button
          onClick={handleGenerate}
          disabled={isLoading || !content.trim()}
          style={{
            backgroundColor: isLoading ? '#ccc' : '#4CAF50',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '4px',
            cursor: isLoading ? 'not-allowed' : 'pointer'
          }}
        >
          {isLoading ? 'Chargement...' : 'Générer'}
        </button>

        {result && (
          <div style={{
            marginTop: '20px',
            padding: '15px',
            backgroundColor: '#f0f0f0',
            borderRadius: '4px',
            whiteSpace: 'pre-wrap'
          }}>
            <h3>Résultat:</h3>
            {result}
          </div>
        )}
      </div>
    </div>
  )
}

export default App