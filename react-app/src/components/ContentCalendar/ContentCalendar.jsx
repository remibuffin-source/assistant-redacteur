import React, { useState, useRef, useCallback, useEffect } from 'react';

// Importations de FullCalendar
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction'; // Pour le drag-and-drop et les clics
import frLocale from '@fullcalendar/core/locales/fr';
import enLocale from '@fullcalendar/core/locales/en-gb';
import esLocale from '@fullcalendar/core/locales/es';
import deLocale from '@fullcalendar/core/locales/de';

// Importation des styles
import './ContentCalendar.css';

// Importation du système de traduction
import { useAssistantAutoSave } from '../../hooks/useLocalStorage';
import { getCalendarText } from '../../i18n/calendarTranslations';

// --- Données de configuration et de simulation ---
const getPlatformDetails = (t) => ({
    instagram: { name: 'Instagram', icon: '/icons/instagram.ico', color: '#E1306C' },
    facebook: { name: 'Facebook', icon: '/icons/facebook.ico', color: '#1877F2' },
    twitter: { name: 'Twitter', icon: '/icons/twitter.ico', color: '#1DA1F2' },
    linkedin: { name: 'LinkedIn', icon: '/icons/linkedin.ico', color: '#0A66C2' },
    tiktok: { name: 'TikTok', icon: '/icons/tiktok.ico', color: '#000000' },
    website: { name: t('platforms.website'), icon: 'fas fa-globe', color: '#FF5722' },
    blog: { name: t('platforms.blog'), icon: 'fas fa-blog', color: '#9C27B0' },
    youtube: { name: 'YouTube', icon: '/icons/youtube.ico', color: '#FF0000' },
});

const INITIAL_MAIN_POSTS = [
    { id: '1', title: 'Lancement nouvelle saveur', content: 'Découvrez le goût exotique...', platforms: ['instagram', 'facebook'], status: 'published', start: '2025-10-08T10:30:00' },
    { id: '2', title: 'Sondage : boisson préférée', content: 'Votez maintenant !', platforms: ['instagram'], status: 'published', start: '2025-10-10T12:00:00' },
    { id: '3', title: 'Article : bienfaits du détox', content: 'Plongez dans notre dernier article.', platforms: ['twitter', 'linkedin'], status: 'scheduled', start: '2025-10-13T09:00:00' },
];

// MODIFIÉ : Les modules de base sont maintenant séparés pour être fusionnés plus tard
const getBaseModuleTemplates = (t) => ({
  'accueil-fun': { 
    id: 'accueil-fun', 
    title: t('modules.welcomeFun.title') || 'Hello la team ! 👋', 
    content: t('modules.welcomeFun.content') || 'Prêts pour une semaine de folie ?', 
    tags: ['fun', 'engagement'], 
    isBase: true 
  },
  'sondage-produit': { 
    id: 'sondage-produit', 
    title: t('modules.productPoll.title') || 'Votre avis compte !', 
    content: t('modules.productPoll.content') || 'Quel produit préférez-vous ?', 
    tags: ['sondage', 'feedback'], 
    platforms: ['instagram'], 
    isBase: true 
  },
  'jeu-concours': { 
    id: 'jeu-concours', 
    title: t('modules.contest.title') || '🎁 JEU CONCOURS 🎁', 
    content: t('modules.contest.content') || 'Tentez de gagner notre produit phare ! Pour participer...', 
    tags: ['concours'], 
    isBase: true 
  }
});


// Le Composant Principal du Calendrier
const ContentCalendar = ({ editorData }) => {
    // Système de traduction
    const { autoSaveData } = useAssistantAutoSave();
    const userLanguage = autoSaveData.language || 'fr';
    const t = (path) => getCalendarText(userLanguage, path);
    
    // Plateformes avec traductions
    const PLATFORM_DETAILS = getPlatformDetails(t);
    
    // Modules de base avec traductions
    const BASE_MODULE_TEMPLATES = getBaseModuleTemplates(t);
    
    // Mapping des locales FullCalendar
    const localeMap = {
        'fr': frLocale,
        'en': enLocale,
        'es': esLocale,
        'de': deLocale
    };
    
    // --- États React ---
    const [mainPosts, setMainPosts] = useState(INITIAL_MAIN_POSTS);
    const [localPosts, setLocalPosts] = useState([]);
    const [savedPublications, setSavedPublications] = useState([]);
    const [activeFilters, setActiveFilters] = useState(new Set(Object.keys(getPlatformDetails(t))));
    
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

    // NOUVEAU : États pour la gestion dynamique des modules
    const [userModules, setUserModules] = useState({});
    const [showModuleModal, setShowModuleModal] = useState(false);
    const [newModuleData, setNewModuleData] = useState({ title: '', content: '', platforms: [] });

    // --- États pour la création par séquence ---
    const [selectedModules, setSelectedModules] = useState(new Set());
    const [newPostDate, setNewPostDate] = useState(new Date().toISOString().split('T')[0]);

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
        const localeCode = userLanguage === 'en' ? 'en-GB' : userLanguage === 'es' ? 'es-ES' : userLanguage === 'de' ? 'de-DE' : 'fr-FR';
        const month = date.toLocaleDateString(localeCode, { month: 'long' });
        const year = date.getFullYear();
        const weekShort = t('calendar.weekShort') || 'Sem';
        return `${day} ${month} ${year}, ${weekShort} ${weekNumber}${weekType}`;
    };

    // --- Utilitaires de normalisation de contenu pour textarea (popup) ---
    const normalizeForTextarea = (html) => {
        try {
            const decoder = document.createElement('textarea');
            decoder.innerHTML = String(html || '');
            const decoded = decoder.value; // transforme &lt;br&gt; en   

            // Remplacer les sauts de ligne HTML par des \n, puis retirer toute autre balise
            const withNewlines = decoded
                // Toutes variantes de   

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

    // --- Chargement des données depuis localStorage ---
    useEffect(() => {
        // Charger les publications
        try {
            const saved = localStorage.getItem('savedPublications');
            if (saved) {
                const publications = JSON.parse(saved);
                const formattedPublications = publications.map(pub => ({
                    id: pub.timestamp || Date.now(), title: pub.title, content: pub.content,
                    platforms: pub.platforms || ['website'], status: pub.status || 'scheduled',
                    start: pub.publishDate || pub.timestamp
                }));
                setSavedPublications(formattedPublications);
            }
        } catch (error) { console.error('Erreur chargement publications:', error); }

        // NOUVEAU : Charger les modules utilisateur
        try {
            const savedModules = localStorage.getItem('userModules');
            if (savedModules) {
                setUserModules(JSON.parse(savedModules));
            }
        } catch (error) { console.error('Erreur chargement modules:', error); }
    }, []);

    // --- Traitement des données de l'éditeur ---
    useEffect(() => {
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
    useEffect(() => {
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

    const handleExport = () => {
        const allPosts = [...mainPosts, ...localPosts, ...savedPublications];
        if (allPosts.length === 0) {
            alert("Il n'y a aucun post à exporter.");
            return;
        }
        const jsonString = JSON.stringify(allPosts, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        const date = new Date().toISOString().split('T')[0];
        link.download = `planning-windsurf-${date}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        alert(`${allPosts.length} post(s) ont été exporté(s) avec succès !`);
    };

    const toggleModule = (moduleKey) => {
        setSelectedModules(prev => {
            const newSelection = new Set(prev);
            if (newSelection.has(moduleKey)) {
                newSelection.delete(moduleKey);
            } else {
                newSelection.add(moduleKey);
            }
            return newSelection;
        });
    };

    const handleCreateFromSequence = () => {
        if (selectedModules.size === 0) {
            alert("Veuillez sélectionner au moins un module.");
            return;
        }

        const allAvailableModules = { ...BASE_MODULE_TEMPLATES, ...userModules };

        let finalTitle = '';
        let finalContent = [];
        let finalPlatforms = new Set(['website']);

        selectedModules.forEach(key => {
            const module = allAvailableModules[key];
            if (!module) return;
            if (!finalTitle) finalTitle = module.title;
            finalContent.push(module.content);
            if (module.platforms) {
                module.platforms.forEach(p => finalPlatforms.add(p));
            }
        });

        setScheduleData({
            title: finalTitle,
            content: finalContent.join('\n\n'),
            publishDate: newPostDate,
            publishTime: '09:00',
            platforms: Array.from(finalPlatforms),
            status: 'draft'
        });
        setShowScheduleModal(true);
        setSelectedPost(null);
    };

    // NOUVEAU : Fonctions pour la gestion de la modale de création de module
    const handleOpenModuleModal = () => {
        setNewModuleData({ title: '', content: '', platforms: [] }); // Reset form
        setShowModuleModal(true);
    };

    const handleCloseModuleModal = () => {
        setShowModuleModal(false);
    };

    const handleSaveModule = () => {
        if (!newModuleData.title) {
            alert("Le titre du module est obligatoire.");
            return;
        }
        const moduleId = `user-${Date.now()}`;
        const newModule = { id: moduleId, ...newModuleData };

        const updatedUserModules = { ...userModules, [moduleId]: newModule };
        setUserModules(updatedUserModules);
        localStorage.setItem('userModules', JSON.stringify(updatedUserModules));

        alert(`Module "${newModule.title}" sauvegardé !`);
        handleCloseModuleModal();
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
                    {/* MODIFIÉ : Zone de création par Séquence */}
                    <div className="sequence-section">
                        <div className="sequence-header">
                            <h2>{t('buttons.createSequence')}</h2>
                            {/* NOUVEAU : Bouton pour ajouter un module */}
                            <button className="btn-add-module" onClick={handleOpenModuleModal}>+</button>
                        </div>
                        <div className="form-group">
                            <label>{t('sidebar.modulesLabel')}</label>
                            <div className="modules-selection">
                                {/* MODIFIÉ : Affiche les modules de base ET ceux de l'utilisateur */}
                                {Object.entries({ ...BASE_MODULE_TEMPLATES, ...userModules }).map(([key, { title, isBase }]) => (
                                    <label key={key} className="module-checkbox">
                                        <input
                                            type="checkbox"
                                            checked={selectedModules.has(key)}
                                            onChange={() => toggleModule(key)}
                                        />
                                        <span>{title}</span>
                                        {isBase && <span className="base-module-tag">Base</span>}
                                    </label>
                                ))}
                            </div>
                        </div>
                        <div className="form-group">
                            <label>{t('sidebar.sequenceDateLabel')}</label>
                            <input
                                type="date"
                                value={newPostDate}
                                onChange={(e) => setNewPostDate(e.target.value)}
                            />
                        </div>
                        <button className="btn-create-sequence" onClick={handleCreateFromSequence}>
                           {t('buttons.createAndSchedule')}
                        </button>
                    </div>

                    <h2>{t('sidebar.platformsTitle')}</h2>
                    <div 
                        className={`platform-filter ${activeFilters.size === Object.keys(PLATFORM_DETAILS).length ? 'active' : ''}`}
                        onClick={toggleAllFilters}
                    >
                        <span>{t('sidebar.allPlatforms')}</span>
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
                    <button className="import-button" onClick={() => fileInputRef.current.click()}>
                        <span>☁️</span> {t('buttons.import')}
                    </button>
                    <button className="export-button" onClick={handleExport}>
                        <span>💾</span> {t('buttons.export')}
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
                            const localeCode = userLanguage === 'en' ? 'en-GB' : userLanguage === 'es' ? 'es-ES' : userLanguage === 'de' ? 'de-DE' : 'fr-FR';
                            const weekday = d.toLocaleDateString(localeCode, { weekday: 'short' });
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
                            const localeCode = userLanguage === 'en' ? 'en-GB' : userLanguage === 'es' ? 'es-ES' : userLanguage === 'de' ? 'de-DE' : 'fr-FR';
                            const month = current.toLocaleDateString(localeCode, { month: 'long' });
                            const year = current.getFullYear();
                            const weekText = t('calendar.week') || 'Semaine';
                            titleEl.textContent = `${month} ${year}, ${weekText} ${weekNumber}${weekType}`;
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
                    locale={localeMap[userLanguage] || frLocale}
                />
            </div>

            {/* Modal de planification */}
            {showScheduleModal && (
                <div className="schedule-modal-overlay" onClick={handleScheduleCancel}>
                    <div className="schedule-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>{selectedPost ? t('modals.schedule.editTitle') : t('modals.schedule.title')}</h3>
                            <button className="modal-close" onClick={handleScheduleCancel}>×</button>
                        </div>
                        
                        <div className="modal-body">
                            <div className="form-group">
                                <label>{t('modals.schedule.titleLabel')}</label>
                                <input
                                    type="text"
                                    value={scheduleData.title}
                                    onChange={(e) => setScheduleData({...scheduleData, title: e.target.value})}
                                    placeholder={t('modals.schedule.titlePlaceholder')}
                                />
                            </div>

                            <div className="form-group content-section">
                                <label>{t('modals.schedule.contentLabel')}</label>
                                <textarea
                                    value={normalizeForTextarea(scheduleData.content)}
                                    onChange={(e) => setScheduleData({...scheduleData, content: e.target.value})}
                                    placeholder={t('modals.schedule.contentPlaceholder')}
                                    rows="14"
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label className="date-publication-label">{t('modals.schedule.dateLabel')}</label>
                                    <input
                                        type="date"
                                        value={scheduleData.publishDate}
                                        onChange={(e) => setScheduleData({...scheduleData, publishDate: e.target.value})}
                                        className="date-input-double"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>{t('modals.schedule.timeLabel')}</label>
                                    <input
                                        type="time"
                                        value={scheduleData.publishTime}
                                        onChange={(e) => setScheduleData({...scheduleData, publishTime: e.target.value})}
                                        className="time-input-double"
                                    />
                                </div>
                                <div className="form-group status-field">
                                    <label>{t('modals.schedule.statusLabel')}</label>
                                    <select
                                        value={scheduleData.status}
                                        onChange={(e) => setScheduleData({...scheduleData, status: e.target.value})}
                                        className="status-select"
                                    >
                                        <option value="draft">{t('modals.schedule.statusDraft')}</option>
                                        <option value="scheduled">{t('modals.schedule.statusScheduled')}</option>
                                        <option value="published">{t('modals.schedule.statusPublished')}</option>
                                    </select>
                                </div>
                            </div>

                            <div className="form-group">
                                <label>{t('modals.schedule.platformsLabel')}</label>
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
                                {t('modals.schedule.cancelButton')}
                            </button>
                            <button className="btn-save" onClick={handleScheduleSave}>
                                {selectedPost ? t('modals.schedule.editButton') : t('modals.schedule.scheduleButton')}
                            </button>
                        </div>
                    </div>
            </div>
        )}
        {/* NOUVEAU : Modale de création de module */}
        {showModuleModal && (
            <div className="schedule-modal-overlay" onClick={handleCloseModuleModal}>
                <div className="schedule-modal" onClick={(e) => e.stopPropagation()}>
                    <div className="modal-header">
                        <h3>Créer un nouveau module</h3>
                        <button className="modal-close" onClick={handleCloseModuleModal}>×</button>
                    </div>
                    <div className="modal-body">
                        <div className="form-group">
                            <label>Titre du module</label>
                            <input
                                type="text"
                                value={newModuleData.title}
                                onChange={(e) => setNewModuleData({...newModuleData, title: e.target.value})}
                                placeholder="Ex: Annonce produit"
                            />
                        </div>
                        <div className="form-group">
                            <label>Contenu du module</label>
                            <textarea
                                value={newModuleData.content}
                                onChange={(e) => setNewModuleData({ ...newModuleData, content: e.target.value })}
                                placeholder="Texte du module..."
                                rows="6"
                            />
                        </div>
                        <div className="form-group">
                            <label>Plateformes du module</label>
                            <div className="platforms-selection">
                                {Object.entries(PLATFORM_DETAILS).map(([key, { name, icon }]) => (
                                    <label key={key} className="platform-checkbox">
                                        <input
                                            type="checkbox"
                                            checked={newModuleData.platforms.includes(key)}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    setNewModuleData({
                                                        ...newModuleData,
                                                        platforms: [...newModuleData.platforms, key]
                                                    });
                                                } else {
                                                    setNewModuleData({
                                                        ...newModuleData,
                                                        platforms: newModuleData.platforms.filter(p => p !== key)
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
                        <button className="btn-cancel" onClick={handleCloseModuleModal}>Annuler</button>
                        <button className="btn-save" onClick={handleSaveModule}>Sauvegarder</button>
                    </div>
                </div>
            </div>
        )}
    </div>
    );
};

export default ContentCalendar;
