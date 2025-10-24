import React, { useState } from 'react';

const SimplePreview = () => {
  const [elementPositions, setElementPositions] = useState({});
  const [draggedElement, setDraggedElement] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // Début du drag
  const handleMouseDown = (e, elementId) => {
    e.preventDefault();
    
    const element = document.getElementById(elementId);
    const rect = element.getBoundingClientRect();
    
    setDraggedElement(elementId);
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
    
    element.style.position = 'fixed';
    element.style.zIndex = '1000';
    element.style.cursor = 'grabbing';
  };

  // Mouvement pendant le drag
  const handleMouseMove = (e) => {
    if (!draggedElement) return;
    
    e.preventDefault();
    
    const element = document.getElementById(draggedElement);
    const newX = e.clientX - dragOffset.x;
    const newY = e.clientY - dragOffset.y;
    
    element.style.left = `${newX}px`;
    element.style.top = `${newY}px`;
    
    setElementPositions(prev => ({
      ...prev,
      [draggedElement]: { x: newX, y: newY }
    }));
  };

  // Fin du drag
  const handleMouseUp = () => {
    if (!draggedElement) return;
    
    const element = document.getElementById(draggedElement);
    element.style.cursor = 'grab';
    element.style.zIndex = '1';
    
    setDraggedElement(null);
  };

  return (
    <div 
      style={{
        width: '100vw',
        height: '100vh',
        backgroundColor: '#f0f0f0',
        position: 'relative',
        overflow: 'hidden'
      }}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      {/* Titre */}
      <div
        id="titre"
        onMouseDown={(e) => handleMouseDown(e, 'titre')}
        style={{
          position: elementPositions.titre ? 'fixed' : 'absolute',
          left: elementPositions.titre?.x || '50px',
          top: elementPositions.titre?.y || '50px',
          padding: '20px',
          backgroundColor: '#ff6b35',
          color: 'white',
          borderRadius: '8px',
          cursor: 'grab',
          fontSize: '24px',
          fontWeight: 'bold',
          userSelect: 'none'
        }}
      >
        📅 Mon Calendrier
      </div>

      {/* Case 1 */}
      <div
        id="case1"
        onMouseDown={(e) => handleMouseDown(e, 'case1')}
        style={{
          position: elementPositions.case1 ? 'fixed' : 'absolute',
          left: elementPositions.case1?.x || '100px',
          top: elementPositions.case1?.y || '150px',
          width: '100px',
          height: '100px',
          backgroundColor: '#4CAF50',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '8px',
          cursor: 'grab',
          fontSize: '18px',
          fontWeight: 'bold',
          userSelect: 'none'
        }}
      >
        1
      </div>

      {/* Case 2 */}
      <div
        id="case2"
        onMouseDown={(e) => handleMouseDown(e, 'case2')}
        style={{
          position: elementPositions.case2 ? 'fixed' : 'absolute',
          left: elementPositions.case2?.x || '220px',
          top: elementPositions.case2?.y || '150px',
          width: '100px',
          height: '100px',
          backgroundColor: '#2196F3',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '8px',
          cursor: 'grab',
          fontSize: '18px',
          fontWeight: 'bold',
          userSelect: 'none'
        }}
      >
        2
      </div>

      {/* Case 3 */}
      <div
        id="case3"
        onMouseDown={(e) => handleMouseDown(e, 'case3')}
        style={{
          position: elementPositions.case3 ? 'fixed' : 'absolute',
          left: elementPositions.case3?.x || '340px',
          top: elementPositions.case3?.y || '150px',
          width: '100px',
          height: '100px',
          backgroundColor: '#FF9800',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '8px',
          cursor: 'grab',
          fontSize: '18px',
          fontWeight: 'bold',
          userSelect: 'none'
        }}
      >
        3
      </div>

      {/* Boîte info */}
      <div
        id="info"
        onMouseDown={(e) => handleMouseDown(e, 'info')}
        style={{
          position: elementPositions.info ? 'fixed' : 'absolute',
          left: elementPositions.info?.x || '100px',
          top: elementPositions.info?.y || '300px',
          width: '200px',
          height: '120px',
          backgroundColor: '#9C27B0',
          color: 'white',
          padding: '15px',
          borderRadius: '8px',
          cursor: 'grab',
          userSelect: 'none'
        }}
      >
        <h3 style={{ margin: '0 0 10px 0', fontSize: '16px' }}>📋 Informations</h3>
        <p style={{ margin: '0', fontSize: '14px' }}>
          Cliquez et glissez pour déplacer les éléments
        </p>
      </div>

      {/* Formulaire */}
      <div
        id="form"
        onMouseDown={(e) => handleMouseDown(e, 'form')}
        style={{
          position: elementPositions.form ? 'fixed' : 'absolute',
          left: elementPositions.form?.x || '400px',
          top: elementPositions.form?.y || '300px',
          width: '250px',
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '8px',
          boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
          cursor: 'grab',
          userSelect: 'none'
        }}
      >
        <h3 style={{ margin: '0 0 15px 0', color: '#333' }}>✏️ Formulaire</h3>
        <input 
          type="text" 
          placeholder="Titre événement"
          style={{
            width: '100%',
            padding: '8px',
            marginBottom: '10px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            pointerEvents: 'none'
          }}
        />
        <textarea 
          placeholder="Description..."
          style={{
            width: '100%',
            height: '60px',
            padding: '8px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            resize: 'none',
            pointerEvents: 'none'
          }}
        />
      </div>

      {/* Instructions */}
      <div
        style={{
          position: 'fixed',
          bottom: '20px',
          left: '20px',
          padding: '15px',
          backgroundColor: 'rgba(0,0,0,0.8)',
          color: 'white',
          borderRadius: '8px',
          fontSize: '14px'
        }}
      >
        🖱️ <strong>Instructions :</strong> Cliquez et glissez les éléments pour les déplacer
      </div>
    </div>
  );
};

export default SimplePreview;
