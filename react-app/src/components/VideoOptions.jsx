import { useState } from 'react';
import './VideoOptions.css';

export default function VideoOptions({ videoOptions, setVideoOptions, contentTypes }) {
  const isVideoMode = contentTypes?.video;

  if (!isVideoMode) return null;

  const handleProviderChange = (provider) => {
    setVideoOptions(prev => ({
      ...prev,
      provider
    }));
  };

  const handleOptionChange = (key, value) => {
    setVideoOptions(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return (
    <div className="section video-options-section">
      <h3>
        <i className="fas fa-video"></i> Options de génération vidéo
      </h3>

      {/* Sélecteur de provider (WAN 2.6 ou Veo 3.1) */}
      <div className="video-provider-selector">
        <label>Modèle vidéo :</label>
        <div className="provider-buttons">
          <button
            className={`provider-btn ${videoOptions.provider === 'wan' ? 'selected' : ''}`}
            onClick={() => handleProviderChange('wan')}
          >
            <i className="fas fa-film"></i>
            <span>WAN 2.6</span>
          </button>
          <button
            className={`provider-btn ${videoOptions.provider === 'veo' ? 'selected' : ''}`}
            onClick={() => handleProviderChange('veo')}
          >
            <i className="fas fa-video"></i>
            <span>Veo 3.1</span>
          </button>
        </div>
      </div>

      {/* Options WAN 2.6 */}
      {videoOptions.provider === 'wan' && (
        <div className="wan-options">
          {/* Ligne 1 : Type, Ratio, Durée */}
          <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px', marginBottom: '15px'}}>
            <div className="option-group">
              <label>Type de génération :</label>
              <select
                value={videoOptions.wanModel}
                onChange={(e) => handleOptionChange('wanModel', e.target.value)}
              >
                <option value="text-to-video">Texte vers vidéo</option>
                <option value="image-to-video">Image vers vidéo</option>
                <option value="video-to-video">Vidéo vers vidéo</option>
              </select>
            </div>

            <div className="option-group">
              <label>Ratio d'aspect :</label>
              <select
                value={videoOptions.ratio}
                onChange={(e) => handleOptionChange('ratio', e.target.value)}
              >
                <option value="16:9">16:9 (Paysage)</option>
                <option value="9:16">9:16 (Portrait)</option>
                <option value="1:1">1:1 (Carré)</option>
              </select>
            </div>

            <div className="option-group">
              <label>Durée (secondes) :</label>
              <input
                type="number"
                min="3"
                max="10"
                value={videoOptions.duration}
                onChange={(e) => handleOptionChange('duration', parseInt(e.target.value))}
              />
            </div>
          </div>

          {/* Ligne 2 : Résolution, Multi-plans, Audio */}
          <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px', marginBottom: '15px'}}>
            <div className="option-group">
              <label>Résolution :</label>
              <select
                value={videoOptions.resolution}
                onChange={(e) => handleOptionChange('resolution', e.target.value)}
              >
                <option value="720p">720p</option>
                <option value="1080p">1080p</option>
              </select>
            </div>

            <div className="option-group">
              <label>
                <input
                  type="checkbox"
                  checked={videoOptions.multiShots}
                  onChange={(e) => handleOptionChange('multiShots', e.target.checked)}
                />
                Multi-plans
              </label>
            </div>

            <div className="option-group">
              <label>
                <input
                  type="checkbox"
                  checked={videoOptions.enableAudio}
                  onChange={(e) => handleOptionChange('enableAudio', e.target.checked)}
                />
                Activer l'audio
              </label>
            </div>
          </div>

          {/* Ligne 3 : Seed */}
          <div className="option-group">
            <label>Seed (optionnel) :</label>
            <input
              type="number"
              placeholder="Laisser vide pour aléatoire"
              value={videoOptions.seed || ''}
              onChange={(e) => handleOptionChange('seed', e.target.value ? parseInt(e.target.value) : null)}
            />
          </div>
        </div>
      )}

      {/* Options Veo 3.1 */}
      {videoOptions.provider === 'veo' && (
        <div className="veo-options">
          {/* Ligne 1 : Modèle, Type, Ratio */}
          <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px', marginBottom: '15px'}}>
            <div className="option-group">
              <label>Modèle Veo :</label>
              <select
                value={videoOptions.veoModel}
                onChange={(e) => handleOptionChange('veoModel', e.target.value)}
              >
                <option value="veo3_fast">Fast (~50 crédits)</option>
                <option value="veo3">Quality (~100 crédits)</option>
              </select>
            </div>

            <div className="option-group">
              <label>Type de génération :</label>
              <select
                value={videoOptions.veoGenerationType}
                onChange={(e) => handleOptionChange('veoGenerationType', e.target.value)}
              >
                <option value="TEXT_2_VIDEO">Texte vers vidéo</option>
                <option value="FIRST_AND_LAST_FRAMES_2_VIDEO">Image(s) vers vidéo</option>
              </select>
            </div>

            <div className="option-group">
              <label>Ratio d'aspect :</label>
              <select
                value={videoOptions.ratio}
                onChange={(e) => handleOptionChange('ratio', e.target.value)}
              >
                <option value="16:9">16:9 (Paysage)</option>
                <option value="9:16">9:16 (Portrait)</option>
                <option value="Auto">Auto</option>
              </select>
            </div>
          </div>

          {/* Ligne 2 : Durée, Seed, Filigrane */}
          <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px', marginBottom: '15px'}}>
            <div className="option-group">
              <label>Durée :</label>
              <select
                value={videoOptions.duration || 5}
                onChange={(e) => handleOptionChange('duration', parseInt(e.target.value))}
              >
                <option value="5">5 secondes</option>
                <option value="10">10 secondes</option>
              </select>
            </div>

            <div className="option-group">
              <label>Seed (optionnel) :</label>
              <input
                type="number"
                min="10000"
                max="99999"
                placeholder="Aléatoire"
                value={videoOptions.seed || ''}
                onChange={(e) => handleOptionChange('seed', e.target.value ? parseInt(e.target.value) : null)}
              />
            </div>

            <div className="option-group">
              <label>Filigrane (optionnel) :</label>
              <input
                type="text"
                placeholder="Texte du filigrane"
                value={videoOptions.watermark || ''}
                onChange={(e) => handleOptionChange('watermark', e.target.value)}
              />
            </div>
          </div>

          {/* Ligne 3 : Traduction */}
          <div className="option-group">
            <label>
              <input
                type="checkbox"
                checked={videoOptions.enableTranslation}
                onChange={(e) => handleOptionChange('enableTranslation', e.target.checked)}
              />
              Traduction automatique en anglais
            </label>
          </div>
        </div>
      )}

      {/* Informations sur les crédits */}
      <div className="credits-info">
        <i className="fas fa-info-circle"></i>
        {videoOptions.provider === 'wan' && (
          <span>WAN 2.6 : ~30-50 crédits par vidéo selon la durée et résolution</span>
        )}
        {videoOptions.provider === 'veo' && (
          <span>
            Veo 3.1 : {videoOptions.veoModel === 'veo3_fast' ? '~50 crédits' : '~100 crédits'} par vidéo
          </span>
        )}
      </div>
    </div>
  );
}
