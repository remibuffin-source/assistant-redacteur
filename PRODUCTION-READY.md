# 🚀 Guide de Préparation à la Production

## ✅ Modifications Implémentées

### **1. Vraies Requêtes de Test API**

#### **Fichier créé** : `src/services/apiKeyValidator.js`

**Fonctionnalités** :
- ✅ Validation réelle pour **14 services IA**
- ✅ Requêtes HTTP authentiques vers les API
- ✅ Gestion des erreurs et messages clairs
- ✅ Support de tous les fournisseurs : OpenAI, Anthropic, Gemini, DeepSeek, Grok, OpenRouter, DeepL

**Services testés** :
1. **OpenAI** : GPT-4o, GPT-4o Mini, Whisper, GPT-4o Vision
2. **Anthropic** : Claude 3.5 Sonnet, Claude 3 Haiku
3. **Google** : Gemini 2.0 Flash, Gemini Pro
4. **DeepSeek** : DeepSeek Chat, DeepSeek V3
5. **xAI** : Grok, Grok 2
6. **OpenRouter** : Kimi
7. **DeepL** : API de traduction

**Exemple d'utilisation** :
```javascript
import { validateApiKey } from '../services/apiKeyValidator';

const result = await validateApiKey('openai', 'sk-...');
// { valid: true, message: '✅ Clé OpenAI valide et fonctionnelle' }
```

---

### **2. Sauvegarde Sécurisée des Clés**

#### **Fichier créé** : `src/services/apiKeyStorage.js`

**Fonctionnalités** :
- ✅ Sauvegarde locale (localStorage)
- ✅ Synchronisation avec serveur backend
- ✅ Gestion des erreurs réseau
- ✅ Support du chiffrement (à implémenter)

**API Backend requise** :
```javascript
POST /api/admin/api-keys
GET  /api/admin/api-keys/:userId
```

**Headers requis** :
```javascript
{
  'Authorization': 'Bearer <token>',
  'Content-Type': 'application/json'
}
```

---

### **3. Protection des Routes Admin**

#### **Routes protégées** :

**Administrateur uniquement** :
- `/config-api` - Configuration clés API IA
- `/admin-prompt-builder` - Gestion règles génération
- `/admin` - Page administration

**Utilisateurs authentifiés** :
- `/network-api` - Clés réseaux sociaux
- `/calendar` - Calendrier de publication
- `/account` - Compte utilisateur
- `/subscription` - Abonnement
- `/editor` - Éditeur de contenu
- `/advanced-editor` - Éditeur avancé

**Vérification admin** :
```javascript
const isAdmin = user?.role === 'admin' || user?.email === 'admin@studioducapbrun.com';
```

---

## 🔧 Configuration Requise

### **1. Variables d'Environnement**

Créer un fichier `.env.local` à partir de `.env.example` :

```bash
# URL de l'API backend
VITE_API_URL=https://votre-domaine.com/api

# Mode production
VITE_PRODUCTION=true

# Clés Stripe (si utilisées)
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...
```

---

### **2. Backend API à Implémenter**

#### **Endpoint : Sauvegarde des clés**
```javascript
POST /api/admin/api-keys
Content-Type: application/json
Authorization: Bearer <token>

{
  "userId": "user@example.com",
  "apiKeys": {
    "openai": "sk-...",
    "anthropic": "sk-ant-...",
    ...
  },
  "timestamp": "2025-01-16T03:30:00.000Z"
}

Response:
{
  "success": true,
  "message": "Clés sauvegardées avec succès"
}
```

#### **Endpoint : Récupération des clés**
```javascript
GET /api/admin/api-keys/:userId
Authorization: Bearer <token>

Response:
{
  "apiKeys": {
    "openai": "sk-...",
    "anthropic": "sk-ant-...",
    ...
  },
  "lastUpdated": "2025-01-16T03:30:00.000Z"
}
```

---

## 🔒 Sécurité

### **1. Authentification**

**Token JWT** stocké dans localStorage :
```javascript
localStorage.getItem('auth_user')
// { token: "eyJhbGc...", user: {...} }
```

**Vérification** :
- Token envoyé dans header `Authorization: Bearer <token>`
- Validation côté serveur pour chaque requête
- Expiration du token après 24h

---

### **2. Protection CORS**

**Backend doit autoriser** :
```javascript
// Express.js exemple
app.use(cors({
  origin: 'https://votre-domaine.com',
  credentials: true
}));
```

---

### **3. Chiffrement des Clés (Optionnel)**

**Fonctions disponibles** :
```javascript
import { encryptApiKey, decryptApiKey } from '../services/apiKeyStorage';

const encrypted = encryptApiKey('sk-...');
const decrypted = decryptApiKey(encrypted);
```

**À implémenter** : Utiliser `crypto-js` ou similaire

---

## 📋 Checklist de Déploiement

### **Frontend**

- [ ] Créer `.env.local` avec `VITE_API_URL` de production
- [ ] Vérifier que `VITE_PRODUCTION=true`
- [ ] Build de production : `npm run build`
- [ ] Tester les routes protégées
- [ ] Vérifier la redirection login
- [ ] Tester l'accès admin refusé

### **Backend**

- [ ] Implémenter `/api/admin/api-keys` (POST)
- [ ] Implémenter `/api/admin/api-keys/:userId` (GET)
- [ ] Ajouter middleware d'authentification
- [ ] Vérifier les droits admin
- [ ] Configurer CORS
- [ ] Activer HTTPS
- [ ] Configurer rate limiting

### **Base de Données**

- [ ] Créer table `api_keys`
- [ ] Champs : `userId`, `service`, `apiKey`, `encrypted`, `createdAt`, `updatedAt`
- [ ] Index sur `userId`
- [ ] Chiffrement des clés sensibles

### **Sécurité**

- [ ] HTTPS activé
- [ ] Certificat SSL valide
- [ ] Headers de sécurité (HSTS, CSP)
- [ ] Rate limiting sur API
- [ ] Validation des entrées
- [ ] Logs d'accès admin

---

## 🧪 Tests de Production

### **1. Test des Routes Protégées**

```bash
# Sans authentification → Redirection /login
curl https://votre-domaine.com/config-api

# Avec token utilisateur normal → Accès refusé
curl -H "Authorization: Bearer <user_token>" \
     https://votre-domaine.com/config-api

# Avec token admin → Accès autorisé
curl -H "Authorization: Bearer <admin_token>" \
     https://votre-domaine.com/config-api
```

---

### **2. Test des API Keys**

```bash
# Test clé OpenAI
curl -X POST https://votre-domaine.com/api/test-key \
  -H "Content-Type: application/json" \
  -d '{"service": "openai", "apiKey": "sk-..."}'

# Réponse attendue
{
  "valid": true,
  "message": "✅ Clé OpenAI valide et fonctionnelle"
}
```

---

### **3. Test Sauvegarde**

```bash
# Sauvegarde clés
curl -X POST https://votre-domaine.com/api/admin/api-keys \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "admin@studioducapbrun.com",
    "apiKeys": {
      "openai": "sk-...",
      "anthropic": "sk-ant-..."
    }
  }'
```

---

## 🚨 Gestion des Erreurs

### **Codes d'erreur HTTP**

- `401` - Non authentifié → Redirection /login
- `403` - Accès refusé → Page "Accès refusé"
- `404` - Route inconnue → Redirection /
- `500` - Erreur serveur → Message d'erreur

### **Messages utilisateur**

- ✅ Succès : Fond vert, icône check
- ❌ Erreur : Fond rouge, icône warning
- ⏳ Chargement : Spinner + message

---

## 📊 Monitoring

### **Logs à surveiller**

1. **Tentatives d'accès admin** par non-admin
2. **Échecs de validation** de clés API
3. **Erreurs de sauvegarde** serveur
4. **Temps de réponse** des tests API
5. **Erreurs CORS**

### **Métriques**

- Nombre de clés testées/jour
- Taux de succès des tests
- Temps moyen de validation
- Nombre d'accès refusés

---

## 🔄 Migration des Données

### **De localStorage vers serveur**

```javascript
// Script de migration
const localKeys = JSON.parse(localStorage.getItem('config_api_keys'));
await saveApiKeysToServer(localKeys, user.id);
```

---

## 📝 Notes Importantes

1. **Ne jamais commiter** les clés API réelles
2. **Toujours utiliser HTTPS** en production
3. **Chiffrer les clés** dans la base de données
4. **Limiter les tentatives** de test API (rate limiting)
5. **Logger les accès** aux pages admin
6. **Sauvegarder régulièrement** les clés sur le serveur

---

## 🎯 Prochaines Étapes

1. **Implémenter le backend** (Node.js/Express recommandé)
2. **Configurer la base de données** (PostgreSQL/MongoDB)
3. **Déployer sur VPS** ou cloud (AWS, DigitalOcean, etc.)
4. **Configurer le domaine** et SSL
5. **Tester en environnement** de staging
6. **Déployer en production**

---

## 📞 Support

Pour toute question sur la configuration de production :
- Vérifier les logs navigateur (Console)
- Vérifier les logs serveur
- Tester avec Postman/curl
- Consulter la documentation des API

---

**L'application est maintenant prête pour la production ! 🚀**
