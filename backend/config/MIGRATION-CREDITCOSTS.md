# Migration du système de tarification

## ⚠️ IMPORTANT : creditCosts.js est OBSOLÈTE

Le fichier `config/creditCosts.js` a été remplacé par le nouveau système dynamique basé sur `PricingConfig`.

## 🆕 Nouveau système

### Fichier principal : `utils/creditCalculator.js`

Ce nouveau système :
- ✅ Utilise `PricingConfig` (base de données) pour les coûts de base
- ✅ Applique automatiquement la **marge bénéficiaire** configurée dans l'onglet Tarification
- ✅ Permet de modifier les prix en temps réel sans redéploiement
- ✅ Centralise toute la logique de calcul des crédits

### Fonctions disponibles :

```javascript
import { calculateCredits, estimateCredits, getRechargeOffers } from '../utils/creditCalculator.js';

// Calculer les crédits pour une opération réelle
const credits = await calculateCredits('anthropic', 'claude-3-sonnet', {
  input: 1000,
  output: 500,
  total: 1500
});

// Estimer les crédits avant une opération
const estimate = await estimateCredits('openai', 'gpt-4', 2000);

// Récupérer les offres de recharge
const offers = await getRechargeOffers();
```

## 📊 Formule de calcul

```
Coût final = Coût de base × (1 + Marge / 100)
Crédits = Coût final USD / 0.01
```

Exemple avec une marge de 30% :
- Coût de base : 0.003$ pour 1000 tokens
- Avec marge : 0.003 × 1.30 = 0.0039$
- En crédits : 0.0039 / 0.01 = 0.39 crédits

## 🔄 Fichiers modifiés

1. **`middleware/creditCheck.js`** - Utilise `creditCalculator`
2. **`routes/credits.js`** - Utilise `getRechargeOffers()`
3. **`routes/stripe.js`** - Utilise `getRechargeOffers()`

## 🗑️ À supprimer

Le fichier `config/creditCosts.js` peut être supprimé en toute sécurité.

## ⚙️ Configuration

Les prix se configurent maintenant dans :
- **Interface admin** → Onglet "Tarification"
- **Base de données** → Table `pricing_config`

### Champs configurables :
- `profitMargin` : Marge en % (ex: 30)
- `serviceCosts` : Coûts de base par service et modèle
- `rechargeOffers` : Offres de recharge disponibles

## 🎯 Avantages

1. **Dynamique** : Changez les prix sans redéployer
2. **Transparent** : La marge est clairement visible et configurable
3. **Centralisé** : Une seule source de vérité (PricingConfig)
4. **Flexible** : Ajoutez de nouveaux modèles facilement
