# Déploiement correctif facturier + devis — 10/09/2026 (mise à jour 2)

## Contexte

Bug initial (09/09) : les numéros de facture (SCB et FACT-) n'incrémentaient plus
et une facture a été écrasée. Cause : le numéro était généré côté navigateur
(localStorage, par appareil) et le serveur écrasait les fichiers sans vérifier
l'unicité.

Améliorations (10/09) :
- Date d'échéance par défaut = date d'émission + 30 jours (modifiable)
- Possibilité de modifier une facture SCB existante (tous les champs) en
  conservant le même numéro, tant qu'elle n'a pas été envoyée au client.
- **Nouveau module DEVIS** (10/09 soir) : générateur de devis séparé, avec
  conversion devis → facture (nouveau numéro SCB-, mention "Issue du devis").

## Corrections et améliorations appliquées

### Incrémentation (09/09)
Le numéro de facture est **généré côté serveur** (compteur partagé entre tous
les appareils), avec anti-écrasement et anti-doublons. Concerne les deux systèmes :
- Factures SCB (Studio du Cap Brun) — format `SCB-YYYYMMDD-XXXX`
- Factures FACT- (recharges de crédit) — format `FACT-YYYYMMDD-XXXX`

### Date d'échéance + édition (10/09) — SCB uniquement
- Champ "Date d'émission" + "Date d'échéance" dans le formulaire
- L'échéance est pré-remplie automatiquement à émission + 30 jours, modifiable
- Bouton "Modifier" (icône crayon) sur chaque facture de la liste
- Le mode édition charge toutes les données dans le formulaire, le bouton
  "Générer" devient "Mettre à jour", appelle PUT (même numéro conservé)
- Bouton "Annuler la modification" pour quitter le mode édition
- Tous les champs sont éditables : client, description, montants, TVA, dates

### Module DEVIS (10/09 soir)
- Nouveau composant `DevisGenerator.jsx` accessible via `/devis`
- Lien "Accéder au devis" depuis le facturier (et "Retour au facturier" depuis le devis)
- Même style que le facturier (couleur, logo, SIRET, coordonnées bancaires)
- Numéro de devis `DEV-YYYYMMDD-XXXX` généré côté serveur (compteur partagé)
- Champs spécifiques : durée de validité (30 jours par défaut, modifiable) +
  modalités de paiement (acompte/solde, modifiable)
- Mentions légales : date, validité, SIRET, APE, TVA non applicable (art. 261 CGI)
- Zone signature client dans le devis
- Boutons sur chaque devis : Voir, Modifier, **Convertir en facture**, Supprimer
- Conversion : crée une nouvelle facture SCB- avec nouveau numéro, copie toutes
  les données, ajoute mention "Issue du devis DEV-..." sur la facture. Le devis
  est marqué "converti" (badge vert ✓ + numéro de facture). Un devis déjà converti
  ne peut plus être modifié ni re-converti.

## Fichiers modifiés

### Backend (1 fichier)
- `backend/routes/invoices.js`
  - `generateScbInvoiceNumber()` (compteur fichier + lock)
  - `generateFactInvoiceNumber()` (compteur fichier + lock + vérif base)
  - `generateDevisNumber()` (compteur fichier + lock, dossier `users/scb/devis/`)
  - `checkAdmin()` factorisé pour les routes devis
  - Route `POST /api/invoices/scb` : numéro serveur + anti-écrasement + placeholder `{{INVOICE_NUMBER}}`
  - Route `POST /api/invoices` : numéro serveur + placeholder `{{INVOICE_NUMBER}}`
  - Route `PUT /api/invoices/scb/:invoiceNumber` : modification facture (même numéro)
  - **Route `POST /api/invoices/scb/devis`** : créer devis + placeholder `{{DEVIS_NUMBER}}`
  - **Route `GET /api/invoices/scb/devis`** : lister devis
  - **Route `GET /api/invoices/scb/devis/:number/html`** : HTML d'un devis
  - **Route `PUT /api/invoices/scb/devis/:number`** : modifier devis (même numéro)
  - **Route `DELETE /api/invoices/scb/devis/:number`** : supprimer devis
  - **Route `POST /api/invoices/scb/devis/:number/convert`** : convertir en facture
    (nouveau numéro SCB-, mention "Issue du devis", devis marqué converti)

### Frontend (5 fichiers — compilés dans dist/)
- `react-app/src/components/InvoiceGenerator.jsx`
  - Placeholder `{{INVOICE_NUMBER}}` dans le HTML
  - Champs date d'émission + date d'échéance (échéance = émission + 30j par défaut)
  - Affichage de l'échéance dans le template HTML
  - Mode édition : bouton "Modifier", chargement des données, PUT, bouton "Annuler"
  - Lien "Accéder au devis" vers `/devis`
- `react-app/src/components/DevisGenerator.jsx` **(nouveau)**
  - Composant complet : formulaire, template HTML devis, liste, édition, conversion
  - Template HTML facture issue d'un devis (avec mention "Issue du devis DEV-...")
- `react-app/src/utils/invoiceGenerator.js` — `createInvoice` async, numéro depuis serveur
- `react-app/src/services/invoiceApi.js` — n'envoie plus `invoiceNumber`
- `react-app/src/components/SubscriptionPage.jsx` — `handlePaymentSuccess` async, `await createInvoice`
- `react-app/src/main.jsx` — import `DevisGenerator` + route `/devis` (protégée admin)

## 📤 Transfert FileZilla sur O2Switch

### Opération 1 : Backend (1 fichier)

| Fichier local | Destination O2Switch |
|---|---|
| `backend\routes\invoices.js` | `/home/bure7653/assistant-redacteur/backend/routes/invoices.js` |

Remplacer le fichier existant.

### Opération 2 : Frontend (dossier dist/)

Le build a été fait le 10/09/2026 (mise à jour 2). Source :
`K:\developpement_app_site_web\assistant_redactionnel\assistant_redacteur\react-app\dist\`

| Fichier/dossier local | Destination O2Switch |
|---|---|
| `dist\index.html` | `public_html/index.html` |
| `dist\assets\` (dossier complet) | `public_html/assets/` |
| `dist\icons\` (dossier complet) | `public_html/icons/` |
| `dist\Studio du Cap Brun.png` | `public_html/Studio du Cap Brun.png` |
| `dist\_redirects` | `public_html/_redirects` |
| `dist\vite.svg` | `public_html/vite.svg` |

### ⚠️ Étapes obligatoires après transfert

1. **Supprimer les anciens fichiers** `index-*.js` et `index-*.css` dans
   `public_html/assets/` AVANT d'uploader les nouveaux (noms hashés différents).
   Les nouveaux noms attendus (build du 10/09/2026 mise à jour 2) :
   - `index-CMKy5ds9.js`
   - `index-DQupovL7.css`
   - `aiService-Bw9GBqhc.js`
   - `aiServiceOld-DvFlXJB6.js`
   - `jszip.min-BkbzgblZ.js`
   (Vérifier le contenu réel de `dist/assets/` au moment du transfert.)

2. **Redémarrer l'application Node.js** dans cPanel O2Switch :
   cPanel → Setup Node.js App → bouton **Restart** sur l'app `assistant-redacteur`.
   Sans redémarrage, le backend continue de charger l'ancien `invoices.js` en mémoire.

## Vérification après déploiement

1. Ouvrir `https://assistant-redacteur.fr` → charge sans erreur console.
2. Facturier SCB (`/facturier`) : créer une facture → numéro attribué par le serveur,
   s'incrémente même en changeant d'appareil. Échéance = émission + 30 jours.
3. Bouton "Modifier" sur une facture → modification possible, même numéro conservé.
4. Lien "Accéder au devis" → page `/devis` s'ouvre.
5. Devis (`/devis`) : créer un devis → numéro `DEV-YYYYMMDD-XXXX` attribué par le serveur.
6. Vérifier le devis : titre "DEVIS", validité 30 jours, zone signature, conditions paiement.
7. Bouton "Convertir en facture" sur un devis → nouvelle facture SCB- créée avec
   mention "Issue du devis DEV-...", le devis est marqué "✓ Converti".
8. Recharge de crédit : le numéro `FACT-YYYYMMDD-XXXX` est attribué par le serveur.

## Sauvegardes (en cas de retour arrière)

- `.backup/facturier-fix-20260909-204746/` — invoices.js, InvoiceGenerator.jsx (SCB incrémentation)
- `.backup/facturier-fix-20260909-210753/` — invoiceGenerator.js, invoiceApi.js, invoices.js (FACT-)
- `.backup/facturier-edit-20260910-182317/` — invoices.js, InvoiceGenerator.jsx (édition + échéance)
- `.backup/devis-20260910-193346/` — invoices.js, main.jsx (module devis)

## Notes

- Le `.gitignore` a été modifié pour ignorer `.backup/` (ne pas transférer sur O2Switch).
- `InvoiceGenerator.jsx` et `DevisGenerator.jsx` ne sont PAS transférés tels quels :
  ils sont compilés dans `dist/assets/index-*.js`.
- Aucune migration DB nécessaire : les compteurs démarrent à 0 mais vérifient
  l'existence des fichiers/factures existantes — les factures déjà créées ne sont
  jamais écrasées ni renumérotées.
- Les factures existantes (créées avant le 10/09) n'ont pas de `dueDate` dans leur
  JSON : l'échéance affichera la date d'émission par défaut (fallback). En les
  modifiant une fois, le champ `dueDate` sera ajouté.
- Les devis sont stockés dans `users/scb/devis/` (séparé des factures `users/scb/invoices/`).
- Un devis converti ne peut plus être modifié ni re-converti (protection anti-doublon).
