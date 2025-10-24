import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MenuBar from './MenuBar';
import './AdminPromptBuilder.css';

const AdminPromptBuilder = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('tasks');

  return (
    <div className="page-container">
      <MenuBar onHelp={() => {}} />
      <div className="page-content" style={{paddingTop: '20px', paddingLeft: '30px', paddingRight: '30px'}}>
        <div className="admin-prompt-builder">
          <div className="admin-header">
            <div className="header-left">
              <h1>
                <i className="fas fa-cogs"></i>
                Administration - Prompt Builder
              </h1>
              <p>Gérez les règles de génération de contenu IA</p>
            </div>
          </div>

          <div className="admin-tabs">
            <button className={`tab-btn ${activeTab === 'tasks' ? 'active' : ''}`} onClick={() => setActiveTab('tasks')}>
              <i className="fas fa-tasks"></i>
              Tâches (8)
            </button>
            <button className={`tab-btn ${activeTab === 'formats' ? 'active' : ''}`} onClick={() => setActiveTab('formats')}>
              <i className="fas fa-file-alt"></i>
              Formats (17)
            </button>
          </div>

          <div className="admin-content">
            <p>Interface d'administration en cours de développement...</p>
            <p>Consultez la documentation PHASE-5-ADMIN-PROMPT-BUILDER.md pour plus de détails.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPromptBuilder;
