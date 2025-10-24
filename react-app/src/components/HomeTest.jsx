import { useState } from 'react'
import '../App.css'
import MenuBar from './MenuBar'
import ProjectInfoSimple from './ProjectInfoSimple'

export default function HomeTest() {
  const [projectData, setProjectData] = useState({
    projectTitle: '',
    targetAudience: '',
    tone: '',
    projectDescription: ''
  })

  return (
    <div className="App">
      <div style={{position: 'fixed', top: 0, left: 0, right: 0, background: 'blue', color: 'white', padding: '10px', zIndex: 9999}}>
        🔵 TEST: ProjectInfo chargé
      </div>
      <MenuBar onHelp={() => {}} />
      <div className="main-container">
        <div style={{marginTop: '60px'}}>
          <ProjectInfoSimple data={projectData} onDataChange={setProjectData} />
          <div style={{padding: '20px', background: 'white', color: 'black', marginTop: '20px'}}>
            <h2>Test ProjectInfo OK</h2>
            <p>Si vous voyez ce message, ProjectInfo fonctionne.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
