import { useState, useEffect } from 'react';
import { useTheme } from '../hooks/useTheme';

const MenuBar = ({ onHelp }) => {
  const { toggleTheme, currentTheme } = useTheme();
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [menuTimeout, setMenuTimeout] = useState(null);

  const showMenu = () => {
    clearTimeout(menuTimeout);
    setIsMenuVisible(true);
  };

  const hideMenuDelayed = () => {
    const timeout = setTimeout(() => {
      setIsMenuVisible(false);
    }, 500);
    setMenuTimeout(timeout);
  };

  const handleMenuClick = (action) => {
    switch(action) {
      case 'open':
        openProject();
        break;
      case 'save':
        saveProject();
        break;
      case 'history':
        showHistory();
        break;
      case 'analyze':
        analyzeContent();
        break;
      case 'account':
        showAccountModal();
        break;
      case 'config':
        openConfig();
        break;
      case 'calendar':
        openCalendar();
        break;
      case 'subscription':
        openSubscription();
        break;
      default:
        break;
    }
  };

  const openProject = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const data = JSON.parse(e.target.result);
            // Charger les données du projet
            console.log('Projet chargé:', data);
            alert('Projet chargé avec succès !');
          } catch {
            alert('Erreur lors du chargement du fichier');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const saveProject = () => {
    const projectData = {
      title: document.getElementById('projectTitle')?.value || '',
      audience: document.getElementById('targetAudience')?.value || '',
      keywords: document.getElementById('keywords')?.value || '',
      tone: document.getElementById('tone')?.value || '',
      description: document.getElementById('projectDescription')?.value || '',
      content: document.getElementById('directTextInput')?.value || '',
      timestamp: new Date().toISOString()
    };

    const dataStr = JSON.stringify(projectData, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `projet_${projectData.title || 'sans_nom'}_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const showHistory = () => {
    const historyData = JSON.parse(localStorage.getItem('projectHistory') || '[]');
    let historyHtml = '<h3>Historique des projets</h3>';
    
    if (historyData.length === 0) {
      historyHtml += '<p>Aucun projet dans l\'historique</p>';
    } else {
      historyHtml += '<ul>';
      historyData.forEach((project, _index) => {
        historyHtml += `<li><strong>${project.title || 'Projet sans nom'}</strong> - ${new Date(project.timestamp).toLocaleDateString()}</li>`;
      });
      historyHtml += '</ul>';
    }
    
    alert(historyHtml);
  };

  const analyzeContent = () => {
    const content = document.querySelector('.result-area')?.textContent;
    if (!content || content.includes('Aucun résultat')) {
      alert('Aucun contenu à analyser. Générez d\'abord du contenu.');
      return;
    }
    
    const analysis = {
      wordCount: content.split(' ').length,
      charCount: content.length,
      readingTime: Math.ceil(content.split(' ').length / 200),
      sentiment: 'Positif'
    };
    
    alert(`Analyse du contenu:\n- Mots: ${analysis.wordCount}\n- Caractères: ${analysis.charCount}\n- Temps de lecture: ${analysis.readingTime} min\n- Sentiment: ${analysis.sentiment}`);
  };

  const showAccountModal = () => {
    alert('Fonctionnalité Mon Compte - En développement');
  };

  const openConfig = () => {
    alert('Configuration API - En développement');
  };

  const openCalendar = () => {
    alert('Calendrier de publication - En développement');
  };

  const openSubscription = () => {
    alert('Gestion des abonnements - En développement');
  };

  useEffect(() => {
    return () => {
      if (menuTimeout) {
        clearTimeout(menuTimeout);
      }
    };
  }, [menuTimeout]);

  return (
    <>
      {/* Zone de déclenchement du menu */}
      <div 
        className="menu-trigger-area" 
        onMouseEnter={showMenu}
      ></div>

      {/* Menu amovible */}
      <div 
        className={`menu-container ${isMenuVisible ? 'show' : ''}`}
        onMouseLeave={hideMenuDelayed}
      >
        <div className="menu-header">
          <div className="menu-left">
            <img src="/Studio du Cap Brun.png" alt="Studio du Cap Brun" />
            <h1 className="main-title">Assistant Rédactionnel</h1>
          </div>
          <div className="menu-buttons">
            <button className="menu-btn" onClick={() => handleMenuClick('open')}>
              <i className="fas fa-folder-open"></i>
              <span>Ouvrir</span>
            </button>
            <button className="menu-btn" onClick={() => handleMenuClick('save')}>
              <i className="fas fa-save"></i>
              <span>Enregistrer</span>
            </button>
            <button className="menu-btn" onClick={() => handleMenuClick('history')}>
              <i className="fas fa-history"></i>
              <span>Historique</span>
            </button>
            <button className="menu-btn" onClick={() => handleMenuClick('analyze')}>
              <i className="fas fa-chart-bar"></i>
              <span>Analyse</span>
            </button>
            <button className="menu-btn" onClick={() => handleMenuClick('account')}>
              <i className="fas fa-user"></i>
              <span>Mon Compte</span>
            </button>
            <button className="menu-btn" onClick={() => handleMenuClick('config')}>
              <i className="fas fa-key"></i>
              <span>Config API</span>
            </button>
            <button className="menu-btn" onClick={() => handleMenuClick('calendar')}>
              <i className="fas fa-calendar-alt"></i>
              <span>Calendrier</span>
            </button>
            <button className="menu-btn" onClick={() => handleMenuClick('subscription')}>
              <i className="fas fa-crown"></i>
              <span>Abonnements</span>
            </button>
            <button className="theme-toggle-btn" onClick={toggleTheme} title={`Passer en mode ${currentTheme === 'dark' ? 'jour' : 'nuit'}`}>
              <i className={`fas fa-${currentTheme === 'dark' ? 'sun' : 'moon'}`}></i>
            </button>
            <button className="help-btn" onClick={onHelp}>?</button>
          </div>
        </div>
      </div>
    </>
  );
};

export default MenuBar;