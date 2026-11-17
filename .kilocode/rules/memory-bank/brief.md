# Project Brief: assistant_redactionnel

## Description
Plateforme web de génération et de publication de contenu assistée par IA (Assistant Rédacteur). Permet la création de textes via divers modèles (Claude, GPT-4, Gemini), la génération d'images, la gestion de crédits, et la multidiffusion sur les réseaux sociaux avec un calendrier intégré.

## État au 2026-11-09
- **Facturier** : factures SCB modifiables sous le même numéro, échéance à 30 jours par défaut, numérotation serveur anti-doublon.
- **Devis** : module `/devis`, conversion en facture (`DEV-…` → `SCB-…`), mêmes identité et style que le facturier.
- **Modèles IA à jour** : Claude Sonnet 5.5 / Haiku 5.5, GPT-5.6 Terra / Luna, Seedream 5.0 Lite (TTI + Edit), GPT Image 2.6 (Flare + Sunburst).
- **Images de référence** : rôles (sujet/décor/style) et force traduits en consignes de prompt.
- **Tarifs** : affichés uniquement en infobulle sur les cartes IA (texte, image, vidéo).
- **Erreurs fournisseurs** : messages explicites en français (crédits, modèle obsolète, clé, quota) + pop-up ciblé.
- **Images de référence** : persistées en IndexedDB, restaurées après rechargement.
- **Non retenu** : Batch API et prompt caching (pas adaptés au flux interactif actuel).
- **Dépôt** : `github.com/remibuffin-source/assistant-redacteur` (privé), branche `main`.
- **Secrets** : uniquement en variables d'environnement (cPanel O2Switch en production,
  `.env` local en développement). Aucun secret versionné.
- **SMTP** : lu depuis `process.env` en priorité, fallback `config/smtp.json` legacy.
