const RecordingStatus = ({ onStop }) => {
  return (
    <div className="recording-status show" onClick={onStop}>
      🎤 Enregistrement en cours... Cliquez pour arrêter
    </div>
  );
};

export default RecordingStatus;