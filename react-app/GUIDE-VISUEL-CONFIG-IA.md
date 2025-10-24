# 🎨 Guide Visuel - Configuration IA par Média

## Interface Complète

```
┌─────────────────────────────────────────────────────────────────┐
│  🤖 Configuration IA par Type de Média    [🔄 Réinitialiser]   │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │ 📝 Texte     │  │ 🎵 Audio     │  │ 🖼️ Image      │         │
│  │ Documents    │  │ Fichiers     │  │ Images et    │         │
│  │ texte        │  │ audio        │  │ scans        │         │
│  │              │  │              │  │              │         │
│  │ ┌──────────┐ │  │ ┌──────────┐ │  │ ┌──────────┐ │         │
│  │ │⚡ GPT-4o  │ │  │ │🎤 Whisper│ │  │ │👁️ GPT-4o │ │         │
│  │ │Mini      ▼│ │  │ │Large v3 ▼│ │  │ │Vision   ▼│ │         │
│  │ └──────────┘ │  │ └──────────┘ │  │ └──────────┘ │         │
│  │              │  │              │  │              │         │
│  │ ℹ️ OpenAI    │  │ ℹ️ OpenAI    │  │ ℹ️ OpenAI    │         │
│  │ ⚡ Très rapide│  │ ⚡ Rapide     │  │ ⚡ Rapide     │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐                            │
│  │ 📊 Tableur   │  │ 🌐 Site Web  │                            │
│  │ Feuilles de  │  │ Extraction   │                            │
│  │ calcul       │  │ web          │                            │
│  │              │  │              │                            │
│  │ ┌──────────┐ │  │ ┌──────────┐ │                            │
│  │ │🚀 GPT-4o  │ │  │ │🎯 Claude │ │                            │
│  │ │         ▼│ │  │ │3.5      ▼│ │                            │
│  │ └──────────┘ │  │ └──────────┘ │                            │
│  │              │  │              │                            │
│  │ ℹ️ OpenAI    │  │ ℹ️ Anthropic │                            │
│  │ ⚡ Rapide     │  │ ⚡ Rapide     │                            │
│  └──────────────┘  └──────────────┘                            │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐│
│  │ 💡 Configuration actuelle :                                ││
│  │                                                            ││
│  │  📝 Texte:      ⚡ GPT-4o Mini                             ││
│  │  🎵 Audio:      🎤 Whisper Large v3                        ││
│  │  🖼️ Image:      👁️ GPT-4o Vision                          ││
│  │  📊 Tableur:    🚀 GPT-4o                                  ││
│  │  🌐 Site Web:   🎯 Claude 3.5 Sonnet                       ││
│  └────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
```

---

## Détail d'un Sélecteur

```
┌─────────────────────────────────┐
│  📝  Texte                      │
│  Documents texte (.txt, .md,    │
│  .pdf, .docx, .odt, .epub)      │
│                                 │
│  ┌───────────────────────────┐ │
│  │ ⚡ GPT-4o Mini - $0.15/1M ▼│ │  ← Menu déroulant
│  └───────────────────────────┘ │
│                                 │
│  ┌───────────────────────────┐ │
│  │ ℹ️ OpenAI    ⚡ Très rapide│ │  ← Infos IA
│  └───────────────────────────┘ │
└─────────────────────────────────┘
```

---

## Menu Déroulant Ouvert

```
┌─────────────────────────────────┐
│  📝  Texte                      │
│                                 │
│  ┌───────────────────────────┐ │
│  │ ⚡ GPT-4o Mini - $0.15/1M ▼│ │
│  ├───────────────────────────┤ │
│  │ ⚡ GPT-4o Mini - $0.15/1M  │ │ ✓ Sélectionné
│  │ 🚀 GPT-4o - $5.00/1M      │ │
│  │ 🎯 Claude 3.5 - $3.00/1M  │ │
│  │ 💎 Claude 3 Opus - $15/1M │ │
│  │ ✨ Gemini Pro - $0.50/1M  │ │
│  └───────────────────────────┘ │
└─────────────────────────────────┘
```

---

## États Visuels

### État Normal
```
┌─────────────────────────────────┐
│  📝  Texte                      │
│  ┌───────────────────────────┐ │
│  │ ⚡ GPT-4o Mini - $0.15/1M ▼│ │ ← Bordure grise
│  └───────────────────────────┘ │
└─────────────────────────────────┘
```

### État Focus (clic sur le menu)
```
┌─────────────────────────────────┐
│  📝  Texte                      │
│  ┌───────────────────────────┐ │
│  │ ⚡ GPT-4o Mini - $0.15/1M ▼│ │ ← Bordure ORANGE
│  └───────────────────────────┘ │ ← Fond plus clair
└─────────────────────────────────┘
```

### État Survol (hover)
```
┌─────────────────────────────────┐
│  📝  Texte                      │ ← Légère élévation
│  ┌───────────────────────────┐ │
│  │ ⚡ GPT-4o Mini - $0.15/1M ▼│ │
│  └───────────────────────────┘ │
└─────────────────────────────────┘
```

---

## Bouton Réinitialiser

### Normal
```
┌──────────────────┐
│ 🔄 Réinitialiser │  ← Fond orange transparent
└──────────────────┘    Bordure orange claire
```

### Survol
```
┌──────────────────┐
│ 🔄 Réinitialiser │  ← Fond orange plus visible
└──────────────────┘    Bordure orange vif
```

---

## Résumé de Configuration

```
┌────────────────────────────────────────────────────────────┐
│ 💡 Configuration actuelle :                                │
│                                                            │
│  📝 Texte:      ⚡ GPT-4o Mini          ← Type : IA       │
│  🎵 Audio:      🎤 Whisper Large v3                        │
│  🖼️ Image:      👁️ GPT-4o Vision                          │
│  📊 Tableur:    🚀 GPT-4o                                  │
│  🌐 Site Web:   🎯 Claude 3.5 Sonnet                       │
└────────────────────────────────────────────────────────────┘
     ↑                    ↑
   Icône              Nom IA
```

---

## Responsive Design

### Desktop (> 900px)
```
┌─────────────────────────────────────────────────────────┐
│  [Texte]      [Audio]      [Image]                      │
│  [Tableur]    [Web]                                     │
└─────────────────────────────────────────────────────────┘
```

### Tablet (600-900px)
```
┌─────────────────────────────────┐
│  [Texte]      [Audio]           │
│  [Image]      [Tableur]         │
│  [Web]                          │
└─────────────────────────────────┘
```

### Mobile (< 600px)
```
┌───────────────┐
│  [Texte]      │
│  [Audio]      │
│  [Image]      │
│  [Tableur]    │
│  [Web]        │
└───────────────┘
```

---

## Palette de Couleurs

### Fond Principal
- Panneau : `rgba(255, 255, 255, 0.03)`
- Carte : `rgba(255, 255, 255, 0.02)`
- Résumé : `rgba(255, 107, 53, 0.05)`

### Bordures
- Normale : `rgba(255, 255, 255, 0.1)`
- Focus : `#ff6b35` (orange)
- Résumé : `rgba(255, 107, 53, 0.2)`

### Texte
- Principal : `var(--text-primary)`
- Secondaire : `rgba(255, 255, 255, 0.5)`
- Accent : `#ff6b35`

### Boutons
- Fond normal : `rgba(255, 107, 53, 0.1)`
- Fond hover : `rgba(255, 107, 53, 0.2)`
- Bordure : `rgba(255, 107, 53, 0.3)`

---

## Icônes Utilisées

### Types de Médias
- 📝 Texte
- 🎵 Audio
- 🖼️ Image
- 📊 Tableur
- 🌐 Site Web

### IA
- ⚡ GPT-4o Mini (rapide)
- 🚀 GPT-4o (puissant)
- 👁️ GPT-4o Vision (vision)
- 🎯 Claude 3.5 Sonnet (précis)
- 💎 Claude 3 Opus (premium)
- 🎤 Whisper (audio)
- ✨ Gemini Pro (polyvalent)

### Actions
- 🔄 Réinitialiser
- 💡 Information
- ℹ️ Détails
- ⚡ Vitesse

---

## Animations

### Transition des Sélecteurs
```css
transition: all 0.2s ease;
```

### Effet Hover
```css
transform: translateY(-1px);
box-shadow: 0 2px 8px rgba(255, 107, 53, 0.1);
```

### Changement de Focus
```css
border-color: #ff6b35;
background: rgba(255, 255, 255, 0.08);
```

---

## Accessibilité

### Contraste
- ✅ Texte principal : Ratio > 7:1
- ✅ Texte secondaire : Ratio > 4.5:1
- ✅ Bordures : Visible sur tous fonds

### Navigation Clavier
- ✅ Tab : Navigation entre sélecteurs
- ✅ Espace/Enter : Ouvrir menu
- ✅ Flèches : Naviguer dans menu
- ✅ Escape : Fermer menu

### Screen Readers
- ✅ Labels descriptifs
- ✅ ARIA attributes
- ✅ Annonces de changement

---

## Exemple d'Utilisation

### Scénario : Uploader un PDF

1. **Joindre le fichier**
   ```
   Clic sur "📎 Joindre un document"
   → Sélection fichier.pdf
   ```

2. **Vérifier l'IA**
   ```
   Type détecté : 📝 Texte
   IA utilisée : ⚡ GPT-4o Mini (configuration actuelle)
   ```

3. **Changer l'IA si nécessaire**
   ```
   Clic sur menu déroulant "Texte"
   → Sélection "🎯 Claude 3.5 Sonnet"
   → Mise à jour instantanée
   ```

4. **Traitement**
   ```
   Le PDF sera traité avec Claude 3.5 Sonnet
   ```

---

## Feedback Utilisateur

### Changement de Configuration
```
┌────────────────────────────────┐
│ ✅ Configuration mise à jour   │
│                                │
│ 📝 Texte : GPT-4o Mini         │
│          → Claude 3.5 Sonnet   │
└────────────────────────────────┘
```

### Réinitialisation
```
┌────────────────────────────────┐
│ 🔄 Configuration réinitialisée │
│                                │
│ Retour aux paramètres par      │
│ défaut recommandés             │
└────────────────────────────────┘
```

---

## Console Logs (Debug)

```javascript
// À chaque changement
Configuration IA mise à jour: {
  text: 'claude-3.5-sonnet',
  audio: 'whisper-large-v3',
  image: 'gpt-4o-vision',
  spreadsheet: 'gpt-4o',
  web: 'claude-3.5-sonnet'
}

// Lors du traitement d'un fichier
Fichier détecté: document.pdf
Type: text
IA sélectionnée: claude-3.5-sonnet
Traitement en cours...
```

---

## Intégration dans la Zone de Collecte

```
┌─────────────────────────────────────────────────────────┐
│  Zone de Collecte                                       │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  [Zone de texte pour coller le contenu]                │
│                                                         │
├─────────────────────────────────────────────────────────┤
│  [🎤 Dictée] [📊 Audio] [📎 Document] [🌐 Web]         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  🤖 Configuration IA par Type de Média                  │
│                                                         │
│  [5 sélecteurs d'IA disposés en grille]                │
│                                                         │
│  [Résumé de la configuration]                          │
│                                                         │
├─────────────────────────────────────────────────────────┤
│  📎 Documents joints (2)                                │
│  • rapport.pdf (2.3 MB) [❌]                           │
│  • notes.docx (156 KB) [❌]                            │
└─────────────────────────────────────────────────────────┘
```

---

Cette interface offre un **contrôle total** et **intuitif** sur le choix de l'IA pour chaque type de média ! 🎯
