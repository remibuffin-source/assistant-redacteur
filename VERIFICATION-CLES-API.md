# 🔑 Vérification des Clés API - Assistant Rédactionnel

## 📊 État des Clés API

Utilisez ce guide pour vérifier quelles IAs sont configurées et lesquelles sont en mode simulation.

---

## ✅ Comment Vérifier ?

### **Méthode 1 : Via l'Interface**

1. Allez sur **Mon Compte** → **Configuration API**
2. Regardez les champs :
   - ✅ **Rempli** = Clé configurée
   - ❌ **Vide** ou "votre_cle_api_ici" = Mode simulation

### **Méthode 2 : Via le Fichier .env.local**

Ouvrez le fichier :
```
K:\developpement_app_site_web\assistant_redactionnel\assistant_redacteur\react-app\.env.local
```

Vérifiez que chaque ligne contient une vraie clé (pas "votre_cle_api_ici").

---

## 📋 Liste des IAs et Leurs Clés

### **1. OpenAI (GPT-4, GPT-4o, GPT-4o-mini)**
```env
VITE_OPENAI_API_KEY=sk-proj-...
```
- **Site** : https://platform.openai.com/api-keys
- **Format** : Commence par `sk-proj-` ou `sk-`
- **Longueur** : ~51 caractères

---

### **2. Anthropic (Claude 3 Opus, Sonnet, Haiku)**
```env
VITE_CLAUDE_API_KEY=sk-ant-...
```
- **Site** : https://console.anthropic.com/settings/keys
- **Format** : Commence par `sk-ant-`
- **Longueur** : ~108 caractères

---

### **3. Google (Gemini Pro)**
```env
VITE_GEMINI_API_KEY=AIza...
```
- **Site** : https://makersuite.google.com/app/apikey
- **Format** : Commence par `AIza`
- **Longueur** : ~39 caractères

---

### **4. DeepSeek (Chat, Coder)**
```env
VITE_DEEPSEEK_API_KEY=sk-...
```
- **Site** : https://platform.deepseek.com/api_keys
- **Format** : Commence par `sk-`
- **Longueur** : Variable

---

### **5. xAI (Grok, Grok-2)** ⚠️ **PROBLÈME ACTUEL**
```env
VITE_GROK_API_KEY=xai-...
```
- **Site** : https://x.ai/ ou https://console.x.ai/
- **Format** : Commence par `xai-`
- **Longueur** : Variable
- **⚠️ IMPORTANT** : C'est cette clé qui manque actuellement !

---

### **6. OpenRouter (Kimi2)**
```env
VITE_OPENROUTER_API_KEY=sk-or-...
```
- **Site** : https://openrouter.ai/keys
- **Format** : Commence par `sk-or-`
- **Longueur** : Variable

---

### **7. DeepL (Traduction)**
```env
VITE_DEEPL_API_KEY=...
```
- **Site** : https://www.deepl.com/pro-api
- **Format** : Chaîne alphanumérique
- **Longueur** : ~39 caractères
- **Note** : Nécessite un compte DeepL API (gratuit jusqu'à 500k caractères/mois)

---

### **8. ElevenLabs (Audio)** *(Optionnel)*
```env
VITE_ELEVENLABS_API_KEY=...
```
- **Site** : https://elevenlabs.io/
- **Format** : Chaîne alphanumérique
- **Longueur** : Variable

---

## 🔍 Diagnostic Rapide

### **Symptômes du Mode Simulation**

Quand vous générez du contenu :

✅ **Mode Réel (API fonctionnelle)** :
- Génération prend quelques secondes
- Contenu unique et pertinent
- Pas de message d'avertissement

❌ **Mode Simulation (Pas de clé API)** :
- Message "⚠️ Mode simulation"
- Message "Clé API non configurée"
- Contenu générique/exemple
- Génération instantanée

---

## 🛠️ Procédure de Configuration

### **Pour Chaque IA :**

1. **Obtenir la clé** sur le site officiel
2. **Copier** la clé complète
3. **Ouvrir** `.env.local`
4. **Coller** la clé après le `=`
5. **Sauvegarder** le fichier
6. **Redémarrer** le serveur (OBLIGATOIRE)

### **Exemple Avant/Après**

**❌ Avant (Mode Simulation)** :
```env
VITE_GROK_API_KEY=votre_cle_api_ici
```

**✅ Après (Mode Réel)** :
```env
VITE_GROK_API_KEY=xai-abc123def456ghi789jkl012mno345pqr678stu901
```

---

## 📊 Tableau de Vérification

Cochez les IAs que vous avez configurées :

| IA | Clé Configurée | Testée | Fonctionne |
|----|----------------|--------|------------|
| ☐ OpenAI (GPT-4) | ☐ | ☐ | ☐ |
| ☐ Claude | ☐ | ☐ | ☐ |
| ☐ Gemini | ☐ | ☐ | ☐ |
| ☐ DeepSeek | ☐ | ☐ | ☐ |
| ☐ **Grok** | ☐ | ☐ | ☐ |
| ☐ Kimi (OpenRouter) | ☐ | ☐ | ☐ |
| ☐ DeepL | ☐ | ☐ | ☐ |
| ☐ ElevenLabs | ☐ | ☐ | ☐ |

---

## 🎯 Priorités de Configuration

### **Niveau 1 : Essentielles** (Génération de texte)
1. **OpenAI** (GPT-4) - La plus polyvalente
2. **Claude** - Excellente pour le contenu long
3. **Gemini** - Gratuite avec quota généreux

### **Niveau 2 : Spécialisées**
4. **DeepSeek** - Bonne pour le code
5. **Grok** - Nouveau, performant
6. **Kimi** - Bonne mémoire contextuelle

### **Niveau 3 : Utilitaires**
7. **DeepL** - Traduction professionnelle
8. **ElevenLabs** - Synthèse vocale

---

## 💡 Conseils

### **Économiser les Crédits**

1. **Commencez avec les IAs gratuites** :
   - Gemini : Gratuit avec quota généreux
   - DeepSeek : Très abordable

2. **Utilisez les modèles légers** :
   - GPT-4o-mini au lieu de GPT-4
   - Claude Haiku au lieu d'Opus

3. **Testez d'abord en simulation** :
   - Vérifiez que tout fonctionne
   - Configurez les vraies clés ensuite

### **Sécurité**

- ✅ Gardez `.env.local` privé
- ✅ Ne partagez jamais vos clés
- ✅ Régénérez les clés si compromises
- ✅ Surveillez votre usage sur les dashboards

---

## 🚨 Problèmes Courants

### **"Clé API non configurée"**
→ La clé n'est pas dans `.env.local` ou vaut "votre_cle_api_ici"

### **"Erreur 401 Unauthorized"**
→ La clé est invalide ou expirée

### **"Erreur 429 Rate Limit"**
→ Trop de requêtes, attendez ou augmentez votre quota

### **"Erreur 402 Payment Required"**
→ Crédits épuisés, rechargez votre compte

### **Toujours en simulation après configuration**
→ Redémarrez le serveur complètement

---

## 📞 Ressources

- **Documentation OpenAI** : https://platform.openai.com/docs
- **Documentation Claude** : https://docs.anthropic.com/
- **Documentation Gemini** : https://ai.google.dev/docs
- **Documentation Grok** : https://docs.x.ai/
- **Support Assistant Rédactionnel** : Voir README.md

---

**Bon développement ! 🚀**
