# Migration des Routes MongoDB → MySQL/Sequelize

## 📋 État de la Migration

### ✅ Routes Adaptées

1. **`pricing.js`** - Configuration des prix
   - Import mis à jour vers Sequelize
   - Aucune autre modification nécessaire (API compatible)

2. **`apiKeys.js`** - Gestion des clés API
   - Import mis à jour vers Sequelize
   - Requête de statut adaptée (`.find()` → `.findAll()`)

3. **`credits.sequelize.js`** - Gestion des crédits (NOUVEAU)
   - Version complète adaptée pour Sequelize
   - Toutes les routes migrées
   - Agrégations SQL natives

### 🔄 Routes à Adapter

1. **`auth.js`** - Authentification (non implémenté)
2. **`users.js`** - Gestion utilisateurs (non implémenté)
3. **`publications.js`** - Publications (à adapter)
4. **`oauth.js`** - OAuth social (à adapter)
5. **`analytics.js`** - Statistiques (à adapter)

## 🔧 Comment Basculer vers les Nouvelles Routes

### Option 1 : Remplacement Progressif (Recommandé)

Remplacez les routes une par une dans `server.js` :

```javascript
// Dans server.js

// Anciennes routes (MongoDB)
// import creditsRoutes from './routes/credits.js';

// Nouvelles routes (Sequelize)
import creditsRoutes from './routes/credits.sequelize.js';

// Utilisation
app.use('/api/credits', creditsRoutes);
```

### Option 2 : Basculement Complet

1. Renommez les anciens fichiers :
   ```bash
   mv routes/credits.js routes/credits.mongoose.js
   mv routes/credits.sequelize.js routes/credits.js
   ```

2. Pas besoin de modifier `server.js`

## 📝 Différences Clés MongoDB vs Sequelize

### Recherche d'Utilisateurs

**MongoDB (Mongoose)** :
```javascript
const user = await User.findOne({ 
  $or: [{ _id: userId }, { email: userId }] 
});
```

**MySQL (Sequelize)** :
```javascript
const user = await User.findOne({ 
  where: {
    [Op.or]: [
      { id: userId },
      { email: userId }
    ]
  }
});
```

### Sélection de Champs

**MongoDB** :
```javascript
.select('credits.balance credits.totalPurchased')
```

**Sequelize** :
```javascript
{
  attributes: ['creditsBalance', 'creditsTotalPurchased']
}
```

### Agrégations

**MongoDB** :
```javascript
await User.aggregate([
  {
    $group: {
      _id: null,
      totalBalance: { $sum: '$credits.balance' }
    }
  }
]);
```

**Sequelize** :
```javascript
await User.findOne({
  attributes: [
    [sequelize.fn('SUM', sequelize.col('creditsBalance')), 'totalBalance']
  ],
  raw: true
});
```

### Comptage avec Condition

**MongoDB** :
```javascript
await User.countDocuments({ 'credits.balance': { $gt: 0 } });
```

**Sequelize** :
```javascript
await User.count({ 
  where: { creditsBalance: { [Op.gt]: 0 } }
});
```

### Tri et Limite

**MongoDB** :
```javascript
await User.find()
  .sort({ 'credits.totalUsed': -1 })
  .limit(100);
```

**Sequelize** :
```javascript
await User.findAll({
  order: [['creditsTotalUsed', 'DESC']],
  limit: 100
});
```

## 🚀 Prochaines Étapes

### 1. Tester les Routes Migrées

```bash
# Démarrer le serveur
npm run dev

# Tester les endpoints
curl http://localhost:4000/api/credits/balance \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 2. Adapter les Routes Restantes

Suivez le même pattern pour :
- `publications.js`
- `oauth.js`
- `analytics.js`

### 3. Créer les Routes d'Authentification

Implémentez `auth.js` et `users.js` avec Sequelize.

## 📚 Ressources

- [Documentation Sequelize](https://sequelize.org/docs/v6/)
- [Opérateurs Sequelize](https://sequelize.org/docs/v6/core-concepts/model-querying-basics/#operators)
- [Agrégations Sequelize](https://sequelize.org/docs/v6/core-concepts/model-querying-basics/#aggregation)

## ⚠️ Points d'Attention

1. **IDs** : MongoDB utilise `_id`, MySQL utilise `id`
2. **Objets imbriqués** : MongoDB supporte nativement, MySQL nécessite des colonnes séparées ou JSON
3. **Arrays** : MongoDB supporte nativement, MySQL nécessite des tables séparées ou JSON
4. **Transactions** : Sequelize supporte les transactions SQL natives

## 🧪 Tests

Avant de déployer en production :

1. Testez toutes les routes migrées
2. Vérifiez les performances des requêtes
3. Testez les cas limites (utilisateur inexistant, etc.)
4. Vérifiez les logs d'erreurs

## 📞 Support

En cas de problème :
- Consultez les logs : `logger.error()`
- Vérifiez la connexion MySQL
- Testez les requêtes SQL directement dans phpMyAdmin
