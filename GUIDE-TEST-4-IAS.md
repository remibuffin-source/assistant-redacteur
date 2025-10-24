# 🧪 Guide de Test - 4 Nouvelles IAs

## ✅ **PRÊT À TESTER !**

Les 4 nouvelles IAs sont implémentées et prêtes à être testées avec vos clés.

---

## 🚀 **ÉTAPE 1 : Redémarrer le Serveur**

**IMPORTANT** : Le serveur doit redémarrer pour charger les nouvelles modifications.

```bash
# Arrêtez le serveur actuel (Ctrl+C dans le terminal)
# Puis relancez
cd react-app
npm run dev
```

**OU** utilisez le lanceur :
```bash
# À la racine du projet
lanceur.bat
```

---

## 🔑 **ÉTAPE 2 : Vérifier les Clés**

Ouvrez la console du navigateur (F12) et tapez :

```javascript
console.log('DeepSeek:', import.meta.env.VITE_DEEPSEEK_API_KEY);
console.log('Grok:', import.meta.env.VITE_GROK_API_KEY);
console.log('Kimi:', import.meta.env.VITE_OPENROUTER_API_KEY);
console.log('DeepL:', import.meta.env.VITE_DEEPL_API_KEY);
```

**Résultat attendu** :
```
DeepSeek: sk-abc123...
Grok: xai-xyz789...
Kimi: sk-or-def456...
DeepL: abc123-def456...
```

✅ **Si vous voyez vos clés** : C'est bon !
❌ **Si vous voyez `undefined`** : Redémarrez le serveur

---

## 🧪 **ÉTAPE 3 : Test DeepSeek**

### **Test 1 : Article Technique**

1. Allez sur http://localhost:3003
2. **Sélection de l'IA** : Cliquez sur **DeepSeek**
3. **Titre du projet** : "Guide Technique React"
4. **Description** : "Créer un article sur les hooks React"
5. **Tâche** : Sélectionnez "Rédiger"
6. **Format** : Sélectionnez "Article de blog"
7. Cliquez **"Générer"**

**Résultat attendu** :
- ⏳ Délai de 3-5 secondes
- ✅ Article technique détaillé sur les hooks React
- ✅ Contenu structuré et professionnel
- ✅ Pas de message "simulation"

---

## 🧪 **ÉTAPE 4 : Test Grok**

### **Test 2 : Contenu Créatif**

1. **Sélection de l'IA** : Cliquez sur **Grok**
2. **Titre du projet** : "Histoire Créative"
3. **Description** : "Une histoire sur un robot qui apprend à cuisiner"
4. **Tâche** : Sélectionnez "Développer"
5. **Format** : Sélectionnez "Story Instagram"
6. Cliquez **"Générer"**

**Résultat attendu** :
- ⏳ Délai de 3-5 secondes
- ✅ Histoire créative et engageante
- ✅ Ton conversationnel unique de Grok
- ✅ Format adapté à Instagram

---

## 🧪 **ÉTAPE 5 : Test Kimi2**

### **Test 3 : Contenu Multilingue**

1. **Sélection de l'IA** : Cliquez sur **Kimi2**
2. **Titre du projet** : "Présentation Entreprise"
3. **Description** : "Présenter notre entreprise en français et anglais"
4. **Tâche** : Sélectionnez "Rédiger"
5. **Format** : Sélectionnez "Post LinkedIn"
6. Cliquez **"Générer"**

**Résultat attendu** :
- ⏳ Délai de 3-5 secondes
- ✅ Contenu professionnel
- ✅ Peut inclure des éléments multilingues
- ✅ Format adapté à LinkedIn

---

## 🧪 **ÉTAPE 6 : Test DeepL (Traduction)**

**Note** : DeepL est utilisé automatiquement pour les tâches de traduction.

### **Test 4 : Traduction**

1. **Sélection de l'IA** : N'importe quelle IA
2. **Titre du projet** : "Traduction"
3. **Description** : "Traduire ce texte en anglais"
4. **Zone de texte** : Collez un texte en français
5. **Tâche** : Sélectionnez "Traduire"
6. Cliquez **"Générer"**

**Résultat attendu** :
- ⏳ Délai de 2-3 secondes
- ✅ Traduction professionnelle
- ✅ Qualité DeepL (meilleure que Google Translate)
- ✅ Détection automatique de la langue source

---

## 📊 **ÉTAPE 7 : Vérifier les Logs**

### **Dans la Console (F12)**

Vous devriez voir :

```
🔑 Clé API chargée: sk-...
📝 Prompt envoyé: ...
✅ Réponse reçue: { success: true, content: "...", model: "deepseek-chat" }
```

### **Dans l'onglet Network (F12)**

1. Ouvrez l'onglet **Network**
2. Filtrez par **Fetch/XHR**
3. Générez du contenu
4. Vous devriez voir des requêtes vers :
   - `api.deepseek.com` (DeepSeek)
   - `api.x.ai` (Grok)
   - `openrouter.ai` (Kimi)
   - `api.deepl.com` (DeepL)

**Status attendu** : `200 OK`

---

## 🎯 **ÉTAPE 8 : Comparer les Résultats**

Testez **la même demande** avec différentes IAs :

### **Demande** : "Écris un post Facebook sur les bienfaits du yoga"

| IA | Style attendu | Ton |
|----|---------------|-----|
| **GPT-4** | Structuré, informatif | Professionnel |
| **Claude** | Conversationnel, détaillé | Amical |
| **Gemini** | Équilibré, optimisé | Neutre |
| **DeepSeek** | Technique, précis | Analytique |
| **Grok** | Créatif, engageant | Décontracté |
| **Kimi2** | Multilingue, adaptatif | Flexible |

**Vous devriez voir des différences claires** entre chaque IA !

---

## ✅ **Checklist de Validation**

### **Pour chaque IA testée**

- [ ] Délai de 2-5 secondes (pas instantané)
- [ ] Contenu différent à chaque génération
- [ ] Contenu adapté à la tâche sélectionnée
- [ ] Contenu adapté au format sélectionné
- [ ] Pas de message "simulation" ou "mode simulation"
- [ ] Logs de succès dans la console
- [ ] Requête visible dans Network (F12)
- [ ] Status 200 OK

---

## 🚨 **Problèmes Courants**

### **Problème 1 : "Clé API non configurée"**

**Cause** : Le serveur n'a pas redémarré

**Solution** :
```bash
# Arrêtez le serveur (Ctrl+C)
# Relancez
npm run dev
```

---

### **Problème 2 : "401 Unauthorized"**

**Cause** : Clé API invalide ou expirée

**Solution** :
1. Vérifiez que la clé est correcte
2. Vérifiez qu'elle n'a pas expiré
3. Vérifiez les crédits de votre compte
4. Régénérez une nouvelle clé si nécessaire

---

### **Problème 3 : "429 Too Many Requests"**

**Cause** : Limite de requêtes dépassée

**Solution** :
1. Attendez quelques minutes
2. Vérifiez les limites de votre plan
3. Passez à un plan supérieur si nécessaire

---

### **Problème 4 : Contenu toujours identique**

**Cause** : L'IA utilise encore la simulation

**Solution** :
1. Vérifiez que la clé est chargée (console)
2. Vérifiez le nom de la variable (VITE_DEEPSEEK_API_KEY, etc.)
3. Redémarrez le serveur
4. Videz le cache du navigateur (Ctrl+Shift+R)

---

### **Problème 5 : Erreur CORS**

**Cause** : Certaines APIs bloquent les requêtes depuis le navigateur

**Solution** :
1. Vérifiez la documentation de l'API
2. Utilisez un proxy backend si nécessaire
3. Contactez le support de l'API

---

## 📝 **Rapport de Test**

Après vos tests, notez :

### **DeepSeek**
- ✅ Fonctionne : Oui / Non
- ⏱️ Temps de réponse : ___ secondes
- 📊 Qualité du contenu : ⭐⭐⭐⭐⭐
- 💬 Commentaires : ___

### **Grok**
- ✅ Fonctionne : Oui / Non
- ⏱️ Temps de réponse : ___ secondes
- 📊 Qualité du contenu : ⭐⭐⭐⭐⭐
- 💬 Commentaires : ___

### **Kimi2**
- ✅ Fonctionne : Oui / Non
- ⏱️ Temps de réponse : ___ secondes
- 📊 Qualité du contenu : ⭐⭐⭐⭐⭐
- 💬 Commentaires : ___

### **DeepL**
- ✅ Fonctionne : Oui / Non
- ⏱️ Temps de réponse : ___ secondes
- 📊 Qualité de la traduction : ⭐⭐⭐⭐⭐
- 💬 Commentaires : ___

---

## 🎉 **Félicitations !**

Si tous les tests passent, vous avez maintenant **7 IAs fonctionnelles** :

1. ✅ GPT-4 (OpenAI)
2. ✅ Claude (Anthropic)
3. ✅ Gemini (Google)
4. ✅ **DeepSeek** (Nouveau !)
5. ✅ **Grok** (Nouveau !)
6. ✅ **Kimi2** (Nouveau !)
7. ✅ **DeepL** (Nouveau !)

---

## 🚀 **Prochaines Étapes**

1. **Optimiser les prompts** pour chaque IA
2. **Développer le Prompt Builder** pour personnaliser les règles
3. **Créer le backend sécurisé** pour la production
4. **Tester les modes d'acquisition** (audio, image, etc.)

---

**Bon test ! 🎯**
