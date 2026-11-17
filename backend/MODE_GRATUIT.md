# 🆓 Mode Gratuit - Assistant Rédacteur

## Vue d'ensemble

Le mode gratuit permet aux utilisateurs **non connectés** ou **sans crédits** d'utiliser l'Assistant Rédacteur avec des limitations.

## Fonctionnement

### Activation automatique

Le mode gratuit s'active automatiquement dans les cas suivants :
1. **Utilisateur non connecté** (pas de token JWT)
2. **Utilisateur connecté mais sans crédits** (< 10 crédits)

### Modèle IA utilisé

- **Service** : OpenRouter
- **Modèle** : `moonshotai/kimi-k2:free`
- **Caractéristiques** :
  - 1 trillion de paramètres totaux
  - 32 milliards de paramètres actifs
  - Contexte jusqu'à 128K tokens
  - Optimisé pour le code, le raisonnement et l'utilisation d'outils

## Limitations

### Par requête
- **Max tokens** : 1000 tokens par génération (vs 2000 en mode payant)
- **Température** : 0.7 (identique au mode payant)

### Par jour (par IP)
- **Limite** : 20 requêtes par jour
- **Réinitialisation** : Toutes les 24h
- **Message d'erreur** : Indique le nombre d'heures avant réinitialisation

### Pas de déduction de crédits
- Les requêtes en mode gratuit ne déduisent **aucun crédit**
- Idéal pour tester le service avant de s'inscrire

## Configuration

### Variables d'environnement

```env
# Clé OpenRouter pour le mode gratuit
OPENROUTER_FREE_API_KEY=sk-or-v1-xxxxxxxxxxxxx
```

### Obtenir une clé OpenRouter

1. Créer un compte sur [OpenRouter](https://openrouter.ai/)
2. Aller dans [Settings > Keys](https://openrouter.ai/settings/keys)
3. Créer une nouvelle clé API
4. Ajouter la clé dans les variables d'environnement O2Switch :
   - Panel O2Switch → Node.js Selector → Application → Environment Variables
   - Nom : `OPENROUTER_FREE_API_KEY`
   - Valeur : votre clé OpenRouter

## Réponse API

### Format de réponse en mode gratuit

```json
{
  "success": true,
  "content": "Contenu généré...",
  "usage": {
    "prompt_tokens": 50,
    "completion_tokens": 200,
    "total_tokens": 250
  },
  "service": "openrouter-free",
  "model": "moonshotai/kimi-k2:free",
  "freeMode": true,
  "freeModeStats": {
    "requestsUsed": 5,
    "requestsRemaining": 15,
    "resetTime": 1733598000000
  }
}
```

### Erreur limite atteinte

```json
{
  "success": false,
  "error": "Limite gratuite atteinte",
  "message": "Vous avez atteint la limite de 20 requêtes gratuites par jour. Réessayez dans 8h ou créez un compte pour plus de crédits.",
  "freeMode": true,
  "limitReached": true,
  "resetIn": 8
}
```

## Middlewares

### `checkFreeMode`
Détermine si le mode gratuit doit être activé :
- Vérifie l'authentification
- Vérifie le solde de crédits
- Active `req.freeMode = true` si nécessaire

### `rateLimitFreeMode`
Limite les requêtes en mode gratuit :
- Suit les requêtes par IP
- Bloque après 20 requêtes/jour
- Réinitialise automatiquement après 24h

### `getFreeModeConfig`
Retourne la configuration du mode gratuit :
- Service : `openrouter-free`
- Modèle : `moonshotai/kimi-k2:free`
- Max tokens : 1000
- Clé API système

## Utilisation dans le code

### Route AI

```javascript
router.post('/generate',
  authenticateToken,     // Optionnel : définit req.user si token présent
  checkFreeMode,         // Détermine si mode gratuit activé
  rateLimitFreeMode,     // Limite les requêtes en mode gratuit
  async (req, res) => {
    // Si req.freeMode === true, utilise Kimi K2 Free
    // Sinon, utilise le service/modèle demandé par l'utilisateur
  }
);
```

## Avantages

### Pour les utilisateurs
- ✅ Tester le service sans inscription
- ✅ Continuer à utiliser l'outil même sans crédits
- ✅ Découvrir les fonctionnalités avant de payer

### Pour le service
- ✅ Acquisition d'utilisateurs (essai gratuit)
- ✅ Réduction du taux de rebond
- ✅ Coût maîtrisé (modèle gratuit + limitation)
- ✅ Incitation à l'inscription (limitations)

## Monitoring

### Logs
```
🆓 Mode gratuit activé : not_authenticated
🆓 Mode gratuit activé pour user 18 : crédits insuffisants (5)
🆓 Mode gratuit : 5/20 requêtes utilisées pour IP 192.168.1.1
```

### Métriques à surveiller
- Nombre de requêtes gratuites par jour
- Taux de conversion gratuit → payant
- Utilisation de la clé OpenRouter
- IPs bloquées pour abus

## Sécurité

### Protection contre les abus
- Limitation par IP (20/jour)
- Pas de bypass possible sans VPN
- Réinitialisation automatique
- Pas de déduction de crédits

### Recommandations
- Surveiller l'utilisation de la clé OpenRouter
- Ajuster les limites si nécessaire
- Bloquer les IPs abusives si détectées

## Migration

### Passer du mode gratuit au mode payant
1. L'utilisateur s'inscrit
2. L'utilisateur achète des crédits
3. Le système détecte automatiquement les crédits
4. Le mode gratuit se désactive automatiquement
5. L'utilisateur utilise ses propres clés API

Aucune action manuelle requise ! 🎉
