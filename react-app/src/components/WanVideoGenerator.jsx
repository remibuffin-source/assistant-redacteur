import React, { useState } from 'react';
import axios from 'axios';
import './WanVideoGenerator.css';

const WanVideoGenerator = ({ user, onCreditsUpdate }) => {
  const [model, setModel] = useState('text-to-video');
  const [prompt, setPrompt] = useState('');
  const [resolution, setResolution] = useState('720p');
  const [duration, setDuration] = useState(5);
  const [aspectRatio, setAspectRatio] = useState('16:9');
  const [seed, setSeed] = useState('');
  const [multiShots, setMultiShots] = useState(false);
  const [enableAudio, setEnableAudio] = useState(true);
  const [imageFile, setImageFile] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [imageUrl, setImageUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [taskId, setTaskId] = useState(null);
  const [taskStatus, setTaskStatus] = useState(null);
  const [videoResult, setVideoResult] = useState(null);
  const [error, setError] = useState(null);

  const calculateCredits = () => {
    const baseCosts = {
      '720p-5': 0.35,
      '720p-10': 0.70,
      '720p-15': 1.05,
      '1080p-5': 0.53,
      '1080p-10': 1.05,
      '1080p-15': 1.58
    };
    const key = `${resolution}-${duration}`;
    const cost = baseCosts[key] || 0.35;
    const margin = 100;
    return Math.ceil((cost * (1 + margin / 100)) / 0.01);
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('Le prompt est requis');
      return;
    }

    if (model === 'image-to-video' && !imageFile && !imageUrl) {
      setError('Une image est requise pour Image-to-Video');
      return;
    }

    if (model === 'video-to-video' && !videoFile && !videoUrl) {
      setError('Une vidéo est requise pour Video-to-Video');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setTaskId(null);
    setTaskStatus(null);
    setVideoResult(null);

    try {
      const formData = new FormData();
      formData.append('prompt', prompt);
      formData.append('resolution', resolution);
      formData.append('duration', duration);
      formData.append('aspectRatio', aspectRatio);
      formData.append('multiShots', multiShots);
      formData.append('enableAudio', enableAudio);

      if (seed) {
        formData.append('seed', seed);
      }

      if (model === 'image-to-video') {
        if (imageFile) {
          formData.append('image', imageFile);
        } else if (imageUrl) {
          formData.append('imageUrl', imageUrl);
        }
      }

      if (model === 'video-to-video') {
        if (videoFile) {
          formData.append('video', videoFile);
        } else if (videoUrl) {
          formData.append('videoUrl', videoUrl);
        }
      }

      const endpoint = model === 'text-to-video' 
        ? '/api/wan/text-to-video'
        : model === 'image-to-video'
        ? '/api/wan/image-to-video'
        : '/api/wan/video-to-video';

      const response = await axios.post(endpoint, formData, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      setTaskId(response.data.taskId);
      
      if (onCreditsUpdate) {
        onCreditsUpdate(user.credits - response.data.creditsUsed);
      }

      pollTaskStatus(response.data.taskId);

    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors de la génération');
      setIsGenerating(false);
    }
  };

  const pollTaskStatus = async (id) => {
    const maxAttempts = 60;
    let attempts = 0;

    const poll = async () => {
      try {
        const response = await axios.get(`/api/wan/task/${id}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        const task = response.data.task;
        setTaskStatus(task.state);

        if (task.state === 'success') {
          setVideoResult(task.resultJson);
          setIsGenerating(false);
        } else if (task.state === 'fail') {
          setError(`Génération échouée: ${task.failMsg}`);
          setIsGenerating(false);
        } else if (attempts < maxAttempts) {
          attempts++;
          setTimeout(poll, attempts < 10 ? 3000 : 5000);
        } else {
          setError('Timeout: la génération prend trop de temps');
          setIsGenerating(false);
        }
      } catch (err) {
        setError('Erreur lors de la vérification du statut');
        setIsGenerating(false);
      }
    };

    poll();
  };

  const creditsNeeded = calculateCredits();

  return (
    <div className="wan-video-generator">
      <div className="wan-header">
        <h2>🎬 Génération Vidéo WAN 2.6</h2>
        <div className="credits-display">
          <i className="fas fa-coins"></i>
          <span>{user?.credits || 0} crédits</span>
        </div>
      </div>

      {error && (
        <div className="wan-error">
          <i className="fas fa-exclamation-circle"></i>
          {error}
        </div>
      )}

      <div className="wan-form">
        <div className="form-group">
          <label>Modèle</label>
          <select value={model} onChange={(e) => setModel(e.target.value)} disabled={isGenerating}>
            <option value="text-to-video">Text-to-Video</option>
            <option value="image-to-video">Image-to-Video</option>
            <option value="video-to-video">Video-to-Video</option>
          </select>
        </div>

        <div className="form-group">
          <label>Prompt *</label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Décrivez la vidéo que vous souhaitez générer..."
            rows={4}
            disabled={isGenerating}
          />
        </div>

        {model === 'image-to-video' && (
          <div className="form-group">
            <label>Image source</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files[0])}
              disabled={isGenerating}
            />
            <small>ou</small>
            <input
              type="text"
              placeholder="URL de l'image"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              disabled={isGenerating}
            />
          </div>
        )}

        {model === 'video-to-video' && (
          <div className="form-group">
            <label>Vidéo source</label>
            <input
              type="file"
              accept="video/*"
              onChange={(e) => setVideoFile(e.target.files[0])}
              disabled={isGenerating}
            />
            <small>ou</small>
            <input
              type="text"
              placeholder="URL de la vidéo"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              disabled={isGenerating}
            />
          </div>
        )}

        <div className="form-row">
          <div className="form-group">
            <label>Résolution</label>
            <select value={resolution} onChange={(e) => setResolution(e.target.value)} disabled={isGenerating}>
              <option value="720p">720p</option>
              <option value="1080p">1080p</option>
            </select>
          </div>

          <div className="form-group">
            <label>Durée</label>
            <select value={duration} onChange={(e) => setDuration(parseInt(e.target.value))} disabled={isGenerating}>
              <option value={5}>5 secondes</option>
              <option value={10}>10 secondes</option>
              <option value={15}>15 secondes</option>
            </select>
          </div>

          <div className="form-group">
            <label>Ratio d'aspect</label>
            <select value={aspectRatio} onChange={(e) => setAspectRatio(e.target.value)} disabled={isGenerating}>
              <option value="16:9">16:9 (Paysage)</option>
              <option value="9:16">9:16 (Portrait)</option>
              <option value="1:1">1:1 (Carré)</option>
              <option value="auto">Auto</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label>Seed (optionnel)</label>
          <input
            type="number"
            placeholder="10000-99999"
            value={seed}
            onChange={(e) => setSeed(e.target.value)}
            min="10000"
            max="99999"
            disabled={isGenerating}
          />
        </div>

        <div className="form-checkboxes">
          <label>
            <input
              type="checkbox"
              checked={multiShots}
              onChange={(e) => setMultiShots(e.target.checked)}
              disabled={isGenerating}
            />
            Multi-plans (cinématique)
          </label>
          <label>
            <input
              type="checkbox"
              checked={enableAudio}
              onChange={(e) => setEnableAudio(e.target.checked)}
              disabled={isGenerating}
            />
            Audio natif
          </label>
        </div>

        <div className="wan-cost-info">
          <i className="fas fa-info-circle"></i>
          <span>Coût estimé: <strong>{creditsNeeded} crédits</strong></span>
        </div>

        <button
          className="wan-generate-btn"
          onClick={handleGenerate}
          disabled={isGenerating || (user?.credits || 0) < creditsNeeded}
          style={{ opacity: isGenerating ? 0.7 : 1 }}
        >
          {isGenerating ? (
            <>
              <i className="fas fa-spinner fa-spin"></i> Génération en cours...
            </>
          ) : (
            <>
              <i className="fas fa-video"></i> Générer la vidéo
            </>
          )}
        </button>

        {taskId && (
          <div className="wan-status">
            <p>Tâche ID: <code>{taskId}</code></p>
            <p>Statut: <strong>{taskStatus || 'queuing'}</strong></p>
          </div>
        )}

        {videoResult && videoResult.resultUrls && (
          <div className="wan-result">
            <h3>✅ Vidéo générée avec succès !</h3>
            {videoResult.resultUrls.map((url, index) => (
              <div key={index} className="video-container">
                <video controls src={url} style={{ maxWidth: '100%', borderRadius: '8px' }} />
                <a href={url} target="_blank" rel="noopener noreferrer" className="download-btn">
                  <i className="fas fa-download"></i> Télécharger
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WanVideoGenerator;
