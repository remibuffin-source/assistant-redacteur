# Assistant Rédactionnel - Studio du Cap Brun

Une application web moderne pour la génération de contenu assistée par IA.

## 🚀 Fonctionnalités

- **Sélection d'IA multiple** : Claude, GPT-4, Gemini
- **Interface intuitive** : Design moderne avec thème jour/nuit
- **Gestion de projets** : Sauvegarde automatique des données
- **Génération de contenu** : Simulation d'appels API IA
- **Export des résultats** : Copie et téléchargement

## 🛠️ Installation

### Méthode simple (HTML/CSS/JS)
```bash
cd assistant-redacteur
python3 -m http.server 3000
```
Ouvrez http://localhost:3000 dans votre navigateur.

### Méthode React (Optionnel)
```bash
cd assistant-redacteur
npm install
npm run dev
```

## 📁 Structure du projet

```
assistant-redacteur/
├── index.html          # Page principale
├── styles.css          # Styles CSS
├── app.js             # Logique JavaScript
├── package.json       # Configuration npm
└── README.md          # Documentation
```

## 🎨 Utilisation

1. **Informations du projet** : Renseignez le titre, le public cible et la description
2. **Sélection d'IA** : Choisissez l'IA à utiliser (Claude, GPT-4, Gemini)
3. **Contenu source** : Collez ou écrivez votre contenu dans la zone de texte
4. **Génération** : Cliquez sur "Générer le contenu"
5. **Résultats** : Consultez et exportez le contenu généré

## ⚙️ Configuration

### Variables d'environnement
Créez un fichier `.env` à la racine :
```
API_KEY_CLAUDE=votre_cle_api_claude
API_KEY_OPENAI=votre_cle_api_openai  
API_KEY_GEMINI=votre_cle_api_gemini
```

### Thème
L'application supporte les thèmes clair et sombre. Utilisez le bouton en haut à droite pour basculer entre les modes.

## 🔧 Développement

### Ajouter une nouvelle IA
1. Ajoutez le bouton dans `index.html`
2. Implémentez la logique dans `app.js`
3. Ajoutez le template de contenu dans `generateSampleContent()`

### Styles personnalisés
Modifiez `styles.css` pour personnaliser l'apparence :
- Variables CSS dans `:root`
- Classes utilitaires
- Responsive design

## 📦 Déploiement

### Serveur simple
```bash
python3 -m http.server 3000
```

### Avec Docker (optionnel)
```dockerfile
FROM nginx:alpine
COPY . /usr/share/nginx/html
```

## 🐛 Dépannage

### Problèmes courants
- **Erreur CORS** : Vérifiez les clés API
- **Styles non chargés** : Vérifiez les chemins des fichiers
- **JavaScript non exécuté** : Vérifiez la console du navigateur

### Debugging
Ouvrez les outils de développement (F12) pour :
- Voir les erreurs console
- Inspecter le réseau
- Debugger le JavaScript

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

Développé avec ❤️ par Studio du Cap Brun