import React, { useState } from 'react'

function App() {
  const [content, setContent] = useState('')
  const [result, setResult] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [projectTitle, setProjectTitle] = useState('')
  const [targetAudience, setTargetAudience] = useState('')
  const [tone, setTone] = useState('')

  const handleGenerate = async () => {
    if (!content.trim()) {
      alert('Veuillez entrer du contenu à traiter')
      return
    }

    setIsLoading(true)
    setResult('')

    // Simulation de génération IA
    setTimeout(() => {
      const generatedContent = `# Résultat généré par Assistant Rédactionnel

## Projet: ${projectTitle || 'Sans titre'}

### Public cible: ${targetAudience || 'Non spécifié'}

### Ton: ${tone || 'Neutre'}

---

## Contenu généré:

${content}

---

*Généré le ${new Date().toLocaleString('fr-FR')}*
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
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f5f5f5',
      fontFamily: 'Arial, sans-serif',
      padding: '20px'
    }}>
      {/* Header */}
      <div style={{
        backgroundColor: '#2c3e50',
        color: 'white',
        padding: '20px',
        borderRadius: '8px',
        marginBottom: '20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '2rem' }}>🎉 Assistant Rédactionnel</h1>
          <p style={{ margin: '5px 0 0 0', opacity: 0.9 }}>Interface Complète Fonctionnelle</p>
        </div>
        <div>
          <button
            style={{
              background: 'none',
              border: '1px solid white',
              color: 'white',
              padding: '10px 20px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '1rem'
            }}
            onClick={() => alert('Aide - Interface complète de l\'Assistant Rédactionnel')}
          >
            ❓ Aide
          </button>
        </div>
      </div>

      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: '1fr 300px',
        gap: '20px'
      }}>
        {/* Colonne principale */}
        <div>
          {/* Informations du projet */}
          <div style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            marginBottom: '20px'
          }}>
            <h2 style={{ color: '#333', marginBottom: '15px' }}>📋 Informations du Projet</h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#555' }}>
                  Titre du projet
                </label>
                <input
                  type="text"
                  value={projectTitle}
                  onChange={(e) => setProjectTitle(e.target.value)}
                  placeholder="Nom de votre projet"
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '1rem'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#555' }}>
                  Public cible
                </label>
                <input
                  type="text"
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  placeholder="Votre audience"
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '1rem'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#555' }}>
                  Ton souhaité
                </label>
                <input
                  type="text"
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  placeholder="Style de rédaction"
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '1rem'
                  }}
                />
              </div>
            </div>
          </div>

          {/* Zone de contenu */}
          <div style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            marginBottom: '20px'
          }}>
            <h2 style={{ color: '#333', marginBottom: '15px' }}>✏️ Contenu à traiter</h2>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Entrez votre contenu ici..."
              style={{
                width: '100%',
                minHeight: '200px',
                padding: '15px',
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
            marginBottom: '20px'
          }}>
            <button
              onClick={handleGenerate}
              disabled={isLoading || !content.trim()}
              style={{
                backgroundColor: isLoading ? '#ccc' : '#4CAF50',
                color: 'white',
                border: 'none',
                padding: '15px 30px',
                fontSize: '1.2rem',
                borderRadius: '8px',
                cursor: isLoading || !content.trim() ? 'not-allowed' : 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                fontWeight: 'bold'
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
              padding: '20px',
              borderRadius: '8px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '15px'
              }}>
                <h2 style={{ color: '#333', margin: 0 }}>📄 Résultat généré</h2>
                <button
                  onClick={handleCopy}
                  style={{
                    backgroundColor: '#2196F3',
                    color: 'white',
                    border: 'none',
                    padding: '10px 20px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '1rem'
                  }}
                >
                  📋 Copier
                </button>
              </div>
              <div style={{
                backgroundColor: '#f9f9f9',
                padding: '15px',
                borderRadius: '4px',
                border: '1px solid #eee',
                whiteSpace: 'pre-wrap',
                fontFamily: 'monospace',
                maxHeight: '400px',
                overflowY: 'auto',
                fontSize: '0.9rem'
              }}>
                {result}
              </div>
            </div>
          )}
        </div>

        {/* Colonne latérale */}
        <div>
          {/* Sélection IA */}
          <div style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            marginBottom: '20px'
          }}>
            <h3 style={{ color: '#333', marginBottom: '15px' }}>🤖 Sélection d'IA</h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                { id: 'gpt4', name: 'GPT-4', icon: '🧠' },
                { id: 'claude', name: 'Claude', icon: '🦾' },
                { id: 'gemini', name: 'Gemini', icon: '💎' }
              ].map(ai => (
                <div
                  key={ai.id}
                  style={{
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    backgroundColor: '#f9f9f9',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                  }}
                >
                  <span style={{ fontSize: '1.2rem' }}>{ai.icon}</span>
                  <span>{ai.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Tâches de traitement */}
          <div style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            marginBottom: '20px'
          }}>
            <h3 style={{ color: '#333', marginBottom: '15px' }}>⚙️ Tâches de traitement</h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[
                { id: 'rewrite', name: 'Réécrire', icon: '✏️' },
                { id: 'summarize', name: 'Résumer', icon: '📝' },
                { id: 'expand', name: 'Développer', icon: '📈' }
              ].map(task => (
                <label key={task.id} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  padding: '8px',
                  borderRadius: '4px',
                  backgroundColor: '#f9f9f9'
                }}>
                  <input type="checkbox" defaultChecked={task.id === 'rewrite'} />
                  <span>{task.icon}</span>
                  <span>{task.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Formats de sortie */}
          <div style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ color: '#333', marginBottom: '15px' }}>📤 Formats de sortie</h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[
                { id: 'text', name: 'Texte', icon: '📄' },
                { id: 'html', name: 'HTML', icon: '🌐' },
                { id: 'markdown', name: 'Markdown', icon: '📝' }
              ].map(format => (
                <label key={format.id} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  padding: '8px',
                  borderRadius: '4px',
                  backgroundColor: '#f9f9f9'
                }}>
                  <input type="checkbox" defaultChecked={format.id === 'text'} />
                  <span>{format.icon}</span>
                  <span>{format.name}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
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