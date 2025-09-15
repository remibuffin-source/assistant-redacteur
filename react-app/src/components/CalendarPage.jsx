import { useState, useEffect } from 'react';
import { useAssistantAutoSave } from '../hooks/useLocalStorage';
import { useNavigate } from 'react-router-dom';
import './CalendarPage.css';

const CalendarPage = () => {
  const { autoSaveData } = useAssistantAutoSave();
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState('calendar');
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isCreatingEvent, setIsCreatingEvent] = useState(false);

  // Plateformes supportées pour la multidiffusion
  const platforms = [
    { id: 'instagram', name: 'Instagram', icon: 'fab fa-instagram', color: '#E1306C' },
    { id: 'twitter', name: 'Twitter/X', icon: 'fab fa-twitter', color: '#1DA1F2' },
    { id: 'facebook', name: 'Facebook', icon: 'fab fa-facebook', color: '#1877F2' },
    { id: 'linkedin', name: 'LinkedIn', icon: 'fab fa-linkedin', color: '#0077B5' },
    { id: 'youtube', name: 'YouTube', icon: 'fab fa-youtube', color: '#FF0000' },
    { id: 'tiktok', name: 'TikTok', icon: 'fab fa-tiktok', color: '#000000' },
    { id: 'wordpress', name: 'WordPress', icon: 'fab fa-wordpress', color: '#21759B' },
    { id: 'medium', name: 'Medium', icon: 'fab fa-medium', color: '#000000' },
    { id: 'mailchimp', name: 'Mailchimp', icon: 'fas fa-envelope', color: '#FFE01B' },
    { id: 'slack', name: 'Slack', icon: 'fab fa-slack', color: '#4A154B' },
    { id: 'discord', name: 'Discord', icon: 'fab fa-discord', color: '#5865F2' }
  ];

  // Types de contenu supportés
  const contentTypes = [
    { id: 'post', name: 'Post', icon: 'fas fa-newspaper' },
    { id: 'story', name: 'Story', icon: 'fas fa-camera' },
    { id: 'video', name: 'Vidéo', icon: 'fas fa-video' },
    { id: 'reel', name: 'Reel', icon: 'fas fa-film' },
    { id: 'article', name: 'Article', icon: 'fas fa-file-alt' },
    { id: 'newsletter', name: 'Newsletter', icon: 'fas fa-envelope' }
  ];

  // Simuler le chargement des événements depuis le stockage local
  useEffect(() => {
    const savedEvents = JSON.parse(localStorage.getItem('calendarEvents') || '[]');
    setEvents(savedEvents);
  }, []);

  const saveEvents = (newEvents) => {
    setEvents(newEvents);
    localStorage.setItem('calendarEvents', JSON.stringify(newEvents));
  };

  const handleCreateEvent = () => {
    setIsCreatingEvent(true);
    setSelectedEvent({
      id: Date.now(),
      title: '',
      content: '',
      platforms: [],
      contentType: 'post',
      scheduledDate: new Date().toISOString(),
      status: 'draft'
    });
  };

  const handleSaveEvent = (eventData) => {
    const updatedEvents = selectedEvent.id 
      ? events.map(e => e.id === selectedEvent.id ? eventData : e)
      : [...events, { ...eventData, id: Date.now() }];
    
    saveEvents(updatedEvents);
    setIsCreatingEvent(false);
    setSelectedEvent(null);
  };

  const handleDeleteEvent = (eventId) => {
    const updatedEvents = events.filter(e => e.id !== eventId);
    saveEvents(updatedEvents);
    setSelectedEvent(null);
  };

  const handlePublishEvent = (eventId) => {
    const updatedEvents = events.map(e => 
      e.id === eventId ? { ...e, status: 'scheduled' } : e
    );
    saveEvents(updatedEvents);
  };

  const renderCalendarView = () => (
    <div className="calendar-view">
      <div className="calendar-header">
        <h3>Calendrier de publication</h3>
        <div className="calendar-controls">
          <button className="btn-primary" onClick={handleCreateEvent}>
            <i className="fas fa-plus"></i>
            Nouvelle publication
          </button>
          <select>
            <option>Mois</option>
            <option>Semaine</option>
            <option>Jour</option>
          </select>
        </div>
      </div>

      <div className="calendar-grid">
        <div className="calendar-days">
          {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map(day => (
            <div key={day} className="calendar-day-header">{day}</div>
          ))}
        </div>
        
        <div className="calendar-content">
          {Array.from({ length: 42 }, (_, i) => {
            const date = new Date();
            date.setDate(date.getDate() + i - 15);
            const dayEvents = events.filter(e => 
              new Date(e.scheduledDate).toDateString() === date.toDateString()
            );

            return (
              <div key={i} className="calendar-cell">
                <div className="cell-date">{date.getDate()}</div>
                {dayEvents.map(event => (
                  <div
                    key={event.id}
                    className="calendar-event"
                    style={{ borderLeftColor: platforms.find(p => p.id === event.platforms[0])?.color || '#666' }}
                    onClick={() => setSelectedEvent(event)}
                  >
                    <div className="event-title">{event.title}</div>
                    <div className="event-platforms">
                      {event.platforms.slice(0, 2).map(platform => (
                        <i
                          key={platform}
                          className={platforms.find(p => p.id === platform)?.icon}
                          title={platforms.find(p => p.id === platform)?.name}
                        ></i>
                      ))}
                      {event.platforms.length > 2 && (
                        <span>+{event.platforms.length - 2}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  const renderEventModal = () => (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>{selectedEvent.id ? 'Modifier la publication' : 'Nouvelle publication'}</h3>
          <button className="close-btn" onClick={() => {
            setIsCreatingEvent(false);
            setSelectedEvent(null);
          }}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="event-form">
          <div className="form-group">
            <label>Titre de la publication</label>
            <input
              type="text"
              value={selectedEvent.title}
              onChange={(e) => setSelectedEvent(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Titre de votre publication..."
            />
          </div>

          <div className="form-group">
            <label>Contenu</label>
            <textarea
              value={selectedEvent.content}
              onChange={(e) => setSelectedEvent(prev => ({ ...prev, content: e.target.value }))}
              placeholder="Contenu de votre publication..."
              rows="4"
            />
          </div>

          <div className="form-group">
            <label>Plateformes de diffusion</label>
            <div className="platforms-grid">
              {platforms.map(platform => (
                <label key={platform.id} className="platform-checkbox">
                  <input
                    type="checkbox"
                    checked={selectedEvent.platforms.includes(platform.id)}
                    onChange={(e) => {
                      const updatedPlatforms = e.target.checked
                        ? [...selectedEvent.platforms, platform.id]
                        : selectedEvent.platforms.filter(p => p !== platform.id);
                      setSelectedEvent(prev => ({ ...prev, platforms: updatedPlatforms }));
                    }}
                  />
                  <div className="platform-card" style={{ borderColor: platform.color }}>
                    <i className={platform.icon} style={{ color: platform.color }}></i>
                    <span>{platform.name}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Type de contenu</label>
              <select
                value={selectedEvent.contentType}
                onChange={(e) => setSelectedEvent(prev => ({ ...prev, contentType: e.target.value }))}
              >
                {contentTypes.map(type => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Date de publication</label>
              <input
                type="datetime-local"
                value={selectedEvent.scheduledDate.slice(0, 16)}
                onChange={(e) => setSelectedEvent(prev => ({ 
                  ...prev, 
                  scheduledDate: new Date(e.target.value).toISOString() 
                }))}
              />
            </div>
          </div>

          <div className="modal-actions">
            <button
              className="btn-secondary"
              onClick={() => {
                setIsCreatingEvent(false);
                setSelectedEvent(null);
              }}
            >
              Annuler
            </button>
            {selectedEvent.id && (
              <button
                className="btn-danger"
                onClick={() => handleDeleteEvent(selectedEvent.id)}
              >
                Supprimer
              </button>
            )}
            <button
              className="btn-primary"
              onClick={() => handleSaveEvent(selectedEvent)}
            >
              {selectedEvent.id ? 'Modifier' : 'Créer'}
            </button>
            {selectedEvent.id && selectedEvent.status === 'draft' && (
              <button
                className="btn-success"
                onClick={() => handlePublishEvent(selectedEvent.id)}
              >
                Programmer
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderStats = () => (
    <div className="calendar-stats">
      <div className="stat-card">
        <div className="stat-icon">
          <i className="fas fa-calendar"></i>
        </div>
        <div className="stat-content">
          <h4>{events.length}</h4>
          <p>Publications planifiées</p>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-icon">
          <i className="fas fa-check-circle"></i>
        </div>
        <div className="stat-content">
          <h4>{events.filter(e => e.status === 'published').length}</h4>
          <p>Publications effectuées</p>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-icon">
          <i className="fas fa-clock"></i>
        </div>
        <div className="stat-content">
          <h4>{events.filter(e => e.status === 'scheduled').length}</h4>
          <p>En attente</p>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-icon">
          <i className="fas fa-broadcast-tower"></i>
        </div>
        <div className="stat-content">
          <h4>{new Set(events.flatMap(e => e.platforms)).size}</h4>
          <p>Plateformes actives</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="calendar-page">
      <div className="calendar-header">
        <button className="back-btn" onClick={() => navigate('/')}>
          <i className="fas fa-arrow-left"></i>
          Retour à l'application
        </button>
        <div className="header-content">
          <h1>Calendrier de Multidiffusion</h1>
          <p>Planifiez et organisez vos publications sur toutes vos plateformes</p>
        </div>
      </div>

      {renderStats()}

      <div className="calendar-views">
        <button 
          className={`view-btn ${activeView === 'calendar' ? 'active' : ''}`}
          onClick={() => setActiveView('calendar')}
        >
          <i className="fas fa-calendar"></i>
          Calendrier
        </button>
        <button 
          className={`view-btn ${activeView === 'list' ? 'active' : ''}`}
          onClick={() => setActiveView('list')}
        >
          <i className="fas fa-list"></i>
          Liste
        </button>
        <button 
          className={`view-btn ${activeView === 'timeline' ? 'active' : ''}`}
          onClick={() => setActiveView('timeline')}
        >
          <i className="fas fa-stream"></i>
          Timeline
        </button>
      </div>

      {activeView === 'calendar' && renderCalendarView()}
      {activeView === 'list' && (
        <div className="list-view">
          <h3>Liste des publications</h3>
          {/* TODO: Implémenter la vue liste */}
        </div>
      )}
      {activeView === 'timeline' && (
        <div className="timeline-view">
          <h3>Timeline des publications</h3>
          {/* TODO: Implémenter la vue timeline */}
        </div>
      )}

      {(isCreatingEvent || selectedEvent) && renderEventModal()}
    </div>
  );
};

export default CalendarPage;