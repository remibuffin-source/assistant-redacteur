# 🔄 Migration Frontend - Système de Crédits

## 📋 Modifications effectuées

### 1️⃣ **Nouveau service AI (`aiService.js`)**

L'ancien service qui appelait directement les APIs externes a été remplacé par un service qui passe par le backend.

**Avant :**
```javascript
// Appel direct à Anthropic
const response = await fetch('https://api.anthropic.com/v1/messages', {
  headers: { 'x-api-key': apiKey }
});
```

**Après :**
```javascript
// Appel au backend qui gère tout
const response = await fetch('/api/ai/generate', {
  headers: { 'Authorization': `Bearer ${token}` },
  body: JSON.stringify({ service: 'anthropic', model, messages })
});
```

### 2️⃣ **Composant CreditIndicator**

Nouveau composant pour afficher :
- Le solde de crédits actuel
- Le coût estimé de la génération
- Un avertissement si les crédits sont faibles
- Un bouton pour recharger

**Utilisation :**
```jsx
import CreditIndicator from './components/CreditIndicator';

<CreditIndicator 
  aiType="claude-sonnet" 
  estimatedTokens={1000}
  showEstimate={true}
/>
```

### 3️⃣ **Fichiers modifiés**

- ✅ `src/services/aiService.js` - Nouveau service via backend
- ✅ `src/services/aiServiceOld.js` - Ancien service (backup)
- ✅ `src/components/CreditIndicator.jsx` - Indicateur de crédits
- ✅ `src/components/CreditIndicator.css` - Styles

## 🎯 Avantages

### **Sécurité**
- ✅ Clés API stockées côté serveur uniquement
- ✅ Impossible de contourner la facturation
- ✅ Authentification JWT requise

### **Facturation**
- ✅ Vérification automatique des crédits avant génération
- ✅ Déduction automatique après génération
- ✅ Utilisation des tarifs dynamiques configurés par l'admin

### **Expérience utilisateur**
- ✅ Affichage du solde en temps réel
- ✅ Estimation du coût avant génération
- ✅ Messages d'erreur clairs si crédits insuffisants

## 🔧 Intégration dans les composants existants

### **Exemple : Page d'édition**

```jsx
import React, { useState } from 'react';
import AIService from '../services/aiService';
import CreditIndicator from './CreditIndicator';

const EditorPage = () => {
  const [selectedAI, setSelectedAI] = useState('claude-sonnet');
  const [content, setContent] = useState('');
  const [result, setResult] = useState(null);

  const handleGenerate = async () => {
    const response = await AIService.generateContent(selectedAI, {
      content,
      projectData: { /* ... */ },
      tasks: ['improve'],
      format: 'article'
    });

    if (response.success) {
      setContent(response.content);
      
      // Afficher les crédits déduits
      console.log(`Crédits déduits : ${response.credits.deducted}`);
      console.log(`Crédits restants : ${response.credits.remaining}`);
    } else {
      // Gérer les erreurs
      if (response.needsRecharge) {
        // Rediriger vers la page de recharge
        window.location.href = '/subscription';
      } else {
        alert(response.error);
      }
    }
  };

  return (
    <div>
      <CreditIndicator 
        aiType={selectedAI} 
        estimatedTokens={1000}
      />
      
      <textarea 
        value={content} 
        onChange={(e) => setContent(e.target.value)}
      />
      
      <button onClick={handleGenerate}>
        Générer avec {selectedAI}
      </button>
      
      {result && <div>{result}</div>}
    </div>
  );
};
```

## 📊 Gestion des erreurs

### **Crédits insuffisants (402)**

```javascript
if (response.status === 402) {
  // Afficher un modal de recharge
  showRechargeModal({
    required: result.required,
    available: result.available
  });
}
```

### **Clé API non configurée (404)**

```javascript
if (response.status === 404) {
  // Informer l'utilisateur de contacter l'admin
  alert('Les clés API ne sont pas configurées. Contactez l\'administrateur.');
}
```

### **Erreur API (500)**

```javascript
if (response.status === 500) {
  // Erreur serveur ou API externe
  alert(`Erreur : ${result.message}`);
}
```

## 🎨 Personnalisation du CreditIndicator

### **Masquer l'estimation**

```jsx
<CreditIndicator 
  aiType="claude-sonnet" 
  showEstimate={false}
/>
```

### **Changer le nombre de tokens estimés**

```jsx
<CreditIndicator 
  aiType="gpt-4" 
  estimatedTokens={5000}  // Pour une génération longue
/>
```

## 🧪 Tests

### **Test 1 : Génération normale**

```javascript
const result = await AIService.generateContent('claude-sonnet', {
  content: 'Écris un court article sur l\'IA',
  projectData: {},
  tasks: ['write']
});

console.log(result.success); // true
console.log(result.content); // "L'intelligence artificielle..."
console.log(result.credits.deducted); // 0.15
console.log(result.credits.remaining); // 99.85
```

### **Test 2 : Crédits insuffisants**

```javascript
// Avec un compte ayant 0 crédits
const result = await AIService.generateContent('gpt-4', {
  content: 'Long article...',
  projectData: {},
  tasks: ['write']
});

console.log(result.success); // false
console.log(result.needsRecharge); // true
console.log(result.error); // "Crédits insuffisants"
```

### **Test 3 : Estimation de coût**

```javascript
const cost = await AIService.estimateCost('claude-sonnet', 1000);
console.log(cost); // 0.03 (environ)
```

## 🚀 Déploiement

### **1. Build du frontend**

```bash
cd react-app
npm run build
```

### **2. Upload des fichiers**

Via FileZilla, uploader :
```
dist/
src/services/aiService.js
src/services/aiServiceOld.js
src/components/CreditIndicator.jsx
src/components/CreditIndicator.css
```

### **3. Tester**

1. Se connecter sur le site
2. Aller dans l'éditeur
3. Vérifier que le `CreditIndicator` s'affiche
4. Faire une génération
5. Vérifier que les crédits sont déduits

## ⚠️ Points d'attention

### **1. DeepL reste côté client**

DeepL gère les documents et nécessite un traitement spécial. Il continue d'utiliser l'ancien service.

```javascript
if (aiType.includes('deepl')) {
  // Utilise l'ancien service
  return OldAIService.handleDeepLTranslation(data);
}
```

### **2. Gestion du token JWT**

Le token doit être présent dans `localStorage` :

```javascript
const token = localStorage.getItem('token');

if (!token) {
  // Rediriger vers la page de connexion
  window.location.href = '/login';
}
```

### **3. Rafraîchissement du solde**

Le `CreditIndicator` ne se rafraîchit pas automatiquement après une génération. Pour le rafraîchir :

```javascript
// Après une génération réussie
window.dispatchEvent(new Event('creditsUpdated'));

// Dans CreditIndicator
useEffect(() => {
  const handleUpdate = () => fetchCredits();
  window.addEventListener('creditsUpdated', handleUpdate);
  return () => window.removeEventListener('creditsUpdated', handleUpdate);
}, []);
```

## 📝 TODO

- [ ] Intégrer `CreditIndicator` dans tous les composants qui utilisent l'IA
- [ ] Créer un modal de recharge élégant
- [ ] Ajouter un historique des générations avec coûts
- [ ] Implémenter un système de notifications pour crédits faibles
- [ ] Ajouter un graphique de consommation
- [ ] Créer des presets de génération avec coûts affichés

## 🆘 Dépannage

### **Erreur "You must be logged in"**

Le token JWT n'est pas présent ou invalide.

**Solution :**
1. Vérifier que l'utilisateur est connecté
2. Vérifier `localStorage.getItem('token')`
3. Se reconnecter si nécessaire

### **Estimation de coût null**

Les tarifs n'ont pas pu être récupérés.

**Solution :**
1. Vérifier que `/api/ai/pricing` fonctionne
2. Vérifier que l'admin a configuré les tarifs
3. Vérifier les logs backend

### **Crédits non déduits**

Le backend n'a pas déduit les crédits.

**Solution :**
1. Vérifier les logs backend
2. Vérifier que `deductCreditsAfterUsage` est appelé
3. Vérifier la configuration des tarifs
