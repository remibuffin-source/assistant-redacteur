const AISelection = ({ selectedAI, onAISelect }) => {
  const aiOptions = [
    {
      id: 'claude',
      name: 'Claude',
      icon: 'claude',
      description: 'Assistant conversationnel avancé'
    },
    {
      id: 'gpt4',
      name: 'GPT-4',
      icon: 'gpt4',
      description: 'Modèle de langage puissant'
    },
    {
      id: 'gemini',
      name: 'Gemini',
      icon: 'gemini',
      description: 'IA générative Google'
    },
    {
      id: 'elevenlabs',
      name: 'ElevenLabs',
      icon: 'elevenlabs',
      description: 'Synthèse vocale avancée'
    },
    {
      id: 'custom',
      name: 'Personnalisé',
      icon: 'custom',
      description: 'Configuration personnalisée'
    }
  ];

  const handleAISelect = (aiId) => {
    onAISelect(aiId);
  };

  return (
    <div className="section-compact ai-section">
      <h3 className="section-title-compact">
        <i className="fas fa-robot"></i>
        Sélection de l'IA
      </h3>
      
      <div className="ai-selection-grid">
        {aiOptions.map((ai) => (
          <div
            key={ai.id}
            className={`ai-btn-compact ${selectedAI === ai.id ? 'selected' : ''}`}
            onClick={() => handleAISelect(ai.id)}
            data-ai={ai.id}
          >
            <div className="ai-icon">
              <img
                src={`/icons/${ai.icon}.ico`}
                alt={ai.name}
                className="ai-icon-img"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'block';
                }}
              />
              <div className={`ai-icon-fallback ${ai.icon}`} style={{display: 'none'}}></div>
            </div>
            <div className="ai-check"></div>
            <div className="ai-label">{ai.name}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AISelection;