const DictationStatus = ({ onStop }) => {
  return (
    <div className="dictation-status show" onClick={onStop}>
      🎙️ Dictée en cours... Parlez maintenant
    </div>
  );
};

export default DictationStatus;