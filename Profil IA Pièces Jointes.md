# Configuration des Profils IA pour les Pièces Jointes

## 📋 Vue d'ensemble

Ce document décrit la configuration des trois profils d'analyse des pièces jointes dans l'Assistant Rédactionnel.

---

## 🚀 Mode "Rapide" (Vitesse maximale)

**Objectif** : Analyse rapide avec un bon rapport qualité/vitesse

| Type de pièce jointe | IA utilisée | Modèle |
|---------------------|-------------|---------|
| **Texte** | Kimi2 | `kimi` (moonshotai/kimi-k2-0905) |
| **Audio** | Qwen3 | `qwen3` (qwen/qwen3-vl-30b-a3b-thinking) |
| **Image** | Qwen3 | `qwen3` (qwen/qwen3-vl-30b-a3b-thinking) |
| **Tableau** | Qwen3 | `qwen3` (qwen/qwen3-vl-30b-a3b-thinking) |
| **Web** | Qwen3 | `qwen3` (qwen/qwen3-vl-30b-a3b-thinking) |

**Caractéristiques** :
- ✅ Temps de réponse rapide
- ✅ Coût optimisé
- ✅ Idéal pour analyses préliminaires
- ✅ Kimi2 excellent pour le texte long
- ✅ Qwen3 multimodal pour tout le reste

---

## ⚖️ Mode "Équilibré" (Compromis qualité/vitesse)

**Objectif** : Équilibre optimal entre qualité et rapidité

| Type de pièce jointe | IA utilisée | Modèle |
|---------------------|-------------|---------|
| **Texte** | DeepSeek Chat | `deepseek-chat` (deepseek-chat V3.2) |
| **Audio** | Qwen3 | `qwen3` (qwen/qwen3-vl-30b-a3b-thinking) |
| **Image** | Qwen3 | `qwen3` (qwen/qwen3-vl-30b-a3b-thinking) |
| **Tableau** | Claude Sonnet 4.5 | `claude-4.5-sonnet` |
| **Web** | Claude Sonnet 4.5 | `claude-4.5-sonnet` |

**Caractéristiques** :
- ✅ Bon équilibre qualité/vitesse
- ✅ DeepSeek Chat excellent pour le texte
- ✅ Qwen3 pour audio et images
- ✅ Claude 4.5 pour tableaux et web (précision)
- ✅ Coût modéré

---

## 🎯 Mode "Précis" (Qualité maximale)

**Objectif** : Analyse de la plus haute qualité

| Type de pièce jointe | IA utilisée | Modèle |
|---------------------|-------------|---------|
| **Texte** | Claude Sonnet 4.5 | `claude-4.5-sonnet` |
| **Audio** | Claude Sonnet 4.5 | `claude-4.5-sonnet` |
| **Image** | Gemini 2.5 Pro | `gemini-2.5-pro` |
| **Tableau** | Gemini 2.5 Pro | `gemini-2.5-pro` |
| **Web** | Gemini 2.5 Pro | `gemini-2.5-pro` |

**Caractéristiques** :
- ✅ Qualité maximale
- ✅ Claude 4.5 pour texte et audio (raisonnement avancé)
- ✅ Gemini 2.5 Pro pour vision et données structurées
- ✅ Idéal pour analyses critiques
- ✅ Coût plus élevé

---

## 📊 Tableau comparatif

| Critère | Rapide 🚀 | Équilibré ⚖️ | Précis 🎯 |
|---------|-----------|--------------|-----------|
| **Vitesse** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ |
| **Qualité** | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Coût** | 💰 | 💰💰 | 💰💰💰 |
| **Usage** | Analyses rapides | Usage quotidien | Analyses critiques |

---

## 🔧 Configuration technique

### Fichier de configuration
- **Emplacement** : `react-app/src/components/MediaAISelector.jsx`
- **Section** : `profiles` (lignes 180-218)

### Clés API requises (`.env.local`)
```env
# Kimi (OpenRouter)
VITE_OPENROUTER_API_KEY=sk-or-v1-...

# Qwen3 (OpenRouter)
VITE_QWEN3_API_KEY=sk-or-v1-...

# DeepSeek
VITE_DEEPSEEK_API_KEY=sk-...

# Claude (Anthropic)
VITE_CLAUDE_API_KEY=sk-ant-...

# Gemini (Google)
VITE_GEMINI_API_KEY=...
```

---

## 📝 Notes de mise en œuvre

### Modèles multimodaux
- **Qwen3** : Supporte texte, images, audio (via OpenRouter)
- **Gemini 2.5 Pro** : Excellent pour vision et données structurées
- **Claude 4.5** : Raisonnement avancé, texte et audio

### Fallback
Si une IA n'est pas disponible (clé API manquante), le système utilise automatiquement une simulation ou une IA alternative.

### Performance
- **Rapide** : ~2-5 secondes par analyse
- **Équilibré** : ~5-10 secondes par analyse
- **Précis** : ~10-20 secondes par analyse

---

## 🔄 Historique des modifications

### Version 1.0 (28 octobre 2025)
- ✅ Configuration initiale des 3 profils
- ✅ Intégration de Qwen3 multimodal
- ✅ Optimisation des coûts avec Kimi2 et DeepSeek
- ✅ Qualité maximale avec Claude 4.5 et Gemini 2.5 Pro

---

## 📚 Références

- [Kimi2 (OpenRouter)](https://openrouter.ai/moonshotai/kimi-k2-0905)
- [Qwen3 VL (OpenRouter)](https://openrouter.ai/qwen/qwen3-vl-30b-a3b-thinking)
- [DeepSeek Chat](https://platform.deepseek.com/)
- [Claude 4.5 Sonnet (Anthropic)](https://www.anthropic.com/claude)
- [Gemini 2.5 Pro (Google)](https://ai.google.dev/)

---

**Dernière mise à jour** : 28 octobre 2025  
**Auteur** : Assistant Rédactionnel - Configuration IA
