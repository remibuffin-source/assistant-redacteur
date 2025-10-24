# 💳 Backend Stripe - Assistant Rédacteur

Backend Node.js/Express dédié à la gestion des paiements Stripe.

## 📁 Structure

```
stripe-backend/
├── server.cjs          # Serveur Express principal
├── package.json        # Dépendances Node.js
├── .env               # Variables d'environnement (à créer)
├── .env.example       # Exemple de configuration
├── .gitignore         # Fichiers à ignorer
└── README.md          # Cette documentation
```

## 🚀 Installation

```bash
cd stripe-backend
npm install
```

## ⚙️ Configuration

1. Copiez `.env.example` vers `.env`
2. Ajoutez votre clé secrète Stripe :

```bash
STRIPE_SECRET_KEY=sk_live_votre_cle_secrete_ici
PORT=3001
NODE_ENV=development
```

## 🎯 Démarrage

```bash
npm start
```

Le serveur démarre sur http://localhost:3001

## 📡 Endpoints API

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/health` | Vérifier le statut du serveur |
| POST | `/api/create-payment-intent` | Créer un nouveau paiement |
| GET | `/api/payment-status/:id` | Vérifier le statut d'un paiement |
| POST | `/api/webhooks` | Recevoir les événements Stripe |
| GET | `/api/payments/recent` | Liste des derniers paiements |

## 🔐 Sécurité

- ⚠️ Ne commitez JAMAIS le fichier `.env`
- ✅ Utilisez des clés de test (`sk_test_...`) en développement
- ✅ Utilisez des clés live (`sk_live_...`) en production uniquement

## 🧪 Test

```bash
curl http://localhost:3001/api/health
```

Réponse attendue :
```json
{
  "status": "OK",
  "message": "Serveur Stripe opérationnel",
  "timestamp": "2025-10-07T..."
}
```
