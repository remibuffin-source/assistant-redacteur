# Guide d'Implémentation des Traductions - Page Home

## ✅ FICHIER DE TRADUCTIONS CRÉÉ

**Fichier** : `react-app/src/i18n/homeTranslations.js`
- ✅ Traductions complètes en FR, EN, ES, DE
- ✅ Fonction helper `getHomeText(language, path)`
- ✅ Structure organisée par sections

---

## 📋 COMPOSANTS À MODIFIER

### 1. ✅ MenuBar.jsx - DÉJÀ MODIFIÉ
**Titre "Assistant Rédactionnel"** traduit
```javascript
import { getHomeText } from '../i18n/homeTranslations';
const home = (path) => getHomeText(userLanguage, path);
<h1>{home('appTitle')}</h1>
```

### 2. ProjectInfoSimple.jsx
**À modifier** : Titres et labels des champs

**Imports à ajouter** :
```javascript
import { useAssistantAutoSave } from '../hooks/useLocalStorage';
import { getHomeText } from '../i18n/homeTranslations';
```

**Dans le composant** :
```javascript
const { autoSaveData } = useAssistantAutoSave();
const userLanguage = autoSaveData.language || 'fr';
const t = (path) => getHomeText(userLanguage, path);
```

**Remplacements** :
- `"Informations du Projet"` → `{t('sections.projectInfo.title')}`
- `"Titre du projet"` → `{t('sections.projectInfo.fields.projectTitle')}`
- `"Nom de votre projet"` → `{t('sections.projectInfo.fields.projectTitlePlaceholder')}`
- `"Public cible"` → `{t('sections.projectInfo.fields.targetAudience')}`
- `"Votre audience"` → `{t('sections.projectInfo.fields.targetAudiencePlaceholder')}`
- `"Ton souhaité"` → `{t('sections.projectInfo.fields.tone')}`
- `"Style de rédaction"` → `{t('sections.projectInfo.fields.tonePlaceholder')}`
- `"Description du projet"` → `{t('sections.projectInfo.fields.description')}`
- `"Décrivez votre projet en détail..."` → `{t('sections.projectInfo.fields.descriptionPlaceholder')}`
- Tooltip targetAudience → `{t('sections.projectInfo.fields.targetAudienceTooltip')}`
- Tooltip tone → `{t('sections.projectInfo.fields.toneTooltip')}`

### 3. UploadArea.jsx
**À modifier** : Titre, placeholder, boutons, tooltips

**Imports à ajouter** :
```javascript
import { useAssistantAutoSave } from '../hooks/useLocalStorage';
import { getHomeText } from '../i18n/homeTranslations';
```

**Remplacements** :
- `"Zone de Collecte"` → `{t('sections.uploadArea.title')}`
- Placeholder textarea → `{t('sections.uploadArea.placeholder')}`
- `"Dictée vocale"` → `{t('sections.uploadArea.buttons.dictation')}`
- `"Enregistrement audio"` → `{t('sections.uploadArea.buttons.recording')}`
- `"Joindre un document"` → `{t('sections.uploadArea.buttons.attach')}`
- `"Extraire du web"` → `{t('sections.uploadArea.buttons.extract')}`
- `"Documents joints"` → `{t('sections.uploadArea.attachedFiles')}`
- Tooltips des boutons → `{t('sections.uploadArea.buttons.dictationTooltip')}` etc.

### 4. MediaAISelector.jsx
**À modifier** : Labels des médias, tooltip Profil

**Remplacements** :
- `"Texte"` → `{t('sections.uploadArea.aiSelector.text')}`
- `"Audio"` → `{t('sections.uploadArea.aiSelector.audio')}`
- `"Image"` → `{t('sections.uploadArea.aiSelector.image')}`
- `"Tableau"` → `{t('sections.uploadArea.aiSelector.table')}`
- `"Site Web"` → `{t('sections.uploadArea.aiSelector.website')}`
- `"Profil"` → `{t('sections.uploadArea.aiSelector.profile')}`
- Tooltip Profil → `{t('sections.uploadArea.aiSelector.profileTooltip')}`
- Tooltip sélection IA → `` title={`${t('sections.uploadArea.aiSelector.selectAI')} ${config.label}`} ``

### 5. ProcessingTasks.jsx
**À modifier** : Titre et noms des tâches

**Remplacements** :
- `"Tâches de Traitement Intelligent"` → `{t('sections.processingTasks.title')}`
- `"Résumer"` → `{t('sections.processingTasks.tasks.summarize')}`
- `"Réécrire"` → `{t('sections.processingTasks.tasks.rewrite')}`
- `"Développer"` → `{t('sections.processingTasks.tasks.expand')}`
- `"Simplifier"` → `{t('sections.processingTasks.tasks.simplify')}`
- `"Traduire"` → `{t('sections.processingTasks.tasks.translate')}`
- `"Corriger"` → `{t('sections.processingTasks.tasks.correct')}`
- `"Optimiser SEO"` → `{t('sections.processingTasks.tasks.optimize')}`
- `"Structurer"` → `{t('sections.processingTasks.tasks.structure')}`
- `"Adapter le ton"` → `{t('sections.processingTasks.tasks.tone')}`
- `"Formater"` → `{t('sections.processingTasks.tasks.format')}`

### 6. OutputFormat.jsx (ou composant similaire)
**À modifier** : Titre et formats de sortie

**Remplacements** :
- `"Format de Sortie"` → `{t('sections.outputFormat.title')}`
- `"Article"` → `{t('sections.outputFormat.formats.article')}`
- `"Post"` → `{t('sections.outputFormat.formats.post')}`
- `"Email"` → `{t('sections.outputFormat.formats.email')}`
- `"Script"` → `{t('sections.outputFormat.formats.script')}`
- `"Description"` → `{t('sections.outputFormat.formats.description')}`
- `"Thread"` → `{t('sections.outputFormat.formats.thread')}`
- `"Story"` → `{t('sections.outputFormat.formats.story')}`
- `"Légende"` → `{t('sections.outputFormat.formats.caption')}`
- `"Publicité"` → `{t('sections.outputFormat.formats.ad')}`
- `"Newsletter"` → `{t('sections.outputFormat.formats.newsletter')}`

### 7. AdvancedOptions.jsx
**À modifier** : Titre, tooltip, toutes les options

**Remplacements** :
- `"Personnalisation avancée"` → `{t('sections.advancedOptions.title')}`
- Tooltip titre → `{t('sections.advancedOptions.tooltip')}`
- `"Style et état d'esprit"` → `{t('sections.advancedOptions.style.title')}`
- `"Professionnel"` → `{t('sections.advancedOptions.style.professional')}`
- `"Créatif"` → `{t('sections.advancedOptions.style.creative')}`
- `"Académique"` → `{t('sections.advancedOptions.style.academic')}`
- `"Décontracté"` → `{t('sections.advancedOptions.style.casual')}`
- `"Persuasif"` → `{t('sections.advancedOptions.style.persuasive')}`
- `"Longueur du contenu"` → `{t('sections.advancedOptions.length.title')}`
- `"Niveau de créativité"` → `{t('sections.advancedOptions.creativity.title')}`
- `"Adaptation du format"` → `{t('sections.advancedOptions.adaptation.title')}`
- `"Web"` → `{t('sections.advancedOptions.adaptation.web')}`
- `"Email"` → `{t('sections.advancedOptions.adaptation.email')}`
- `"Réseaux sociaux"` → `{t('sections.advancedOptions.adaptation.social')}`
- `"Impression"` → `{t('sections.advancedOptions.adaptation.print')}`

### 8. ResultsManager.jsx
**À modifier** : Titre, tooltip, onglets, actions

**Remplacements** :
- `"Gestion des résultats"` → `{t('sections.resultsManager.title')}`
- Tooltip titre → `{t('sections.resultsManager.tooltip')}`
- `"Vue complète"` → `{t('sections.resultsManager.tabs.full')}`
- `"Résumé"` → `{t('sections.resultsManager.tabs.summary')}`
- `"Versions"` → `{t('sections.resultsManager.tabs.versions')}`
- `"Copier"` → `{t('sections.resultsManager.actions.copy')}`
- `"Télécharger"` → `{t('sections.resultsManager.actions.download')}`
- `"Modifier"` → `{t('sections.resultsManager.actions.edit')}`
- `"Supprimer"` → `{t('sections.resultsManager.actions.delete')}`
- `"Exporter"` → `{t('sections.resultsManager.actions.export')}`
- `"Aucun résultat disponible"` → `{t('sections.resultsManager.noResults')}`
- `"Génération en cours..."` → `{t('sections.resultsManager.generating')}`

### 9. Bouton Générer (dans Home.jsx ou similaire)
**À modifier** : Texte du bouton

**Remplacements** :
- `"Générer"` → `{t('sections.generateButton.generate')}`
- `"Génération..."` → `{t('sections.generateButton.generating')}`
- `"Régénérer"` → `{t('sections.generateButton.regenerate')}`

---

## 🔧 TEMPLATE D'IMPLÉMENTATION

Pour chaque composant, suivre ce pattern :

```javascript
// 1. Ajouter les imports
import { useAssistantAutoSave } from '../hooks/useLocalStorage';
import { getHomeText } from '../i18n/homeTranslations';

// 2. Dans le composant, avant le return
const { autoSaveData } = useAssistantAutoSave();
const userLanguage = autoSaveData.language || 'fr';
const t = (path) => getHomeText(userLanguage, path);

// 3. Remplacer tous les textes en dur par {t('path.to.translation')}
```

---

## 📊 PROGRESSION

- ✅ **homeTranslations.js** : Créé avec toutes les traductions (FR, EN, ES, DE)
- ✅ **MenuBar.jsx** : Modifié (titre "Assistant Rédactionnel" traduit)
- ⏳ **ProjectInfoSimple.jsx** : À modifier
- ⏳ **UploadArea.jsx** : À modifier
- ⏳ **MediaAISelector.jsx** : À modifier
- ⏳ **ProcessingTasks.jsx** : À modifier
- ⏳ **OutputFormat.jsx** : À modifier
- ⏳ **AdvancedOptions.jsx** : À modifier
- ⏳ **ResultsManager.jsx** : À modifier
- ⏳ **Home.jsx** : À modifier (bouton Générer)

---

## 🎯 NOTES IMPORTANTES

1. **Tous les textes visibles** doivent être traduits (titres, labels, placeholders, tooltips, boutons)
2. **Les icônes** restent identiques (pas de traduction)
3. **Les classes CSS** restent identiques
4. **La structure HTML** reste identique
5. **Tester chaque langue** après implémentation (FR, EN, ES, DE)
6. **Vérifier les tooltips** : ils doivent aussi être traduits
7. **Menus déroulants** : tous les choix doivent être traduits

---

## 🚀 ORDRE D'IMPLÉMENTATION RECOMMANDÉ

1. ProjectInfoSimple.jsx (champs principaux)
2. UploadArea.jsx (zone de saisie + boutons)
3. MediaAISelector.jsx (sélecteurs IA)
4. ProcessingTasks.jsx (tâches)
5. OutputFormat.jsx (formats)
6. AdvancedOptions.jsx (options avancées)
7. ResultsManager.jsx (résultats)
8. Home.jsx (bouton générer)

---

**Fichier créé le** : 13 octobre 2025
**Auteur** : Assistant IA
**Statut** : Guide complet - Prêt pour implémentation
