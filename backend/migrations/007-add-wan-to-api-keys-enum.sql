-- Migration: Ajouter 'wan' à l'ENUM de la colonne service dans api_keys
-- Date: 2026-01-12
-- Description: Permet de stocker les clés API WAN 2.6 (Kie.ai)

-- Modifier l'ENUM pour ajouter 'wan'
ALTER TABLE api_keys 
MODIFY COLUMN service ENUM(
  'openai', 'openai-mini', 'anthropic', 'anthropic-haiku',
  'gemini-3-pro', 'gemini-2.5-flash', 'deepseek', 'deepseek-v3',
  'grok', 'grok-2', 'grok-4.1-fast-reasoning', 'kimi', 'qwen3', 'mistral', 'whisper',
  'gpt-vision', 'elevenlabs', 'deepl',
  'twitter', 'facebook', 'linkedin', 'instagram', 'tiktok',
  'blog', 'website',
  'fal-tti', 'fal-edit', 'gemini-image', 'wan'
) NOT NULL;

-- Vérifier que la modification a été appliquée
-- SELECT COLUMN_TYPE FROM INFORMATION_SCHEMA.COLUMNS 
-- WHERE TABLE_NAME = 'api_keys' AND COLUMN_NAME = 'service';
