import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAssistantAutoSave } from '../hooks/useLocalStorage';
import MenuBar from './MenuBar';
import ContentLibrary from './ContentLibrary';
import ContentEditorFixed from './ContentEditorFixed';
import './CalendarPage.css';

const CalendarPage = () => {
  const navigate = useNavigate();
  const { autoSaveData } = useAssistantAutoSave();

  // États pour les filtres
  const [platformFilter, setPlatformFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [tagFilter, setTagFilter] = useState('all');
  const [selectedPlatforms, setSelectedPlatforms] = useState([]);
  const [showPostModal, setShowPostModal] = useState(false);
  const [showLibraryModal, setShowLibraryModal] = useState(false);
  const [showEditorModal, setShowEditorModal] = useState(false);

  // États pour la vue calendrier
  const [activeView, setActiveView] = useState('calendar');
  const [calendarType, setCalendarType] = useState('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [scheduledPosts, setScheduledPosts] = useState([]);

  // États pour la création/modification de post
  const [postForm, setPostForm] = useState(() => {
    const defaultForm = {
      title: '',
      content: '',
      platforms: [],
      scheduledDate: new Date().toISOString().split('T')[0],
      scheduledTime: '09:00',
      tags: '',
      status: 'draft'
    };
    return defaultForm;
  });

  // S'assurer que postForm a toujours des valeurs définies
  const safePostForm = React.useMemo(() => {
    if (!postForm || typeof postForm !== 'object') {
      return {
        title: '',
        content: '',
        platforms: [],
        scheduledDate: new Date().toISOString().split('T')[0],
        scheduledTime: '09:00',
        tags: '',
        status: 'draft'
      };
    }

    return {
      title: postForm.title || '',
      content: postForm.content || '',
      platforms: Array.isArray(postForm.platforms) ? postForm.platforms : [],
      scheduledDate: postForm.scheduledDate || new Date().toISOString().split('T')[0],
      scheduledTime: postForm.scheduledTime || '09:00',
      tags: postForm.tags || '',
      status: postForm.status || 'draft'
    };
  }, [postForm]);

  // États pour la sélection de contenu
  const [selectedPost, setSelectedPost] = useState(null);
  const [selectedContent, setSelectedContent] = useState(null);

  // Plateformes disponibles
  const platforms = [
    { id: 'facebook', name: 'Facebook', icon: 'fab fa-facebook', color: '#1877f2' },
    { id: 'instagram', name: 'Instagram', icon: 'fab fa-instagram', color: '#e1306c' },
    { id: 'twitter', name: 'X', icon: 'fab fa-twitter', color: '#1da1f2' },
    { id: 'linkedin', name: 'LinkedIn', icon: 'fab fa-linkedin', color: '#0a66c2' },
    { id: 'youtube', name: 'YouTube', icon: 'fab fa-youtube', color: '#ff0000' },
    { id: 'tiktok', name: 'TikTok', icon: 'fab fa-tiktok', color: '#000000' },
    { id: 'blog', name: 'Mon Blog', icon: 'fas fa-blog', color: '#ff6b35' },
    { id: 'website', name: 'Mon Site', icon: 'fas fa-globe', color: '#28a745' }
  ];

  // Labels de statut
  const statusLabels = {
    draft: 'Brouillon',
    pending: 'En attente',
    validated: 'Validé',
    published: 'Publié',
    failed: 'Échec'
  };

  // Couleurs de statut
  const statusColors = {
    draft: '#6c757d',
    pending: '#ffc107',
    validated: '#28a745',
    published: '#007bff',
    failed: '#dc3545'
  };

  // Effets
  useEffect(() => {
    // Charger les posts programmés depuis le stockage local
    const savedPosts = localStorage.getItem('scheduledPosts');
    if (savedPosts) {
      setScheduledPosts(JSON.parse(savedPosts));
    }
  }, []);

  // Fonction pour basculer la sélection d'une plateforme
  const togglePlatformFilter = (platformId) => {
    setSelectedPlatforms(prev => {
      if (prev.includes(platformId)) {
        return prev.filter(id => id !== platformId);
      } else {
        return [...prev, platformId];
      }
    });
  };

  // Fonction pour obtenir les posts filtrés
  const getFilteredPosts = () => {
    let filtered = scheduledPosts;

    // Filtre par plateforme
    if (selectedPlatforms.length > 0) {
      filtered = filtered.filter(post =>
        post.platforms && post.platforms.some(platformId => selectedPlatforms.includes(platformId))
      );
    }

    // Filtre par statut
    if (statusFilter !== 'all') {
      filtered = filtered.filter(post => post.status === statusFilter);
    }

    return filtered;
  };

  // Fonction pour obtenir les posts d'une date spécifique
  const getPostsForDate = (dateStr) => {
    return getFilteredPosts().filter(post => post.scheduledDate === dateStr);
  };

  // Fonction pour gérer la sélection depuis la bibliothèque
  const handleSelectFromLibrary = (content) => {
    setSelectedContent(content);
    setActiveView('create');
  };

  // Fonction pour gérer la création d'un nouveau post
  const handleNewPost = () => {
    setSelectedPost(null);
    setShowPostModal(true);
  };

  // Fonction pour gérer le clic sur un post
  const handlePostClick = (post) => {
    setSelectedPost(post);
    setShowPostModal(true);
  };

  // Fonction pour gérer la sauvegarde d'un post
  const handleSavePost = () => {
    const newPost = {
      id: Date.now().toString(),
      ...safePostForm,
      createdAt: new Date().toISOString()
    };

    if (selectedPost) {
      // Modification d'un post existant
      setScheduledPosts(prev => prev.map(post =>
        post.id === selectedPost.id ? { ...post, ...safePostForm } : post
      ));
    } else {
      // Nouveau post
      setScheduledPosts(prev => [...prev, newPost]);
    }

    setShowPostModal(false);
    setSelectedPost(null);

    // Sauvegarder dans le stockage local
    localStorage.setItem('scheduledPosts', JSON.stringify(scheduledPosts));
  };

  // Fonction pour gérer la validation d'un post
  const handleValidatePost = (postId) => {
    setScheduledPosts(prev => prev.map(post =>
      post.id === postId ? { ...post, status: 'validated' } : post
    ));
    localStorage.setItem('scheduledPosts', JSON.stringify(scheduledPosts));
  };

  // Fonction pour gérer la suppression d'un post
  const handleDeletePost = (postId) => {
    setScheduledPosts(prev => prev.filter(post => post.id !== postId));
    localStorage.setItem('scheduledPosts', JSON.stringify(scheduledPosts));
  };

  // Fonction pour obtenir les compteurs de publication
  const getPublicationCounts = () => {
    const counts = {
      total: scheduledPosts.length,
      validated: scheduledPosts.filter(p => p.status === 'validated').length,
      pending: scheduledPosts.filter(p => p.status === 'pending').length,
      draft: scheduledPosts.filter(p => p.status === 'draft').length
    };
    return counts;
  };

  // Fonction pour obtenir les jours dans un mois
  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  // Fonction pour obtenir le premier jour du mois (lundi = 0)
  const getFirstDayOfMonth = (date) => {
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    return firstDay === 0 ? 6 : firstDay - 1; // Convertir dimanche (0) en samedi (6)
  };

  // Fonction pour rendre la vue calendrier
  const renderCalendarView = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];

    // Ajouter les jours du mois précédent
    const prevMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 0);
    const prevMonthDays = prevMonth.getDate();

    for (let i = firstDay - 1; i >= 0; i--) {
      const day = prevMonthDays - i;
      const dateStr = `${prevMonth.getFullYear()}-${String(prevMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const postsForDay = getPostsForDate(dateStr);

      days.push(
        <div key={`prev-${day}`} className="calendar-day-google prev-month">
          <div className="day-number-google">{day}</div>
          <div className="day-posts-google">
            {postsForDay.slice(0, 2).map(post => (
              <div
                key={post.id}
                className="post-card-google"
                onClick={(e) => {
                  e.stopPropagation();
                  handlePostClick(post);
                }}
                title={`${post.title || 'Sans titre'} - ${post.scheduledTime || '09:00'}`}
              >
                {/* Image de prévisualisation ou placeholder */}
                {post.image ? (
                  <div className="post-image-google">
                    <img src={post.image} alt="Post preview" />
                  </div>
                ) : (
                  <div className="post-image-placeholder">
                    <i className="fas fa-image"></i>
                  </div>
                )}
                
                {/* Logos des plateformes en overlay */}
                <div className="post-platforms-google">
                  {Array.isArray(post.platforms) ? post.platforms.slice(0, 3).map(platformId => {
                    const platform = platforms.find(p => p.id === platformId);
                    return platform ? (
                      <div key={platformId} className="platform-logo-small" style={{ backgroundColor: platform.color }}>
                        <i className={platform.icon}></i>
                      </div>
                    ) : null;
                  }) : null}
                  {post.platforms?.length > 3 && (
                    <div className="platform-more">+{post.platforms.length - 3}</div>
                  )}
                </div>
                
                {/* Informations du post */}
                <div className="post-info-google">
                  <span className="post-time-google">{post.scheduledTime || '09:00'}</span>
                  <h5 className="post-title-google">{post.title || 'Sans titre'}</h5>
                </div>
              </div>
            ))}
            {postsForDay.length > 2 && (
              <div className="post-more-google">+{postsForDay.length - 2}</div>
            )}
          </div>
        </div>
      );
    }

    // Ajouter les jours du mois courant
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const postsForDay = getPostsForDate(dateStr);
      const isToday = new Date().toDateString() === new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString();

      days.push(
        <div key={day} className={`calendar-day-google current-month ${isToday ? 'today' : ''}`}>
          <div className="day-number-google">{day}</div>
          <div className="day-posts-google">
            {postsForDay.slice(0, 2).map(post => (
              <div
                key={post.id}
                className="post-card-google"
                onClick={(e) => {
                  e.stopPropagation();
                  handlePostClick(post);
                }}
                title={`${post.title || 'Sans titre'} - ${post.scheduledTime || '09:00'}`}
              >
                {/* Image de prévisualisation ou placeholder */}
                {post.image ? (
                  <div className="post-image-google">
                    <img src={post.image} alt="Post preview" />
                  </div>
                ) : (
                  <div className="post-image-placeholder">
                    <i className="fas fa-image"></i>
                  </div>
                )}
                
                {/* Logos des plateformes en overlay */}
                <div className="post-platforms-google">
                  {Array.isArray(post.platforms) ? post.platforms.slice(0, 3).map(platformId => {
                    const platform = platforms.find(p => p.id === platformId);
                    return platform ? (
                      <div key={platformId} className="platform-logo-small" style={{ backgroundColor: platform.color }}>
                        <i className={platform.icon}></i>
                      </div>
                    ) : null;
                  }) : null}
                  {post.platforms?.length > 3 && (
                    <div className="platform-more">+{post.platforms.length - 3}</div>
                  )}
                </div>
                
                {/* Informations du post */}
                <div className="post-info-google">
                  <span className="post-time-google">{post.scheduledTime || '09:00'}</span>
                  <h5 className="post-title-google">{post.title || 'Sans titre'}</h5>
                </div>
              </div>
            ))}
            {postsForDay.length > 2 && (
              <div className="post-more-google">+{postsForDay.length - 2}</div>
            )}
          </div>
        </div>
      );
    }

    // Compléter avec les jours du mois suivant pour avoir 42 cases (6 semaines)
    const totalCells = 42;
    const remainingCells = totalCells - days.length;
    const nextMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);

    for (let day = 1; day <= remainingCells; day++) {
      const dateStr = `${nextMonth.getFullYear()}-${String(nextMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const postsForDay = getPostsForDate(dateStr);

      days.push(
        <div key={`next-${day}`} className="calendar-day-google next-month">
          <div className="day-number-google">{day}</div>
          <div className="day-posts-google">
            {postsForDay.slice(0, 2).map(post => (
              <div
                key={post.id}
                className="post-card-google"
                onClick={(e) => {
                  e.stopPropagation();
                  handlePostClick(post);
                }}
                title={`${post.title || 'Sans titre'} - ${post.scheduledTime || '09:00'}`}
              >
                {/* Image de prévisualisation ou placeholder */}
                {post.image ? (
                  <div className="post-image-google">
                    <img src={post.image} alt="Post preview" />
                  </div>
                ) : (
                  <div className="post-image-placeholder">
                    <i className="fas fa-image"></i>
                  </div>
                )}
                
                {/* Logos des plateformes en overlay */}
                <div className="post-platforms-google">
                  {Array.isArray(post.platforms) ? post.platforms.slice(0, 3).map(platformId => {
                    const platform = platforms.find(p => p.id === platformId);
                    return platform ? (
                      <div key={platformId} className="platform-logo-small" style={{ backgroundColor: platform.color }}>
                        <i className={platform.icon}></i>
                      </div>
                    ) : null;
                  }) : null}
                  {post.platforms?.length > 3 && (
                    <div className="platform-more">+{post.platforms.length - 3}</div>
                  )}
                </div>
                
                {/* Informations du post */}
                <div className="post-info-google">
                  <span className="post-time-google">{post.scheduledTime || '09:00'}</span>
                  <h5 className="post-title-google">{post.title || 'Sans titre'}</h5>
                </div>
              </div>
            ))}
            {postsForDay.length > 2 && (
              <div className="post-more-google">+{postsForDay.length - 2}</div>
            )}
          </div>
        </div>
      );
    }

    return <div className="calendar-grid-google-style">{days}</div>;
  };

  // Rendu des statistiques
  const renderStats = () => {
    const posts = getFilteredPosts();
    const stats = {
      total: posts.length,
      published: posts.filter(p => p.status === 'published').length,
      pending: posts.filter(p => p.status === 'pending').length,
      validated: posts.filter(p => p.status === 'validated').length
    };

    return (
      <div className="calendar-stats">
        <div className="stat-card">
          <div className="stat-icon">
            <i className="fas fa-calendar"></i>
          </div>
          <div className="stat-content">
            <h4>{stats.total}</h4>
            <p>Publications</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <i className="fas fa-check-circle"></i>
          </div>
          <div className="stat-content">
            <h4>{stats.validated}</h4>
            <p>Validées</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <i className="fas fa-clock"></i>
          </div>
          <div className="stat-content">
            <h4>{stats.pending}</h4>
            <p>En attente</p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="page-container">
      <MenuBar onHelp={() => {}} />
      <div className="page-content">
        <div className="calendar-page-restructured">
          {/* Header simple avec titre en haut de page */}
          <div className="calendar-header-simple">
            <div className="header-title-line">
              <h1>Calendrier de Multidiffusion</h1>
              <span className="header-separator">•</span>
              <p>Planifiez et gérez vos publications sur toutes vos plateformes</p>
            </div>
          </div>

          {/* Sous-menu avec les boutons de contrôle */}
          <div className="calendar-submenu">
            <div className="submenu-buttons-container">
              <button
                className={`submenu-btn ${activeView === 'calendar' ? 'active' : ''}`}
                onClick={() => setActiveView('calendar')}
              >
                <i className="fas fa-calendar"></i>
                <span>Calendrier</span>
              </button>
              <button
                className={`submenu-btn ${activeView === 'list' ? 'active' : ''}`}
                onClick={() => setActiveView('list')}
              >
                <i className="fas fa-list"></i>
                <span>Listes</span>
              </button>
              <button
                className={`submenu-btn ${activeView === 'timeline' ? 'active' : ''}`}
                onClick={() => setActiveView('timeline')}
              >
                <i className="fas fa-stream"></i>
                <span>Timeline</span>
              </button>
              <button className="submenu-btn" onClick={() => setActiveView('library')}>
                <i className="fas fa-folder"></i>
                <span>Bibliothèque</span>
              </button>
              <button className="submenu-btn primary" onClick={() => setActiveView('create')}>
                <i className="fas fa-plus"></i>
                <span>Créer un post</span>
              </button>
            </div>
          </div>

          {/* Fenêtre principale */}
          <div className="main-content-window">
            {activeView === 'calendar' && (
              <div className="calendar-container-with-filters">
                {/* Colonne de filtres à gauche */}
                <div className="platform-filters-sidebar">
                  <h3>Plateformes</h3>
                  <div className="platform-filter-list">
                    {platforms.map(platform => (
                      <div
                        key={platform.id}
                        className={`platform-filter-item ${selectedPlatforms.includes(platform.id) ? 'active' : ''}`}
                        onClick={() => togglePlatformFilter(platform.id)}
                      >
                        <i className={platform.icon} style={{ color: platform.color }}></i>
                        <span>{platform.name}</span>
                        <div className="post-count">
                          {scheduledPosts.filter(post => post.platforms && post.platforms.includes(platform.id)).length}
                        </div>
                      </div>
                    ))}
                    <div className="filter-actions">
                      <button
                        className="clear-filters-btn"
                        onClick={() => setSelectedPlatforms([])}
                      >
                        Tout afficher
                      </button>
                    </div>
                  </div>
                </div>

                {/* Zone calendrier principale */}
                <div className="calendar-main-area">
                  <div className="calendar-container">
                    {/* Navigation calendrier compacte */}
                    <div className="calendar-navigation-compact">
                      <div className="calendar-nav">
                        <button onClick={() => {
                          const newDate = new Date(currentDate);
                          newDate.setMonth(newDate.getMonth() - 1);
                          setCurrentDate(newDate);
                        }}>
                          <i className="fas fa-chevron-left"></i>
                        </button>

                        <div className="date-selector">
                          <select
                            value={currentDate.getMonth()}
                            onChange={(e) => {
                              const newDate = new Date(currentDate);
                              newDate.setMonth(parseInt(e.target.value));
                              setCurrentDate(newDate);
                            }}
                            className="month-selector"
                          >
                            {Array.from({length: 12}, (_, i) => (
                              <option key={i} value={i}>
                                {new Date(2000, i).toLocaleDateString('fr-FR', { month: 'long' })}
                              </option>
                            ))}
                          </select>

                          <select
                            value={currentDate.getFullYear()}
                            onChange={(e) => {
                              const newDate = new Date(currentDate);
                              newDate.setFullYear(parseInt(e.target.value));
                              setCurrentDate(newDate);
                            }}
                            className="year-selector"
                          >
                            {Array.from({length: 10}, (_, i) => (
                              <option key={i} value={currentDate.getFullYear() - 5 + i}>
                                {currentDate.getFullYear() - 5 + i}
                              </option>
                            ))}
                          </select>
                        </div>

                        <button onClick={() => {
                          const newDate = new Date(currentDate);
                          newDate.setMonth(newDate.getMonth() + 1);
                          setCurrentDate(newDate);
                        }}>
                          <i className="fas fa-chevron-right"></i>
                        </button>
                      </div>

                      <div className="calendar-controls">
                        <div className="view-controls">
                          {['month', 'week', 'day'].map(view => (
                            <button
                              key={view}
                              className={calendarType === view ? 'active' : ''}
                              onClick={() => setCalendarType(view)}
                            >
                              {view === 'month' ? 'Mois' : view === 'week' ? 'Semaine' : 'Jour'}
                            </button>
                          ))}
                        </div>

                        <div className="calendar-filters-inline">
                          <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                          >
                            <option value="all">Tous statuts</option>
                            <option value="draft">Brouillon</option>
                            <option value="pending">En attente</option>
                            <option value="validated">Validé</option>
                            <option value="published">Publié</option>
                            <option value="failed">Échec</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Vue calendrier */}
                    <div className="calendar-content">
                      {renderCalendarView()}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeView === 'list' && (
              <div className="list-container">
                <div className="publications-list">
                  {getFilteredPosts().map(post => (
                    <div key={post.id} className="publication-item">
                      <div className="publication-info">
                        <h4>{post.title || 'Sans titre'}</h4>
                        <p>{post.content ? post.content.substring(0, 100) + '...' : 'Aucun contenu'}</p>
                        <div className="publication-meta">
                          <span className={`status-badge ${post.status || 'draft'}`}>
                            {statusLabels[post.status] || 'Brouillon'}
                          </span>
                          <span>{post.scheduledDate || 'Date inconnue'} {post.scheduledTime || '09:00'}</span>
                        </div>
                      </div>
                      <div className="publication-actions">
                        <button onClick={() => {
                          setSelectedPost(post);
                          setShowPostModal(true);
                        }}>
                          <i className="fas fa-edit"></i>
                        </button>
                        <button onClick={() => handleDeletePost(post.id)}>
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeView === 'timeline' && (
              <div className="timeline-container">
                <div className="timeline">
                  {getFilteredPosts().map(post => (
                    <div key={post.id} className="timeline-item">
                      <div className="timeline-marker" style={{ backgroundColor: statusColors[post.status] || '#007bff' }}>
                        <i className={platforms.find(p => p.id === post.platforms?.[0])?.icon || 'fas fa-circle'}></i>
                      </div>
                      <div className="timeline-content">
                        <h4>{post.title || 'Sans titre'}</h4>
                        <p>{post.scheduledDate || 'Date inconnue'} {post.scheduledTime || '09:00'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeView === 'library' && (
              <div className="library-container">
                <ContentLibrary
                  onSelectContent={handleSelectFromLibrary}
                  onClose={() => setActiveView('calendar')}
                />
              </div>
            )}

            {activeView === 'create' && (
              <div className="editor-in-calendar">
                <ContentEditorFixed
                  initialData={selectedContent}
                  onSave={(data) => {
                    console.log('Contenu sauvegardé:', data);
                    setActiveView('calendar');
                  }}
                  onClose={() => setActiveView('calendar')}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarPage;
