const HelpModal = ({ onClose }) => {
  return (
    <div className="help-modal" id="helpModal">
      <div className="help-modal-content">
        <div className="help-modal-header">
          <h2>Guide d'utilisation - Assistant Rédactionnel</h2>
          <button className="close-modal" onClick={onClose}>&times;</button>
        </div>
        <div className="help-content">
          <h3>🎯 Fonctionnalités principales</h3>
          <p><strong>Menu amovible :</strong> Survolez le haut de l'écran pour accéder aux fonctions avancées (jour/nuit, sauvegarde, historique, etc.)</p>
          
          <h3>📝 Informations du projet</h3>
          <p>Remplissez soigneusement tous les champs pour optimiser la génération de contenu :</p>
          <ul>
            <li><strong>Titre :</strong> Nom descriptif pour organiser vos projets</li>
            <li><strong>Public cible :</strong> Décrivez précisément votre audience</li>
            <li><strong>Mots-clés :</strong> Termes importants à inclure</li>
            <li><strong>Ton :</strong> Style de communication souhaité</li>
            <li><strong>Description :</strong> Contexte détaillé du projet</li>
          </ul>

          <h3>🤖 Sélection de l'IA</h3>
          <p>Choisissez l'IA la plus adaptée à votre besoin :</p>
          <ul>
            <li><strong>Claude :</strong> Excellent pour l'analyse et la rédaction créative</li>
            <li><strong>GPT-4 :</strong> Polyvalent, idéal pour la plupart des tâches</li>
            <li><strong>Gemini :</strong> Performant pour la recherche et l'analyse</li>
            <li><strong>ElevenLabs :</strong> Spécialisé dans la génération audio</li>
          </ul>

          <h3>📱 Types de média et formats</h3>
          <p>Sélectionnez le type de contenu puis le format de sortie souhaité. L'interface propose des templates optimisés pour chaque plateforme sociale.</p>

          <h3>⚙️ Fonctions avancées</h3>
          <ul>
            <li><strong>Panel Admin :</strong> Interface complète de gestion administrative</li>
            <li><strong>Config API :</strong> Configurez vos clés d'API pour les différentes plateformes</li>
            <li><strong>Calendrier :</strong> Planifiez vos publications</li>
            <li><strong>Historique :</strong> Retrouvez vos créations précédentes</li>
            <li><strong>Analyse :</strong> Obtenez des statistiques sur vos contenus</li>
          </ul>

          <h3>💡 Conseils d'utilisation</h3>
          <p>Pour de meilleurs résultats :</p>
          <ul>
            <li>Soyez précis dans vos descriptions</li>
            <li>Utilisez les infobulles pour comprendre chaque champ</li>
            <li>Testez différentes combinaisons de tâches</li>
            <li>Sauvegardez régulièrement vos projets</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default HelpModal;