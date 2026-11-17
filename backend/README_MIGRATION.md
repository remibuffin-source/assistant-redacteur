# Migration MongoDB → MySQL/Sequelize - Guide Rapide

## ✅ Ce qui a été fait

### 1. Configuration
- ✅ Sequelize et MySQL2 installés
- ✅ Configuration MySQL (`config/sequelize.js`)
- ✅ Service de cache en mémoire (`services/cacheService.js`)

### 2. Modèles Sequelize
- ✅ `User.sequelize.js` - Utilisateurs avec crédits
- ✅ `ApiKey.sequelize.js` - Clés API chiffrées
- ✅ `PricingConfig.sequelize.js` - Configuration des prix
- ✅ `CreditHistory.sequelize.js` - Historique des crédits
- ✅ `index.sequelize.js` - Relations et exports

### 3. Routes Adaptées
- ✅ `pricing.js` - Mis à jour pour Sequelize
- ✅ `apiKeys.js` - Mis à jour pour Sequelize
- ✅ `credits.sequelize.js` - Version complète Sequelize

### 4. Server.js
- ✅ Import Sequelize au lieu de MongoDB
- ✅ Initialisation automatique des tables en dev
- ✅ Gestion d'erreur améliorée

### 5. Scripts et Tests
- ✅ `testMigration.js` - 15 tests automatisés
- ✅ `migrateToMySQL.js` - Migration depuis MongoDB
- ✅ Scripts npm ajoutés

### 6. Documentation
- ✅ `DEPLOIEMENT_O2SWITCH.md` - Guide de déploiement
- ✅ `MIGRATION_MYSQL.md` - Vue d'ensemble de la migration
- ✅ `ROUTES_MIGRATION.md` - Guide des routes
- ✅ `TESTS.md` - Guide de test
- ✅ `.env.o2switch.example` - Variables d'environnement
- ✅ `.env.test.example` - Variables de test

## 🚀 Démarrage Rapide

### Installation

```bash
cd backend
npm install
```

### Configuration

```bash
# Copier le fichier d'exemple
cp .env.test.example .env

# Éditer avec vos identifiants MySQL
# MYSQL_HOST=localhost
# MYSQL_DATABASE=assistant_redacteur_test
# MYSQL_USER=root
# MYSQL_PASSWORD=votre_mot_de_passe
```

### Créer la Base de Données

```sql
CREATE DATABASE assistant_redacteur_test CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### Initialiser les Tables

```bash
npm run db:init
```

### Tester la Migration

```bash
npm run test:migration
```

### Démarrer le Serveur

```bash
npm run dev
```

## 📋 Scripts NPM Disponibles

| Script | Description |
|--------|-------------|
| `npm start` | Démarrer en production |
| `npm run dev` | Démarrer en développement (nodemon) |
| `npm run test:migration` | Exécuter les tests de migration |
| `npm run db:init` | Créer les tables MySQL |
| `npm run db:migrate` | Migrer depuis MongoDB (si données existantes) |

## 🔧 Configuration O2Switch

### Variables d'Environnement Requises

```env
NODE_ENV=production
PORT=4000

# MySQL
MYSQL_HOST=localhost
MYSQL_DATABASE=bure7653_assistant
MYSQL_USER=bure7653
MYSQL_PASSWORD=votre_mot_de_passe

# JWT
JWT_SECRET=votre_secret_unique
JWT_REFRESH_SECRET=votre_refresh_secret

# Encryption
ENCRYPTION_KEY=votre-cle-32-caracteres-minimum!!

# Frontend
FRONTEND_URL=https://assistant-redacteur.fr
```

### Node.js Version

**Recommandé** : Node.js 20.19.4 (LTS)

## 📊 Structure des Tables MySQL

### users
- Informations utilisateur
- Crédits (balance, totalPurchased, totalUsed)
- Préférences (theme, language, notifications)
- OAuth (Google, Facebook, Twitter, LinkedIn)
- Statistiques (publications)

### api_keys
- Clés API chiffrées
- Service (openai, anthropic, etc.)
- Métadonnées (prefix, provider)

### credit_history
- Historique des transactions
- Type (purchase, usage, refund, bonus)
- Montant et solde après

### pricing_config
- Configuration singleton
- Marge bénéficiaire
- Coûts des services
- Offres de recharge

## 🧪 Tests

### Tests Automatisés

```bash
npm run test:migration
```

Exécute 15 tests :
1. Connexion MySQL
2. Création des tables
3. CRUD utilisateurs
4. Gestion des crédits
5. Chiffrement des clés API
6. Configuration des prix
7. Relations entre tables
8. Agrégations SQL

### Tests Manuels

```bash
# Health check
curl http://localhost:4000/health

# Configuration pricing
curl http://localhost:4000/api/pricing/config

# Offres de recharge
curl http://localhost:4000/api/pricing/offers
```

## 📚 Documentation

- **`DEPLOIEMENT_O2SWITCH.md`** - Guide complet de déploiement
- **`MIGRATION_MYSQL.md`** - Vue d'ensemble de la migration
- **`ROUTES_MIGRATION.md`** - Adaptation des routes
- **`TESTS.md`** - Guide de test détaillé

## 🔄 Différences MongoDB vs Sequelize

### Recherche

```javascript
// MongoDB
await User.findOne({ email: 'test@example.com' });

// Sequelize
await User.findOne({ where: { email: 'test@example.com' } });
```

### Sélection de Champs

```javascript
// MongoDB
.select('name email credits.balance')

// Sequelize
{ attributes: ['name', 'email', 'creditsBalance'] }
```

### Tri et Limite

```javascript
// MongoDB
.sort({ createdAt: -1 }).limit(10)

// Sequelize
{ order: [['createdAt', 'DESC']], limit: 10 }
```

## ⚠️ Points d'Attention

1. **IDs** : MongoDB `_id` → MySQL `id`
2. **Objets imbriqués** : Colonnes séparées (ex: `credits.balance` → `creditsBalance`)
3. **Arrays** : Tables séparées ou JSON
4. **Timestamps** : Automatiques avec Sequelize

## 🎯 Prochaines Étapes

1. ✅ Tester localement avec MySQL
2. ⏳ Créer la base MySQL sur O2Switch
3. ⏳ Déployer sur O2Switch
4. ⏳ Migrer les données (si nécessaire)
5. ⏳ Tester en production

## 📞 Support

En cas de problème :
- Consultez `TESTS.md` pour le dépannage
- Vérifiez les logs : `logger.error()`
- Testez la connexion MySQL
- Vérifiez les variables d'environnement

## 💰 Économies

| Avant (AWS) | Après (O2Switch) | Économie |
|-------------|------------------|----------|
| 42$/mois | 6€/mois | ~85% |

---

**Version** : 1.0.0  
**Node.js** : 20.19.4 (LTS)  
**Sequelize** : 6.37.7  
**MySQL** : 8.0+
