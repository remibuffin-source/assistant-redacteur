import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MenuBar from './MenuBar';
import './AdminPromptBuilder.css';
import './ConfigAPIPage.css'; // Pour utiliser les styles de la sidebar admin

const AdminPromptBuilder = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('tasks');

  return (
    <div className="page-container">
      <MenuBar onHelp={() => {}} />
      <div className="page-content" style={{paddingTop: '20px', paddingLeft: '5px', paddingRight: '30px'}}>
        <div className="admin-page-layout">
          {/* Sidebar de navigation */}
          <div className="admin-sidebar">
            <div className="admin-sidebar-header">
              <h2>⚙️ Administration</h2>
            </div>
            <nav className="admin-nav">
              <button 
                className="admin-nav-btn"
                onClick={() => navigate('/config-api')}
              >
                <i className="fas fa-key"></i>
                <span>Clés API</span>
              </button>
              <button 
                className="admin-nav-btn active"
                onClick={() => navigate('/admin-prompt-builder')}
              >
                <i className="fas fa-cogs"></i>
                <span>Prompt Builder</span>
              </button>
              <button 
                className="admin-nav-btn"
                onClick={() => navigate('/admin-pricing')}
              >
                <i className="fas fa-dollar-sign"></i>
                <span>Tarification</span>
              </button>
              <button 
                className="admin-nav-btn"
                onClick={() => navigate('/admin-credits')}
              >
                <i className="fas fa-credit-card"></i>
                <span>Souscriptions</span>
              </button>
            </nav>
          </div>

          {/* Contenu principal */}
          <div className="admin-main-content">
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
      </div>
    </div>
  );
};

export default AdminPromptBuilder;
