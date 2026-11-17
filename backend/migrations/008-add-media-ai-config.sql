-- Migration : Configuration globale des IA multimodales
-- Cette table stocke la configuration définie par l'admin pour tous les utilisateurs
-- À exécuter dans phpMyAdmin sur la base bure7653_assistant-redacteur

CREATE TABLE IF NOT EXISTS media_ai_config (
  id INT PRIMARY KEY AUTO_INCREMENT,
  config_key VARCHAR(50) NOT NULL UNIQUE,
  config_value TEXT NOT NULL,
  updated_by INT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_config_key (config_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insérer la configuration par défaut
INSERT INTO media_ai_config (config_key, config_value, updated_by) VALUES
('media_ai_config', JSON_OBJECT(
  'text', 'gpt-4o-mini',
  'audio', 'whisper-large-v3',
  'image', 'gemini-2.5-flash',
  'spreadsheet', 'gpt-4o',
  'web', 'claude-4.5-sonnet'
), NULL)
ON DUPLICATE KEY UPDATE config_value = config_value;
