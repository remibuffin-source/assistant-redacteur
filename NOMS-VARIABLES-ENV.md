# 📝 Noms Corrects des Variables d'Environnement

## ⚠️ IMPORTANT - Utilisez ces noms EXACTS dans .env.local

---

## ✅ **Variables Correctes**

```bash
# OpenAI (GPT-4, GPT-4o, GPT-4o Mini, Whisper, GPT Vision)
VITE_OPENAI_API_KEY=sk-proj-votre-cle-ici

# Anthropic Claude (Claude 3.5 Sonnet, Claude 3 Haiku)
VITE_CLAUDE_API_KEY=sk-ant-votre-cle-ici

# Google Gemini (Gemini 2.0 Flash, Gemini Pro)
VITE_GEMINI_API_KEY=AIza-votre-cle-ici

# DeepSeek (DeepSeek Chat, DeepSeek V3)
VITE_DEEPSEEK_API_KEY=sk-votre-cle-ici

# xAI Grok (Grok, Grok 2)
VITE_GROK_API_KEY=xai-votre-cle-ici

# OpenRouter (pour Kimi et autres modèles)
VITE_OPENROUTER_API_KEY=sk-or-votre-cle-ici

# DeepL (Traduction)
VITE_DEEPL_API_KEY=votre-cle-ici
```

---

## 🔍 **Correspondance Code ↔ Variables**

| Service | Variable .env.local | Utilisé dans le code |
|---------|---------------------|----------------------|
| OpenAI GPT-4 | `VITE_OPENAI_API_KEY` | ✅ `import.meta.env.VITE_OPENAI_API_KEY` |
| Claude | `VITE_CLAUDE_API_KEY` | ✅ `import.meta.env.VITE_CLAUDE_API_KEY` |
| Gemini | `VITE_GEMINI_API_KEY` | ✅ `import.meta.env.VITE_GEMINI_API_KEY` |

---

## ❌ **Erreurs Courantes**

### **NE PAS utiliser** :
```bash
# ❌ INCORRECT
VITE_ANTHROPIC_API_KEY=...  # Le code cherche VITE_CLAUDE_API_KEY
VITE_GPT4_API_KEY=...       # Le code cherche VITE_OPENAI_API_KEY
VITE_GOOGLE_API_KEY=...     # Le code cherche VITE_GEMINI_API_KEY
```

### **✅ CORRECT** :
```bash
# ✅ CORRECT
VITE_CLAUDE_API_KEY=...     # Pour Anthropic Claude
VITE_OPENAI_API_KEY=...     # Pour OpenAI GPT
VITE_GEMINI_API_KEY=...     # Pour Google Gemini
```

---

## 🧪 **Vérifier que les clés sont chargées**

Après avoir créé `.env.local` et redémarré le serveur :

```javascript
// Dans la console du navigateur (F12)
console.log('OpenAI:', import.meta.env.VITE_OPENAI_API_KEY);
console.log('Claude:', import.meta.env.VITE_CLAUDE_API_KEY);
console.log('Gemini:', import.meta.env.VITE_GEMINI_API_KEY);
```

**Résultat attendu** :
```
OpenAI: sk-proj-abc123...
Claude: sk-ant-xyz789...
Gemini: AIza-def456...
```

**Si vous voyez `undefined`** :
1. Vérifiez le nom de la variable (doit être EXACT)
2. Redémarrez le serveur (`Ctrl+C` puis `npm run dev`)
3. Videz le cache du navigateur (`Ctrl+Shift+R`)

---

## 📋 **Checklist de Configuration**

- [ ] Fichier `.env.local` créé dans `react-app/`
- [ ] Variables nommées EXACTEMENT comme ci-dessus
- [ ] Clés API valides ajoutées
- [ ] Serveur redémarré
- [ ] Clés visibles dans la console
- [ ] Test de génération effectué

---

## 🔧 **Exemple Complet de .env.local**

```bash
# ⚡ CONFIGURATION TEST IMMÉDIAT - DÉVELOPPEMENT UNIQUEMENT
# ⚠️ NE JAMAIS COMMITER CE FICHIER AVEC VOS VRAIES CLÉS !

# OpenAI (GPT-4o, GPT-4o Mini, Whisper, GPT Vision)
VITE_OPENAI_API_KEY=sk-proj-abc123def456ghi789jkl012mno345pqr678stu901vwx234yz

# Anthropic Claude (Claude 3.5 Sonnet, Claude 3 Haiku)
VITE_CLAUDE_API_KEY=sk-ant-api03-xyz789abc123def456ghi789jkl012mno345pqr678

# Google Gemini (Gemini 2.0 Flash, Gemini Pro)
VITE_GEMINI_API_KEY=AIzaSyAbc123Def456Ghi789Jkl012Mno345Pqr678Stu

# Mode debug (affiche les logs dans la console)
VITE_DEBUG=true
```

---

## 🚨 **Si ça ne fonctionne toujours pas**

### **1. Vérifier dans le code**

Le fichier `src/services/aiService.js` ligne 29-40 définit les clés :

```javascript
const apiKeys = {
  gpt4: import.meta.env.VITE_OPENAI_API_KEY,
  'gpt-4': import.meta.env.VITE_OPENAI_API_KEY,
  'gpt-4o': import.meta.env.VITE_OPENAI_API_KEY,
  claude: import.meta.env.VITE_CLAUDE_API_KEY,
  gemini: import.meta.env.VITE_GEMINI_API_KEY
};
```

### **2. Vérifier que la clé est valide**

```javascript
// Dans la console
const key = import.meta.env.VITE_OPENAI_API_KEY;
console.log('Longueur:', key?.length);  // Doit être > 10
console.log('Commence par sk-:', key?.startsWith('sk-'));  // Doit être true
```

### **3. Activer les logs de debug**

Dans `.env.local`, ajoutez :
```bash
VITE_DEBUG=true
```

Puis dans la console, vous verrez les logs détaillés.

---

**Avec ces noms corrects, l'IA devrait fonctionner ! 🚀**
