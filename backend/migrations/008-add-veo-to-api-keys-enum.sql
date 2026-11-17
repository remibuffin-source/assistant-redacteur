-- Migration pour ajouter 'veo' à l'ENUM de la colonne service dans api_keys
-- Date: 2026-01-13

ALTER TABLE api_keys 
MODIFY COLUMN service ENUM(
  'openai', 'openai-mini', 'anthropic', 'anthropic-haiku',
  'gemini-3-pro', 'gemini-2.5-flash', 'deepseek', 'deepseek-v3',
  'grok', 'grok-2', 'grok-4.1-fast-reasoning', 'kimi', 'qwen3', 'mistral', 'whisper',
  'gpt-vision', 'elevenlabs', 'deepl',
  'twitter', 'facebook', 'linkedin', 'instagram', 'tiktok',
  'blog', 'website',
  'fal-tti', 'fal-edit', 'gemini-image', 'wan', 'veo'
) NOT NULL;
