import React from 'react';

const ConfigAPIPageSimple = () => {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'white',
      color: 'black',
      padding: '20px',
      fontSize: '24px',
      zIndex: 9999
    }}>
      <h1>🔴 TEST: ConfigAPIPage Simple fonctionne !</h1>
      <p>Si vous voyez ce message, le routage fonctionne.</p>
      <p>Le problème est dans le composant ConfigAPIPage original.</p>
    </div>
  );
};

export default ConfigAPIPageSimple;
