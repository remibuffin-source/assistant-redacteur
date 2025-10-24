# 📧 Configuration Gmail pour l'Envoi d'Emails Réels

## 🎯 Objectif

Configurer Gmail pour envoyer de **vrais emails** de vérification via le serveur Node.js.

---

## 📋 Prérequis

- Un compte Gmail actif
- Accès aux paramètres de sécurité Google

---

## 🔐 Étape 1 : Créer un Mot de Passe d'Application Gmail

### 1. **Activer la validation en 2 étapes** (si pas déjà fait)

1. Allez sur : https://myaccount.google.com/security
2. Cliquez sur "Validation en 2 étapes"
3. Suivez les instructions pour l'activer

### 2. **Créer un mot de passe d'application**

1. Allez sur : https://myaccount.google.com/apppasswords
2. Connectez-vous si demandé
3. Dans "Sélectionner l'application" : choisissez **"Autre (nom personnalisé)"**
4. Entrez : `Assistant Rédacteur`
5. Cliquez sur **"Générer"**
6. **COPIEZ le mot de passe à 16 caractères** (format : `xxxx xxxx xxxx xxxx`)
7. ⚠️ **IMPORTANT** : Vous ne pourrez plus le revoir, notez-le !

---

## 📝 Étape 2 : Configurer le fichier .env.local

### 1. **Ouvrir le fichier**

Fichier : `react-app\.env.local`

### 2. **Ajouter/Modifier ces lignes**

```env
# Configuration Email Gmail
VITE_EMAIL_USER=votre_email@gmail.com
VITE_EMAIL_PASSWORD=xxxxxxxxxxxxxxxx
```

**Remplacez** :
- `votre_email@gmail.com` par votre adresse Gmail
- `xxxxxxxxxxxxxxxx` par le mot de passe à 16 caractères (SANS espaces)

### 3. **Exemple complet**

```env
# Configuration Email Gmail
VITE_EMAIL_USER=studio.capbrun@gmail.com
VITE_EMAIL_PASSWORD=abcd efgh ijkl mnop
```

⚠️ **Retirez les espaces** du mot de passe : `abcdefghijklmnop`

---

## 🚀 Étape 3 : Démarrer le Serveur Email

### **Option 1 : Script automatique** (Recommandé)

Double-cliquez sur : `DEMARRER-SERVEUR-EMAIL.bat`

### **Option 2 : Ligne de commande**

```bash
cd react-app
node server.js
```

### **Vérification**

Vous devriez voir :

```
=============================================================
🚀 SERVEUR EMAIL DÉMARRÉ
=============================================================
📍 URL locale:  http://localhost:3001
📍 URL réseau:  http://127.0.0.1:3001
📧 Email configuré: studio.capbrun@gmail.com
🔗 Endpoint API: POST http://localhost:3001/api/send-email
=============================================================
```

✅ Si vous voyez votre email, c'est bon !
❌ Si vous voyez "❌ NON CONFIGURÉ", vérifiez `.env.local`

---

## 🧪 Étape 4 : Tester l'Envoi d'Email

### 1. **Créer un nouveau compte**

1. Allez sur : http://localhost:3003/login
2. Cliquez sur "S'inscrire"
3. Remplissez le formulaire avec **votre vrai email**
4. Cliquez sur "S'inscrire"

### 2. **Vérifier l'envoi**

Dans la console du serveur email, vous devriez voir :

```
────────────────────────────────────────────────────────────
📨 NOUVELLE REQUÊTE D'ENVOI D'EMAIL
────────────────────────────────────────────────────────────
📧 Destinataire: votre_email@example.com
📝 Sujet: 🔐 Vérifiez votre compte - Assistant Rédactionnel
⏰ Heure: 16:30:45
📤 Envoi en cours...
✅ Email envoyé avec succès à votre_email@example.com
────────────────────────────────────────────────────────────
```

### 3. **Vérifier votre boîte mail**

- Ouvrez votre boîte de réception
- Cherchez l'email de "Assistant Rédactionnel"
- Le code de vérification est dans l'email

---

## 🔧 Dépannage

### Problème : "Configuration email manquante"

**Solution** :
1. Vérifiez que `.env.local` existe dans `react-app/`
2. Vérifiez que les variables sont bien nommées : `VITE_EMAIL_USER` et `VITE_EMAIL_PASSWORD`
3. Redémarrez le serveur email

### Problème : "Invalid login: 535-5.7.8 Username and Password not accepted"

**Solution** :
1. Vérifiez que la validation en 2 étapes est activée
2. Créez un NOUVEAU mot de passe d'application
3. Copiez-le SANS espaces dans `.env.local`
4. Redémarrez le serveur

### Problème : "ECONNREFUSED"

**Solution** :
- Le serveur email n'est pas démarré
- Lancez `DEMARRER-SERVEUR-EMAIL.bat`

### Problème : L'email n'arrive pas

**Solutions** :
1. Vérifiez les **spams/courrier indésirable**
2. Attendez 1-2 minutes (délai de livraison)
3. Vérifiez les logs du serveur email pour voir si l'envoi a réussi

---

## 📊 Architecture

```
┌─────────────────┐
│  React App      │
│  (Port 3003)    │
└────────┬────────┘
         │ POST /api/send-email
         ▼
┌─────────────────┐
│  Serveur Email  │
│  (Port 3001)    │
│  + Nodemailer   │
└────────┬────────┘
         │ SMTP
         ▼
┌─────────────────┐
│  Gmail SMTP     │
│  smtp.gmail.com │
│  Port 587       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Boîte Email    │
│  Destinataire   │
└─────────────────┘
```

---

## 🔒 Sécurité

### ⚠️ IMPORTANT

- ❌ **NE JAMAIS** commiter `.env.local` sur Git
- ❌ **NE JAMAIS** partager votre mot de passe d'application
- ✅ Le fichier `.env.local` est déjà dans `.gitignore`
- ✅ Utilisez des mots de passe d'application, pas votre mot de passe Gmail principal

### En production

- Utilisez des variables d'environnement serveur
- Stockez les secrets dans un gestionnaire de secrets (AWS Secrets Manager, Azure Key Vault, etc.)
- Activez le rate limiting pour éviter l'abus
- Ajoutez des logs d'audit

---

## 📞 Support

### Liens utiles

- Mots de passe d'application Gmail : https://myaccount.google.com/apppasswords
- Sécurité du compte Google : https://myaccount.google.com/security
- Documentation Nodemailer : https://nodemailer.com/

### En cas de problème

1. Vérifiez les logs du serveur email
2. Testez avec un autre compte Gmail
3. Vérifiez que le port 3001 n'est pas bloqué par le pare-feu

---

**Dernière mise à jour** : 11 octobre 2025
**Version** : 1.0.0
