# 🚀 Guide de Déploiement Automatique Vercel avec GitHub

## 📋 Prérequis
- ✅ Dépôt GitHub à jour: https://github.com/remibuffin/assistant-redacteur
- ✅ Configuration Vercel prête: `react-app/vercel.json`
- ✅ Build de production fonctionnel

## 🔧 Configuration Vercel avec GitHub

### Étape 1: Connexion à Vercel
1. Aller sur [Vercel](https://vercel.com/)
2. Se connecter avec votre compte GitHub
3. Cliquer sur "Add New..." → "Project"

### Étape 2: Importation du dépôt GitHub
1. Sélectionner le dépôt `remibuffin/assistant-redacteur`
2. Vercel détectera automatiquement la configuration React/Vite
3. Les paramètres seront pré-remplis:
   - **Framework**: Vite
   - **Build Command**: `npm run build` (détecté automatiquement)
   - **Output Directory**: `dist` (détecté automatiquement)
   - **Root Directory**: `react-app` (à spécifier manuellement)

### Étape 3: Configuration importante
**Paramètres cruciaux à vérifier**:
- ✅ **Root Directory**: `react-app` (très important!)
- ✅ **Framework Preset**: Vite
- ✅ **Build Command**: `npm run build`
- ✅ **Output Directory**: `dist`
- ✅ **Install Command**: `npm install`

### Étape 4: Variables d'environnement (optionnel)
Si vous avez des clés API à configurer:
- `OPENAI_API_KEY` = votre clé OpenAI
- `ANTHROPIC_API_KEY` = votre clé Anthropic  
- `GEMINI_API_KEY` = votre clé Google Gemini

### Étape 5: Déploiement
1. Cliquer sur "Deploy"
2. Vercel construira et déploiera automatiquement
3. L'URL de production sera générée (ex: `https://assistant-redacteur.vercel.app`)

## 🌐 Domaines personnalisés
Pour utiliser votre domaine `assistant.studioducapbrun.com`:
1. Aller dans "Domains" dans les paramètres du projet Vercel
2. Ajouter `assistant.studioducapbrun.com`
3. Configurer les DNS comme indiqué par Vercel

## 🔄 Déploiement continu
**Fonctionnalité automatique**:
- ✅ Chaque push sur `main` déclenche un nouveau déploiement
- ✅ Les Pull Requests génèrent des preview deployments
- ✅ Rollback possible vers任何 précédente version

## 🧪 Vérifications post-déploiement
Après le déploiement, vérifier:
1. ✅ https://assistant-redacteur.vercel.app/mon-compte
2. ✅ https://assistant-redacteur.vercel.app/config-api  
3. ✅ https://assistant-redacteur.vercel.app/calendrier
4. ✅ https://assistant-redacteur.vercel.app/abonnement
5. ✅ Le routing SPA fonctionne (rafraichissement des pages)

## ⚡ Avantages Vercel
- **Déploiement instantané** depuis GitHub
- **SSL automatique** et gratuit
- **CDN global** pour de meilleures performances
- **Preview deployments** pour les PR
- **Analytics** intégrés
- **Fonctions serverless** si besoin

## 🔧 Résolution de problèmes

### Problème: Build échoue
**Solution**: Vérifier que `react-app/package.json` a le script `build: vite build`

### Problème: Pages 404 en rafraichissant
**Solution**: La configuration `vercel.json` avec les redirections SPA est déjà en place

### Problème: Assets non trouvés
**Solution**: Vérifier que le "Output Directory" est bien `dist`

## 📊 Monitoring
Vercel fournit:
- ✅ Logs de build en temps réel
- ✅ Métriques de performance
- ✅ Analytics utilisateurs
- ✅ Status de déploiement

Le déploiement est maintenant entièrement automatisé : chaque modification poussée sur GitHub sera automatiquement déployée sur Vercel !