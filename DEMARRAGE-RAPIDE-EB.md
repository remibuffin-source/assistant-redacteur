# ⚡ Démarrage Rapide - Elastic Beanstalk

## 🎯 Objectif

Déployer le backend de l'Assistant Rédactionnel sur AWS Elastic Beanstalk en **30 minutes**.

## ✅ Ce que vous obtiendrez

- ✅ Backend API accessible via URL publique
- ✅ Auto-scaling automatique
- ✅ Load Balancer intégré
- ✅ Monitoring CloudWatch
- ✅ Logs centralisés
- ✅ HTTPS (certificat SSL gratuit)

## 📋 Prérequis (10 min)

### 1. Compte AWS

- Créer un compte sur [aws.amazon.com](https://aws.amazon.com)
- **Gratuit 1 an** avec Free Tier

### 2. Installer AWS CLI

**Windows (PowerShell en admin)** :

```powershell
# Télécharger et installer
msiexec.exe /i https://awscli.amazonaws.com/AWSCLIV2.msi

# Vérifier
aws --version
```

### 3. Installer EB CLI

```powershell
pip install awsebcli --upgrade --user

# Vérifier
eb --version
```

### 4. Configurer AWS

```powershell
aws configure
```

Entrez vos informations :
- **Access Key ID** : (obtenir dans AWS Console → IAM → Users → Security credentials)
- **Secret Access Key** : (même endroit)
- **Region** : `eu-west-1` (Paris)
- **Output** : `json`

## 🚀 Déploiement (15 min)

### Étape 1 : Aller dans le dossier backend

```powershell
cd k:\developpement_app_site_web\assistant_redactionnel\assistant_redacteur\backend
```

### Étape 2 : Initialiser Elastic Beanstalk

```powershell
eb init
```

**Répondez** :
- Application name : `assistant-redactionnel`
- Platform : `Docker`
- Region : `eu-west-1`
- SSH keypair : Appuyez sur **Entrée** (optionnel)

### Étape 3 : Créer l'environnement

```powershell
eb create assistant-redactionnel-prod --instance-type t3.small
```

⏱️ **Attendez 10-15 minutes** (création automatique de l'infrastructure)

### Étape 4 : Configurer les variables d'environnement

```powershell
eb setenv NODE_ENV=production PORT=4000
```

**Ajoutez vos clés API** :

```powershell
eb setenv SMTP_HOST=smtp.gmail.com SMTP_PORT=587 SMTP_USER=votre-email@gmail.com SMTP_PASS=votre-mot-de-passe-app
```

```powershell
eb setenv STRIPE_SECRET_KEY=sk_live_... STRIPE_WEBHOOK_SECRET=whsec_...
```

```powershell
eb setenv DEEPL_API_KEY=votre-cle OPENAI_API_KEY=sk-...
```

### Étape 5 : Obtenir l'URL du backend

```powershell
eb status
```

Vous obtiendrez une URL comme :
```
http://assistant-redactionnel-prod.eu-west-1.elasticbeanstalk.com
```

### Étape 6 : Tester le backend

```powershell
curl http://assistant-redactionnel-prod.eu-west-1.elasticbeanstalk.com/health
```

Devrait retourner : `{"status":"ok"}`

## 🔗 Connecter le frontend

### Dans AWS Amplify Console

1. Allez dans **Amplify Console**
2. Sélectionnez votre app frontend
3. **Environment variables** → Ajouter :

```
VITE_BACKEND_URL=http://assistant-redactionnel-prod.eu-west-1.elasticbeanstalk.com
```

4. **Redéployer** le frontend

## ✅ Vérification

Testez ces endpoints :

```powershell
# Health check
curl http://votre-url.elasticbeanstalk.com/health

# API auth
curl http://votre-url.elasticbeanstalk.com/api/auth/status
```

## 📊 Commandes utiles

### Voir les logs

```powershell
eb logs
```

### Voir les logs en temps réel

```powershell
eb logs --stream
```

### Déployer une mise à jour

```powershell
eb deploy
```

### Ouvrir l'app dans le navigateur

```powershell
eb open
```

### Voir le statut

```powershell
eb status
```

### SSH dans le serveur (si configuré)

```powershell
eb ssh
```

## 🔧 Dépannage

### Problème : Build échoue

```powershell
eb logs --all
```

Cherchez les erreurs dans les logs.

### Problème : Health check échoue

Vérifiez que votre `server.js` a un endpoint `/health` :

```javascript
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});
```

### Problème : Variables d'env non prises en compte

```powershell
# Lister les variables
eb printenv

# Redéployer après modification
eb deploy
```

## 💰 Coûts

| Ressource | Coût mensuel |
|-----------|--------------|
| Instance t3.small | ~$15 |
| Load Balancer | ~$16 |
| Stockage | ~$2 |
| Transfert | ~$9 |
| **TOTAL** | **~$42/mois** |

**Gratuit 1 an** avec AWS Free Tier !

## 🎯 Prochaines étapes

- [ ] Configurer un domaine personnalisé
- [ ] Activer HTTPS (certificat SSL gratuit)
- [ ] Configurer l'auto-scaling
- [ ] Activer CloudWatch Alarms
- [ ] Configurer les backups

## 📚 Ressources

- [Documentation EB](https://docs.aws.amazon.com/elasticbeanstalk/)
- [AWS Free Tier](https://aws.amazon.com/free/)
- [Guide complet](./DEPLOIEMENT-ELASTIC-BEANSTALK.md)
- [Déployer d'autres sites](./DEPLOIEMENT-AUTRES-SITES.md)

---

**Besoin d'aide ?** Consultez le guide complet ou demandez-moi ! 🚀
