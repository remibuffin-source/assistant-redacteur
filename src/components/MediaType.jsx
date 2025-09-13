const MediaType = ({ selectedMedia, onMediaSelect }) => {
  const mediaOptions = [
    {
      id: 'texte',
      name: 'Texte',
      icon: 'fas fa-align-left',
      description: 'Contenu textuel'
    },
    {
      id: 'image',
      name: 'Image',
      icon: 'fas fa-image',
      description: 'Contenu visuel'
    },
    {
      id: 'video',
      name: 'Vidéo',
      icon: 'fas fa-video',
      description: 'Contenu vidéo'
    },
    {
      id: 'audio',
      name: 'Audio',
      icon: 'fas fa-volume-up',
      description: 'Contenu audio'
    },
    {
      id: 'code',
      name: 'Code',
      icon: 'fas fa-code',
      description: 'Code source'
    }
  ];

  const handleMediaSelect = (mediaId) => {
    onMediaSelect(mediaId);
  };

  return (
    <div className="section-compact media-section">
      <h3 className="section-title-compact">
        <i className="fas fa-file-alt"></i>
        Type de média
      </h3>
      
      <div className="media-type-horizontal">
        {mediaOptions.map((media) => (
          <div
            key={media.id}
            className={`media-type-btn ${selectedMedia === media.id ? 'selected' : ''}`}
            onClick={() => handleMediaSelect(media.id)}
            title={media.description}
          >
            <i className={media.icon}></i>
            <span>{media.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MediaType;