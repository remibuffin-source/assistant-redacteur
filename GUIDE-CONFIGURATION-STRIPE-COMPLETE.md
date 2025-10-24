# 🔧 GUIDE COMPLET - CONFIGURATION STRIPE

## 📋 RÉSUMÉ DU PROBLÈME

Vous avez un compte Stripe mais les paiements ne fonctionnent pas.
Le serveur Stripe ne répond pas sur http://localhost:3005/api/health

---

## ✅ SOLUTION COMPLÈTE

### **Étape 1 : Vérifier les 2 fichiers de configuration**

Vous avez besoin de **2 fichiers .env différents** :

#### **A. Backend Stripe** (serveur Node.js)
**Fichier** : `react-app/stripe-backend/.env`

**Contenu requis** :
```env
# Clé SECRÈTE Stripe (commence par sk_test_)
STRIPE_SECRET_KEY=sk_test_VOTRE_CLE_SECRETE_ICI

# Optionnel
STRIPE_WEBHOOK_SECRET=whsec_VOTRE_WEBHOOK_SECRET
PORT=3005
NODE_ENV=development
```

#### **B. Frontend React** (application Vite)
**Fichier** : `react-app/.env.local`

**Contenu requis** :
```env
# Clé PUBLIQUE Stripe (commence par pk_test_)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_VOTRE_CLE_PUBLIQUE_ICI
```

---

### **Étape 2 : Obtenir vos clés Stripe**

1. **Connectez-vous** sur https://dashboard.stripe.com/
2. Cliquez sur **"Développeurs"** (menu en haut)
3. Cliquez sur **"Clés API"**
4. **Activez le mode TEST** (toggle en haut à droite doit être sur "Test")
5. Vous verrez 2 clés :

   **Clé publiable** (Publishable key)
   ```
   pk_test_51QKfDFP3zO8VQ...
   ```
   → À copier dans `react-app/.env.local`

   **Clé secrète** (Secret key)
   ```
   sk_test_51QKfDFP3zO8VQ...
   ```
   → À copier dans `react-app/stripe-backend/.env`

---

### **Étape 3 : Modifier les fichiers**

#### **A. Modifier react-app/stripe-backend/.env**

1. Ouvrez le fichier :
   ```
   K:\developpement_app_site_web\assistant_redactionnel\assistant_redacteur\react-app\stripe-backend\.env
   ```

2. Remplacez la ligne :
   ```env
   STRIPE_SECRET_KEY=sk_live_your_secret_key_here
   ```
   
   Par votre vraie clé de test :
   ```env
   STRIPE_SECRET_KEY=sk_test_51QKfDFP3zO8VQ...
   ```

3. **Sauvegardez** le fichier

#### **B. Modifier react-app/.env.local**

1. Ouvrez le fichier :
   ```
   K:\developpement_app_site_web\assistant_redactionnel\assistant_redacteur\react-app\.env.local
   ```

2. Si le fichier n'existe pas, créez-le avec ce contenu :
   ```env
   VITE_STRIPE_PUBLISHABLE_KEY=pk_test_51QKfDFP3zO8VQ...
   ```

3. Si le fichier existe, remplacez `VOTRE_CLE_PUBLIQUE_ICI` par votre vraie clé

4. **Sauvegardez** le fichier

---

### **Étape 4 : Redémarrer les serveurs**

**IMPORTANT** : Les modifications des fichiers `.env` ne sont prises en compte qu'au démarrage.

1. **Fermez TOUTES les fenêtres** PowerShell des serveurs :
   - Email Server - Port 3001
   - React/Vite - Port 3003
   - Stripe Backend - Port 3005

2. **Relancez** les serveurs :
   ```
   Double-clic sur : DEMARRER-TOUS.ps1
   ```

3. **Attendez 15 secondes** que tout démarre

---

### **Étape 5 : Vérifier que ça fonctionne**

#### **A. Vérifier le serveur Stripe**

Ouvrez dans votre navigateur :
```
http://localhost:3005/api/health
```

**Réponse attendue** :
```json
{
  "status": "OK",
  "message": "Serveur Stripe opérationnel",
  "timestamp": "2025-10-24T..."
}
```

Si ça ne fonctionne pas :
- Regardez la fenêtre "Stripe Backend - Port 3005"
- Cherchez les messages d'erreur en rouge
- Vérifiez que la clé commence bien par `sk_test_`

#### **B. Vérifier les logs du serveur**

Dans la fenêtre "Stripe Backend - Port 3005", vous devriez voir :
```
🚀 SERVEUR STRIPE DÉMARRÉ
📍 URL: http://localhost:3005
🔐 Mode: development
💳 Stripe: Configuré ✅
```

Si vous voyez :
```
⚠️ ATTENTION: STRIPE_SECRET_KEY non définie dans .env
```
→ La clé n'est pas configurée ou le fichier n'est pas lu

---

### **Étape 6 : Tester un paiement**

1. Ouvrez l'application : http://localhost:3003
2. Cliquez sur **"Recharge"**
3. Entrez un montant : **10€**
4. Utilisez la **carte de test Stripe** :
   - **Numéro** : `4242 4242 4242 4242`
   - **Date** : `12/25` (ou n'importe quelle date future)
   - **CVC** : `123`
   - **Code postal** : `75000`
5. Cliquez sur **"Payer"**

**Résultat attendu** :
- ✅ Message : "Paiement réussi ! Votre solde a été rechargé."
- ✅ Facture générée : "Facture FACT-XXXXXXXX-XXXX générée avec succès !"
- ✅ Solde mis à jour dans "Mon Compte"

---

## 🐛 DÉPANNAGE

### **Erreur : "Stripe n'est pas chargé"**
→ Le fichier `react-app/.env.local` n'existe pas ou la clé publique est manquante

**Solution** :
1. Créez le fichier `.env.local` dans `react-app/`
2. Ajoutez : `VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...`
3. Redémarrez les serveurs

---

### **Erreur : "Erreur lors de la création du paiement"**
→ Le serveur Stripe ne fonctionne pas ou la clé secrète est invalide

**Solution** :
1. Vérifiez que http://localhost:3005/api/health répond
2. Ouvrez `react-app/stripe-backend/.env`
3. Vérifiez que `STRIPE_SECRET_KEY=sk_test_...` est correct
4. Redémarrez les serveurs

---

### **Le serveur Stripe ne démarre pas**
→ Erreur dans le fichier `.env` ou dépendances manquantes

**Solution** :
1. Regardez la fenêtre "Stripe Backend - Port 3005"
2. Notez le message d'erreur
3. Si "Module not found" :
   ```bash
   cd react-app/stripe-backend
   npm install
   ```
4. Redémarrez les serveurs

---

### **Port 3005 déjà utilisé**
→ Un autre processus utilise le port

**Solution** :
```powershell
# Trouver le processus
Get-NetTCPConnection -LocalPort 3005 | Select-Object OwningProcess

# Tuer le processus (remplacez XXXX par le PID)
Stop-Process -Id XXXX -Force
```

---

## 📁 STRUCTURE DES FICHIERS

```
assistant_redacteur/
├── react-app/
│   ├── .env.local                    ← Clé PUBLIQUE (pk_test_...)
│   ├── .env.example                  ← Modèle
│   ├── src/
│   │   ├── components/
│   │   │   └── StripePayment.jsx
│   │   └── utils/
│   │       └── stripe.js
│   └── stripe-backend/
│       ├── .env                      ← Clé SECRÈTE (sk_test_...)
│       ├── .env.example              ← Modèle
│       └── server.cjs                ← Serveur Node.js
└── DEMARRER-TOUS.ps1                 ← Script de démarrage
```

---

## ✅ CHECKLIST FINALE

- [ ] Fichier `react-app/stripe-backend/.env` existe
- [ ] Contient `STRIPE_SECRET_KEY=sk_test_...`
- [ ] Fichier `react-app/.env.local` existe
- [ ] Contient `VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...`
- [ ] Les 2 clés proviennent du même compte Stripe
- [ ] Les 2 clés sont en mode TEST (commencent par `pk_test_` et `sk_test_`)
- [ ] Serveurs redémarrés après modification
- [ ] http://localhost:3005/api/health répond "OK"
- [ ] Pas d'erreur dans la fenêtre "Stripe Backend"
- [ ] Test de paiement avec carte `4242 4242 4242 4242` réussi

---

## 🎯 RÉSUMÉ RAPIDE

**2 fichiers à configurer** :

1. **`react-app/stripe-backend/.env`**
   ```env
   STRIPE_SECRET_KEY=sk_test_VOTRE_CLE_SECRETE
   ```

2. **`react-app/.env.local`**
   ```env
   VITE_STRIPE_PUBLISHABLE_KEY=pk_test_VOTRE_CLE_PUBLIQUE
   ```

**Puis** :
- Redémarrer les serveurs
- Tester http://localhost:3005/api/health
- Tester un paiement avec `4242 4242 4242 4242`

---

**Une fois configuré, tout fonctionnera parfaitement ! 🚀**
