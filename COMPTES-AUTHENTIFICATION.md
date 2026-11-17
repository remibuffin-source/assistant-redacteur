# 🔐 Comptes d'Authentification - Assistant Rédacteur

## ⚠️ IMPORTANT : Vérification par Email

### 🚫 Vous ne recevrez PAS d'email en développement !

**C'est normal !** Le système affiche le code de vérification **directement sur la page** après l'inscription.

**Workflow** :
1. Inscription → Redirection automatique vers la page de vérification
2. Le code à 6 chiffres s'affiche dans une **boîte orange** sur la page
3. Copiez-collez ce code dans le champ en dessous
4. Validez → Compte activé !

**Pas besoin de consulter vos emails !** 📧❌

---

## 📋 Vue d'ensemble

Le système d'authentification utilise **localStorage** pour stocker les utilisateurs en développement. En production, cela sera remplacé par une vraie base de données.

---

## 👤 Compte Administrateur (Créé automatiquement)

### Identifiants :
- **Email** : `admin@assistant-redacteur.fr`
- **Mot de passe** : `AdminRedacteur2025!`
- **Rôle** : Administrateur
- **Privilèges** : Accès complet à toutes les fonctionnalités

### Caractéristiques :
- ✅ Vérifié automatiquement
- ✅ Créé au premier lancement de l'application
- ✅ Accès à la configuration des API IA
- ✅ Gestion des comptes utilisateurs

---

## 🧪 Compte de Test (À créer manuellement)

### Identifiants :
- **Email** : `test@example.com`
- **Mot de passe** : `Test1234!`
- **Rôle** : Utilisateur standard
- **Privilèges** : Accès aux fonctionnalités utilisateur

### Comment créer ce compte :
1. Ouvrir `init-auth.html` dans le navigateur
2. Cliquer sur "✅ Créer le compte de test"
3. Le compte sera créé et vérifié automatiquement

---

## 🛠️ Outil d'Initialisation

### Fichier : `init-auth.html`

**Localisation** : `react-app/init-auth.html`

**Fonctionnalités** :
- 🔄 Initialiser l'authentification
- 👥 Afficher tous les utilisateurs
- ✅ Créer le compte de test
- 🗑️ Réinitialiser complètement l'authentification
- 🔑 Tester la connexion admin

### Comment l'utiliser :
1. Ouvrir le fichier dans un navigateur : `http://localhost:3003/init-auth.html`
2. Utiliser les boutons pour gérer l'authentification
3. Les modifications sont appliquées immédiatement dans localStorage

---

## 🔒 Règles de Mot de Passe

Pour créer un nouveau compte, le mot de passe doit respecter :

- ✅ Minimum **8 caractères**
- ✅ Au moins **1 minuscule** (a-z)
- ✅ Au moins **1 majuscule** (A-Z)
- ✅ Au moins **1 chiffre** (0-9)
- ✅ Au moins **1 caractère spécial** (@$!%*?&)

**Exemples valides** :
- `AdminStudio2025!`
- `Test1234!`
- `MyPass123@`

---

## 📦 Stockage localStorage

### Clés utilisées :
- `auth_users` : Liste de tous les utilisateurs
- `auth_sessions` : Sessions actives
- `auth_data` : Données de l'utilisateur connecté
- `auth_pending_verifications` : Vérifications email en attente

### Vider le cache :
Si vous avez vidé le cache du navigateur :
1. Ouvrir `init-auth.html`
2. Cliquer sur "🔄 Initialiser l'authentification"
3. Les comptes seront recréés automatiquement

---

## 🚀 Workflow de Connexion

### Première connexion :
1. Aller sur `http://localhost:3003/login`
2. Entrer les identifiants admin ou test
3. Cliquer sur "Se connecter"
4. Redirection automatique vers la page d'accueil

### Après avoir vidé le cache :
1. Ouvrir `init-auth.html` dans le navigateur
2. Vérifier que les comptes sont créés
3. Retourner sur `/login`
4. Se connecter normalement

---

## 🔧 Dépannage

### Problème : "Identifiants incorrects"
**Solution** :
1. Ouvrir `init-auth.html`
2. Cliquer sur "👥 Afficher les utilisateurs"
3. Vérifier que le compte existe
4. Si absent, cliquer sur "🔄 Initialiser l'authentification"

### Problème : "Compte non vérifié"
**Solution** :
- Les comptes admin et test sont **automatiquement vérifiés**
- Pas besoin de vérification par email pour ces comptes

### Problème : "Session expirée"
**Solution** :
1. Se déconnecter
2. Se reconnecter avec les identifiants
3. Une nouvelle session sera créée

---

## 📧 Système de Vérification Email

### ⚠️ IMPORTANT : Pas d'email envoyé en développement !

**En développement, vous ne recevrez PAS d'email.** C'est normal et voulu !

### Comment ça fonctionne :

#### 1. **Lors de l'inscription** :
- Remplissez le formulaire d'inscription
- Cliquez sur "S'inscrire"
- Vous serez **automatiquement redirigé** vers la page de vérification

#### 2. **Sur la page de vérification** :
- ✅ Le code de vérification est **affiché directement** dans une boîte orange
- ✅ Il suffit de **copier-coller** ce code dans le champ en dessous
- ✅ Pas besoin de consulter vos emails !

#### 3. **Exemple visuel** :
```
┌─────────────────────────────────────┐
│ 🔑 Votre code de vérification :     │
│                                     │
│         123456                      │
│                                     │
│ Copiez ce code et collez-le         │
│ dans le champ ci-dessous            │
└─────────────────────────────────────┘
```

### En production :
- Les emails seront envoyés via le serveur email (port 3001)
- Configuration SMTP requise dans `.env`
- Codes de vérification à 6 chiffres envoyés par email
- Pas d'affichage du code dans l'interface

---

## 🎯 Prochaines Étapes pour la Production

### À implémenter :
- [ ] Connexion à une vraie base de données (PostgreSQL/MySQL)
- [ ] Hachage sécurisé avec bcrypt ou argon2
- [ ] Tokens JWT avec expiration
- [ ] Refresh tokens
- [ ] Rate limiting sur les tentatives de connexion
- [ ] Logs d'authentification
- [ ] 2FA (authentification à deux facteurs)
- [ ] OAuth2 (Google, Facebook, etc.)

### Sécurité :
- ⚠️ **Ne JAMAIS** utiliser localStorage pour les mots de passe en production
- ⚠️ **Ne JAMAIS** stocker les tokens en clair
- ⚠️ Utiliser HTTPS obligatoirement
- ⚠️ Implémenter CORS correctement
- ⚠️ Valider toutes les entrées côté serveur

---

## 📞 Support

En cas de problème :
1. Consulter les logs du navigateur (F12 → Console)
2. Vérifier le localStorage (F12 → Application → Local Storage)
3. Utiliser `init-auth.html` pour diagnostiquer
4. Réinitialiser si nécessaire

---

**Dernière mise à jour** : 11 octobre 2025
**Version** : 1.0.0
**Environnement** : Développement
