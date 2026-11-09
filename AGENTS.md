# AGENTS.md — Règles du projet Assistant Rédacteur

## Commandes de vérification
- Frontend : `cd react-app && npm run build`
- Lint ciblé : `cd react-app && npx eslint src/<fichier>`
- Backend : `cd backend && node --check <fichier>`

## Règle d'or avant toute modification
1. **Comparer avec la version commitée** : `git diff -- <fichier>` et `git show HEAD:<fichier>`.
2. Si le comportement actuel fonctionne, **ne pas le remplacer** sans raison explicite.
3. Toute modification d'un fichier listé ci-dessous doit être annoncée et justifiée.
4. Ne jamais livrer une régression « silencieuse » : vérifier le build et le comportement.

> Origine d'une régression réelle (2026-11-09) : la dictée vocale fonctionnait (redémarrage
> automatique de `SpeechRecognition.onend`). Des modifications non commitées ont remplacé ce
> comportement par un arrêt après 3 s de silence, sans comparaison avec la version commitée.
> Résultat : dictée coupée en permanence. **Toujours diffuser le diff avant de modifier.**

## Zones protégées (ne pas modifier sans validation explicite)

### 1. Dictée vocale — `react-app/src/components/UploadArea.jsx`
Comportement validé :
- `recognition.continuous = true`, `interimResults = true`
- **Redémarrage automatique** dans `onend` tant que `dictationActiveRef.current` est vrai
- `no-speech` et `aborted` ne doivent **jamais** arrêter la dictée
- **Aucun timeout de silence** ne doit arrêter la reconnaissance
- Les refs `dictationBaseRef` / `dictationFinalRef` évitent les closures obsolètes

### 2. Authentification — `backend/middleware/auth.js`, `backend/routes/auth.js`
- Le middleware tolère l'absence de token mais rejette les JWT invalides/expirés (403).
- Ne pas contourner l'authentification des routes facturier/devis.

### 3. Facturier / devis — `backend/routes/invoices.js`
- Numérotation **côté serveur** uniquement (SCB, FACT-, DEV-) avec verrou anti-doublon.
- Anti-écrasement : ne jamais réutiliser un numéro existant.
- Les routes HTML sont protégées par `authenticateToken`.

### 4. Modèles IA — `react-app/src/services/aiService.js`, `backend/routes/imageGeneration.js`
- IDs actuels : `claude-sonnet-5-5`, `claude-haiku-5-5`, `gpt-5.6-terra`, `gpt-5.6-luna`,
  `seedream/v5/lite/text-to-image`, `seedream/v5/lite/edit`.
- Le payload v5 edit n'accepte **pas** `strength`, `guidance_scale`, `negative_prompt`.
- `image_urls` est un tableau (max 10 utilisées).

### 5. Persistance des images de référence
- `react-app/src/utils/referenceImageStore.js` (IndexedDB) est la source de vérité
  pour les données binaires, les rôles (style/décor/sujet) et la force.
- Ne jamais remplacer les pièces jointes riches par les seules métadonnées serveur.
- `localStorage` ne doit pas contenir de base64 (quota ~5 Mo).

### 6. Erreurs fournisseurs — `backend/utils/providerErrors.js`
- Messages utilisateur en français + code machine (`credits`, `payment`, `model`,
  `auth`, `rate_limit`).
- Ne pas revenir à un simple statusText (« Forbidden »).

## Sauvegardes
- Avant modification d'un fichier sensible : copie dans `.backup/<description>-<timestamp>/`.
- Fichiers sensibles : > 500 lignes, auth/paiement, facturier, composants de dictée,
  fichiers non commités.

## Déploiement O2Switch
- Backend : `/home/bure7653/assistant-redacteur/backend/...`
- Frontend : `public_html/` (supprimer les anciens bundles hashés avant upload)
- **Restart Node.js** obligatoire après toute modification backend.
