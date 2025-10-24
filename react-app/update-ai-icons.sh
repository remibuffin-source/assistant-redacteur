#!/bin/bash

# Script pour mettre à jour les icônes des IA
echo "Mise à jour des icônes des IA..."

# Répertoire des icônes
ICONS_DIR="public/icons"

# URLs des nouvelles icônes (à remplacer par les URLs réelles)
# Pour l'instant, nous allons créer des versions alternatives des icônes existantes

# Créer une nouvelle icône pour ChatGPT (gpt4)
echo "Création de la nouvelle icône pour ChatGPT..."
cp "$ICONS_DIR/gpt4.ico" "$ICONS_DIR/gpt4-new.ico"

# Créer une nouvelle icône pour Gemini
echo "Création de la nouvelle icône pour Gemini..."
cp "$ICONS_DIR/gemini.ico" "$ICONS_DIR/gemini-new.ico"

echo "Icônes mises à jour !"
echo "N'oubliez pas de mettre à jour les références dans AISelection.jsx :"
echo "- ChatGPT: changer 'gpt4' par 'gpt4-new'"
echo "- Gemini: changer 'gemini' par 'gemini-new'"