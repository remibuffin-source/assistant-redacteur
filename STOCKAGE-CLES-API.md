# 🔐 Système de Stockage des Clés API

## 📋 Vue d'ensemble

Les clés API de l'Assistant Rédactionnel sont maintenant stockées de manière **sécurisée et persistante** dans **MongoDB Atlas**.

---

## 🏗️ Architecture

```
Frontend (React)
    ↓
    POST /api/admin/api-keys
    ↓
Backend (Node.js/Express)
    ↓
Chiffrement AES-256
    ↓
MongoDB Atlas (AWS eu-west-1)
```

---

## 🔒 Sécurité

### Chiffrement des clés

Toutes les clés API sont **chiffrées** avant d'être stockées :

- **Algorithme** : AES-256-CBC
- **Clé de chiffrement** : Variable d'environnement `ENCRYPTION_KEY` (32 caractères)
- **IV unique** : Généré pour chaque clé
- **Stockage** : Seule la version chiffrée est en base de données

### Accès restreint

- ✅ **Admin uniquement** : Seuls les utilisateurs avec `role: 'admin'` peuvent gérer les clés
- ✅ **Authentification JWT** : Token requis pour toutes les requêtes
- ✅ **Middleware de sécurité** : Vérification des permissions

---

## 📊 Modèle de données

### Collection `apikeys`

```javascript
{
  _id: ObjectId,
  userId: ObjectId,              // Référence à l'utilisateur admin
  service: String,                // 'openai', 'anthropic', 'gemini', etc.
  encryptedKey: String,           // Clé chiffrée
  iv: String,                     // Vecteur d'initialisation
  isActive: Boolean,              // true/false
  lastUsed: Date,                 // Dernière utilisation
  metadata: {
    keyPrefix: String,            // Premiers caractères (pour identification)
    provider: String,             // Nom du service
    notes: String                 // Notes optionnelles
  },
  createdAt: Date,
  updatedAt: Date
}
```

### Services supportés

#### IA
- `openai`, `openai-mini`
- `anthropic`, `anthropic-haiku`
- `gemini`, `gemini-pro`
- `deepseek`, `deepseek-v3`
- `grok`, `grok-2`
- `kimi`
- `mistral`
- `whisper`
- `gpt-vision`
- `elevenlabs`
- `deepl`

#### Réseaux sociaux
- `twitter`
- `facebook`
- `linkedin`
- `instagram`
- `tiktok`

#### Autres
- `blog`
- `website`

---

## 🔌 API Endpoints

### 1. Sauvegarder des clés API

```http
POST /api/admin/api-keys
Authorization: Bearer {JWT_TOKEN}
Content-Type: application/json

{
  "apiKeys": {
    "openai": "sk-proj-xxx",
    "anthropic": "sk-ant-xxx",
    "gemini": "AIza-xxx"
  }
}
```

**Réponse** :
```json
{
  "success": true,
  "message": "3 clé(s) API sauvegardée(s) avec succès",
  "data": {
    "saved": ["openai", "anthropic", "gemini"]
  }
}
```

### 2. Récupérer toutes les clés

```http
GET /api/admin/api-keys/{userId}
Authorization: Bearer {JWT_TOKEN}
```

**Réponse** :
```json
{
  "success": true,
  "apiKeys": {
    "openai": "sk-proj-xxx",
    "anthropic": "sk-ant-xxx",
    "gemini": "AIza-xxx"
  }
}
```

### 3. Récupérer une clé spécifique

```http
GET /api/admin/api-keys/service/{service}
Authorization: Bearer {JWT_TOKEN}
```

**Réponse** :
```json
{
  "success": true,
  "service": "openai",
  "apiKey": "sk-proj-xxx"
}
```

### 4. Supprimer une clé

```http
DELETE /api/admin/api-keys/{service}
Authorization: Bearer {JWT_TOKEN}
```

**Réponse** :
```json
{
  "success": true,
  "message": "Clé API openai supprimée avec succès"
}
```

### 5. Statut des clés configurées

```http
GET /api/admin/api-keys-status
Authorization: Bearer {JWT_TOKEN}
```

**Réponse** :
```json
{
  "success": true,
  "count": 3,
  "keys": [
    {
      "service": "openai",
      "configured": true,
      "keyPrefix": "sk-proj-",
      "lastUsed": "2025-11-20T18:30:00Z",
      "createdAt": "2025-11-20T14:00:00Z"
    }
  ]
}
```

---

## 🔄 Migration depuis localStorage

### Avant (localStorage)

```javascript
// ❌ Stockage local uniquement
localStorage.setItem('admin_ia_api_keys', JSON.stringify(apiKeys));
```

**Problèmes** :
- ❌ Perdu si on change de navigateur
- ❌ Perdu si on vide le cache
- ❌ Pas de synchronisation
- ❌ Pas de backup

### Après (MongoDB Atlas)

```javascript
// ✅ Stockage persistant et sécurisé
await fetch('/api/admin/api-keys', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({ apiKeys })
});
```

**Avantages** :
- ✅ Persistant (survit aux changements de navigateur)
- ✅ Sécurisé (chiffrement AES-256)
- ✅ Synchronisé (accessible partout)
- ✅ Backup automatique (MongoDB Atlas)

---

## 🧪 Tests

### Test local

```powershell
# 1. Démarrer le backend
cd backend
npm run dev

# 2. Tester la sauvegarde (remplacer {TOKEN} par votre JWT)
curl -X POST http://localhost:4000/api/admin/api-keys `
  -H "Content-Type: application/json" `
  -H "Authorization: Bearer {TOKEN}" `
  -d '{"apiKeys":{"openai":"sk-test-123","anthropic":"sk-ant-test-456"}}'

# 3. Tester la récupération
curl http://localhost:4000/api/admin/api-keys/{USER_ID} `
  -H "Authorization: Bearer {TOKEN}"
```

### Test production

```powershell
# Remplacer par votre URL Elastic Beanstalk
curl -X POST http://assistant-redactionnel-prod.eba-ei9m8ug2.eu-west-1.elasticbeanstalk.com/api/admin/api-keys `
  -H "Content-Type: application/json" `
  -H "Authorization: Bearer {TOKEN}" `
  -d '{"apiKeys":{"openai":"sk-proj-xxx"}}'
```

---

## 📝 Variables d'environnement requises

### Local (`backend/.env`)

```env
# MongoDB Atlas
MONGODB_URI=mongodb+srv://admin_redacteur:PASSWORD@assistant-redacteur.xxxxx.mongodb.net/assistant-redacteur?retryWrites=true&w=majority

# Clé de chiffrement (32 caractères)
ENCRYPTION_KEY=votre-cle-de-32-caracteres-ici

# JWT (déjà existant)
JWT_SECRET=your-super-secret-jwt-key
```

### Production (Elastic Beanstalk)

```powershell
cd backend

# MongoDB
eb setenv MONGODB_URI="mongodb+srv://admin_redacteur:PASSWORD@assistant-redacteur.xxxxx.mongodb.net/assistant-redacteur?retryWrites=true&w=majority"

# Chiffrement
eb setenv ENCRYPTION_KEY="votre-cle-de-32-caracteres-ici"

# Déployer
eb deploy
```

---

## 🔍 Monitoring

### Logs backend

```powershell
# Local
cd backend
npm run dev

# Production (Elastic Beanstalk)
eb logs
```

### MongoDB Atlas Dashboard

1. Allez sur https://cloud.mongodb.com
2. Sélectionnez votre cluster
3. **Metrics** : Voir l'utilisation
4. **Collections** → `apikeys` : Voir les clés stockées (chiffrées)

---

## 🆘 Dépannage

### Erreur : "MONGODB_URI non défini"

**Solution** : Ajoutez `MONGODB_URI` dans `.env` ou Elastic Beanstalk

### Erreur : "Accès refusé"

**Cause** : L'utilisateur n'est pas admin

**Solution** : Vérifiez que `user.role === 'admin'` ou `user.email === 'admin@studioducapbrun.com'`

### Erreur : "Erreur déchiffrement"

**Cause** : `ENCRYPTION_KEY` différente entre sauvegarde et récupération

**Solution** : Utilisez toujours la même `ENCRYPTION_KEY`

### Les clés ne se sauvegardent pas

1. Vérifiez que MongoDB est connecté :
   ```
   ✅ MongoDB connecté: assistant-redacteur-shard-00-00.xxxxx.mongodb.net
   ```

2. Vérifiez les logs :
   ```powershell
   cd backend
   npm run dev
   ```

3. Testez la connexion :
   ```powershell
   curl http://localhost:4000/health
   ```

---

## ✅ Checklist de mise en production

- [ ] MongoDB Atlas configuré
- [ ] `MONGODB_URI` ajouté en local
- [ ] `ENCRYPTION_KEY` générée (32 caractères)
- [ ] Backend testé en local
- [ ] Clés API sauvegardées en local avec succès
- [ ] `MONGODB_URI` ajouté sur Elastic Beanstalk
- [ ] `ENCRYPTION_KEY` ajoutée sur Elastic Beanstalk
- [ ] Backend déployé en production
- [ ] Clés API sauvegardées en production avec succès
- [ ] Vérification dans MongoDB Atlas Dashboard

---

## 📚 Fichiers créés

| Fichier | Description |
|---------|-------------|
| `backend/config/database.js` | Connexion MongoDB |
| `backend/models/ApiKey.js` | Modèle de données + chiffrement |
| `backend/routes/apiKeys.js` | Routes API pour les clés |
| `MONGODB-ATLAS-SETUP.md` | Guide de configuration MongoDB Atlas |
| `STOCKAGE-CLES-API.md` | Ce fichier (documentation) |

---

🎉 **Système de stockage sécurisé des clés API opérationnel !**
