-- ============================================
-- Création des tables de stockage
-- Assistant Rédactionnel - O2Switch MySQL
-- ============================================

-- Table: content_models (Modèles de l'éditeur)
CREATE TABLE IF NOT EXISTS `content_models` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `user_id` INT NOT NULL,
  `name` VARCHAR(200) NOT NULL,
  `content` LONGTEXT NOT NULL DEFAULT '',
  `type` VARCHAR(50) NOT NULL DEFAULT 'text',
  `description` VARCHAR(500) DEFAULT NULL,
  `tags` JSON DEFAULT NULL,
  `category` VARCHAR(100) DEFAULT NULL,
  `is_template` TINYINT(1) NOT NULL DEFAULT 0,
  `usage_count` INT NOT NULL DEFAULT 0,
  `last_used_at` DATETIME DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_user_created` (`user_id`, `created_at`),
  KEY `idx_category` (`category`),
  KEY `idx_is_template` (`is_template`),
  CONSTRAINT `fk_content_models_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: content_model_files (Fichiers des modèles)
CREATE TABLE IF NOT EXISTS `content_model_files` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `content_model_id` INT NOT NULL,
  `filename` VARCHAR(255) NOT NULL,
  `original_name` VARCHAR(255) NOT NULL,
  `file_path` VARCHAR(500) NOT NULL,
  `file_size` BIGINT NOT NULL,
  `mime_type` VARCHAR(100) NOT NULL,
  `file_type` VARCHAR(50) NOT NULL DEFAULT 'document',
  `metadata` JSON DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_content_model_id` (`content_model_id`),
  KEY `idx_file_type` (`file_type`),
  CONSTRAINT `fk_content_model_files` FOREIGN KEY (`content_model_id`) REFERENCES `content_models` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: complete_models (Modèles complets Home)
CREATE TABLE IF NOT EXISTS `complete_models` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `user_id` INT NOT NULL,
  `name` VARCHAR(200) NOT NULL,
  `description` VARCHAR(500) DEFAULT NULL,
  `config` JSON NOT NULL,
  `content` LONGTEXT DEFAULT NULL,
  `results` JSON DEFAULT NULL,
  `theme` VARCHAR(20) NOT NULL DEFAULT 'light',
  `tags` JSON DEFAULT NULL,
  `category` VARCHAR(100) DEFAULT NULL,
  `usage_count` INT NOT NULL DEFAULT 0,
  `last_used_at` DATETIME DEFAULT NULL,
  `is_favorite` TINYINT(1) NOT NULL DEFAULT 0,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_user_created` (`user_id`, `created_at`),
  KEY `idx_category` (`category`),
  KEY `idx_is_favorite` (`is_favorite`),
  CONSTRAINT `fk_complete_models_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: complete_model_files (Fichiers des modèles complets)
CREATE TABLE IF NOT EXISTS `complete_model_files` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `complete_model_id` INT NOT NULL,
  `filename` VARCHAR(255) NOT NULL,
  `original_name` VARCHAR(255) NOT NULL,
  `file_path` VARCHAR(500) NOT NULL,
  `file_size` BIGINT NOT NULL,
  `mime_type` VARCHAR(100) NOT NULL,
  `file_type` VARCHAR(50) NOT NULL DEFAULT 'document',
  `metadata` JSON DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_complete_model_id` (`complete_model_id`),
  KEY `idx_file_type` (`file_type`),
  CONSTRAINT `fk_complete_model_files` FOREIGN KEY (`complete_model_id`) REFERENCES `complete_models` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: publications (Publications programmées)
CREATE TABLE IF NOT EXISTS `publications` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `user_id` INT NOT NULL,
  `title` VARCHAR(200) NOT NULL,
  `content` LONGTEXT NOT NULL,
  `publish_date` DATETIME NOT NULL,
  `platforms` JSON NOT NULL,
  `status` VARCHAR(20) NOT NULL DEFAULT 'draft',
  `settings` JSON DEFAULT NULL,
  `tags` JSON DEFAULT NULL,
  `category` VARCHAR(100) DEFAULT NULL,
  `performance` JSON DEFAULT NULL,
  `source` VARCHAR(50) NOT NULL DEFAULT 'manual',
  `source_id` INT DEFAULT NULL,
  `history` JSON DEFAULT NULL,
  `advanced` JSON DEFAULT NULL,
  `published_at` DATETIME DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_user_publish` (`user_id`, `publish_date`),
  KEY `idx_status` (`status`),
  KEY `idx_publish_date` (`publish_date`),
  KEY `idx_category` (`category`),
  CONSTRAINT `fk_publications_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: publication_files (Fichiers des publications)
CREATE TABLE IF NOT EXISTS `publication_files` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `publication_id` INT NOT NULL,
  `filename` VARCHAR(255) NOT NULL,
  `original_name` VARCHAR(255) NOT NULL,
  `file_path` VARCHAR(500) NOT NULL,
  `file_size` BIGINT NOT NULL,
  `mime_type` VARCHAR(100) NOT NULL,
  `file_type` VARCHAR(50) NOT NULL DEFAULT 'document',
  `metadata` JSON DEFAULT NULL,
  `thumbnail` VARCHAR(500) DEFAULT NULL,
  `display_order` INT NOT NULL DEFAULT 0,
  `alt_text` VARCHAR(255) DEFAULT NULL,
  `caption` TEXT DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_publication_id` (`publication_id`),
  KEY `idx_file_type` (`file_type`),
  KEY `idx_publication_order` (`publication_id`, `display_order`),
  CONSTRAINT `fk_publication_files` FOREIGN KEY (`publication_id`) REFERENCES `publications` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Fin de la création des tables
-- ============================================
