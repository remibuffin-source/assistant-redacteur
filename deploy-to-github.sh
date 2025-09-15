#!/bin/bash

# Script pour déployer toutes les modifications sur GitHub
echo "🚀 Déploiement des modifications sur GitHub..."

# Vérifier que nous sommes dans le bon répertoire
if [ ! -d "react-app" ]; then
    echo "❌ Erreur: Le dossier react-app n'existe pas"
    exit 1
fi

# Aller dans le sous-module react-app
cd react-app

# Vérifier le statut Git du sous-module
echo "📊 Statut du sous-module react-app:"
git status --porcelain

# Ajouter tous les fichiers modifiés
echo "📦 Ajout des fichiers modifiés..."
git add src/components/ConfigAPIPage.jsx \
        src/components/ConfigAPIPage.css \
        src/components/AccountPage.css \
        src/hooks/useLocalStorage.js \
        src/main.jsx \
        src/components/MenuBar.jsx \
        package.json

# Vérifier ce qui a été ajouté
echo "📋 Fichiers en attente de commit:"
git status --porcelain

# Faire le commit
echo "💾 Création du commit..."
git commit -m "✨ Ajout de la page Config API avec sections IA et réseaux

- Création de la page de configuration API complète
- Séparation des services IA et réseaux sociaux
- Implémentation du test et sauvegarde des clés API
- Interface responsive avec onglets
- Validation avancée des clés par service
- Intégration React Router"

# Remonter au répertoire parent
cd ..

# Ajouter également le fichier de vérification
echo "📝 Ajout du fichier de vérification..."
git add VERIFICATION_MODIFICATIONS.md

# Commit des modifications racines
echo "💾 Commit des modifications racines..."
git commit -m "📋 Mise à jour de la vérification des modifications"

# Pousser les changements
echo "📤 Push des modifications..."
git push origin main

echo "✅ Déploiement terminé avec succès !"
echo "🌐 Les modifications sont maintenant sur GitHub"