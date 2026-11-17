# Guide de Test de la Migration MySQL

## 🧪 Tests Automatisés

### Prérequis

1. **MySQL installé localement**
   - Windows : [MySQL Installer](https://dev.mysql.com/downloads/installer/)
   - Ou utilisez XAMPP/WAMP qui inclut MySQL

2. **Base de données de test créée**
   ```sql
   CREATE DATABASE assistant_redacteur_test CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```

3. **Variables d'environnement configurées**
   ```bash
   cp .env.test.example .env
   # Éditez .env avec vos identifiants MySQL locaux
   ```

### Exécuter les Tests

```bash
# Installer les dépendances si nécessaire
npm install

# Exécuter le script de test
node scripts/testMigration.js
```

### Ce que le Script Teste

Le script `testMigration.js` effectue 15 tests complets :

1. ✅ **Connexion MySQL** - Vérifie la connexion à la base de données
2. ✅ **Création des tables** - Initialise toutes les tables Sequelize
3. ✅ **Vérification des tables** - Liste les tables créées
4. ✅ **Création d'utilisateur** - Crée un utilisateur de test
5. ✅ **Récupération d'utilisateur** - Recherche par email
6. ✅ **Ajout de crédits** - Teste la méthode `addCredits()`
7. ✅ **Historique des crédits** - Vérifie la table `credit_history`
8. ✅ **Création de clé API** - Teste le chiffrement
9. ✅ **Récupération de clé API** - Teste le déchiffrement
10. ✅ **Configuration de prix** - Teste le singleton
11. ✅ **Mise à jour config** - Teste `updateConfig()`
12. ✅ **Statistiques** - Teste les agrégations
13. ✅ **Déduction de crédits** - Teste `deductCredits()`
14. ✅ **Relations** - Teste les associations Sequelize
15. ✅ **Nettoyage** - Supprime les données de test

### Résultat Attendu

```
============================================================
🧪 TEST DE MIGRATION MYSQL/SEQUELIZE
============================================================

ℹ️  Test 1: Connexion à MySQL...
✅ Connexion MySQL établie
ℹ️  Test 2: Création des tables...
✅ Tables créées avec succès
ℹ️  Test 3: Vérification des tables...
✅ Tables trouvées: users, api_keys, pricing_config, credit_history
...
============================================================
✅ TOUS LES TESTS SONT PASSÉS AVEC SUCCÈS !
============================================================
```

## 🔍 Tests Manuels

### 1. Tester la Connexion MySQL

```bash
node -e "import('./config/sequelize.js').then(m => m.connectDB())"
```

### 2. Créer les Tables

```bash
node -e "import('./models/index.sequelize.js').then(m => m.initDatabase())"
```

### 3. Tester une Route

```bash
# Démarrer le serveur
npm run dev

# Dans un autre terminal, tester l'API
curl http://localhost:4000/health
curl http://localhost:4000/api/pricing/config
```

## 🐛 Dépannage

### Erreur : "Access denied for user"

**Solution** : Vérifiez vos identifiants MySQL dans `.env`

```env
MYSQL_USER=root
MYSQL_PASSWORD=votre_mot_de_passe
```

### Erreur : "Unknown database"

**Solution** : Créez la base de données

```sql
CREATE DATABASE assistant_redacteur_test;
```

### Erreur : "Table doesn't exist"

**Solution** : Exécutez l'initialisation des tables

```bash
node -e "import('./models/index.sequelize.js').then(m => m.initDatabase())"
```

### Erreur : "Cannot find module"

**Solution** : Installez les dépendances

```bash
npm install sequelize mysql2
```

## 📊 Vérifier les Données dans MySQL

### Via Ligne de Commande

```bash
mysql -u root -p

USE assistant_redacteur_test;
SHOW TABLES;
SELECT * FROM users;
SELECT * FROM credit_history;
```

### Via phpMyAdmin

1. Ouvrez phpMyAdmin (généralement `http://localhost/phpmyadmin`)
2. Sélectionnez la base `assistant_redacteur_test`
3. Explorez les tables créées

## 🚀 Tests de Performance

### Test de Charge Basique

```bash
# Installer Apache Bench (si nécessaire)
# Windows: Inclus avec XAMPP
# Linux: sudo apt-get install apache2-utils

# Tester 100 requêtes
ab -n 100 -c 10 http://localhost:4000/health
```

### Test des Routes API

```bash
# Tester la route pricing
ab -n 50 -c 5 http://localhost:4000/api/pricing/config
```

## ✅ Checklist Avant Déploiement

Avant de déployer sur O2Switch, vérifiez :

- [ ] Tous les tests automatisés passent
- [ ] Les tables sont créées correctement
- [ ] Les clés API sont chiffrées/déchiffrées
- [ ] L'historique des crédits fonctionne
- [ ] Les relations entre tables fonctionnent
- [ ] Les agrégations SQL fonctionnent
- [ ] Pas d'erreurs dans les logs
- [ ] Le serveur démarre sans erreur

## 📝 Logs de Test

Les logs sont affichés dans la console avec des couleurs :

- 🟢 **Vert** : Succès
- 🔴 **Rouge** : Erreur
- 🟡 **Jaune** : Avertissement
- 🔵 **Bleu** : Information

## 🔄 Nettoyer Après les Tests

```bash
# Supprimer la base de test
mysql -u root -p -e "DROP DATABASE assistant_redacteur_test;"

# Recréer pour de nouveaux tests
mysql -u root -p -e "CREATE DATABASE assistant_redacteur_test CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

## 📞 Support

Si vous rencontrez des problèmes :

1. Vérifiez les logs du script de test
2. Consultez `ROUTES_MIGRATION.md` pour les différences MongoDB/Sequelize
3. Vérifiez que MySQL est démarré
4. Vérifiez les permissions de la base de données

## 🎯 Prochaines Étapes

Une fois tous les tests passés :

1. Configurez O2Switch (voir `DEPLOIEMENT_O2SWITCH.md`)
2. Créez la base de données MySQL sur O2Switch
3. Déployez l'application
4. Exécutez les tests sur l'environnement de production
