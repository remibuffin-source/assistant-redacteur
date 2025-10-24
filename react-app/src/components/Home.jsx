import { useState, useEffect } from 'react'
import '../App.css'
import MenuBar from './MenuBar'
import ProjectInfo from './ProjectInfo'
import AISelection from './AISelection'
import UploadArea from './UploadArea'
import ProcessingTasks from './ProcessingTasks'
import OutputFormats from './OutputFormats'
import ResultsManager from './ResultsManager'
import HelpModal from './HelpModal'
import { useAssistantAutoSave } from '../hooks/useLocalStorage'
import { getHomeText } from '../i18n/homeTranslations'

export default function Home() {
  const { autoSaveData } = useAssistantAutoSave();
  const userLanguage = autoSaveData.language || 'fr';
  const t = (path) => getHomeText(userLanguage, path);
  
  const [projectData, setProjectData] = useState({
    projectTitle: '',
    targetAudience: '',
    tone: '',
    projectDescription: ''
  })
  const [selectedAI, setSelectedAI] = useState('gpt4')
  const [content, setContent] = useState('')
  const [selectedTasks, setSelectedTasks] = useState(['rewrite'])
  const [selectedFormats, setSelectedFormats] = useState(['text'])
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [showHelpModal, setShowHelpModal] = useState(false)

  // Layout edit mode for Home
  const [isEditingLayout, setIsEditingLayout] = useState(false)
  const [layoutItems, setLayoutItems] = useState(() => {
    try {
      const raw = localStorage.getItem('home_layout_positions')
      return raw ? JSON.parse(raw) : {
        project: { x: 20, y: 20, w: 520, h: 220 },
        ai: { x: 560, y: 20, w: 360, h: 220 },
        upload: { x: 20, y: 260, w: 900, h: 240 },
        tasks: { x: 20, y: 520, w: 440, h: 220 },
        formats: { x: 480, y: 520, w: 440, h: 220 },
        generate: { x: 20, y: 760, w: 300, h: 120 },
        results: { x: 340, y: 760, w: 580, h: 220 },
      }
    } catch {
      return {
        project: { x: 20, y: 20, w: 520, h: 220 },
        ai: { x: 560, y: 20, w: 360, h: 220 },
        upload: { x: 20, y: 260, w: 900, h: 240 },
        tasks: { x: 20, y: 520, w: 440, h: 220 },
        formats: { x: 480, y: 520, w: 440, h: 220 },
        generate: { x: 20, y: 760, w: 300, h: 120 },
        results: { x: 340, y: 760, w: 580, h: 220 },
      }
    }
  })

  useEffect(() => {
    try { localStorage.setItem('home_layout_positions', JSON.stringify(layoutItems)) } catch {}
  }, [layoutItems])

  useEffect(() => {
    if (!isEditingLayout) return
    const onMouseMove = (e) => {
      const drag = window.__homeDragging
      const resize = window.__homeResizing
      const canvas = document.getElementById('homeLayoutCanvas')
      if (!canvas) return
      const rect = canvas.getBoundingClientRect()
      if (drag) {
        const { key, offsetX, offsetY } = drag
        const x = Math.max(0, Math.min(e.clientX - rect.left - offsetX, rect.width - 40))
        const y = Math.max(0, Math.min(e.clientY - rect.top - offsetY, rect.height - 40))
        setLayoutItems(prev => ({ ...prev, [key]: { ...prev[key], x, y } }))
      } else if (resize) {
        const { key, startX, startY, startW, startH } = resize
        const w = Math.max(240, Math.min(startW + (e.clientX - startX), rect.width))
        const h = Math.max(140, Math.min(startH + (e.clientY - startY), rect.height))
        setLayoutItems(prev => ({ ...prev, [key]: { ...prev[key], w, h } }))
      }
    }
    const onMouseUp = () => { window.__homeDragging = null; window.__homeResizing = null }
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
    }
  }, [isEditingLayout])

  const startDrag = (key, e) => {
    if (!isEditingLayout) return
    const rect = e.currentTarget.getBoundingClientRect()
    window.__homeDragging = { key, offsetX: e.clientX - rect.left, offsetY: e.clientY - rect.top }
  }

  const startResize = (key, e) => {
    if (!isEditingLayout) return
    e.stopPropagation()
    window.__homeResizing = { key, startX: e.clientX, startY: e.clientY, startW: layoutItems[key].w, startH: layoutItems[key].h }
  }

  const resetLayout = () => {
    setLayoutItems({
      project: { x: 20, y: 20, w: 520, h: 220 },
      ai: { x: 560, y: 20, w: 360, h: 220 },
      upload: { x: 20, y: 260, w: 900, h: 240 },
      tasks: { x: 20, y: 520, w: 440, h: 220 },
      formats: { x: 480, y: 520, w: 440, h: 220 },
      generate: { x: 20, y: 760, w: 300, h: 120 },
      results: { x: 340, y: 760, w: 580, h: 220 },
    })
  }

  const handleTaskToggle = (taskId) => {
    setSelectedTasks(prev => prev.includes(taskId) ? prev.filter(id => id !== taskId) : [...prev, taskId])
  }

  const handleFormatToggle = (formatId) => {
    setSelectedFormats(prev => prev.includes(formatId) ? prev.filter(id => id !== formatId) : [...prev, formatId])
  }

  const handleGenerate = async () => {
    setIsLoading(true)
    setResult(null)
    await new Promise(r => setTimeout(r, 600))
    setResult({ success: true, content: `Exemple de contenu généré.\nAI: ${selectedAI}\nTasks: ${selectedTasks.join(', ')}\nFormats: ${selectedFormats.join(', ')}` })
    setIsLoading(false)
  }

  const handleCopy = async () => {
    if (result?.content) {
      try { await navigator.clipboard.writeText(result.content) } catch {}
    }
  }

  const handleDownload = () => {
    if (!result?.content) return
    const filename = `${projectData.projectTitle || 'contenu'}-debug.txt`
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

  return (
    <div className="App">
      <MenuBar onHelp={() => setShowHelpModal(true)} />
      <div className="main-container">
        {/* Layout controls */}
        <div className="home-layout-controls">
          <label className="toggle-edit"><input type="checkbox" checked={isEditingLayout} onChange={(e)=>setIsEditingLayout(e.target.checked)} /> Mode layout</label>
          {isEditingLayout && (<button className="btn-reset" onClick={resetLayout}><i className="fas fa-undo"></i> Réinitialiser</button>)}
        </div>

        {isEditingLayout ? (
          <div className="home-layout-canvas" id="homeLayoutCanvas">
            <div className="home-layout-box" onMouseDown={(e)=>startDrag('project', e)} style={{left: layoutItems.project.x, top: layoutItems.project.y, width: layoutItems.project.w, height: layoutItems.project.h}}>
              <div className="box-header"><span className="box-title">PROJECT</span></div>
              <div className="box-body"><ProjectInfo data={projectData} onDataChange={setProjectData} /></div>
              <div className="resize-handle" onMouseDown={(e)=>startResize('project', e)} />
            </div>

            <div className="home-layout-box" onMouseDown={(e)=>startDrag('ai', e)} style={{left: layoutItems.ai.x, top: layoutItems.ai.y, width: layoutItems.ai.w, height: layoutItems.ai.h}}>
              <div className="box-header"><span className="box-title">AI</span></div>
              <div className="box-body"><AISelection selectedAI={selectedAI} onAISelect={setSelectedAI} /></div>
              <div className="resize-handle" onMouseDown={(e)=>startResize('ai', e)} />
            </div>

            <div className="home-layout-box" onMouseDown={(e)=>startDrag('upload', e)} style={{left: layoutItems.upload.x, top: layoutItems.upload.y, width: layoutItems.upload.w, height: layoutItems.upload.h}}>
              <div className="box-header"><span className="box-title">UPLOAD</span></div>
              <div className="box-body"><UploadArea content={content} onContentChange={setContent} /></div>
              <div className="resize-handle" onMouseDown={(e)=>startResize('upload', e)} />
            </div>

            <div className="home-layout-box" onMouseDown={(e)=>startDrag('tasks', e)} style={{left: layoutItems.tasks.x, top: layoutItems.tasks.y, width: layoutItems.tasks.w, height: layoutItems.tasks.h}}>
              <div className="box-header"><span className="box-title">TASKS</span></div>
              <div className="box-body"><ProcessingTasks selectedTasks={selectedTasks} onTaskToggle={handleTaskToggle} /></div>
              <div className="resize-handle" onMouseDown={(e)=>startResize('tasks', e)} />
            </div>

            <div className="home-layout-box" onMouseDown={(e)=>startDrag('formats', e)} style={{left: layoutItems.formats.x, top: layoutItems.formats.y, width: layoutItems.formats.w, height: layoutItems.formats.h}}>
              <div className="box-header"><span className="box-title">FORMATS</span></div>
              <div className="box-body"><OutputFormats selectedFormats={selectedFormats} onFormatToggle={handleFormatToggle} /></div>
              <div className="resize-handle" onMouseDown={(e)=>startResize('formats', e)} />
            </div>

            <div className="home-layout-box" onMouseDown={(e)=>startDrag('generate', e)} style={{left: layoutItems.generate.x, top: layoutItems.generate.y, width: layoutItems.generate.w, height: layoutItems.generate.h}}>
              <div className="box-header"><span className="box-title">GENERATE</span></div>
              <div className="box-body">
                <div className="generate-section">
                  <button className={`generate-btn ${isLoading ? 'loading' : ''}`} onClick={handleGenerate} disabled={isLoading || !selectedAI || !content}>
                    {isLoading ? (<><div className="loader"></div>{t('sections.generateButton.generating')}</>) : (<><i className="fas fa-rocket"></i> {t('sections.generateButton.generate')}</>)}
                  </button>
                </div>
              </div>
              <div className="resize-handle" onMouseDown={(e)=>startResize('generate', e)} />
            </div>

            <div className="home-layout-box" onMouseDown={(e)=>startDrag('results', e)} style={{left: layoutItems.results.x, top: layoutItems.results.y, width: layoutItems.results.w, height: layoutItems.results.h}}>
              <div className="box-header"><span className="box-title">RESULTS</span></div>
              <div className="box-body"><ResultsManager result={result} onCopy={handleCopy} onDownload={handleDownload} /></div>
              <div className="resize-handle" onMouseDown={(e)=>startResize('results', e)} />
            </div>
          </div>
        ) : (
          <>
            <ProjectInfo data={projectData} onDataChange={setProjectData} />
            <AISelection selectedAI={selectedAI} onAISelect={setSelectedAI} />
            <UploadArea content={content} onContentChange={setContent} />
            <ProcessingTasks selectedTasks={selectedTasks} onTaskToggle={handleTaskToggle} />
            <OutputFormats selectedFormats={selectedFormats} onFormatToggle={handleFormatToggle} />
            <div className="generate-section">
              <button className={`generate-btn ${isLoading ? 'loading' : ''}`} onClick={handleGenerate} disabled={isLoading || !selectedAI || !content}>
                {isLoading ? (<><div className="loader"></div>{t('sections.generateButton.generating')}</>) : (<><i className="fas fa-rocket"></i> {t('sections.generateButton.generate')}</>)}
              </button>
            </div>
            <ResultsManager result={result} onCopy={handleCopy} onDownload={handleDownload} />
          </>
        )}
      </div>

      {showHelpModal && (
        <HelpModal onClose={() => setShowHelpModal(false)} />
      )}
    </div>
  )
}
