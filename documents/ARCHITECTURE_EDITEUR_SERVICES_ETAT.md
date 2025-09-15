
# Architecture Services et Gestion d'État - Éditeur Multimédia
## Complément à l'Architecture Principale

---

## 🎛️ Services Multimédia Avancés (Suite)

### Service de Capture Multimédia Complet

```typescript
// src/editor/services/media/CaptureService.ts

export class CaptureService {
  private mediaRecorder: MediaRecorder | null = null;
  private stream: MediaStream | null = null;
  private chunks: Blob[] = [];

  /**
   * Effet noir et blanc
   */
  private applyGrayscaleEffect(data: Uint8ClampedArray): void {
    for (let i = 0; i < data.length; i += 4) {
      const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
      data[i] = gray;
      data[i + 1] = gray;
      data[i + 2] = gray;
    }
  }

  /**
   * Flou d'arrière-plan avec détection de personne
   */
  private async applyBackgroundBlur(
    ctx: CanvasRenderingContext2D, 
    width: number, 
    height: number
  ): Promise<void> {
    // Utilisation de TensorFlow.js pour la segmentation de personne
    const net = await bodyPix.load();
    const segmentation = await net.segmentPerson(ctx.canvas);
    
    // Création du masque
    const mask = bodyPix.toMask(segmentation);
    
    // Application du flou sur l'arrière-plan
    const imageData = ctx.getImageData(0, 0, width, height);
    const blurredCanvas = document.createElement('canvas');
    const blurredCtx = blurredCanvas.getContext('2d')!;
    
    blurredCanvas.width = width;
    blurredCanvas.height = height;
    blurredCtx.filter = 'blur(10px)';
    blurredCtx.drawImage(ctx.canvas, 0, 0);
    
    // Composition avec le masque
    ctx.globalCompositeOperation = 'source-over';
    ctx.drawImage(blurredCanvas, 0, 0);
    ctx.globalCompositeOperation = 'destination-in';
    ctx.putImageData(mask, 0, 0);
  }

  /**
   * Arrière-plan virtuel
   */
  private async applyVirtualBackground(
    ctx: CanvasRenderingContext2D,
    backgroundImage: string,
    width: number,
    height: number
  ): Promise<void> {
    const net = await bodyPix.load();
    const segmentation = await net.segmentPerson(ctx.canvas);
    
    // Chargement de l'image d'arrière-plan
    const bgImage = new Image();
    bgImage.src = backgroundImage;
    
    await new Promise((resolve) => {
      bgImage.onload = resolve;
    });
    
    // Création du masque inversé pour l'arrière-plan
    const backgroundMask = bodyPix.toMask(segmentation, { r: 0, g: 0, b: 0, a: 0 }, { r: 255, g: 255, b: 255, a: 255 });
    
    // Composition
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d')!;
    tempCanvas.width = width;
    tempCanvas.height = height;
    
    // Dessiner l'arrière-plan
    tempCtx.drawImage(bgImage, 0, 0, width, height);
    tempCtx.globalCompositeOperation = 'destination-in';
    tempCtx.putImageData(backgroundMask, 0, 0);
    
    // Dessiner la personne
    tempCtx.globalCompositeOperation = 'destination-over';
    tempCtx.drawImage(ctx.canvas, 0, 0);
    
    // Résultat final
    ctx.clearRect(0, 0, width, height);
    ctx.drawImage(tempCanvas, 0, 0);
  }

  /**
   * Capture screenshot avec annotations
   */
  private async captureScreenshot(
    stream: MediaStream, 
    options: ScreenCaptureOptions
  ): Promise<CaptureResult> {
    const video = document.createElement('video');
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    
    video.srcObject = stream;
    video.play();
    
    return new Promise((resolve, reject) => {
      video.onloadedmetadata = () => {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        ctx.drawImage(video, 0, 0);
        
        // Application des annotations si spécifiées
        if (options.annotations) {
          this.applyAnnotations(ctx, options.annotations);
        }
        
        canvas.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            resolve({
              type: 'image',
              url,
              blob,
              metadata: {
                width: canvas.width,
                height: canvas.height,
                format: 'png',
                size: blob.size
              }
            });
          } else {
            reject(new Error('Impossible de créer le screenshot'));
          }
        }, 'image/png');
        
        // Nettoyage
        stream.getTracks().forEach(track => track.stop());
      };
    });
  }

  /**
   * Application d'annotations sur le canvas
   */
  private applyAnnotations(ctx: CanvasRenderingContext2D, annotations: Annotation[]): void {
    annotations.forEach(annotation => {
      switch (annotation.type) {
        case 'arrow':
          this.drawArrow(ctx, annotation);
          break;
        case 'rectangle':
          this.drawRectangle(ctx, annotation);
          break;
        case 'circle':
          this.drawCircle(ctx, annotation);
          break;
        case 'text':
          this.drawText(ctx, annotation);
          break;
        case 'highlight':
          this.drawHighlight(ctx, annotation);
          break;
        case 'blur':
          this.drawBlurArea(ctx, annotation);
          break;
      }
    });
  }

  /**
   * Dessin d'une flèche
   */
  private drawArrow(ctx: CanvasRenderingContext2D, annotation: ArrowAnnotation): void {
    const { start, end, color = '#ff0000', width = 3 } = annotation;
    
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.lineCap = 'round';
    
    // Ligne principale
    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    ctx.stroke();
    
    // Pointe de la flèche
    const angle = Math.atan2(end.y - start.y, end.x - start.x);
    const arrowLength = 15;
    const arrowAngle = Math.PI / 6;
    
    ctx.beginPath();
    ctx.moveTo(end.x, end.y);
    ctx.lineTo(
      end.x - arrowLength * Math.cos(angle - arrowAngle),
      end.y - arrowLength * Math.sin(angle - arrowAngle)
    );
    ctx.moveTo(end.x, end.y);
    ctx.lineTo(
      end.x - arrowLength * Math.cos(angle + arrowAngle),
      end.y - arrowLength * Math.sin(angle + arrowAngle)
    );
    ctx.stroke();
  }

  /**
   * Dessin d'un rectangle
   */
  private drawRectangle(ctx: CanvasRenderingContext2D, annotation: RectangleAnnotation): void {
    const { x, y, width, height, color = '#ff0000', lineWidth = 3, fill = false } = annotation;
    
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    
    if (fill) {
      ctx.fillStyle = color + '40'; // Transparence
      ctx.fillRect(x, y, width, height);
    }
    
    ctx.strokeRect(x, y, width, height);
  }

  /**
   * Dessin d'un cercle
   */
  private drawCircle(ctx: CanvasRenderingContext2D, annotation: CircleAnnotation): void {
    const { x, y, radius, color = '#ff0000', lineWidth = 3, fill = false } = annotation;
    
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, 2 * Math.PI);
    
    if (fill) {
      ctx.fillStyle = color + '40';
      ctx.fill();
    }
    
    ctx.stroke();
  }

  /**
   * Dessin de texte
   */
  private drawText(ctx: CanvasRenderingContext2D, annotation: TextAnnotation): void {
    const { 
      x, y, text, 
      color = '#ff0000', 
      fontSize = 16, 
      fontFamily = 'Arial',
      background = false 
    } = annotation;
    
    ctx.font = `${fontSize}px ${fontFamily}`;
    ctx.fillStyle = color;
    
    if (background) {
      const metrics = ctx.measureText(text);
      const padding = 4;
      
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(
        x - padding, 
        y - fontSize - padding, 
        metrics.width + padding * 2, 
        fontSize + padding * 2
      );
      
      ctx.fillStyle = color;
    }
    
    ctx.fillText(text, x, y);
  }

  /**
   * Zone de flou pour masquer des informations sensibles
   */
  private drawBlurArea(ctx: CanvasRenderingContext2D, annotation: BlurAnnotation): void {
    const { x, y, width, height, intensity = 10 } = annotation;
    
    // Extraction de la zone à flouter
    const imageData = ctx.getImageData(x, y, width, height);
    
    // Création d'un canvas temporaire pour le flou
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d')!;
    tempCanvas.width = width;
    tempCanvas.height = height;
    
    tempCtx.putImageData(imageData, 0, 0);
    tempCtx.filter = `blur(${intensity}px)`;
    tempCtx.drawImage(tempCanvas, 0, 0);
    
    // Application du résultat flouté
    ctx.drawImage(tempCanvas, x, y);
  }
}

/**
 * Types pour les annotations
 */
export interface Annotation {
  type: 'arrow' | 'rectangle' | 'circle' | 'text' | 'highlight' | 'blur';
  id: string;
}

export interface ArrowAnnotation extends Annotation {
  type: 'arrow';
  start: { x: number; y: number };
  end: { x: number; y: number };
  color?: string;
  width?: number;
}

export interface RectangleAnnotation extends Annotation {
  type: 'rectangle';
  x: number;
  y: number;
  width: number;
  height: number;
  color?: string;
  lineWidth?: number;
  fill?: boolean;
}

export interface CircleAnnotation extends Annotation {
  type: 'circle';
  x: number;
  y: number;
  radius: number;
  color?: string;
  lineWidth?: number;
  fill?: boolean;
}

export interface TextAnnotation extends Annotation {
  type: 'text';
  x: number;
  y: number;
  text: string;
  color?: string;
  fontSize?: number;
  fontFamily?: string;
  background?: boolean;
}

export interface BlurAnnotation extends Annotation {
  type: 'blur';
  x: number;
  y: number;
  width: number;
  height: number;
  intensity?: number;
}
```

### Service de Traitement Multimédia

```typescript
// src/editor/services/media/ProcessingService.ts

export class ProcessingService {
  private workers: Map<string, Worker> = new Map();
  private ffmpegInstance: FFmpeg | null = null;

  constructor() {
    this.initializeFFmpeg();
  }

  /**
   * Initialisation de FFmpeg pour le traitement vidéo/audio
   */
  private async initializeFFmpeg(): Promise<void> {
    try {
      const { createFFmpeg, fetchFile } = await import('@ffmpeg/ffmpeg');
      this.ffmpegInstance = createFFmpeg({
        log: true,
        corePath: '/ffmpeg-core.js'
      });
      
      if (!this.ffmpegInstance.isLoaded()) {
        await this.ffmpegInstance.load();
      }
    } catch (error) {
      console.warn('FFmpeg non disponible:', error);
    }
  }

  /**
   * Traitement d'image avec filtres avancés
   */
  async processImage(
    file: File, 
    operations: ImageOperation[]
  ): Promise<ProcessingResult> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      const img = new Image();
      
      img.onload = async () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        
        try {
          // Application séquentielle des opérations
          for (const operation of operations) {
            await this.applyImageOperation(ctx, operation, canvas.width, canvas.height);
          }
          
          canvas.toBlob((blob) => {
            if (blob) {
              resolve({
                success: true,
                result: {
                  blob,
                  url: URL.createObjectURL(blob),
                  metadata: {
                    width: canvas.width,
                    height: canvas.height,
                    size: blob.size,
                    format: blob.type
                  }
                }
              });
            } else {
              reject(new Error('Impossible de traiter l\'image'));
            }
          }, file.type);
        } catch (error) {
          reject(error);
        }
      };
      
      img.onerror = () => reject(new Error('Impossible de charger l\'image'));
      img.src = URL.createObjectURL(file);
    });
  }

  /**
   * Application d'une opération sur l'image
   */
  private async applyImageOperation(
    ctx: CanvasRenderingContext2D,
    operation: ImageOperation,
    width: number,
    height: number
  ): Promise<void> {
    switch (operation.type) {
      case 'resize':
        await this.resizeImage(ctx, operation.params, width, height);
        break;
      case 'crop':
        await this.cropImage(ctx, operation.params);
        break;
      case 'rotate':
        await this.rotateImage(ctx, operation.params, width, height);
        break;
      case 'flip':
        await this.flipImage(ctx, operation.params, width, height);
        break;
      case 'filter':
        await this.applyImageFilter(ctx, operation.params, width, height);
        break;
      case 'adjust':
        await this.adjustImage(ctx, operation.params, width, height);
        break;
      case 'enhance':
        await this.enhanceImage(ctx, operation.params, width, height);
        break;
    }
  }

  /**
   * Redimensionnement d'image avec préservation du ratio
   */
  private async resizeImage(
    ctx: CanvasRenderingContext2D,
    params: ResizeParams,
    currentWidth: number,
    currentHeight: number
  ): Promise<void> {
    const { width, height, maintainAspectRatio = true, resampleMethod = 'lanczos' } = params;
    
    let newWidth = width;
    let newHeight = height;
    
    if (maintainAspectRatio) {
      const aspectRatio = currentWidth / currentHeight;
      if (width && !height) {
        newHeight = width / aspectRatio;
      } else if (height && !width) {
        newWidth = height * aspectRatio;
      } else if (width && height) {
        const targetRatio = width / height;
        if (aspectRatio > targetRatio) {
          newHeight = width / aspectRatio;
        } else {
          newWidth = height * aspectRatio;
        }
      }
    }
    
    // Utilisation d'un algorithme de rééchantillonnage avancé
    if (resampleMethod === 'lanczos') {
      await this.lanczosResize(ctx, currentWidth, currentHeight, newWidth, newHeight);
    } else {
      // Redimensionnement standard
      const imageData = ctx.getImageData(0, 0, currentWidth, currentHeight);
      ctx.canvas.width = newWidth;
      ctx.canvas.height = newHeight;
      ctx.putImageData(imageData, 0, 0);
      ctx.drawImage(ctx.canvas, 0, 0, newWidth, newHeight);
    }
  }

  /**
   * Algorithme de redimensionnement Lanczos pour une meilleure qualité
   */
  private async lanczosResize(
    ctx: CanvasRenderingContext2D,
    srcWidth: number,
    srcHeight: number,
    destWidth: number,
    destHeight: number
  ): Promise<void> {
    // Implémentation simplifiée de Lanczos
    // En production, utiliser une bibliothèque spécialisée comme pica.js
    const srcImageData = ctx.getImageData(0, 0, srcWidth, srcHeight);
    const destImageData = ctx.createImageData(destWidth, destHeight);
    
    const xRatio = srcWidth / destWidth;
    const yRatio = srcHeight / destHeight;
    
    for (let destY = 0; destY < destHeight; destY++) {
      for (let destX = 0; destX < destWidth; destX++) {
        const srcX = destX * xRatio;
        const srcY = destY * yRatio;
        
        // Interpolation bilinéaire simplifiée
        const x1 = Math.floor(srcX);
        const y1 = Math.floor(srcY);
        const x2 = Math.min(x1 + 1, srcWidth - 1);
        const y2 = Math.min(y1 + 1, srcHeight - 1);
        
        const xWeight = srcX - x1;
        const yWeight = srcY - y1;
        
        for (let channel = 0; channel < 4; channel++) {
          const p1 = srcImageData.data[(y1 * srcWidth + x1) * 4 + channel];
          const p2 = srcImageData.data[(y1 * srcWidth + x2) * 4 + channel];
          const p3 = srcImageData.data[(y2 * srcWidth + x1) * 4 + channel];
          const p4 = srcImageData.data[(y2 * srcWidth + x2) * 4 + channel];
          
          const interpolated = 
            p1 * (1 - xWeight) * (1 - yWeight) +
            p2 * xWeight * (1 - yWeight) +
            p3 * (1 - xWeight) * yWeight +
            p4 * xWeight * yWeight;
          
          destImageData.data[(destY * destWidth + destX) * 4 + channel] = Math.round(interpolated);
        }
      }
    }
    
    ctx.canvas.width = destWidth;
    ctx.canvas.height = destHeight;
    ctx.putImageData(destImageData, 0, 0);
  }

  /**
   * Traitement vidéo avec FFmpeg
   */
  async processVideo(
    file: File,
    operations: VideoOperation[]
  ): Promise<ProcessingResult> {
    if (!this.ffmpegInstance) {
      throw new Error('FFmpeg non disponible');
    }
    
    try {
      const { fetchFile } = await import('@ffmpeg/ffmpeg');
      
      // Chargement du fichier dans FFmpeg
      const inputName = 'input.' + file.name.split('.').pop();
      await this.ffmpegInstance.FS('writeFile', inputName, await fetchFile(file));
      
      // Construction de la commande FFmpeg
      const command = this.buildFFmpegCommand(inputName, operations);
      
      // Exécution
      await this.ffmpegInstance.run(...command);
      
      // Récupération du résultat
      const outputName = 'output.' + (operations.find(op => op.type === 'format')?.params.format || 'mp4');
      const data = this.ffmpegInstance.FS('readFile', outputName);
      
      const blob = new Blob([data.buffer], { type: `video/${outputName.split('.').pop()}` });
      
      return {
        success: true,
        result: {
          blob,
          url: URL.createObjectURL(blob),
          metadata: {
            size: blob.size,
            format: blob.type
          }
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Construction de la commande FFmpeg
   */
  private buildFFmpegCommand(inputName: string, operations: VideoOperation[]): string[] {
    const command = ['-i', inputName];
    let outputName = 'output.mp4';
    
    operations.forEach(operation => {
      switch (operation.type) {
        case 'trim':
          command.push('-ss', operation.params.start.toString());
          if (operation.params.duration) {
            command.push('-t', operation.params.duration.toString());
          }
          break;
        case 'resize':
          command.push('-vf', `scale=${operation.params.width}:${operation.params.height}`);
          break;
        case 'format':
          outputName = `output.${operation.params.format}`;
          if (operation.params.codec) {
            command.push('-c:v', operation.params.codec);
          }
          break;
        case 'quality':
          command.push('-crf', operation.params.crf.toString());
          break;
        case 'fps':
          command.push('-r', operation.params.fps.toString());
          break;
      }
    });
    
    command.push(outputName);
    return command;
  }

  /**
   * Traitement audio avec analyse spectrale
   */
  async processAudio(
    file: File,
    operations: AudioOperation[]
  ): Promise<ProcessingResult> {
    try {
      const audioContext = new AudioContext();
      const arrayBuffer = await file.arrayBuffer();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      
      let processedBuffer = audioBuffer;
      
      // Application des opérations audio
      for (const operation of operations) {
        processedBuffer = await this.applyAudioOperation(audioContext, processedBuffer, operation);
      }
      
      // Conversion en blob
      const blob = await this.audioBufferToBlob(processedBuffer);
      
      return {
        success: true,
        result: {
          blob,
          url: URL.createObjectURL(blob),
          metadata: {
            duration: processedBuffer.duration,
            sampleRate: processedBuffer.sampleRate,
            channels: processedBuffer.numberOfChannels,
            size: blob.size
          }
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Application d'une opération audio
   */
  private async applyAudioOperation(
    audioContext: AudioContext,
    audioBuffer: AudioBuffer,
    operation: AudioOperation
  ): Promise<AudioBuffer> {
    switch (operation.type) {
      case 'normalize':
        return this.normalizeAudio(audioContext, audioBuffer, operation.params);
      case 'fade':
        return this.fadeAudio(audioContext, audioBuffer, operation.params);
      case 'filter':
        return this.filterAudio(audioContext, audioBuffer, operation.params);
      case 'trim':
        return this.trimAudio(audioContext, audioBuffer, operation.params);
      default:
        return audioBuffer;
    }
  }

  /**
   * Normalisation audio
   */
  private normalizeAudio(
    audioContext: AudioContext,
    audioBuffer: AudioBuffer,
    params: NormalizeParams
  ): AudioBuffer {
    const { targetLevel = -3 } = params;
    const newBuffer = audioContext.createBuffer(
      audioBuffer.numberOfChannels,
      audioBuffer.length,
      audioBuffer.sampleRate
    );
    
    // Calcul du niveau maximum
    let maxLevel = 0;
    for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
      const channelData = audioBuffer.getChannelData(channel);
      for (let i = 0; i < channelData.length; i++) {
        maxLevel = Math.max(maxLevel, Math.abs(channelData[i]));
      }
    }
    
    // Calcul du gain de normalisation
    const targetLinear = Math.pow(10, targetLevel / 20);
    const gain = targetLinear / maxLevel;
    
    // Application du gain
    for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
      const inputData = audioBuffer.getChannelData(channel);
      const outputData = newBuffer.getChannelData(channel);
      
      for (let i = 0; i < inputData.length; i++) {
        outputData[i] = inputData[i] * gain;
      }
    }
    
    return newBuffer;
  }

  /**
   * Conversion AudioBuffer vers Blob
   */
  private async audioBufferToBlob(audioBuffer: AudioBuffer): Promise<Blob> {
    const numberOfChannels = audioBuffer.numberOfChannels;
    const length = audioBuffer.length * numberOfChannels * 2;
    const buffer = new ArrayBuffer(44 + length);
    const view = new DataView(buffer);
    
    // En-tête WAV
    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };
    
    writeString(0, 'RIFF');
    view.setUint32(4, 36 + length, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, numberOfChannels, true);
    view.setUint32(24, audioBuffer.sampleRate, true);
    view.setUint32(28, audioBuffer.sampleRate * numberOfChannels * 2, true);
    view.setUint16(32, numberOfChannels * 2, true);
    view.setUint16(34, 16, true);
    writeString(36, 'data');
    view.setUint32(40, length, true);
    
    // Données audio
    let offset = 44;
    for (let i = 0; i < audioBuffer.length; i++) {
      for (let channel = 0; channel < numberOfChannels; channel++) {
        const sample = Math.max(-1, Math.min(1, audioBuffer.getChannelData(channel)[i]));
        view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
        offset += 2;
      }
    }
    
    return new Blob([buffer], { type: 'audio/wav' });
  }
}

/**
 * Types pour les opérations de traitement
 */
export interface ImageOperation {
  type: 'resize' | 'crop' | 'rotate' | 'flip' | 'filter' | 'adjust' | 'enhance';
  params: any;
}

export interface VideoOperation {
  type: 'trim' | 'resize' | 'format' | 'quality' | 'fps' | 'filter';
  params: any;
}

export interface AudioOperation {
  type: 'normalize' | 'fade' | 'filter' | 'trim' | 'enhance';
  params: any;
}

export interface ProcessingResult {
  success: boolean;
  result?: {
    blob: Blob;
    url: string;
    metadata: any;
  };
  error?: string;
}
```

---

## 🗄️ Gestion d'État Complexe avec Zustand

### Store Principal de l'Éditeur

```typescript
// src/editor/store/editorStore.ts

import { create } from 'zustand';
import { subscribeWithSelector, devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { EditorState, EditorConfig, EditorDocument, ContentBlock } from '../types/editor';

interface EditorStore extends EditorState {
  // Configuration
  config: EditorConfig;
  setConfig: (config: Partial<EditorConfig>) => void;
  
  // Document
  loadDocument: (document: EditorDocument) => void;
  saveDocument: () => Promise<void>;
  createNewDocument: () => void;
  
  // Blocs
  addBlock: (block: Omit<ContentBlock, 'id'>) => void;
  updateBlock: (id: string, updates: Partial<ContentBlock>) => void;
  deleteBlock: (id: string) => void;
  moveBlock: (id: string, position: { x: number; y: number }) => void;
  duplicateBlock: (id: string) => void;
  
  // Sélection
  selectBlock: (id: string) => void;
  selectMultiple: (ids: string[]) => void;
  toggleBlockSelection: (id: string) => void;
  clearSelection: () => void;
  selectAll: () => void;
  
  // Historique
  undo: () => void;
  redo: () => void;
  addHistoryStep: (action: string, data: any) => void;
  
  // Interface utilisateur
  setZoom: (zoom: number) => void;
  toggleGrid: () => void;
  toggleRuler: () => void;
  togglePan