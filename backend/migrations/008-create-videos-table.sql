-- Migration: Créer la table videos pour stocker les vidéos générées par WAN 2.6
-- Date: 2026-01-12
-- Description: Table pour stocker les métadonnées des vidéos générées

CREATE TABLE IF NOT EXISTS videos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NOT NULL,
  filename VARCHAR(255) NOT NULL COMMENT 'Nom du fichier sur le serveur',
  originalFilename VARCHAR(255) NULL COMMENT 'Nom original du fichier',
  filepath VARCHAR(500) NOT NULL COMMENT 'Chemin relatif depuis stockage/',
  url VARCHAR(500) NOT NULL COMMENT 'URL publique pour accéder à la vidéo',
  taskId VARCHAR(255) NULL COMMENT 'ID de la tâche Kie.ai',
  model ENUM('text-to-video', 'image-to-video', 'video-to-video') NOT NULL COMMENT 'Type de génération',
  prompt TEXT NULL COMMENT 'Prompt utilisé pour la génération',
  resolution VARCHAR(20) DEFAULT '720p' COMMENT 'Résolution de la vidéo',
  duration INT DEFAULT 5 COMMENT 'Durée en secondes',
  aspectRatio VARCHAR(20) DEFAULT '16:9' COMMENT 'Ratio d aspect',
  status ENUM('queuing', 'processing', 'completed', 'failed') DEFAULT 'queuing' COMMENT 'Statut de la génération',
  creditsUsed DECIMAL(10,2) DEFAULT 0 COMMENT 'Crédits utilisés',
  fileSize BIGINT NULL COMMENT 'Taille du fichier en octets',
  metadata JSON NULL COMMENT 'Métadonnées supplémentaires',
  isActive TINYINT(1) DEFAULT 1 COMMENT 'Vidéo active ou supprimée',
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_userId (userId),
  INDEX idx_taskId (taskId),
  INDEX idx_model (model),
  INDEX idx_createdAt (createdAt)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
