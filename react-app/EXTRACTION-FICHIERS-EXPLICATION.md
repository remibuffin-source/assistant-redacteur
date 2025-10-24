# 📎 Extraction de Fichiers - Clarification

## Question Posée
> "Que veux-tu dire par 'Implémenter l'extraction réelle des fichiers', le choix des IA et leur raccordement ne va-t-il pas répondre à ce besoin ?"

## Réponse Détaillée

### Situation Actuelle ✅
**Ce qui est fait :**
1. ✅ Interface de sélection d'IA par type de média
2. ✅ Bouton "Joindre un document" fonctionnel
3. ✅ Liste des fichiers joints affichée
4. ✅ Stockage des fichiers en mémoire

**Ce qui manque :**
- ❌ Extraction du contenu des fichiers
- ❌ Envoi vers les API IA
- ❌ Traitement du contenu extrait

---

## Les 3 Étapes du Traitement

### Étape 1️⃣ : Joindre le Fichier (✅ FAIT)
```
Utilisateur clique "Joindre un document"
→ Sélectionne rapport.pdf
→ Fichier stocké en mémoire
→ Affiché dans la liste
```

**État actuel :** Le fichier est "attaché" mais son contenu n'est pas lu.

---

### Étape 2️⃣ : Extraire le Contenu (❌ À FAIRE)
```
Fichier PDF joint
→ Utiliser bibliothèque pdf.js
→ Extraire le texte du PDF
→ Obtenir le contenu textuel
```

**Exemple concret :**

**Fichier PDF :**
```
┌─────────────────────┐
│ Rapport Annuel 2024 │
│                     │
│ Chiffre d'affaires: │
│ 1.2M€               │
│                     │
│ Croissance: +15%    │
└─────────────────────┘
```

**Après extraction :**
```javascript
const extractedText = `
Rapport Annuel 2024

Chiffre d'affaires: 1.2M€

Croissance: +15%
`;
```

---

### Étape 3️⃣ : Envoyer à l'IA (❌ À FAIRE)
```
Texte extrait
→ Sélectionner l'IA configurée (ex: Claude 3.5 Sonnet)
→ Envoyer le texte à l'API
→ Recevoir le traitement demandé (résumé, traduction, etc.)
```

**Exemple d'appel API :**
```javascript
// Utilisateur a sélectionné Claude 3.5 Sonnet pour les documents texte
const selectedAI = aiConfig.text; // 'claude-3.5-sonnet'

// Envoyer à l'API
const response = await fetch('https://api.anthropic.com/v1/messages', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': API_KEY,
    'anthropic-version': '2023-06-01'
  },
  body: JSON.stringify({
    model: 'claude-3-5-sonnet-20241022',
    messages: [{
      role: 'user',
      content: `Résume ce document:\n\n${extractedText}`
    }]
  })
});

const result = await response.json();
// Afficher le résumé à l'utilisateur
```

---

## Pourquoi l'Extraction est Nécessaire

### Sans Extraction (Actuel)
```
Fichier PDF → [Stocké en mémoire] → ❌ Rien ne se passe
```

### Avec Extraction (Futur)
```
Fichier PDF → [Extraction texte] → [Envoi IA] → [Résultat traité] → ✅ Utilisateur reçoit le résumé
```

---

## Types d'Extraction par Format

### 📝 Documents Texte

#### `.txt` et `.md`
**Extraction :** ✅ Simple (FileReader)
```javascript
const reader = new FileReader();
reader.onload = (e) => {
  const text = e.target.result; // Texte brut
};
reader.readAsText(file);
```

#### `.pdf`
**Extraction :** ⚙️ Complexe (pdf.js)
```javascript
import * as pdfjsLib from 'pdfjs-dist';

const pdf = await pdfjsLib.getDocument(fileBuffer).promise;
let fullText = '';

for (let i = 1; i <= pdf.numPages; i++) {
  const page = await pdf.getPage(i);
  const content = await page.getTextContent();
  fullText += content.items.map(item => item.str).join(' ');
}
```

#### `.docx`
**Extraction :** ⚙️ Complexe (mammoth.js)
```javascript
import mammoth from 'mammoth';

const result = await mammoth.extractRawText({
  arrayBuffer: fileBuffer
});
const text = result.value;
```

#### `.odt`
**Extraction :** ⚙️ Complexe (odt-parser)
```javascript
import { parseODT } from 'odt-parser';

const text = await parseODT(fileBuffer);
```

---

### 🎵 Fichiers Audio

#### `.wav`, `.mp3`, `.aac`, `.aiff`, `.flac`
**Extraction :** 🎤 Transcription (Whisper API)
```javascript
const formData = new FormData();
formData.append('file', audioFile);
formData.append('model', 'whisper-large-v3');

const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${OPENAI_API_KEY}`
  },
  body: formData
});

const { text } = await response.json();
// text contient la transcription
```

---

### 🖼️ Images

#### `.jpg`, `.png`, `.gif`
**Extraction :** 👁️ OCR (GPT-4 Vision)
```javascript
// Convertir image en base64
const base64 = await fileToBase64(imageFile);

const response = await fetch('https://api.openai.com/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${OPENAI_API_KEY}`
  },
  body: JSON.stringify({
    model: 'gpt-4o',
    messages: [{
      role: 'user',
      content: [
        { type: 'text', text: 'Extrais tout le texte de cette image.' },
        { 
          type: 'image_url', 
          image_url: { url: `data:image/jpeg;base64,${base64}` }
        }
      ]
    }]
  })
});

const result = await response.json();
const extractedText = result.choices[0].message.content;
```

---

### 📊 Tableurs

#### `.xlsx`, `.xls`
**Extraction :** ⚙️ Complexe (xlsx)
```javascript
import * as XLSX from 'xlsx';

const workbook = XLSX.read(fileBuffer, { type: 'array' });
let fullText = '';

workbook.SheetNames.forEach(sheetName => {
  const sheet = workbook.Sheets[sheetName];
  fullText += `\n=== ${sheetName} ===\n`;
  fullText += XLSX.utils.sheet_to_csv(sheet);
});
```

---

### 📖 eBooks

#### `.epub`
**Extraction :** ⚙️ Complexe (epub.js)
```javascript
import ePub from 'epubjs';

const book = ePub(fileBuffer);
await book.ready;

let fullText = '';
const spine = await book.loaded.spine;

for (const item of spine.items) {
  const doc = await book.load(item.href);
  fullText += doc.textContent + '\n';
}
```

---

## Workflow Complet

### Scénario : Résumer un PDF

```
1. Utilisateur joint rapport.pdf
   ↓
2. Système détecte : Type = Texte
   ↓
3. Système regarde la config : aiConfig.text = 'claude-3.5-sonnet'
   ↓
4. Extraction du PDF avec pdf.js
   ↓
5. Texte extrait : "Rapport Annuel 2024..."
   ↓
6. Envoi à Claude 3.5 Sonnet :
   "Résume ce document : [texte extrait]"
   ↓
7. Claude répond avec le résumé
   ↓
8. Affichage du résumé à l'utilisateur
```

---

## Ce qui Répond à Votre Question

### Le Choix d'IA Seul Ne Suffit Pas ❌

**Actuellement :**
```
Fichier PDF joint
+ IA sélectionnée (Claude 3.5 Sonnet)
= ❌ Rien ne se passe car le PDF n'est pas lu
```

**Il faut AUSSI :**
```
Fichier PDF joint
+ Extraction du contenu (pdf.js)
+ IA sélectionnée (Claude 3.5 Sonnet)
+ Envoi du contenu extrait à l'IA
= ✅ Résultat traité
```

---

## Plan d'Implémentation

### Phase 1 : Extraction Côté Client (Formats Simples)
```javascript
// Déjà fait pour .txt et .md
// À ajouter :
- pdf.js pour PDF
- mammoth.js pour Word
- XLSX pour Excel
```

### Phase 2 : Extraction Côté Serveur (Formats Complexes)
```javascript
// Créer un endpoint backend
POST /api/extract-file
{
  file: [fichier],
  type: 'pdf'
}

// Réponse
{
  text: "Contenu extrait...",
  pages: 10,
  metadata: {...}
}
```

### Phase 3 : Routage vers IA
```javascript
// Utiliser la config IA sélectionnée
const aiModel = aiConfig[fileType];

// Router vers la bonne API
if (aiModel === 'claude-3.5-sonnet') {
  // Appel Anthropic API
} else if (aiModel === 'gpt-4o') {
  // Appel OpenAI API
} else if (aiModel === 'deepseek-v3') {
  // Appel DeepSeek API
}
```

---

## Résumé

### ✅ Ce qui est fait
- Interface de sélection IA
- Bouton joindre fichier
- Affichage liste fichiers

### ❌ Ce qui manque
- **Extraction du contenu** des fichiers
- **Envoi à l'API** de l'IA sélectionnée
- **Affichage du résultat** traité

### 🎯 Conclusion
Le choix d'IA est la **première étape**, mais il faut ensuite :
1. Extraire le contenu du fichier
2. L'envoyer à l'IA choisie
3. Afficher le résultat

**C'est comme avoir une voiture (IA) sans essence (contenu extrait) !** 🚗⛽

---

## Prochaine Étape Recommandée

Commencer par l'extraction des formats simples :
1. ✅ `.txt` - Déjà fait
2. ✅ `.md` - Déjà fait
3. 🔨 `.pdf` - À implémenter avec pdf.js
4. 🔨 Audio - À implémenter avec Whisper API
5. 🔨 Images - À implémenter avec GPT-4 Vision

**Voulez-vous que je commence l'implémentation de l'extraction PDF ?** 📄
