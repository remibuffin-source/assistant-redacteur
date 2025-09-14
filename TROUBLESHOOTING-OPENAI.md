# Guide de Dépannage - Erreurs OpenAI

## Erreur: "Failed to deserialize the JSON body into the target type"

### Symptômes
- `OpenAI completion error: 400 Failed to deserialize the JSON body into the target type: messages[113]: data did not match any variant of untagged enum ChatCompletionRequestContent at line 1 column 451747`

### Causes possibles

1. **Messages trop longs** : Le message 113 est probablement trop volumineux
2. **Format JSON invalide** : Structure de message incorrecte
3. **Caractères spéciaux** : Caractères non valides dans le contenu
4. **Limites de tokens** : Dépassement des limites d'OpenAI

### Solutions

#### 1. Vérification de la configuration

```bash
# Vérifiez que votre fichier .env.local existe
ls -la react-app/.env.local

# Vérifiez le contenu (sans afficher les clés réelles)
grep -E "VITE_OPENAI|VITE_APP" react-app/.env.local
```

#### 2. Validation de la structure des messages

La structure OpenAI doit respecter ce format :

```json
{
  "model": "gpt-4",
  "messages": [
    {
      "role": "system",
      "content": "Votre message système"
    },
    {
      "role": "user", 
      "content": "Votre prompt utilisateur"
    }
  ],
  "temperature": 0.7,
  "max_tokens": 2000
}
```

#### 3. Limitation de la longueur

```javascript
// Dans votre code, limitez la longueur des messages
function truncateContent(content, maxLength = 4000) {
  if (content.length > maxLength) {
    console.warn(`Contenu tronqué de ${content.length} à ${maxLength} caractères`);
    return content.substring(0, maxLength) + '... [contenu tronqué]';
  }
  return content;
}
```

#### 4. Nettoyage du contenu

```javascript
function cleanContent(content) {
  return content
    .replace(/[^\x00-\x7F]/g, '') // Supprime les caractères non-ASCII
    .replace(/\s+/g, ' ')         // Normalise les espaces
    .trim();
}
```

### Test de diagnostic

1. **Test de connexion basique** :
```bash
curl -X POST "https://api.openai.com/v1/chat/completions" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $VITE_OPENAI_API_KEY" \
  -d '{
    "model": "gpt-3.5-turbo",
    "messages": [{"role": "user", "content": "Hello"}],
    "max_tokens": 10
  }'
```

2. **Vérification des variables d'environnement** :
```javascript
console.log('OpenAI Key configured:', !!import.meta.env.VITE_OPENAI_API_KEY);
console.log('Key length:', import.meta.env.VITE_OPENAI_API_KEY?.length);
```

### Prévention des erreurs

1. **Validation des entrées** :
```javascript
function validateAIData(data) {
  const errors = [];
  
  if (!data.content || data.content.trim().length === 0) {
    errors.push('Le contenu ne peut pas être vide');
  }
  
  if (data.content.length > 10000) {
    errors.push('Le contenu est trop long (max 10000 caractères)');
  }
  
  return errors;
}
```

2. **Logging détaillé** :
```javascript
// Activez le mode debug dans .env.local
VITE_DEBUG=true

// Dans votre code
if (import.meta.env.VITE_DEBUG === 'true') {
  console.log('OpenAI Request:', {
    model: options.model,
    messageLength: messages.length,
    contentLength: messages.reduce((acc, msg) => acc + msg.content.length, 0)
  });
}
```

### Fallback en cas d'erreur

```javascript
try {
  return await this.callOpenAIAPI(prompt, options);
} catch (error) {
  if (error.message.includes('deserialize') || error.message.includes('400')) {
    console.warn('Erreur de désérialisation, utilisation du mode simulation');
    return await this.simulateAICall(aiType, data);
  }
  throw error;
}
```

### Support supplémentaire

- Documentation OpenAI: https://platform.openai.com/docs/guides/error-codes
- Limites d'API: https://platform.openai.com/docs/guides/rate-limits
- Validation JSON: https://jsonlint.com/