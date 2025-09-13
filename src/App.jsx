import { useState, useEffect } from 'react'
import { useAssistantAutoSave } from './hooks/useLocalStorage'
import { useAIGeneration } from './hooks/useAIGeneration'
import { useTheme } from './hooks/useTheme'
import MenuBar from './components/MenuBar'
import ProjectInfo from './components/ProjectInfo'
import AISelection from './components/AISelection'
import MediaType from './components/MediaType'
import UploadArea from './components/UploadArea'
import ProcessingTasks from './components/ProcessingTasks'
import OutputFormats from './components/OutputFormats'
import AdvancedOptions from './components/AdvancedOptions'
import ResultsManager from './components/ResultsManager'
import AdminPanel from './components/AdminPanel'
import HelpModal from './components/HelpModal'
import RecordingStatus from './components/RecordingStatus'
import DictationStatus from './components/DictationStatus'
import './App.css'

function App() {
  const { autoSaveData, updateAutoSave } = useAssistantAutoSave()
  const { currentTheme } = useTheme()
  const {
    isLoading,
    result,
    error,
    generateContent,
    copyToClipboard,
    downloadResult
  } = useAIGeneration()

  const [selectedAI, setSelectedAI] = useState(autoSaveData.selectedAI || null)
  const [selectedMedia, setSelectedMedia] = useState(autoSaveData.selectedMedia || null)
  const [selectedTasks, setSelectedTasks] = useState(autoSaveData.selectedTasks || [])
  const [selectedFormats, setSelectedFormats] = useState(autoSaveData.selectedFormats || [])
  const [showHelpModal, setShowHelpModal] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [isDictating, setIsDictating] = useState(false)

  const [projectData, setProjectData] = useState({
    projectTitle: autoSaveData.projectTitle || '',
    targetAudience: autoSaveData.targetAudience || '',
    keywords: autoSaveData.keywords || '',
    tone: autoSaveData.tone || '',
    projectDescription: autoSaveData.projectDescription || ''
  })

  const [content, setContent] = useState(autoSaveData.contentInput || '')
  const [advancedOptions, setAdvancedOptions] = useState({
    style: autoSaveData.style || 'professionnel',
    length: autoSaveData.length || 3,
    creativity: autoSaveData.creativity || 3,
    adaptation: autoSaveData.adaptation || 'web'
  })

  // Sauvegarde automatique des données
  useEffect(() => {
    updateAutoSave({
      projectTitle: projectData.projectTitle,
      targetAudience: projectData.targetAudience,
      keywords: projectData.keywords,
      tone: projectData.tone,
      projectDescription: projectData.projectDescription,
      contentInput: content,
      selectedAI: selectedAI,
      selectedMedia: selectedMedia,
      selectedTasks: selectedTasks,
      selectedFormats: selectedFormats,
      style: advancedOptions.style,
      length: advancedOptions.length,
      creativity: advancedOptions.creativity,
      adaptation: advancedOptions.adaptation
    })
  }, [projectData, content, selectedAI, selectedMedia, selectedTasks, selectedFormats, advancedOptions, updateAutoSave])

  const handleProjectDataChange = (newData) => {
    setProjectData(newData)
  }

  const handleContentChange = (newContent) => {
    setContent(newContent)
  }

  const handleAISelect = (aiId) => {
    setSelectedAI(aiId)
  }

  const handleMediaSelect = (mediaType) => {
    setSelectedMedia(mediaType)
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

  const handleAdvancedOptionsChange = (newOptions) => {
    setAdvancedOptions(newOptions)
  }

  const handleGenerate = async () => {
    await generateContent(selectedAI, {
      title: projectData.projectTitle,
      audience: projectData.targetAudience,
      keywords: projectData.keywords,
      tone: projectData.tone,
      description: projectData.projectDescription,
      content: content,
      media: selectedMedia,
      tasks: selectedTasks,
      format: selectedFormats[0],
      style: advancedOptions.style,
      length: advancedOptions.length,
      creativity: advancedOptions.creativity,
      adaptation: advancedOptions.adaptation
    })
  }

  const handleCopy = async () => {
    if (result?.content) {
      const success = await copyToClipboard(result.content)
      if (success) {
        console.log('Contenu copié avec succès!')
      }
    }
  }

  const handleDownload = () => {
    if (result?.content) {
      const filename = `${projectData.projectTitle || 'contenu'}-${new Date().toISOString().split('T')[0]}.txt`
      downloadResult(result.content, filename)
    }
  }

  const handleRecordingToggle = () => {
    setIsRecording(!isRecording)
  }

  const handleDictationToggle = () => {
    setIsDictating(!isDictating)
  }

  return (
    <div className="App" data-theme={currentTheme}>
      <MenuBar onHelp={() => setShowHelpModal(true)} />
      
      <div className="main-container">
        {/* Sections horizontales (3 premiers onglets) */}
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

            <MediaType 
              selectedMedia={selectedMedia}
              onMediaSelect={handleMediaSelect}
            />
          </div>
        </div>

        <UploadArea 
          content={content}
          onContentChange={handleContentChange}
          onRecordingToggle={handleRecordingToggle}
          onDictationToggle={handleDictationToggle}
        />

        <ProcessingTasks 
          selectedTasks={selectedTasks}
          onTaskToggle={handleTaskToggle}
        />

        <OutputFormats 
          selectedFormats={selectedFormats}
          onFormatToggle={handleFormatToggle}
        />

        <AdvancedOptions 
          options={advancedOptions}
          onOptionsChange={handleAdvancedOptionsChange}
        />

        <ResultsManager 
          result={result}
          onCopy={handleCopy}
          onDownload={handleDownload}
        />

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
              <i className="fas fa-magic"></i>
              Générer le contenu
            </>
          )}
        </button>
      </div>

      <AdminPanel />
      
      {showHelpModal && (
        <HelpModal onClose={() => setShowHelpModal(false)} />
      )}

      {isRecording && (
        <RecordingStatus onStop={handleRecordingToggle} />
      )}

      {isDictating && (
        <DictationStatus onStop={handleDictationToggle} />
      )}

      {error && (
        <div className="alert alert-error">
          <i className="fas fa-exclamation-circle"></i>
          {error}
        </div>
      )}
    </div>
  )
}

export default App
