import React, { useState, useEffect, useRef } from 'react';
import './PreviewInterface.css';

const PreviewInterface = () => {
  const [dimensions, setDimensions] = useState({});
  const [showGrid, setShowGrid] = useState(true);
  const [selectedElement, setSelectedElement] = useState(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const [tooltip, setTooltip] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [draggedElement, setDraggedElement] = useState(null);
  const [showCodePanel, setShowCodePanel] = useState(false);
  const [codeSource, setCodeSource] = useState('');
  const [highlightedLines, setHighlightedLines] = useState([]);
  const [selectedCodeLines, setSelectedCodeLines] = useState([]);
  const [codeSearchTerm, setCodeSearchTerm] = useState('');
  const [codeScrollPosition, setCodeScrollPosition] = useState(0);

  useEffect(() => {
    const measureElements = () => {
      // Sélectionner tous les éléments déplaçables de la page Calendar
      const selectors = [
        '.calendar-header',
        '.calendar-control-box',
        '.control-section',
        '.publication-counters',
        '.counter-item',
        '.view-buttons',
        '.view-btn',
        '.calendar-navigation',
        '.calendar-grid',
        '.calendar-day',
        '.stat-card',
        '.header-actions',
        '.calendar-controls',
        '.view-controls',
        '.calendar-filters-inline',
        '.publications-list',
        '.timeline',
        '.modal-content',
        '.week-view',
        '.timeline-view',
        '.list-view',
        'h1', 'h2', 'h3', 'h4',
        'p', 'button:not(.preview-interface button)',
        '.calendar-nav',
        '.date-selector'
      ];
      
      const elements = document.querySelectorAll(selectors.join(', '));
      const newDimensions = {};

      elements.forEach((element, index) => {
        // Ignorer les éléments trop petits ou cachés
        const rect = element.getBoundingClientRect();
        if (rect.width < 10 || rect.height < 10) return;
        
        const computedStyle = window.getComputedStyle(element);

        newDimensions[`element_${index}`] = {
          width: rect.width,
          height: rect.height,
          top: rect.top,
          left: rect.left,
          className: element.className,
          tagName: element.tagName,
          padding: computedStyle.padding,
          margin: computedStyle.margin,
          border: computedStyle.border,
          element: element,
          id: element.id || `element_${index}`
        };
      });

      setDimensions(newDimensions);
    };

    measureElements();
    window.addEventListener('resize', measureElements);
    const interval = setInterval(measureElements, 1000);

    return () => {
      window.removeEventListener('resize', measureElements);
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    const handleClick = (e) => {
      if (!isSelecting) return;
      e.preventDefault();
      e.stopPropagation();

      const target = e.target;
      const rect = target.getBoundingClientRect();
      const computedStyle = window.getComputedStyle(target);

      setSelectedElement({
        element: target,
        tagName: target.tagName,
        className: target.className || 'no-class',
        id: target.id || 'no-id',
        width: rect.width,
        height: rect.height,
        top: rect.top,
        left: rect.left,
        padding: computedStyle.padding,
        margin: computedStyle.margin,
        border: computedStyle.border,
        backgroundColor: computedStyle.backgroundColor,
        color: computedStyle.color,
        fontSize: computedStyle.fontSize,
        position: computedStyle.position
      });

      setIsSelecting(false);
    };

    const handleMouseMove = (e) => {
      if (!isSelecting) return;
      const target = e.target;
      const rect = target.getBoundingClientRect();

      setTooltip({
        x: e.clientX + 10,
        y: e.clientY - 10,
        element: target,
        width: rect.width,
        height: rect.height
      });
    };

    if (isSelecting) {
      document.addEventListener('click', handleClick, true);
      document.addEventListener('mousemove', handleMouseMove);
      document.body.style.cursor = 'crosshair';
    } else {
      document.removeEventListener('click', handleClick, true);
      document.removeEventListener('mousemove', handleMouseMove);
      document.body.style.cursor = 'default';
      setTooltip(null);
    }

    return () => {
      document.removeEventListener('click', handleClick, true);
      document.removeEventListener('mousemove', handleMouseMove);
      document.body.style.cursor = 'default';
    };
  }, [isSelecting]);

  useEffect(() => {
    const handleMouseDown = (e, elementKey) => {
      if (!isEditMode) return;

      const element = dimensions[elementKey];
      if (!element) return;

      const rect = element.element.getBoundingClientRect();
      dragOffset.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };

      setDraggedElement(elementKey);
      setIsDragging(true);
      e.preventDefault();
      e.stopPropagation();
    };

    const handleMouseMove = (e) => {
      if (!isDragging || !draggedElement) return;

      const newX = Math.max(0, Math.min(window.innerWidth - 100, e.clientX - dragOffset.current.x));
      const newY = Math.max(0, Math.min(window.innerHeight - 100, e.clientY - dragOffset.current.y));

      setElementPositions(prev => ({
        ...prev,
        [draggedElement]: { x: newX, y: newY }
      }));

      const element = dimensions[draggedElement];
      if (element && element.element) {
        element.element.style.position = 'fixed';
        element.element.style.left = `${newX}px`;
        element.element.style.top = `${newY}px`;
        element.element.style.zIndex = '9999';
        element.element.style.cursor = 'grabbing';
        element.element.style.transform = 'scale(1.02)';
        element.element.style.boxShadow = '0 10px 30px rgba(0,0,0,0.3)';
        element.element.style.transition = 'none';
      }
    };

    const handleMouseUp = () => {
      if (isDragging && draggedElement) {
        const element = dimensions[draggedElement];
        if (element && element.element) {
          // Garder la position mais retirer les styles temporaires
          element.element.style.cursor = '';
          element.element.style.transform = '';
          element.element.style.boxShadow = '';
          element.element.style.transition = '';
        }
      }

      setIsDragging(false);
      setDraggedElement(null);
    };

    const handleElementClick = (e, elementKey) => {
      if (!isEditMode) return;
      e.preventDefault();
      e.stopPropagation();
      
      // Ajouter une poignée de déplacement temporaire
      const element = dimensions[elementKey];
      if (element && element.element) {
        handleMouseDown(e, elementKey);
      }
    };

    // Gestionnaires globaux pour le drag & drop et redimensionnement
    const handleGlobalMouseMove = (e) => {
      if (isResizing) {
        handleResizeMove(e);
      } else if (isDragging) {
        handleMouseMove(e);
      }
    };

    const handleGlobalMouseUp = (e) => {
      if (isResizing) {
        handleResizeEnd(e);
      } else if (isDragging) {
        handleMouseUp(e);
      }
    };

    if (isEditMode) {
      document.addEventListener('mousemove', handleGlobalMouseMove);
      document.addEventListener('mouseup', handleGlobalMouseUp);

      // Ajouter des gestionnaires d'événements directement aux éléments
      Object.keys(dimensions).forEach(key => {
        const element = dimensions[key];
        if (element && element.element) {
          // Style de base pour les éléments éditables
          element.element.style.cursor = isResizing ? 'default' : 'grab';
          element.element.style.border = selectedElementForEdit === key ? '3px solid #ff6b35' : '2px dashed #27ae60';
          element.element.style.position = 'relative';
          element.element.style.userSelect = 'none';
          
          // Ajouter les poignées de redimensionnement si l'élément est sélectionné
          if (selectedElementForEdit === key && !isResizing) {
            addResizeHandles(element.element, key);
          } else if (selectedElementForEdit !== key) {
            removeResizeHandles(element.element);
          }
          
          // Gestionnaires d'événements pour sélection et déplacement
          const handleElementMouseDown = (e) => {
            if (!isResizing && !e.target.classList.contains('resize-handle')) {
              handleElementClick(e, key);
            }
          };

          const handleElementClick = (e) => {
            if (!isResizing) {
              e.stopPropagation();
              handleElementSelect(key);
            }
          };
          
          element.element.addEventListener('mousedown', handleElementMouseDown);
          element.element.addEventListener('click', handleElementClick);
        }
      });
    } else {
      // Nettoyer les styles en mode prévisualisation
      Object.keys(dimensions).forEach(key => {
        const element = dimensions[key];
        if (element && element.element && !elementPositions[key] && !elementSizes[key]) {
          element.element.style.cursor = '';
          element.element.style.border = '';
          element.element.style.position = '';
          element.element.style.left = '';
          element.element.style.top = '';
          element.element.style.zIndex = '';
          element.element.style.userSelect = '';
          removeResizeHandles(element.element);
        }
      });
    }

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
      
      // Nettoyer les gestionnaires d'événements sur les éléments
      Object.keys(dimensions).forEach(key => {
        const element = dimensions[key];
        if (element && element.element) {
          element.element.removeEventListener('mousedown', handleElementClick);
          element.element.removeEventListener('click', handleElementSelect);
          removeResizeHandles(element.element);
        }
      });
    };
  }, [isEditMode, isDragging, draggedElement, dimensions, elementPositions, selectedElementForEdit, isResizing]);

  // Fonctions pour gérer les poignées de redimensionnement
  const addResizeHandles = (element, elementKey) => {
    // Supprimer les anciennes poignées
    removeResizeHandles(element);
    
    const handles = ['top-left', 'top-right', 'bottom-left', 'bottom-right', 'top', 'right', 'bottom', 'left'];
    
    handles.forEach(handle => {
      const handleElement = document.createElement('div');
      handleElement.className = `resize-handle resize-${handle}`;
      handleElement.style.cssText = `
        position: absolute;
        background: #ff6b35;
        border: 2px solid white;
        z-index: 10001;
        cursor: ${getCursorForHandle(handle)};
      `;
      
      // Positionnement selon la poignée
      if (handle.includes('top')) handleElement.style.top = '-6px';
      if (handle.includes('bottom')) handleElement.style.bottom = '-6px';
      if (handle.includes('left')) handleElement.style.left = '-6px';
      if (handle.includes('right')) handleElement.style.right = '-6px';
      
      // Taille des poignées
      if (handle.includes('-')) {
        // Poignées de coin
        handleElement.style.width = '12px';
        handleElement.style.height = '12px';
        handleElement.style.borderRadius = '50%';
      } else {
        // Poignées de côté
        if (handle === 'top' || handle === 'bottom') {
          handleElement.style.width = '20px';
          handleElement.style.height = '6px';
          handleElement.style.left = '50%';
          handleElement.style.transform = 'translateX(-50%)';
        } else {
          handleElement.style.width = '6px';
          handleElement.style.height = '20px';
          handleElement.style.top = '50%';
          handleElement.style.transform = 'translateY(-50%)';
        }
      }
      
      handleElement.addEventListener('mousedown', (e) => {
        e.preventDefault();
        e.stopPropagation();
        handleResizeStart(e, elementKey, handle);
      });
      
      handleElement.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
      });
      
      element.appendChild(handleElement);
    });
  };

  const removeResizeHandles = (element) => {
    const handles = element.querySelectorAll('.resize-handle');
    handles.forEach(handle => handle.remove());
  };

  const getCursorForHandle = (handle) => {
    const cursors = {
      'top-left': 'nw-resize',
      'top-right': 'ne-resize',
      'bottom-left': 'sw-resize',
      'bottom-right': 'se-resize',
      'top': 'n-resize',
      'right': 'e-resize',
      'bottom': 's-resize',
      'left': 'w-resize'
    };
    return cursors[handle] || 'default';
  };

  // Charger les layouts sauvegardés depuis localStorage
  useEffect(() => {
    const saved = localStorage.getItem('calendar_layouts');
    if (saved) {
      try {
        setSavedLayouts(JSON.parse(saved));
      } catch (error) {
        console.error('Erreur lors du chargement des layouts:', error);
      }
    }
  }, []);

  // Sauvegarder un layout
  const handleSaveLayout = () => {
    if (!layoutName.trim()) {
      alert('Veuillez donner un nom à votre layout');
      return;
    }

    const layoutData = {
      name: layoutName,
      positions: { ...elementPositions },
      timestamp: new Date().toISOString(),
      elementsCount: Object.keys(elementPositions).length
    };

    const updatedLayouts = {
      ...savedLayouts,
      [layoutName]: layoutData
    };

    setSavedLayouts(updatedLayouts);
    localStorage.setItem('calendar_layouts', JSON.stringify(updatedLayouts));
    
    setShowSaveModal(false);
    setLayoutName('');
    alert(`Layout "${layoutName}" sauvegardé avec succès !`);
  };

  // Charger un layout
  const handleLoadLayout = (layoutKey) => {
    const layout = savedLayouts[layoutKey];
    if (!layout) return;

    // Réinitialiser d'abord toutes les positions
    Object.keys(dimensions).forEach(key => {
      const element = dimensions[key];
      if (element && element.element) {
        element.element.style.position = '';
        element.element.style.left = '';
        element.element.style.top = '';
        element.element.style.zIndex = '';
      }
    });

    // Appliquer les nouvelles positions
    setElementPositions(layout.positions);
    
    // Appliquer visuellement les positions
    Object.entries(layout.positions).forEach(([key, position]) => {
      const element = dimensions[key];
      if (element && element.element) {
        element.element.style.position = 'fixed';
        element.element.style.left = `${position.x}px`;
        element.element.style.top = `${position.y}px`;
        element.element.style.zIndex = '9999';
      }
    });

    setShowLoadModal(false);
    alert(`Layout "${layout.name}" chargé avec succès !`);
  };

  // Supprimer un layout
  const handleDeleteLayout = (layoutKey) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer le layout "${savedLayouts[layoutKey].name}" ?`)) {
      return;
    }

    const updatedLayouts = { ...savedLayouts };
    delete updatedLayouts[layoutKey];
    
    setSavedLayouts(updatedLayouts);
    localStorage.setItem('calendar_layouts', JSON.stringify(updatedLayouts));
    alert('Layout supprimé avec succès !');
  };

  // Fonctions de redimensionnement
  const handleResizeStart = (e, elementKey, handle) => {
    if (!isEditMode) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    const element = dimensions[elementKey];
    if (!element) return;

    const rect = element.element.getBoundingClientRect();
    resizeStartData.current = {
      width: rect.width,
      height: rect.height,
      x: e.clientX,
      y: e.clientY
    };

    setIsResizing(true);
    setResizeHandle(handle);
    setSelectedElementForEdit(elementKey);
  };

  const handleResizeMove = (e) => {
    if (!isResizing || !selectedElementForEdit || !resizeHandle) return;
    
    e.preventDefault();
    e.stopPropagation();

    const deltaX = e.clientX - resizeStartData.current.x;
    const deltaY = e.clientY - resizeStartData.current.y;
    
    let newWidth = resizeStartData.current.width;
    let newHeight = resizeStartData.current.height;

    // Calculer nouvelles dimensions selon la poignée
    if (resizeHandle.includes('right')) newWidth += deltaX;
    if (resizeHandle.includes('left')) newWidth -= deltaX;
    if (resizeHandle.includes('bottom')) newHeight += deltaY;
    if (resizeHandle.includes('top')) newHeight -= deltaY;

    // Limites minimales et maximales
    newWidth = Math.max(50, Math.min(2000, newWidth));
    newHeight = Math.max(30, Math.min(1500, newHeight));

    // Appliquer les nouvelles dimensions
    const element = dimensions[selectedElementForEdit];
    if (element && element.element) {
      element.element.style.width = `${newWidth}px`;
      element.element.style.height = `${newHeight}px`;
      element.element.style.minWidth = 'unset';
      element.element.style.minHeight = 'unset';
      element.element.style.maxWidth = 'unset';
      element.element.style.maxHeight = 'unset';
      element.element.style.boxSizing = 'border-box';
    }

    // Sauvegarder les dimensions
    setElementSizes(prev => ({
      ...prev,
      [selectedElementForEdit]: { width: newWidth, height: newHeight }
    }));
  };

  const handleResizeEnd = (e) => {
    if (isResizing) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    setIsResizing(false);
    setResizeHandle(null);
    
    // Forcer la mise à jour de l'affichage
    if (selectedElementForEdit && dimensions[selectedElementForEdit]) {
      const element = dimensions[selectedElementForEdit].element;
      if (element) {
        element.style.cursor = 'grab';
      }
    }
  };

  // Sélectionner un élément pour édition
  const handleElementSelect = (elementKey) => {
    if (!isEditMode || isResizing) return;
    
    // Si on clique sur le même élément, on le désélectionne
    if (selectedElementForEdit === elementKey) {
      setSelectedElementForEdit(null);
    } else {
      setSelectedElementForEdit(elementKey);
    }
  };

  // Désélectionner l'élément
  const handleDeselectElement = () => {
    setSelectedElementForEdit(null);
    setIsResizing(false);
    setResizeHandle(null);
  };

  // Mettre à jour position via input
  const updateElementPosition = (elementKey, axis, value) => {
    const numValue = parseInt(value) || 0;
    const element = dimensions[elementKey];
    
    if (element && element.element) {
      if (axis === 'x') {
        element.element.style.left = `${numValue}px`;
        element.element.style.position = 'fixed';
      } else {
        element.element.style.top = `${numValue}px`;
        element.element.style.position = 'fixed';
      }
    }

    setElementPositions(prev => ({
      ...prev,
      [elementKey]: {
        ...prev[elementKey],
        [axis]: numValue
      }
    }));
  };

  // Mettre à jour taille via input
  const updateElementSize = (elementKey, dimension, value) => {
    const numValue = parseInt(value) || 50;
    const element = dimensions[elementKey];
    
    if (element && element.element) {
      if (dimension === 'width') {
        element.element.style.width = `${numValue}px`;
      } else {
        element.element.style.height = `${numValue}px`;
      }
      element.element.style.minWidth = 'unset';
      element.element.style.minHeight = 'unset';
    }

    setElementSizes(prev => ({
      ...prev,
      [elementKey]: {
        ...prev[elementKey],
        [dimension]: numValue
      }
    }));
  };

  // Valider et appliquer définitivement les positions actuelles
  const handleValidatePositions = () => {
    const totalChanges = Object.keys(elementPositions).length + Object.keys(elementSizes).length;
    if (totalChanges === 0) {
      alert('Aucun élément n\'a été modifié');
      return;
    }

    const confirmed = confirm(
      `Voulez-vous valider définitivement les modifications de ${totalChanges} élément(s) ?\n\n` +
      'Cette action appliquera les positions et tailles de manière permanente jusqu\'au prochain rechargement de la page.'
    );

    if (confirmed) {
      // Marquer les positions comme validées
      Object.entries(elementPositions).forEach(([key, position]) => {
        const element = dimensions[key];
        if (element && element.element) {
          element.element.style.position = 'fixed';
          element.element.style.left = `${position.x}px`;
          element.element.style.top = `${position.y}px`;
          element.element.style.zIndex = '1000';
          element.element.classList.add('position-validated');
        }
      });

      // Marquer les tailles comme validées
      Object.entries(elementSizes).forEach(([key, size]) => {
        const element = dimensions[key];
        if (element && element.element) {
          element.element.style.width = `${size.width}px`;
          element.element.style.height = `${size.height}px`;
          element.element.classList.add('size-validated');
        }
      });

      alert('Modifications validées avec succès ! Les éléments resteront en place.');
      setIsEditMode(false);
      setSelectedElementForEdit(null);
    }
  };

  return (
    <>
      <div className="preview-interface">
        <h3>
          <i className="fas fa-ruler"></i>
          Interface Preview
        </h3>

        <div className="controls">
          <div className="mode-buttons">
            <button
              onClick={() => setIsEditMode(false)}
              style={{
                background: !isEditMode ? '#007bff' : '#6c757d',
                color: 'white',
                padding: '12px 20px',
                fontSize: '16px',
                fontWeight: 'bold',
                border: 'none',
                borderRadius: '8px',
                margin: '0 5px',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
            >
              <i className="fas fa-eye"></i>
              MODE PRÉVISUALISATION
            </button>
            <button
              onClick={() => setIsEditMode(true)}
              style={{
                background: isEditMode ? '#28a745' : '#6c757d',
                color: 'white',
                padding: '12px 20px',
                fontSize: '16px',
                fontWeight: 'bold',
                border: 'none',
                borderRadius: '8px',
                margin: '0 5px',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
            >
              <i className="fas fa-edit"></i>
              MODE ÉDITION
            </button>
          </div>
          
          <div className="utility-buttons" style={{ marginTop: '10px' }}>
            <button
              onClick={handleValidatePositions}
              disabled={Object.keys(elementPositions).length === 0 && Object.keys(elementSizes).length === 0}
              style={{
                background: (Object.keys(elementPositions).length > 0 || Object.keys(elementSizes).length > 0) ? '#28a745' : '#6c757d',
                color: 'white',
                fontWeight: 'bold'
              }}
            >
              <i className="fas fa-check"></i>
              Valider Modifications ({Object.keys(elementPositions).length + Object.keys(elementSizes).length})
            </button>
            
            <button
              onClick={() => setShowSaveModal(true)}
              disabled={Object.keys(elementPositions).length === 0}
              style={{
                background: Object.keys(elementPositions).length > 0 ? '#007bff' : '#6c757d',
                color: 'white'
              }}
            >
              <i className="fas fa-save"></i>
              Sauver Layout
            </button>
            
            <button
              onClick={() => setShowLoadModal(true)}
              disabled={Object.keys(savedLayouts).length === 0}
              style={{
                background: Object.keys(savedLayouts).length > 0 ? '#6f42c1' : '#6c757d',
                color: 'white'
              }}
            >
              <i className="fas fa-folder-open"></i>
              Charger Layout ({Object.keys(savedLayouts).length})
            </button>

            {selectedElementForEdit && (
              <button
                onClick={handleDeselectElement}
                style={{
                  background: '#dc3545',
                  color: 'white',
                  fontWeight: 'bold'
                }}
                title="Désélectionner l'élément en cours d'édition"
              >
                <i className="fas fa-times-circle"></i>
                Désélectionner
              </button>
            )}
            
            <button
              onClick={() => setIsSelecting(!isSelecting)}
              style={{
                background: isSelecting ? '#28a745' : '#ffc107',
                color: isSelecting ? 'white' : 'black'
              }}
            >
              <i className="fas fa-mouse-pointer"></i>
              {isSelecting ? 'Sélection ON' : 'Sélectionner'}
            </button>
            
            <button
              onClick={() => {
                // Réinitialiser toutes les positions
                setElementPositions({});
                Object.keys(dimensions).forEach(key => {
                  const element = dimensions[key];
                  if (element && element.element) {
                    element.element.style.position = '';
                    element.element.style.left = '';
                    element.element.style.top = '';
                    element.element.style.zIndex = '';
                    element.element.classList.remove('position-validated');
                  }
                });
              }}
              style={{
                background: '#dc3545',
                color: 'white'
              }}
            >
              <i className="fas fa-undo"></i>
              Réinitialiser
            </button>
            
            <button onClick={() => window.location.reload()}>
              <i className="fas fa-sync"></i>
              Actualiser
            </button>
            
            <label style={{ marginLeft: '10px' }}>
              <input
                type="checkbox"
                checked={showGrid}
                onChange={(e) => setShowGrid(e.target.checked)}
              />
              Grille
            </label>
          </div>
        </div>

        <div className="legend">
          <div><i className="fas fa-eye"></i> <strong>Mode Prévisualisation :</strong> Voir le résultat final</div>
          <div><i className="fas fa-edit"></i> <strong>Mode Édition :</strong> Cliquez et glissez les éléments</div>
          <div><i className="fas fa-mouse-pointer"></i> <strong>Sélection :</strong> Clic pour voir les détails</div>
          <div><i className="fas fa-arrows-alt"></i> <strong>Déplacement :</strong> Bordures vertes = déplaçable</div>
          <div><i className="fas fa-expand-arrows-alt"></i> <strong>Redimensionnement :</strong> Poignées orange sur l'élément sélectionné</div>
          <div><i className="fas fa-undo"></i> <strong>Réinitialiser :</strong> Remettre tout en place</div>
        </div>

        {/* Panneau d'édition directe */}
        {selectedElementForEdit && isEditMode && (
          <div className="element-editor">
            <div className="editor-header">
              <h4>
                <i className="fas fa-cog"></i>
                Édition Directe
              </h4>
              <button 
                onClick={handleDeselectElement}
                style={{ 
                  background: 'rgba(255,255,255,0.2)', 
                  border: '1px solid rgba(255,255,255,0.3)', 
                  color: '#fff', 
                  cursor: 'pointer',
                  borderRadius: '4px',
                  padding: '4px 8px'
                }}
                title="Désélectionner l'élément"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <div className="editor-content">
              <div className="editor-section">
                <h5>Position</h5>
                <div className="input-group">
                  <label>X:</label>
                  <input
                    type="number"
                    value={elementPositions[selectedElementForEdit]?.x || 0}
                    onChange={(e) => updateElementPosition(selectedElementForEdit, 'x', e.target.value)}
                    style={{ width: '80px', marginRight: '10px' }}
                  />
                  <label>Y:</label>
                  <input
                    type="number"
                    value={elementPositions[selectedElementForEdit]?.y || 0}
                    onChange={(e) => updateElementPosition(selectedElementForEdit, 'y', e.target.value)}
                    style={{ width: '80px' }}
                  />
                </div>
              </div>
              
              <div className="editor-section">
                <h5>Taille</h5>
                <div className="input-group">
                  <label>Largeur:</label>
                  <input
                    type="number"
                    value={elementSizes[selectedElementForEdit]?.width || dimensions[selectedElementForEdit]?.width || 100}
                    onChange={(e) => updateElementSize(selectedElementForEdit, 'width', e.target.value)}
                    style={{ width: '80px', marginRight: '10px' }}
                  />
                  <label>Hauteur:</label>
                  <input
                    type="number"
                    value={elementSizes[selectedElementForEdit]?.height || dimensions[selectedElementForEdit]?.height || 50}
                    onChange={(e) => updateElementSize(selectedElementForEdit, 'height', e.target.value)}
                    style={{ width: '80px' }}
                  />
                </div>
              </div>
              
              <div className="editor-section">
                <h5>Élément</h5>
                <div style={{ fontSize: '11px', color: '#666' }}>
                  {dimensions[selectedElementForEdit]?.tagName}.{dimensions[selectedElementForEdit]?.className.split(' ').pop()}
                </div>
              </div>
            </div>
          </div>
        )}

        {Object.entries(dimensions).map(([key, dim]) => (
          <div key={key} className="element-info">
            <div className="element-header">
              {dim.tagName}.{dim.className.split(' ').pop()}
              {isEditMode && (
                <div
                  className="drag-handle"
                  style={{
                    position: 'absolute',
                    top: '-10px',
                    right: '-10px',
                    width: '20px',
                    height: '20px',
                    background: '#27ae60',
                    borderRadius: '50%',
                    cursor: 'move',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                    color: 'white',
                    border: '2px solid white',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                  }}
                  title="Glisser pour déplacer"
                >
                  ↔
                </div>
              )}
            </div>
            <div className="element-details">
              <div>
                <span className="dimension-badge">📐</span>
                {dim.width} × {dim.height}px
              </div>
              <div>
                <span className="dimension-badge">📍</span>
                {Math.round(dim.left)} × {Math.round(dim.top)}
              </div>
              <div>
                <span className="dimension-badge">📦</span>
                P: {dim.padding} | M: {dim.margin}
              </div>
              {elementPositions[key] && (
                <div style={{ color: '#27ae60', fontSize: '11px' }}>
                  <span className="dimension-badge">🎯</span>
                  Nouvelle position: {Math.round(elementPositions[key].x)} × {Math.round(elementPositions[key].y)}
                </div>
              )}
            </div>
          </div>
        ))}

        {selectedElement && (
          <div className="element-info" style={{ border: '2px solid #ffc107', background: 'rgba(255, 193, 7, 0.1)' }}>
            <div className="element-header" style={{ color: '#ffc107' }}>
              🎯 {selectedElement.tagName}.{selectedElement.className.split(' ').pop() || 'no-class'}
              {selectedElement.id && ` #${selectedElement.id}`}
            </div>
            <div className="element-details">
              <div>
                <span className="dimension-badge">📐</span>
                {Math.round(selectedElement.width)} × {Math.round(selectedElement.height)}px
              </div>
              <div>
                <span className="dimension-badge">📍</span>
                {Math.round(selectedElement.left)} × {Math.round(selectedElement.top)}
              </div>
              <div>
                <span className="dimension-badge">🎨</span>
                Fond: {selectedElement.backgroundColor}
              </div>
              <div>
                <span className="dimension-badge">📝</span>
                Texte: {selectedElement.color}
              </div>
              <div>
                <span className="dimension-badge">📦</span>
                P: {selectedElement.padding} | M: {selectedElement.margin}
              </div>
              <div>
                <span className="dimension-badge">⚙️</span>
                Position: {selectedElement.position}
              </div>
            </div>
          </div>
        )}

        {showGrid && <div className="debug-grid" />}
      </div>

      {tooltip && isSelecting && (
        <div
          className="element-tooltip"
          style={{
            left: tooltip.x,
            top: tooltip.y
          }}
        >
          <div><strong>{tooltip.element.tagName}</strong></div>
          <div>{Math.round(tooltip.width)} × {Math.round(tooltip.height)}px</div>
          <div>Cliquez pour sélectionner</div>
        </div>
      )}

      {isEditMode && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          background: 'rgba(40, 167, 69, 0.95)',
          color: 'white',
          padding: '15px 25px',
          borderRadius: '12px',
          fontSize: '16px',
          fontWeight: 'bold',
          pointerEvents: 'none',
          zIndex: 10000,
          border: '2px solid white',
          boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
          backdropFilter: 'blur(10px)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <i className="fas fa-edit" style={{ fontSize: '20px' }}></i>
            <div>
              <div>🎯 MODE ÉDITION ACTIVÉ</div>
              <div style={{ fontSize: '12px', opacity: '0.9', marginTop: '2px' }}>
                Cliquez et glissez les éléments avec bordures vertes
              </div>
            </div>
          </div>
        </div>
      )}

      {!isEditMode && Object.keys(elementPositions).length > 0 && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          background: 'rgba(0, 123, 255, 0.95)',
          color: 'white',
          padding: '15px 25px',
          borderRadius: '12px',
          fontSize: '16px',
          fontWeight: 'bold',
          pointerEvents: 'none',
          zIndex: 10000,
          border: '2px solid white',
          boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
          backdropFilter: 'blur(10px)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <i className="fas fa-eye" style={{ fontSize: '20px' }}></i>
            <div>
              <div>👁️ MODE PRÉVISUALISATION</div>
              <div style={{ fontSize: '12px', opacity: '0.9', marginTop: '2px' }}>
                {Object.keys(elementPositions).length} élément(s) repositionné(s)
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modale de sauvegarde de layout */}
      {showSaveModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(0,0,0,0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10001
        }}>
          <div style={{
            background: 'white',
            padding: '30px',
            borderRadius: '12px',
            minWidth: '400px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
          }}>
            <h3 style={{ margin: '0 0 20px 0', color: '#333' }}>
              <i className="fas fa-save" style={{ marginRight: '10px', color: '#007bff' }}></i>
              Sauvegarder le Layout
            </h3>
            <p style={{ color: '#666', marginBottom: '20px' }}>
              Donnez un nom à votre layout pour le sauvegarder et pouvoir le réutiliser plus tard.
            </p>
            <input
              type="text"
              value={layoutName}
              onChange={(e) => setLayoutName(e.target.value)}
              placeholder="Nom du layout (ex: Layout Principal)"
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #ddd',
                borderRadius: '6px',
                fontSize: '16px',
                marginBottom: '20px',
                boxSizing: 'border-box'
              }}
              onKeyPress={(e) => e.key === 'Enter' && handleSaveLayout()}
            />
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => {
                  setShowSaveModal(false);
                  setLayoutName('');
                }}
                style={{
                  padding: '10px 20px',
                  border: '2px solid #6c757d',
                  background: 'white',
                  color: '#6c757d',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                Annuler
              </button>
              <button
                onClick={handleSaveLayout}
                style={{
                  padding: '10px 20px',
                  border: 'none',
                  background: '#007bff',
                  color: 'white',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                <i className="fas fa-save" style={{ marginRight: '5px' }}></i>
                Sauvegarder
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modale de chargement de layout */}
      {showLoadModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(0,0,0,0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10001
        }}>
          <div style={{
            background: 'white',
            padding: '30px',
            borderRadius: '12px',
            minWidth: '500px',
            maxWidth: '600px',
            maxHeight: '70vh',
            overflow: 'auto',
            boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
          }}>
            <h3 style={{ margin: '0 0 20px 0', color: '#333' }}>
              <i className="fas fa-folder-open" style={{ marginRight: '10px', color: '#17a2b8' }}></i>
              Charger un Layout
            </h3>
            <p style={{ color: '#666', marginBottom: '20px' }}>
              Sélectionnez un layout sauvegardé pour l'appliquer à votre calendrier.
            </p>
            
            {Object.keys(savedLayouts).length === 0 ? (
              <p style={{ textAlign: 'center', color: '#999', padding: '20px' }}>
                Aucun layout sauvegardé trouvé.
              </p>
            ) : (
              <div style={{ marginBottom: '20px' }}>
                {Object.entries(savedLayouts).map(([key, layout]) => (
                  <div key={key} style={{
                    border: '2px solid #ddd',
                    borderRadius: '8px',
                    padding: '15px',
                    marginBottom: '10px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div>
                      <h4 style={{ margin: '0 0 5px 0', color: '#333' }}>{layout.name}</h4>
                      <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>
                        {layout.elementsCount} éléments • {new Date(layout.timestamp).toLocaleString()}
                      </p>
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button
                        onClick={() => handleLoadLayout(key)}
                        style={{
                          padding: '8px 15px',
                          border: 'none',
                          background: '#28a745',
                          color: 'white',
                          borderRadius: '6px',
                          cursor: 'pointer'
                        }}
                      >
                        <i className="fas fa-download"></i> Charger
                      </button>
                      <button
                        onClick={() => handleDeleteLayout(key)}
                        style={{
                          padding: '8px 15px',
                          border: 'none',
                          background: '#dc3545',
                          color: 'white',
                          borderRadius: '6px',
                          cursor: 'pointer'
                        }}
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowLoadModal(false)}
                style={{
                  padding: '10px 20px',
                  border: '2px solid #6c757d',
                  background: 'white',
                  color: '#6c757d',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PreviewInterface;
