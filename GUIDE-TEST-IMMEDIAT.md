# ⚡ Guide de Test Immédiat de l'IA

## 🎯 Objectif
Tester l'Assistant Rédacteur avec vos clés API **immédiatement**, sans backend.

---

## 📋 Étapes d'Installation (5 minutes)

### **1. Créer le fichier .env.local**

```bash
# Dans le dossier react-app/
cd react-app
cp .env.local.template .env.local
```

**OU** créez manuellement le fichier `.env.local` dans `react-app/`

---

### **2. Ajouter vos clés API**

Ouvrez `.env.local` et remplacez les valeurs :

```bash
# Exemple avec une vraie clé OpenAI
VITE_OPENAI_API_KEY=sk-proj-abc123xyz789...

# Exemple avec une vraie clé Claude
VITE_ANTHROPIC_API_KEY=sk-ant-api03-xyz123...
```

**⚠️ IMPORTANT** :
- Utilisez vos **vraies clés API**
- Ce fichier est **ignoré par Git** (sécurisé)
- **Ne partagez JAMAIS** ce fichier

---

### **3. Où obtenir les clés API ?**

| Service | URL | Format de clé |
|---------|-----|---------------|
| **OpenAI** | https://platform.openai.com/api-keys | `sk-proj-...` |
| **Anthropic** | https://console.anthropic.com/settings/keys | `sk-ant-api03-...` |
| **Gemini** | https://makersuite.google.com/app/apikey | `AIza...` |
| **DeepSeek** | https://platform.deepseek.com/api_keys | `sk-...` |
| **Grok** | https://console.x.ai/ | `xai-...` |
| **OpenRouter** | https://openrouter.ai/keys | `sk-or-...` |
| **DeepL** | https://www.deepl.com/pro-api | Clé alphanumérique |

---

### **4. Redémarrer le serveur**

```bash
# Arrêter le serveur (Ctrl+C)
# Puis relancer
npm run dev
```

**Le serveur doit redémarrer pour charger les nouvelles variables.**

---

## 🧪 Comment Tester

### **Test 1 : Vérifier que les clés sont chargées**

Ouvrez la **Console du navigateur** (F12) et tapez :

```javascript
console.log(import.meta.env.VITE_OPENAI_API_KEY);
// Devrait afficher : sk-proj-abc123...
```

✅ **Si vous voyez votre clé** : Configuration OK !
❌ **Si vous voyez `undefined`** : Redémarrez le serveur

---

### **Test 2 : Générer du contenu**

1. **Allez sur la page d'accueil** (`http://localhost:3003`)

2. **Remplissez le formulaire** :
   - Titre du projet : "Test IA"
   - Description : "Article sur l'intelligence artificielle"
   - Sélectionnez une IA (ex: GPT-4o)
   - Choisissez une tâche (ex: Rédiger)
   - Choisissez un format (ex: Article de blog)

3. **Cliquez sur "Générer"**

4. **Observez la console** (F12) pour voir les logs

---

### **Test 3 : Vérifier les appels API**

Ouvrez l'onglet **Network** (Réseau) dans les DevTools :

1. Filtrez par "Fetch/XHR"
2. Générez du contenu
3. Vous devriez voir des requêtes vers :
   - `api.openai.com` (si OpenAI)
   - `api.anthropic.com` (si Claude)
   - etc.

✅ **Status 200** : Succès !
❌ **Status 401** : Clé invalide
❌ **Status 429** : Limite de requêtes dépassée

---

## 🔧 Modification du Code (Temporaire)

Pour que l'application utilise les clés d'environnement, voici où les injecter :

### **Exemple : Appel OpenAI**

```javascript
// Dans votre composant de génération
const generateContent = async () => {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [
        { role: 'user', content: 'Écris un article sur l\'IA' }
      ]
    })
  });
  
  const data = await response.json();
  console.log(data.choices[0].message.content);
};
```

---

## 📊 Logs de Debug

Activez les logs détaillés :

```javascript
// En haut de votre fichier
const DEBUG = import.meta.env.VITE_DEBUG === 'true';

// Dans votre code
if (DEBUG) {
  console.log('🔑 Clé API chargée:', apiKey?.substring(0, 10) + '...');
  console.log('📝 Prompt envoyé:', prompt);
  console.log('✅ Réponse reçue:', response);
}
```

---

## ⚠️ Limitations de cette Approche

### **Avantages** :
✅ Test immédiat (5 minutes)
✅ Pas besoin de backend
✅ Validation rapide que tout fonctionne

### **Inconvénients** :
❌ **Clés exposées côté client** (visible dans le code source)
❌ **Pas de sauvegarde persistante** des clés
❌ **Pas sécurisé pour production**
❌ **Limite de requêtes** directement sur votre compte

### **⚠️ À FAIRE APRÈS LES TESTS** :
1. Supprimer les clés du fichier `.env.local`
2. Implémenter le backend sécurisé
3. Ne JAMAIS déployer avec des clés en dur

---

## 🐛 Résolution de Problèmes

### **Problème : "API key not found"**
```bash
# Solution :
1. Vérifier que .env.local existe
2. Vérifier le nom de la variable (VITE_ au début)
3. Redémarrer le serveur
```

### **Problème : "401 Unauthorized"**
```bash
# Solution :
1. Vérifier que la clé est valide
2. Vérifier qu'elle n'a pas expiré
3. Vérifier les permissions de la clé
```

### **Problème : "429 Too Many Requests"**
```bash
# Solution :
1. Attendre quelques minutes
2. Vérifier les limites de votre compte
3. Implémenter un rate limiting
```

### **Problème : "CORS error"**
```bash
# Solution :
1. Certaines API bloquent les requêtes depuis le navigateur
2. Utiliser un proxy backend (Option B ou C)
3. Vérifier la documentation de l'API
```

---

## 📝 Checklist de Test

- [ ] Fichier `.env.local` créé
- [ ] Clés API ajoutées
- [ ] Serveur redémarré
- [ ] Clés visibles dans la console
- [ ] Génération de contenu testée
- [ ] Requêtes API visibles dans Network
- [ ] Réponse de l'IA affichée
- [ ] Logs de debug activés

---

## 🚀 Prochaines Étapes

Une fois les tests validés :

1. **Développer le Prompt Builder** (4-6h)
   - Affiner les règles de génération
   - Optimiser les prompts
   - Tester différents formats

2. **Créer le backend sécurisé** (25-35h)
   - Protéger les clés API
   - Implémenter l'authentification
   - Sauvegarder les configurations

3. **Déployer en production**
   - Backend + Frontend
   - HTTPS/SSL
   - Monitoring

---

## 💡 Astuce Pro

**Créez un fichier de test dédié** :

```javascript
// test-ia.js
const testOpenAI = async () => {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  console.log('🧪 Test OpenAI...');
  
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: 'Dis bonjour' }],
      max_tokens: 50
    })
  });
  
  const data = await response.json();
  console.log('✅ Réponse:', data.choices[0].message.content);
};

testOpenAI();
```

---

**Vous êtes prêt à tester ! 🎉**

**Questions ? Problèmes ? Dites-moi et je vous aide ! 🚀**
