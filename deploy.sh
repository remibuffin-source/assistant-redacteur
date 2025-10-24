#!/bin/bash

# Script de déploiement pour Assistant Rédacteur - Module 3
# Auteur: Assistant Rédacteur Team
# Date: 2 Octobre 2025

set -e  # Arrêter en cas d'erreur

echo "🚀 Déploiement de l'Assistant Rédacteur - Module 3: Automatisation et Diffusion API"
echo "=================================================================================="

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonction pour afficher les messages
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Vérifier les prérequis
log_info "Vérification des prérequis..."

# Vérifier Node.js
if ! command -v node &> /dev/null; then
    log_error "Node.js n'est pas installé. Veuillez l'installer d'abord."
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    log_error "Node.js version 18+ est requis. Version actuelle: $(node -v)"
    exit 1
fi

log_success "Node.js $(node -v) détecté"

# Vérifier Docker (optionnel)
if command -v docker &> /dev/null; then
    log_success "Docker détecté - déploiement Docker disponible"
    USE_DOCKER=true
else
    log_warning "Docker non détecté - déploiement manuel uniquement"
    USE_DOCKER=false
fi

# Demander le mode de déploiement
echo ""
echo "Choisissez le mode de déploiement:"
echo "1) Développement (avec hot reload)"
echo "2) Production (optimisé)"
echo "3) Docker (conteneurisé)"
read -p "Choix (1-3): " DEPLOY_MODE

case $DEPLOY_MODE in
    1)
        log_info "Mode développement sélectionné"
        DEPLOY_TYPE="dev"
        ;;
    2)
        log_info "Mode production sélectionné"
        DEPLOY_TYPE="prod"
        ;;
    3)
        if [ "$USE_DOCKER" = false ]; then
            log_error "Docker n'est pas disponible"
            exit 1
        fi
        log_info "Mode Docker sélectionné"
        DEPLOY_TYPE="docker"
        ;;
    *)
        log_error "Choix invalide"
        exit 1
        ;;
esac

# Installation des dépendances
log_info "Installation des dépendances backend..."
cd backend
if [ ! -d "node_modules" ]; then
    npm install
    log_success "Dépendances backend installées"
else
    log_info "Dépendances backend déjà installées"
fi

# Configuration des variables d'environnement
log_info "Configuration des variables d'environnement..."
if [ ! -f ".env" ]; then
    cp .env.example .env
    log_warning "Fichier .env créé à partir de .env.example"
    log_warning "Veuillez éditer le fichier .env avec vos vraies valeurs API"
else
    log_success "Fichier .env déjà configuré"
fi

# Démarrage selon le mode choisi
case $DEPLOY_TYPE in
    "dev")
        log_info "Démarrage en mode développement..."
        echo ""
        echo "🔧 Mode Développement:"
        echo "   - Frontend: http://localhost:3003"
        echo "   - Backend:  http://localhost:4000"
        echo "   - Hot reload activé"
        echo "   - Logs détaillés"
        echo ""

        # Démarrer le backend en arrière-plan
        npm run dev &
        BACKEND_PID=$!

        log_success "Backend démarré (PID: $BACKEND_PID)"

        # Instructions pour le frontend
        echo ""
        log_info "Pour démarrer le frontend:"
        echo "   cd ../react-app"
        echo "   npm run dev"
        echo ""
        echo "Le backend continuera de tourner en arrière-plan."
        echo "Pour l'arrêter: kill $BACKEND_PID"
        ;;

    "prod")
        log_info "Démarrage en mode production..."

        # Build du frontend
        log_info "Build du frontend..."
        cd ../react-app
        if [ ! -d "node_modules" ]; then
            npm install
        fi
        npm run build
        log_success "Frontend buildé"

        # Démarrer le backend en production
        cd ../backend
        log_info "Démarrage du backend en production..."
        npm start &
        BACKEND_PID=$!

        # Servir le frontend avec le backend
        log_success "Application démarrée en production"
        echo ""
        echo "🌐 URLs de production:"
        echo "   - Application: http://localhost:4000"
        echo "   - API:         http://localhost:4000/api"
        echo ""
        echo "Le serveur tourne en arrière-plan (PID: $BACKEND_PID)"
        echo "Pour l'arrêter: kill $BACKEND_PID"
        ;;

    "docker")
        log_info "Déploiement Docker..."

        # Build des images
        log_info "Build des images Docker..."
        docker-compose build

        # Démarrage des services
        log_info "Démarrage des services..."
        docker-compose up -d

        # Attendre que les services soient prêts
        log_info "Attente du démarrage des services..."
        sleep 10

        # Vérifier l'état des services
        if docker-compose ps | grep -q "Up"; then
            log_success "Services Docker démarrés avec succès"
            echo ""
            echo "🐳 Services Docker:"
            echo "   - MongoDB:    localhost:27017"
            echo "   - Redis:      localhost:6379"
            echo "   - Backend:    localhost:4000"
            echo "   - Frontend:   localhost:3003"
            echo "   - Nginx:      localhost:80"
            echo ""
            echo "Pour arrêter: docker-compose down"
        else
            log_error "Erreur lors du démarrage des services Docker"
            exit 1
        fi
        ;;
esac

# Instructions finales
echo ""
echo "=================================================================================="
log_success "Déploiement terminé avec succès!"
echo ""

if [ "$DEPLOY_TYPE" = "dev" ] || [ "$DEPLOY_TYPE" = "prod" ]; then
    echo "📋 Étapes suivantes recommandées:"
    echo "   1. Configurez vos clés API dans le fichier .env"
    echo "   2. Connectez vos comptes de réseaux sociaux"
    echo "   3. Créez votre première publication automatisée"
    echo ""
fi

echo "🔗 Liens utiles:"
echo "   - Documentation API: http://localhost:4000/api-docs"
echo "   - Interface Admin:   http://localhost:4000/admin"
echo "   - Monitoring:        http://localhost:4000/metrics"
echo ""

log_info "L'Assistant Rédacteur Module 3 est maintenant opérationnel!"
echo "=================================================================================="
