#!/bin/bash

# Script de démarrage pour l'Assistant Rédactionnel
echo "🚀 Démarrage de l'Assistant Rédactionnel..."
echo "📁 Répertoire: $(pwd)"
echo "🌐 Serveur démarré sur: http://localhost:3000"
echo "📋 Appuyez sur Ctrl+C pour arrêter le serveur"
echo "----------------------------------------------"

# Vérifier si Python 3 est disponible
if command -v python3 &> /dev/null; then
    python3 -m http.server 3000
elif command -v python &> /dev/null; then
    python -m http.server 3000
else
    echo "❌ Erreur: Python n'est pas installé"
    echo "📦 Veuillez installer Python 3 pour continuer"
    exit 1
fi