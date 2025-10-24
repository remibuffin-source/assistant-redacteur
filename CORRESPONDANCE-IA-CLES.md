# 🔑 Correspondance Interface ↔ Clés API

## 📊 **Tableau de Correspondance Complet**

| **Interface Home** | **ID dans le code** | **Variable .env.local** | **Clé API requise** |
|----------------|-----------------|---------------------|-----------------|
| **Claude** | `claude` | `VITE_CLAUDE_API_KEY` | ✅ Anthropic Claude |
| **GPT-4** | `gpt4` | `VITE_OPENAI_API_KEY` | ✅ OpenAI |
| **Gemini** | `gemini` | `VITE_GEMINI_API_KEY` | ✅ Google Gemini |
| **Deepseek** | `deepseek` | `VITE_DEEPSEEK_API_KEY` | ✅ DeepSeek (IMPLÉMENTÉ) |
| **Grok** | `grok` | `VITE_GROK_API_KEY` | ✅ xAI Grok (IMPLÉMENTÉ) |
| **Kimi2** | `kimi2` | `VITE_OPENROUTER_API_KEY` | ✅ OpenRouter (IMPLÉMENTÉ) |
| **ElevenLabs** | `elevenlabs` | `VITE_ELEVENLABS_API_KEY` | ⚠️ ElevenLabs (non implémenté) |
| **Personnalisé** | `custom` | - | ❌ Aucune clé |

---

## ✅ **IAs Fonctionnelles (Implémentées)**

### **1. Claude** 
```bash
# Dans .env.local
VITE_CLAUDE_API_KEY=sk-ant-votre-cle-ici
```
- **ID** : `claude`
- **Modèle** : `claude-3-sonnet-20240229`
- **Fichier** : `aiService.js` ligne 302-365
- **Statut** : ✅ Fonctionnel

---

### **2. GPT-4**
```bash
# Dans .env.local
VITE_OPENAI_API_KEY=sk-proj-votre-cle-ici
```
- **ID** : `gpt4`
- **Modèle** : `gpt-4` ou `gpt-4o`
- **Fichier** : `aiService.js` ligne 222-297
- **Statut** : ✅ Fonctionnel

---

### **3. Gemini**
```bash
# Dans .env.local
VITE_GEMINI_API_KEY=AIza-votre-cle-ici
```
- **ID** : `gemini`
- **Modèle** : `gemini-pro`
- **Fichier** : `aiService.js` ligne 370-435
- **Statut** : ✅ Fonctionnel

---

## ⚠️ **IAs Non Implémentées (Simulation uniquement)**

Ces IAs apparaissent dans l'interface mais **ne font pas d'appels API réels** :

### **4. Deepseek**
- **ID** : `deepseek`
- **Variable** : `VITE_DEEPSEEK_API_KEY`
- **Statut** : ⚠️ Simulation uniquement
- **À faire** : Implémenter `callDeepSeekAPI()`

### **5. Grok**
- **ID** : `grok`
- **Variable** : `VITE_GROK_API_KEY`
- **Statut** : ⚠️ Simulation uniquement
- **À faire** : Implémenter `callGrokAPI()`

### **6. Kimi2**
- **ID** : `kimi2`
- **Variable** : `VITE_OPENROUTER_API_KEY`
- **Statut** : ⚠️ Simulation uniquement
- **À faire** : Implémenter `callOpenRouterAPI()`

### **7. ElevenLabs**
- **ID** : `elevenlabs`
- **Variable** : `VITE_ELEVENLABS_API_KEY`
- **Statut** : ⚠️ Simulation uniquement (synthèse vocale)
- **À faire** : Implémenter API vocale

### **8. Personnalisé**
- **ID** : `custom`
- **Statut** : ❌ Aucune implémentation
- **Usage** : Configuration manuelle

---

## 🔍 **Comment Vérifier dans le Code**

### **Fichier** : `src/services/aiService.js`

#### **Ligne 27-47 : Vérification des clés**
```javascript
static checkAPIAvailability(aiType) {
  const apiKeys = {
    gpt4: import.meta.env.VITE_OPENAI_API_KEY,        // ← GPT-4
    'gpt-4': import.meta.env.VITE_OPENAI_API_KEY,
    'gpt-4o': import.meta.env.VITE_OPENAI_API_KEY,
    claude: import.meta.env.VITE_CLAUDE_API_KEY,      // ← Claude
    'claude-3-opus': import.meta.env.VITE_CLAUDE_API_KEY,
    'claude-3-sonnet': import.meta.env.VITE_CLAUDE_API_KEY,
    gemini: import.meta.env.VITE_GEMINI_API_KEY,      // ← Gemini
    'gemini-pro': import.meta.env.VITE_GEMINI_API_KEY
  };
  
  const key = apiKeys[aiType];
  return key && key !== 'votre_cle_api_ici' && key.length > 10;
}
```

**⚠️ ATTENTION** : Seuls `gpt4`, `claude` et `gemini` sont dans cette liste !

---

## 🧪 **Test de Correspondance**

### **Dans la console du navigateur (F12)** :

```javascript
// Vérifier quelle IA est sélectionnée
console.log('IA sélectionnée:', selectedAI);

// Vérifier si la clé existe
const checkKey = (aiType) => {
  const keys = {
    'claude': import.meta.env.VITE_CLAUDE_API_KEY,
    'gpt4': import.meta.env.VITE_OPENAI_API_KEY,
    'gemini': import.meta.env.VITE_GEMINI_API_KEY
  };
  console.log(`${aiType}:`, keys[aiType] ? '✅ Configurée' : '❌ Manquante');
};

checkKey('claude');
checkKey('gpt4');
checkKey('gemini');
```

---

## 📋 **Configuration Minimale pour Tests**

Pour tester **immédiatement** avec les 3 IAs fonctionnelles :

```bash
# .env.local
VITE_OPENAI_API_KEY=sk-proj-abc123...
VITE_CLAUDE_API_KEY=sk-ant-xyz789...
VITE_GEMINI_API_KEY=AIza-def456...
```

**Résultat** :
- ✅ **Claude** → Appel API réel
- ✅ **GPT-4** → Appel API réel
- ✅ **Gemini** → Appel API réel
- ⚠️ **Deepseek** → Simulation
- ⚠️ **Grok** → Simulation
- ⚠️ **Kimi2** → Simulation
- ⚠️ **ElevenLabs** → Simulation
- ❌ **Personnalisé** → Rien

---

## 🚨 **Problème Actuel**

Si vous sélectionnez **Deepseek**, **Grok**, **Kimi2** ou **ElevenLabs** :

1. Le code ne trouve **pas de clé** (ligne 42)
2. Il passe en **mode simulation** (ligne 19)
3. Vous obtenez un **contenu générique** (ligne 140-219)

**C'est normal !** Ces IAs ne sont pas encore implémentées.

---

## ✅ **Solution Temporaire**

**Utilisez uniquement** :
- 🟢 **Claude** (fonctionne)
- 🟢 **GPT-4** (fonctionne)
- 🟢 **Gemini** (fonctionne)

**Évitez** :
- 🟡 Deepseek (simulation)
- 🟡 Grok (simulation)
- 🟡 Kimi2 (simulation)
- 🟡 ElevenLabs (simulation)

---

## 🔧 **Pour Implémenter les Autres IAs**

Il faudrait ajouter dans `aiService.js` :

```javascript
// Ligne 64-84 : Ajouter les nouveaux cas
} else if (aiType.includes('deepseek')) {
  return await this.callDeepSeekAPI(promptData.userPrompt, {...});
} else if (aiType.includes('grok')) {
  return await this.callGrokAPI(promptData.userPrompt, {...});
} else if (aiType.includes('kimi')) {
  return await this.callOpenRouterAPI(promptData.userPrompt, {...});
}
```

Puis créer les méthodes correspondantes.

---

## 📊 **Résumé Visuel**

```
Interface Home          Code aiService.js       .env.local
─────────────────────────────────────────────────────────────
[Claude]         →      id: 'claude'     →      VITE_CLAUDE_API_KEY
[GPT-4]          →      id: 'gpt4'       →      VITE_OPENAI_API_KEY
[Gemini]         →      id: 'gemini'     →      VITE_GEMINI_API_KEY
[Deepseek]       →      id: 'deepseek'   →      ⚠️ Non implémenté
[Grok]           →      id: 'grok'       →      ⚠️ Non implémenté
[Kimi2]          →      id: 'kimi2'      →      ⚠️ Non implémenté
[ElevenLabs]     →      id: 'elevenlabs' →      ⚠️ Non implémenté
[Personnalisé]   →      id: 'custom'     →      ❌ Aucune clé
```

---

**Maintenant vous savez exactement quelle IA utilise quelle clé ! 🎯**
