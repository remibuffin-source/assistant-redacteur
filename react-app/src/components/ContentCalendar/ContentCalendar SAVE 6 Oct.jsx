import React, { useState, useRef, useCallback } from 'react';

// Importations de FullCalendar
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction'; // Pour le drag-and-drop et les clics

// Importation des styles et des icônes (si vous utilisez une bibliothèque comme lucide-react)
// Pour cet exemple, on utilisera des <span>, mais vous pouvez installer lucide-react
import './ContentCalendar.css';

// --- Données de configuration et de simulation ---
const PLATFORM_DETAILS = {
    instagram: { name: 'Instagram', icon: '/icons/instagram.ico', color: '#E1306C' },
    facebook: { name: 'Facebook', icon: '/icons/facebook.ico', color: '#1877F2' },
    twitter: { name: 'Twitter', icon: '/icons/twitter.ico', color: '#1DA1F2' },
    linkedin: { name: 'LinkedIn', icon: '/icons/linkedin.ico', color: '#0A66C2' },
    tiktok: { name: 'TikTok', icon: '/icons/tiktok.ico', color: '#000000' },
    website: { name: 'Mon Site', icon: 'fas fa-globe', color: '#FF5722' },
    blog: { name: 'Mon Blog', icon: 'fas fa-blog', color: '#9C27B0' },
    youtube: { name: 'YouTube', icon: '/icons/youtube.ico', color: '#FF0000' },
};

const INITIAL_MAIN_POSTS = [
    { id: '1', title: 'Lancement nouvelle saveur', content: 'Découvrez le goût exotique...', platforms: ['instagram', 'facebook'], status: 'published', start: '2025-10-08T10:30:00' },
    { id: '2', title: 'Sondage : boisson préférée', content: 'Votez maintenant !', platforms: ['instagram'], status: 'published', start: '2025-10-10T12:00:00' },
    { id: '3', title: 'Article : bienfaits du détox', content: 'Plongez dans notre dernier article.', platforms: ['twitter', 'linkedin'], status: 'scheduled', start: '2025-10-13T09:00:00' },
];
// --- Fin des données de simulation ---


// Le Composant Principal du Calendrier
const ContentCalendar = ({ editorData }) => {
    // --- États React ---
    const [mainPosts, setMainPosts] = useState(INITIAL_MAIN_POSTS);
    const [localPosts, setLocalPosts] = useState([]);
    const [savedPublications, setSavedPublications] = useState([]);
    const [activeFilters, setActiveFilters] = useState(new Set(Object.keys(PLATFORM_DETAILS)));
    
    // --- États pour la modal de planification ---
    const [showScheduleModal, setShowScheduleModal] = useState(false);
    const [selectedPost, setSelectedPost] = useState(null);
    const [scheduleData, setScheduleData] = useState({
        title: '',
        content: '',
        publishDate: '',
        publishTime: '09:00',
        platforms: ['website'],
        status: 'scheduled'
    });

    const fileInputRef = useRef(null); // Référence pour l'input de fichier

    // Fonction pour calculer le numéro de semaine
    const getWeekNumber = (date) => {
        const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
        const dayNum = d.getUTCDay() || 7;
        d.setUTCDate(d.getUTCDate() + 4 - dayNum);
        const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
        return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    };

    // Formate le titre pour la vue Jour: "6 novembre 2025, Sem 45A"
    const formatDayTitle = (date) => {
        const weekNumber = getWeekNumber(date);
        const weekType = weekNumber % 2 === 0 ? 'B' : 'A';
        const day = date.getDate();
        const month = date.toLocaleDateString('fr-FR', { month: 'long' });
        const year = date.getFullYear();
        return `${day} ${month} ${year}, Sem ${weekNumber}${weekType}`;
    };

    // --- Utilitaires de normalisation de contenu pour textarea (popup) ---
    const normalizeForTextarea = (html) => {
        try {
            const decoder = document.createElement('textarea');
            decoder.innerHTML = String(html || '');
            const decoded = decoder.value; // transforme &lt;br&gt; en <br>
            // Remplacer les sauts de ligne HTML par des \n, puis retirer toute autre balise
            const withNewlines = decoded
                // Toutes variantes de <br>
                .replace(/<br[^>]*>/gi, '\n')
                // Blocs courants -> nouvelle ligne à la fermeture
                .replace(/<\/p[^>]*>/gi, '\n')
                .replace(/<p[^>]*>/gi, '')
                .replace(/<\/li[^>]*>/gi, '\n')
                .replace(/<li[^>]*>/gi, '• ')
                .replace(/<\/h[1-6][^>]*>/gi, '\n')
                .replace(/<h[1-6][^>]*>/gi, '')
                // Divs comme lignes
                .replace(/<div[^>]*>/gi, '\n')
                .replace(/<\/div>/gi, '\n');
            const textOnly = withNewlines.replace(/<[^>]+>/g, '');
            // Compacter les lignes vides multiples
            return textOnly.replace(/\r\n|\r/g, '\n').replace(/\n{3,}/g, '\n\n');
        } catch {
            return String(html || '');
        }
    };

    // --- Chargement des publications sauvegardées ---
    React.useEffect(() => {
        // Charger les publications depuis localStorage
        const loadSavedPublications = () => {
            try {
                const saved = localStorage.getItem('savedPublications');
                if (saved) {
                    const publications = JSON.parse(saved);
                    // Convertir au format FullCalendar
                    const formattedPublications = publications.map(pub => ({
                        id: pub.timestamp || Date.now(),
                        title: pub.title,
                        content: pub.content,
                        platforms: pub.platforms || ['website'],
                        status: pub.status || 'scheduled',
                        start: pub.publishDate || pub.timestamp
                    }));
                    setSavedPublications(formattedPublications);
                }
            } catch (error) {
                console.error('Erreur lors du chargement des publications:', error);
            }
        };

        loadSavedPublications();
    }, []);

    // --- Traitement des données de l'éditeur ---
    React.useEffect(() => {
        if (editorData && editorData.fromEditor) {
            // Ouvrir directement la modal de planification avec les données
            setScheduleData({
                title: editorData.title || 'Publication sans titre',
                content: normalizeForTextarea(editorData.content || ''),
                publishDate: new Date().toISOString().split('T')[0], // Date du jour
                publishTime: '09:00',
                platforms: ['website'],
                status: 'scheduled'
            });
            setShowScheduleModal(true);
        }
    }, [editorData]);

    // --- Récupération depuis une nouvelle fenêtre (depuis l'Éditeur) ---
    React.useEffect(() => {
        try {
            const payloadStr = localStorage.getItem('editor_to_calendar');
            if (payloadStr) {
                const payload = JSON.parse(payloadStr);
                setScheduleData({
                    title: payload.title || 'Publication sans titre',
                    content: normalizeForTextarea(payload.content || ''),
                    publishDate: new Date().toISOString().split('T')[0],
                    publishTime: '09:00',
                    platforms: ['website'],
                    status: 'scheduled'
                });
                setShowScheduleModal(true);
                localStorage.removeItem('editor_to_calendar');
            }
        } catch {}
    }, []);

    // --- Fonctions de gestion d'événements ---

    const handleEventDrop = useCallback((dropInfo) => {
        const { event } = dropInfo;
        const postId = event.id;
        const newDate = event.start.toISOString();
        const sourceId = event.source.id;

        const updatePostDate = (posts) =>
            posts.map(p => (p.id === postId ? { ...p, start: newDate } : p));

        if (sourceId === 'main-source') {
            setMainPosts(updatePostDate);
        } else if (sourceId === 'local-file-source') {
            setLocalPosts(updatePostDate);
        } else if (sourceId === 'saved-publications') {
            setSavedPublications(updatePostDate);
            
            // Mettre à jour localStorage
            const currentSaved = JSON.parse(localStorage.getItem('savedPublications') || '[]');
            const updatedSaved = currentSaved.map(p => {
                if (p.timestamp === postId || p.timestamp === event.id) {
                    return { ...p, publishDate: newDate };
                }
                return p;
            });
            localStorage.setItem('savedPublications', JSON.stringify(updatedSaved));
        }
        
        alert(`Le post "${event.title}" a été déplacé au ${event.start.toLocaleDateString()}.`);
    }, []);

    const handleFileImport = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const imported = JSON.parse(e.target.result);
                setLocalPosts(imported); // Met à jour l'état avec les posts importés
                alert(`${imported.length} post(s) importé(s) avec succès !`);
            } catch (error) {
                alert("Erreur : Le fichier n'est pas un JSON valide.");
            }
        };
        reader.readAsText(file);
        event.target.value = ''; // Permet de ré-importer le même fichier
    };

    const toggleFilter = (platformKey) => {
        setActiveFilters(prevFilters => {
            const newFilters = new Set(prevFilters);
            if (newFilters.has(platformKey)) {
                newFilters.delete(platformKey);
            } else {
                newFilters.add(platformKey);
            }
            return newFilters;
        });
    };
    
    const toggleAllFilters = () => {
        if (activeFilters.size === Object.keys(PLATFORM_DETAILS).length) {
            setActiveFilters(new Set());
        } else {
            setActiveFilters(new Set(Object.keys(PLATFORM_DETAILS)));
        }
    };

    // --- Fonctions de gestion de la planification ---
    const handleEventClick = (clickInfo) => {
        const event = clickInfo.event;
        setSelectedPost({
            id: event.id,
            title: event.title,
            content: event.extendedProps.content,
            platforms: event.extendedProps.platforms || ['website'],
            status: event.extendedProps.status,
            start: event.start.toISOString()
        });
        
        setScheduleData({
            title: event.title,
            content: normalizeForTextarea(event.extendedProps.content || ''),
            publishDate: event.start.toISOString().split('T')[0],
            publishTime: event.start.toTimeString().slice(0, 5),
            platforms: event.extendedProps.platforms || ['website'],
            status: event.extendedProps.status || 'scheduled'
        });
        console.log('[Calendar] onEventClick normalized ->', normalizeForTextarea(event.extendedProps.content || '').slice(0, 200));
        
        setShowScheduleModal(true);
    };

    const handleScheduleSave = () => {
        const dateTime = `${scheduleData.publishDate}T${scheduleData.publishTime}:00`;
        // Si l'utilisateur a saisi du texte avec \n, reconvertir en <br> pour conserver la mise en forme HTML côté stockage
        const contentHtml = (scheduleData.content || '').replace(/\r?\n/g, '<br>');
        
        const newPost = {
            id: selectedPost?.id || Date.now(),
            title: scheduleData.title,
            content: contentHtml,
            platforms: scheduleData.platforms,
            status: scheduleData.status,
            start: dateTime
        };

        if (selectedPost) {
            // Modifier un post existant
            setSavedPublications(prev => 
                prev.map(p => p.id === selectedPost.id ? newPost : p)
            );
            
            // Mettre à jour localStorage pour les modifications
            const currentSaved = JSON.parse(localStorage.getItem('savedPublications') || '[]');
            const updatedSaved = currentSaved.map(p => 
                p.timestamp === selectedPost.id || p.timestamp === selectedPost.start
                    ? {
                        title: newPost.title,
                        content: newPost.content,
                        publishDate: dateTime,
                        platforms: newPost.platforms,
                        status: newPost.status,
                        timestamp: selectedPost.id
                    }
                    : p
            );
            localStorage.setItem('savedPublications', JSON.stringify(updatedSaved));
        } else {
            // Créer un nouveau post
            setSavedPublications(prev => [...prev, newPost]);
            
            // Sauvegarder dans localStorage
            const currentSaved = JSON.parse(localStorage.getItem('savedPublications') || '[]');
            currentSaved.push({
                title: newPost.title,
                content: contentHtml,
                publishDate: dateTime,
                platforms: newPost.platforms,
                status: newPost.status,
                timestamp: new Date().toISOString()
            });
            localStorage.setItem('savedPublications', JSON.stringify(currentSaved));
        }

        setShowScheduleModal(false);
        setSelectedPost(null);
    };

    const handleScheduleCancel = () => {
        setShowScheduleModal(false);
        setSelectedPost(null);
        setScheduleData({
            title: '',
            content: '',
            publishDate: '',
            publishTime: '09:00',
            platforms: ['website'],
            status: 'scheduled'
        });
    };

    // --- Rendu des icônes de plateforme ---
    const renderPlatformIcon = (icon, name) => {
        if (icon.startsWith('fas fa-')) {
            // Icône FontAwesome
            return <i className={icon} style={{ fontSize: '20px', color: '#6c757d' }}></i>;
        } else {
            // Fichier .ico
            return <img src={icon} alt={name} className="platform-icon-sidebar" />;
        }
    };

    // --- Rendu des icônes de plateforme dans les cartes ---
    const renderPlatformIconInCard = (platformKey) => {
        const platform = PLATFORM_DETAILS[platformKey];
        if (!platform) return null;
        
        const { icon, name } = platform;
        
        if (icon.startsWith('fas fa-')) {
            // Icône FontAwesome pour Mon Blog et Mon Site
            return <i key={platformKey} className={icon} style={{ fontSize: '16px', color: '#6c757d', marginLeft: '4px' }}></i>;
        } else {
            // Fichier .ico pour les autres plateformes
            return <img 
                key={platformKey} 
                src={icon} 
                alt={name}
                className="platform-icon-small"
                style={{ marginLeft: '4px' }}
            />;
        }
    };

    // --- Rendu des cartes de post ---
    const renderEventContent = (eventInfo) => {
        const { extendedProps: post, source, title, start } = eventInfo.event;
        const sourceClass = source.id === 'local-file-source' ? 'source-local' : '';
        const time = new Date(start).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

        return (
            <div className={`post-card status-${post.status} ${sourceClass}`}>
                <div className="post-card-header">
                    <div className="post-card-platforms">
                        {post.platforms.map(p => renderPlatformIconInCard(p))}
                    </div>
                    <div className="post-card-time">{time}</div>
                </div>
                <div className="post-card-title">{title}</div>
                <div className="post-card-content">{post.content?.substring(0, 40)}...</div>
            </div>
        );
    };

    // --- JSX : La structure de la page ---
    return (
        <div className="calendar-layout">
            {/* Colonne de Filtres (Sidebar) */}
            <div className="filter-sidebar">
                <div>
                    <h2>Plateformes</h2>
                    <div 
                        className={`platform-filter ${activeFilters.size === Object.keys(PLATFORM_DETAILS).length ? 'active' : ''}`}
                        onClick={toggleAllFilters}
                    >
                        <span>Toutes les plateformes</span>
                        <span className="count">{mainPosts.length + localPosts.length + savedPublications.length}</span>
                    </div>
                    {Object.entries(PLATFORM_DETAILS).map(([key, { name, icon }]) => (
                        <div
                            key={key}
                            className={`platform-filter ${activeFilters.has(key) ? 'active' : ''}`}
                            onClick={() => toggleFilter(key)}
                        >
                            {renderPlatformIcon(icon, name)}
                            <span>{name}</span>
                            <span className="count">
                                {mainPosts.filter(p => p.platforms.includes(key)).length + 
                                 localPosts.filter(p => p.platforms.includes(key)).length + 
                                 savedPublications.filter(p => p.platforms.includes(key)).length}
                            </span>
                        </div>
                    ))}
                </div>
                <div className="io-section">
                    <input type="file" ref={fileInputRef} onChange={handleFileImport} accept=".json" style={{ display: 'none' }} />
                    <button onClick={() => fileInputRef.current.click()}>
                        <span>☁️</span> Importer
                    </button>
                </div>
            </div>

            {/* Zone du Calendrier */}
            <div className="calendar-container">
                <FullCalendar
                    plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                    initialView="dayGridMonth"
                    headerToolbar={{
                        left: 'prev,next today',
                        center: 'title',
                        right: 'dayGridMonth,timeGridWeek,timeGridDay',
                    }}
                    editable={true}
                    dayHeaderFormat={{ weekday: 'long' }}
                    dayHeaderContent={(arg) => {
                        // En vue Semaine, afficher le numéro du jour en plus
                        if (arg.view.type === 'timeGridWeek') {
                            const d = arg.date;
                            const dayNum = d.getDate();
                            const weekday = d.toLocaleDateString('fr-FR', { weekday: 'short' });
                            return {
                                html: `<div class="fc-week-header-cell"><div class="fc-week-day-number">${dayNum}</div><div class="fc-week-day-name">${weekday}</div></div>`
                            };
                        }
                        // Autres vues: retourner une chaîne simple
                        return arg.text;
                    }}
                    dayHeaderClassNames={() => ['fc-day-header-black']}
                    weekNumbers={false}
                    datesSet={(info) => {
                        // Mettre à jour le titre à chaque changement de date/vue
                        const titleEl = document.querySelector('.fc-toolbar-title');
                        if (!titleEl) return;
                        if (info.view.type === 'timeGridWeek') {
                            const current = info.view.currentStart;
                            const weekNumber = getWeekNumber(current);
                            const weekType = weekNumber % 2 === 0 ? 'B' : 'A';
                            const month = current.toLocaleDateString('fr-FR', { month: 'long' });
                            const year = current.getFullYear();
                            titleEl.textContent = `${month} ${year}, Semaine ${weekNumber}${weekType}`;
                        } else if (info.view.type === 'timeGridDay') {
                            titleEl.textContent = formatDayTitle(info.view.currentStart);
                        } else if (info.view.type === 'dayGridMonth') {
                            // Utiliser le titre par défaut de FullCalendar pour le mois
                            titleEl.textContent = info.view.title;
                        }
                    }}
                    slotLabelFormat={{
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: false
                    }}
                    slotMinTime="06:00:00"
                    slotMaxTime="22:00:00"
                    businessHours={false}
                    eventSources={[
                        { id: 'main-source', events: mainPosts.filter(p => p.platforms.some(pf => activeFilters.has(pf))) },
                        { id: 'local-file-source', events: localPosts.filter(p => p.platforms.some(pf => activeFilters.has(pf))) },
                        { id: 'saved-publications', events: savedPublications.filter(p => p.platforms.some(pf => activeFilters.has(pf))) }
                    ]}
                    eventContent={renderEventContent}
                    eventDrop={handleEventDrop}
                    eventClick={handleEventClick}
                    locale="fr"
                />
            </div>

            {/* Modal de planification */}
            {showScheduleModal && (
                <div className="schedule-modal-overlay" onClick={handleScheduleCancel}>
                    <div className="schedule-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>{selectedPost ? 'Modifier la publication' : 'Planifier la publication'}</h3>
                            <button className="modal-close" onClick={handleScheduleCancel}>×</button>
                        </div>
                        
                        <div className="modal-body">
                            <div className="form-group">
                                <label>Titre de la publication</label>
                                <input
                                    type="text"
                                    value={scheduleData.title}
                                    onChange={(e) => setScheduleData({...scheduleData, title: e.target.value})}
                                    placeholder="Titre de votre publication"
                                />
                            </div>

                            <div className="form-group content-section">
                                <label>Contenu</label>
                                <textarea
                                    value={normalizeForTextarea(scheduleData.content)}
                                    onChange={(e) => setScheduleData({...scheduleData, content: e.target.value})}
                                    placeholder="Contenu de votre publication"
                                    rows="14"
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label className="date-publication-label">Date de publication</label>
                                    <input
                                        type="date"
                                        value={scheduleData.publishDate}
                                        onChange={(e) => setScheduleData({...scheduleData, publishDate: e.target.value})}
                                        className="date-input-double"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Heure</label>
                                    <input
                                        type="time"
                                        value={scheduleData.publishTime}
                                        onChange={(e) => setScheduleData({...scheduleData, publishTime: e.target.value})}
                                        className="time-input-double"
                                    />
                                </div>
                                <div className="form-group status-field">
                                    <label>Statut</label>
                                    <select
                                        value={scheduleData.status}
                                        onChange={(e) => setScheduleData({...scheduleData, status: e.target.value})}
                                        className="status-select"
                                    >
                                        <option value="draft">Brouillon</option>
                                        <option value="scheduled">Programmé</option>
                                        <option value="published">Publié</option>
                                    </select>
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Plateformes de diffusion</label>
                                <div className="platforms-selection">
                                    {Object.entries(PLATFORM_DETAILS).map(([key, { name, icon }]) => (
                                        <label key={key} className="platform-checkbox">
                                            <input
                                                type="checkbox"
                                                checked={scheduleData.platforms.includes(key)}
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setScheduleData({
                                                            ...scheduleData,
                                                            platforms: [...scheduleData.platforms, key]
                                                        });
                                                    } else {
                                                        setScheduleData({
                                                            ...scheduleData,
                                                            platforms: scheduleData.platforms.filter(p => p !== key)
                                                        });
                                                    }
                                                }}
                                            />
                                            {renderPlatformIcon(icon, name)}
                                            <span>{name}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button className="btn-cancel" onClick={handleScheduleCancel}>
                                Annuler
                            </button>
                            <button className="btn-save" onClick={handleScheduleSave}>
                                {selectedPost ? 'Modifier' : 'Planifier'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ContentCalendar;
