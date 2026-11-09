# Architecture

Architecture monolithique modulaire. Backend avec routes séparées (auth, ai, storage, publications). Frontend React avec React Router et Tailwind. Base de données relationnelle via Sequelize.

## Modules ajoutés (2026-11-09)
- `backend/utils/providerErrors.js` : classification et traduction des erreurs fournisseurs IA (`credits`, `payment`, `model`, `auth`, `rate_limit`).
- `backend/routes/imageGeneration.js` : endpoint `GET /api/ai/image/fal-balance` (solde réel Fal.ai via l'API de facturation).
- `react-app/src/utils/referenceImageStore.js` : persistance IndexedDB des pièces jointes (localStorage trop limité pour les images base64).
- `react-app/src/utils/authFetch.js` : fetch authentifié avec gestion de l'expiration du JWT (session précédente).
- Facturier : stockage fichiers HTML/JSON par document sous `users/scb/` et `users/scb/devis/`.
