# 🧹 Nettoyage du Backend pour O2Switch

## 📊 Résumé

Votre backend contient actuellement des fichiers pour **AWS Elastic Beanstalk** qui ne sont plus nécessaires pour **O2Switch**.

## ❌ Fichiers à Supprimer (AWS Elastic Beanstalk)

### Dossiers AWS
```
.ebextensions/              ❌ Configuration Elastic Beanstalk
.elasticbeanstalk/          ❌ Configuration EB (logs, versions, config)
.platform/                  ❌ Configuration plateforme AWS
```

### Fichiers AWS
```
.ebignore                   ❌ Fichier ignore pour EB
Dockerfile                  ❌ Docker (O2Switch n'utilise pas Docker)
docker-compose.yml          ❌ Docker Compose (si présent)
```

### Configurations Obsolètes
```
config/database.js          ❌ MongoDB (remplacé par sequelize.js)
config/postgres.js          ❌ PostgreSQL (non utilisé)
```

### Modèles MongoDB (Anciens)
```
models/ApiKey.js            ❌ Version Mongoose
models/PricingConfig.js     ❌ Version Mongoose
models/User.js              ❌ Version Mongoose
models/Publication.js       ⚠️  À adapter en Sequelize (TODO)
models/SocialAccount.js     ⚠️  À adapter en Sequelize (TODO)
models/Usage.js             ⚠️  À adapter en Sequelize (TODO)
```

### Fichiers Temporaires
```
services/dropboxStorageService.temp.js  ❌ Fichier temporaire
MIGRATION_INSTRUCTIONS.md               ❌ Instructions obsolètes
```

## ✅ Fichiers à Conserver

### Configuration
```
server.js                   ✅ Mis à jour pour Sequelize
package.json                ✅ Dépendances
.env                        ✅ Variables d'environnement
config/sequelize.js         ✅ Configuration MySQL
config/creditCosts.js       ✅ Coûts des crédits
config/passport.js          ✅ OAuth
```

### Modèles Sequelize (Nouveaux)
```
models/User.sequelize.js            ✅ Utilisateurs
models/ApiKey.sequelize.js          ✅ Clés API
models/PricingConfig.sequelize.js   ✅ Configuration prix
models/CreditHistory.sequelize.js   ✅ Historique crédits
models/index.sequelize.js           ✅ Relations
```

### Routes (Adaptées)
```
routes/pricing.js           ✅ Mis à jour pour Sequelize
routes/apiKeys.js           ✅ Mis à jour pour Sequelize
routes/credits.sequelize.js ✅ Version Sequelize complète
routes/auth.js              ✅
routes/users.js             ✅
routes/publications.js      ✅
routes/oauth.js             ✅
routes/analytics.js         ✅
routes/email.js             ✅
routes/storage.js           ✅
```

### Services
```
services/cacheService.js            ✅ Cache mémoire (remplace Redis)
services/dropboxStorageService.js   ✅ Stockage Dropbox
services/emailService.js            ✅ Envoi d'emails
services/facebookService.js         ✅ Publication Facebook
services/linkedinService.js         ✅ Publication LinkedIn
services/twitterService.js          ✅ Publication Twitter
services/publicationScheduler.js    ✅ Planification
```

### Middleware & Utils
```
middleware/                 ✅ Auth, validation, erreurs
utils/                      ✅ Logger, helpers
```

### Scripts
```
scripts/testMigration.js    ✅ Tests de migration
scripts/migrateToMySQL.js   ✅ Migration depuis MongoDB
scripts/cleanForO2Switch.js ✅ Script de nettoyage
```

### Documentation
```
README_MIGRATION.md         ✅ Guide de migration
ROUTES_MIGRATION.md         ✅ Guide des routes
TESTS.md                    ✅ Guide de test
DEPLOIEMENT_O2SWITCH.md     ✅ Guide de déploiement
NETTOYAGE_BACKEND.md        ✅ Ce fichier
```

## 🚀 Méthode 1 : Nettoyage Automatique (Recommandé)

### Exécuter le Script

```bash
# Nettoyer les fichiers AWS
node scripts/cleanForO2Switch.js

# Nettoyer ET renommer les fichiers Sequelize
node scripts/cleanForO2Switch.js --rename
```

### Ce que le Script Fait

1. ✅ Supprime tous les fichiers AWS
2. ✅ Supprime les configurations obsolètes
3. ✅ Supprime les anciens modèles MongoDB
4. ✅ Crée un fichier `.o2switchignore`
5. ⚠️  Option `--rename` : Renomme les fichiers `.sequelize.js` en `.js`

## 🔧 Méthode 2 : Nettoyage Manuel

### Étape 1 : Supprimer les Dossiers AWS

```bash
# Windows PowerShell
Remove-Item -Recurse -Force .ebextensions
Remove-Item -Recurse -Force .elasticbeanstalk
Remove-Item -Recurse -Force .platform
```

### Étape 2 : Supprimer les Fichiers AWS

```bash
Remove-Item .ebignore
Remove-Item Dockerfile
```

### Étape 3 : Supprimer les Configurations Obsolètes

```bash
Remove-Item config/database.js
Remove-Item config/postgres.js
```

### Étape 4 : Supprimer les Anciens Modèles

```bash
Remove-Item models/ApiKey.js
Remove-Item models/PricingConfig.js
Remove-Item models/User.js
```

### Étape 5 : Renommer les Modèles Sequelize (Optionnel)

```bash
Rename-Item models/ApiKey.sequelize.js ApiKey.js
Rename-Item models/PricingConfig.sequelize.js PricingConfig.js
Rename-Item models/User.sequelize.js User.js
Rename-Item routes/credits.sequelize.js credits.js
```

## 📦 Fichiers à NE PAS Uploader sur O2Switch

Créez un fichier `.o2switchignore` :

```
node_modules/
.env
.env.local
.env.*.local
npm-debug.log*
.DS_Store
*.log
coverage/
.vscode/
.idea/
tests/
*.test.js
*.spec.js
.git/
.gitignore
README*.md
TESTS.md
scripts/testMigration.js
scripts/migrateToMySQL.js
scripts/cleanForO2Switch.js
```

## 📊 Comparaison Avant/Après

### Avant (AWS)
```
backend/
├── .ebextensions/          ❌ AWS
├── .elasticbeanstalk/      ❌ AWS
├── .platform/              ❌ AWS
├── Dockerfile              ❌ Docker
├── config/
│   ├── database.js         ❌ MongoDB
│   └── postgres.js         ❌ PostgreSQL
└── models/
    ├── User.js             ❌ Mongoose
    └── ApiKey.js           ❌ Mongoose
```

### Après (O2Switch)
```
backend/
├── config/
│   └── sequelize.js        ✅ MySQL
├── models/
│   ├── User.sequelize.js   ✅ Sequelize
│   └── ApiKey.sequelize.js ✅ Sequelize
├── services/
│   └── cacheService.js     ✅ Cache mémoire
└── server.js               ✅ Mis à jour
```

## ⚠️ Points d'Attention

### Ne PAS Supprimer

- ❌ `node_modules/` - Sera recréé avec `npm install`
- ❌ `.env` - Contient vos secrets (à adapter pour O2Switch)
- ❌ `package.json` - Nécessaire pour les dépendances

### Modèles à Adapter (TODO)

Ces modèles utilisent encore MongoDB et doivent être adaptés :

1. **`models/Publication.js`** - Publications sociales
2. **`models/SocialAccount.js`** - Comptes sociaux
3. **`models/Usage.js`** - Statistiques d'utilisation

Pour l'instant, vous pouvez :
- Les garder (ils ne seront pas utilisés)
- Les adapter plus tard en Sequelize

## 🎯 Checklist Avant Upload

- [ ] Script de nettoyage exécuté
- [ ] Fichiers AWS supprimés
- [ ] Anciens modèles MongoDB supprimés
- [ ] `.env` adapté pour O2Switch
- [ ] `server.js` utilise Sequelize
- [ ] Routes mises à jour
- [ ] Documentation à jour

## 📤 Prêt pour l'Upload

Une fois le nettoyage terminé :

1. ✅ Testez localement : `npm run dev`
2. ✅ Vérifiez que tout fonctionne
3. ✅ Uploadez via FTP (sauf `node_modules/` et fichiers dans `.o2switchignore`)
4. ✅ Configurez Node.js sur O2Switch
5. ✅ Installez les dépendances : `npm install --production`

## 💾 Sauvegarde

Avant de supprimer, faites une sauvegarde :

```bash
# Créer une archive du backend actuel
tar -czf backend-aws-backup.tar.gz backend/

# Ou sur Windows avec 7-Zip
7z a backend-aws-backup.7z backend/
```

## 📞 Support

En cas de doute :
- Consultez `README_MIGRATION.md`
- Exécutez le script de nettoyage automatique
- Gardez une sauvegarde de l'ancien backend
