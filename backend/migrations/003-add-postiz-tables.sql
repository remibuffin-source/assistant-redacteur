-- Migration pour l'intégration Postiz
-- Ajoute les tables social_accounts et schedules
-- Modifie la table users pour ajouter les champs Postiz

-- 1. Ajouter les colonnes Postiz à la table users
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS postizUserId VARCHAR(255) NULL COMMENT 'ID de l\'utilisateur dans Postiz',
ADD COLUMN IF NOT EXISTS postizOnboardingStatus ENUM('not_started', 'in_progress', 'completed') DEFAULT 'not_started' COMMENT 'Statut de l\'onboarding des réseaux sociaux';

-- 2. Créer la table social_accounts
CREATE TABLE IF NOT EXISTS social_accounts (
  id INT PRIMARY KEY AUTO_INCREMENT,
  userId INT NOT NULL,
  provider ENUM('facebook', 'instagram', 'twitter', 'x', 'linkedin', 'tiktok', 'youtube', 'pinterest', 'reddit', 'threads', 'mastodon', 'bluesky') NOT NULL COMMENT 'Plateforme sociale',
  providerAccountId VARCHAR(255) NOT NULL COMMENT 'ID du compte sur la plateforme',
  displayName VARCHAR(255) NULL COMMENT 'Nom d\'affichage du compte',
  username VARCHAR(255) NULL COMMENT 'Nom d\'utilisateur ou handle',
  avatarUrl VARCHAR(500) NULL COMMENT 'URL de l\'avatar du compte',
  status ENUM('connected', 'disconnected', 'error', 'expired') DEFAULT 'connected' COMMENT 'Statut de la connexion',
  postizProfileId VARCHAR(255) NULL COMMENT 'ID du profil dans Postiz',
  postizConnectionId VARCHAR(255) NULL COMMENT 'ID de la connexion dans Postiz',
  scopes JSON NULL COMMENT 'Permissions OAuth accordées',
  metadata JSON NULL COMMENT 'Métadonnées supplémentaires',
  lastSyncAt DATETIME NULL COMMENT 'Dernière synchronisation avec Postiz',
  lastError TEXT NULL COMMENT 'Dernier message d\'erreur',
  lastErrorAt DATETIME NULL COMMENT 'Date de la dernière erreur',
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_provider_account (userId, provider, providerAccountId),
  INDEX idx_userId (userId),
  INDEX idx_provider (provider),
  INDEX idx_status (status),
  INDEX idx_postizProfileId (postizProfileId)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Comptes sociaux connectés via Postiz';

-- 3. Créer la table schedules
CREATE TABLE IF NOT EXISTS schedules (
  id INT PRIMARY KEY AUTO_INCREMENT,
  userId INT NOT NULL,
  publicationId INT NULL COMMENT 'ID de la publication associée',
  scheduledAt DATETIME NOT NULL COMMENT 'Date et heure de publication programmée',
  timezone VARCHAR(50) DEFAULT 'Europe/Paris' COMMENT 'Fuseau horaire',
  targetProviders JSON NOT NULL COMMENT 'Liste des plateformes cibles',
  targetSocialAccountIds JSON NOT NULL COMMENT 'Liste des IDs de SocialAccount cibles',
  postizJobId VARCHAR(255) NULL COMMENT 'ID du job dans Postiz',
  postizScheduleId VARCHAR(255) NULL COMMENT 'ID de la planification dans Postiz',
  status ENUM('pending', 'queued', 'sent_to_postiz', 'scheduled', 'publishing', 'published', 'partial_success', 'failed', 'cancelled') DEFAULT 'pending' COMMENT 'Statut de la programmation',
  content JSON NOT NULL COMMENT 'Contenu de la publication',
  publishResults JSON NULL COMMENT 'Résultats de publication par plateforme',
  lastError TEXT NULL COMMENT 'Dernier message d\'erreur',
  lastErrorAt DATETIME NULL COMMENT 'Date de la dernière erreur',
  publishedAt DATETIME NULL COMMENT 'Date de publication effective',
  cancelledAt DATETIME NULL COMMENT 'Date d\'annulation',
  cancelledBy INT NULL COMMENT 'ID de l\'utilisateur ayant annulé',
  metadata JSON NULL COMMENT 'Métadonnées supplémentaires',
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (publicationId) REFERENCES publications(id) ON DELETE SET NULL,
  FOREIGN KEY (cancelledBy) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_userId (userId),
  INDEX idx_publicationId (publicationId),
  INDEX idx_status (status),
  INDEX idx_scheduledAt (scheduledAt),
  INDEX idx_postizJobId (postizJobId),
  INDEX idx_postizScheduleId (postizScheduleId),
  INDEX idx_user_status_scheduled (userId, status, scheduledAt)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Programmations de publications via Postiz';

-- 4. Ajouter des index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_users_postizUserId ON users(postizUserId);
CREATE INDEX IF NOT EXISTS idx_users_postizOnboardingStatus ON users(postizOnboardingStatus);

-- 5. Afficher un message de confirmation
SELECT 'Migration 003 - Tables Postiz créées avec succès' AS status;
