# 🚀 Instructions de Migration - Pricing Config

## 📋 Prérequis

1. **PostgreSQL installé** et en cours d'exécution
2. **Base de données créée** (par défaut: `assistant_redacteur`)
3. **Variables d'environnement configurées** dans `.env`

## 🔧 Configuration .env

Ajoute ces variables dans ton fichier `.env` :

```env
# PostgreSQL Configuration
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=assistant_redacteur
POSTGRES_USER=postgres
POSTGRES_PASSWORD=ton_mot_de_passe
```

## 📦 Installation des dépendances

```bash
cd backend
npm install pg
```

## ▶️ Exécuter la migration

```bash
npm run migrate
```

## ✅ Vérification

La migration va :
1. ✅ Créer la table `pricing_config`
2. ✅ Insérer la configuration par défaut
3. ✅ Créer les index et triggers
4. ✅ Afficher un résumé de la configuration

## 📊 Résultat attendu

```
🚀 Démarrage de la migration...

📄 Fichier SQL chargé: .../migrations/create_pricing_config_table.sql
📝 Exécution de la migration...

✅ Migration réussie !
✅ Table pricing_config créée avec succès
✅ Configuration par défaut insérée

✅ Vérification: Table pricing_config existe bien

📊 Configuration par défaut:
   - Marge bénéficiaire: 30%
   - Nombre de services AI: 4
   - Nombre d'offres: 4
   - Souscription mensuelle: 0€

🎉 Migration terminée avec succès !
```

## 🔄 Redémarrer le serveur

Après la migration, redémarre le backend :

```bash
npm run dev
```

## 🧪 Tester

1. Va dans `/admin-pricing`
2. Modifie une offre
3. Clique sur "Sauvegarder"
4. Vérifie que le message de succès s'affiche
5. Recharge la page → Les modifications doivent être conservées

## ❌ En cas d'erreur

### Erreur: "relation pricing_config already exists"
La table existe déjà. Tu peux :
- Supprimer la table : `DROP TABLE pricing_config CASCADE;`
- Ou ignorer l'erreur (la migration est déjà faite)

### Erreur: "password authentication failed"
Vérifie tes identifiants PostgreSQL dans `.env`

### Erreur: "database does not exist"
Crée la base de données :
```sql
CREATE DATABASE assistant_redacteur;
```
