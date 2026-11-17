-- Migration pour ajouter le token API Postiz par utilisateur
-- Permet à chaque utilisateur d'avoir son propre compte Postiz

-- Ajouter la colonne postiz_token à la table users
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS postiz_token VARCHAR(500) NULL COMMENT 'Token API Postiz de l\'utilisateur (chiffré)',
ADD COLUMN IF NOT EXISTS postiz_token_iv VARCHAR(255) NULL COMMENT 'IV pour le chiffrement du token Postiz',
ADD COLUMN IF NOT EXISTS postiz_connected BOOLEAN DEFAULT FALSE COMMENT 'Indique si l\'utilisateur a connecté son compte Postiz',
ADD COLUMN IF NOT EXISTS postiz_connected_at DATETIME NULL COMMENT 'Date de connexion du compte Postiz';

-- Ajouter des index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_users_postiz_connected ON users(postiz_connected);

-- Afficher un message de confirmation
SELECT 'Migration 004 - Colonne postiz_token ajoutée avec succès' AS status;
