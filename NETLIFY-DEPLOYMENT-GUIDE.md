# Guide de Déploiement Netlify - Assistant Rédactionnel

## 📋 Configuration Netlify Requise

### Équipe et Utilisateur
- **Team:** `Studio du Cap Brun`
- **Deploy as:** `remibuffin`
- **Branch:** `main`

### Paramètres de Build
Dans Netlify > Site settings > Build & deploy > Build settings :

| Paramètre | Valeur | Description |
|-----------|---------|-------------|
| **Base directory** | `react-app` | Dossier contenant le projet React |
| **Build command** | `npm run build` | Commande de build Vite |
| **Publish directory** | `dist` | Dossier de sortie du build |
| **Node version** | `18` | Version Node.js (déjà configurée) |

### Configuration Automatique via netlify.toml
Le fichier [`netlify.toml`](netlify.toml:1) est déjà configuré :
```toml
[build]
  publish = "dist"
  command = "npm run build"

[build.environment]
  NODE_VERSION = "18"
```

## 🔗 Étapes de Connexion GitHub → Netlify

1. **Se connecter à Netlify**
   - Aller sur [https://app.netlify.com](https://app.netlify.com)
   - Se connecter avec le compte GitHub

2. **Importer depuis Git**
   - Cliquer sur "Add new site" → "Import an existing project"
   - Choisir "GitHub" comme provider

3. **Autoriser l'accès**
   - Autoriser Netlify à accéder aux repositories GitHub
   - Sélectionner l'organisation "Studio du Cap Brun" si nécessaire

4. **Choisir le repository**
   - Rechercher et sélectionner `assistant-redacteur`
   - Ou `react-app` si le dépôt est dans un sous-dossier

5. **Configurer les paramètres de build**
   - **Branch to deploy:** `main`
   - **Base directory:** `react-app` (si le dépôt est à la racine)
   - **Build command:** `npm run build` (automatiquement détecté)
   - **Publish directory:** `dist` (automatiquement détecté)

6. **Déployer**
   - Cliquer sur "Deploy site"
   - Netlify construira et déploiera automatiquement

## 🌐 Domain et HTTPS
- Netlify attribue automatiquement un domaine `.netlify.app`
- HTTPS est automatiquement configuré
- Domain custom peut être ajouté ultérieurement

## 🔧 Variables d'Environnement (Optionnel)

Pour les API IA réelles, ajouter dans Netlify > Site settings > Environment variables:

| Variable | Description |
|----------|-------------|
| `VITE_OPENAI_API_KEY` | Clé API OpenAI pour GPT-4 |
| `VITE_ANTHROPIC_API_KEY` | Clé API Anthropic pour Claude |
| `VITE_GEMINI_API_KEY` | Clé API Google Gemini |
| `VITE_ELEVENLABS_API_KEY` | Clé API ElevenLabs |

## 📊 Monitoring du Déploiement

- **Build logs:** Accessibles dans Netlify > Deploys
- **Site preview:** Chaque commit crée un preview deployment
- **Form submissions:** Gérés automatiquement par Netlify Forms
- **Analytics:** Intégration avec Google Analytics possible

## 🚨 Dépannage Commun

### Build échoue
- Vérifier que Node.js 18 est utilisé
- Vérifier les logs de build dans Netlify

### Assets non chargés
- Vérifier le chemin des assets dans le CSS
- Les images des logos IA se résoudront au runtime

### CORS errors
- Configurer les headers dans `netlify.toml` si nécessaire

## 📞 Support

- **Documentation Netlify:** [https://docs.netlify.com](https://docs.netlify.com)
- **Support Netlify:** support@netlify.com
- **GitHub Issues:** Pour les problèmes techniques

---

**État actuel:** ✅ Prêt pour le déploiement  
**Dernier commit:** Migration React complète avec interface originale  
**Build:** Testé et fonctionnel (voir [`deploy-build-v2.tar.gz`](deploy-build-v2.tar.gz:1))