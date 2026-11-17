# 💰 Système de Crédits - Assistant Rédacteur

## 📋 Vue d'ensemble

Le système de crédits permet de facturer les utilisateurs pour l'utilisation des services AI (Anthropic, OpenAI, Gemini, etc.).

## 🔄 Flux complet

### 1️⃣ **Achat de crédits**

```
Utilisateur → Frontend (Stripe) → Backend /stripe/create-payment-intent → Stripe
                                                                              ↓
Utilisateur ← Confirmation ← Backend /stripe/webhooks ← Webhook Stripe ← Paiement réussi
                                      ↓
                              User.addCredits() → Base de données
```

### 2️⃣ **Utilisation des crédits**

```
Utilisateur → API Request → checkCredits middleware → Vérification solde
                                    ↓ (si OK)
                            Service AI (Claude, GPT, etc.)
                                    ↓
                            deductCreditsAfterUsage() → Déduction crédits
                                    ↓
                            Base de données mise à jour
```

## 📁 Fichiers impliqués

### **Modèles**
- `backend/models/User.js` - Méthodes `addCredits()`, `deductCredits()`, `hasEnoughCredits()`
- `backend/models/CreditHistory.js` - Historique des transactions

### **Routes**
- `backend/routes/stripe.js` - Paiements et webhooks Stripe
- `backend/routes/credits.js` - Gestion des crédits (balance, history, admin)

### **Middleware**
- `backend/middleware/creditCheck.js` - Vérification avant opération AI

### **Configuration**
- `backend/config/creditCosts.js` - Tarifs par service/modèle AI

## 🔧 Configuration

### **Variables d'environnement**

```bash
# Stripe (dans O2Switch Node.js Selector)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...  # Optionnel pour webhooks
```

### **Frontend**

```bash
# react-app/.env.production
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
VITE_BACKEND_URL=https://api.assistant-redacteur.fr
```

## 💳 Offres de recharge

| Offre | Prix | Crédits | Prix/crédit | Économie |
|-------|------|---------|-------------|----------|
| Starter | 20€ | 400 | 0,05€ | - |
| Pro | 50€ | 1100 | 0,045€ | 10% |
| Business | 100€ | 2500 | 0,04€ | 20% |
| Enterprise | 200€ | 5500 | 0,036€ | 28% |

## 🎯 Coûts par service AI

### Anthropic Claude
- **Claude 3 Opus**: 0,00015 crédit/token
- **Claude 3 Sonnet**: 0,00003 crédit/token
- **Claude 3 Haiku**: 0,0000025 crédit/token

### OpenAI
- **GPT-4**: 0,0003 crédit/token
- **GPT-4 Turbo**: 0,0001 crédit/token
- **GPT-3.5 Turbo**: 0,000015 crédit/token

### Google Gemini
- **Gemini Pro**: 0,0000025 crédit/token

## 🔐 Sécurité

### **Webhook Stripe**

Le webhook `/stripe/webhooks` vérifie la signature Stripe pour garantir l'authenticité des événements.

```javascript
const event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
```

### **Middleware de vérification**

```javascript
import { checkCredits } from '../middleware/creditCheck.js';

router.post('/generate-content', 
  authenticateToken,
  checkCredits,  // ← Vérifie le solde AVANT l'appel AI
  async (req, res) => {
    // ... appel AI ...
    
    // Déduire les crédits réels après l'opération
    await deductCreditsAfterUsage(
      req.user.id,
      'anthropic',
      'claude-3-sonnet',
      { input: 1000, output: 500, total: 1500 }
    );
  }
);
```

## 📊 Endpoints API

### **Crédits utilisateur**

```bash
# Consulter le solde
GET /credits/balance
Authorization: Bearer <token>

# Historique des transactions
GET /credits/history?limit=50&skip=0
Authorization: Bearer <token>

# Offres de recharge
GET /credits/offers
Authorization: Bearer <token>
```

### **Stripe**

```bash
# Créer un paiement
POST /stripe/create-payment-intent
Content-Type: application/json
{
  "amount": 20,
  "userEmail": "user@example.com"
}

# Webhook (appelé par Stripe)
POST /stripe/webhooks
Stripe-Signature: <signature>
```

### **Admin**

```bash
# Ajouter des crédits manuellement
POST /credits/add
Authorization: Bearer <admin-token>
{
  "userId": "user@example.com",
  "amount": 100,
  "type": "bonus",
  "description": "Bonus de bienvenue"
}

# Statistiques globales
GET /credits/admin/stats
Authorization: Bearer <admin-token>
```

## 🧪 Tests

### **Test du webhook Stripe (local)**

```bash
# Installer Stripe CLI
stripe listen --forward-to localhost:4000/stripe/webhooks

# Déclencher un événement de test
stripe trigger payment_intent.succeeded
```

### **Test de déduction de crédits**

```javascript
// Dans un controller
const { deductCreditsAfterUsage } = await import('../middleware/creditCheck.js');

const result = await deductCreditsAfterUsage(
  'user@example.com',
  'anthropic',
  'claude-3-sonnet-20240229',
  { input: 1000, output: 500, total: 1500 },
  { articleId: '123' }
);

console.log(`Crédits déduits: ${result.creditsDeducted}`);
console.log(`Nouveau solde: ${result.newBalance}`);
```

## ⚠️ Points d'attention

### **1. Toujours vérifier AVANT l'appel AI**

```javascript
// ✅ BON
router.post('/generate', checkCredits, async (req, res) => {
  const result = await callAI();
  await deductCreditsAfterUsage(...);
});

// ❌ MAUVAIS - Pas de vérification avant
router.post('/generate', async (req, res) => {
  const result = await callAI();  // Peut échouer si pas assez de crédits
  await deductCreditsAfterUsage(...);
});
```

### **2. Déduire les crédits RÉELS, pas estimés**

```javascript
// ✅ BON - Utilise les tokens réels retournés par l'API
const aiResponse = await callAI();
await deductCreditsAfterUsage(userId, service, model, aiResponse.usage);

// ❌ MAUVAIS - Utilise une estimation
await deductCreditsAfterUsage(userId, service, model, { total: 2000 });
```

### **3. Gérer les erreurs**

```javascript
try {
  const result = await callAI();
  await deductCreditsAfterUsage(...);
} catch (error) {
  // Si l'appel AI échoue, ne PAS déduire les crédits
  logger.error('AI call failed:', error);
  throw error;
}
```

## 🚀 Déploiement

### **1. Uploader les fichiers modifiés**

```bash
# Via FileZilla
backend/routes/stripe.js
backend/middleware/creditCheck.js
backend/package.json
```

### **2. Installer les dépendances**

```bash
# Via O2Switch Node.js Selector
# Cliquer sur "Run NPM Install"
```

### **3. Configurer les variables d'environnement**

Dans O2Switch Node.js Selector, ajouter :
```
STRIPE_SECRET_KEY=sk_test_...
```

### **4. Redémarrer l'application**

```bash
# Via O2Switch Node.js Selector
# Cliquer sur "Restart"
```

### **5. Tester**

```bash
curl https://api.assistant-redacteur.fr/stripe/health
curl https://api.assistant-redacteur.fr/credits/offers
```

## 📝 TODO

- [ ] Ajouter le middleware `checkCredits` sur les routes de génération de contenu
- [ ] Implémenter le modèle `Usage` pour tracker l'utilisation détaillée
- [ ] Ajouter des notifications par email lors de crédits faibles
- [ ] Créer un dashboard admin pour gérer les crédits
- [ ] Implémenter des crédits promotionnels avec date d'expiration
- [ ] Ajouter des webhooks pour notifier le frontend en temps réel

## 🆘 Dépannage

### **Les crédits ne sont pas ajoutés après paiement**

1. Vérifier les logs : `~/assistant-redacteur/backend/utils/logs/combined.log`
2. Vérifier que `STRIPE_SECRET_KEY` est configurée
3. Tester le webhook manuellement avec Stripe CLI

### **Erreur "Insufficient credits"**

1. Vérifier le solde : `GET /credits/balance`
2. Vérifier les coûts : `backend/config/creditCosts.js`
3. Ajouter des crédits manuellement : `POST /credits/add`

### **Le middleware ne fonctionne pas**

1. Vérifier qu'il est importé : `import { checkCredits } from '../middleware/creditCheck.js'`
2. Vérifier qu'il est appliqué : `router.post('/route', authenticateToken, checkCredits, ...)`
3. Vérifier les logs pour voir les erreurs
