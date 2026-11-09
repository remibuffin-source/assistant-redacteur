# Technologies

Backend: Node.js, Express, Sequelize (MySQL/SQLite), Stripe, Passport.js.
Frontend: React, TypeScript, Vite, Tailwind CSS.
IA: OpenAI, Anthropic, Google Gemini, Fal.ai (Wan), Kie.ai (Veo).

## Modèles utilisés (état 2026-11-09)
- Anthropic : `claude-sonnet-5-5` (défaut), `claude-haiku-5-5` (économique, tests de clé).
- OpenAI : `gpt-5.6-terra` (équilibre), `gpt-5.6-luna` (coût optimisé).
- Gemini : `google/gemini-3-pro-preview`, `google/gemini-2.5-flash-image` (Nano Banana) via OpenRouter.
- DeepSeek : `deepseek-chat`, `deepseek-reasoner`.
- OpenRouter : `x-ai/grok-4.1-fast`, `moonshotai/kimi-k2-thinking`, `qwen/qwen3-30b-a3b-thinking-2507`, `mistralai/mistral-large-2411`.
- Images : `fal-ai/bytedance/seedream/v5/lite/text-to-image` et `…/v5/lite/edit` (~0,035 $/image).
- Vidéo : Kie.ai `veo3` / `veo3_fast`, `wan/2-6-*`.
- Tarification : `PricingConfig` (BDD) référence encore d'anciens noms de modèles → fallback partiel.
