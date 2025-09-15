
# Architecture Éditeur - Intégration et Plan d'Implémentation
## Finalisation de l'Architecture Complète

---

## 🗄️ Gestion d'État Complexe avec Zustand (Suite)

### Store Principal de l'Éditeur (Complet)

```typescript
// src/editor/store/editorStore.ts

import { create } from 'zustand';
import { subscribeWithSelector, devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

interface EditorStore extends EditorState {
  // Interface utilisateur (suite)
  togglePanels: () => void;
  setActivePanel: (panel: PanelType | null) => void;
  toggleFullscreen: () => void;
  setViewMode: (mode: 'edit' | 'preview' | 'code') => void;
  
  // Médias
  addMedia: (media: MediaItem) => void;
  removeMedia: (id: string) => void;
  updateMediaProgress: (id: string, progress: number) => void;
  
  // Collaboration
  connectCollaboration: (sessionId: string) => void;
  disconnectCollaboration: () => void;
  addCollaborator: (user: CollaborationUser) => void;
  removeCollaborator: (userId: string) => void;
  updateCursor: (userId: string, cursor: CursorPosition) => void;
  
  // Commentaires
  addComment: (comment: Omit<Comment, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateComment: (id: string, content: string) => void;
  deleteComment: (id: string) => void;
  resolveComment: (id: string) => void;
  
  // Erreurs et notifications
  addError: (error: EditorError) => void;
  clearError: (id: string) => void;
  addNotification: (notification: EditorNotification) => void;
  clearNotification: (id: string) => void;
}

export const useEditorStore = create<EditorStore>()(
  devtools(
    persist(
      subscribeWithSelector(
        immer((set, get) => ({
          // État initial
          document: null,
          ui: {
            isLoading: false,
            activePanel: null,
            selectedBlocks: [],
            focusedBlock: null,
            showToolbar: true,
            showPanels: true,
            zoom: 1,
            viewMode: 'edit'
          },
          selection: {
            type: 'none'
          },
          collaboration: {
            isConnected: false,
            users: [],
            comments: [],
            changes: []
          },
          history: {
            canUndo: false,
            canRedo: false,
            currentStep: 0,
            totalSteps: 0
          },
          media: {
            library: [],
            uploads: [],
            processing: []
          },
          config: {
            features: {
              richText: true,
              mediaInsert: true,
              collaboration: true,
              aiEnhancement: true,
              codeHighlight: true,
              mathFormulas: true,
              tables: true,
              charts: true
            },
            ui: {
              theme: 'light',
              layout: 'modern',
              toolbarPosition: 'top',
              panelsPosition: 'right',
              showRuler: false,
              showGrid: false,
              showOutline: true
            },
            performance: {
              virtualScrolling: true,
              lazyLoading: true,
              autoSave: true,
              autoSaveInterval: 30,
              maxHistorySteps: 50,
              maxFileSize: 100
            },
            collaboration: {
              enabled: true,
              maxUsers: 10,
              showCursors: true,
              showComments: true,
              allowAnonymous: false
            },
            accessibility: {
              highContrast: false,
              largeText: false,
              keyboardNavigation: true,
              screenReader: true,
              focusIndicators: true
            }
          },

          // Actions de configuration
          setConfig: (newConfig) => set((state) => {
            state.config = { ...state.config, ...newConfig };
          }),

          // Actions de document
          loadDocument: (document) => set((state) => {
            state.document = document;
            state.ui.isLoading = false;
            state.selection = { type: 'none' };
            state.history = {
              canUndo: false,
              canRedo: false,
              currentStep: 0,
              totalSteps: 0
            };
          }),

          saveDocument: async () => {
            const state = get();
            if (!state.document) return;
            
            set((draft) => {
              draft.ui.isLoading = true;
            });

            try {
              // Logique de sauvegarde
              await new Promise(resolve => setTimeout(resolve, 1000)); // Simulation
              
              set((draft) => {
                draft.ui.isLoading = false;
                if (draft.document) {
                  draft.document.updatedAt = new Date();
                  draft.document.version += 1;
                }
              });
            } catch (error) {
              set((draft) => {
                draft.ui.isLoading = false;
              });
              throw error;
            }
          },

          createNewDocument: () => set((state) => {
            const newDocument: EditorDocument = {
              id: generateId(),
              title: 'Nouveau document',
              content: {
                blocks: [],
                layout: {
                  width: 800,
                  height: 1200,
                  margins: { top: 50, right: 50, bottom: 50, left: 50 }
                },
                styles: {
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '16px',
                  lineHeight: '1.5',
                  color: '#333333'
                }
              },
              metadata: {
                author: 'Utilisateur',
                description: '',
                tags: [],
                language: 'fr'
              },
              settings: {
                isPublic: false,
                allowComments: true,
                allowCollaboration: true,
                autoSave: true
              },
              createdAt: new Date(),
              updatedAt: new Date(),
              version: 1
            };
            
            state.document = newDocument;
            state.selection = { type: 'none' };
          }),

          // Actions de blocs
          addBlock: (blockData) => set((state) => {
            if (!state.document) return;
            
            const newBlock: ContentBlock = {
              ...blockData,
              id: generateId(),
              metadata: {
                createdAt: new Date(),
                updatedAt: new Date(),
                createdBy: 'current-user',
                updatedBy: 'current-user',
                version: 1,
                locked: false,
                hidden: false,
                tags: [],
                notes: ''
              }
            };
            
            state.document.content.blocks.push(newBlock);
            state.selection = {
              type: 'block',
              blockId: newBlock.id
            };
            
            // Ajout à l'historique
            get().addHistoryStep('add_block', { blockId: newBlock.id });
          }),

          updateBlock: (id, updates) => set((state) => {
            if (!state.document) return;
            
            const blockIndex = state.document.content.blocks.findIndex(b => b.id === id);
            if (blockIndex === -1) return;
            
            const block = state.document.content.blocks[blockIndex];
            state.document.content.blocks[blockIndex] = {
              ...block,
              ...updates,
              metadata: {
                ...block.metadata,
                updatedAt: new Date(),
                updatedBy: 'current-user',
                version: block.metadata.version + 1
              }
            };
            
            get().addHistoryStep('update_block', { blockId: id, updates });
          }),

          deleteBlock: (id) => set((state) => {
            if (!state.document) return;
            
            const blockIndex = state.document.content.blocks.findIndex(b => b.id === id);
            if (blockIndex === -1) return;
            
            const deletedBlock = state.document.content.blocks[blockIndex];
            state.document.content.blocks.splice(blockIndex, 1);
            
            // Mise à jour de la sélection
            if (state.selection.blockId === id) {
              state.selection = { type: 'none' };
            }
            if (state.selection.blocks?.includes(id)) {
              state.selection.blocks = state.selection.blocks.filter(bid => bid !== id);
            }
            
            get().addHistoryStep('delete_block', { block: deletedBlock });
          }),

          moveBlock: (id, position) => set((state) => {
            if (!state.document) return;
            
            const block = state.document.content.blocks.find(b => b.id === id);
            if (!block) return;
            
            const oldPosition = { ...block.position };
            block.position = { ...block.position, ...position };
            block.metadata.updatedAt = new Date();
            block.metadata.version += 1;
            
            get().addHistoryStep('move_block', { blockId: id, oldPosition, newPosition: position });
          }),

          // Actions de sélection
          selectBlock: (id) => set((state) => {
            state.selection = {
              type: 'block',
              blockId: id
            };
            state.ui.selectedBlocks = [id];
            state.ui.focusedBlock = id;
          }),

          selectMultiple: (ids) => set((state) => {
            state.selection = {
              type: 'multiple',
              blocks: ids
            };
            state.ui.selectedBlocks = ids;
            state.ui.focusedBlock = ids[0] || null;
          }),

          toggleBlockSelection: (id) => set((state) => {
            const currentSelection = state.ui.selectedBlocks;
            
            if (currentSelection.includes(id)) {
              const newSelection = currentSelection.filter(bid => bid !== id);
              if (newSelection.length === 0) {
                state.selection = { type: 'none' };
                state.ui.selectedBlocks = [];
                state.ui.focusedBlock = null;
              } else if (newSelection.length === 1) {
                state.selection = { type: 'block', blockId: newSelection[0] };
                state.ui.selectedBlocks = newSelection;
                state.ui.focusedBlock = newSelection[0];
              } else {
                state.selection = { type: 'multiple', blocks: newSelection };
                state.ui.selectedBlocks = newSelection;
              }
            } else {
              const newSelection = [...currentSelection, id];
              if (newSelection.length === 1) {
                state.selection = { type: 'block', blockId: id };
              } else {
                state.selection = { type: 'multiple', blocks: newSelection };
              }
              state.ui.selectedBlocks = newSelection;
              state.ui.focusedBlock = id;
            }
          }),

          clearSelection: () => set((state) => {
            state.selection = { type: 'none' };
            state.ui.selectedBlocks = [];
            state.ui.focusedBlock = null;
          }),

          selectAll: () => set((state) => {
            if (!state.document) return;
            
            const allIds = state.document.content.blocks.map(b => b.id);
            state.selection = { type: 'multiple', blocks: allIds };
            state.ui.selectedBlocks = allIds;
            state.ui.focusedBlock = allIds[0] || null;
          }),

          // Actions d'historique
          undo: () => {
            const historyManager = HistoryManager.getInstance();
            const result = historyManager.undo();
            
            if (result) {
              set((state) => {
                // Application de l'action d'annulation
                applyHistoryAction(state, result);
                state.history = historyManager.getState();
              });
            }
          },

          redo: () => {
            const historyManager = HistoryManager.getInstance();
            const result = historyManager.redo();
            
            if (result) {
              set((state) => {
                // Application de l'action de rétablissement
                applyHistoryAction(state, result);
                state.history = historyManager.getState();
              });
            }
          },

          addHistoryStep: (action, data) => {
            const historyManager = HistoryManager.getInstance();
            historyManager.addStep({
              id: generateId(),
              action,
              data,
              timestamp: new Date(),
              documentState: get().document
            });
            
            set((state) => {
              state.history = historyManager.getState();
            });
          },

          // Actions d'interface
          setZoom: (zoom) => set((state) => {
            state.ui.zoom = Math.max(0.1, Math.min(5, zoom));
          }),

          toggleGrid: () => set((state) => {
            state.config.ui.showGrid = !state.config.ui.showGrid;
          }),

          toggleRuler: () => set((state) => {
            state.config.ui.showRuler = !state.config.ui.showRuler;
          }),

          togglePanels: () => set((state) => {
            state.ui.showPanels = !state.ui.showPanels;
          }),

          setActivePanel: (panel) => set((state) => {
            state.ui.activePanel = panel;
            if (panel && !state.ui.showPanels) {
              state.ui.showPanels = true;
            }
          }),

          toggleFullscreen: () => {
            if (document.fullscreenElement) {
              document.exitFullscreen();
            } else {
              document.documentElement.requestFullscreen();
            }
          },

          setViewMode: (mode) => set((state) => {
            state.ui.viewMode = mode;
          }),

          // Actions de médias
          addMedia: (media) => set((state) => {
            state.media.library.push(media);
          }),

          removeMedia: (id) => set((state) => {
            state.media.library = state.media.library.filter(m => m.id !== id);
          }),

          updateMediaProgress: (id, progress) => set((state) => {
            const upload = state.media.uploads.find(u => u.id === id);
            if (upload) {
              upload.progress = progress;
            }
          }),

          // Actions de collaboration
          connectCollaboration: (sessionId) => set((state) => {
            state.collaboration.isConnected = true;
            // Logique de connexion WebSocket
          }),

          disconnectCollaboration: () => set((state) => {
            state.collaboration.isConnected = false;
            state.collaboration.users = [];
          }),

          addCollaborator: (user) => set((state) => {
            const existingIndex = state.collaboration.users.findIndex(u => u.id === user.id);
            if (existingIndex >= 0) {
              state.collaboration.users[existingIndex] = user;
            } else {
              state.collaboration.users.push(user);
            }
          }),

          removeCollaborator: (userId) => set((state) => {
            state.collaboration.users = state.collaboration.users.filter(u => u.id !== userId);
          }),

          updateCursor: (userId, cursor) => set((state) => {
            const user = state.collaboration.users.find(u => u.id === userId);
            if (user) {
              user.cursor = cursor;
              user.lastSeen = new Date();
            }
          }),

          // Actions de commentaires
          addComment: (commentData) => set((state) => {
            const comment: Comment = {
              ...commentData,
              id: generateId(),
              replies: [],
              resolved: false,
              createdAt: new Date(),
              updatedAt: new Date()
            };
            
            state.collaboration.comments.push(comment);
          }),

          updateComment: (id, content) => set((state) => {
            const comment = state.collaboration.comments.find(c => c.id === id);
            if (comment) {
              comment.content = content;
              comment.updatedAt = new Date();
            }
          }),

          deleteComment: (id) => set((state) => {
            state.collaboration.comments = state.collaboration.comments.filter(c => c.id !== id);
          }),

          resolveComment: (id) => set((state) => {
            const comment = state.collaboration.comments.find(c => c.id === id);
            if (comment) {
              comment.resolved = true;
              comment.updatedAt = new Date();
            }
          }),

          // Gestion des erreurs
          addError: (error) => set((state) => {
            // Logique d'ajout d'erreur
          }),

          clearError: (id) => set((state) => {
            // Logique de suppression d'erreur
          }),

          addNotification: (notification) => set((state) => {
            // Logique d'ajout de notification
          }),

          clearNotification: (id) => set((state) => {
            // Logique de suppression de notification
          })
        }))
      ),
      {
        name: 'editor-storage',
        partialize: (state) => ({
          config: state.config,
          document: state.document
        })
      }
    ),
    {
      name: 'editor-store'
    }
  )
);

// Utilitaires
function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

function applyHistoryAction(state: any, action: HistoryAction): void {
  // Logique d'application des actions d'historique
  switch (action.action) {
    case 'add_block':
      // Logique pour annuler/refaire l'ajout de bloc
      break;
    case 'update_block':
      // Logique pour annuler/refaire la mise à jour de bloc
      break;
    case 'delete_block':
      // Logique pour annuler/refaire la suppression de bloc
      break;
    case 'move_block':
      // Logique pour annuler/refaire le déplacement de bloc
      break;
  }
}
```

---

## 🔗 Intégration avec l'Interface Existante

### Point d'Entrée depuis ContentResults

```typescript
// src/editor/integration/EditorLauncher.tsx

import React from 'react';
import { Modal } from '@/components/ui';
import { AdvancedEditor } from '../components/Editor/AdvancedEditor';
import { useEditorStore } from '../store/editorStore';
import { ContentResultsIntegration } from './ContentResultsIntegration';

interface EditorLauncherProps {
  isOpen: boolean;
  onClose: () => void;
  initialContent?: string;
  format?: string;
  onSave?: (content: string) => void;
}

export const EditorLauncher: React.FC<EditorLauncherProps> = ({
  isOpen,
  onClose,
  initialContent,
  format,
  onSave
}) => {
  const { createNewDocument, loadDocument } = useEditorStore();

  React.useEffect(() => {
    if (isOpen && initialContent) {
      // Conversion du contenu initial en document éditeur
      const document = ContentResultsIntegration.convertToEditorDocument(
        initialContent,
        format || 'text'
      );
      loadDocument(document);
    } else if (isOpen) {
      createNewDocument();
    }
  }, [isOpen, initialContent, format]);

  const handleSave = async (document: EditorDocument) => {
    if (onSave) {
      const exportedContent = ContentResultsIntegration.convertFromEditorDocument(
        document,
        format || 'text'
      );
      onSave(exportedContent);
    }
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="full"
      title="Éditeur Multimédia Avancé"
      closeOnOverlayClick={false}
      closeOnEscape={false}
    >
      <AdvancedEditor
        onSave={handleSave}
        onExport={async (format) => {
          // Logique d'export
        }}
      />
    </Modal>
  );
};
```

### Service d'Intégration

```typescript
// src/editor/integration/ContentResultsIntegration.ts

export class ContentResultsIntegration {
  /**
   * Conversion du contenu des résultats vers un document éditeur
   */
  static convertToEditorDocument(content: string, format: string): EditorDocument {
    const blocks: ContentBlock[] = [];
    
    // Analyse du contenu selon le format
    switch (format) {
      case 'instagram':
      case 'tiktok':
      case 'twitter':
      case 'facebook':
        blocks.push(...this.parseSocialMediaContent(content, format));
        break;
      case 'blog':
      case 'email':
        blocks.push(...this.parseRichTextContent(content));
        break;
      default:
        blocks.push(this.createTextBlock(content));
    }

    return {
      id: generateId(),
      title: `Document ${format}`,
      content: {
        blocks,
        layout: {
          width: 800,
          height: Math.max(1200, blocks.length * 200),
          margins: { top: 50, right: 50, bottom: 50, left: 50 }
        },
        styles: {
          fontFamily: 'Inter, sans-serif',
          fontSize: '16px',
          lineHeight: '1.5',
          color: '#333333'
        }
      },
      metadata: {
        author: 'Assistant IA',
        description: `Contenu généré pour ${format}`,
        tags: [format, 'generated'],
        language: 'fr'
      },
      settings: {
        isPublic: false,
        allowComments: true,
        allowCollaboration: true,
        autoSave: true
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      version: 1
    };
  }

  /**
   * Conversion d'un document éditeur vers le format de contenu
   */
  static convertFromEditorDocument(document: EditorDocument, format: string): string {
    let content = '';
    
    document.content.blocks.forEach(block => {
      switch (block.type) {
        case 'text':
        case 'paragraph':
          content += (block.data as TextBlockData).content + '\n\n';
          break;
        case 'heading':
          const level = (block.data as any).level || 1;
          content += '#'.repeat(level) + ' ' + (block.data as TextBlockData).content + '\n\n';
          break;
        case 'image':
          const imageData = block.data as ImageBlockData;
          content += `![${imageData.alt}](${imageData.src})\n\n`;
          if (imageData.caption) {
            content += `*${imageData.caption}*\n\n`;
          }
          break;
        case 'video':
          const videoData = block.data as VideoBlockData;
          content += `[Vidéo: ${videoData.src}]\n\n`;
          if (videoData.caption) {
            content += `*${videoData.caption}*\n\n`;
          }
          break;
        case 'list':
          const listData = block.data as any;
          listData.items.forEach((item: string, index: number) => {
            const prefix = listData.ordered ? `${index + 1}. ` : '- ';
            content += prefix + item + '\n';
          });
          content += '\n';
          break;
      }
    });
    
    return content.trim();
  }

  /**
   * Analyse du contenu des réseaux sociaux
   */
  private static parseSocialMediaContent(content: string, format: string): ContentBlock[] {
    const blocks: ContentBlock[] = [];
    const lines = content.split('\n');
    
    let currentText = '';
    
    lines.forEach(line => {
      line = line.trim();
      
      if (line.startsWith('#')) {
        // Hashtags
        if (currentText) {
          blocks.push(this.createTextBlock(currentText));
          currentText = '';
        }
        blocks.push(this.createHashtagBlock(line));
      } else if (line.startsWith('http')) {
        // Liens
        if (currentText) {
          blocks.push(this.createTextBlock(currentText));
          currentText = '';
        }
        blocks.push(this.createLinkBlock(line));
      } else if (line) {
        currentText += (currentText ? '\n' : '') + line;
      }
    });
    
    if (currentText) {
      blocks.push(this.createTextBlock(currentText));
    }
    
    return blocks;
  }

  /**
   * Analyse du contenu riche
   */
  private static parseRichTextContent(content: string): ContentBlock[] {
    const blocks: ContentBlock[] = [];
    const paragraphs = content.split('\n\n');
    
    paragraphs.forEach(paragraph => {
      paragraph = paragraph.trim();
      if (!paragraph) return;
      
      if (paragraph.startsWith('#')) {
        // Titre
        const level = paragraph.match(/^#+/)?.[0].length || 1;
        const text = paragraph.replace(/^#+\s*/, '');
        blocks.push(this.createHeadingBlock(text, level));
      } else if (paragraph.startsWith('-') || paragraph.startsWith('*')) {
        // Liste
        const items = paragraph.split('\n').map(line => line.replace(/^[-*]\s*/, ''));
        blocks.push(this.createListBlock(items, false));
      } else if (paragraph.match(/^\d+\./)) {
        // Liste numérotée
        const items = paragraph.split('\n').map(line => line.replace(/^\d+\.\s*/, ''));
        blocks.push(this.createListBlock(items, true));
      } else {
        // Paragraphe normal
        blocks.push(this.createTextBlock(paragraph));
      }
    });
    
    return blocks;
  }

  /**
   * Création d'un bloc de texte
   */
  private static createTextBlock(content: string): ContentBlock {
    return {
      id: generateId(),
      type: 'text',
      data: {
        content,
        format: 'plain',
        formatting: [],
        links: [],
        mentions: []
      } as TextBlockData,
      style: {
        fontSize: '16px',
        lineHeight: '1.5',
        color: '#333333',
        margin: { bottom: '1rem' }
      },
      position: {
        x: 0,
        y: 0,
        width: 800,
        height: 100
      },
      metadata: {
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'system',
        updatedBy: 'system',
        version: 1,
        locked: false,
        hidden: false,
        tags: [],
        notes: ''
      }
    };
  }

  /**
   * Création d'un bloc de titre
   */
  private static createHeadingBlock(content: string, level: number): ContentBlock {
    const fontSize = {
      1: '2rem',
      2: '1.75rem',
      3: '1.5rem',
      4: '1.25rem',
      5: '1.125rem',
      6: '1rem'
    }[level] || '1rem';

    return {
      id: generateId(),
      type: 'heading',
      data: {
        content,
        level,
        format: 'plain',
        formatting: [],
        links: [],
        mentions: []
      } as TextBlockData & { level: number },
      style: {
        fontSize,
        fontWeight: 'bold',
        lineHeight: '1.2',
        color: '#1a1a1a',
        margin: { top: '2rem', bottom: '1rem' }
      },
      position: {
        x: 0,
        y: 0,
        width: 800,
        height: 60
      },
      metadata: {
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'system',
        updatedBy: 'system',
        version: 1,
        locked: false,
        hidden: false,
        tags: [`h${level}`],
        notes: ''
      }
    };
  }

  /**
   * Création d'un bloc de liste
   */
  private static createListBlock(items: string[], ordered: boolean): ContentBlock {
    return {
      id: generateId(),
      type: 'list',
      data: {
        items,
        ordered,
        style: 'default'
      },
      style: {
        fontSize: '16px',
        lineHeight: '1.5',
        color: '#333333',
        margin: { bottom: '1rem' },
        padding: { left: '2rem' }
      },
      position: {
        x: 0,
        y: 0,
        width: 800,
        height: items.length * 30 + 20
      },
      metadata: {
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'system',
        updatedBy: 'system',
        version: 1,
        locked: false,
        hidden: false,
        tags: [ordered ? 'ordered-list' : 'unordered-list'],
        notes: ''
      }
    };
  }

  /**
   * Création d'un bloc hashtag
   */
  private static createHashtagBlock(content: string): ContentBlock {
    return {
      id: generateId(),
      type: 'text',
      data: {
        content,
        format: 'plain',
        formatting: [{
          type: 'highlight',
          range: { start: 0, end: content.length },
          style: { backgroundColor: '#e3f2fd', color: '#1976d2' }
        }],
        links: [],
        mentions: []
      } as TextBlockData,
      style: {
        fontSize: '14px',
        fontWeight: '500',
        color: '#1976d2',
        backgroundColor: '#e3f2fd',
        padding: { top: '0.25rem', bottom: '0.25rem', left: '0.5rem', right: '0.5rem' },
        borderRadius: '1rem',
        display: 'inline-block',
        margin: { right: '0.5rem', bottom: '0.5rem' }
      },
      position: {
        x: 0,
        y: 0,
        width