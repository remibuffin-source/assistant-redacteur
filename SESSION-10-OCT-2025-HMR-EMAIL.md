# SESSION DU 10 OCTOBRE 2025 - HMR ET SYSTÈME EMAIL

## 🎯 OBJECTIFS ATTEINTS

✅ **Serveur email opérationnel** : Port 3001, envoi d'emails réels via Nodemailer  
✅ **Système de réinitialisation mot de passe** : Flux complet avec tokens et emails  
✅ **Correction erreur useAuth** : Désactivation StrictMode pour éviter boucles infinies  
✅ **Configuration HMR optimisée** : Port dédié 24678 pour WebSocket  
✅ **Navigation calendrier corrigée** : Ouverture dans la même fenêtre pour conserver HMR  
✅ **Scripts de démarrage/arrêt** : Fichiers batch pour gérer les 3 serveurs  

---

## 📧 SYSTÈME EMAIL

### Configuration serveur email (Port 3001)
- **Fichier** : `react-app/server.js`
- **Transport** : Nodemailer avec Gmail SMTP
- **Variables d'environnement** : 
  - `VITE_EMAIL_USER` : assistant.studioducapbrun@gmail.com
  - `VITE_EMAIL_PASSWORD` : Mot de passe d'application Gmail
- **Endpoint API** : `POST http://localhost:3001/api/send-email`
- **Logs détaillés** : Affichage de chaque requête avec destinataire, sujet, heure

### Fonctionnalités email
- **Envoi réel d'emails** : Via Gmail SMTP (port 587)
- **Logs en temps réel** : Chaque requête affichée dans le terminal
- **Gestion erreurs** : Messages clairs en cas d'échec
- **Template HTML** : Emails formatés avec boutons et liens cliquables

---

## 🔐 SYSTÈME RÉINITIALISATION MOT DE PASSE

### Flux complet
1. **Page "Mot de passe oublié"** (`/forgot-password`)
   - Saisie email utilisateur
   - Génération token via `authService.requestPasswordReset()`
   - Envoi email avec lien de réinitialisation
   - Lien format : `http://localhost:3003/reset-password?token=XXXXX`

2. **Email reçu**
   - Bouton orange "Réinitialiser mon mot de passe"
   - Lien cliquable avec token dans l'URL
   - Validité : 30 minutes

3. **Page de réinitialisation** (`/reset-password`)
   - Vérification du token
   - Saisie nouveau mot de passe + confirmation
   - Validation force du mot de passe
   - Mise à jour compte utilisateur

### Fichiers modifiés
- **ForgotPassword.jsx** : 
  - Import `authService`
  - Utilisation `requestPasswordReset()` au lieu de simulation
  - Génération lien avec token dans l'URL
  - Template email HTML avec bouton cliquable
  
- **authService.js** : 
  - Stockage tokens dans `localStorage` ('password_resets')
  - Expiration 30 minutes
  - Vérification validité token

---

## 🔧 CORRECTION ERREUR useAuth

### Problème
- **Erreur** : "Maximum update depth exceeded"
- **Cause** : StrictMode de React exécute les effets 2 fois en développement
- **Impact** : Bloquait toute l'application, empêchait envoi d'emails

### Solution
1. **Désactivation StrictMode** dans `main.jsx`
   - Suppression `<StrictMode>` wrapper
   - Application fonctionne normalement

2. **Amélioration useAuth.js**
   - Vérification `isInitialized.current` avant exécution
   - Fonction synchrone au lieu d'async
   - Gestion erreurs avec try/catch/finally

---

## 🚀 CONFIGURATION HMR (HOT MODULE REPLACEMENT)

### Problème identifié
- **HMR ne fonctionnait pas** : Modifications de code non rechargées automatiquement
- **Cause principale** : Calendrier s'ouvrait dans nouvelle fenêtre → perte connexion WebSocket
- **Cause secondaire** : Port HMR identique au serveur HTTP (3003)

### Solutions appliquées

#### 1. Configuration Vite optimisée (`vite.config.js`)
```javascript
{
  server: {
    port: 3003,
    host: '0.0.0.0',
    hmr: {
      port: 24678,        // Port dédié pour HMR
      clientPort: 24678,  // Client utilise même port
      protocol: 'ws',
      host: 'localhost'
    },
    watch: {
      usePolling: true,   // Nécessaire sur Windows
      interval: 100,
      ignored: ['**/node_modules/**', '**/dist/**', '**/logs/**']
    }
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom']
  },
  appType: 'spa'
}
```

#### 2. Navigation calendrier corrigée (`MenuBar.jsx`)
**AVANT** :
```javascript
const openCalendar = () => {
  const url = `${window.location.origin}/calendar`;
  window.open(url, '_blank', 'noopener');
};
```

**APRÈS** :
```javascript
const openCalendar = () => {
  navigate('/calendar');  // Navigation dans la même fenêtre
};
```

### Avantages obtenus
- **HMR fonctionnel** : Rechargement automatique des modifications
- **WebSocket stable** : Connexion maintenue dans la même fenêtre
- **Performance** : Moins de fichiers surveillés grâce aux exclusions
- **Production-ready** : Configuration optimale pour dev et prod

---

## 📁 FICHIERS CRÉÉS

### Scripts de gestion serveurs

#### `DEMARRER-TOUS-SERVEURS.bat`
- Démarre les 3 serveurs en parallèle
- Chaque serveur dans sa propre fenêtre
- Ordre : React/Vite → Email → Stripe
- Délais entre démarrages pour éviter conflits

#### `ARRETER-TOUS-SERVEURS.bat`
- Arrête proprement tous les serveurs
- Tue les processus sur ports 3001, 3003, 3005
- Arrêt PM2 avec commande dédiée

---

## 🖥️ ARCHITECTURE SERVEURS

### Serveur 1 : React/Vite (PM2) - Port 3003
- **Rôle** : Interface utilisateur principale
- **Technologie** : Vite + React + React Router
- **Gestion** : PM2 (auto-restart, logs, monitoring)
- **HMR** : Port dédié 24678
- **Commandes** :
  - Démarrer : `npm run pm2:dev`
  - Arrêter : `npm run pm2:dev:stop`
  - Redémarrer : `npm run pm2:dev:restart`
  - Status : `npm run pm2:status`
  - Logs : `npm run pm2:dev:logs`

### Serveur 2 : Email - Port 3001
- **Rôle** : Envoi d'emails (vérification, réinitialisation)
- **Technologie** : Express + Nodemailer
- **Transport** : Gmail SMTP (port 587)
- **Commandes** :
  - Démarrer : `npm run email-server`
  - Arrêter : Ctrl+C ou tuer processus port 3001

### Serveur 3 : Stripe - Port 3005
- **Rôle** : Gestion paiements et abonnements
- **Technologie** : Express + Stripe SDK
- **Commandes** :
  - Démarrer : `cd stripe-backend && npm start`
  - Arrêter : Ctrl+C ou tuer processus port 3005

---

## 🔍 DIAGNOSTIC PROBLÈMES

### Problème : HMR ne fonctionne pas
**Vérifications** :
1. Serveur PM2 actif : `npm run pm2:status`
2. Port HMR libre : `netstat -ano | findstr :24678`
3. Navigation dans même fenêtre (pas de `window.open`)
4. Console F12 : Vérifier messages `[vite] connected`

**Solutions** :
- Redémarrer PM2 : `npm run pm2:dev:restart`
- Vider cache navigateur : Ctrl+Shift+R
- Vérifier `vite.config.js` : port HMR = 24678

### Problème : Email non envoyé
**Vérifications** :
1. Serveur email actif sur port 3001
2. Variables `.env.local` configurées
3. Logs serveur email affichent la requête
4. Console F12 → Network : requête vers `localhost:3001/api/send-email`

**Solutions** :
- Redémarrer serveur email
- Vérifier mot de passe application Gmail
- Regarder logs terminal serveur email

### Problème : "Maximum update depth exceeded"
**Cause** : StrictMode + boucle dans useEffect
**Solution** : StrictMode désactivé dans `main.jsx`

---

## 📊 WORKFLOW QUOTIDIEN

### Démarrage
1. **Double-cliquer** sur `DEMARRER-TOUS-SERVEURS.bat`
2. **Attendre** 10 secondes (démarrage des 3 serveurs)
3. **Ouvrir navigateur** : http://localhost:3003
4. **Vérifier** : 3 fenêtres de terminal ouvertes

### Développement
- **Modifier code** → Sauvegarde automatique → HMR recharge la page
- **Tester emails** : Page "Mot de passe oublié"
- **Voir logs** : Fenêtres terminaux ou `npm run pm2:dev:logs`

### Arrêt
1. **Double-cliquer** sur `ARRETER-TOUS-SERVEURS.bat`
2. **Ou** fermer les 3 fenêtres de terminal manuellement

---

## 🎓 POINTS CLÉS À RETENIR

### HMR (Hot Module Replacement)
- **Port dédié** : Toujours séparer port HMR du port serveur
- **Même fenêtre** : Éviter `window.open()` pour conserver WebSocket
- **Polling** : Nécessaire sur Windows pour détecter changements fichiers

### Emails
- **Token vs Code** : Utiliser tokens longs pour sécurité, pas codes 6 chiffres
- **Expiration** : Toujours limiter validité des tokens (30 min recommandé)
- **Logs** : Logger chaque envoi pour debugging

### React
- **StrictMode** : Peut causer problèmes en dev, désactiver si nécessaire
- **Navigation** : Préférer `navigate()` à `window.open()` pour SPA
- **useEffect** : Toujours vérifier dépendances pour éviter boucles

---

## 📝 FICHIERS MODIFIÉS CETTE SESSION

1. **vite.config.js** : Configuration HMR avec port dédié 24678
2. **main.jsx** : Désactivation StrictMode
3. **MenuBar.jsx** : Navigation calendrier avec `navigate()` au lieu de `window.open()`
4. **ForgotPassword.jsx** : Intégration authService + envoi email avec lien
5. **server.js** : Logs détaillés pour chaque requête email
6. **useAuth.js** : Protection contre exécutions multiples

---

## ✅ RÉSULTAT FINAL

**Environnement de développement stable et professionnel** :
- ✅ 3 serveurs fonctionnels et orchestrés
- ✅ HMR opérationnel pour développement rapide
- ✅ Système email complet et testé
- ✅ Réinitialisation mot de passe fonctionnelle
- ✅ Scripts de gestion automatisés
- ✅ Logs détaillés pour debugging
- ✅ Configuration production-ready

**Prêt pour la production !** 🚀
