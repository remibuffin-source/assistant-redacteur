import React from 'react';
import './ImagePersonalization.css';

// Tarifs indicatifs GPT Image 2.6 par image (base 1024×1024)
const GPT_QUALITY_PRICES = {
  low: '≈ 0,006 $/image (1024×1024)',
  medium: '≈ 0,053 $/image (1024×1024)',
  high: '≈ 0,211 $/image (1024×1024)',
  xhigh: '≈ 0,32 $/image (estimation)',
  max: '≈ 0,45 $/image (estimation)'
};

/**
 * Composant de personnalisation avancée pour la génération d'images et vidéos
 * Permet de modifier automatiquement le prompt avec des options prédéfinies
 * Inclut également les options de génération (nombre, format, taille, durée pour vidéo)
 */
const ImagePersonalization = ({ options, onOptionsChange, imageOptions, onImageOptionsChange, selectedAI = '', attachedFiles = [], isVideoMode = false }) => {
  // Vérifier si des images de référence sont attachées
  const hasReferenceImages = attachedFiles.some(f => f.type?.startsWith('image/'));
  const hasReferenceVideos = attachedFiles.some(f => f.type?.startsWith('video/'));
  // SeedDream edit et Nano Banana supportent les images de référence
  const supportsReferenceImages = selectedAI === 'seedream-edit' || selectedAI === 'nano-banana' || selectedAI === 'gpt-image-2.6' || isVideoMode;
  
  // Modèles WAN 2.6 disponibles
  const wanModels = [
    { 
      value: 'text-to-video', 
      label: 'Text-to-Video', 
      icon: 'fa-keyboard',
      tooltip: 'Génère des vidéos cinématiques à partir de descriptions textuelles. Supporte les prompts multi-plans, storyboards et direction de caméra. Idéal pour créer du contenu original.'
    },
    { 
      value: 'image-to-video', 
      label: 'Image-to-Video', 
      icon: 'fa-image',
      tooltip: 'Anime une image statique en mouvement. Préserve l\'identité du sujet, les traits faciaux et les textures. Parfait pour donner vie à vos photos.'
    },
    { 
      value: 'video-to-video', 
      label: 'Video-to-Video', 
      icon: 'fa-film',
      tooltip: 'Transforme des vidéos existantes avec de nouveaux styles ou effets. Préserve le timing et la structure originale. Idéal pour le re-stylage.'
    }
  ];

  const handleChange = (field, value) => {
    onOptionsChange({ ...options, [field]: value });
  };

  const handleImageOptionChange = (field, value) => {
    if (onImageOptionsChange) {
      onImageOptionsChange({ ...imageOptions, [field]: value });
    }
  };

  const toggleArrayOption = (field, value) => {
    const currentArray = options[field] || [];
    const newArray = currentArray.includes(value)
      ? currentArray.filter(v => v !== value)
      : [...currentArray, value];
    onOptionsChange({ ...options, [field]: newArray });
  };

  return (
    <div className="section-compact image-personalization-section">
      <h3 className="section-title-compact">
        <i className={`fas ${isVideoMode ? 'fa-video' : 'fa-image'}`}></i>
        {isVideoMode ? 'Options de génération vidéo WAN 2.6' : 'Options de génération d\'image'}
      </h3>
      
      <div className="image-personalization-grid">
        {/* OPTIONS SPÉCIFIQUES WAN 2.6 (MODE VIDÉO) */}
        {isVideoMode && (
          <>
            {/* LIGNE 0 : Modèle WAN + Options avancées sur même ligne */}
            <div className="option-row option-row-wan-compact">
              {/* Choix du modèle WAN */}
              <div className="option-group option-group-wan-model">
                <label>
                  Modèle
                  <span className="info-icon" title="Choisissez le type de génération vidéo">
                    <i className="fas fa-info-circle"></i>
                  </span>
                </label>
                <div className="option-controls wan-model-controls-compact">
                  {wanModels.map(model => (
                    <button
                      key={model.value}
                      className={`option-btn option-btn-wan-model-compact ${(options.wanModel || 'text-to-video') === model.value ? 'active' : ''}`}
                      onClick={() => handleChange('wanModel', model.value)}
                      title={model.tooltip}
                    >
                      <i className={`fas ${model.icon}`}></i> {model.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Options avancées WAN (sur même ligne) */}
              <div className="option-group option-group-wan-advanced">
                <label>Options</label>
                <div className="option-controls wan-advanced-controls-compact">
                  <button
                    className={`option-btn option-btn-toggle-compact ${options.multiShots !== false ? 'active' : ''}`}
                    onClick={() => handleChange('multiShots', !options.multiShots)}
                    title="Multi-plans : Plusieurs angles de caméra"
                  >
                    <i className="fas fa-th-large"></i> Multi
                  </button>
                  <button
                    className={`option-btn option-btn-toggle-compact ${options.enableAudio !== false ? 'active' : ''}`}
                    onClick={() => handleChange('enableAudio', !options.enableAudio)}
                    title="Audio natif : Bande sonore générée"
                  >
                    <i className="fas fa-volume-up"></i> Audio
                  </button>
                  <div className="seed-input-group-compact">
                    <i className="fas fa-dice" title="Seed pour reproduire la même vidéo"></i>
                    <input
                      type="number"
                      className="seed-input-compact"
                      placeholder="Seed"
                      min="10000"
                      max="99999"
                      value={options.seed || ''}
                      onChange={(e) => handleChange('seed', e.target.value ? parseInt(e.target.value) : null)}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* LIGNE 1 VIDEO : Format + Durée + Résolution */}
            <div className="option-row option-row-triple">
              {/* Format / Ratio vidéo */}
              <div className="option-group option-group-format">
                <label>Format</label>
                <div className="option-controls format-controls">
                  <button
                    className={`option-btn option-btn-format ${(imageOptions.ratio || '16:9') === '16:9' ? 'active' : ''}`}
                    onClick={() => handleImageOptionChange('ratio', '16:9')}
                    title="Paysage (16:9) - YouTube, TV"
                  >
                    <i className="fas fa-desktop"></i> 16:9
                  </button>
                  <button
                    className={`option-btn option-btn-format ${imageOptions.ratio === '9:16' ? 'active' : ''}`}
                    onClick={() => handleImageOptionChange('ratio', '9:16')}
                    title="Portrait (9:16) - TikTok, Reels, Shorts"
                  >
                    <i className="fas fa-mobile-alt"></i> 9:16
                  </button>
                  <button
                    className={`option-btn option-btn-format ${imageOptions.ratio === '1:1' ? 'active' : ''}`}
                    onClick={() => handleImageOptionChange('ratio', '1:1')}
                    title="Carré (1:1) - Instagram"
                  >
                    <i className="far fa-square"></i> 1:1
                  </button>
                </div>
              </div>

              {/* Durée de la vidéo */}
              <div className="option-group option-group-duration">
                <label>
                  Durée
                  <span className="info-icon" title="Durée de la vidéo générée. Plus long = plus de crédits">
                    <i className="fas fa-info-circle"></i>
                  </span>
                </label>
                <div className="option-controls duration-controls">
                  {[
                    { value: 5, label: '5s', credits: '~140 cr.' },
                    { value: 10, label: '10s', credits: '~280 cr.' },
                    { value: 15, label: '15s', credits: '~420 cr.' }
                  ].map(dur => (
                    <button
                      key={dur.value}
                      className={`option-btn option-btn-duration ${(imageOptions.duration || 5) === dur.value ? 'active' : ''}`}
                      onClick={() => handleImageOptionChange('duration', dur.value)}
                      title={`Durée ${dur.label} - ${dur.credits}`}
                    >
                      <i className="fas fa-clock"></i> {dur.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Résolution vidéo */}
              <div className="option-group option-group-resolution">
                <label>
                  Résolution
                  <span className="info-icon" title="720p = HD, 1080p = Full HD (plus cher)">
                    <i className="fas fa-info-circle"></i>
                  </span>
                </label>
                <div className="option-controls resolution-controls">
                  <button
                    className={`option-btn option-btn-resolution ${(imageOptions.resolution || '720p') === '720p' ? 'active' : ''}`}
                    onClick={() => handleImageOptionChange('resolution', '720p')}
                    title="720p HD - Économique"
                  >
                    <i className="fas fa-tv"></i> 720p
                  </button>
                  <button
                    className={`option-btn option-btn-resolution ${imageOptions.resolution === '1080p' ? 'active' : ''}`}
                    onClick={() => handleImageOptionChange('resolution', '1080p')}
                    title="1080p Full HD - Qualité supérieure (+50% crédits)"
                  >
                    <i className="fas fa-film"></i> 1080p
                  </button>
                </div>
              </div>
            </div>

            {/* Info sur les fichiers de référence */}
            {(hasReferenceImages || hasReferenceVideos) && (
              <div className="option-row">
                <div className="reference-info">
                  <i className="fas fa-info-circle"></i>
                  {hasReferenceImages && !hasReferenceVideos && (
                    <span>Image de référence détectée → Mode <strong>Image-to-Video</strong> recommandé</span>
                  )}
                  {hasReferenceVideos && (
                    <span>Vidéo de référence détectée → Mode <strong>Video-to-Video</strong> recommandé</span>
                  )}
                </div>
              </div>
            )}
          </>
        )}

        {/* OPTIONS DE GÉNÉRATION D'IMAGES (mode image uniquement) */}
        {!isVideoMode && imageOptions && (
          <>
            {/* LIGNE 1 : Nombre + Format + Taille */}
            <div className="option-row option-row-triple">
              {/* Nombre d'images (doublé) */}
              <div className="option-group option-group-number">
                <label>Nombre</label>
                <div className="option-controls">
                  {[1, 2, 3, 4].map(num => (
                    <button
                      key={num}
                      className={`option-btn option-btn-count ${imageOptions.count === num ? 'active' : ''}`}
                      onClick={() => handleImageOptionChange('count', num)}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>

              {/* Format / Ratio — masqué pour GPT Image (tailles dédiées) */}
              {selectedAI !== 'gpt-image-2.6' && (<>
              <div className="option-group option-group-format">
                <label>Format</label>
                <div className="option-controls format-controls">
                  <button
                    className={`option-btn option-btn-format ${imageOptions.ratio === '1:1' ? 'active' : ''}`}
                    onClick={() => handleImageOptionChange('ratio', '1:1')}
                    title="Carré (1:1)"
                  >
                    <i className="far fa-square"></i> 1:1
                  </button>
                  <button
                    className={`option-btn option-btn-format ${imageOptions.ratio === '4:3' ? 'active' : ''}`}
                    onClick={() => handleImageOptionChange('ratio', '4:3')}
                    title="TV classique (4:3)"
                  >
                    <i className="fas fa-tv"></i> 4:3
                  </button>
                  <button
                    className={`option-btn option-btn-format ${imageOptions.ratio === '16:9' ? 'active' : ''}`}
                    onClick={() => handleImageOptionChange('ratio', '16:9')}
                    title="Écran large (16:9)"
                  >
                    <i className="fas fa-desktop"></i> 16:9
                  </button>
                  <button
                    className={`option-btn option-btn-format ${imageOptions.ratio === '3:4' ? 'active' : ''}`}
                    onClick={() => handleImageOptionChange('ratio', '3:4')}
                    title="Portrait (3:4)"
                  >
                    <i className="fas fa-portrait"></i> 3:4
                  </button>
                  <button
                    className={`option-btn option-btn-format ${imageOptions.ratio === '9:16' ? 'active' : ''}`}
                    onClick={() => handleImageOptionChange('ratio', '9:16')}
                    title="Mobile (9:16)"
                  >
                    <i className="fas fa-mobile-alt"></i> 9:16
                  </button>
                </div>
              </div>

              {/* Taille / Résolution v5 */}
              <div className="option-group option-group-size-full">
                <label>
                  Résolution
                  <span className="info-icon" title="auto_2K ≈ 2560px, auto_3K ≈ 3072px, auto_4K ≈ 4096px. Les presets ajustent automatiquement la résolution selon le ratio.">
                    <i className="fas fa-info-circle"></i>
                  </span>
                </label>
                <div className="option-controls">
                  <button
                    className={`option-btn ${(imageOptions.size || 'auto_2K') === 'auto_2K' ? 'active' : ''}`}
                    onClick={() => handleImageOptionChange('size', 'auto_2K')}
                    title="Auto 2K (~2560px) - Qualité standard"
                  >
                    2K
                  </button>
                  <button
                    className={`option-btn ${imageOptions.size === 'auto_3K' ? 'active' : ''}`}
                    onClick={() => handleImageOptionChange('size', 'auto_3K')}
                    title="Auto 3K (~3072px) - Haute résolution"
                  >
                    3K
                  </button>
                  <button
                    className={`option-btn ${imageOptions.size === 'auto_4K' ? 'active' : ''}`}
                    onClick={() => handleImageOptionChange('size', 'auto_4K')}
                    title="Auto 4K (~4096px) - Très haute résolution"
                  >
                    4K
                  </button>
                </div>
              </div>
              </>)}
            </div>

            {/* LIGNE GPT IMAGE 2.6 : modèle, qualité, complexité, taille, fond, format */}
            {selectedAI === 'gpt-image-2.6' && (
              <>
                <div className="option-row">
                  <div className="option-group" style={{ flex: 1 }}>
                    <label>Modèle GPT Image</label>
                    <div className="option-controls">
                      <button
                        className={`option-btn ${(imageOptions.gptModel || 'gpt-image-2.6-flare') === 'gpt-image-2.6-flare' ? 'active' : ''}`}
                        onClick={() => handleImageOptionChange('gptModel', 'gpt-image-2.6-flare')}
                        title="Flare : rapide, idéal pour l'itération"
                      >
                        <i className="fas fa-bolt"></i> Flare
                      </button>
                      <button
                        className={`option-btn ${imageOptions.gptModel === 'gpt-image-2.6-sunburst' ? 'active' : ''}`}
                        onClick={() => handleImageOptionChange('gptModel', 'gpt-image-2.6-sunburst')}
                        title="Sunburst : précision d'édition et détails"
                      >
                        <i className="fas fa-sun"></i> Sunburst
                      </button>
                    </div>
                  </div>
                  <div className="option-group" style={{ flex: 1 }}>
                    <label>
                      Qualité
                      <span className="info-icon" title="Tarifs indicatifs par image : low ≈ 0,006 $ · medium ≈ 0,053 $ · high ≈ 0,211 $ · xhigh/max au-delà.">
                        <i className="fas fa-info-circle"></i>
                      </span>
                    </label>
                    <div className="option-controls">
                      {['low', 'medium', 'high', 'xhigh', 'max'].map(q => (
                        <button
                          key={q}
                          className={`option-btn ${(imageOptions.gptQuality || 'medium') === q ? 'active' : ''}`}
                          onClick={() => handleImageOptionChange('gptQuality', q)}
                          title={GPT_QUALITY_PRICES[q]}
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="option-row">
                  <div className="option-group" style={{ flex: 1 }}>
                    <label>Complexité</label>
                    <div className="option-controls">
                      {['low', 'medium', 'high'].map(c => (
                        <button
                          key={c}
                          className={`option-btn ${(imageOptions.gptComplexity || 'high') === c ? 'active' : ''}`}
                          onClick={() => handleImageOptionChange('gptComplexity', c)}
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="option-group" style={{ flex: 1 }}>
                    <label>Taille</label>
                    <div className="option-controls">
                      {[
                        { v: '1024x1024', l: 'Carré' },
                        { v: '1536x1024', l: 'Paysage' },
                        { v: '1024x1536', l: 'Portrait' },
                        { v: 'auto', l: 'Auto' }
                      ].map(s => (
                        <button
                          key={s.v}
                          className={`option-btn ${(imageOptions.gptSize || '1024x1024') === s.v ? 'active' : ''}`}
                          onClick={() => handleImageOptionChange('gptSize', s.v)}
                        >
                          {s.l}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="option-row">
                  <div className="option-group" style={{ flex: 1 }}>
                    <label>Fond</label>
                    <div className="option-controls">
                      {[
                        { v: 'auto', l: 'Auto' },
                        { v: 'opaque', l: 'Opaque' },
                        { v: 'transparent', l: 'Transparent' }
                      ].map(b => (
                        <button
                          key={b.v}
                          className={`option-btn ${(imageOptions.gptBackground || 'auto') === b.v ? 'active' : ''}`}
                          onClick={() => handleImageOptionChange('gptBackground', b.v)}
                          title={b.v === 'transparent' ? 'Fond transparent : force automatiquement le format PNG' : undefined}
                        >
                          {b.l}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="option-group" style={{ flex: 1 }}>
                    <label>Format fichier</label>
                    <div className="option-controls">
                      {['png', 'jpeg', 'webp'].map(f => (
                        <button
                          key={f}
                          className={`option-btn ${(imageOptions.gptFormat || 'png') === f ? 'active' : ''}`}
                          onClick={() => handleImageOptionChange('gptFormat', f)}
                        >
                          {f.toUpperCase()}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* LIGNE 1.5 : Options Seedream v5 - Enhance Prompt + Seed */}
            {(selectedAI === 'seedream-text-to-image') && (
              <div className="option-row">
                <div className="option-group" style={{ flex: 1 }}>
                  <label>
                    Amélioration du prompt
                    <span className="info-icon" title="Standard : meilleure qualité (plus lent). Fast : qualité moyenne (plus rapide).">
                      <i className="fas fa-info-circle"></i>
                    </span>
                  </label>
                  <div className="option-controls">
                    <button
                      className={`option-btn ${(imageOptions.enhancePromptMode || 'standard') === 'standard' ? 'active' : ''}`}
                      onClick={() => handleImageOptionChange('enhancePromptMode', 'standard')}
                      title="Standard : meilleure qualité, plus lent"
                    >
                      <i className="fas fa-star"></i> Standard
                    </button>
                    <button
                      className={`option-btn ${imageOptions.enhancePromptMode === 'fast' ? 'active' : ''}`}
                      onClick={() => handleImageOptionChange('enhancePromptMode', 'fast')}
                      title="Fast : plus rapide, qualité moyenne"
                    >
                      <i className="fas fa-bolt"></i> Fast
                    </button>
                  </div>
                </div>
                <div className="option-group" style={{ flex: 0, minWidth: '160px' }}>
                  <label>
                    Seed
                    <span className="info-icon" title="Fixez un seed pour reproduire exactement la même image. Laissez vide pour un résultat aléatoire.">
                      <i className="fas fa-info-circle"></i>
                    </span>
                  </label>
                  <div className="seed-input-group-compact">
                    <i className="fas fa-dice" title="Seed pour reproduire la même image"></i>
                    <input
                      type="number"
                      className="seed-input-compact"
                      placeholder="Aléatoire"
                      min="0"
                      max="2147483647"
                      value={imageOptions.seed || ''}
                      onChange={(e) => handleImageOptionChange('seed', e.target.value ? parseInt(e.target.value) : null)}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* LIGNE 2 : Style artistique */}
            <div className="option-row">
              <div className="option-group option-group-full">
                <label>Style artistique</label>
                <div className="option-controls style-controls">
                  {[
                    { value: 'realistic', label: 'Réaliste', icon: 'fa-camera' },
                    { value: 'artistic', label: 'Artistique', icon: 'fa-palette' },
                    { value: 'cartoon', label: 'Cartoon', icon: 'fa-smile' },
                    { value: '3d', label: '3D Render', icon: 'fa-cube' },
                    { value: 'watercolor', label: 'Aquarelle', icon: 'fa-tint' },
                    { value: 'sketch', label: 'Croquis', icon: 'fa-pencil-alt' }
                  ].map(style => (
                    <button
                      key={style.value}
                      className={`option-btn ${options.style === style.value ? 'active' : ''}`}
                      onClick={() => handleChange('style', style.value)}
                      title={style.label}
                    >
                      <i className={`fas ${style.icon}`}></i> {style.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {/* Ambiance / Mood */}
        <div className="option-group">
          <label>Ambiance</label>
          <div className="option-controls">
            {[
              { value: 'bright', label: 'Lumineux' },
              { value: 'dark', label: 'Sombre' },
              { value: 'warm', label: 'Chaleureux' },
              { value: 'cold', label: 'Froid' },
              { value: 'dramatic', label: 'Dramatique' },
              { value: 'soft', label: 'Doux' }
            ].map(mood => (
              <button
                key={mood.value}
                className={`option-btn option-btn-mood ${options.mood === mood.value ? 'active' : ''}`}
                onClick={() => handleChange('mood', mood.value)}
              >
                {mood.label}
              </button>
            ))}
          </div>
        </div>

        {/* Éclairage */}
        <div className="option-group">
          <label>Éclairage</label>
          <div className="option-controls">
            {[
              { value: 'natural', label: 'Naturel' },
              { value: 'studio', label: 'Studio' },
              { value: 'golden-hour', label: 'Heure dorée' },
              { value: 'neon', label: 'Néon' },
              { value: 'cinematic', label: 'Cinématique' }
            ].map(lighting => (
              <button
                key={lighting.value}
                className={`option-btn option-btn-lighting ${options.lighting === lighting.value ? 'active' : ''}`}
                onClick={() => handleChange('lighting', lighting.value)}
              >
                {lighting.label}
              </button>
            ))}
          </div>
        </div>

        {/* Modificateurs (multi-sélection) */}
        <div className="option-group">
          <label>Modificateurs (cumulables)</label>
          <div className="option-controls modifiers-controls">
            {[
              { value: 'detailed', label: 'Très détaillé' },
              { value: 'minimalist', label: 'Minimaliste' },
              { value: 'vibrant', label: 'Couleurs vives' },
              { value: 'pastel', label: 'Pastel' },
              { value: 'hdr', label: 'HDR' },
              { value: 'bokeh', label: 'Bokeh' },
              { value: 'symmetrical', label: 'Symétrique' },
              { value: 'trending', label: 'Tendance' }
            ].map(mod => (
              <button
                key={mod.value}
                className={`option-btn modifier-btn ${(options.modifiers || []).includes(mod.value) ? 'active' : ''}`}
                onClick={() => toggleArrayOption('modifiers', mod.value)}
              >
                {mod.label}
              </button>
            ))}
          </div>
        </div>

        {/* Qualité */}
        <div className="option-group">
          <label>Qualité du rendu</label>
          <div className="option-controls">
            {[
              { value: 'draft', label: 'Brouillon' },
              { value: 'standard', label: 'Standard' },
              { value: 'high', label: 'Haute qualité' },
              { value: 'ultra', label: 'Ultra (4K)' }
            ].map(quality => (
              <button
                key={quality.value}
                className={`option-btn option-btn-quality ${options.quality === quality.value ? 'active' : ''}`}
                onClick={() => handleChange('quality', quality.value)}
              >
                {quality.label}
              </button>
            ))}
          </div>
        </div>

        {/* Prompt négatif */}
        <div className="option-group full-width">
          <label>Éléments à éviter (prompt négatif)</label>
          <input
            type="text"
            className="negative-prompt-input"
            placeholder="Ex: flou, texte, watermark, mauvaise qualité..."
            value={options.negativePrompt || ''}
            onChange={(e) => handleChange('negativePrompt', e.target.value)}
          />
        </div>
      </div>

      {/* Aperçu du prompt modifié */}
      {(options.style || options.mood || options.lighting || (options.modifiers && options.modifiers.length > 0)) && (
        <div className="prompt-preview">
          <small>Modificateurs qui seront ajoutés au prompt :</small>
          <div className="prompt-tags">
            {options.style && <span className="prompt-tag">{options.style} style</span>}
            {options.mood && <span className="prompt-tag">{options.mood} mood</span>}
            {options.lighting && <span className="prompt-tag">{options.lighting} lighting</span>}
            {options.quality && options.quality !== 'standard' && <span className="prompt-tag">{options.quality} quality</span>}
            {(options.modifiers || []).map(mod => (
              <span key={mod} className="prompt-tag modifier">{mod}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ImagePersonalization;
