# 🚀 Configuration de Grok pour l'Assistant Rédactionnel

## ❌ Problème Actuel

Grok fonctionne en **mode simulation** car la clé API n'est pas configurée dans le fichier `.env.local`.

---

## ✅ Solution : Configurer la Clé API Grok

### **Étape 1 : Obtenir une Clé API Grok**

1. Allez sur **https://x.ai/** (site officiel de xAI)
2. Créez un compte ou connectez-vous
3. Accédez à la section **API Keys** ou **Developer Console**
4. Créez une nouvelle clé API
5. **Copiez la clé** (elle commence généralement par `xai-`)

---

### **Étape 2 : Ajouter la Clé dans .env.local**

1. Ouvrez le fichier :
   ```
   K:\developpement_app_site_web\assistant_redactionnel\assistant_redacteur\react-app\.env.local
   ```

2. Ajoutez ou modifiez cette ligne :
   ```env
   VITE_GROK_API_KEY=xai-votre_cle_api_ici
   ```

3. **Remplacez** `xai-votre_cle_api_ici` par votre vraie clé API

---

### **Étape 3 : Redémarrer le Serveur**

**IMPORTANT** : Les modifications du fichier `.env.local` nécessitent un redémarrage complet du serveur.

1. **Arrêtez** le serveur actuel (Ctrl+C dans la console ou fermez la fenêtre)
2. **Relancez** avec `lanceur.bat` ou `lanceur2.bat`
3. Attendez que le serveur démarre complètement

---

## 🔍 Vérification

### **Comment Savoir si Grok Fonctionne ?**

1. Allez sur la page **Home** de l'application
2. Sélectionnez **Grok** dans "Sélection de l'IA"
3. Remplissez les champs et cliquez sur **Générer**
4. **Si ça fonctionne** : Vous verrez du contenu généré par Grok
5. **Si mode simulation** : Vous verrez un message "⚠️ Mode simulation" ou "Clé API non configurée"

---

## 📋 Exemple de Fichier .env.local Complet

```env
# OpenAI (GPT-4)
VITE_OPENAI_API_KEY=sk-proj-votre_cle_openai

# Anthropic (Claude)
VITE_CLAUDE_API_KEY=sk-ant-votre_cle_claude

# Google (Gemini)
VITE_GEMINI_API_KEY=votre_cle_gemini

# DeepSeek
VITE_DEEPSEEK_API_KEY=sk-votre_cle_deepseek

# xAI (Grok) ← CETTE LIGNE EST IMPORTANTE
VITE_GROK_API_KEY=xai-votre_cle_grok

# OpenRouter (Kimi)
VITE_OPENROUTER_API_KEY=sk-or-votre_cle_openrouter

# DeepL
VITE_DEEPL_API_KEY=votre_cle_deepl

# ElevenLabs (Audio)
VITE_ELEVENLABS_API_KEY=votre_cle_elevenlabs
```

---

## ⚠️ Points Importants

### **1. Format de la Clé**
- La clé Grok commence généralement par `xai-`
- Ne mettez **PAS** de guillemets autour de la clé
- Ne mettez **PAS** d'espaces avant ou après le `=`

### **2. Sécurité**
- **NE JAMAIS** commiter le fichier `.env.local` sur Git
- Ce fichier est déjà dans `.gitignore` (protégé)
- Ne partagez **JAMAIS** vos clés API

### **3. Redémarrage Obligatoire**
- Vite ne recharge **PAS** automatiquement les variables d'environnement
- Vous **DEVEZ** redémarrer le serveur après modification

---

## 🐛 Dépannage

### **Problème : Toujours en mode simulation après configuration**

**Solutions :**

1. **Vérifiez le format de la clé**
   - Pas d'espaces
   - Pas de guillemets
   - Commence par `xai-`

2. **Vérifiez le nom de la variable**
   - Doit être exactement : `VITE_GROK_API_KEY`
   - Sensible à la casse

3. **Redémarrez complètement**
   - Fermez **toutes** les fenêtres du serveur
   - Relancez `lanceur.bat`

4. **Vérifiez la console du navigateur**
   - Ouvrez les DevTools (F12)
   - Regardez l'onglet Console
   - Cherchez les messages d'erreur Grok

5. **Testez la clé manuellement**
   - Utilisez un outil comme Postman ou curl
   - Endpoint : `https://api.x.ai/v1/chat/completions`
   - Vérifiez que la clé est valide

---

## 📞 Support

Si le problème persiste :

1. Vérifiez que votre clé API Grok est **active** sur le site xAI
2. Vérifiez que vous avez des **crédits** disponibles
3. Consultez la documentation officielle : https://docs.x.ai/

---

## ✅ Checklist Rapide

- [ ] Clé API Grok obtenue sur https://x.ai/
- [ ] Clé ajoutée dans `.env.local` avec le bon format
- [ ] Serveur redémarré complètement
- [ ] Test de génération effectué
- [ ] Pas de message "mode simulation"

---

**Une fois configuré, Grok fonctionnera en mode réel avec l'API officielle xAI !** 🚀
