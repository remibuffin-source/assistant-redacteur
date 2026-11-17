import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

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
import { publicationsApi } from '../../services/storageApi';
import wixBlogApi from '../../services/wixBlogApi';

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
    wixblog: { name: 'Blog Wix', icon: 'fas fa-blog', color: '#0C6EFC' },
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
    const location = useLocation();
    
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
    const [isSavingSchedule, setIsSavingSchedule] = useState(false); // État de sauvegarde
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

    // NOUVEAU : États pour la sidebar simplifiée
    const [showSequenceMenu, setShowSequenceMenu] = useState(false); // Menu déroulant Créer Séquence
    const [showPublicationsModal, setShowPublicationsModal] = useState(false); // Modal ouvrir publication
    const [sidebarWidth, setSidebarWidth] = useState(280); // Largeur de la sidebar redimensionnable
    const [isResizing, setIsResizing] = useState(false);
    const [selectedForDeletion, setSelectedForDeletion] = useState(new Set()); // Publications sélectionnées pour suppression
    const [isDeletingPublications, setIsDeletingPublications] = useState(false); // État de suppression en cours
    const [isSidebarOpen, setIsSidebarOpen] = useState(false); // État sidebar mobile
    const [isPublishingWix, setIsPublishingWix] = useState(false); // État publication Wix Blog

    const fileInputRef = useRef(null); // Référence pour l'input de fichier
    const sidebarRef = useRef(null); // Référence pour la sidebar

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

    // --- Chargement des données depuis MySQL (API publications-v2) ---
    const [isLoadingPublications, setIsLoadingPublications] = useState(true);
    
    const loadPublicationsFromApi = useCallback(async (showLoading = true) => {
        if (showLoading) setIsLoadingPublications(true);
        try {
            console.log('📡 [Calendar] Chargement des publications depuis l\'API...');
            const result = await publicationsApi.getAll();
            const publications = result?.data || [];
            console.log(`📊 [Calendar] ${publications.length} publications reçues de l'API`);

            const formattedPublications = publications.map(pub => {
                // S'assurer que platforms est toujours un tableau
                let platformsArray = pub.platforms || ['website'];
                if (typeof platformsArray === 'string') {
                    try {
                        platformsArray = JSON.parse(platformsArray);
                    } catch {
                        platformsArray = [platformsArray];
                    }
                }
                if (!Array.isArray(platformsArray)) {
                    platformsArray = ['website'];
                }
                
                return {
                    id: String(pub.id),
                    title: pub.title,
                    content: pub.content,
                    platforms: platformsArray,
                    status: pub.status || 'draft',
                    start: pub.publishDate,
                    type: pub.type || 'text',
                    imageUrl: pub.imageUrl || null,
                    vignetteUrl: pub.vignetteUrl || null
                };
            });

            console.log(`✅ [Calendar] ${formattedPublications.length} publications formatées`);
            
            // Debug: afficher les publications avec images (URL complète)
            const imagePubs = formattedPublications.filter(p => p.type === 'image' || p.imageUrl);
            if (imagePubs.length > 0) {
                console.log('🖼️ [Calendar] Publications avec images chargées:', imagePubs.map(p => ({ id: p.id, title: p.title, type: p.type, imageUrl: p.imageUrl })));
            }

            setSavedPublications(formattedPublications);
            console.log('💾 [Calendar] savedPublications mis à jour');
        } catch (error) {
            console.error('❌ [Calendar] Erreur chargement publications (API):', error);
        } finally {
            setIsLoadingPublications(false);
        }
    }, []);
    
    useEffect(() => {
        // Chargement initial
        loadPublicationsFromApi();

        // NOUVEAU : Charger les modules utilisateur
        try {
            const savedModules = localStorage.getItem('userModules');
            if (savedModules) {
                setUserModules(JSON.parse(savedModules));
            }
        } catch (error) { console.error('Erreur chargement modules:', error); }
        
        // Rafraîchissement automatique toutes les 30 secondes (silencieux)
        const refreshInterval = setInterval(() => {
            loadPublicationsFromApi(false);
        }, 30000);
        
        return () => clearInterval(refreshInterval);
    }, [loadPublicationsFromApi]);

    // --- Traitement des images envoyées depuis Home ---
    useEffect(() => {
        // Vérifier si une image a été envoyée depuis Home
        if (location.state && location.state.imageToSchedule) {
            const imageData = location.state.imageToSchedule;
            setScheduleData({
                title: imageData.title || `Image - ${new Date().toLocaleDateString('fr-FR')}`,
                content: '', // Ne pas inclure le prompt dans la description
                imageUrl: imageData.imageUrl,
                vignetteUrl: imageData.vignetteUrl || imageData.imageUrl,
                publishDate: new Date().toISOString().split('T')[0],
                publishTime: '09:00',
                platforms: imageData.platforms || ['instagram', 'facebook'],
                status: 'scheduled',
                type: 'image'
            });
            setShowScheduleModal(true);
        }
        
        // Vérifier aussi le localStorage
        const pendingImage = localStorage.getItem('pendingCalendarImage');
        if (pendingImage && !location.state?.imageToSchedule) {
            try {
                const imageData = JSON.parse(pendingImage);
                setScheduleData({
                    title: imageData.title || `Image - ${new Date().toLocaleDateString('fr-FR')}`,
                    content: '', // Ne pas inclure le prompt dans la description
                    imageUrl: imageData.imageUrl,
                    vignetteUrl: imageData.vignetteUrl || imageData.imageUrl,
                    publishDate: new Date().toISOString().split('T')[0],
                    publishTime: '09:00',
                    platforms: imageData.platforms || ['instagram', 'facebook'],
                    status: 'scheduled',
                    type: 'image'
                });
                setShowScheduleModal(true);
                localStorage.removeItem('pendingCalendarImage');
            } catch (e) {
                console.error('Erreur parsing pendingCalendarImage:', e);
            }
        }
    }, [location.state]);

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

            // Persister en base (MySQL) via API
            (async () => {
                try {
                    await publicationsApi.reschedule(postId, newDate);
                } catch (error) {
                    console.error('Erreur replanification publication (API):', error);
                    alert('Erreur lors de la replanification. Veuillez recharger la page.');
                }
            })();
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

    // NOUVEAU : Fonctions pour le redimensionnement de la sidebar
    const handleMouseDown = (e) => {
        e.preventDefault();
        setIsResizing(true);
    };

    useEffect(() => {
        const handleMouseMove = (e) => {
            if (!isResizing) return;
            const newWidth = Math.max(200, Math.min(500, e.clientX));
            setSidebarWidth(newWidth);
        };

        const handleMouseUp = () => {
            setIsResizing(false);
        };

        if (isResizing) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
        }

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isResizing]);

    // NOUVEAU : Fonction pour ouvrir une publication existante dans le modal
    const handleOpenPublication = (publication) => {
        setSelectedPost({
            id: publication.id,
            title: publication.title,
            content: publication.content,
            platforms: publication.platforms || ['website'],
            status: publication.status,
            start: publication.start
        });
        
        const pubDate = new Date(publication.start);
        setScheduleData({
            title: publication.title,
            content: normalizeForTextarea(publication.content || ''),
            publishDate: pubDate.toISOString().split('T')[0],
            publishTime: pubDate.toTimeString().slice(0, 5),
            platforms: publication.platforms || ['website'],
            status: publication.status || 'scheduled',
            type: publication.type || 'text',
            imageUrl: publication.imageUrl || null,
            vignetteUrl: publication.vignetteUrl || null
        });
        
        setShowPublicationsModal(false);
        setShowScheduleModal(true);
    };

    // NOUVEAU : Fonction pour insérer une nouvelle publication
    const handleInsertPublication = () => {
        setSelectedPost(null);
        setScheduleData({
            title: '',
            content: '',
            publishDate: new Date().toISOString().split('T')[0],
            publishTime: '09:00',
            platforms: ['website'],
            status: 'draft',
            type: 'text'
        });
        setShowScheduleModal(true);
    };

    // NOUVEAU : Fonction pour gérer la sélection/désélection pour suppression
    const togglePublicationSelection = (pubId, e) => {
        e.stopPropagation(); // Empêcher l'ouverture du modal de planification
        setSelectedForDeletion(prev => {
            const newSet = new Set(prev);
            if (newSet.has(pubId)) {
                newSet.delete(pubId);
            } else {
                newSet.add(pubId);
            }
            return newSet;
        });
    };

    // NOUVEAU : Fonction pour supprimer les publications sélectionnées
    const handleDeleteSelectedPublications = async () => {
        if (selectedForDeletion.size === 0) {
            alert('Veuillez sélectionner au moins une publication à supprimer.');
            return;
        }

        const confirmDelete = window.confirm(
            `Êtes-vous sûr de vouloir supprimer ${selectedForDeletion.size} publication(s) ?\n\nCette action est irréversible.`
        );

        if (!confirmDelete) return;

        setIsDeletingPublications(true);

        try {
            const deletePromises = Array.from(selectedForDeletion).map(id => 
                publicationsApi.delete(id)
            );
            
            await Promise.all(deletePromises);

            // Recharger les publications
            const refreshed = await publicationsApi.getAll();
            const publications = refreshed?.data || [];
            const formattedPublications = publications.map(pub => {
                let platformsArray = pub.platforms || ['website'];
                if (typeof platformsArray === 'string') {
                    try { platformsArray = JSON.parse(platformsArray); } catch { platformsArray = [platformsArray]; }
                }
                if (!Array.isArray(platformsArray)) platformsArray = ['website'];
                
                return {
                    id: String(pub.id),
                    title: pub.title,
                    content: pub.content,
                    platforms: platformsArray,
                    status: pub.status || 'draft',
                    start: pub.publishDate,
                    type: pub.type || 'text',
                    imageUrl: pub.imageUrl || null,
                    vignetteUrl: pub.vignetteUrl || null
                };
            });
            setSavedPublications(formattedPublications);
            setSelectedForDeletion(new Set());

            alert(`✅ ${selectedForDeletion.size} publication(s) supprimée(s) avec succès.`);
        } catch (error) {
            console.error('Erreur suppression publications:', error);
            alert(`❌ Erreur lors de la suppression: ${error.message}`);
        } finally {
            setIsDeletingPublications(false);
        }
    };

    // NOUVEAU : Fonction pour supprimer une publication individuelle depuis le modal de modification
    const handleDeleteCurrentPublication = async () => {
        if (!selectedPost?.id) {
            alert('Aucune publication sélectionnée.');
            return;
        }

        const confirmDelete = window.confirm(
            `Êtes-vous sûr de vouloir supprimer la publication "${selectedPost.title || 'Sans titre'}" ?\n\nCette action est irréversible.`
        );

        if (!confirmDelete) return;

        setIsSavingSchedule(true);

        try {
            await publicationsApi.delete(selectedPost.id);

            // Recharger les publications
            const refreshed = await publicationsApi.getAll();
            const publications = refreshed?.data || [];
            const formattedPublications = publications.map(pub => {
                let platformsArray = pub.platforms || ['website'];
                if (typeof platformsArray === 'string') {
                    try { platformsArray = JSON.parse(platformsArray); } catch { platformsArray = [platformsArray]; }
                }
                if (!Array.isArray(platformsArray)) platformsArray = ['website'];
                
                return {
                    id: String(pub.id),
                    title: pub.title,
                    content: pub.content,
                    platforms: platformsArray,
                    status: pub.status || 'draft',
                    start: pub.publishDate,
                    type: pub.type || 'text',
                    imageUrl: pub.imageUrl || null,
                    vignetteUrl: pub.vignetteUrl || null
                };
            });
            setSavedPublications(formattedPublications);

            setShowScheduleModal(false);
            setSelectedPost(null);
            alert('✅ Publication supprimée avec succès.');
        } catch (error) {
            console.error('Erreur suppression publication:', error);
            alert(`❌ Erreur lors de la suppression: ${error.message}`);
        } finally {
            setIsSavingSchedule(false);
        }
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

    const handleScheduleSave = async () => {
        setIsSavingSchedule(true);
        
        const dateTime = `${scheduleData.publishDate}T${scheduleData.publishTime}:00`;
        // Si l'utilisateur a saisi du texte avec \n, reconvertir en <br> pour conserver la mise en forme HTML côté stockage
        const contentHtml = (scheduleData.content || '').replace(/\r?\n/g, '<br>');
        
        const newPost = {
            id: selectedPost?.id || Date.now(),
            title: scheduleData.title,
            content: contentHtml,
            platforms: scheduleData.platforms,
            status: scheduleData.status,
            start: dateTime,
            type: scheduleData.type || 'text',
            imageUrl: scheduleData.imageUrl || null,
            vignetteUrl: scheduleData.vignetteUrl || null
        };

        console.log('📅 [Calendar] handleScheduleSave - newPost:', newPost);
        console.log('📅 [Calendar] type:', newPost.type, 'imageUrl:', newPost.imageUrl?.substring(0, 50));

        try {
            if (selectedPost) {
                // Modifier une publication existante (MySQL)
                await publicationsApi.update(selectedPost.id, {
                    title: newPost.title,
                    content: contentHtml,
                    publishDate: dateTime,
                    platforms: newPost.platforms,
                    type: newPost.type,
                    imageUrl: newPost.imageUrl,
                    vignetteUrl: newPost.vignetteUrl
                });
                // DÉSACTIVÉ TEMPORAIREMENT : updateStatus cause ERR_HTTP2_PROTOCOL_ERROR
                // try {
                //     await publicationsApi.updateStatus(selectedPost.id, newPost.status, 'Planifiée depuis le calendrier');
                // } catch (statusError) {
                //     console.warn('⚠️ Mise à jour statut échouée (non bloquant):', statusError.message);
                // }
            } else {
                // Créer une nouvelle publication (MySQL)
                const created = await publicationsApi.create({
                    title: newPost.title,
                    content: contentHtml,
                    publishDate: dateTime,
                    platforms: newPost.platforms,
                    source: 'calendar',
                    type: newPost.type,
                    imageUrl: newPost.imageUrl,
                    vignetteUrl: newPost.vignetteUrl,
                    status: newPost.status // Inclure le statut directement
                });
                const createdId = created?.data?.id;
                // DÉSACTIVÉ TEMPORAIREMENT : updateStatus cause ERR_HTTP2_PROTOCOL_ERROR
                // if (createdId && newPost.status !== 'draft') {
                //     try {
                //         await publicationsApi.updateStatus(createdId, newPost.status, 'Planifiée depuis le calendrier');
                //     } catch (statusError) {
                //         console.warn('⚠️ Mise à jour statut échouée (non bloquant):', statusError.message);
                //     }
                // }
            }

            // Recharger depuis l'API pour resynchroniser l'affichage
            const refreshed = await publicationsApi.getAll();
            const publications = refreshed?.data || [];
            const formattedPublications = publications.map(pub => ({
                id: String(pub.id),
                title: pub.title,
                content: pub.content,
                platforms: pub.platforms || ['website'],
                status: pub.status || 'draft',
                start: pub.publishDate,
                type: pub.type || 'text',
                imageUrl: pub.imageUrl || null,
                vignetteUrl: pub.vignetteUrl || null
            }));
            setSavedPublications(formattedPublications);

            // Si wixblog est coché, publier automatiquement sur Wix Blog
            if (newPost.platforms.includes('wixblog')) {
                await handlePublishToWixBlog(newPost);
            }

        } catch (error) {
            console.error('Erreur sauvegarde/planification (API):', error);
            alert(`Erreur lors de la sauvegarde/planification.\n\nDétails: ${error.message}\n\nVeuillez réessayer.`);
            setIsSavingSchedule(false);
            return;
        }

        setIsSavingSchedule(false);
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

    // Fonction pour publier sur Wix Blog (déclenchée lors de la sauvegarde si wixblog est coché)
    const handlePublishToWixBlog = async (publication) => {
        try {
            // Récupérer les clés API Wix depuis localStorage
            const storedKeys = localStorage.getItem('network_api_keys');
            const apiKeys = storedKeys ? JSON.parse(storedKeys) : {};
            const wixSecret = apiKeys.wixBlog;

            if (!wixSecret) {
                console.warn('Clé API Wix Blog manquante, publication ignorée');
                return;
            }

            // Parser l'App ID et App Secret (format: appId:appSecret ou juste appSecret)
            let appId = 'f6f2c365-e2e2-4258-8510-196a09afff36'; // ID par défaut
            let appSecret = wixSecret;
            
            if (wixSecret.includes(':')) {
                const parts = wixSecret.split(':');
                appId = parts[0];
                appSecret = parts[1];
            }

            // Préparer les données de publication
            const publicationData = {
                title: publication.title || 'Sans titre',
                content: normalizeForTextarea(publication.content || ''),
                imageUrl: publication.imageUrl || null
            };

            const credentials = {
                appId,
                appSecret
            };

            const options = {
                publish: true // Publier directement
            };

            // Appeler l'API Wix Blog
            const result = await wixBlogApi.publishPost(publicationData, credentials, options);

            if (result.success) {
                console.log('✅ Publication Wix Blog réussie:', result.postUrl);
            } else {
                throw new Error(result.message || 'Erreur inconnue');
            }

        } catch (error) {
            console.error('❌ Erreur publication Wix Blog:', error);
            alert(`❌ Erreur lors de la publication sur Wix Blog\n\n${error.message || error}\n\nVérifiez vos clés API dans la page "Réseaux API".`);
        }
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
        const sourceClass = source?.id === 'local-file-source' ? 'source-local' : '';
        const time = new Date(start).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
        const isImagePost = post.type === 'image' || post.imageUrl;
        
        // S'assurer que platforms est un tableau
        let platforms = post.platforms || ['website'];
        if (typeof platforms === 'string') {
            try { platforms = JSON.parse(platforms); } catch { platforms = [platforms]; }
        }
        if (!Array.isArray(platforms)) platforms = ['website'];

        return (
            <div className={`post-card status-${post.status} ${sourceClass}`}>
                <div className="post-card-header">
                    <div className="post-card-platforms">
                        {platforms.map(p => renderPlatformIconInCard(p))}
                    </div>
                    <div className="post-card-time">{time}</div>
                </div>
                <div className="post-card-title">{title}</div>
                {isImagePost && post.imageUrl ? (
                    <div className="post-card-image" style={{ marginTop: '4px' }}>
                        <img 
                            src={post.vignetteUrl || post.imageUrl} 
                            alt={title}
                            style={{ 
                                width: '100%', 
                                height: '60px', 
                                objectFit: 'cover', 
                                borderRadius: '4px' 
                            }}
                            onError={(e) => { e.target.style.display = 'none'; }}
                        />
                    </div>
                ) : (
                    <div className="post-card-content">{post.content?.substring(0, 40)}...</div>
                )}
            </div>
        );
    };

    // --- JSX : La structure de la page ---
    return (
        <div className="calendar-layout">
            {/* Bouton hamburger pour ouvrir la sidebar (mobile/tablette) */}
            <button 
                className="sidebar-toggle-btn"
                onClick={() => setIsSidebarOpen(true)}
                aria-label="Ouvrir le menu"
            >
                <i className="fas fa-bars"></i>
            </button>
            
            {/* Overlay sombre quand sidebar ouverte (mobile/tablette) */}
            <div 
                className={`sidebar-overlay ${isSidebarOpen ? 'visible' : ''}`}
                onClick={() => setIsSidebarOpen(false)}
            />
            
            {/* Colonne de Filtres (Sidebar) - REDIMENSIONNABLE */}
            <div 
                className={`filter-sidebar ${isSidebarOpen ? 'open' : ''}`}
                ref={sidebarRef}
                style={{ width: `${sidebarWidth}px`, minWidth: '200px', maxWidth: '500px' }}
            >
                <div className="sidebar-content">
                    {/* SECTION PRINCIPALE : Actions rapides */}
                    <div className="actions-section">
                        <h2><i className="fas fa-bolt"></i> Actions</h2>
                        
                        {/* Bouton Nouvelle Publication */}
                        <button className="action-button primary" onClick={handleInsertPublication}>
                            <i className="fas fa-plus-circle"></i> Nouvelle publication
                        </button>
                        
                        {/* Bouton Ouvrir une publication */}
                        <button className="action-button" onClick={() => setShowPublicationsModal(true)}>
                            <i className="fas fa-folder-open"></i> Ouvrir une publication
                        </button>
                        
                        {/* Menu déroulant Créer Séquence */}
                        <div className="sequence-dropdown">
                            <button 
                                className="action-button dropdown-toggle" 
                                onClick={() => setShowSequenceMenu(!showSequenceMenu)}
                            >
                                <i className="fas fa-layer-group"></i> Créer Séquence
                                <i className={`fas fa-chevron-${showSequenceMenu ? 'up' : 'down'} dropdown-arrow`}></i>
                            </button>
                            
                            {showSequenceMenu && (
                                <div className="sequence-menu">
                                    <div className="form-group">
                                        <label>{t('sidebar.modulesLabel')}</label>
                                        <div className="modules-selection">
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
                                        <button className="btn-add-module-small" onClick={handleOpenModuleModal}>
                                            <i className="fas fa-plus"></i> Ajouter module
                                        </button>
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
                                        <i className="fas fa-calendar-plus"></i> {t('buttons.createAndSchedule')}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* SECTION Import/Export */}
                    <div className="io-section">
                        <input type="file" ref={fileInputRef} onChange={handleFileImport} accept=".json" style={{ display: 'none' }} />
                        <button className="action-button" onClick={() => fileInputRef.current.click()}>
                            <i className="fas fa-cloud-upload-alt"></i> Importer JSON
                        </button>
                        <button className="action-button" onClick={handleExport}>
                            <i className="fas fa-download"></i> Exporter JSON
                        </button>
                    </div>

                    {/* SECTION Filtres par plateforme */}
                    <div className="platforms-section">
                        <h2><i className="fas fa-filter"></i> {t('sidebar.platformsTitle')}</h2>
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
                </div>
                
                {/* Poignée de redimensionnement */}
                <div 
                    className="sidebar-resizer"
                    onMouseDown={handleMouseDown}
                    style={{
                        position: 'absolute',
                        right: 0,
                        top: 0,
                        bottom: 0,
                        width: '5px',
                        cursor: 'col-resize',
                        background: isResizing ? '#007bff' : 'transparent'
                    }}
                />
            </div>

            {/* Zone du Calendrier */}
            <div className="calendar-container" style={{ position: 'relative' }}>
                {isLoadingPublications && (
                    <div style={{
                        position: 'fixed',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        background: 'linear-gradient(135deg, #ff6b35 0%, #ff8c42 100%)',
                        padding: '40px',
                        borderRadius: '20px',
                        boxShadow: '0 8px 32px rgba(255, 107, 53, 0.4)',
                        zIndex: 10000,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <i className="fas fa-spinner fa-spin" style={{
                            fontSize: '64px',
                            color: 'white'
                        }}></i>
                    </div>
                )}
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
                        { id: 'main-source', events: mainPosts.filter(p => Array.isArray(p.platforms) && p.platforms.some(pf => activeFilters.has(pf))) },
                        { id: 'local-file-source', events: localPosts.filter(p => Array.isArray(p.platforms) && p.platforms.some(pf => activeFilters.has(pf))) },
                        { id: 'saved-publications', events: savedPublications.filter(p => Array.isArray(p.platforms) && p.platforms.some(pf => activeFilters.has(pf))) }
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
                            {/* Ligne horizontale : Titre à gauche + Image à droite */}
                            <div style={{ display: 'flex', gap: '20px', marginBottom: '15px' }}>
                                {/* Titre à gauche */}
                                <div className="form-group" style={{ flex: scheduleData.type === 'image' && scheduleData.imageUrl ? '1' : '1', marginBottom: 0 }}>
                                    <label>{t('modals.schedule.titleLabel')}</label>
                                    <input
                                        type="text"
                                        value={scheduleData.title}
                                        onChange={(e) => setScheduleData({...scheduleData, title: e.target.value})}
                                        placeholder={t('modals.schedule.titlePlaceholder')}
                                    />
                                </div>

                                {/* Image à droite (si type image) */}
                                {scheduleData.type === 'image' && scheduleData.imageUrl && (
                                    <div className="form-group image-preview-section" style={{ width: '250px', flexShrink: 0, marginBottom: 0 }}>
                                        <label>Image à publier</label>
                                        <div style={{ 
                                            textAlign: 'center', 
                                            padding: '10px', 
                                            background: '#f5f5f5', 
                                            borderRadius: '8px',
                                            border: '1px solid #ddd'
                                        }}>
                                            <a href={scheduleData.imageUrl} target="_blank" rel="noopener noreferrer">
                                                <img 
                                                    src={scheduleData.vignetteUrl || scheduleData.imageUrl} 
                                                    alt="Image à publier"
                                                    style={{ 
                                                        maxWidth: '100%', 
                                                        maxHeight: '150px', 
                                                        borderRadius: '8px',
                                                        cursor: 'pointer'
                                                    }}
                                                />
                                            </a>
                                            <div style={{ fontSize: '11px', color: '#666', marginTop: '5px' }}>
                                                Cliquer pour voir en taille réelle
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="form-group content-section">
                                <label>{scheduleData.type === 'image' ? 'Légende / Description' : t('modals.schedule.contentLabel')}</label>
                                <textarea
                                    value={normalizeForTextarea(scheduleData.content)}
                                    onChange={(e) => setScheduleData({...scheduleData, content: e.target.value})}
                                    placeholder={scheduleData.type === 'image' ? 'Légende de l\'image...' : t('modals.schedule.contentPlaceholder')}
                                    rows={scheduleData.type === 'image' ? 4 : 14}
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

                        <div className="modal-footer" style={{ justifyContent: 'space-between' }}>
                            <div>
                                {selectedPost && (
                                    <button 
                                        className="btn-delete" 
                                        onClick={handleDeleteCurrentPublication}
                                        disabled={isSavingSchedule}
                                        style={{ 
                                            background: '#dc3545', 
                                            color: 'white', 
                                            border: 'none',
                                            padding: '10px 20px',
                                            borderRadius: '6px',
                                            cursor: isSavingSchedule ? 'wait' : 'pointer',
                                            opacity: isSavingSchedule ? 0.7 : 1
                                        }}
                                    >
                                        <i className="fas fa-trash" style={{ marginRight: '8px' }}></i>
                                        Supprimer
                                    </button>
                                )}
                            </div>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button className="btn-cancel" onClick={handleScheduleCancel} disabled={isSavingSchedule}>
                                    {t('modals.schedule.cancelButton')}
                                </button>
                                <button 
                                    className="btn-save" 
                                    onClick={handleScheduleSave}
                                    disabled={isSavingSchedule}
                                    style={{ opacity: isSavingSchedule ? 0.7 : 1 }}
                                >
                                    {isSavingSchedule ? (
                                        <>
                                            <i className="fas fa-spinner fa-spin" style={{ marginRight: '8px' }}></i>
                                            Enregistrement...
                                        </>
                                    ) : (
                                        selectedPost ? t('modals.schedule.editButton') : t('modals.schedule.scheduleButton')
                                    )}
                                </button>
                            </div>
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
        
        {/* NOUVEAU : Modal pour ouvrir une publication existante */}
        {showPublicationsModal && (
            <div className="schedule-modal-overlay" onClick={() => { setShowPublicationsModal(false); setSelectedForDeletion(new Set()); }}>
                <div className="schedule-modal publications-modal" onClick={(e) => e.stopPropagation()}>
                    <div className="modal-header">
                        <h3><i className="fas fa-folder-open"></i> Publications ({savedPublications.length})</h3>
                        <button className="modal-close" onClick={() => { setShowPublicationsModal(false); setSelectedForDeletion(new Set()); }}>×</button>
                    </div>
                    <div className="modal-body">
                        {/* Barre d'actions si des publications sont sélectionnées */}
                        {selectedForDeletion.size > 0 && (
                            <div style={{ 
                                padding: '10px 15px', 
                                background: '#fff3cd', 
                                borderRadius: '6px', 
                                marginBottom: '10px',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}>
                                <span><strong>{selectedForDeletion.size}</strong> publication(s) sélectionnée(s)</span>
                                <button 
                                    onClick={handleDeleteSelectedPublications}
                                    disabled={isDeletingPublications}
                                    style={{ 
                                        background: '#dc3545', 
                                        color: 'white', 
                                        border: 'none', 
                                        padding: '8px 16px', 
                                        borderRadius: '4px',
                                        cursor: isDeletingPublications ? 'wait' : 'pointer',
                                        opacity: isDeletingPublications ? 0.7 : 1
                                    }}
                                >
                                    {isDeletingPublications ? (
                                        <><i className="fas fa-spinner fa-spin"></i> Suppression...</>
                                    ) : (
                                        <><i className="fas fa-trash"></i> Supprimer</>
                                    )}
                                </button>
                            </div>
                        )}
                        <div className="publications-list">
                            {savedPublications.length === 0 ? (
                                <div className="no-publications">
                                    <i className="fas fa-inbox"></i>
                                    <p>Aucune publication enregistrée</p>
                                </div>
                            ) : (
                                savedPublications.map(pub => {
                                    const platforms = Array.isArray(pub.platforms) ? pub.platforms : [];
                                    let dateStr = 'Date inconnue';
                                    try { if (pub.start) dateStr = new Date(pub.start).toLocaleDateString('fr-FR'); } catch {}
                                    
                                    return (
                                        <div 
                                            key={pub.id} 
                                            className={`publication-item status-${pub.status || 'draft'} ${selectedForDeletion.has(pub.id) ? 'selected-for-deletion' : ''}`}
                                            onClick={() => handleOpenPublication(pub)}
                                        >
                                            {/* Checkbox de sélection */}
                                            <input 
                                                type="checkbox"
                                                className="publication-checkbox"
                                                checked={selectedForDeletion.has(pub.id)}
                                                onChange={(e) => togglePublicationSelection(pub.id, e)}
                                                onClick={(e) => e.stopPropagation()}
                                            />
                                            <div className="publication-item-header">
                                                {pub.type === 'image' && (pub.vignetteUrl || pub.imageUrl) && (
                                                    <img 
                                                        src={pub.vignetteUrl || pub.imageUrl} 
                                                        alt={pub.title}
                                                        className="publication-thumbnail"
                                                        onError={(e) => { e.target.style.display = 'none'; }}
                                                    />
                                                )}
                                                <div className="publication-info">
                                                    <div className="publication-title">{pub.title || 'Sans titre'}</div>
                                                    <div className="publication-meta">
                                                        <span className={`status-badge ${pub.status || 'draft'}`}>
                                                            {pub.status === 'published' ? 'Publié' : 
                                                             pub.status === 'scheduled' ? 'Planifié' : 'Brouillon'}
                                                        </span>
                                                        <span className="publication-date">{dateStr}</span>
                                                    </div>
                                                    <div className="publication-platforms">
                                                        {platforms.map((p, idx) => (
                                                            <span key={`${pub.id}-${p}-${idx}`} className="platform-tag">{p}</span>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button className="btn-cancel" onClick={() => { setShowPublicationsModal(false); setSelectedForDeletion(new Set()); }}>
                            Fermer
                        </button>
                    </div>
                </div>
            </div>
        )}
    </div>
    );
};

export default ContentCalendar;
