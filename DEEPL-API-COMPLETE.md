# 🌐 DeepL API - Toutes les Fonctions Disponibles

## 📚 DOCUMENTATION OFFICIELLE

**Source** : https://developers.deepl.com/docs

---

## 🎯 ENDPOINTS PRINCIPAUX

### **1. TRADUCTION DE TEXTE** 📝

#### **POST /v2/translate**

**Fonction** : Traduire du texte d'une langue à une autre

**URL** :
- **Pro** : `https://api.deepl.com/v2/translate`
- **Free** : `https://api-free.deepl.com/v2/translate`

**Paramètres** :

| Paramètre | Type | Requis | Description |
|-----------|------|--------|-------------|
| `text` | string/array | ✅ Oui | Texte(s) à traduire (max 50 textes) |
| `target_lang` | string | ✅ Oui | Langue cible (EN, FR, DE, ES, etc.) |
| `source_lang` | string | ❌ Non | Langue source (détection auto si omis) |
| `split_sentences` | string | ❌ Non | Comment diviser les phrases (0, 1, nonewlines) |
| `preserve_formatting` | boolean | ❌ Non | Préserver le formatage (défaut: false) |
| `formality` | string | ❌ Non | Niveau de formalité (default, more, less, prefer_more, prefer_less) |
| `glossary_id` | string | ❌ Non | ID du glossaire à utiliser |
| `tag_handling` | string | ❌ Non | Type de balises (xml, html) |
| `outline_detection` | boolean | ❌ Non | Détection automatique structure XML |
| `non_splitting_tags` | string | ❌ Non | Balises à ne pas diviser |
| `splitting_tags` | string | ❌ Non | Balises qui divisent les phrases |
| `ignore_tags` | string | ❌ Non | Balises à ignorer |
| `context` | string | ❌ Non | Contexte pour améliorer la traduction |
| `model_type` | string | ❌ Non | Type de modèle (quality_optimized, latency_optimized, prefer_quality_optimized) |

**Exemple** :
```bash
curl -X POST 'https://api.deepl.com/v2/translate' \
  --header 'Authorization: DeepL-Auth-Key [yourAuthKey]' \
  --header 'Content-Type: application/json' \
  --data '{
    "text": ["Hello, world!"],
    "target_lang": "FR",
    "source_lang": "EN",
    "formality": "more"
  }'
```

**Réponse** :
```json
{
  "translations": [
    {
      "detected_source_language": "EN",
      "text": "Bonjour le monde !"
    }
  ]
}
```

**Langues Supportées** :
- **31 langues** : EN, FR, DE, ES, IT, PT, NL, PL, RU, JA, ZH, KO, SV, DA, FI, NO, CS, HU, RO, BG, EL, TR, ID, UK, AR, LT, LV, ET, SK, SL

**Variantes** :
- EN-US, EN-GB
- PT-PT, PT-BR

---

### **2. TRADUCTION DE DOCUMENTS** 📄

#### **POST /v2/document**

**Fonction** : Uploader un document pour traduction

**Formats Supportés** :
- **Texte** : .txt, .docx, .pptx, .xlsx, .pdf
- **HTML** : .html, .htm
- **XML** : .xml, .xliff, .xlf
- **Autres** : .srt, .md

**Limite** : 30 MB par document

**Workflow** :

1. **Upload du document** :
```bash
POST /v2/document
```

2. **Vérifier le statut** :
```bash
POST /v2/document/{document_id}
```

3. **Télécharger le résultat** :
```bash
POST /v2/document/{document_id}/result
```

**Paramètres Upload** :

| Paramètre | Type | Requis | Description |
|-----------|------|--------|-------------|
| `file` | file | ✅ Oui | Fichier à traduire |
| `target_lang` | string | ✅ Oui | Langue cible |
| `source_lang` | string | ❌ Non | Langue source |
| `formality` | string | ❌ Non | Niveau de formalité |
| `glossary_id` | string | ❌ Non | ID du glossaire |
| `filename` | string | ❌ Non | Nom du fichier |

**Exemple** :
```bash
curl -X POST 'https://api.deepl.com/v2/document' \
  --header 'Authorization: DeepL-Auth-Key [yourAuthKey]' \
  --form 'file=@"/path/to/document.pdf"' \
  --form 'target_lang="FR"' \
  --form 'source_lang="EN"'
```

**Réponse** :
```json
{
  "document_id": "ABC123DEF456",
  "document_key": "xyz789"
}
```

---

### **3. AMÉLIORATION DE TEXTE (DeepL Write)** ✍️

#### **POST /v2/write/rephrase**

**Fonction** : Améliorer, reformuler ou corriger du texte

**Paramètres** :

| Paramètre | Type | Requis | Description |
|-----------|------|--------|-------------|
| `text` | string | ✅ Oui | Texte à améliorer |
| `source_lang` | string | ✅ Oui | Langue du texte (EN, DE, FR, ES, IT, PT, NL, PL, RU, JA, ZH) |
| `formality` | string | ❌ Non | Niveau de formalité |
| `tone` | string | ❌ Non | Ton souhaité (business, casual, academic, creative) |
| `audience` | string | ❌ Non | Public cible (general, expert, knowledgeable, beginner) |

**Exemple** :
```bash
curl -X POST 'https://api.deepl.com/v2/write/rephrase' \
  --header 'Authorization: DeepL-Auth-Key [yourAuthKey]' \
  --header 'Content-Type: application/json' \
  --data '{
    "text": "This is a text that needs improvement.",
    "source_lang": "EN",
    "tone": "business",
    "audience": "expert"
  }'
```

**Réponse** :
```json
{
  "rephrased_text": "This text requires enhancement.",
  "changes": [...]
}
```

---

### **4. GLOSSAIRES** 📚

Les glossaires permettent de définir des traductions personnalisées pour des termes spécifiques.

#### **A. Glossaires Multilingues (v3 - Recommandé)**

##### **GET /v3/glossaries**
Liste tous vos glossaires

##### **POST /v3/glossaries**
Créer un nouveau glossaire multilingue

**Paramètres** :
- `name` : Nom du glossaire
- `entries` : Dictionnaire des entrées
- `source_lang` : Langue source
- `target_lang` : Langue cible

##### **GET /v3/glossaries/{glossary_id}**
Obtenir les détails d'un glossaire

##### **PATCH /v3/glossaries/{glossary_id}**
Modifier un glossaire existant

##### **DELETE /v3/glossaries/{glossary_id}**
Supprimer un glossaire

##### **GET /v3/glossaries/{glossary_id}/entries**
Obtenir toutes les entrées d'un glossaire

#### **B. Glossaires Monolingues (v2 - Legacy)**

##### **POST /v2/glossaries**
Créer un glossaire (ancienne méthode)

##### **GET /v2/glossaries**
Lister les glossaires

##### **GET /v2/glossaries/{glossary_id}**
Détails d'un glossaire

##### **DELETE /v2/glossaries/{glossary_id}**
Supprimer un glossaire

##### **GET /v2/glossaries/{glossary_id}/entries**
Obtenir les entrées

**Exemple Création Glossaire** :
```bash
curl -X POST 'https://api.deepl.com/v3/glossaries' \
  --header 'Authorization: DeepL-Auth-Key [yourAuthKey]' \
  --header 'Content-Type: application/json' \
  --data '{
    "name": "Mon Glossaire Marketing",
    "source_lang": "EN",
    "target_lang": "FR",
    "entries": {
      "API": "API",
      "cloud": "cloud",
      "software": "logiciel"
    }
  }'
```

**Paires de Langues Supportées** : 55 paires
- EN ↔ FR, DE, ES, IT, PT, NL, PL, RU, JA, ZH, etc.

---

### **5. LANGUES SUPPORTÉES** 🌍

#### **GET /v2/languages**

**Fonction** : Obtenir la liste des langues supportées

**Paramètres** :

| Paramètre | Type | Requis | Description |
|-----------|------|--------|-------------|
| `type` | string | ❌ Non | Type de langues (source, target) |

**Exemple** :
```bash
curl -X GET 'https://api.deepl.com/v2/languages?type=target' \
  --header 'Authorization: DeepL-Auth-Key [yourAuthKey]'
```

**Réponse** :
```json
[
  {
    "language": "FR",
    "name": "French",
    "supports_formality": true
  },
  {
    "language": "DE",
    "name": "German",
    "supports_formality": true
  }
]
```

---

### **6. USAGE ET QUOTA** 📊

#### **GET /v2/usage**

**Fonction** : Vérifier votre utilisation et quota

**Exemple** :
```bash
curl -X GET 'https://api.deepl.com/v2/usage' \
  --header 'Authorization: DeepL-Auth-Key [yourAuthKey]'
```

**Réponse** :
```json
{
  "character_count": 123456,
  "character_limit": 500000,
  "document_count": 10,
  "document_limit": 50,
  "team_document_count": 25,
  "team_document_limit": 100
}
```

**Informations Retournées** :
- `character_count` : Caractères utilisés ce mois
- `character_limit` : Limite mensuelle
- `document_count` : Documents traduits ce mois
- `document_limit` : Limite mensuelle de documents
- `team_document_count` : Documents équipe
- `team_document_limit` : Limite équipe

---

## 🎨 FONCTIONNALITÉS AVANCÉES

### **1. Formalité (Formality)**

Adapter le niveau de formalité de la traduction.

**Valeurs** :
- `default` : Automatique
- `more` : Plus formel (vouvoiement)
- `less` : Moins formel (tutoiement)
- `prefer_more` : Préférer formel si possible
- `prefer_less` : Préférer informel si possible

**Langues Supportées** :
- Allemand (DE)
- Français (FR)
- Italien (IT)
- Espagnol (ES)
- Néerlandais (NL)
- Polonais (PL)
- Portugais (PT-BR, PT-PT)
- Russe (RU)
- Japonais (JA)

### **2. Contexte (Context)**

Fournir du contexte pour améliorer la qualité de traduction.

**Exemple** :
```json
{
  "text": ["bank"],
  "target_lang": "FR",
  "context": "financial institution"
}
```

**Résultat** : "banque" (au lieu de "rive")

### **3. Gestion des Balises (Tag Handling)**

Pour traduire du HTML ou XML en préservant la structure.

**Options** :
- `tag_handling` : "xml" ou "html"
- `outline_detection` : Détection automatique
- `non_splitting_tags` : Balises à ne pas diviser
- `splitting_tags` : Balises qui divisent
- `ignore_tags` : Balises à ignorer

**Exemple** :
```json
{
  "text": ["<p>Hello <strong>world</strong>!</p>"],
  "target_lang": "FR",
  "tag_handling": "html"
}
```

**Résultat** : `<p>Bonjour <strong>monde</strong> !</p>`

### **4. Division des Phrases (Split Sentences)**

Contrôler comment DeepL divise les phrases.

**Valeurs** :
- `0` : Pas de division
- `1` : Division sur ponctuation et sauts de ligne (défaut)
- `nonewlines` : Division sur ponctuation uniquement

### **5. Type de Modèle (Model Type)**

Choisir entre qualité et latence.

**Valeurs** :
- `quality_optimized` : Meilleure qualité (défaut)
- `latency_optimized` : Plus rapide
- `prefer_quality_optimized` : Préférer qualité si disponible

---

## 📋 RÉCAPITULATIF DES ENDPOINTS

| Endpoint | Méthode | Fonction |
|----------|---------|----------|
| **TRADUCTION** |
| `/v2/translate` | POST | Traduire du texte |
| `/v2/document` | POST | Uploader un document |
| `/v2/document/{id}` | POST | Statut de traduction |
| `/v2/document/{id}/result` | POST | Télécharger résultat |
| **AMÉLIORATION** |
| `/v2/write/rephrase` | POST | Améliorer/reformuler texte |
| **GLOSSAIRES v3** |
| `/v3/glossaries` | GET | Lister glossaires |
| `/v3/glossaries` | POST | Créer glossaire |
| `/v3/glossaries/{id}` | GET | Détails glossaire |
| `/v3/glossaries/{id}` | PATCH | Modifier glossaire |
| `/v3/glossaries/{id}` | DELETE | Supprimer glossaire |
| `/v3/glossaries/{id}/entries` | GET | Obtenir entrées |
| **GLOSSAIRES v2** |
| `/v2/glossaries` | GET | Lister glossaires |
| `/v2/glossaries` | POST | Créer glossaire |
| `/v2/glossaries/{id}` | GET | Détails glossaire |
| `/v2/glossaries/{id}` | DELETE | Supprimer glossaire |
| `/v2/glossaries/{id}/entries` | GET | Obtenir entrées |
| **INFORMATIONS** |
| `/v2/languages` | GET | Langues supportées |
| `/v2/usage` | GET | Usage et quota |

---

## 🔐 AUTHENTIFICATION

### **Méthode 1 : Header Authorization (Recommandé)**

```bash
--header 'Authorization: DeepL-Auth-Key [yourAuthKey]'
```

### **Méthode 2 : Paramètre auth_key**

```bash
--data 'auth_key=[yourAuthKey]'
```

---

## 🌍 LANGUES SUPPORTÉES (31 au total)

| Code | Langue | Formalité | Glossaire |
|------|--------|-----------|-----------|
| **AR** | Arabe | ❌ | ✅ |
| **BG** | Bulgare | ❌ | ✅ |
| **CS** | Tchèque | ❌ | ✅ |
| **DA** | Danois | ❌ | ✅ |
| **DE** | Allemand | ✅ | ✅ |
| **EL** | Grec | ❌ | ✅ |
| **EN** | Anglais | ❌ | ✅ |
| **ES** | Espagnol | ✅ | ✅ |
| **ET** | Estonien | ❌ | ✅ |
| **FI** | Finnois | ❌ | ✅ |
| **FR** | Français | ✅ | ✅ |
| **HU** | Hongrois | ❌ | ✅ |
| **ID** | Indonésien | ❌ | ✅ |
| **IT** | Italien | ✅ | ✅ |
| **JA** | Japonais | ✅ | ✅ |
| **KO** | Coréen | ❌ | ✅ |
| **LT** | Lituanien | ❌ | ✅ |
| **LV** | Letton | ❌ | ✅ |
| **NL** | Néerlandais | ✅ | ✅ |
| **NO** | Norvégien | ❌ | ✅ |
| **PL** | Polonais | ✅ | ✅ |
| **PT** | Portugais | ✅ | ✅ |
| **RO** | Roumain | ❌ | ✅ |
| **RU** | Russe | ✅ | ✅ |
| **SK** | Slovaque | ❌ | ✅ |
| **SL** | Slovène | ❌ | ✅ |
| **SV** | Suédois | ❌ | ✅ |
| **TR** | Turc | ❌ | ✅ |
| **UK** | Ukrainien | ❌ | ✅ |
| **ZH** | Chinois | ✅ | ✅ |

---

## 💰 LIMITES ET QUOTAS

### **DeepL API Free**
- ✅ **500 000 caractères/mois**
- ✅ Tous les endpoints disponibles
- ✅ Clé se termine par `:fx`
- ✅ URL : `https://api-free.deepl.com`

### **DeepL API Pro**
- 💳 **À partir de 5,49€/mois**
- ✅ Volume selon le plan
- ✅ Priorité de traitement
- ✅ Support technique
- ✅ URL : `https://api.deepl.com`

### **Limites Techniques**
- **Texte** : 128 KB par requête
- **Document** : 30 MB par fichier
- **Batch** : 50 textes par requête
- **Headers** : 16 KiB max
- **Rate Limit** : Selon le plan

---

## 🎯 CAS D'USAGE PAR ENDPOINT

### **Traduction Simple** → `/v2/translate`
- Posts réseaux sociaux
- Descriptions produits
- Emails
- Contenu web

### **Traduction Documents** → `/v2/document`
- PDFs
- Présentations PowerPoint
- Documents Word
- Feuilles Excel

### **Amélioration Texte** → `/v2/write/rephrase`
- Correction grammaticale
- Reformulation professionnelle
- Adaptation du ton
- Amélioration de style

### **Glossaires** → `/v3/glossaries`
- Terminologie technique
- Noms de marques
- Termes spécialisés
- Cohérence traductions

### **Monitoring** → `/v2/usage`
- Suivi consommation
- Alertes quota
- Facturation
- Optimisation

---

## 📚 RESSOURCES

### **Documentation Officielle**
- **API Docs** : https://developers.deepl.com/docs
- **API Reference** : https://developers.deepl.com/api-reference
- **OpenAPI Spec** : https://developers.deepl.com/openapi

### **Support**
- **Help Center** : https://support.deepl.com/
- **Status Page** : https://status.deepl.com/
- **Contact** : https://www.deepl.com/contact-us

### **Outils**
- **API Simulator** : https://www.deepl.com/docs-api/simulator/
- **Postman Collection** : Disponible sur le site
- **Client Libraries** : Python, Node.js, PHP, Java, C#, .NET

---

## ✅ CHECKLIST D'IMPLÉMENTATION

Pour implémenter toutes les fonctions DeepL dans votre application :

- [ ] **Traduction texte** (`/v2/translate`)
- [ ] **Traduction documents** (`/v2/document`)
- [ ] **Amélioration texte** (`/v2/write/rephrase`)
- [ ] **Glossaires v3** (`/v3/glossaries`)
- [ ] **Langues supportées** (`/v2/languages`)
- [ ] **Usage et quota** (`/v2/usage`)
- [ ] **Gestion formalité**
- [ ] **Gestion contexte**
- [ ] **Gestion balises HTML/XML**
- [ ] **Sélection type de modèle**

---

**DeepL API offre bien plus que de la simple traduction !** 🚀
