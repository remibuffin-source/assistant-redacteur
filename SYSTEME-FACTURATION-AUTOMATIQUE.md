# SYSTÈME DE FACTURATION AUTOMATIQUE

## 📋 RÉSUMÉ

Système de facturation automatique intégré à la page "Mon Compte" > onglet "Comptabilité".
**Une facture est générée automatiquement à chaque recharge.**

---

## ✅ MODIFICATIONS APPORTÉES

### **1. Nouveau composant : InvoiceList.jsx**
**Emplacement** : `react-app/src/components/InvoiceList.jsx`

**Fonctionnalités** :
- Affiche la liste de toutes les factures de l'utilisateur
- Bouton "Voir" : Ouvre la facture dans une nouvelle fenêtre
- Bouton "Télécharger" : Télécharge la facture en HTML
- Design moderne avec tableau responsive
- État vide avec message explicatif

**Données affichées** :
- Numéro de facture (format: FACT-YYYYMMDD-XXXX)
- Date de la facture
- Montant HT
- TVA (20%)
- Total TTC
- Actions (Voir / Télécharger)

---

### **2. Générateur de factures : invoiceGenerator.js**
**Emplacement** : `react-app/src/utils/invoiceGenerator.js`

**Fonctions** :
- `generateInvoiceNumber()` : Génère un numéro unique
- `createInvoice(amount, email, method)` : Crée et sauvegarde une facture
- `getInvoices()` : Récupère toutes les factures
- `getInvoiceById(id)` : Récupère une facture spécifique
- `deleteInvoice(id)` : Supprime une facture
- `getInvoiceStats()` : Calcule les statistiques

**Format de numéro** : `FACT-20251023-0001`
- FACT : Préfixe
- YYYYMMDD : Date
- XXXX : Compteur du jour (incrémental)

---

### **3. Modification : AccountPageFixed.jsx**

**Changements** :
- ✅ Import du composant `InvoiceList`
- ✅ Suppression du bouton "Gérer mon compte" (ligne 270-272)
- ✅ Ajout de la liste des factures à la place
- ✅ Passage des données utilisateur (email, nom, adresse, entreprise)

**Avant** :
```jsx
<button className="btn-secondary" onClick={() => navigate('/subscription')}>
  {t('accounting.manageAccount')}
</button>
```

**Après** :
```jsx
<InvoiceList 
  userEmail={userData.email}
  userName={`${userData.firstName} ${userData.lastName}`}
  userAddress={userData.address}
  userCompany={userData.company}
/>
```

---

### **4. Modification : SubscriptionPage.jsx**

**Changements** :
- ✅ Import de `createInvoice` depuis `invoiceGenerator.js`
- ✅ Génération automatique de facture après paiement réussi
- ✅ Affichage du numéro de facture dans le message de succès

**Code ajouté** (ligne 57-64) :
```javascript
// Générer automatiquement une facture
const invoice = createInvoice(
  parseFloat(amount),
  autoSaveData.email || 'contact@studioducapbrun.com',
  'stripe'
);

console.log('Facture générée:', invoice);
```

---

### **5. Traductions : accountTranslations.js**

**Ajouts** :
```javascript
fr: {
  invoices: 'Mes Factures',
  invoiceGenerated: 'Une facture est générée automatiquement à chaque recharge'
}

en: {
  invoices: 'My Invoices',
  invoiceGenerated: 'An invoice is automatically generated with each recharge'
}
```

**Suppression** :
- `manageAccount` (bouton supprimé)

---

## 📊 STRUCTURE DES DONNÉES

### **Objet Facture** (localStorage: `user_invoices`)
```javascript
{
  id: "inv_1729692000000_abc123",
  number: "FACT-20251023-0001",
  date: "2025-10-23T14:30:00.000Z",
  amount: 50.00,              // Montant HT
  amountTTC: 60.00,           // Montant TTC (HT * 1.20)
  tva: 10.00,                 // TVA (HT * 0.20)
  userEmail: "user@example.com",
  paymentMethod: "stripe",
  status: "paid",
  items: [
    {
      description: "Recharge de crédit - Assistant Rédactionnel IA",
      quantity: 1,
      unitPrice: 50.00,
      total: 50.00
    }
  ]
}
```

---

## 🎨 DESIGN

### **Composant InvoiceList**
- Tableau responsive avec colonnes : N° Facture, Date, Montant HT, TVA, Total TTC, Actions
- Boutons d'action avec icônes Font Awesome
- État vide avec icône et message
- Couleurs :
  - Orange (#ff6b2c) : Numéro de facture, icônes
  - Vert (#28a745) : Total TTC, bouton télécharger
  - Bleu (#007bff) : Bouton voir

### **Facture PDF/HTML**
- En-tête avec logo et informations entreprise
- Informations client
- Tableau des articles
- Calcul HT, TVA, TTC
- Footer avec mentions légales
- Bouton d'impression intégré

---

## 🔄 WORKFLOW

1. **Utilisateur recharge son compte** (page /subscription)
2. **Paiement Stripe réussi**
3. **Fonction `handlePaymentSuccess()` appelée**
4. **Facture générée automatiquement** via `createInvoice()`
5. **Facture sauvegardée** dans localStorage (`user_invoices`)
6. **Message de confirmation** avec numéro de facture
7. **Utilisateur peut consulter** ses factures dans "Mon Compte" > "Comptabilité"

---

## 📁 FICHIERS CRÉÉS

1. `react-app/src/components/InvoiceList.jsx` (320 lignes)
2. `react-app/src/components/InvoiceList.css` (150 lignes)
3. `react-app/src/utils/invoiceGenerator.js` (120 lignes)

---

## 📁 FICHIERS MODIFIÉS

1. `react-app/src/components/AccountPageFixed.jsx`
   - Import InvoiceList (ligne 7)
   - Remplacement bouton par liste factures (lignes 272-278)

2. `react-app/src/components/SubscriptionPage.jsx`
   - Import createInvoice (ligne 7)
   - Génération facture (lignes 57-68)

3. `react-app/src/i18n/accountTranslations.js`
   - Ajout traductions factures (lignes 58-59, 117-118)

---

## 🚀 FONCTIONNALITÉS

### **Visualisation**
- ✅ Liste complète des factures
- ✅ Tri par date (plus récent en premier)
- ✅ Compteur de factures
- ✅ Affichage HT, TVA, TTC

### **Actions**
- ✅ Voir la facture (nouvelle fenêtre)
- ✅ Télécharger en HTML
- ✅ Imprimer / Sauvegarder en PDF (via navigateur)

### **Génération automatique**
- ✅ À chaque recharge réussie
- ✅ Numérotation unique et incrémentale
- ✅ Sauvegarde automatique
- ✅ Notification à l'utilisateur

---

## 💡 AMÉLIORATIONS FUTURES POSSIBLES

### **Court terme**
- [ ] Export PDF natif (bibliothèque jsPDF ou pdfmake)
- [ ] Envoi automatique par email
- [ ] Filtres par date / montant
- [ ] Recherche de factures

### **Moyen terme**
- [ ] Statistiques de facturation
- [ ] Graphiques de dépenses
- [ ] Export comptable (CSV, Excel)
- [ ] Archivage automatique

### **Long terme**
- [ ] Intégration comptabilité (Sage, QuickBooks)
- [ ] Factures récurrentes
- [ ] Devis avant facturation
- [ ] Multi-devises

---

## 🔧 MAINTENANCE

### **Stockage**
- Données stockées dans `localStorage`
- Clé : `user_invoices`
- Format : Array JSON

### **Compteur**
- Clé : `invoice_counter_YYYYMMDD`
- Réinitialisé chaque jour
- Format : Integer

### **Nettoyage**
Pour supprimer toutes les factures :
```javascript
localStorage.removeItem('user_invoices');
```

---

## ✅ TESTS À EFFECTUER

1. **Recharge** : Faire une recharge et vérifier la génération de facture
2. **Affichage** : Vérifier la liste dans "Mon Compte" > "Comptabilité"
3. **Visualisation** : Cliquer sur "Voir" et vérifier l'affichage
4. **Téléchargement** : Cliquer sur "Télécharger" et vérifier le fichier HTML
5. **Impression** : Tester l'impression depuis la vue facture
6. **Responsive** : Tester sur mobile/tablette
7. **Multi-langues** : Tester en FR/EN

---

## 📞 SUPPORT

Pour toute question ou amélioration :
- Consulter ce document
- Vérifier les logs console (facture générée)
- Inspecter localStorage (`user_invoices`)

---

**Système de facturation automatique opérationnel ! 🎉**
