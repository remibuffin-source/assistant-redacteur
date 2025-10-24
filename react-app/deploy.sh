#!/bin/bash

# Script de déploiement pour Assistant Rédacteur React
echo "🚀 Déploiement de l'Assistant Rédacteur React"

# Vérification des prérequis
if ! command -v npm &> /dev/null; then
    echo "❌ npm n'est pas installé"
    exit 1
fi

# Build de l'application
echo "📦 Construction de l'application..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Erreur lors du build"
    exit 1
fi

echo "✅ Build réussi"

# Vérification des fichiers de build
if [ ! -d "dist" ]; then
    echo "❌ Le dossier dist/ n'existe pas"
    exit 1
fi

echo "📁 Contenu du dossier dist/:"
ls -la dist/

# Options de déploiement
echo ""
echo "🌐 Options de déploiement:"
echo "1. Servir localement (port 3000)"
echo "2. Préparer pour Vercel"
echo "3. Préparer pour Netlify"
echo "4. Préparer pour AWS S3"
echo "5. Quitter"

read -p "Choisissez une option (1-5): " choice

case $choice in
    1)
        echo "🌍 Lancement du serveur local..."
        npx serve dist -p 3000
        ;;
    2)
        echo "▲ Préparation pour Vercel"
        echo "➡️ Exécutez: npm install -g vercel && vercel --prod"
        ;;
    3)
        echo "🕸️ Préparation pour Netlify"  
        echo "➡️ Drag & drop le dossier dist/ sur netlify.com"
        ;;
    4)
        echo "☁️ Préparation pour AWS S3"
        echo "➡️ Exécutez: aws s3 sync dist/ s3://votre-bucket --delete"
        ;;
    5)
        echo "👋 Au revoir!"
        exit 0
        ;;
    *)
        echo "❌ Option invalide"
        exit 1
        ;;
esac