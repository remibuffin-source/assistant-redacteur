import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import MenuBar from './components/MenuBar'
import ProjectInfo from './components/ProjectInfo'
import AISelection from './components/AISelection'
import UploadArea from './components/UploadArea'
import ProcessingTasks from './components/ProcessingTasks'
import OutputFormats from './components/OutputFormats'
import ResultsManager from './components/ResultsManager'
import HelpModal from './components/HelpModal'
import CalendarPage from './components/CalendarPage'
import ContentEditorFixed from './components/ContentEditorFixed'
import './App.css'

function App() {
  // États simples pour éviter les erreurs des hooks complexes
  const [selectedAI, setSelectedAI] = useState('gpt4')
  const [selectedTasks, setSelectedTasks] = useState(['rewrite'])
  const [selectedFormats, setSelectedFormats] = useState(['text'])
  const [showHelpModal, setShowHelpModal] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  const [projectData, setProjectData] = useState({
    projectTitle: '',
    targetAudience: '',
    tone: '',
    projectDescription: ''
  })

  const [content, setContent] = useState('')

  // Sauvegarde automatique simplifiée
  useEffect(() => {
    const autoSaveData = {
      projectTitle: projectData.projectTitle,
      targetAudience: projectData.targetAudience,
      tone: projectData.tone,
      projectDescription: projectData.projectDescription,
      contentInput: content,
      selectedAI: selectedAI,
      selectedTasks: selectedTasks,
      selectedFormats: selectedFormats,
      timestamp: new Date().toISOString()
    }
    localStorage.setItem('assistantRedacteur_autoSave', JSON.stringify(autoSaveData))
  }, [projectData, content, selectedAI, selectedTasks, selectedFormats])

  const handleProjectDataChange = (newData) => {
    setProjectData(newData)
  }

  const handleContentChange = (newContent) => {
    setContent(newContent)
  }

  const handleAISelect = (aiId) => {
    setSelectedAI(aiId)
  }

  const handleTaskToggle = (taskId) => {
    setSelectedTasks(prev =>
      prev.includes(taskId)
        ? prev.filter(id => id !== taskId)
        : [...prev, taskId]
    )
  }

  const handleFormatToggle = (formatId) => {
    setSelectedFormats(prev =>
      prev.includes(formatId)
        ? prev.filter(id => id !== formatId)
        : [...prev, formatId]
    )
  }

  const handleGenerate = async () => {
    if (!selectedAI) {
      setError('Veuillez sélectionner une IA')
      return
    }

    if (!content) {
      setError('Veuillez entrer du contenu à traiter')
      return
    }

    setIsLoading(true)
    setError(null)
    setResult(null)

    try {
      // Simulation d'appel API
      await new Promise(resolve => setTimeout(resolve, 2000))

      const generatedContent = `# Résultat généré par ${selectedAI.toUpperCase()}

## Projet: ${projectData.projectTitle || 'Sans titre'}

### Public cible: ${projectData.targetAudience || 'Non spécifié'}

### Description: ${projectData.projectDescription || 'Aucune description'}

---

## Contenu généré:

${content}

*Tâches appliquées: ${selectedTasks.join(', ')}*
*Format: ${selectedFormats.join(', ')}*

---

*Généré le ${new Date().toLocaleString('fr-FR')}*
*IA utilisée: ${selectedAI.toUpperCase()}*
      `.trim()

      setResult({
        success: true,
        content: generatedContent,
        timestamp: new Date().toISOString()
      })

    } catch (err) {
      console.error('Erreur lors de la génération:', err)
      setError('Erreur lors de la génération du contenu')
      setResult({
        success: false,
        error: 'Erreur technique lors de la génération',
        content: 'Impossible de générer le contenu demandé.'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopy = async () => {
    if (result?.content) {
      try {
        await navigator.clipboard.writeText(result.content)
        alert('Contenu copié avec succès!')
      } catch (err) {
        console.error('Erreur lors de la copie:', err)
        // Fallback pour les navigateurs qui ne supportent pas clipboard API
        const textArea = document.createElement('textarea')
        textArea.value = result.content
        document.body.appendChild(textArea)
        textArea.select()
        document.execCommand('copy')
        document.body.removeChild(textArea)
        alert('Contenu copié avec succès!')
      }
    }
  }

  const handleDownload = () => {
    if (result?.content) {
      const filename = `${projectData.projectTitle || 'contenu'}-${new Date().toISOString().split('T')[0]}.txt`
      const blob = new Blob([result.content], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }
  }

  const MainApp = () => (
    <div className="App">
      <MenuBar onHelp={() => setShowHelpModal(true)} />

      <div className="main-container">
        {/* Sections horizontales (2 premiers onglets) */}
        <div className="top-sections-horizontal">
          <ProjectInfo
            data={projectData}
            onDataChange={handleProjectDataChange}
          />

          <div className="right-sections">
            <AISelection
              selectedAI={selectedAI}
              onAISelect={handleAISelect}
            />
          </div>
        </div>

        <UploadArea
          content={content}
          onContentChange={handleContentChange}
        />

        <ProcessingTasks
          selectedTasks={selectedTasks}
          onTaskToggle={handleTaskToggle}
        />

        <OutputFormats
          selectedFormats={selectedFormats}
          onFormatToggle={handleFormatToggle}
        />

        {/* Bouton de génération AVANT la gestion des résultats */}
        <div className="generate-section">
          <button
            className={`generate-btn ${isLoading ? 'loading' : ''}`}
            onClick={handleGenerate}
            disabled={isLoading || !selectedAI || !content}
          >
            {isLoading ? (
              <>
                <div className="loader"></div>
                Génération en cours...
              </>
            ) : (
              <>
                <i className="fas fa-rocket"></i>
                Lancer la génération
              </>
            )}
          </button>
        </div>

        <ResultsManager
          result={result}
          onCopy={handleCopy}
          onDownload={handleDownload}
        />
      </div>

      {showHelpModal && (
        <HelpModal onClose={() => setShowHelpModal(false)} />
      )}

      {error && (
        <div className="alert alert-error">
          <i className="fas fa-exclamation-circle"></i>
          {error}
        </div>
      )}
    </div>
  )

  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainApp />} />
        {/* Routes simplifiées pour éviter les erreurs */}
        <Route path="/login" element={<Navigate to="/" />} />
        <Route path="/account" element={<Navigate to="/" />} />
        <Route path="/config-api" element={<Navigate to="/" />} />
        <Route path="/calendar" element={<CalendarPage />} />
        <Route path="/results" element={<Navigate to="/" />} />
        <Route path="/subscription" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  )
}

export default App