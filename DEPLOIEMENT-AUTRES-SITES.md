# 🌐 Déployer d'autres sites sur Elastic Beanstalk

## 🎯 Stratégie : 1 environnement EB par site

Chaque site/application a son **propre environnement Elastic Beanstalk** :

```
AWS Account
├── Application: assistant-redactionnel
│   └── Environment: assistant-redactionnel-prod (Backend API)
│
├── Application: mon-site-vitrine
│   └── Environment: mon-site-vitrine-prod (Site statique)
│
├── Application: mon-blog
│   └── Environment: mon-blog-prod (WordPress/Node.js)
│
└── Application: mon-autre-app
    └── Environment: mon-autre-app-prod (Autre backend)
```

## 💰 Coûts par site

| Configuration | Coût mensuel | Quand l'utiliser |
|---------------|--------------|------------------|
| **t3.micro** (1 vCPU, 1 GB RAM) | ~$8 | Sites à faible trafic |
| **t3.small** (2 vCPU, 2 GB RAM) | ~$15 | Sites moyens (votre cas) |
| **t3.medium** (2 vCPU, 4 GB RAM) | ~$30 | Sites à fort trafic |

**+ Load Balancer** : ~$16/mois (partagé entre tous les sites)

## 🚀 Déployer un nouveau site (exemple : site vitrine)

### 1. Créer le dossier du site

```powershell
cd k:\developpement_app_site_web
mkdir mon-site-vitrine
cd mon-site-vitrine
```

### 2. Créer le Dockerfile

**Pour un site statique (HTML/CSS/JS)** :

```dockerfile
FROM nginx:alpine

COPY . /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

**Pour un site Node.js** :

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
```

**Pour un site WordPress** :

```dockerfile
FROM wordpress:latest

# Configuration personnalisée si nécessaire
```

### 3. Initialiser Elastic Beanstalk

```powershell
eb init

# Répondre :
# - Application name: mon-site-vitrine
# - Platform: Docker
# - Region: eu-west-1
```

### 4. Créer l'environnement

```powershell
# Pour un petit site
eb create mon-site-vitrine-prod --instance-type t3.micro

# Pour un site moyen
eb create mon-site-vitrine-prod --instance-type t3.small
```

### 5. Déployer

```powershell
eb deploy
```

### 6. Obtenir l'URL

```powershell
eb open
```

## 🔗 Configurer un domaine personnalisé

### Option 1 : Via AWS Route 53 (recommandé)

1. Acheter un domaine sur Route 53 (~$12/an)
2. Dans EB Console → Configuration → Load balancer
3. Ajouter un listener HTTPS avec certificat SSL (gratuit via AWS Certificate Manager)
4. Dans Route 53, créer un enregistrement A pointant vers le Load Balancer

### Option 2 : Domaine externe (OVH, Gandi, etc.)

1. Obtenir l'URL du Load Balancer : `eb status`
2. Créer un CNAME chez votre registrar :
   ```
   www.monsite.com → mon-site-vitrine-prod.eu-west-1.elasticbeanstalk.com
   ```

## 📊 Gérer plusieurs sites efficacement

### Voir tous vos environnements

```powershell
eb list --all
```

### Basculer entre les sites

```powershell
# Aller dans le dossier du site
cd k:\developpement_app_site_web\mon-site-vitrine

# Utiliser l'environnement
eb use mon-site-vitrine-prod

# Voir les logs
eb logs

# Déployer
eb deploy
```

### Arrêter un site temporairement (économiser)

```powershell
eb terminate mon-site-vitrine-prod
```

### Redémarrer un site

```powershell
eb create mon-site-vitrine-prod --instance-type t3.micro
```

## 🎯 Exemples de configurations

### Site 1 : Assistant Rédactionnel (Backend API)

```
Application: assistant-redactionnel
Environment: assistant-redactionnel-prod
Instance: t3.small ($15/mois)
Platform: Docker (Node.js 20)
Port: 4000
```

### Site 2 : Site vitrine statique

```
Application: mon-site-vitrine
Environment: mon-site-vitrine-prod
Instance: t3.micro ($8/mois)
Platform: Docker (Nginx)
Port: 80
```

### Site 3 : Blog WordPress

```
Application: mon-blog
Environment: mon-blog-prod
Instance: t3.small ($15/mois)
Platform: Docker (WordPress + MySQL)
Port: 80
```

### Site 4 : Application React/Next.js

```
Application: mon-app-react
Environment: mon-app-react-prod
Instance: t3.small ($15/mois)
Platform: Docker (Node.js)
Port: 3000
```

## 💡 Optimisations multi-sites

### 1. Partager le Load Balancer

Tous les sites peuvent partager le **même Load Balancer** :
- Coût : $16/mois (au lieu de $16 × nombre de sites)
- Configuration : Utiliser des règles de routage basées sur le domaine

### 2. Utiliser CloudFront (CDN)

Pour les sites statiques :
- Cache global
- Réduction de la bande passante
- Amélioration des performances
- Coût : ~$1-5/mois

### 3. Auto-scaling intelligent

Configurez l'auto-scaling pour chaque site :

```yaml
# .ebextensions/autoscaling.config
option_settings:
  aws:autoscaling:asg:
    MinSize: 1
    MaxSize: 3
  aws:autoscaling:trigger:
    MeasureName: CPUUtilization
    UpperThreshold: 70
    LowerThreshold: 20
```

## 📈 Coûts totaux estimés

### Scénario 1 : 3 petits sites

```
Site 1 (Backend API): t3.small = $15
Site 2 (Vitrine):     t3.micro = $8
Site 3 (Blog):        t3.micro = $8
Load Balancer:                 = $16
────────────────────────────────────
TOTAL:                         = $47/mois
```

### Scénario 2 : 5 sites mixtes

```
Site 1 (Backend API): t3.small  = $15
Site 2 (Vitrine):     t3.micro  = $8
Site 3 (Blog):        t3.small  = $15
Site 4 (App React):   t3.small  = $15
Site 5 (Landing):     t3.micro  = $8
Load Balancer:                  = $16
────────────────────────────────────
TOTAL:                          = $77/mois
```

**Gratuit la 1ère année** avec AWS Free Tier (750h/mois de t3.micro) !

## ✅ Checklist pour chaque nouveau site

- [ ] Créer le dossier du projet
- [ ] Créer le Dockerfile adapté
- [ ] Tester localement : `docker build -t mon-site . && docker run -p 3000:3000 mon-site`
- [ ] Initialiser EB : `eb init`
- [ ] Créer l'environnement : `eb create`
- [ ] Configurer les variables d'env : `eb setenv KEY=value`
- [ ] Déployer : `eb deploy`
- [ ] Tester l'URL : `eb open`
- [ ] Configurer le domaine personnalisé
- [ ] Activer HTTPS (certificat SSL gratuit)
- [ ] Configurer le monitoring CloudWatch

## 🎓 Ressources

- [Documentation Elastic Beanstalk](https://docs.aws.amazon.com/elasticbeanstalk/)
- [Docker Hub](https://hub.docker.com/) (images Docker officielles)
- [AWS Free Tier](https://aws.amazon.com/free/) (détails de l'offre gratuite)

---

**Besoin d'aide pour déployer un site spécifique ?** Demandez-moi ! 🚀
