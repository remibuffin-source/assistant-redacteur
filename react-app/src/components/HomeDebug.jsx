import React from 'react';

const HomeDebug = () => {
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
      <h1>🔴 DEBUG: Home fonctionne !</h1>
      <p>Si vous voyez ce message, React fonctionne.</p>
      <p>Heure: {new Date().toLocaleTimeString()}</p>
      <p>Le problème est probablement dans un des composants importés.</p>
    </div>
  );
};

export default HomeDebug;
