import { useAssistantAutoSave } from '../hooks/useLocalStorage';
import { getHomeText } from '../i18n/homeTranslations';

const OutputFormats = ({ selectedFormats, onFormatToggle }) => {
  const { autoSaveData } = useAssistantAutoSave();
  const userLanguage = autoSaveData.language || 'fr';
  const t = (path) => getHomeText(userLanguage, path);
  const formatGroups = [
    {
      title: t('sections.outputFormat.groups.social'),
      icon: 'fas fa-share-alt',
      formats: [
        { id: 'post-facebook', name: 'Facebook', icon: 'facebook', type: 'image', description: 'Publication Facebook optimisée' },
        { id: 'post-instagram', name: 'Instagram', icon: 'instagram', type: 'image', description: 'Post Instagram avec hashtags' },
        { id: 'post-x', name: 'X', icon: 'twitter', type: 'image', description: 'Tweet optimisé pour X (Twitter)' },
        { id: 'post-linkedin', name: 'LinkedIn', icon: 'linkedin', type: 'image', description: 'Publication LinkedIn professionnelle' },
        { id: 'video-youtube', name: 'YouTube', icon: 'youtube', type: 'image', description: 'Description vidéo YouTube' },
        { id: 'video-tiktok', name: 'TikTok', icon: 'tiktok', type: 'image', description: 'Contenu TikTok viral' }
      ]
    },
    {
      title: t('sections.outputFormat.groups.communicate'),
      icon: 'fas fa-bullhorn',
      formats: [
        { id: 'newsletter', name: 'Newsletter', icon: 'fas fa-envelope', type: 'icon', description: 'Newsletter email marketing' },
        { id: 'story', name: 'Story', icon: 'fas fa-camera', type: 'icon', description: 'Story Instagram/Facebook' },
        { id: 'reel', name: 'Reel', icon: 'fas fa-video', type: 'icon', description: 'Reel Instagram court' },
        { id: 'carousel', name: 'Carrousel', icon: 'fas fa-images', type: 'icon', description: 'Carrousel multi-images' },
        { id: 'my-blog', name: 'Mon Blog', icon: 'fas fa-blog', type: 'icon', description: 'Article de blog personnel' },
        { id: 'my-website', name: 'Mon Site', icon: 'fas fa-globe', type: 'icon', description: 'Contenu pour site web' }
      ]
    },
    {
      title: t('sections.outputFormat.groups.write'),
      icon: 'fas fa-pen-fancy',
      formats: [
        { id: 'dialogue', name: 'Dialogue', icon: 'fas fa-comments', type: 'icon', description: 'Dialogue conversationnel' },
        { id: 'litteraire', name: 'Littéraire', icon: 'fas fa-book', type: 'icon', description: 'Texte littéraire élaboré' },
        { id: 'arguments', name: 'Arguments commerciaux', icon: 'fas fa-bullhorn', type: 'icon', description: 'Arguments de vente persuasifs' },
        { id: 'explicatifs', name: 'Textes explicatifs', icon: 'fas fa-info-circle', type: 'icon', description: 'Textes pédagogiques clairs' }
      ]
    }
  ];

  const handleFormatToggle = (formatId) => {
    onFormatToggle(formatId);
  };

  return (
    <div className="section">
      <h3 className="section-title">
        <i className="fas fa-share-alt"></i>
        {t('sections.outputFormat.title')}
      </h3>
      
      {formatGroups.map((group, groupIndex) => (
        <div key={groupIndex} className="format-section-group">
          <h4 className="format-section-title">
            <i className={group.icon}></i>
            {group.title}
          </h4>
          
          <div className="format-grid-zone">
            {group.formats.map((format) => (
              <button
                key={format.id}
                className={`format-btn-original ${selectedFormats.includes(format.id) ? 'selected' : ''}`}
                onClick={() => handleFormatToggle(format.id)}
                data-format={format.id}
              >
                {format.type === 'image' ? (
                  <img src={`/icons/${format.icon}.ico`} alt={format.name}
                       onError={(e) => {
                         e.target.style.display = 'none';
                         const fallback = document.createElement('i');
                         fallback.className = `fab fa-${format.icon}`;
                         e.target.parentNode.insertBefore(fallback, e.target.nextSibling);
                       }}
                  />
                ) : (
                  <i className={format.icon}></i>
                )}
                <span>{format.name}</span>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default OutputFormats;