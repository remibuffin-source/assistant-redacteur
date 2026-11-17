-- Migration: Création de la table videos pour stocker les vidéos générées par WAN 2.6
-- Date: 2026-01-11

CREATE TABLE IF NOT EXISTS `videos` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `userId` INT NOT NULL,
  `filename` VARCHAR(255) NOT NULL COMMENT 'Nom du fichier sur le serveur',
  `originalFilename` VARCHAR(255) DEFAULT NULL COMMENT 'Nom original du fichier',
  `filepath` VARCHAR(500) NOT NULL COMMENT 'Chemin relatif depuis stockage/',
  `url` VARCHAR(500) NOT NULL COMMENT 'URL publique pour accéder à la vidéo',
  `taskId` VARCHAR(255) DEFAULT NULL COMMENT 'ID de la tâche Kie.ai',
  `model` ENUM('text-to-video', 'image-to-video', 'video-to-video') NOT NULL COMMENT 'Type de génération',
  `prompt` TEXT DEFAULT NULL COMMENT 'Prompt utilisé pour la génération',
  `resolution` ENUM('720p', '1080p') DEFAULT '720p',
  `duration` INT DEFAULT NULL COMMENT 'Durée en secondes (5, 10, 15)',
  `aspectRatio` VARCHAR(10) DEFAULT NULL COMMENT 'Ratio (16:9, 9:16, 1:1, auto)',
  `fileSize` BIGINT DEFAULT NULL COMMENT 'Taille du fichier en octets',
  `mimeType` VARCHAR(100) DEFAULT 'video/mp4',
  `creditsUsed` INT DEFAULT NULL COMMENT 'Nombre de crédits utilisés',
  `metadata` JSON DEFAULT NULL COMMENT 'Métadonnées supplémentaires (seed, multiShots, etc.)',
  `isActive` TINYINT(1) DEFAULT 1 COMMENT 'Vidéo active ou supprimée',
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_userId` (`userId`),
  KEY `idx_taskId` (`taskId`),
  KEY `idx_model` (`model`),
  KEY `idx_createdAt` (`createdAt`),
  CONSTRAINT `fk_videos_userId` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
