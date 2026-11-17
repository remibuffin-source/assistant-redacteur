-- Migration 005: Ajout des colonnes OAuth pour Postiz
-- Date: 2026-01-08
-- Description: Ajoute les colonnes nécessaires pour le flux OAuth Postiz

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS postiz_oauth_state VARCHAR(255) NULL COMMENT 'State OAuth pour sécuriser le flux',
ADD COLUMN IF NOT EXISTS postiz_oauth_state_expires DATETIME NULL COMMENT 'Expiration du state OAuth',
ADD COLUMN IF NOT EXISTS postiz_refresh_token VARCHAR(500) NULL COMMENT 'Refresh token Postiz (chiffré)',
ADD COLUMN IF NOT EXISTS postiz_refresh_token_iv VARCHAR(255) NULL COMMENT 'IV pour le chiffrement du refresh token';

CREATE INDEX IF NOT EXISTS idx_users_postiz_oauth_state ON users(postiz_oauth_state);

SELECT 'Migration 005 - Colonnes OAuth Postiz ajoutées avec succès' AS status;
