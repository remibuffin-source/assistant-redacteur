# 📋 TODO LIST - Backend Production

## 🎯 Vue d'ensemble

Cette liste détaille toutes les tâches backend nécessaires pour mettre l'application en production.

---

## ⚠️ PRIORITÉ 1 : Infrastructure de Base

### ✅ **1.1 Serveur API Node.js/Express**

**Statut** : ❌ À créer

**Tâches** :
- [ ] Initialiser projet Node.js (`npm init`)
- [ ] Installer dépendances :
  ```bash
  npm install express cors dotenv helmet
  npm install --save-dev nodemon
  ```
- [ ] Créer structure de dossiers :
  ```
  backend/
  ├── src/
  │   ├── routes/
  │   ├── controllers/
  │   ├── middleware/
  │   ├── models/
  │   ├── services/
  │   └── utils/
  ├── .env
  ├── .env.example
  └── server.js
  ```
- [ ] Configurer serveur Express de base
- [ ] Configurer CORS pour le frontend
- [ ] Ajouter middleware de logging
- [ ] Tester serveur sur port 5000

**Fichiers à créer** :
- `backend/server.js`
- `backend/package.json`
- `backend/.env`

**Temps estimé** : 2-3 heures

---

### ✅ **1.2 Base de Données**

**Statut** : ❌ À créer

**Choix recommandé** : **PostgreSQL** (plus robuste pour production)

**Tâches** :
- [ ] Installer PostgreSQL localement
- [ ] Créer base de données `assistant_redacteur`
- [ ] Installer client Node.js :
  ```bash
  npm install pg sequelize
  # OU
  npm install mongoose (si MongoDB)
  ```
- [ ] Créer schéma de tables :
  - `users` (id, email, password_hash, role, created_at)
  - `api_keys` (id, user_id, service, api_key_encrypted, created_at, updated_at)
  - `sessions` (id, user_id, token, expires_at)
- [ ] Créer migrations
- [ ] Tester connexion base de données

**Scripts SQL** :
```sql
-- Table utilisateurs
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'user',
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Table clés API
CREATE TABLE api_keys (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  service VARCHAR(50) NOT NULL,
  api_key_encrypted TEXT NOT NULL,
  is_valid BOOLEAN DEFAULT false,
  last_tested TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, service)
);

-- Index pour performances
CREATE INDEX idx_api_keys_user_id ON api_keys(user_id);
CREATE INDEX idx_users_email ON users(email);
```

**Temps estimé** : 3-4 heures

---

## ⚠️ PRIORITÉ 2 : Sécurité et Authentification

### ✅ **2.1 Authentification JWT**

**Statut** : ❌ À implémenter

**Tâches** :
- [ ] Installer dépendances :
  ```bash
  npm install jsonwebtoken bcrypt
  ```
- [ ] Créer middleware `verifyToken` :
  ```javascript
  // middleware/auth.js
  const jwt = require('jsonwebtoken');
  
  function verifyToken(req, res, next) {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Token manquant' });
    
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) return res.status(403).json({ error: 'Token invalide' });
      req.user = decoded;
      next();
    });
  }
  ```
- [ ] Créer middleware `requireAdmin` :
  ```javascript
  function requireAdmin(req, res, next) {
    if (req.user.role !== 'admin' && req.user.email !== 'admin@studioducapbrun.com') {
      return res.status(403).json({ error: 'Accès administrateur requis' });
    }
    next();
  }
  ```
- [ ] Implémenter routes login/logout
- [ ] Générer tokens avec expiration (24h)
- [ ] Tester authentification

**Temps estimé** : 4-5 heures

---

### ✅ **2.2 Chiffrement des Clés API**

**Statut** : ❌ À implémenter

**Tâches** :
- [ ] Installer crypto :
  ```bash
  npm install crypto-js
  ```
- [ ] Créer service de chiffrement :
  ```javascript
  // services/encryption.js
  const CryptoJS = require('crypto-js');
  
  function encryptApiKey(apiKey) {
    return CryptoJS.AES.encrypt(apiKey, process.env.ENCRYPTION_KEY).toString();
  }
  
  function decryptApiKey(encryptedKey) {
    const bytes = CryptoJS.AES.decrypt(encryptedKey, process.env.ENCRYPTION_KEY);
    return bytes.toString(CryptoJS.enc.Utf8);
  }
  ```
- [ ] Générer clé de chiffrement sécurisée
- [ ] Stocker clé dans `.env` (ENCRYPTION_KEY)
- [ ] Chiffrer toutes les clés avant sauvegarde BDD
- [ ] Déchiffrer lors de la récupération
- [ ] Tester chiffrement/déchiffrement

**Temps estimé** : 2-3 heures

---

### ✅ **2.3 Rate Limiting**

**Statut** : ❌ À implémenter

**Tâches** :
- [ ] Installer express-rate-limit :
  ```bash
  npm install express-rate-limit
  ```
- [ ] Configurer limites globales :
  ```javascript
  const rateLimit = require('express-rate-limit');
  
  const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requêtes max
    message: 'Trop de requêtes, réessayez plus tard'
  });
  
  app.use('/api/', apiLimiter);
  ```
- [ ] Limites spécifiques pour tests API (5/min)
- [ ] Limites pour sauvegarde (10/min)
- [ ] Tester rate limiting

**Temps estimé** : 1-2 heures

---

## ⚠️ PRIORITÉ 3 : Endpoints API

### ✅ **3.1 Endpoint : Sauvegarde Clés API**

**Statut** : ❌ À créer

**Route** : `POST /api/admin/api-keys`

**Tâches** :
- [ ] Créer controller `apiKeysController.js`
- [ ] Implémenter validation des données
- [ ] Chiffrer les clés avant sauvegarde
- [ ] Sauvegarder en base de données
- [ ] Retourner confirmation
- [ ] Gérer les erreurs
- [ ] Tester avec Postman

**Code** :
```javascript
// controllers/apiKeysController.js
async function saveApiKeys(req, res) {
  try {
    const { userId, apiKeys } = req.body;
    
    // Vérifier que l'utilisateur est admin
    if (req.user.id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Non autorisé' });
    }
    
    // Sauvegarder chaque clé
    for (const [service, key] of Object.entries(apiKeys)) {
      if (key) {
        const encrypted = encryptApiKey(key);
        await db.upsertApiKey(userId, service, encrypted);
      }
    }
    
    res.json({ 
      success: true, 
      message: 'Clés sauvegardées avec succès' 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
}
```

**Temps estimé** : 3-4 heures

---

### ✅ **3.2 Endpoint : Récupération Clés API**

**Statut** : ❌ À créer

**Route** : `GET /api/admin/api-keys/:userId`

**Tâches** :
- [ ] Vérifier authentification
- [ ] Vérifier droits admin
- [ ] Récupérer clés de la BDD
- [ ] Déchiffrer les clés
- [ ] Retourner les clés
- [ ] Tester avec Postman

**Code** :
```javascript
async function getApiKeys(req, res) {
  try {
    const { userId } = req.params;
    
    // Vérifier droits
    if (req.user.id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Non autorisé' });
    }
    
    // Récupérer et déchiffrer
    const keys = await db.getApiKeys(userId);
    const decrypted = {};
    
    for (const key of keys) {
      decrypted[key.service] = decryptApiKey(key.api_key_encrypted);
    }
    
    res.json({ apiKeys: decrypted });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
```

**Temps estimé** : 2-3 heures

---

### ✅ **3.3 Endpoint : Test Clé API (Proxy)**

**Statut** : ⚠️ Optionnel (le frontend teste directement)

**Route** : `POST /api/admin/test-api-key`

**Utilité** : 
- Éviter d'exposer les clés côté client
- Centraliser les tests
- Logger les résultats

**Tâches** :
- [ ] Créer proxy pour chaque service
- [ ] Tester la clé côté serveur
- [ ] Retourner résultat au frontend
- [ ] Logger les tests

**Temps estimé** : 4-5 heures (si implémenté)

---

## ⚠️ PRIORITÉ 4 : Déploiement et Sécurité

### ✅ **4.1 HTTPS/SSL**

**Statut** : ❌ À configurer

**Tâches** :
- [ ] Obtenir certificat SSL (Let's Encrypt gratuit)
- [ ] Configurer Nginx/Apache en reverse proxy
- [ ] Rediriger HTTP → HTTPS
- [ ] Configurer headers de sécurité :
  ```javascript
  app.use(helmet({
    contentSecurityPolicy: true,
    hsts: true
  }));
  ```
- [ ] Tester HTTPS

**Temps estimé** : 2-3 heures

---

### ✅ **4.2 Variables d'Environnement**

**Statut** : ❌ À configurer

**Fichier** : `.env`

```bash
# Base de données
DB_HOST=localhost
DB_PORT=5432
DB_NAME=assistant_redacteur
DB_USER=postgres
DB_PASSWORD=votre_mot_de_passe

# JWT
JWT_SECRET=votre_secret_jwt_tres_long_et_complexe
JWT_EXPIRATION=24h

# Chiffrement
ENCRYPTION_KEY=votre_cle_de_chiffrement_32_caracteres

# Serveur
PORT=5000
NODE_ENV=production

# CORS
FRONTEND_URL=https://votre-domaine.com
```

**Tâches** :
- [ ] Créer `.env.example`
- [ ] Générer secrets sécurisés
- [ ] Configurer en production
- [ ] Ne JAMAIS commiter `.env`

**Temps estimé** : 1 heure

---

## 📊 RÉCAPITULATIF

### **Temps Total Estimé** : 25-35 heures

### **Par Priorité** :
- **PRIORITÉ 1** (Infrastructure) : 5-7h
- **PRIORITÉ 2** (Sécurité) : 7-10h
- **PRIORITÉ 3** (Endpoints) : 9-12h
- **PRIORITÉ 4** (Déploiement) : 3-4h

### **Ordre Recommandé** :
1. ✅ Serveur Express de base (2h)
2. ✅ Base de données PostgreSQL (3h)
3. ✅ Authentification JWT (4h)
4. ✅ Chiffrement des clés (2h)
5. ✅ Endpoint sauvegarde (3h)
6. ✅ Endpoint récupération (2h)
7. ✅ Rate limiting (1h)
8. ✅ HTTPS/SSL (2h)
9. ✅ Tests et déploiement (3h)

---

## 🎯 ALTERNATIVE : Tests Immédiats

### **Option A : Tester MAINTENANT avec clés en dur**

**Avantages** :
- ✅ Voir immédiatement si l'Assistant Rédacteur fonctionne
- ✅ Valider l'intégration frontend
- ✅ Identifier les bugs rapidement

**Comment faire** :
1. Créer fichier `.env.local` dans `react-app/` :
   ```bash
   VITE_OPENAI_API_KEY=sk-votre-cle-openai
   VITE_ANTHROPIC_API_KEY=sk-ant-votre-cle-claude
   ```

2. Modifier temporairement le code pour utiliser ces clés :
   ```javascript
   // Dans le composant qui appelle l'IA
   const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
   ```

3. Tester la génération de contenu

**Inconvénients** :
- ❌ Clés exposées côté client (temporaire uniquement !)
- ❌ Pas de sauvegarde persistante
- ❌ Pas sécurisé pour production

---

### **Option B : Backend minimal (4-6h)**

**Créer un backend ultra-simple** :
1. Serveur Express basique
2. Un seul endpoint : `POST /api/generate`
3. Clés stockées en dur dans `.env` backend
4. Pas de BDD, pas d'auth (juste pour tester)

**Code minimal** :
```javascript
// server.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/generate', async (req, res) => {
  const { service, prompt } = req.body;
  
  // Appeler l'API avec la clé stockée côté serveur
  const apiKey = process.env[`${service.toUpperCase()}_API_KEY`];
  // ... faire l'appel API
  
  res.json({ result: '...' });
});

app.listen(5000);
```

**Avantages** :
- ✅ Clés sécurisées côté serveur
- ✅ Rapide à mettre en place
- ✅ Permet de tester l'IA immédiatement

---

## 💡 RECOMMANDATION

### **Pour TESTER l'Assistant Rédacteur** :
👉 **Option A** (clés en dur dans .env.local) - **30 minutes**
- Rapide et simple
- Parfait pour valider que tout fonctionne
- À utiliser UNIQUEMENT en développement local

### **Pour le Prompt Builder** :
👉 **À faire AVANT le backend complet**
- Le Prompt Builder est crucial pour la qualité des résultats
- Permet de définir les règles de génération
- Indépendant du backend

### **Ordre optimal** :
1. **Tester l'IA maintenant** (Option A - 30min)
2. **Développer le Prompt Builder** (4-6h)
3. **Créer le backend complet** (25-35h)

---

## ❓ QUESTION POUR VOUS

**Voulez-vous** :

**A)** Tester l'IA **immédiatement** avec des clés en dur (30min) ?
- Je crée un fichier `.env.local` avec vos clés
- Vous testez la génération de contenu
- On voit si tout fonctionne

**B)** Travailler sur le **Prompt Builder** d'abord ?
- Interface de gestion des règles
- Configuration des formats
- Optimisation des prompts

**C)** Créer le **backend minimal** (4-6h) ?
- Serveur Express basique
- Endpoint de génération sécurisé
- Clés protégées côté serveur

**Dites-moi ce que vous préférez et je vous guide ! 🚀**
