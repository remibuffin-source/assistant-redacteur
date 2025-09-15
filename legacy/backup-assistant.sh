#!/bin/bash

# Script de sauvegarde de l'Assistant Rédacteur
BACKUP_DIR="/home/matsad/backups/assistant-redacteur"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_NAME="assistant-redacteur_backup_$TIMESTAMP.tar.gz"

echo "💾 Sauvegarde de l'Assistant Rédacteur..."
echo "📁 Source: /home/matsad/assistant-redacteur/"
echo "📦 Destination: $BACKUP_DIR/$BACKUP_NAME"
echo "----------------------------------------------"

# Créer le dossier de backup s'il n'existe pas
mkdir -p "$BACKUP_DIR"

# Créer la sauvegarde
cd /home/matsad/
tar -czf "$BACKUP_DIR/$BACKUP_NAME" assistant-redacteur/

# Vérifier que la sauvegarde a réussi
if [ $? -eq 0 ]; then
    echo "✅ Sauvegarde réussie!"
    echo "📊 Taille: $(du -h "$BACKUP_DIR/$BACKUP_NAME" | cut -f1)"
    echo "🗂️  Fichier: $BACKUP_DIR/$BACKUP_NAME"
    
    # Lister les 5 dernières sauvegardes
    echo ""
    echo "📋 Dernières sauvegardes:"
    ls -lt "$BACKUP_DIR" | head -6
else
    echo "❌ Erreur lors de la sauvegarde"
    exit 1
fi

# Optionnel: Supprimer les sauvegardes de plus de 30 jours
find "$BACKUP_DIR" -name "assistant-redacteur_backup_*.tar.gz" -mtime +30 -delete

echo ""
echo "🔒 Sauvegarde terminée avec succès!"