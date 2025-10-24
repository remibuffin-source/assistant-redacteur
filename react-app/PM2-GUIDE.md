# 🚀 Guide PM2 - Assistant Rédacteur

## 📋 **Pourquoi PM2 ?**

PM2 résout les problèmes de stabilité que vous rencontrez :
- **Auto-restart** : Redémarre automatiquement en cas de crash
- **Monitoring** : Surveillance en temps réel des performances
- **Logs centralisés** : Tous les logs dans un seul endroit
- **Gestion des processus** : Démarrage/arrêt/redémarrage simplifiés
- **Séparation dev/prod** : Configurations distinctes selon l'environnement

## 🛠️ **Installation**

```bash
# Installation globale (déjà fait)
npm install -g pm2
```

## 🔧 **Commandes rapides**

### **Développement**
```bash
# Démarrer le serveur de développement
npm run pm2:dev

# Arrêter
npm run pm2:dev:stop

# Redémarrer
npm run pm2:dev:restart

# Voir les logs
npm run pm2:dev:logs
```

### **Production**
```bash
# Build et démarrer en production
npm run pm2:prod

# Arrêter
npm run pm2:prod:stop

# Redémarrer
npm run pm2:prod:restart

# Voir les logs
npm run pm2:prod:logs
```

### **Monitoring**
```bash
# Status de tous les processus
npm run pm2:status

# Interface de monitoring
npm run pm2:monitor

# Aide complète
npm run pm2:help
```

## 📁 **Fichiers de configuration**

### **pm2.dev.config.js** - Développement
- **NODE_ENV** : `development`
- **Port** : 5173 (Vite par défaut)
- **Instances** : 1 seule instance
- **Watch** : Désactivé (Vite gère le hot reload)
- **Logs** : Verbeux pour debugging
- **Memory limit** : 1GB

### **pm2.prod.config.js** - Production
- **NODE_ENV** : `production`
- **Port** : 4173 (Vite preview)
- **Instances** : `max` (utilise tous les CPU)
- **Exec mode** : `cluster` pour performance
- **Logs** : Optimisés, rotation automatique
- **Memory limit** : 500MB
- **Cron restart** : Redémarrage quotidien à 2h

## 📊 **Monitoring et logs**

### **Localisation des logs**
```
react-app/logs/
├── pm2-dev-error.log      # Erreurs développement
├── pm2-dev-out.log        # Sortie développement
├── pm2-dev-combined.log   # Logs combinés développement
├── pm2-prod-error.log     # Erreurs production
├── pm2-prod-out.log       # Sortie production
└── pm2-prod-combined.log  # Logs combinés production
```

### **Commandes de monitoring**
```bash
# Status détaillé
pm2 status

# Logs en temps réel
pm2 logs assistant-redacteur-dev

# Monitoring interactif
pm2 monit

# Informations système
pm2 info assistant-redacteur-dev
```

## 🔄 **Workflow recommandé**

### **Pour le développement quotidien**
1. **Démarrage** : `npm run pm2:dev`
2. **Développement** : Le serveur reste stable, redémarre automatiquement si crash
3. **Logs** : `npm run pm2:dev:logs` pour voir les erreurs
4. **Arrêt** : `npm run pm2:dev:stop` en fin de journée

### **Pour les tests de production**
1. **Build et démarrage** : `npm run pm2:prod`
2. **Test** : Application accessible sur port 4173
3. **Monitoring** : `npm run pm2:monitor`
4. **Arrêt** : `npm run pm2:prod:stop`

## 🚨 **Résolution de problèmes**

### **Le serveur ne démarre pas**
```bash
# Vérifier le status
npm run pm2:status

# Voir les erreurs
npm run pm2:dev:logs

# Redémarrer proprement
npm run pm2:dev:stop
npm run pm2:dev
```

### **Processus zombie**
```bash
# Lister tous les processus
pm2 list

# Supprimer tous les processus
pm2 delete all

# Redémarrer proprement
npm run pm2:dev
```

### **Problèmes de mémoire**
```bash
# Voir l'utilisation mémoire
pm2 monit

# Redémarrer si nécessaire
npm run pm2:dev:restart
```

## 🔐 **Variables d'environnement**

### **Développement**
- `NODE_ENV=development`
- `VITE_DEBUG=true`
- `VITE_LOG_LEVEL=debug`
- `PORT=5173`

### **Production**
- `NODE_ENV=production`
- `VITE_DEBUG=false`
- `VITE_LOG_LEVEL=error`
- `PORT=4173`

## 💡 **Avantages PM2 vs npm run dev**

| Aspect | npm run dev | PM2 |
|--------|-------------|-----|
| **Stabilité** | ❌ Crash = arrêt total | ✅ Auto-restart |
| **Logs** | ❌ Console uniquement | ✅ Fichiers persistants |
| **Monitoring** | ❌ Aucun | ✅ Interface complète |
| **Production** | ❌ Non adapté | ✅ Cluster mode |
| **Gestion** | ❌ Manuelle | ✅ Automatisée |

## 🎯 **Commandes essentielles à retenir**

```bash
# Démarrage quotidien
npm run pm2:dev

# Vérification status
npm run pm2:status

# Voir les logs
npm run pm2:dev:logs

# Redémarrage si problème
npm run pm2:dev:restart

# Arrêt propre
npm run pm2:dev:stop
```

---

**🎉 Avec PM2, fini les problèmes de serveur qui plante ! Développement stable et serein garanti !**
