import { getInvoiceTranslations } from '../i18n/invoiceTranslations';

/**
 * Génère le HTML d'une facture avec support multilingue
 * @param {object} invoice - La facture
 * @param {object} userInfo - Informations utilisateur (userName, userEmail, userAddress, userCompany)
 * @param {string} language - Code de langue (fr, en, es, de)
 * @returns {string} - HTML de la facture
 */
export const generateInvoiceHTML = (invoice, userInfo, language = 'fr') => {
  const t = getInvoiceTranslations(language);
  const { userName, userEmail, userAddress, userCompany } = userInfo;
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    const locale = language === 'en' ? 'en-US' : language === 'es' ? 'es-ES' : language === 'de' ? 'de-DE' : 'fr-FR';
    return date.toLocaleDateString(locale, options);
  };

  const formatCurrency = (amount) => {
    const locale = language === 'en' ? 'en-US' : language === 'es' ? 'es-ES' : language === 'de' ? 'de-DE' : 'fr-FR';
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const statusText = invoice.status === 'paid' ? t.paid : invoice.status === 'pending' ? t.pending : t.cancelled;
  const paymentMethodText = invoice.paymentMethod === 'stripe' ? t.stripe : t.card;

  return `
<!DOCTYPE html>
<html lang="${language}">
<head>
  <meta charset="UTF-8">
  <title>${t.invoice} ${invoice.number}</title>
  <style>
    body { 
      font-family: Arial, sans-serif; 
      padding: 40px; 
      max-width: 900px; 
      margin: 0 auto; 
      background: #f5f5f5;
    }
    .invoice-container {
      background: white;
      border: 2px solid #ddd;
      border-radius: 15px;
      padding: 40px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }
    .header { 
      display: flex; 
      justify-content: space-between; 
      align-items: flex-start;
      margin-bottom: 40px; 
      padding-bottom: 20px; 
      border-bottom: 3px solid #ff6b2c;
    }
    .company-info { 
      text-align: left;
      display: flex;
      align-items: flex-start;
      gap: 20px;
    }
    .company-details h1 {
      color: #ff6b2c;
      margin: 0 0 10px 0;
      font-size: 1.8em;
    }
    .company-details p {
      margin: 5px 0;
      line-height: 1.6;
      color: #333;
    }
    .invoice-info { 
      text-align: right;
    }
    .invoice-info h2 { 
      color: #ff6b2c; 
      margin: 0 0 15px 0;
      font-size: 2em;
    }
    .invoice-info p {
      margin: 5px 0;
      color: #333;
    }
    .details { 
      margin: 30px 0; 
      background: #f9f9f9; 
      padding: 20px; 
      border-radius: 10px;
      border: 1px solid #e0e0e0;
    }
    .details h3 {
      margin-top: 0;
      color: #ff6b2c;
      font-size: 1.2em;
    }
    table { 
      width: 100%; 
      border-collapse: collapse; 
      margin: 30px 0;
      border: 1px solid #ddd;
      border-radius: 8px;
      overflow: hidden;
    }
    th, td { 
      padding: 15px; 
      text-align: left; 
      border-bottom: 1px solid #e0e0e0;
    }
    th { 
      background-color: #ff6b2c; 
      color: white; 
      font-weight: bold;
      font-size: 0.95em;
    }
    tbody tr:last-child td {
      border-bottom: none;
    }
    .total-section { 
      text-align: right; 
      margin-top: 30px;
      padding: 20px;
      background: #f9f9f9;
      border-radius: 10px;
      border: 1px solid #e0e0e0;
    }
    .total-line { 
      display: flex; 
      justify-content: flex-end; 
      margin: 12px 0; 
      font-size: 1.1em;
    }
    .total-line span:first-child { 
      margin-right: 30px;
      color: #666;
    }
    .total-line span:last-child {
      min-width: 120px;
      text-align: right;
      font-weight: 600;
    }
    .tva-exempt {
      font-style: italic;
      color: #666;
      font-size: 0.9em;
    }
    .total-final { 
      font-size: 1.4em; 
      font-weight: bold; 
      color: #ff6b2c; 
      border-top: 2px solid #ff6b2c; 
      padding-top: 15px; 
      margin-top: 15px;
    }
    .footer { 
      margin-top: 50px; 
      text-align: center; 
      color: #666; 
      font-size: 0.9em; 
      border-top: 2px solid #e0e0e0; 
      padding-top: 20px;
    }
    .footer p {
      margin: 8px 0;
    }
    @media print { 
      body { background: white; padding: 0; }
      .invoice-container { 
        border: none; 
        box-shadow: none; 
        border-radius: 0;
      }
    }
  </style>
</head>
<body>
  <div class="invoice-container">
    <div class="header">
      <div class="company-info">
        <div class="company-details">
          <h1>${t.companyName}</h1>
          <p>${t.companyAddress}</p>
          <p>${t.companyEmail}</p>
        </div>
      </div>
      <div class="invoice-info">
        <h2>${t.invoice}</h2>
        <p><strong>${t.invoiceNumber}:</strong> ${invoice.number}</p>
        <p><strong>${t.date}:</strong> ${formatDate(invoice.date)}</p>
        <p><strong>${t.status}:</strong> ${statusText}</p>
      </div>
    </div>

    <div class="details">
      <h3>${t.billTo}</h3>
      <p><strong>${userName || userEmail}</strong></p>
      ${userCompany ? `<p>${userCompany}</p>` : ''}
      <p>${userEmail}</p>
      ${userAddress ? `<p>${userAddress}</p>` : ''}
    </div>

    <table>
      <thead>
        <tr>
          <th>${t.description}</th>
          <th style="text-align: center;">${t.quantity}</th>
          <th style="text-align: right;">${t.unitPrice}</th>
          <th style="text-align: right;">${t.total}</th>
        </tr>
      </thead>
      <tbody>
        ${invoice.items.map(item => `
          <tr>
            <td>
              <strong>${t.creditRecharge}</strong><br>
              <span style="font-size: 0.9em; color: #666;">${t.creditSubtitle}</span>
            </td>
            <td style="text-align: center;">${item.quantity}</td>
            <td style="text-align: right;">${formatCurrency(item.unitPrice)}</td>
            <td style="text-align: right;">${formatCurrency(item.total)}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>

    <div class="total-section">
      <div class="total-line">
        <span>${t.subtotal}:</span>
        <span>${formatCurrency(invoice.amount)}</span>
      </div>
      <div class="total-line tva-exempt">
        <span>${t.vat} (0%):</span>
        <span>${formatCurrency(0)}</span>
      </div>
      <div class="total-line total-final">
        <span>${t.totalTTC}:</span>
        <span>${formatCurrency(invoice.amountTTC)}</span>
      </div>
    </div>

    <div class="details" style="margin-top: 30px;">
      <p><strong>${t.paymentMethod}:</strong> ${paymentMethodText}</p>
    </div>

    <div class="footer">
      <p><strong>${t.thankYou}</strong></p>
      <p>${t.footer}</p>
      <p>${t.companyName} - ${t.companyAddress}</p>
    </div>
  </div>
</body>
</html>
  `;
};

/**
 * Génère et télécharge le PDF d'une facture
 * @param {object} invoice - La facture
 * @param {object} userInfo - Informations utilisateur
 * @param {string} language - Code de langue
 */
export const downloadInvoicePDF = (invoice, userInfo, language = 'fr') => {
  const html = generateInvoiceHTML(invoice, userInfo, language);
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${invoice.number}.html`;
  link.click();
  URL.revokeObjectURL(url);
  
  // Ouvrir dans un nouvel onglet pour impression
  const printWindow = window.open('', '_blank');
  printWindow.document.write(html);
  printWindow.document.close();
};
