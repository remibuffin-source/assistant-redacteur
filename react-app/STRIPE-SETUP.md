# 🚀 Configuration Stripe - Assistant Rédacteur

## 📋 Prérequis

1. **Compte Stripe** : Créez un compte sur [stripe.com](https://stripe.com)
2. **Clés API** : Récupérez vos clés dans le Dashboard Stripe

## 🔑 Étape 1 : Récupérer vos clés Stripe

1. Connectez-vous à [dashboard.stripe.com](https://dashboard.stripe.com)
2. Allez dans **Developers > API Keys**
3. Copiez :
   - **Publishable key** (commence par `pk_test_...`)
   - **Secret key** (commence par `sk_test_...`)

## ⚙️ Étape 2 : Configuration des variables d'environnement

Créez un fichier `.env.local` dans le dossier `react-app` :

```bash
# Frontend (Clé publique - peut être exposée)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_votre_cle_publique_ici

# Backend (Clé secrète - NE JAMAIS COMMITER)
STRIPE_SECRET_KEY=sk_test_votre_cle_secrete_ici

# Webhook (optionnel pour le moment)
STRIPE_WEBHOOK_SECRET=whsec_votre_webhook_secret
```

⚠️ **IMPORTANT** : Ne commitez JAMAIS le fichier `.env.local` dans Git !

## 🚀 Étape 3 : Démarrer les serveurs

### Option A : Démarrage manuel (2 terminaux)

**Terminal 1 - Frontend React (Vite)** :
```bash
cd react-app
npm run dev
```
→ Serveur sur http://localhost:3003

**Terminal 2 - Backend Stripe** :
```bash
cd react-app
npm run dev:stripe
```
→ API sur http://localhost:3001

Ou directement depuis le dossier stripe-backend :
```bash
cd react-app/stripe-backend
npm start
```

### Option B : Démarrage automatique (1 terminal)

```bash
cd react-app
npm run dev:all
```
→ Lance les 2 serveurs simultanément

## 🧪 Étape 4 : Tester les paiements

### Cartes de test Stripe

Utilisez ces numéros de carte pour tester :

| Carte | Numéro | Résultat |
|-------|--------|----------|
| ✅ Succès | `4242 4242 4242 4242` | Paiement réussi |
| ❌ Échec | `4000 0000 0000 0002` | Carte déclinée |
| 🔐 3D Secure | `4000 0027 6000 3184` | Authentification requise |

- **Date d'expiration** : N'importe quelle date future (ex: 12/25)
- **CVC** : N'importe quel code 3 chiffres (ex: 123)
- **Code postal** : N'importe quel code (ex: 75000)

### Test du backend

Vérifiez que le serveur Stripe fonctionne :
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

## 📡 Étape 5 : Configuration des Webhooks (optionnel)

Pour recevoir les confirmations de paiement en temps réel :

1. Installez Stripe CLI :
   ```bash
   # Windows (avec Scoop)
   scoop install stripe
   
   # Ou téléchargez depuis https://stripe.com/docs/stripe-cli
   ```

2. Connectez-vous :
   ```bash
   stripe login
   ```

3. Écoutez les webhooks :
   ```bash
   stripe listen --forward-to localhost:3001/api/webhooks
   ```

4. Copiez le webhook secret affiché et ajoutez-le dans `.env.local` :
   ```
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```

## 🔄 Workflow de paiement

1. **Utilisateur** : Sélectionne un montant sur `/subscription`
2. **Frontend** : Envoie requête à `http://localhost:3001/api/create-payment-intent`
3. **Backend** : Crée un PaymentIntent avec Stripe
4. **Frontend** : Affiche le formulaire de carte
5. **Utilisateur** : Entre ses informations de carte
6. **Stripe** : Traite le paiement
7. **Backend** : Reçoit confirmation via webhook
8. **Frontend** : Met à jour le solde de l'utilisateur

## 📊 Endpoints API disponibles

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/health` | Vérifier le statut du serveur |
| POST | `/api/create-payment-intent` | Créer un nouveau paiement |
| GET | `/api/payment-status/:id` | Vérifier le statut d'un paiement |
| POST | `/api/webhooks` | Recevoir les événements Stripe |
| GET | `/api/payments/recent` | Liste des derniers paiements |

## 🐛 Dépannage

### Le serveur Stripe ne démarre pas

Vérifiez que :
- Express est installé : `npm install express cors dotenv`
- Le port 3001 n'est pas déjà utilisé
- Les variables d'environnement sont bien définies

### Les paiements échouent

Vérifiez :
- La clé secrète Stripe dans `.env.local`
- Que le backend est bien démarré sur le port 3001
- Les logs du serveur Stripe pour voir les erreurs

### CORS errors

Si vous voyez des erreurs CORS :
- Vérifiez que le backend autorise `http://localhost:3003`
- Redémarrez les deux serveurs

## 📝 Logs et monitoring

Les logs du serveur Stripe s'affichent dans le terminal :
- ✅ Paiement réussi
- ❌ Paiement échoué
- ℹ️ Événements webhook

## 🚀 Passage en production

Quand vous serez prêt pour la production :

1. Remplacez les clés de test par les clés live :
   - `pk_live_...` (publishable key)
   - `sk_live_...` (secret key)

2. Configurez les webhooks en production dans le Dashboard Stripe

3. Activez HTTPS pour votre site

4. Testez avec de vrais paiements (petits montants d'abord)

## 📚 Ressources

- [Documentation Stripe](https://stripe.com/docs)
- [Dashboard Stripe](https://dashboard.stripe.com)
- [Cartes de test](https://stripe.com/docs/testing)
- [Webhooks](https://stripe.com/docs/webhooks)

---

✅ **Vous êtes prêt à encaisser de l'argent avec Stripe !**
