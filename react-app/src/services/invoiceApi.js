/**
 * Service API pour la gestion des factures côté serveur
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://api.assistant-redacteur.fr';

/**
 * Sauvegarde une facture sur le serveur
 * @param {object} invoice - La facture à sauvegarder
 * @param {string} htmlContent - Le contenu HTML de la facture (optionnel)
 * @returns {Promise<object>} - La facture créée
 */
export const saveInvoiceToServer = async (invoice, htmlContent = null) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      console.warn('⚠️ Pas de token, facture non sauvegardée sur le serveur');
      return { success: false, error: 'Non authentifié' };
    }

    const response = await fetch(`${API_BASE_URL}/invoices`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        amount: invoice.amount,
        amountTTC: invoice.amountTTC,
        tva: invoice.tva || 0,
        paymentMethod: invoice.paymentMethod || 'stripe',
        paymentIntentId: invoice.paymentIntentId,
        items: invoice.items || [],
        htmlContent: htmlContent
      })
    });

    const result = await response.json();
    
    if (result.success) {
      console.log('✅ Facture sauvegardée sur le serveur:', result.invoice.invoiceNumber);
    } else {
      console.warn('⚠️ Erreur sauvegarde facture serveur:', result.error);
    }
    
    return result;
  } catch (error) {
    console.error('❌ Erreur API factures:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Récupère les factures de l'utilisateur depuis le serveur
 * @returns {Promise<array>} - Liste des factures
 */
export const getInvoicesFromServer = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      return { success: false, invoices: [], error: 'Non authentifié' };
    }

    const response = await fetch(`${API_BASE_URL}/invoices`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('❌ Erreur récupération factures:', error);
    return { success: false, invoices: [], error: error.message };
  }
};

/**
 * Télécharge une facture depuis le serveur
 * @param {number} invoiceId - ID de la facture
 * @returns {Promise<Blob>} - Le fichier HTML
 */
export const downloadInvoiceFromServer = async (invoiceId) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Non authentifié');
    }

    const response = await fetch(`${API_BASE_URL}/invoices/${invoiceId}/download`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('Erreur téléchargement');
    }

    return await response.blob();
  } catch (error) {
    console.error('❌ Erreur téléchargement facture:', error);
    throw error;
  }
};

/**
 * Synchronise les factures locales avec le serveur
 * (pour les factures créées hors ligne)
 */
export const syncLocalInvoices = async () => {
  try {
    const localInvoices = JSON.parse(localStorage.getItem('user_invoices') || '[]');
    const syncedKey = 'synced_invoice_ids';
    const syncedIds = JSON.parse(localStorage.getItem(syncedKey) || '[]');
    
    for (const invoice of localInvoices) {
      if (!syncedIds.includes(invoice.id)) {
        const result = await saveInvoiceToServer(invoice);
        if (result.success) {
          syncedIds.push(invoice.id);
          localStorage.setItem(syncedKey, JSON.stringify(syncedIds));
        }
      }
    }
    
    console.log('✅ Synchronisation factures terminée');
  } catch (error) {
    console.error('❌ Erreur synchronisation factures:', error);
  }
};
