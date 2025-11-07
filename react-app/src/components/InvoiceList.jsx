import { useState, useEffect } from 'react';
import './InvoiceList.css';
import { getInvoiceTranslations } from '../i18n/invoiceTranslations';
import { downloadInvoicePDF } from '../utils/invoicePDFGenerator';

/**
 * Composant pour afficher la liste des factures
 * Chaque recharge génère automatiquement une facture
 */
const InvoiceList = ({ userEmail, userName, userAddress, userCompany, language = 'fr' }) => {
  const [invoices, setInvoices] = useState([]);
  const t = getInvoiceTranslations(language);

  useEffect(() => {
    // Charger les factures depuis localStorage
    const loadInvoices = () => {
      const storedInvoices = localStorage.getItem('user_invoices');
      if (storedInvoices) {
        setInvoices(JSON.parse(storedInvoices));
      }
    };
    loadInvoices();
  }, []);

  // Fonction pour générer le PDF d'une facture
  const generateInvoicePDF = (invoice) => {
    const invoiceHTML = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Facture ${invoice.number}</title>
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
    .logo {
      width: 80px;
      height: 80px;
      object-fit: contain;
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
        border: 2px solid #333;
        box-shadow: none;
      }
    }
  </style>
</head>
<body>
  <div class="invoice-container">
    <div class="header">
      <div class="company-info">
        <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==" alt="Studio du Cap Brun" class="logo" style="display:none;">
        <div class="company-details">
          <h1>Studio du Cap Brun</h1>
          <p>
            83570 COTIGNAC<br>
            <strong>SIRET:</strong> 49483041700031<br>
            <strong>Code NAF/APE:</strong> 59.20Z
          </p>
        </div>
      </div>
      <div class="invoice-info">
        <h2>FACTURE</h2>
        <p><strong>N° ${invoice.number}</strong></p>
        <p>Date: ${new Date(invoice.date).toLocaleDateString('fr-FR')}</p>
        <p>Échéance: ${new Date(invoice.date).toLocaleDateString('fr-FR')}</p>
      </div>
    </div>

    <div class="details">
      <h3>Informations client</h3>
      <p style="margin: 10px 0; line-height: 1.8;">
        <strong style="font-size: 1.1em;">${userName || 'Client'}</strong><br>
        ${userCompany ? userCompany + '<br>' : ''}
        ${userEmail ? userEmail + '<br>' : ''}
        ${userAddress || ''}
      </p>
    </div>

    <table>
      <thead>
        <tr>
          <th>Description</th>
          <th style="text-align: center; width: 100px;">Quantité</th>
          <th style="text-align: right; width: 150px;">Prix unitaire</th>
          <th style="text-align: right; width: 150px;">Total</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>
            <strong style="color: #333; font-size: 1.05em;">Recharge de crédit - Assistant Rédactionnel</strong><br>
            <small style="color: #666; line-height: 1.6;">Crédit pour utilisation des services d'aide à l'écriture et à la diffusion de contenu.</small>
          </td>
          <td style="text-align: center;">1</td>
          <td style="text-align: right;">${invoice.amount.toFixed(2)} €</td>
          <td style="text-align: right;"><strong>${invoice.amount.toFixed(2)} €</strong></td>
        </tr>
      </tbody>
    </table>

    <div class="total-section">
      <div class="total-line">
        <span>Total HT :</span>
        <span>${invoice.amount.toFixed(2)} €</span>
      </div>
      <div class="total-line">
        <span>TVA (0%) :</span>
        <span>0,00 €</span>
      </div>
      <div class="total-line tva-exempt">
        <span>« Association exonérée des impôts commerciaux, conformément à l'article 261 du Code général des impôts (CGI). »</span>
      </div>
      <div class="total-line total-final">
        <span>Total HT :</span>
        <span>${invoice.amount.toFixed(2)} €</span>
      </div>
    </div>

    <div class="footer">
      <p><strong>Conditions de paiement:</strong> Paiement à réception</p>
      <p style="margin-top: 15px;">Merci pour votre confiance !</p>
      <p><strong>Studio du Cap Brun</strong> - Votre partenaire en création de contenu</p>
    </div>
  </div>
</body>
</html>
    `;

    // Créer un Blob et télécharger
    const blob = new Blob([invoiceHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Facture_${invoice.number}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Fonction pour afficher les détails d'une facture
  const viewInvoice = (invoice) => {
    const invoiceWindow = window.open('', '_blank');
    invoiceWindow.document.write(`
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Facture ${invoice.number}</title>
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
    .logo {
      width: 80px;
      height: 80px;
      object-fit: contain;
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
    tbody tr:hover {
      background-color: #fafafa;
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
    .print-btn { 
      background: #ff6b2c; 
      color: white; 
      border: none; 
      padding: 14px 28px; 
      border-radius: 8px; 
      cursor: pointer; 
      font-size: 1em; 
      margin: 0 0 30px 0;
      box-shadow: 0 2px 6px rgba(255, 107, 44, 0.3);
      transition: all 0.3s;
    }
    .print-btn:hover { 
      background: #e55a1c;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(255, 107, 44, 0.4);
    }
    @media print { 
      body { background: white; padding: 0; }
      .print-btn { display: none; }
      .invoice-container { 
        border: 2px solid #333;
        box-shadow: none;
      }
    }
  </style>
</head>
<body>
  <button class="print-btn" onclick="window.print()">🖨️ Imprimer / Sauvegarder en PDF</button>
  
  <div class="invoice-container">
    <div class="header">
      <div class="company-info">
        <img src="/Studio du Cap Brun.png" alt="Studio du Cap Brun" class="logo" onerror="this.style.display='none'">
        <div class="company-details">
          <h1>Studio du Cap Brun</h1>
          <p>
            83570 COTIGNAC<br>
            <strong>SIRET:</strong> 49483041700031<br>
            <strong>Code NAF/APE:</strong> 59.20Z
          </p>
        </div>
      </div>
      <div class="invoice-info">
        <h2>FACTURE</h2>
        <p><strong>N° ${invoice.number}</strong></p>
        <p>Date: ${new Date(invoice.date).toLocaleDateString('fr-FR')}</p>
        <p>Échéance: ${new Date(invoice.date).toLocaleDateString('fr-FR')}</p>
      </div>
    </div>

    <div class="details">
      <h3>Informations client</h3>
      <p style="margin: 10px 0; line-height: 1.8;">
        <strong style="font-size: 1.1em;">${userName || 'Client'}</strong><br>
        ${userCompany ? userCompany + '<br>' : ''}
        ${userEmail ? userEmail + '<br>' : ''}
        ${userAddress || ''}
      </p>
    </div>

    <table>
      <thead>
        <tr>
          <th>Description</th>
          <th style="text-align: center; width: 100px;">Quantité</th>
          <th style="text-align: right; width: 150px;">Prix unitaire</th>
          <th style="text-align: right; width: 150px;">Total</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>
            <strong style="color: #333; font-size: 1.05em;">Recharge de crédit - Assistant Rédactionnel</strong><br>
            <small style="color: #666; line-height: 1.6;">Crédit pour utilisation des services d'aide à l'écriture et à la diffusion de contenu.</small>
          </td>
          <td style="text-align: center;">1</td>
          <td style="text-align: right;">${invoice.amount.toFixed(2)} €</td>
          <td style="text-align: right;"><strong>${invoice.amount.toFixed(2)} €</strong></td>
        </tr>
      </tbody>
    </table>

    <div class="total-section">
      <div class="total-line">
        <span>Total HT :</span>
        <span>${invoice.amount.toFixed(2)} €</span>
      </div>
      <div class="total-line">
        <span>TVA (0%) :</span>
        <span>0,00 €</span>
      </div>
      <div class="total-line tva-exempt">
        <span>« Association exonérée des impôts commerciaux, conformément à l'article 261 du Code général des impôts (CGI). »</span>
      </div>
      <div class="total-line total-final">
        <span>Total HT :</span>
        <span>${invoice.amount.toFixed(2)} €</span>
      </div>
    </div>

    <div class="footer">
      <p><strong>Conditions de paiement:</strong> Paiement à réception</p>
      <p style="margin-top: 15px;">Merci pour votre confiance !</p>
      <p><strong>Studio du Cap Brun</strong> - Votre partenaire en création de contenu</p>
    </div>
  </div>
</body>
</html>
    `);
    invoiceWindow.document.close();
  };

  if (invoices.length === 0) {
    return (
      <div className="invoice-list-empty">
        <i className="fas fa-file-invoice"></i>
        <p>Aucune facture pour le moment</p>
        <p className="empty-subtitle">Vos factures apparaîtront ici après chaque recharge</p>
      </div>
    );
  }

  return (
    <div className="invoice-list">
      <div className="invoice-list-header">
        <h4><i className="fas fa-file-invoice"></i> Mes Factures</h4>
        <p className="invoice-count">{invoices.length} facture{invoices.length > 1 ? 's' : ''}</p>
      </div>
      
      <div className="invoices-table">
        <table>
          <thead>
            <tr>
              <th>N° Facture</th>
              <th>Date</th>
              <th>Montant HT</th>
              <th>TVA</th>
              <th>Total TTC</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((invoice) => (
              <tr key={invoice.id}>
                <td className="invoice-number">{invoice.number}</td>
                <td>{new Date(invoice.date).toLocaleDateString('fr-FR')}</td>
                <td>{invoice.amount.toFixed(2)} €</td>
                <td>0,00 €</td>
                <td className="invoice-total">{invoice.amount.toFixed(2)} €</td>
                <td className="invoice-actions">
                  <button 
                    className="btn-view" 
                    onClick={() => viewInvoice(invoice)}
                    title="Voir la facture"
                  >
                    <i className="fas fa-eye"></i>
                  </button>
                  <button 
                    className="btn-download" 
                    onClick={() => downloadInvoicePDF(invoice, { userName, userEmail, userAddress, userCompany }, language)}
                    title={t.downloadPDF}
                  >
                    <i className="fas fa-download"></i>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InvoiceList;
