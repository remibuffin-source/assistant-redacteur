#!/bin/bash

# Script de déploiement pour Assistant Rédacteur
echo "🚀 Préparation du déploiement de l'Assistant Rédacteur"

# Vérifier que nous sommes dans le bon répertoire
if [ ! -d "react-app" ]; then
    echo "❌ Erreur: Le dossier react-app n'existe pas"
    exit 1
fi

echo "📦 Construction de l'application..."
cd react-app && npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build réussi"
    echo ""
    echo "📋 FICHIERS PRÊTS POUR DÉPLOIEMENT:"
    echo "📍 Dossier: react-app/dist/"
    echo "📊 Taille: $(du -sh react-app/dist/ 2>/dev/null | cut -f1 || echo "Non disponible")"
    echo ""
    echo "🌐 OPTIONS DE DÉPLOIEMENT:"
    echo "1. Netlify: Glisser-déposer le dossier 'dist' sur https://app.netlify.com/drop"
    echo "2. Vercel: Importer via GitHub ou CLI"
    echo "3. Autre: Utiliser le dossier 'dist' comme site statique"
    echo ""
    echo "🔗 URLs de test local:"
    echo "   - http://localhost:3005 (si serveur démarré)"
    echo ""
    echo "📖 Consulter DEPLOYMENT-GUIDE.md pour les instructions détaillées"
else
    echo "❌ Erreur lors du build"
    exit 1
fi