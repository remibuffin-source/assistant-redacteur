# 🌐 DeepL - Détection Automatique de la Langue

## 🎯 PRINCIPE

La **langue cible** pour DeepL est **détectée automatiquement** depuis la **description du projet**.

**Plus besoin de sélectionner manuellement la langue !**

---

## 🔍 COMMENT ÇA FONCTIONNE ?

### **Étape 1 : Écrire la Langue dans la Description**

Dans **"Informations du Projet"** → **"Description du projet"**, mentionnez la langue cible :

**Exemples** :
```
"Traduire ce document en allemand"
"Traduction vers l'espagnol"
"Version anglaise du contenu"
"Adapter pour le marché japonais"
```

---

### **Étape 2 : Détection Automatique**

Le système **scanne la description** et détecte les mots-clés de langue.

**Mots-clés détectés** :

#### **🇩🇪 Allemand (DE)**
- allemand, deutsch, german, allemagne, germany

#### **🇪🇸 Espagnol (ES)**
- espagnol, español, spanish, espagne, spain

#### **🇫🇷 Français (FR)**
- français, french, france

#### **🇮🇹 Italien (IT)**
- italien, italiano, italian, italie, italy

#### **🇵🇹 Portugais (PT)**
- portugais, português, portuguese, portugal, brésil, brazil

#### **🇳🇱 Néerlandais (NL)**
- néerlandais, dutch, pays-bas, netherlands

#### **🇵🇱 Polonais (PL)**
- polonais, polish, pologne, poland

#### **🇷🇺 Russe (RU)**
- russe, russian, russie, russia

#### **🇨🇳 Chinois (ZH)**
- chinois, chinese, chine, china

#### **🇯🇵 Japonais (JA)**
- japonais, japanese, japon, japan

#### **🇰🇷 Coréen (KO)**
- coréen, korean, corée, korea

#### **🇸🇦 Arabe (AR)**
- arabe, arabic

#### **🇹🇷 Turc (TR)**
- turc, turkish, turquie, turkey

#### **🇸🇪 Suédois (SV)**
- suédois, swedish, suède, sweden

#### **🇩🇰 Danois (DA)**
- danois, danish, danemark, denmark

#### **🇫🇮 Finnois (FI)**
- finnois, finnish, finlande, finland

#### **🇳🇴 Norvégien (NO)**
- norvégien, norwegian, norvège, norway

#### **🇨🇿 Tchèque (CS)**
- tchèque, czech

#### **🇷🇴 Roumain (RO)**
- roumain, romanian, roumanie, romania

#### **🇧🇬 Bulgare (BG)**
- bulgare, bulgarian, bulgarie, bulgaria

#### **🇬🇷 Grec (EL)**
- grec, greek, grèce, greece

#### **🇭🇺 Hongrois (HU)**
- hongrois, hungarian, hongrie, hungary

#### **🇺🇦 Ukrainien (UK)**
- ukrainien, ukrainian, ukraine

#### **🇮🇩 Indonésien (ID)**
- indonésien, indonesian, indonésie, indonesia

#### **🇬🇧 Anglais (EN)** (par défaut)
- anglais, english, royaume-uni, uk, usa, états-unis

---

### **Étape 3 : Traduction Automatique**

Quand vous cliquez sur **"Lancer la génération"** avec DeepL :

1. ✅ Le système lit la description du projet
2. ✅ Détecte la langue cible (ex: "allemand" → `DE`)
3. ✅ Envoie le document à DeepL avec la bonne langue
4. ✅ Retourne le document traduit

---

## 📝 EXEMPLES D'UTILISATION

### **Exemple 1 : Allemand**

**Description du projet** :
```
Traduire ce rapport financier en allemand pour notre filiale à Berlin
```

**Résultat** :
- ✅ Langue détectée : **DE** (Allemand)
- ✅ Document traduit en allemand

---

### **Exemple 2 : Espagnol**

**Description du projet** :
```
Version espagnole du guide utilisateur pour le marché latino-américain
```

**Résultat** :
- ✅ Langue détectée : **ES** (Espagnol)
- ✅ Document traduit en espagnol

---

### **Exemple 3 : Japonais**

**Description du projet** :
```
Adapter la présentation commerciale pour le marché japonais
```

**Résultat** :
- ✅ Langue détectée : **JA** (Japonais)
- ✅ Document traduit en japonais

---

### **Exemple 4 : Plusieurs Langues Mentionnées**

**Description du projet** :
```
Traduire du français vers l'allemand
```

**Résultat** :
- ✅ Première langue détectée : **FR** (Français)
- ⚠️ **ATTENTION** : Le système prend la **première langue trouvée**

**Solution** : Mentionner uniquement la langue **cible** :
```
Traduction en allemand
```

---

## 🔧 PRIORITÉ DE DÉTECTION

Le système utilise cette **priorité** :

1. **Champ dédié** `projectData.targetLanguage` (si existe)
2. **Détection automatique** depuis `projectDescription`
3. **Par défaut** : `EN` (Anglais)

---

## 🧪 TEST

### **Test 1 : Allemand**

1. **Description** : "Traduire en allemand"
2. **Attachez** un fichier PDF
3. **Sélectionnez** DeepL
4. **Générez**
5. **Vérifiez** : Document traduit en allemand

---

### **Test 2 : Espagnol**

1. **Description** : "Version espagnole"
2. **Attachez** un fichier DOCX
3. **Sélectionnez** DeepL
4. **Générez**
5. **Vérifiez** : Document traduit en espagnol

---

### **Test 3 : Console**

**Ouvrez la console (F12)** et cherchez :

```
🌐 DeepL Translation Request: {
  contentLength: 12345,
  targetLang: "DE",
  projectDescription: "Traduire en allemand",
  hasProjectData: true
}
```

**Vérifiez** que `targetLang` correspond à la langue attendue.

---

## 💡 CONSEILS

### **✅ Bonnes Pratiques**

**Clair et explicite** :
```
"Traduction en allemand"
"Version espagnole"
"Adapter pour le marché japonais"
```

**Mentionner la langue cible** :
```
"Document pour l'Allemagne" ✅
"Rapport financier" ❌ (pas de langue)
```

---

### **❌ À Éviter**

**Plusieurs langues** :
```
"Traduire du français vers l'allemand et l'espagnol"
→ Détectera FR (première langue trouvée)
```

**Solution** : Une description par traduction :
```
"Traduction en allemand"
```

---

## 🎯 CAS PARTICULIERS

### **Pas de Langue Détectée**

**Si aucun mot-clé n'est trouvé** :
- ✅ Langue par défaut : **EN** (Anglais)

**Exemple** :
```
Description : "Rapport financier Q4"
→ Aucune langue détectée
→ Traduction en anglais par défaut
```

---

### **Langue Non Supportée**

**Si vous mentionnez une langue non supportée par DeepL** :
- ✅ Le système utilisera **EN** par défaut
- ⚠️ DeepL supporte 30+ langues

**Langues supportées par DeepL** :
- Allemand, Anglais, Espagnol, Français, Italien, Portugais
- Néerlandais, Polonais, Russe, Chinois, Japonais, Coréen
- Arabe, Turc, Suédois, Danois, Finnois, Norvégien
- Tchèque, Roumain, Bulgare, Grec, Hongrois, Ukrainien, Indonésien

---

## 📊 LOGS DE DÉBOGAGE

**Pour vérifier la détection**, ouvrez la console (F12) :

```javascript
🌐 DeepL Translation Request: {
  contentLength: 12345,
  targetLang: "DE",           // ← Langue détectée
  projectDescription: "...",   // ← Description analysée
  hasProjectData: true
}
```

**Vérifiez** :
- ✅ `targetLang` = Code langue attendu (DE, ES, FR, etc.)
- ✅ `projectDescription` = Votre description

---

## 🔄 WORKFLOW COMPLET

### **1. Remplir la Description**
```
"Traduire ce document en allemand pour notre équipe à Munich"
```

### **2. Attacher le Fichier**
```
📎 rapport_Q4.pdf
```

### **3. Sélectionner DeepL**
```
IA : DeepL
```

### **4. Générer**
```
Clic sur "Lancer la génération"
```

### **5. Console (F12)**
```
🌐 DeepL Translation Request: { targetLang: "DE" }
📄 DeepL: Document translation detected
📤 Upload document vers DeepL...
✅ Document uploadé: abc123
⏳ Traduction en cours...
📊 Statut: done
📥 Téléchargement du document traduit...
✅ Document traduit disponible
```

### **6. Résultat**
```
┌─────────────────────────────────────────┐
│                                    🗑️   │
│            📄                           │
│      rapport_Q4.pdf                     │
│           PDF                           │
│      [📥 Télécharger]                   │
│      🌐 Traduction DeepL                │
└─────────────────────────────────────────┘
```

### **7. Télécharger**
```
Clic sur "Télécharger"
→ traduit_rapport_Q4.pdf (en allemand)
```

---

## 🎯 RÉSUMÉ

### **Principe**
**La langue est détectée automatiquement depuis la description du projet**

### **Mots-clés**
- Allemand, Espagnol, Français, Italien, Portugais, etc.
- 30+ langues supportées

### **Priorité**
1. Champ dédié (si existe)
2. Détection automatique
3. Par défaut : Anglais

### **Workflow**
1. Écrire la langue dans la description
2. Attacher le fichier
3. Sélectionner DeepL
4. Générer
5. Télécharger le document traduit

---

**Mentionnez simplement la langue cible dans la description du projet, et DeepL fera le reste !** 🌐🚀
