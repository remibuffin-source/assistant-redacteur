# 🤖 Configuration IA par Type de Média

## Vue d'ensemble

Cette fonctionnalité permet de **sélectionner une IA spécifique pour chaque type de média** dans la Zone de Collecte. Chaque type de contenu (texte, audio, image, tableur, web) peut être traité par l'IA la plus adaptée.

---

## 📋 Types de Médias Configurables

### 1. 📝 Texte
**Formats supportés :** `.txt`, `.md`, `.pdf`, `.docx`, `.odt`, `.epub`

**IA disponibles :**
- ⚡ **GPT-4o Mini** - $0.15/1M tokens (Recommandé pour documents simples)
- 🚀 **GPT-4o** - $5.00/1M tokens (Documents complexes)
- 🎯 **Claude 3.5 Sonnet** - $3.00/1M tokens (Meilleure compréhension)
- 💎 **Claude 3 Opus** - $15.00/1M tokens (Qualité maximale)
- ✨ **Gemini Pro** - $0.50/1M tokens (Bon rapport qualité/prix)

**Par défaut :** GPT-4o Mini

---

### 2. 🎵 Audio
**Formats supportés :** `.wav`, `.mp3`, `.aac`, `.aiff`, `.flac`

**IA disponibles :**
- 🎤 **Whisper Large v3** - $0.006/min (Spécialisé transcription)

**Par défaut :** Whisper Large v3

**Note :** Whisper est l'IA de référence pour la transcription audio, avec support multilingue et excellente précision.

---

### 3. 🖼️ Image
**Formats supportés :** `.jpg`, `.jpeg`, `.png`, `.gif`

**IA disponibles :**
- 👁️ **GPT-4o Vision** - $5.00/1M tokens (OCR + compréhension)
- 🎯 **Claude 3.5 Sonnet** - $3.00/1M tokens (Vision + analyse)
- ✨ **Gemini Pro** - $0.50/1M tokens (Vision économique)

**Par défaut :** GPT-4o Vision

**Cas d'usage :**
- Extraction de texte (OCR)
- Analyse de graphiques/diagrammes
- Description d'images
- Extraction de données visuelles

---

### 4. 📊 Tableur
**Formats supportés :** `.xlsx`, `.xls`, `.csv`

**IA disponibles :**
- 🚀 **GPT-4o** - $5.00/1M tokens (Analyse données)
- 🎯 **Claude 3.5 Sonnet** - $3.00/1M tokens (Compréhension structure)
- ⚡ **GPT-4o Mini** - $0.15/1M tokens (Tableaux simples)

**Par défaut :** GPT-4o

**Cas d'usage :**
- Résumé de données
- Analyse de tendances
- Extraction d'insights
- Conversion en texte narratif

---

### 5. 🌐 Site Web
**Formats supportés :** URL (extraction de contenu)

**IA disponibles :**
- 🎯 **Claude 3.5 Sonnet** - $3.00/1M tokens (Meilleure extraction)
- 🚀 **GPT-4o** - $5.00/1M tokens (Compréhension contexte)
- ⚡ **GPT-4o Mini** - $0.15/1M tokens (Pages simples)

**Par défaut :** Claude 3.5 Sonnet

**Cas d'usage :**
- Extraction d'articles
- Résumé de pages web
- Analyse de contenu
- Veille concurrentielle

---

## 🎯 Comment Utiliser

### 1. Accéder à la Configuration
Dans la **Zone de Collecte**, sous les boutons d'action, vous trouverez le panneau **"Configuration IA par Type de Média"**.

### 2. Sélectionner une IA
Pour chaque type de média, utilisez le **menu déroulant** pour choisir l'IA souhaitée.

Chaque option affiche :
- 🤖 **Nom de l'IA**
- 💰 **Coût par million de tokens**
- ⚡ **Vitesse de traitement**
- ✨ **Qualité**

### 3. Voir les Informations
Sous chaque sélecteur, vous verrez :
- **Fournisseur** (OpenAI, Anthropic, Google)
- **Vitesse** (Très rapide, Rapide, Moyen)

### 4. Résumé de Configuration
En bas du panneau, un **résumé** affiche votre configuration actuelle avec toutes les IA sélectionnées.

### 5. Réinitialiser
Cliquez sur **"Réinitialiser"** pour revenir aux paramètres par défaut recommandés.

---

## 💡 Recommandations d'Usage

### Scénario 1 : Budget Limité
**Objectif :** Minimiser les coûts

```
📝 Texte      → GPT-4o Mini ($0.15)
🎵 Audio      → Whisper Large v3 ($0.006/min)
🖼️ Image      → Gemini Pro ($0.50)
📊 Tableur    → GPT-4o Mini ($0.15)
🌐 Site Web   → GPT-4o Mini ($0.15)

💰 Économie : ~85% vs configuration premium
```

### Scénario 2 : Qualité Maximale
**Objectif :** Meilleurs résultats possibles

```
📝 Texte      → Claude 3 Opus ($15.00)
🎵 Audio      → Whisper Large v3 ($0.006/min)
🖼️ Image      → GPT-4o Vision ($5.00)
📊 Tableur    → GPT-4o ($5.00)
🌐 Site Web   → Claude 3.5 Sonnet ($3.00)

✨ Qualité : Exceptionnelle sur tous types
```

### Scénario 3 : Équilibré (Recommandé)
**Objectif :** Bon rapport qualité/prix

```
📝 Texte      → GPT-4o Mini ($0.15)
🎵 Audio      → Whisper Large v3 ($0.006/min)
🖼️ Image      → GPT-4o Vision ($5.00)
📊 Tableur    → Claude 3.5 Sonnet ($3.00)
🌐 Site Web   → Claude 3.5 Sonnet ($3.00)

⚖️ Balance : Qualité excellente, coûts maîtrisés
```

### Scénario 4 : Spécialisé Documents
**Objectif :** Traitement intensif de documents

```
📝 Texte      → Claude 3.5 Sonnet ($3.00)
🎵 Audio      → Whisper Large v3 ($0.006/min)
🖼️ Image      → Claude 3.5 Sonnet ($3.00)
📊 Tableur    → GPT-4o ($5.00)
🌐 Site Web   → Claude 3.5 Sonnet ($3.00)

📄 Focus : Claude pour meilleure compréhension
```

---

## 🔧 Fonctionnement Technique

### Détection Automatique du Type
Quand vous joignez un fichier, l'application détecte automatiquement son type :

```javascript
// Exemple de détection
.txt, .md, .pdf, .docx, .odt, .epub → Type: Texte
.wav, .mp3, .aac, .aiff, .flac      → Type: Audio
.jpg, .jpeg, .png, .gif             → Type: Image
.xlsx, .xls, .csv                   → Type: Tableur
URL                                  → Type: Web
```

### Routage vers l'IA Appropriée
L'application utilise automatiquement l'IA que vous avez configurée pour ce type :

```javascript
// Pseudo-code
if (fileType === 'audio') {
  useAI = aiConfig.audio; // Ex: whisper-large-v3
}
if (fileType === 'text') {
  useAI = aiConfig.text; // Ex: gpt-4o-mini
}
```

### Sauvegarde de la Configuration
Votre configuration est **sauvegardée localement** et restaurée à chaque session.

---

## 📊 Comparaison des IA

### Par Coût (du moins cher au plus cher)
1. 🎤 Whisper Large v3 - $0.006/min
2. ⚡ GPT-4o Mini - $0.15/1M tokens
3. ✨ Gemini Pro - $0.50/1M tokens
4. 🎯 Claude 3.5 Sonnet - $3.00/1M tokens
5. 🚀 GPT-4o / 👁️ GPT-4o Vision - $5.00/1M tokens
6. 💎 Claude 3 Opus - $15.00/1M tokens

### Par Vitesse
**Très rapide :** GPT-4o Mini, Whisper, Gemini Pro
**Rapide :** GPT-4o, Claude 3.5 Sonnet, GPT-4o Vision
**Moyen :** Claude 3 Opus

### Par Qualité
**Bonne :** GPT-4o Mini
**Très bonne :** Gemini Pro
**Excellente :** GPT-4o, Claude 3.5 Sonnet, Whisper, GPT-4o Vision
**Exceptionnelle :** Claude 3 Opus

---

## 🎨 Interface Utilisateur

### Disposition
Le panneau de configuration s'affiche sous les boutons d'action de la Zone de Collecte.

### Grille Responsive
Les 5 sélecteurs s'adaptent automatiquement à la largeur de l'écran :
- **Desktop :** 3 colonnes
- **Tablet :** 2 colonnes
- **Mobile :** 1 colonne

### Feedback Visuel
- **Survol :** Mise en évidence du sélecteur
- **Focus :** Bordure orange lors de la sélection
- **Changement :** Mise à jour instantanée du résumé

---

## 🔮 Évolutions Futures

### Phase 1 (Actuelle)
✅ Sélection manuelle d'IA par type de média
✅ Configuration sauvegardée localement
✅ Résumé de configuration

### Phase 2 (À venir)
🔨 Détection automatique de complexité
🔨 Suggestion d'IA optimale
🔨 Estimation de coût avant traitement

### Phase 3 (Future)
🔨 Profils prédéfinis (Budget, Qualité, Équilibré)
🔨 Analytics d'utilisation et coûts
🔨 Optimisation automatique basée sur historique

---

## 📞 Support

Pour toute question sur la configuration IA :
- 📧 Email : support@studioducapbrun.com
- 🌐 Site : www.studioducapbrun.com
- 📚 Documentation : [Lien vers docs]

---

## 🎯 Résumé

**Avantages :**
- ✅ Contrôle total sur l'IA utilisée
- ✅ Optimisation des coûts
- ✅ Qualité adaptée au besoin
- ✅ Flexibilité maximale

**Configuration par défaut recommandée :**
- 📝 Texte → GPT-4o Mini (économique)
- 🎵 Audio → Whisper Large v3 (spécialisé)
- 🖼️ Image → GPT-4o Vision (meilleur OCR)
- 📊 Tableur → GPT-4o (analyse données)
- 🌐 Web → Claude 3.5 Sonnet (extraction)

**Cette configuration offre le meilleur rapport qualité/prix pour la majorité des cas d'usage !** 🚀
