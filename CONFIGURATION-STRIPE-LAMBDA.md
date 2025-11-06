# 💳 Configuration Stripe Backend sur AWS Lambda

## 🎯 Architecture

```
Frontend (Amplify - HTTPS)
    ↓ VITE_STRIPE_BACKEND_URL
AWS Lambda (stripe-service)
    ↓ STRIPE_SECRET_KEY
Stripe API
```

---

## ⚙️ Variables d'environnement

### Amplify (Production - Frontend)
```bash
VITE_STRIPE_BACKEND_URL=https://i7owk63g2bogrvvws67nq2f2we0mjkra.lambda-url.eu-west-1.on.aws
```

### Lambda (Production - Backend Stripe)
```bash
STRIPE_SECRET_KEY=sk_test_xxxxx (votre clé secrète Stripe)
STRIPE_WEBHOOK_SECRET=whsec_xxxxx (optionnel, pour les webhooks)
```

### .env.local (Développement)
```bash
# Pas besoin de VITE_STRIPE_BACKEND_URL en local
# Le code utilise http://localhost:3005 par défaut
```

---

## 📋 Routes disponibles

### GET /api/health
Test de santé du serveur
```bash
curl https://i7owk63g2bogrvvws67nq2f2we0mjkra.lambda-url.eu-west-1.on.aws/api/health
```

### POST /api/create-payment-intent
Créer un PaymentIntent
```json
{
  "amount": 10.00,
  "userEmail": "user@example.com"
}
```

### GET /api/payment-status/:paymentIntentId
Vérifier le statut d'un paiement

### POST /api/webhooks
Webhook Stripe (pour les confirmations de paiement)

### GET /api/payments/recent?limit=10
Liste des derniers paiements (admin)

---

## 💰 Coûts

- **AWS Lambda** : 1M requêtes GRATUITES par mois
- **Stripe** : Frais de transaction uniquement (pas de frais fixes)

---

## 🔧 Déploiement

### 1. Créer le package
```bash
cd react-app/stripe-backend
.\deploy-lambda.ps1
```

### 2. Uploader sur AWS Lambda
- Fonction : `stripe-service`
- Runtime : Node.js 22.x
- Fichier : `stripe-lambda.zip`

### 3. Configurer les variables d'environnement
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET` (optionnel)

### 4. Configurer Function URL
- Auth : NONE
- CORS : Activé
- Origine : `https://main.d11u2kdk7dgidv.amplifyapp.com`

### 5. Mettre à jour Amplify
- Ajouter `VITE_STRIPE_BACKEND_URL` dans les variables d'environnement

---

## 🧪 Test

### Test local
```bash
cd react-app/stripe-backend
npm start
```

### Test Lambda
```bash
curl https://i7owk63g2bogrvvws67nq2f2we0mjkra.lambda-url.eu-west-1.on.aws/api/health
```

---

Date de configuration : 5 novembre 2025
