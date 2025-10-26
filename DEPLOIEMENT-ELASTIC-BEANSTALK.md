# 🚀 Déploiement Backend sur AWS Elastic Beanstalk

## 📋 Architecture SIMPLIFIÉE

Cette configuration déploie **1 backend Node.js** qui contient tous les services :

1. **Backend API** (Port 4000) - Express.js avec tous les services intégrés :
   - ✅ Authentification (`/api/auth`)
   - ✅ Envoi d'emails (`/api/email`)
   - ✅ Paiements Stripe (intégré dans les routes)
   - ✅ Publications (`/api/publications`)
   - ✅ Analytics (`/api/analytics`)
   - ✅ OAuth (`/api/oauth`)

**Elastic Beanstalk gère automatiquement** :
- ✅ Création de l'infrastructure (vous ne touchez PAS à EC2)
- ✅ Load Balancer
- ✅ Auto-scaling
- ✅ Monitoring
- ✅ Logs CloudWatch
- ✅ Certificats SSL

## 💰 Coûts estimés

| Ressource | Type | Coût mensuel |
|-----------|------|--------------|
| Instance EC2 | t3.small | ~$15 |
| Load Balancer | Application LB | ~$16 |
| Stockage EBS | 20 GB | ~$2 |
| Transfert données | 100 GB | ~$9 |
| **TOTAL** | | **~$42/mois** |

**Gratuit la 1ère année** avec AWS Free Tier (t3.micro) !

## 🛠️ Prérequis

### 1. Installer AWS CLI

```powershell
# Télécharger et installer AWS CLI v2
# https://aws.amazon.com/cli/

# Vérifier l'installation
aws --version
```

### 2. Installer EB CLI

```powershell
pip install awsebcli --upgrade --user

# Vérifier l'installation
eb --version
```

### 3. Configurer AWS Credentials

```powershell
aws configure
```

Entrez :
- **Access Key ID** : Votre clé AWS
- **Secret Access Key** : Votre clé secrète
- **Region** : `eu-west-1` (Paris) ou `us-east-1` (Virginie)
- **Output format** : `json`

## 📦 Préparation du projet

### 1. Structure des dossiers

```
assistant_redacteur/
└── backend/                    # Backend API avec TOUS les services
    ├── package.json
    ├── server.js
    ├── Dockerfile              # Configuration Docker
    ├── .ebignore               # Fichiers à ignorer
    ├── routes/                 # Toutes les routes API
    │   ├── auth.js
    │   ├── email.js
    │   ├── publications.js
    │   └── ...
    ├── services/               # Services (email, etc.)
    └── .elasticbeanstalk/      # Config EB (créé auto)
        └── config.yml
```

### 2. Vérifier le Dockerfile

Votre `backend/Dockerfile` existe déjà ! Vérifions qu'il est correct :

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 4000

CMD ["npm", "start"]
```

✅ **Parfait ! Rien à modifier.**

## 🚀 Déploiement

### Étape 1 : Initialiser Elastic Beanstalk

```powershell
# Se placer dans le dossier backend
cd k:\developpement_app_site_web\assistant_redactionnel\assistant_redacteur\backend

# Initialiser EB
eb init

# Répondre aux questions :
# - Application name: assistant-redactionnel
# - Platform: Docker running on 64bit Amazon Linux 2023
# - Region: eu-west-1 (Paris)
# - SSH keypair: (optionnel, appuyez sur Entrée pour ignorer)
```

### Étape 2 : Créer l'environnement

```powershell
# Créer l'environnement de production
eb create assistant-redactionnel-prod --instance-type t3.small

# Attendre 10-15 minutes (création de l'infra)
```

### Étape 3 : Configurer les variables d'environnement

```powershell
# Variables pour le backend
eb setenv \
  NODE_ENV=production \
  SMTP_HOST=smtp.gmail.com \
  SMTP_PORT=587 \
  SMTP_USER=votre-email@gmail.com \
  SMTP_PASS=votre-mot-de-passe-app \
  STRIPE_SECRET_KEY=sk_live_... \
  STRIPE_WEBHOOK_SECRET=whsec_... \
  DEEPL_API_KEY=votre-cle-deepl \
  OPENAI_API_KEY=sk-...
```

### Étape 4 : Déployer

```powershell
# Déployer l'application
eb deploy

# Attendre 5-10 minutes
```

### Étape 5 : Vérifier le déploiement

```powershell
# Ouvrir l'application dans le navigateur
eb open

# Voir les logs
eb logs

# Voir le statut
eb status
```

## 🔧 Configuration post-déploiement

### 1. Obtenir l'URL du backend

```powershell
eb status
```

Vous obtiendrez une URL comme :
```
http://assistant-redactionnel-prod.eu-west-1.elasticbeanstalk.com
```

### 2. Mettre à jour Amplify

Dans AWS Amplify Console → Variables d'environnement :

```
VITE_BACKEND_URL=http://assistant-redactionnel-prod.eu-west-1.elasticbeanstalk.com
```

### 3. Configurer un domaine personnalisé (optionnel)

```powershell
# Dans la console AWS EB
# Settings → Load balancer → Add listener
# Ajouter un certificat SSL (AWS Certificate Manager)
```

## 📊 Monitoring et gestion

### Voir les logs en temps réel

```powershell
eb logs --stream
```

### Scaler l'application

```powershell
# Augmenter le nombre d'instances
eb scale 3

# Revenir à 1 instance
eb scale 1
```

### Mettre à jour l'application

```powershell
# Après modification du code
git add .
git commit -m "Update backend"
eb deploy
```

### Arrêter l'environnement (économiser)

```powershell
# Arrêter temporairement (pas de frais d'instance)
eb terminate assistant-redactionnel-prod

# Recréer quand nécessaire
eb create assistant-redactionnel-prod
```

## 🔍 Dépannage

### Problème : Build échoue

```powershell
# Voir les logs détaillés
eb logs --all

# Vérifier la configuration
eb config
```

### Problème : Conteneurs ne démarrent pas

```powershell
# SSH dans l'instance
eb ssh

# Voir les conteneurs Docker
sudo docker ps -a

# Voir les logs d'un conteneur
sudo docker logs <container-id>
```

### Problème : Health check échoue

Vérifier que `/health` retourne 200 :
```bash
curl http://localhost/health
```

## 💡 Optimisations

### 1. Activer le cache CloudFront

Dans AWS Console → CloudFront → Create distribution

### 2. Activer l'auto-scaling

```yaml
# .ebextensions/02-autoscaling.config
option_settings:
  aws:autoscaling:asg:
    MinSize: 1
    MaxSize: 4
  aws:autoscaling:trigger:
    MeasureName: CPUUtilization
    Statistic: Average
    Unit: Percent
    UpperThreshold: 70
    LowerThreshold: 20
```

### 3. Activer les logs CloudWatch

Déjà configuré dans `01-environment.config` !

## 📈 Évolution future

### Ajouter un nouveau service

1. Créer le dossier du service
2. Ajouter un conteneur dans `Dockerrun.aws.json`
3. Ajouter la route dans `nginx/default.conf`
4. Déployer : `eb deploy`

### Migrer vers Kubernetes (si >10 services)

Quand vous aurez beaucoup de services, migrez vers :
- **AWS EKS** (Kubernetes managé)
- **AWS ECS** (Container orchestration)

## ✅ Checklist de déploiement

- [ ] AWS CLI installé et configuré
- [ ] EB CLI installé
- [ ] Dockerfiles créés pour chaque service
- [ ] Variables d'environnement configurées
- [ ] `eb init` exécuté
- [ ] `eb create` exécuté
- [ ] Variables d'env définies avec `eb setenv`
- [ ] `eb deploy` exécuté
- [ ] URL backend mise à jour dans Amplify
- [ ] Tests de l'API backend
- [ ] Monitoring activé

## 🎯 Résultat final

Vous aurez :
- ✅ **1 instance EC2** qui héberge **4 services**
- ✅ **Auto-scaling** automatique
- ✅ **Load balancing** intégré
- ✅ **Monitoring** CloudWatch
- ✅ **Logs** centralisés
- ✅ **Déploiement** en 1 commande
- ✅ **Coût optimisé** (~$42/mois ou gratuit 1 an)

---

**Besoin d'aide ?** Consultez la documentation AWS :
- https://docs.aws.amazon.com/elasticbeanstalk/
- https://docs.aws.amazon.com/AmazonECS/latest/developerguide/docker-basics.html
