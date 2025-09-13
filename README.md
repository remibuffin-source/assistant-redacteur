# Assistant Rédacteur React - Studio du Cap Brun

Une application web moderne pour la génération de contenu assistée par IA, migrée vers React avec Vite.

## 🚀 Fonctionnalités

- **Sélection d'IA multiple** : Claude, GPT-4, Gemini
- **Interface React moderne** : Composants réutilisables et hooks personnalisés
- **Gestion d'état avancée** : useState, useEffect, useContext
- **Sauvegarde automatique** : LocalStorage avec hooks personnalisés
- **Thème sombre/clair** : Support natif avec persistance
- **Design responsive** : Adapté mobile et desktop
- **Génération de contenu** : Simulation et préparation pour APIs réelles

## 🛠️ Installation et Démarrage

### Prérequis
- Node.js 18+ (recommandé: 20+)
- npm ou yarn

### Installation
```bash
cd react-app
npm install
```

### Développement
```bash
npm run dev
```
Ouvrez http://localhost:5173

### Build de production
```bash
npm run build
```

### Preview production
```bash
npm run preview
```

## 📁 Structure du Projet React

```
react-app/
├── src/
│   ├── components/          # Composants React
│   │   ├── ThemeToggle.jsx
│   │   ├── ProjectInfo.jsx
│   │   ├── AISelection.jsx
│   │   ├── ContentInput.jsx
│   │   └── ResultsDisplay.jsx
│   ├── hooks/              # Hooks personnalisés
│   │   ├── useTheme.js
│   │   ├── useLocalStorage.js
│   │   └── useAIGeneration.js
│   ├── services/           # Services métier
│   │   └── aiService.js
│   ├── styles/            # Styles CSS
│   │   └── global.css
│   ├── App.jsx            # Composant principal
│   └── main.jsx           # Point d'entrée
├── public/                # Fichiers statiques
├── dist/                 # Build de production
└── package.json
```

## 🔧 Configuration

### Variables d'environnement
Copiez le fichier `.env.example` en `.env.local` et configurez vos clés API :

```env
VITE_OPENAI_API_KEY=votre_cle_openai
VITE_ANTHROPIC_API_KEY=votre_cle_anthropic  
VITE_GEMINI_API_KEY=votre_cle_gemini
```

### APIs IA Actuelles
L'application utilise actuellement une simulation. Pour utiliser les vraies APIs :

1. Décommentez les méthodes dans `src/services/aiService.js`
2. Ajoutez vos clés API dans `.env.local`
3. Adaptez les appels dans `useAIGeneration` hook

## 🎨 Personnalisation

### Styles
Modifiez `src/styles/global.css` pour personnaliser :
- Variables CSS dans `:root`
- Thèmes light/dark
- Responsive design

### Composants
Chaque composant est modulaire et réutilisable :
- `ProjectInfo` : Informations du projet
- `AISelection` : Choix du modèle IA  
- `ContentInput` : Zone de texte principale
- `ResultsDisplay` : Affichage des résultats

## 📦 Déploiement

### Vercel (Recommandé)
```bash
npm install -g vercel
vercel --prod
```

### Netlify
```bash
npm run build
# Drag & drop le dossier dist/ sur Netlify
```

### AWS S3 + CloudFront
```bash
npm run build
aws s3 sync dist/ s3://votre-bucket --delete
```

### Docker
```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
```

## 🔄 Migration depuis la version vanilla

La migration comprend :
- ✅ Conversion des classes JavaScript en hooks React
- ✅ Structuration modulaire en composants
- ✅ Gestion d'état avec useState/useEffect
- ✅ Persistance des données avec LocalStorage
- ✅ Styles CSS migrés et organisés
- ✅ Services métier découplés

## 🐛 Dépannage

### Problèmes courants
- **Erreur Node.js version** : Utilisez Node.js 18+
- **Styles non chargés** : Vérifiez les imports CSS
- **API non disponibles** : Configurez les variables d'environnement

### Debugging
```bash
# Mode développement avec logs
npm run dev

# Build avec sourcemaps
npm run build -- --sourcemap
```

## 📄 Licence

MIT License - Voir le fichier LICENSE pour plus de détails.

## 🤝 Contribution

Les contributions sont les bienvenues ! Pour contribuer :
1. Fork le projet
2. Créez une branche feature
3. Committez vos changements
4. Push vers la branche
5. Ouvrez une Pull Request

## 📞 Support

Pour toute question ou problème, contactez le support technique.

---

Développé avec ❤️ par Studio du Cap Brun - Migré vers React en 2024
