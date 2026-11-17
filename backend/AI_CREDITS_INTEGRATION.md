# 🤖 Intégration AI avec Système de Crédits

## 📋 Vue d'ensemble

Ce système permet de facturer automatiquement les utilisateurs pour l'utilisation des services AI (Anthropic, OpenAI, Gemini, DeepSeek) en fonction des tarifs configurables dans l'interface admin.

## 🔄 Flux complet

```
Frontend → /api/ai/generate → checkCredits → Récupère clé API → Appelle API AI
                                    ↓
                              Reçoit réponse
                                    ↓
                              deductCreditsAfterUsage (avec tarifs dynamiques)
                                    ↓
                              Retourne résultat + crédits déduits
```

## 🎯 Fonctionnalités

### 1️⃣ **Tarification dynamique**

Les tarifs sont configurables via l'interface admin (`AdminPricingPage.jsx`) et stockés dans la base de données (`PricingConfig`).

**Modification des tarifs :**
1. Admin se connecte
2. Va dans "Configuration API" → Onglet "Tarification"
3. Modifie les coûts par service/modèle
4. Sauvegarde
5. **Les nouveaux tarifs sont immédiatement appliqués** à toutes les nouvelles générations

### 2️⃣ **Vérification avant génération**

Le middleware `checkCredits` vérifie que l'utilisateur a suffisamment de crédits **avant** d'appeler l'API AI.

```javascript
// Estimation basée sur les paramètres de la requête
const estimatedCost = estimateCredits(service, model, estimatedTokens);

if (user.creditsBalance < estimatedCost) {
  return res.status(402).json({
    error: 'Insufficient credits',
    required: estimatedCost,
    available: user.creditsBalance
  });
}
```

### 3️⃣ **Déduction après génération**

La déduction se fait avec les **tokens réels** retournés par l'API AI, pas l'estimation.

```javascript
// Récupération des tarifs dynamiques
const pricingConfig = await PricingConfig.getConfig();
const customPricing = Object.fromEntries(pricingConfig.serviceCosts);

// Calcul avec tarifs actuels
const creditsToDeduct = calculateCredits(service, model, tokensUsed, customPricing);

// Déduction
await user.deductCredits(creditsToDeduct, description);
```

## 📁 Fichiers modifiés

### **Backend**

1. **`routes/ai.js`** (NOUVEAU)
   - Route `/api/ai/generate` - Proxy sécurisé pour les appels AI
   - Route `/api/ai/pricing` - Récupère les tarifs actuels
   - Gère Anthropic, OpenAI, Gemini, DeepSeek

2. **`middleware/creditCheck.js`**
   - `checkCredits()` - Vérifie avant l'appel
   - `deductCreditsAfterUsage()` - Déduit avec tarifs dynamiques

3. **`config/creditCosts.js`**
   - `calculateCredits()` - Accepte maintenant `customPricing`
   - Utilise les tarifs de la DB si fournis, sinon les tarifs par défaut

4. **`server.js`**
   - Ajout de la route `/ai`

### **Frontend** (à modifier)

1. **`services/aiService.js`**
   - Remplacer les appels directs aux APIs par des appels à `/api/ai/generate`

## 🔧 Configuration

### **Variables d'environnement**

Les clés API sont stockées dans la base de données via l'interface admin.

**Aucune clé API ne doit être dans le frontend !**

### **Tarifs par défaut**

Définis dans `backend/config/creditCosts.js` :

```javascript
export const CREDIT_COSTS = {
  anthropic: {
    'claude-3-opus-20240229': {
      input: 0.015,   // $ par 1000 tokens
      output: 0.075,
      creditsPerToken: 0.00015
    },
    // ...
  },
  // ...
};
```

### **Tarifs personnalisés**

Configurables via Admin → Tarification :

```javascript
// Exemple de configuration personnalisée
{
  "serviceCosts": {
    "anthropic": {
      "claude-3-sonnet": {
        "input": 0.005,  // Augmenté de 0.003 à 0.005
        "output": 0.020, // Augmenté de 0.015 à 0.020
        "creditsPerToken": 0.00005
      }
    }
  },
  "profitMargin": 30  // 30% de marge
}
```

**Impact immédiat :**
- Toutes les nouvelles générations utilisent les nouveaux tarifs
- Les générations en cours utilisent les tarifs au moment du démarrage
- Pas besoin de redémarrer le serveur

## 📊 Endpoints API

### **POST /api/ai/generate**

Génère du contenu avec une IA.

**Headers :**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Body :**
```json
{
  "service": "anthropic",
  "model": "claude-3-sonnet-20240229",
  "messages": [
    { "role": "user", "content": "Écris un article sur l'IA" }
  ],
  "maxTokens": 2000,
  "temperature": 0.7
}
```

**Response :**
```json
{
  "success": true,
  "content": "L'intelligence artificielle...",
  "usage": {
    "input": 12,
    "output": 450,
    "total": 462
  },
  "credits": {
    "deducted": 0.15,
    "remaining": 99.85
  },
  "metadata": {
    "service": "anthropic",
    "model": "claude-3-sonnet-20240229",
    "duration": 1234
  }
}
```

**Erreurs :**
- `402` - Crédits insuffisants
- `404` - Clé API non configurée
- `401` - Clé API invalide
- `500` - Erreur serveur

### **GET /api/ai/pricing**

Récupère les tarifs actuels.

**Response :**
```json
{
  "success": true,
  "pricing": {
    "serviceCosts": {
      "anthropic": {
        "claude-3-sonnet": {
          "input": 0.003,
          "output": 0.015,
          "creditsPerToken": 0.00003
        }
      }
    },
    "profitMargin": 30
  }
}
```

## 🧪 Tests

### **Test 1 : Génération avec crédits suffisants**

```bash
# Se connecter
TOKEN=$(curl -X POST https://api.assistant-redacteur.fr/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password"}' \
  | jq -r '.token')

# Générer du contenu
curl -X POST https://api.assistant-redacteur.fr/ai/generate \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "service": "anthropic",
    "model": "claude-3-sonnet-20240229",
    "messages": [{"role": "user", "content": "Hello"}],
    "maxTokens": 100
  }'
```

### **Test 2 : Génération avec crédits insuffisants**

```bash
# Devrait retourner une erreur 402
curl -X POST https://api.assistant-redacteur.fr/ai/generate \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "service": "anthropic",
    "model": "claude-3-opus-20240229",
    "messages": [{"role": "user", "content": "Write a long article"}],
    "maxTokens": 10000
  }'
```

### **Test 3 : Modification des tarifs**

1. Se connecter en admin
2. Aller dans Admin → Tarification
3. Modifier le coût de `claude-3-sonnet` : `input: 0.010` (au lieu de 0.003)
4. Sauvegarder
5. Faire une génération
6. Vérifier que les crédits déduits correspondent au nouveau tarif

**Calcul :**
- Avant : 1000 tokens input × 0.003 / 1000 = 0.003 crédits
- Après : 1000 tokens input × 0.010 / 1000 = 0.010 crédits

## 🔐 Sécurité

### **Clés API**

- ✅ Stockées côté serveur (base de données)
- ✅ Chiffrées en base
- ✅ Jamais exposées au frontend
- ✅ Récupérées uniquement pour l'appel API

### **Validation**

- ✅ Authentification JWT requise
- ✅ Vérification des crédits avant l'appel
- ✅ Validation des paramètres
- ✅ Gestion des erreurs

### **Rate Limiting**

Le rate limiting global du serveur s'applique (100 req/15min par IP).

## ⚠️ Points d'attention

### **1. Migration du frontend**

Le frontend doit être modifié pour utiliser `/api/ai/generate` au lieu d'appeler directement les APIs.

**Avant :**
```javascript
// Frontend appelle directement Anthropic
const response = await fetch('https://api.anthropic.com/v1/messages', {
  headers: { 'x-api-key': apiKey }
});
```

**Après :**
```javascript
// Frontend appelle le backend
const response = await fetch('/api/ai/generate', {
  headers: { 'Authorization': `Bearer ${token}` },
  body: JSON.stringify({ service: 'anthropic', model, messages })
});
```

### **2. Gestion des erreurs**

Le frontend doit gérer les erreurs de crédits insuffisants :

```javascript
if (response.status === 402) {
  // Afficher un message pour recharger
  showRechargeModal();
}
```

### **3. Affichage du coût**

Le frontend peut afficher le coût estimé avant la génération :

```javascript
// Récupérer les tarifs
const pricing = await fetch('/api/ai/pricing');

// Estimer le coût
const estimatedCost = estimateCredits(service, model, estimatedTokens);

// Afficher à l'utilisateur
console.log(`Coût estimé : ${estimatedCost} crédits`);
```

## 🚀 Déploiement

### **1. Uploader les fichiers**

```
backend/routes/ai.js
backend/middleware/creditCheck.js
backend/config/creditCosts.js
backend/server.js
```

### **2. Redémarrer le backend**

Via O2Switch Node.js Selector : "Restart"

### **3. Tester**

```bash
curl https://api.assistant-redacteur.fr/ai/pricing
```

### **4. Modifier le frontend**

Mettre à jour `aiService.js` pour utiliser `/api/ai/generate`

## 📝 TODO

- [ ] Migrer le frontend pour utiliser `/api/ai/generate`
- [ ] Ajouter un indicateur de coût en temps réel dans l'interface
- [ ] Implémenter un système de cache pour réduire les coûts
- [ ] Ajouter des webhooks pour notifier les crédits faibles
- [ ] Créer un dashboard de consommation par service/modèle
- [ ] Ajouter des limites de dépenses quotidiennes/mensuelles

## 🆘 Dépannage

### **Erreur "Clé API non configurée"**

1. Vérifier que l'admin a configuré les clés dans Admin → Config API
2. Vérifier que les clés sont bien enregistrées en base
3. Vérifier les logs : `~/assistant-redacteur/backend/utils/logs/combined.log`

### **Tarifs non appliqués**

1. Vérifier que la configuration est bien sauvegardée : `GET /api/pricing/config`
2. Vérifier les logs lors de la déduction
3. Forcer un refresh de la config en redémarrant le backend

### **Crédits déduits incorrectement**

1. Vérifier les tokens réels retournés par l'API
2. Vérifier le calcul dans les logs
3. Comparer avec les tarifs configurés
