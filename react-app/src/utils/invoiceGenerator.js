/**
 * Générateur de factures automatique
 * Crée une facture à chaque recharge
 * Sauvegarde en double : localStorage (client) + serveur (base de données)
 *
 * IMPORTANT : Le numéro de facture est désormais attribué CÔTÉ SERVEUR
 * (compteur partagé entre tous les appareils). Le client ne fait que
 * récupérer le numéro attribué dans la réponse de l'API.
 */

import { saveInvoiceToServer } from '../services/invoiceApi.js';

/**
 * Crée une nouvelle facture et la sauvegarde
 * @param {number} amount - Montant de la recharge (HT)
 * @param {string} userEmail - Email de l'utilisateur
 * @param {string} paymentMethod - Méthode de paiement (ex: 'stripe', 'card')
 * @returns {Promise<object>} - La facture créée (avec numéro attribué par le serveur)
 */
export const createInvoice = async (amount, userEmail, paymentMethod = 'stripe') => {
  const invoice = {
    id: `inv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    number: null, // Attribué par le serveur
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

  // Sauvegarder la facture (le numéro est attribué par le serveur)
  await saveInvoice(invoice);

  return invoice;
};

/**
 * Sauvegarde une facture sur le serveur, puis en localStorage
 * @param {object} invoice - La facture à sauvegarder (son `number` sera mis à jour)
 * @param {string} htmlContent - Le contenu HTML de la facture (optionnel)
 * @returns {Promise<object>} - Le résultat de l'API
 */
export const saveInvoice = async (invoice, htmlContent = null) => {
  // 1. Sauvegarder sur le serveur (base de données) — le numéro y est attribué
  let result = { success: false };
  try {
    result = await saveInvoiceToServer(invoice, htmlContent);
    // Récupérer le numéro attribué par le serveur et mettre à jour la facture
    if (result.success && result.invoice && result.invoice.invoiceNumber) {
      invoice.number = result.invoice.invoiceNumber;
    }
  } catch (error) {
    console.warn('⚠️ Erreur sauvegarde facture sur le serveur:', error);
  }

  // 2. Sauvegarder en local (localStorage) — avec le numéro serveur si disponible
  const invoices = getInvoices();
  invoices.unshift(invoice); // Ajouter au début (plus récent en premier)
  localStorage.setItem('user_invoices', JSON.stringify(invoices));

  return result;
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
