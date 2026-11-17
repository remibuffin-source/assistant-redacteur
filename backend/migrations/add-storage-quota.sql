-- Migration: Ajouter le champ storageUsed pour le quota de stockage
-- Date: 2025-12-09

-- Ajouter la colonne storageUsed à la table users
ALTER TABLE users 
ADD COLUMN storageUsed BIGINT DEFAULT 0 COMMENT 'Espace de stockage utilisé en octets';

-- Index pour optimiser les requêtes
CREATE INDEX idx_users_storage ON users(storageUsed);

-- Mettre à jour les utilisateurs existants (optionnel)
UPDATE users SET storageUsed = 0 WHERE storageUsed IS NULL;
