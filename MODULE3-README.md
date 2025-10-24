# Assistant Rédacteur - Module 3: Automatisation et Diffusion API

## 🚀 Vue d'ensemble

Le **Module 3** transforme l'Assistant Rédacteur en une plateforme complète d'automatisation et de diffusion de contenu multiplateforme. Ce module ajoute :

- **Backend Node.js/Express** complet avec API REST
- **Système OAuth** pour l'authentification sociale
- **Publication automatique** sur les réseaux sociaux
- **Calendrier intégré** avec planification temporelle
- **Gestion des comptes sociaux** avec permissions granulaires

## 📋 Fonctionnalités principales

### 🔐 Authentification et Sécurité
- **OAuth 2.0** pour Google, Facebook, Twitter, LinkedIn
- **JWT Authentication** avec refresh tokens
- **Gestion des permissions** par plateforme
- **Sécurité renforcée** avec rate limiting et validation

### 📅 Automatisation et Planification
- **Scheduler intelligent** avec cron jobs
- **Publication temps réel** selon le calendrier
- **Gestion des files d'attente** avec Redis
- **Retry automatique** en cas d'échec

### 🌐 Multi-diffusion
- **Support natif** : Twitter, Facebook, LinkedIn, Instagram, TikTok
- **Gestion des médias** (images, vidéos)
- **Formats adaptés** selon chaque plateforme
- **Analytics intégrés** des performances

### 💾 Stockage et Gestion
- **Base de données MongoDB** pour les publications
- **Cache Redis** pour les performances
- **Système de fichiers** organisé (5GB par utilisateur)
- **Sauvegarde automatique** des configurations

## 🛠️ Architecture technique

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │     Backend     │    │   Base de       │
│   React/Vite    │◄──►│   Node.js/      │◄──►│   données       │
│                 │    │   Express       │    │   MongoDB       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │                        │
                              ▼                        ▼
                       ┌─────────────────┐    ┌─────────────────┐
                       │     Cache       │    │   Services      │
                       │     Redis       │    │   sociaux       │
                       └─────────────────┘    └─────────────────┘
```

## 📁 Structure des fichiers

```
assistant-redacteur/
├── backend/                          # Serveur Node.js/Express
│   ├── config/                       # Configuration (DB, Passport)
│   ├── middleware/                   # Middlewares Express
│   ├── models/                       # Modèles de données MongoDB
│   ├── routes/                       # Routes API
│   ├── services/                     # Services de publication
│   ├── tests/                        # Tests unitaires et d'intégration
│   ├── utils/                        # Utilitaires (logger, etc.)
│   ├── server.js                     # Point d'entrée
│   └── package.json                  # Dépendances backend
├── react-app/                        # Interface React
│   ├── src/
│   │   ├── components/               # Composants React
│   │   ├── services/                 # Services API frontend
│   │   └── tests/                    # Tests frontend
│   └── package.json                  # Dépendances frontend
├── docker-compose.yml                # Déploiement Docker complet
├── docker-compose.dev.yml           # Développement Docker
└── deploy.sh                        # Script de déploiement
```

## 🚀 Démarrage rapide

### Prérequis
- **Node.js 18+**
- **MongoDB 7.0+**
- **Redis 7.2+** (optionnel, pour le cache)
- **Docker** (optionnel, pour le déploiement)

### Installation automatique

```bash
# Cloner le projet
git clone <repository-url>
cd assistant-redacteur

# Lancer le déploiement automatique
chmod +x deploy.sh
./deploy.sh

# Suivre les instructions à l'écran
```

### Installation manuelle

#### Backend
```bash
cd backend
npm install
cp .env.example .env
# Éditer .env avec vos clés API
npm run dev
```

#### Frontend
```bash
cd react-app
npm install
npm run dev
```

## ⚙️ Configuration

### Variables d'environnement (.env)

```env
# Serveur
NODE_ENV=development
PORT=4000
FRONTEND_URL=http://localhost:3003

# Base de données
MONGODB_URI=mongodb://localhost:27017/assistant-redacteur
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-refresh-secret-key

# OAuth - Réseaux sociaux
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
FACEBOOK_APP_ID=your-facebook-app-id
FACEBOOK_APP_SECRET=your-facebook-app-secret
TWITTER_API_KEY=your-twitter-api-key
TWITTER_API_SECRET=your-twitter-api-secret
LINKEDIN_CLIENT_ID=your-linkedin-client-id
LINKEDIN_CLIENT_SECRET=your-linkedin-client-secret

# IA Services
OPENAI_API_KEY=your-openai-api-key
ANTHROPIC_API_KEY=your-anthropic-api-key

# Sécurité
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX_REQUESTS=100
```

## 📚 API Documentation

### Endpoints principaux

#### Authentification
- `POST /api/auth/login` - Connexion utilisateur
- `POST /api/auth/register` - Inscription utilisateur
- `POST /api/auth/refresh` - Rafraîchissement token

#### Publications
- `GET /api/publications` - Liste des publications
- `POST /api/publications` - Créer une publication
- `PUT /api/publications/:id` - Modifier une publication
- `DELETE /api/publications/:id` - Supprimer une publication
- `POST /api/publications/:id/publish/:platform` - Publier immédiatement

#### OAuth
- `GET /api/oauth/platforms` - Plateformes disponibles
- `GET /api/oauth/accounts` - Comptes connectés
- `GET /api/oauth/status` - Statut des connexions
- `POST /api/oauth/accounts/:platform/disconnect` - Déconnecter un compte

#### Analytics
- `GET /api/analytics/user` - Statistiques utilisateur
- `GET /api/analytics/platforms` - Statistiques par plateforme

## 🧪 Tests

### Tests backend
```bash
cd backend
npm test                    # Tous les tests
npm run test:integration    # Tests d'intégration
npm run test:coverage       # Coverage
```

### Tests frontend
```bash
cd react-app
npm test                    # Tests React
npm run test:e2e           # Tests end-to-end
```

### Tests Docker
```bash
docker-compose -f docker-compose.test.yml up --abort-on-container-exit
```

## 🐳 Déploiement Docker

### Développement
```bash
docker-compose -f docker-compose.dev.yml up
```

### Production
```bash
docker-compose up -d
```

### Services déployés
- **MongoDB** (27017) - Base de données
- **Redis** (6379) - Cache et files d'attente
- **Backend** (4000) - API Node.js
- **Frontend** (3003) - Interface React
- **Nginx** (80/443) - Reverse proxy

## 📊 Monitoring et Logs

### Logs backend
```bash
# Logs temps réel
cd backend && npm run logs

# Logs par niveau
DEBUG=assistant:* npm run dev
```

### Métriques
- **Endpoint metrics** : `GET /metrics`
- **Health check** : `GET /health`
- **API documentation** : `GET /api-docs`

## 🔧 Maintenance

### Backup
```bash
# Backup MongoDB
mongodump --uri="mongodb://localhost:27017/assistant-redacteur" --out=./backup

# Backup Redis
redis-cli SAVE
```

### Mise à jour
```bash
# Mettre à jour les dépendances
cd backend && npm update
cd ../react-app && npm update

# Redémarrer les services
docker-compose restart
```

## 🚨 Résolution de problèmes

### Problèmes courants

**Erreur de connexion MongoDB**
```bash
# Vérifier que MongoDB tourne
docker ps | grep mongodb

# Logs MongoDB
docker-compose logs mongodb
```

**Erreur de permissions OAuth**
```bash
# Vérifier les variables d'environnement
cd backend && cat .env | grep OAUTH

# Tester les connexions OAuth
curl http://localhost:4000/api/oauth/platforms
```

**Erreur de publication**
```bash
# Vérifier les logs du scheduler
cd backend && npm run logs

# Vérifier les comptes connectés
curl -H "Authorization: Bearer $TOKEN" http://localhost:4000/api/oauth/accounts
```

## 📈 Évolution et roadmap

### Version actuelle (1.0.0)
- ✅ Authentification OAuth complète
- ✅ Publication automatique multiplateforme
- ✅ Calendrier avec planification
- ✅ API REST complète
- ✅ Tests unitaires et d'intégration

### Prochaines versions
- 🔄 **Instagram et TikTok** - Support complet des APIs
- 🔄 **Analytics avancés** - Tableaux de bord détaillés
- 🔄 **Gestion d'équipe** - Utilisateurs multiples
- 🔄 **API WhatsApp** - Support WhatsApp Business
- 🔄 **Intégrations CMS** - WordPress, Shopify, etc.

## 🤝 Support

### Documentation
- **API Docs** : http://localhost:4000/api-docs
- **Guide utilisateur** : Voir l'interface d'administration
- **Guide développeur** : Ce README

### Contact
- **Équipe technique** : support@assistant-redacteur.com
- **Issues GitHub** : https://github.com/assistant-redacteur/issues
- **Documentation** : https://docs.assistant-redacteur.com

---

**Assistant Rédacteur - Module 3** © 2025
*Automatisation et diffusion de contenu professionnel*
