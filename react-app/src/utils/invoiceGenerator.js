/**
 * Générateur de factures automatique
 * Crée une facture à chaque recharge
 */

/**
 * Génère un numéro de facture unique
 * Format: FACT-YYYYMMDD-XXXX
 */
export const generateInvoiceNumber = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  // Récupérer le compteur du jour
  const counterKey = `invoice_counter_${year}${month}${day}`;
  let counter = parseInt(localStorage.getItem(counterKey) || '0', 10) + 1;
  localStorage.setItem(counterKey, counter.toString());
  
  const counterStr = String(counter).padStart(4, '0');
  return `FACT-${year}${month}${day}-${counterStr}`;
};

/**
 * Crée une nouvelle facture et la sauvegarde
 * @param {number} amount - Montant de la recharge (HT)
 * @param {string} userEmail - Email de l'utilisateur
 * @param {string} paymentMethod - Méthode de paiement (ex: 'stripe', 'card')
 * @returns {object} - La facture créée
 */
export const createInvoice = (amount, userEmail, paymentMethod = 'stripe') => {
  const invoice = {
    id: `inv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    number: generateInvoiceNumber(),
    date: new Date().toISOString(),
    amount: parseFloat(amount),
    amountTTC: parseFloat(amount), // TVA 0% - Association exonérée
    tva: 0, // TVA 0%
    userEmail: userEmail,
    paymentMethod: paymentMethod,
    status: 'paid', // paid, pending, cancelled
    items: [
      {
        description: 'Recharge de crédit - Assistant Rédactionnel',
        subtitle: 'Crédit pour utilisation des services d\'aide à l\'écriture et à la diffusion de contenu.',
        quantity: 1,
        unitPrice: parseFloat(amount),
        total: parseFloat(amount)
      }
    ]
  };

  // Sauvegarder la facture
  saveInvoice(invoice);
  
  return invoice;
};

/**
 * Sauvegarde une facture dans localStorage
 * @param {object} invoice - La facture à sauvegarder
 */
export const saveInvoice = (invoice) => {
  const invoices = getInvoices();
  invoices.unshift(invoice); // Ajouter au début (plus récent en premier)
  localStorage.setItem('user_invoices', JSON.stringify(invoices));
};

/**
 * Récupère toutes les factures
 * @returns {array} - Liste des factures
 */
export const getInvoices = () => {
  const stored = localStorage.getItem('user_invoices');
  return stored ? JSON.parse(stored) : [];
};

/**
 * Récupère une facture par son ID
 * @param {string} invoiceId - ID de la facture
 * @returns {object|null} - La facture ou null
 */
export const getInvoiceById = (invoiceId) => {
  const invoices = getInvoices();
  return invoices.find(inv => inv.id === invoiceId) || null;
};

/**
 * Supprime une facture
 * @param {string} invoiceId - ID de la facture à supprimer
 */
export const deleteInvoice = (invoiceId) => {
  const invoices = getInvoices();
  const filtered = invoices.filter(inv => inv.id !== invoiceId);
  localStorage.setItem('user_invoices', JSON.stringify(filtered));
};

/**
 * Calcule le total des factures
 * @returns {object} - Statistiques des factures
 */
export const getInvoiceStats = () => {
  const invoices = getInvoices();
  
  const totalHT = invoices.reduce((sum, inv) => sum + inv.amount, 0);
  const totalTVA = invoices.reduce((sum, inv) => sum + inv.tva, 0);
  const totalTTC = invoices.reduce((sum, inv) => sum + inv.amountTTC, 0);
  
  return {
    count: invoices.length,
    totalHT: totalHT.toFixed(2),
    totalTVA: totalTVA.toFixed(2),
    totalTTC: totalTTC.toFixed(2)
  };
};
