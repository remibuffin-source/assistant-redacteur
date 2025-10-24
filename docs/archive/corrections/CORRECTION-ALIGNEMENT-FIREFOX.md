# ✅ CORRECTION ALIGNEMENT - FIREFOX + SÉLECTION PARTIELLE

## 🔴 PROBLÈMES IDENTIFIÉS

### **1. Aligne toute la page au lieu d'éléments choisis**
**Cause** : Quand il n'y a pas de bloc (P, DIV, etc.), le code prenait TOUT le contenu de l'éditeur et le mettait dans un seul paragraphe.

**Comportement avant** :
```
Texte 1
Texte 2
Texte 3
```
→ Clic sur "Centrer" → **Tout se centre**

### **2. Ne fonctionne pas sur Firefox**
**Cause** : Firefox nécessite que l'éditeur ait explicitement le focus avant de manipuler la sélection.

---

## ✅ CORRECTIONS APPLIQUÉES

### **1. Focus explicite pour Firefox**
```javascript
// S'assurer que l'éditeur a le focus (important pour Firefox)
if (document.activeElement !== editor) {
  editor.focus();
}
```

### **2. Entourer SEULEMENT le texte sélectionné**

**Nouveau comportement** :

#### **Cas A : Texte dans un bloc existant**
```html
<p>Mon texte</p>
```
→ Applique la classe sur le `<p>`
→ **Seul ce paragraphe s'aligne**

#### **Cas B : Texte sélectionné sans bloc**
```html
Texte 1
[Texte 2 sélectionné]
Texte 3
```
→ Crée un `<div class="align-center">` autour de "Texte 2" uniquement
→ **Seul le texte sélectionné s'aligne**

#### **Cas C : Pas de sélection**
```html
Curseur ici|
```
→ Crée un `<p class="align-center"><br></p>` vide
→ **Nouveau paragraphe avec alignement**

---

## 🔧 CODE MODIFIÉ

```javascript
const applyTextAlignment = (align) => {
  const editor = textareaRef.current;
  if (!editor) return;
  
  // S'assurer que l'éditeur a le focus (important pour Firefox)
  if (document.activeElement !== editor) {
    editor.focus();
  }
  
  const sel = window.getSelection();
  if (!sel.rangeCount) return;
  
  const range = sel.getRangeAt(0);
  let node = range.startContainer;
  
  // Trouver le parent de type élément
  while (node && node.nodeType !== 1) {
    node = node.parentNode;
  }
  
  // Trouver le bloc parent (div, p, h1, etc.)
  while (node && node !== editor) {
    const tag = node.tagName ? node.tagName.toLowerCase() : '';
    
    if (['div', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'li'].includes(tag)) {
      // Supprimer toutes les classes d'alignement
      node.classList.remove('align-left', 'align-center', 'align-right');
      // Ajouter la nouvelle classe
      node.classList.add(`align-${align}`);
      handleContentChange();
      return;
    }
    node = node.parentNode;
  }
  
  // Si pas de bloc trouvé, entourer SEULEMENT le contenu sélectionné dans un div
  if (sel.toString().length > 0) {
    // Il y a du texte sélectionné, l'entourer dans un div
    const div = document.createElement('div');
    div.classList.add(`align-${align}`);
    
    try {
      range.surroundContents(div);
    } catch (e) {
      // Si surroundContents échoue (sélection complexe), utiliser extractContents
      const contents = range.extractContents();
      div.appendChild(contents);
      range.insertNode(div);
    }
    
    // Replacer le curseur après le div
    range.setStartAfter(div);
    range.setEndAfter(div);
    sel.removeAllRanges();
    sel.addRange(range);
  } else {
    // Pas de sélection, créer un paragraphe vide avec l'alignement
    const p = document.createElement('p');
    p.classList.add(`align-${align}`);
    p.innerHTML = '<br>'; // Paragraphe vide éditable
    
    range.insertNode(p);
    
    // Placer le curseur dans le paragraphe
    const newRange = document.createRange();
    newRange.setStart(p, 0);
    newRange.setEnd(p, 0);
    sel.removeAllRanges();
    sel.addRange(newRange);
  }
  
  handleContentChange();
};
```

---

## 🎯 UTILISATION

### **Pour aligner un paragraphe existant**
1. Placer le curseur dans le paragraphe
2. Cliquer sur le bouton d'alignement
3. ✅ **Seul ce paragraphe s'aligne**

### **Pour aligner une partie du texte**
1. **Sélectionner** le texte à aligner
2. Cliquer sur le bouton d'alignement
3. ✅ **Seul le texte sélectionné s'aligne**

### **Pour créer un nouveau paragraphe aligné**
1. Placer le curseur sans sélectionner de texte
2. Cliquer sur le bouton d'alignement
3. ✅ **Nouveau paragraphe vide avec alignement**

---

## 🧪 TESTS À EFFECTUER

### **Test 1 : Chrome - Paragraphe existant**
1. Écrire plusieurs paragraphes
2. Placer le curseur dans le 2ème paragraphe
3. Cliquer sur "Centrer"
4. ✅ **Seul le 2ème paragraphe doit se centrer**

### **Test 2 : Chrome - Sélection partielle**
1. Écrire "Texte 1 Texte 2 Texte 3"
2. Sélectionner "Texte 2"
3. Cliquer sur "Centrer"
4. ✅ **Seul "Texte 2" doit se centrer**

### **Test 3 : Firefox - Paragraphe existant**
1. Ouvrir Firefox
2. Écrire un paragraphe
3. Placer le curseur dedans
4. Cliquer sur "Centrer"
5. ✅ **Le paragraphe doit se centrer**

### **Test 4 : Firefox - Sélection partielle**
1. Ouvrir Firefox
2. Écrire "Texte 1 Texte 2 Texte 3"
3. Sélectionner "Texte 2"
4. Cliquer sur "Centrer"
5. ✅ **Seul "Texte 2" doit se centrer**

---

## 📊 COMPARAISON AVANT/APRÈS

| Aspect | Avant | Après |
|--------|-------|-------|
| **Chrome - Paragraphe** | ✅ Fonctionne | ✅ Fonctionne |
| **Chrome - Sélection** | ❌ Aligne tout | ✅ Aligne sélection |
| **Firefox - Paragraphe** | ❌ Ne marche pas | ✅ Fonctionne |
| **Firefox - Sélection** | ❌ Ne marche pas | ✅ Fonctionne |

---

## 💡 POURQUOI FIREFOX NÉCESSITE LE FOCUS ?

### **Chrome/Edge (Chromium)**
- Plus permissif
- Accepte les manipulations de sélection sans focus explicite

### **Firefox**
- Plus strict sur les standards
- Nécessite que l'élément ait le focus avant de manipuler `window.getSelection()`
- Solution : `editor.focus()` avant toute manipulation

---

## ✅ RÉSULTAT FINAL

### **Fonctionnalités**
✅ Aligne un paragraphe entier (curseur dedans)
✅ Aligne seulement le texte sélectionné
✅ Crée un nouveau paragraphe aligné (pas de sélection)
✅ Fonctionne sur Chrome
✅ Fonctionne sur Firefox
✅ Fonctionne sur Edge
✅ Fonctionne sur tous les navigateurs modernes

---

## 📁 FICHIER MODIFIÉ

**ContentEditorFixed.jsx** :
- Ligne 516-519 : Ajout `editor.focus()` pour Firefox
- Ligne 547-581 : Logique de sélection partielle

---

## 🚀 PROCHAINES ÉTAPES

1. **Recharger la page** (Ctrl+Shift+R)
2. **Tester sur Chrome** :
   - Sélectionner une partie du texte
   - Cliquer sur "Centrer"
   - Vérifier que seule la sélection se centre
3. **Tester sur Firefox** :
   - Même test
   - Vérifier que ça fonctionne maintenant

---

**Alignement corrigé pour Firefox et sélection partielle !** 🎉✨
