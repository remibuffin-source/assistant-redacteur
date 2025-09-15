const OutputFormats = ({ selectedFormats, onFormatToggle }) => {
  const formatGroups = [
    {
      title: 'Réseaux sociaux',
      icon: 'fas fa-share-alt',
      formats: [
        { id: 'post-facebook', name: 'Facebook', icon: 'facebook', type: 'image' },
        { id: 'post-instagram', name: 'Instagram', icon: 'instagram', type: 'image' },
        { id: 'post-x', name: 'X', icon: 'twitter', type: 'image' },
        { id: 'post-linkedin', name: 'LinkedIn', icon: 'linkedin', type: 'image' },
        { id: 'video-youtube', name: 'YouTube', icon: 'youtube', type: 'image' },
        { id: 'video-tiktok', name: 'TikTok', icon: 'tiktok', type: 'image' }
      ]
    },
    {
      title: 'Communiquer',
      icon: 'fas fa-bullhorn',
      formats: [
        { id: 'newsletter', name: 'Newsletter', icon: 'fas fa-envelope', type: 'icon' },
        { id: 'story', name: 'Story', icon: 'fas fa-camera', type: 'icon' },
        { id: 'reel', name: 'Reel', icon: 'fas fa-video', type: 'icon' },
        { id: 'carousel', name: 'Carrousel', icon: 'fas fa-images', type: 'icon' },
        { id: 'my-blog', name: 'Mon Blog', icon: 'fas fa-blog', type: 'icon' },
        { id: 'my-website', name: 'Mon Site', icon: 'fas fa-globe', type: 'icon' }
      ]
    },
    {
      title: 'Écrire',
      icon: 'fas fa-pen-fancy',
      formats: [
        { id: 'dialogue', name: 'Dialogue', icon: 'fas fa-comments', type: 'icon' },
        { id: 'litteraire', name: 'Littéraire', icon: 'fas fa-book', type: 'icon' },
        { id: 'arguments', name: 'Arguments commerciaux', icon: 'fas fa-bullhorn', type: 'icon' },
        { id: 'explicatifs', name: 'Textes explicatifs', icon: 'fas fa-info-circle', type: 'icon' }
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
        Formats de sortie
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