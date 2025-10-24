# 🚀 PM2 - Commandes Rapides Assistant Rédacteur

## ✅ **PM2 est maintenant fonctionnel !**

### 🎯 **Commandes essentielles pour le développement quotidien**

```bash
# 🚀 DÉMARRER le serveur de développement
npm run pm2:dev

# 📊 VÉRIFIER le status
npm run pm2:status

# 📋 VOIR les logs en temps réel
npm run pm2:dev:logs

# 🔄 REDÉMARRER si nécessaire
npm run pm2:dev:restart

# ⏹️ ARRÊTER le serveur
npm run pm2:dev:stop
```

### 🌐 **Accès à l'application**
- **URL locale** : http://localhost:3003/
- **URL réseau** : http://169.254.56.120:3003/

### 📈 **Monitoring avancé**
```bash
# Interface de monitoring interactive
npm run pm2:monitor

# Informations détaillées du processus
pm2 info assistant-redacteur-dev

# Logs avec plus de lignes
pm2 logs assistant-redacteur-dev --lines 50
```

### 🔧 **Résolution de problèmes**

#### **Si le serveur ne démarre pas**
```bash
# 1. Vérifier le status
npm run pm2:status

# 2. Voir les erreurs
npm run pm2:dev:logs

# 3. Redémarrer proprement
npm run pm2:dev:stop
npm run pm2:dev
```

#### **Si le port est occupé**
```bash
# Voir qui utilise le port 3003
netstat -ano | findstr :3003

# Tuer le processus (remplacer XXXX par le PID)
taskkill /PID XXXX /F

# Redémarrer PM2
npm run pm2:dev
```

#### **Nettoyage complet**
```bash
# Supprimer tous les processus PM2
pm2 delete all

# Redémarrer proprement
npm run pm2:dev
```

### 🎉 **Avantages obtenus avec PM2**

✅ **Stabilité** : Auto-restart en cas de crash  
✅ **Logs persistants** : Fichiers dans `/logs/`  
✅ **Monitoring** : Interface de surveillance  
✅ **Performance** : Gestion mémoire optimisée  
✅ **Simplicité** : Commandes npm intégrées  

### 📁 **Fichiers de logs**
```
react-app/logs/
├── pm2-dev-error.log      # Erreurs
├── pm2-dev-out.log        # Sortie normale
└── pm2-dev-combined.log   # Logs combinés
```

### 💡 **Workflow recommandé**

1. **Matin** : `npm run pm2:dev` (démarrage)
2. **Développement** : Le serveur reste stable toute la journée
3. **Vérification** : `npm run pm2:status` si besoin
4. **Soir** : `npm run pm2:dev:stop` (arrêt propre)

---

**🎯 PM2 est maintenant configuré et fonctionnel ! Fini les problèmes de serveur qui plante !**
