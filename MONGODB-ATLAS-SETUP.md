# 🍃 Configuration MongoDB Atlas (Gratuit)

Guide complet pour configurer MongoDB Atlas et connecter votre application.

---

## 🎯 Étape 1 : Créer un compte MongoDB Atlas

### 1.1 Inscription
1. Allez sur : https://www.mongodb.com/cloud/atlas/register
2. Créez un compte avec votre email professionnel
3. Vérifiez votre email

### 1.2 Créer un cluster gratuit
1. Cliquez sur **"Build a Database"**
2. Sélectionnez **"M0 FREE"** (512MB gratuit)
3. Choisissez :
   - **Provider** : AWS
   - **Region** : `eu-west-1` (Irlande - même région que ton backend)
4. Cluster Name : `assistant-redacteur`
5. Cliquez sur **"Create"**

⏱️ **Attendre 3-5 minutes** pour la création du cluster

---

## 🔐 Étape 2 : Configurer la sécurité

### 2.1 Créer un utilisateur de base de données

1. Dans le menu de gauche, cliquez sur **"Database Access"**
2. Cliquez sur **"Add New Database User"**
3. Remplissez :
   - **Username** : `admin_redacteur`
   - **Password** : Générer un mot de passe fort (cliquez sur "Autogenerate Secure Password")
   - **⚠️ IMPORTANT** : Copiez et sauvegardez ce mot de passe !
4. **Database User Privileges** : Sélectionnez `Read and write to any database`
5. Cliquez sur **"Add User"**

### 2.2 Configurer l'accès réseau

1. Dans le menu de gauche, cliquez sur **"Network Access"**
2. Cliquez sur **"Add IP Address"**
3. **Option 1 (Développement)** :
   - Cliquez sur **"Allow Access from Anywhere"**
   - IP : `0.0.0.0/0`
   - ⚠️ À restreindre en production !
4. **Option 2 (Production - Recommandé)** :
   - Ajoutez l'IP de votre instance EC2 Elastic Beanstalk
   - Trouvez l'IP dans AWS EC2 Console
5. Cliquez sur **"Confirm"**

---

## 🔗 Étape 3 : Obtenir la chaîne de connexion

### 3.1 Récupérer l'URI de connexion

1. Retournez sur **"Database"** dans le menu de gauche
2. Cliquez sur **"Connect"** sur votre cluster
3. Sélectionnez **"Connect your application"**
4. **Driver** : Node.js
5. **Version** : 5.5 or later
6. Copiez la chaîne de connexion :

```
mongodb+srv://admin_redacteur:<password>@assistant-redacteur.xxxxx.mongodb.net/?retryWrites=true&w=majority
```

### 3.2 Remplacer le mot de passe

Remplacez `<password>` par le mot de passe que vous avez sauvegardé à l'étape 2.1

**Exemple** :
```
mongodb+srv://admin_redacteur:VotreMot2Passe123!@assistant-redacteur.xxxxx.mongodb.net/?retryWrites=true&w=majority
```

---

## ⚙️ Étape 4 : Configuration locale

### 4.1 Ajouter l'URI dans `.env`

Ouvrez `backend/.env` et ajoutez :

```env
# MongoDB Atlas
MONGODB_URI=mongodb+srv://admin_redacteur:VotreMot2Passe123!@assistant-redacteur.xxxxx.mongodb.net/assistant-redacteur?retryWrites=true&w=majority

# Clé de chiffrement pour les API Keys (32 caractères)
ENCRYPTION_KEY=votre-cle-de-32-caracteres-ici
```

⚠️ **Important** : Ajoutez `/assistant-redacteur` après `.mongodb.net` pour spécifier le nom de la base de données

### 4.2 Générer une clé de chiffrement

Exécutez dans PowerShell :

```powershell
# Générer une clé aléatoire de 32 caractères
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | % {[char]$_})
```

Copiez le résultat dans `ENCRYPTION_KEY`

---

## 🧪 Étape 5 : Tester la connexion

### 5.1 Démarrer le backend

```powershell
cd backend
npm run dev
```

### 5.2 Vérifier les logs

Vous devriez voir :
```
✅ MongoDB connecté: assistant-redacteur-shard-00-00.xxxxx.mongodb.net
📊 Base de données: assistant-redacteur
🚀 Assistant Rédactionnel Backend Server running on port 4000
```

### 5.3 Tester l'API

```powershell
# Test de santé
curl http://localhost:4000/health

# Test sauvegarde clé API (nécessite authentification)
curl -X POST http://localhost:4000/api/admin/api-keys `
  -H "Content-Type: application/json" `
  -H "Authorization: Bearer VOTRE_TOKEN" `
  -d '{"apiKeys":{"openai":"sk-test123"}}'
```

---

## 🚀 Étape 6 : Configuration production (Elastic Beanstalk)

### 6.1 Ajouter les variables d'environnement

```powershell
cd backend

# Ajouter MongoDB URI
eb setenv MONGODB_URI="mongodb+srv://admin_redacteur:VotreMot2Passe123!@assistant-redacteur.xxxxx.mongodb.net/assistant-redacteur?retryWrites=true&w=majority"

# Ajouter la clé de chiffrement
eb setenv ENCRYPTION_KEY="votre-cle-de-32-caracteres-ici"
```

### 6.2 Déployer

```powershell
eb deploy
```

### 6.3 Vérifier en production

```powershell
curl http://assistant-redactionnel-prod.eba-ei9m8ug2.eu-west-1.elasticbeanstalk.com/health
```

---

## 📊 Étape 7 : Surveiller MongoDB Atlas

### 7.1 Dashboard MongoDB Atlas

1. Allez sur https://cloud.mongodb.com
2. Sélectionnez votre cluster
3. Onglet **"Metrics"** : Voir l'utilisation
4. Onglet **"Collections"** : Voir les données

### 7.2 Collections créées automatiquement

- `users` : Utilisateurs de l'application
- `apikeys` : Clés API chiffrées
- `publications` : Publications sur les réseaux sociaux
- `socialaccounts` : Comptes sociaux connectés

---

## 🔒 Sécurité

### ✅ Bonnes pratiques

1. **Mot de passe fort** : Utilisez un mot de passe généré automatiquement
2. **IP Whitelist** : Restreignez l'accès aux IPs de vos serveurs
3. **Chiffrement** : Les clés API sont chiffrées avec AES-256
4. **Rotation** : Changez régulièrement les mots de passe
5. **Backups** : MongoDB Atlas fait des backups automatiques

### ⚠️ À ne JAMAIS faire

- ❌ Commiter le `.env` dans Git
- ❌ Partager les credentials MongoDB
- ❌ Utiliser `0.0.0.0/0` en production
- ❌ Utiliser le même mot de passe partout

---

## 💰 Tarification

### Plan Gratuit (M0)
- ✅ 512 MB de stockage
- ✅ Connexions partagées
- ✅ Backups automatiques
- ✅ Parfait pour démarrer

### Upgrade si nécessaire
- **M10** : $0.08/heure (~$57/mois) - 2GB RAM
- **M20** : $0.20/heure (~$144/mois) - 4GB RAM

---

## 🆘 Dépannage

### Erreur : "Authentication failed"
- Vérifiez le mot de passe dans l'URI
- Vérifiez que l'utilisateur existe dans "Database Access"

### Erreur : "Connection timeout"
- Vérifiez que votre IP est dans "Network Access"
- Vérifiez que le cluster est actif

### Erreur : "Database not found"
- Ajoutez `/assistant-redacteur` après `.mongodb.net` dans l'URI

### Logs MongoDB
```powershell
# Voir les logs du backend
cd backend
npm run dev
```

---

## 📚 Ressources

- Documentation MongoDB Atlas : https://docs.atlas.mongodb.com/
- Mongoose Documentation : https://mongoosejs.com/docs/
- Support MongoDB : https://support.mongodb.com/

---

## ✅ Checklist finale

- [ ] Compte MongoDB Atlas créé
- [ ] Cluster M0 (gratuit) créé en `eu-west-1`
- [ ] Utilisateur de base de données créé
- [ ] Mot de passe sauvegardé en lieu sûr
- [ ] IP autorisée dans Network Access
- [ ] URI de connexion copiée
- [ ] `MONGODB_URI` ajouté dans `.env` local
- [ ] `ENCRYPTION_KEY` générée et ajoutée
- [ ] Backend testé en local avec succès
- [ ] Variables ajoutées sur Elastic Beanstalk
- [ ] Déploiement en production réussi
- [ ] API `/api/admin/api-keys` testée

---

🎉 **Félicitations !** Votre base de données MongoDB Atlas est maintenant configurée et opérationnelle !
