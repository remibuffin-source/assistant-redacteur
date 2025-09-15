# Assistant Rédactionnel - Studio du Cap Brun

Application React complète pour la génération de contenu assistée par IA avec interface professionnelle.

## 🚀 Fonctionnalités

- **Interface complète** conforme au modèle original Studio du Cap Brun
- **Sélection de 5 IA** : Claude, GPT-4, Gemini, ElevenLabs, Personnalisé
- **5 types de média** : Texte, Image, Vidéo, Audio, Code
- **8 tâches de traitement** : Résumer, Développer, Extraire, Corriger, Idées, Réécriture, Analyse, Traduction
- **3 zones de formats** : Réseaux sociaux, Communiquer, Écrire
- **Options avancées** : Style, Longueur, Créativité, Adaptation
- **Thème jour/nuit** avec persistance localStorage
- **Sauvegarde automatique** des projets
- **Interface responsive** complète

## 🛠️ Technologies

- **React 19** avec Hooks
- **Vite** pour le build et le développement
- **CSS3** avec variables et animations
- **LocalStorage** pour la persistance
- **Font Awesome** pour les icônes

## 📦 Installation et Développement

```bash
# Installer les dépendances
npm install

# Lancer le serveur de développement
npm run dev

# Build de production
npm run build

# Prévisualiser le build
npm run preview
```

## 🌐 Déploiement Netlify

### Configuration Requise

**Build Settings dans Netlify :**
- **Base directory:** `react-app` (si dépôt racine) ou laisser vide si dans le dossier react-app
- **Build command:** `npm run build`
- **Publish directory:** `dist`

### Configuration Netlify (déjà incluse)

Le fichier [`netlify.toml`](netlify.toml:1) contient toute la configuration nécessaire :

```toml
[build]
  publish = "dist"
  command = "npm run build"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### Étapes de Déploiement

1. **Connecter GitHub à Netlify**
   - Aller sur [Netlify](https://netlify.com)
   - Cliquer sur "Import from Git"
   - Sélectionner GitHub et autoriser l'accès
   - Choisir le dépôt `assistant-redacteur`

2. **Configurer l'équipe**
   - Sélectionner l'équipe "Studio du Cap Brun"
   - Déployer en tant que "remibuffin"

3. **Paramètres de build**
   - **Branch to deploy:** `main`
   - **Base directory:** (laisser vide si dans react-app)
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`

4. **Variables d'environnement** (optionnel)
   - Ajouter les clés API dans Netlify > Site settings > Environment variables

## 📁 Structure du Projet

```
react-app/
├── public/                 # Fichiers statiques
├── src/
│   ├── components/        # Composants React
│   │   ├── MenuBar.jsx   # Menu amovible
│   │   ├── ProjectInfo.jsx # Informations projet
│   │   ├── AISelection.jsx # Sélection IA
│   │   ├── MediaType.jsx  # Types de média
│   │   ├── UploadArea.jsx # Zone de collecte
│   │   ├── ProcessingTasks.jsx # Tâches de traitement
│   │   ├── OutputFormats.jsx # Formats de sortie
│   │   ├── AdvancedOptions.jsx # Options avancées
│   │   ├── ResultsManager.jsx # Gestion résultats
│   │   ├── AdminPanel.jsx # Panel administrateur
│   │   └── HelpModal.jsx  # Modal d'aide
│   ├── hooks/            # Hooks personnalisés
│   ├── services/         # Services API
│   ├── styles/           # Styles CSS
│   └── App.jsx          # Composant principal
├── netlify.toml         # Configuration Netlify
├── package.json         # Dépendances
└── vite.config.js      # Configuration Vite
```

## 🔧 Configuration API

Pour utiliser les vraies API IA, configurez les clés dans Netlify :

1. Aller dans Netlify > Site settings > Environment variables
2. Ajouter les variables :
   - `VITE_OPENAI_API_KEY` pour GPT-4
   - `VITE_ANTHROPIC_API_KEY` pour Claude
   - `VITE_GEMINI_API_KEY` pour Gemini
   - `VITE_ELEVENLABS_API_KEY` pour ElevenLabs

## 📊 Scripts Disponibles

- `npm run dev` - Lance le serveur de développement
- `npm run build` - Build de production
- `npm run preview` - Prévisualise le build
- `npm run lint` - Vérification ESLint

## 🎨 Personnalisation

Les styles sont entièrement personnalisables dans [`src/styles/global.css`](src/styles/global.css:1) avec variables CSS pour le thème jour/nuit.

## 📞 Support

Pour toute question concernant le déploiement ou la configuration, consulter la [documentation Netlify](https://docs.netlify.com/).

---

**Studio du Cap Brun** - Développé avec ❤️ pour la création de contenu assistée par IA
