import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './InvoiceGenerator.css';

const API_URL = import.meta.env.VITE_API_URL || 'https://api.assistant-redacteur.fr';

/**
 * Composant de génération de factures pour le Studio du Cap Brun
 * Permet de créer des factures personnalisées avec saisie manuelle des informations
 */
const InvoiceGenerator = () => {
  // Calcule une date d'échéance par défaut : date d'émission + 30 jours
  const computeDefaultDueDate = (dateStr) => {
    const base = dateStr ? new Date(dateStr) : new Date();
    const due = new Date(base);
    due.setDate(due.getDate() + 30);
    return due.toISOString().slice(0, 10); // YYYY-MM-DD pour input type=date
  };

  const todayStr = new Date().toISOString().slice(0, 10);

  const [formData, setFormData] = useState({
    clientName: '',
    clientFirstName: '',
    clientLastName: '',
    clientCompany: '',
    clientEmail: '',
    clientAddress: '',
    clientPostalCode: '',
    clientCity: '',
    invoiceDescription: '',
    invoiceSubtitle: '',
    quantity: 1,
    unitPrice: 0,
    tvaRate: 0,
    date: todayStr,                 // date d'émission (modifiable)
    dueDate: computeDefaultDueDate(todayStr)  // échéance = émission + 30 jours (modifiable)
  });

  const [generatedInvoices, setGeneratedInvoices] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(null);
  const [editingInvoiceNumber, setEditingInvoiceNumber] = useState(null); // mode édition

  // Calculs automatiques
  const totalHT = formData.quantity * formData.unitPrice;
  const tvaAmount = totalHT * (formData.tvaRate / 100);
  const totalTTC = totalHT + tvaAmount;

  const handleInputChange = (field, value) => {
    setFormData(prev => {
      const next = { ...prev, [field]: value };
      // Quand la date d'émission change, recalculer l'échéance par défaut
      // (uniquement si l'utilisateur ne l'a pas modifiée manuellement, détecté
      // via un flag interne — ici on recalcule toujours pour simplicité,
      // l'utilisateur peut re-modifier l'échéance après).
      if (field === 'date') {
        next.dueDate = computeDefaultDueDate(value);
      }
      return next;
    });
  };

  // Charger les factures au montage du composant
  useEffect(() => {
    loadInvoices();
  }, []);

  const loadInvoices = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_URL}/api/invoices/scb`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      
      if (data.success) {
        setGeneratedInvoices(data.invoices);
      } else if (response.status === 403) {
        console.error('Accès refusé: droits administrateur requis');
      }
    } catch (error) {
      console.error('Erreur chargement factures:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateInvoiceHTML = (invoice) => {
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Facture {{INVOICE_NUMBER}}</title>
  <style>
    body { 
      font-family: Arial, sans-serif; 
      padding: 0; 
      margin: 0; 
      background: white;
    }
    .invoice-container {
      background: white;
      border: none;
      border-radius: 0;
      padding: 40px;
      box-shadow: none;
      max-width: 100%;
      margin: 0;
    }
    .header { 
      display: flex; 
      justify-content: space-between; 
      align-items: flex-start;
      margin-bottom: 30px; 
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
      margin: 0 0 8px 0;
      font-size: 1.5em;
    }
    .company-details p {
      margin: 4px 0;
      line-height: 1.6;
      color: #333;
      font-size: 0.9em;
    }
    .invoice-info { 
      text-align: right;
    }
    .invoice-info h2 { 
      color: #ff6b2c; 
      margin: 0 0 12px 0;
      font-size: 1.6em;
    }
    .invoice-info p {
      margin: 4px 0;
      color: #333;
      font-size: 0.9em;
    }
    .details { 
      margin: 25px 0; 
      background: #f9f9f9; 
      padding: 15px; 
      border-radius: 8px;
      border: 1px solid #e0e0e0;
    }
    .details h3 {
      margin: 0 0 10px 0;
      color: #ff6b2c;
      font-size: 1em;
    }
    table { 
      width: 100%; 
      border-collapse: collapse; 
      margin: 25px 0;
      border: 1px solid #ddd;
      border-radius: 8px;
      overflow: hidden;
    }
    th, td { 
      padding: 12px; 
      text-align: left; 
      border-bottom: 1px solid #e0e0e0;
      font-size: 0.9em;
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
      margin-top: 25px;
      padding: 15px;
      background: #f9f9f9;
      border-radius: 8px;
      border: 1px solid #e0e0e0;
    }
    .total-line { 
      display: flex; 
      justify-content: flex-end; 
      margin: 10px 0; 
      font-size: 0.95em;
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
      font-size: 0.8em;
    }
    .total-final { 
      font-size: 1.2em; 
      font-weight: bold; 
      color: #ff6b2c; 
      border-top: 2px solid #ff6b2c; 
      padding-top: 10px; 
      margin-top: 10px;
    }
    .footer { 
      margin-top: 30px;
      text-align: center; 
      color: #666; 
      font-size: 0.85em; 
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
      body { background: white; padding: 0; margin: 0; }
      .print-btn { display: none; }
      .invoice-container { 
        border: none;
        box-shadow: none;
        max-width: 100%;
        padding: 40px;
        margin: 0;
      }
      @page {
        margin: 0;
        size: A4;
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
        <p><strong>N° {{INVOICE_NUMBER}}</strong></p>
        <p>Date: ${new Date(invoice.date).toLocaleDateString('fr-FR')}</p>
        <p>Échéance: ${new Date(invoice.dueDate || invoice.date).toLocaleDateString('fr-FR')}</p>
      </div>
    </div>

    <div class="details">
      <h3>Informations client</h3>
      <p style="margin: 10px 0; line-height: 1.8;">
        <strong style="font-size: 1.1em;">${invoice.clientName}</strong><br>
        ${invoice.clientCompany ? invoice.clientCompany + '<br>' : ''}
        ${invoice.clientEmail ? invoice.clientEmail + '<br>' : ''}
        ${invoice.clientAddress ? invoice.clientAddress + '<br>' : ''}
        ${invoice.clientPostalCode && invoice.clientCity ? invoice.clientPostalCode + ' ' + invoice.clientCity : ''}
      </p>
    </div>

    <table>
      <thead>
        <tr>
          <th style="width: 50%;">Description</th>
          <th style="text-align: center; width: 80px;">Quantité</th>
          <th style="text-align: right; width: 120px;">Prix unitaire</th>
          <th style="text-align: right; width: 120px;">Total HT</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td style="width: 50%;">
            <strong style="color: #333; font-size: 1.05em;">${invoice.description}</strong><br>
            ${invoice.subtitle ? '<small style="color: #666; line-height: 1.6;">' + invoice.subtitle + '</small>' : ''}
          </td>
          <td style="text-align: center; width: 80px;">${invoice.quantity}</td>
          <td style="text-align: right; width: 120px;">${invoice.unitPrice.toFixed(2)} €</td>
          <td style="text-align: right; width: 120px;"><strong>${invoice.totalHT.toFixed(2)} €</strong></td>
        </tr>
      </tbody>
    </table>

    <div class="total-section">
      <div class="total-line">
        <span>Total HT :</span>
        <span>${invoice.totalHT.toFixed(2)} €</span>
      </div>
      <div class="total-line">
        <span>TVA (${invoice.tvaRate}%) :</span>
        <span>${invoice.tvaAmount.toFixed(2)} €</span>
      </div>
      ${invoice.tvaRate === 0 ? '<div class="total-line tva-exempt"><span>« Association exonérée des impôts commerciaux, conformément à l\'article 261 du Code général des impôts (CGI). »</span></div>' : ''}
      <div class="total-line total-final">
        <span>Total TTC :</span>
        <span>${invoice.totalTTC.toFixed(2)} €</span>
      </div>
    </div>

    <div class="footer">
      <p>Merci pour votre confiance ! <strong>Studio du Cap Brun</strong> - Votre partenaire en création de contenu</p>
      
      <div style="margin-top: 15px; padding: 15px; background: #f9f9f9; border: 2px solid #333; border-radius: 8px;">
        <p style="margin: 0 0 10px 0; font-weight: bold; color: #000; font-size: 1.05em;">Coordonnées bancaires :</p>
        <p style="margin: 5px 0; color: #000; font-size: 1em; line-height: 1.8;">
          <strong>STUDIO DU CAP BRUN</strong><br>
          <strong>RIB :</strong> 19106 00008 43609518759 64<br>
          <strong>IBAN :</strong> FR76 1910 6000 0843 6095 1875 964
        </p>
      </div>
    </div>
  </div>
</body>
</html>`;
  };

  const generateInvoice = async () => {
    // Validation
    if (!formData.clientLastName || !formData.invoiceDescription || formData.unitPrice <= 0) {
      alert('Veuillez remplir au minimum : Nom du client, Description et Prix unitaire');
      return;
    }

    try {
      setIsGenerating(true);

      const clientName = `${formData.clientFirstName} ${formData.clientLastName}`.trim();

      // Convertir les dates du formulaire (YYYY-MM-DD) en ISO complet
      const dateIso = formData.date
        ? new Date(formData.date + 'T00:00:00').toISOString()
        : new Date().toISOString();
      const dueDateIso = formData.dueDate
        ? new Date(formData.dueDate + 'T00:00:00').toISOString()
        : null;

      const invoiceData = {
        clientName,
        clientCompany: formData.clientCompany,
        clientEmail: formData.clientEmail,
        clientAddress: formData.clientAddress,
        clientPostalCode: formData.clientPostalCode,
        clientCity: formData.clientCity,
        description: formData.invoiceDescription,
        subtitle: formData.invoiceSubtitle,
        quantity: formData.quantity,
        unitPrice: formData.unitPrice,
        totalHT: totalHT,
        tvaRate: formData.tvaRate,
        tvaAmount: tvaAmount,
        totalTTC: totalTTC,
        date: dateIso,
        dueDate: dueDateIso
      };

      // Générer le HTML de la facture (le numéro est attribué côté serveur
      // via le placeholder {{INVOICE_NUMBER}}, substitué par le backend).
      const htmlContent = generateInvoiceHTML(invoiceData);

      // Sauvegarder via l'API avec le HTML
      const token = localStorage.getItem('token');

      const isEditing = !!editingInvoiceNumber;
      const url = isEditing
        ? `${API_URL}/api/invoices/scb/${editingInvoiceNumber}`
        : `${API_URL}/api/invoices/scb`;
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...invoiceData,
          htmlContent
        })
      });

      const data = await response.json();

      if (data.success) {
        // Recharger la liste des factures
        await loadInvoices();

        // Ouvrir la facture
        viewInvoice(data.invoice);

        // Quitter le mode édition
        setEditingInvoiceNumber(null);

        // Réinitialiser le formulaire (garder les infos client)
        setFormData(prev => ({
          ...prev,
          invoiceDescription: '',
          invoiceSubtitle: '',
          quantity: 1,
          unitPrice: 0,
          date: todayStr,
          dueDate: computeDefaultDueDate(todayStr)
        }));
      } else {
        alert('Erreur lors de ' + (isEditing ? 'la modification' : 'la création') + ' de la facture: ' + data.error);
      }
    } catch (error) {
      console.error('Erreur génération facture:', error);
      alert('Erreur lors de ' + (editingInvoiceNumber ? 'la modification' : 'la création') + ' de la facture');
    } finally {
      setIsGenerating(false);
    }
  };

  const viewInvoice = async (invoice) => {
    try {
      const token = localStorage.getItem('token');
      const url = `${API_URL}/api/invoices/scb/${invoice.invoiceNumber}/html`;
      
      // Récupérer le HTML avec le token dans le header
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la récupération de la facture');
      }

      // Récupérer le HTML et l'afficher dans une nouvelle fenêtre
      const htmlContent = await response.text();
      const invoiceWindow = window.open('', '_blank');
      invoiceWindow.document.write(htmlContent);
      invoiceWindow.document.close();
    } catch (error) {
      console.error('Erreur visualisation facture:', error);
      alert('Erreur lors de la visualisation de la facture');
    }
  };

  const viewInvoiceOld = (invoice) => {
    const invoiceWindow = window.open('', '_blank');
    invoiceWindow.document.write(`
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Facture ${invoice.invoiceNumber}</title>
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
      margin: 0 0 8px 0;
      font-size: 1.5em;
    }
    .company-details p {
      margin: 4px 0;
      line-height: 1.6;
      color: #333;
      font-size: 0.9em;
    }
    .invoice-info { 
      text-align: right;
    }
    .invoice-info h2 { 
      color: #ff6b2c; 
      margin: 0 0 12px 0;
      font-size: 1.6em;
    }
    .invoice-info p {
      margin: 4px 0;
      color: #333;
      font-size: 0.9em;
    }
    .details { 
      margin: 25px 0; 
      background: #f9f9f9; 
      padding: 15px; 
      border-radius: 8px;
      border: 1px solid #e0e0e0;
    }
    .details h3 {
      margin: 0 0 10px 0;
      color: #ff6b2c;
      font-size: 1em;
    }
    table { 
      width: 100%; 
      border-collapse: collapse; 
      margin: 25px 0;
      border: 1px solid #ddd;
      border-radius: 8px;
      overflow: hidden;
    }
    th, td { 
      padding: 12px; 
      text-align: left; 
      border-bottom: 1px solid #e0e0e0;
      font-size: 0.9em;
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
      margin-top: 25px;
      padding: 15px;
      background: #f9f9f9;
      border-radius: 8px;
      border: 1px solid #e0e0e0;
    }
    .total-line { 
      display: flex; 
      justify-content: flex-end; 
      margin: 10px 0; 
      font-size: 0.95em;
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
      font-size: 0.8em;
    }
    .total-final { 
      font-size: 1.2em; 
      font-weight: bold; 
      color: #ff6b2c; 
      border-top: 2px solid #ff6b2c; 
      padding-top: 10px; 
      margin-top: 10px;
    }
    .footer { 
      margin-top: 30px;
      text-align: center; 
      color: #666; 
      font-size: 0.85em; 
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
      body { background: white; padding: 0; margin: 0; }
      .print-btn { display: none; }
      .invoice-container { 
        border: none;
        box-shadow: none;
        max-width: 100%;
        padding: 40px;
        margin: 0;
      }
      @page {
        margin: 0;
        size: A4;
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
        <p><strong>N° {{INVOICE_NUMBER}}</strong></p>
        <p>Date: ${new Date(invoice.date).toLocaleDateString('fr-FR')}</p>
        <p>Échéance: ${new Date(invoice.dueDate || invoice.date).toLocaleDateString('fr-FR')}</p>
      </div>
    </div>

    <div class="details">
      <h3>Informations client</h3>
      <p style="margin: 10px 0; line-height: 1.8;">
        <strong style="font-size: 1.1em;">${invoice.clientName}</strong><br>
        ${invoice.clientCompany ? invoice.clientCompany + '<br>' : ''}
        ${invoice.clientEmail ? invoice.clientEmail + '<br>' : ''}
        ${invoice.clientAddress ? invoice.clientAddress + '<br>' : ''}
        ${invoice.clientPostalCode && invoice.clientCity ? invoice.clientPostalCode + ' ' + invoice.clientCity : ''}
      </p>
    </div>

    <table>
      <thead>
        <tr>
          <th style="width: 50%;">Description</th>
          <th style="text-align: center; width: 80px;">Quantité</th>
          <th style="text-align: right; width: 120px;">Prix unitaire</th>
          <th style="text-align: right; width: 120px;">Total HT</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td style="width: 50%;">
            <strong style="color: #333; font-size: 1.05em;">${invoice.description}</strong><br>
            ${invoice.subtitle ? '<small style="color: #666; line-height: 1.6;">' + invoice.subtitle + '</small>' : ''}
          </td>
          <td style="text-align: center; width: 80px;">${invoice.quantity}</td>
          <td style="text-align: right; width: 120px;">${invoice.unitPrice.toFixed(2)} €</td>
          <td style="text-align: right; width: 120px;"><strong>${invoice.totalHT.toFixed(2)} €</strong></td>
        </tr>
      </tbody>
    </table>

    <div class="total-section">
      <div class="total-line">
        <span>Total HT :</span>
        <span>${invoice.totalHT.toFixed(2)} €</span>
      </div>
      <div class="total-line">
        <span>TVA (${invoice.tvaRate}%) :</span>
        <span>${invoice.tvaAmount.toFixed(2)} €</span>
      </div>
      ${invoice.tvaRate === 0 ? '<div class="total-line tva-exempt"><span>« Association exonérée des impôts commerciaux, conformément à l\'article 261 du Code général des impôts (CGI). »</span></div>' : ''}
      <div class="total-line total-final">
        <span>Total TTC :</span>
        <span>${invoice.totalTTC.toFixed(2)} €</span>
      </div>
    </div>

    <div class="footer">
      <p>Merci pour votre confiance ! <strong>Studio du Cap Brun</strong> - Votre partenaire en création de contenu</p>
      
      <div style="margin-top: 10px; padding: 20px; background: #f9f9f9; border: 2px solid #333; border-radius: 8px;">
        <p style="margin: 0 0 10px 0; font-weight: bold; color: #000; font-size: 1.05em;">Coordonnées bancaires :</p>
        <p style="margin: 5px 0; color: #000; font-size: 1em; line-height: 1.8;">
          <strong>STUDIO DU CAP BRUN</strong><br>
          <strong>RIB :</strong> 19106 00008 43609518759 64<br>
          <strong>IBAN :</strong> FR76 1910 6000 0843 6095 1875 964
        </p>
      </div>
    </div>
  </div>
</body>
</html>
    `);
    invoiceWindow.document.close();
  };

  const deleteInvoice = async (invoiceNumber) => {
    if (!window.confirm('Voulez-vous vraiment supprimer cette facture ?')) return;
    
    try {
      setIsDeleting(invoiceNumber);
      const token = localStorage.getItem('token');

      const response = await fetch(`${API_URL}/api/invoices/scb/${invoiceNumber}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success) {
        // Recharger la liste des factures
        await loadInvoices();
      } else {
        alert('Erreur lors de la suppression: ' + data.error);
      }
    } catch (error) {
      console.error('Erreur suppression facture:', error);
      alert('Erreur lors de la suppression de la facture');
    } finally {
      setIsDeleting(null);
    }
  };

  // Charger une facture existante dans le formulaire pour modification
  const handleEditInvoice = (invoice) => {
    // Reconstituer prénom/nom à partir du clientName
    const parts = (invoice.clientName || '').split(' ');
    const firstName = parts.length > 1 ? parts[0] : '';
    const lastName = parts.length > 1 ? parts.slice(1).join(' ') : (invoice.clientName || '');

    // Convertir les dates ISO en YYYY-MM-DD pour les inputs type=date
    const toDateInput = (iso) => iso ? new Date(iso).toISOString().slice(0, 10) : '';

    setFormData({
      clientFirstName: firstName,
      clientLastName: lastName,
      clientCompany: invoice.clientCompany || '',
      clientEmail: invoice.clientEmail || '',
      clientAddress: invoice.clientAddress || '',
      clientPostalCode: invoice.clientPostalCode || '',
      clientCity: invoice.clientCity || '',
      invoiceDescription: invoice.description || '',
      invoiceSubtitle: invoice.subtitle || '',
      quantity: invoice.quantity || 1,
      unitPrice: invoice.unitPrice || 0,
      tvaRate: invoice.tvaRate || 0,
      date: toDateInput(invoice.date),
      dueDate: toDateInput(invoice.dueDate) || computeDefaultDueDate(toDateInput(invoice.date))
    });
    setEditingInvoiceNumber(invoice.invoiceNumber);
    // Remonter en haut du formulaire
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Annuler le mode édition et réinitialiser le formulaire
  const handleCancelEdit = () => {
    setEditingInvoiceNumber(null);
    setFormData(prev => ({
      ...prev,
      invoiceDescription: '',
      invoiceSubtitle: '',
      quantity: 1,
      unitPrice: 0,
      date: todayStr,
      dueDate: computeDefaultDueDate(todayStr)
    }));
  };

  return (
    <div className="invoice-generator-container">
      <div className="invoice-generator-header">
        <h1><i className="fas fa-file-invoice-dollar"></i> Facturier - Studio du Cap Brun</h1>
        <p className="subtitle">Générez vos factures professionnelles en quelques clics</p>
        <div style={{ marginTop: '10px' }}>
          <Link to="/devis" style={{ color: '#ff6b2c', textDecoration: 'none', fontSize: '14px' }}>
            <i className="fas fa-file-signature"></i> Accéder au devis
          </Link>
        </div>
      </div>

      <div className="invoice-form-card">
        <h2><i className="fas fa-user"></i> Informations Client</h2>
        
        <div className="form-row">
          <div className="form-group">
            <label>Prénom</label>
            <input
              type="text"
              value={formData.clientFirstName}
              onChange={(e) => handleInputChange('clientFirstName', e.target.value)}
              placeholder="Jean"
            />
          </div>
          <div className="form-group">
            <label>Nom *</label>
            <input
              type="text"
              value={formData.clientLastName}
              onChange={(e) => handleInputChange('clientLastName', e.target.value)}
              placeholder="Dupont"
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label>Société / Entreprise</label>
          <input
            type="text"
            value={formData.clientCompany}
            onChange={(e) => handleInputChange('clientCompany', e.target.value)}
            placeholder="Nom de l'entreprise (optionnel)"
          />
        </div>

        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            value={formData.clientEmail}
            onChange={(e) => handleInputChange('clientEmail', e.target.value)}
            placeholder="client@example.com"
          />
        </div>

        <div className="form-group">
          <label>Adresse</label>
          <input
            type="text"
            value={formData.clientAddress}
            onChange={(e) => handleInputChange('clientAddress', e.target.value)}
            placeholder="123 Rue de la République"
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Code Postal</label>
            <input
              type="text"
              value={formData.clientPostalCode}
              onChange={(e) => handleInputChange('clientPostalCode', e.target.value)}
              placeholder="75001"
            />
          </div>
          <div className="form-group">
            <label>Ville</label>
            <input
              type="text"
              value={formData.clientCity}
              onChange={(e) => handleInputChange('clientCity', e.target.value)}
              placeholder="Paris"
            />
          </div>
        </div>
      </div>

      <div className="invoice-form-card">
        <h2><i className="fas fa-file-alt"></i> Détails de la Facture</h2>
        
        <div className="form-group">
          <label>Description de la prestation *</label>
          <input
            type="text"
            value={formData.invoiceDescription}
            onChange={(e) => handleInputChange('invoiceDescription', e.target.value)}
            placeholder="Ex: Création de contenu vidéo"
            required
          />
        </div>

        <div className="form-group">
          <label>Sous-titre / Détails (optionnel)</label>
          <textarea
            value={formData.invoiceSubtitle}
            onChange={(e) => handleInputChange('invoiceSubtitle', e.target.value)}
            placeholder="Détails supplémentaires sur la prestation..."
            rows="2"
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Quantité</label>
            <input
              type="number"
              min="1"
              value={formData.quantity}
              onChange={(e) => handleInputChange('quantity', parseInt(e.target.value) || 1)}
            />
          </div>
          <div className="form-group">
            <label>Prix unitaire HT (€) *</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={formData.unitPrice}
              onChange={(e) => handleInputChange('unitPrice', parseFloat(e.target.value) || 0)}
              placeholder="0.00"
              required
            />
          </div>
          <div className="form-group">
            <label>TVA (%)</label>
            <select
              value={formData.tvaRate}
              onChange={(e) => handleInputChange('tvaRate', parseFloat(e.target.value))}
            >
              <option value="0">0% (Exonéré)</option>
              <option value="5.5">5.5%</option>
              <option value="10">10%</option>
              <option value="20">20%</option>
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Date d'émission</label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => handleInputChange('date', e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Date d'échéance</label>
            <input
              type="date"
              value={formData.dueDate}
              onChange={(e) => handleInputChange('dueDate', e.target.value)}
              title="Par défaut : date d'émission + 30 jours. Modifiable."
            />
          </div>
        </div>

        <div className="invoice-totals">
          <div className="total-row">
            <span>Total HT :</span>
            <span className="total-value">{totalHT.toFixed(2)} €</span>
          </div>
          <div className="total-row">
            <span>TVA ({formData.tvaRate}%) :</span>
            <span className="total-value">{tvaAmount.toFixed(2)} €</span>
          </div>
          <div className="total-row total-final">
            <span>Total TTC :</span>
            <span className="total-value">{totalTTC.toFixed(2)} €</span>
          </div>
        </div>

        {editingInvoiceNumber && (
          <div style={{
            padding: '10px 12px',
            marginBottom: '10px',
            background: 'rgba(255, 107, 44, 0.1)',
            border: '1px solid #ff6b2c',
            borderRadius: '6px',
            fontSize: '13px',
            color: '#ff6b2c',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <i className="fas fa-edit"></i>
            <strong>Mode édition</strong> — Modification de la facture {editingInvoiceNumber} (le numéro est conservé)
          </div>
        )}

        <button
          className="btn-generate"
          onClick={generateInvoice}
          disabled={isGenerating}
          style={{ opacity: isGenerating ? 0.7 : 1 }}
        >
          {isGenerating ? (
            <><i className="fas fa-spinner fa-spin"></i> {editingInvoiceNumber ? 'Mise à jour...' : 'Génération en cours...'}</>
          ) : (
            <><i className={editingInvoiceNumber ? 'fas fa-save' : 'fas fa-file-invoice'}></i> {editingInvoiceNumber ? 'Mettre à jour la Facture' : 'Générer la Facture'}</>
          )}
        </button>

        {editingInvoiceNumber && (
          <button
            className="btn-cancel-edit"
            onClick={handleCancelEdit}
            disabled={isGenerating}
            style={{
              marginLeft: '10px',
              padding: '10px 20px',
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '6px',
              color: 'inherit',
              cursor: isGenerating ? 'not-allowed' : 'pointer',
              fontSize: '14px'
            }}
          >
            <i className="fas fa-times"></i> Annuler la modification
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="invoice-history-card">
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <i className="fas fa-spinner fa-spin" style={{ fontSize: '2em', color: '#ff6b2c' }}></i>
            <p style={{ marginTop: '15px', color: '#666' }}>Chargement des factures...</p>
          </div>
        </div>
      ) : generatedInvoices.length > 0 && (
        <div className="invoice-history-card">
          <h2><i className="fas fa-history"></i> Factures Générées ({generatedInvoices.length})</h2>
          <div className="invoice-history-list">
            {generatedInvoices.map((invoice) => (
              <div key={invoice.invoiceNumber} className="invoice-history-item">
                <div className="invoice-history-info">
                  <div className="invoice-number">{invoice.invoiceNumber}</div>
                  <div className="invoice-client">{invoice.clientName}</div>
                  <div className="invoice-date">{new Date(invoice.date).toLocaleDateString('fr-FR')}</div>
                </div>
                <div className="invoice-history-amount">
                  {invoice.totalTTC.toFixed(2)} €
                </div>
                <div className="invoice-history-actions">
                  <button
                    className="btn-view-small"
                    onClick={() => viewInvoice(invoice)}
                    title="Voir la facture"
                  >
                    <i className="fas fa-eye"></i>
                  </button>
                  <button
                    className="btn-edit-small"
                    onClick={() => handleEditInvoice(invoice)}
                    title="Modifier la facture"
                  >
                    <i className="fas fa-edit"></i>
                  </button>
                  <button
                    className="btn-delete-small"
                    onClick={() => deleteInvoice(invoice.invoiceNumber)}
                    disabled={isDeleting === invoice.invoiceNumber}
                    style={{ opacity: isDeleting === invoice.invoiceNumber ? 0.7 : 1 }}
                    title="Supprimer"
                  >
                    {isDeleting === invoice.invoiceNumber ? (
                      <i className="fas fa-spinner fa-spin"></i>
                    ) : (
                      <i className="fas fa-trash"></i>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default InvoiceGenerator;
