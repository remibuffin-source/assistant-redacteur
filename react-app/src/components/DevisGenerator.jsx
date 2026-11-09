import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './InvoiceGenerator.css';

const API_URL = import.meta.env.VITE_API_URL || 'https://api.assistant-redacteur.fr';

/**
 * Générateur de DEVIS pour le Studio du Cap Brun
 * Même style que le facturier. Les devis peuvent être convertis en factures
 * (nouveau numéro SCB-, mention "Issue du devis DEV-...").
 */
const DevisGenerator = () => {
  const computeDefaultDueDate = (dateStr) => {
    const base = dateStr ? new Date(dateStr) : new Date();
    const due = new Date(base);
    due.setDate(due.getDate() + 30);
    return due.toISOString().slice(0, 10);
  };
  const todayStr = new Date().toISOString().slice(0, 10);

  const [formData, setFormData] = useState({
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
    date: todayStr,
    dueDate: computeDefaultDueDate(todayStr),
    validityDays: 30,
    paymentTerms: 'Acompte de 30% à la commande, solde à 30 jours après réception du devis accepté.'
  });

  const [devisList, setDevisList] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(null);
  const [isConverting, setIsConverting] = useState(null);
  const [editingDevisNumber, setEditingDevisNumber] = useState(null);

  const totalHT = formData.quantity * formData.unitPrice;
  const tvaAmount = totalHT * (formData.tvaRate / 100);
  const totalTTC = totalHT + tvaAmount;

  const handleInputChange = (field, value) => {
    setFormData(prev => {
      const next = { ...prev, [field]: value };
      if (field === 'date') next.dueDate = computeDefaultDueDate(value);
      return next;
    });
  };

  useEffect(() => { loadDevis(); }, []);

  const loadDevis = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/invoices/scb/devis`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) setDevisList(data.devis);
    } catch (error) {
      console.error('Erreur chargement devis:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // --- Template HTML du DEVIS ---
  const generateDevisHTML = (devis) => {
    const validiteText = devis.validityDays ? `Valable ${devis.validityDays} jours` : '';
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Devis {{DEVIS_NUMBER}}</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 0; margin: 0; background: white; }
    .invoice-container { background: white; border: none; border-radius: 0; padding: 40px; box-shadow: none; max-width: 100%; margin: 0; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 3px solid #ff6b2c; }
    .company-info { text-align: left; display: flex; align-items: flex-start; gap: 20px; }
    .logo { width: 80px; height: 80px; object-fit: contain; }
    .company-details h1 { color: #ff6b2c; margin: 0 0 8px 0; font-size: 1.5em; }
    .company-details p { margin: 4px 0; line-height: 1.6; color: #333; font-size: 0.9em; }
    .invoice-info { text-align: right; }
    .invoice-info h2 { color: #ff6b2c; margin: 0 0 12px 0; font-size: 1.6em; }
    .invoice-info p { margin: 4px 0; color: #333; font-size: 0.9em; }
    .details { margin: 25px 0; background: #f9f9f9; padding: 15px; border-radius: 8px; border: 1px solid #e0e0e0; }
    .details h3 { margin: 0 0 10px 0; color: #ff6b2c; font-size: 1em; }
    table { width: 100%; border-collapse: collapse; margin: 25px 0; border: 1px solid #ddd; border-radius: 8px; overflow: hidden; }
    th, td { padding: 12px; text-align: left; border-bottom: 1px solid #e0e0e0; font-size: 0.9em; }
    th { background-color: #ff6b2c; color: white; font-weight: bold; font-size: 0.95em; }
    tbody tr:last-child td { border-bottom: none; }
    .total-section { text-align: right; margin-top: 25px; padding: 15px; background: #f9f9f9; border-radius: 8px; border: 1px solid #e0e0e0; }
    .total-line { display: flex; justify-content: flex-end; margin: 10px 0; font-size: 0.95em; }
    .total-line span:first-child { margin-right: 30px; color: #666; }
    .total-line span:last-child { min-width: 120px; text-align: right; font-weight: 600; }
    .tva-exempt { font-style: italic; color: #666; font-size: 0.8em; }
    .total-final { font-size: 1.2em; font-weight: bold; color: #ff6b2c; border-top: 2px solid #ff6b2c; padding-top: 10px; margin-top: 10px; }
    .conditions { margin: 25px 0; background: #fff8f3; padding: 15px; border-radius: 8px; border: 1px solid #ff6b2c; }
    .conditions h3 { margin: 0 0 10px 0; color: #ff6b2c; font-size: 1em; }
    .conditions p { margin: 6px 0; color: #333; font-size: 0.9em; line-height: 1.6; }
    .footer { margin-top: 30px; text-align: center; color: #666; font-size: 0.85em; border-top: 2px solid #e0e0e0; padding-top: 20px; }
    .footer p { margin: 8px 0; }
    .print-btn { background: #ff6b2c; color: white; border: none; padding: 14px 28px; border-radius: 8px; cursor: pointer; font-size: 1em; margin: 0 0 30px 0; box-shadow: 0 2px 6px rgba(255, 107, 44, 0.3); transition: all 0.3s; }
    .print-btn:hover { background: #e55a1c; transform: translateY(-2px); box-shadow: 0 4px 12px rgba(255, 107, 44, 0.4); }
    @media print { body { background: white; padding: 0; margin: 0; } .print-btn { display: none; } .invoice-container { border: none; box-shadow: none; max-width: 100%; padding: 40px; margin: 0; } @page { margin: 0; size: A4; } }
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
          <p>83570 COTIGNAC<br><strong>SIRET:</strong> 49483041700031<br><strong>Code NAF/APE:</strong> 59.20Z</p>
        </div>
      </div>
      <div class="invoice-info">
        <h2>DEVIS</h2>
        <p><strong>N° {{DEVIS_NUMBER}}</strong></p>
        <p>Date: ${new Date(devis.date).toLocaleDateString('fr-FR')}</p>
        <p>${validiteText}</p>
      </div>
    </div>
    <div class="details">
      <h3>Informations client</h3>
      <p style="margin: 10px 0; line-height: 1.8;">
        <strong style="font-size: 1.1em;">${devis.clientName}</strong><br>
        ${devis.clientCompany ? devis.clientCompany + '<br>' : ''}
        ${devis.clientEmail ? devis.clientEmail + '<br>' : ''}
        ${devis.clientAddress ? devis.clientAddress + '<br>' : ''}
        ${devis.clientPostalCode && devis.clientCity ? devis.clientPostalCode + ' ' + devis.clientCity : ''}
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
            <strong style="color: #333; font-size: 1.05em;">${devis.description}</strong><br>
            ${devis.subtitle ? '<small style="color: #666; line-height: 1.6;">' + devis.subtitle + '</small>' : ''}
          </td>
          <td style="text-align: center; width: 80px;">${devis.quantity}</td>
          <td style="text-align: right; width: 120px;">${devis.unitPrice.toFixed(2)} €</td>
          <td style="text-align: right; width: 120px;"><strong>${devis.totalHT.toFixed(2)} €</strong></td>
        </tr>
      </tbody>
    </table>
    <div class="total-section">
      <div class="total-line"><span>Total HT :</span><span>${devis.totalHT.toFixed(2)} €</span></div>
      <div class="total-line"><span>TVA (${devis.tvaRate}%) :</span><span>${devis.tvaAmount.toFixed(2)} €</span></div>
      ${devis.tvaRate === 0 ? '<div class="total-line tva-exempt"><span>« Association exonérée des impôts commerciaux, conformément à l\'article 261 du Code général des impôts (CGI). »</span></div>' : ''}
      <div class="total-line total-final"><span>Total TTC :</span><span>${devis.totalTTC.toFixed(2)} €</span></div>
    </div>
    <div class="conditions">
      <h3>Conditions</h3>
      ${devis.validityDays ? `<p><strong>Validité du devis :</strong> ${devis.validityDays} jours à compter de la date d'émission.</p>` : ''}
      ${devis.paymentTerms ? `<p><strong>Modalités de paiement :</strong> ${devis.paymentTerms}</p>` : ''}
      <p>Devis accepté par le client (signature, date) :</p>
      <p style="margin-top: 40px; border-top: 1px dashed #ccc; padding-top: 10px; font-size: 0.85em; color: #999;">Signature du client — Date</p>
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

  // --- Template HTML de la FACTURE issue d'un devis ---
  const generateInvoiceHTMLFromDevis = (devis) => {
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Facture {{INVOICE_NUMBER}}</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 0; margin: 0; background: white; }
    .invoice-container { background: white; border: none; border-radius: 0; padding: 40px; box-shadow: none; max-width: 100%; margin: 0; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 3px solid #ff6b2c; }
    .company-info { text-align: left; display: flex; align-items: flex-start; gap: 20px; }
    .logo { width: 80px; height: 80px; object-fit: contain; }
    .company-details h1 { color: #ff6b2c; margin: 0 0 8px 0; font-size: 1.5em; }
    .company-details p { margin: 4px 0; line-height: 1.6; color: #333; font-size: 0.9em; }
    .invoice-info { text-align: right; }
    .invoice-info h2 { color: #ff6b2c; margin: 0 0 12px 0; font-size: 1.6em; }
    .invoice-info p { margin: 4px 0; color: #333; font-size: 0.9em; }
    .source-devis { font-size: 0.8em; color: #666; font-style: italic; margin-top: 8px; }
    .details { margin: 25px 0; background: #f9f9f9; padding: 15px; border-radius: 8px; border: 1px solid #e0e0e0; }
    .details h3 { margin: 0 0 10px 0; color: #ff6b2c; font-size: 1em; }
    table { width: 100%; border-collapse: collapse; margin: 25px 0; border: 1px solid #ddd; border-radius: 8px; overflow: hidden; }
    th, td { padding: 12px; text-align: left; border-bottom: 1px solid #e0e0e0; font-size: 0.9em; }
    th { background-color: #ff6b2c; color: white; font-weight: bold; font-size: 0.95em; }
    tbody tr:last-child td { border-bottom: none; }
    .total-section { text-align: right; margin-top: 25px; padding: 15px; background: #f9f9f9; border-radius: 8px; border: 1px solid #e0e0e0; }
    .total-line { display: flex; justify-content: flex-end; margin: 10px 0; font-size: 0.95em; }
    .total-line span:first-child { margin-right: 30px; color: #666; }
    .total-line span:last-child { min-width: 120px; text-align: right; font-weight: 600; }
    .tva-exempt { font-style: italic; color: #666; font-size: 0.8em; }
    .total-final { font-size: 1.2em; font-weight: bold; color: #ff6b2c; border-top: 2px solid #ff6b2c; padding-top: 10px; margin-top: 10px; }
    .footer { margin-top: 30px; text-align: center; color: #666; font-size: 0.85em; border-top: 2px solid #e0e0e0; padding-top: 20px; }
    .footer p { margin: 8px 0; }
    .print-btn { background: #ff6b2c; color: white; border: none; padding: 14px 28px; border-radius: 8px; cursor: pointer; font-size: 1em; margin: 0 0 30px 0; box-shadow: 0 2px 6px rgba(255, 107, 44, 0.3); transition: all 0.3s; }
    .print-btn:hover { background: #e55a1c; transform: translateY(-2px); box-shadow: 0 4px 12px rgba(255, 107, 44, 0.4); }
    @media print { body { background: white; padding: 0; margin: 0; } .print-btn { display: none; } .invoice-container { border: none; box-shadow: none; max-width: 100%; padding: 40px; margin: 0; } @page { margin: 0; size: A4; } }
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
          <p>83570 COTIGNAC<br><strong>SIRET:</strong> 49483041700031<br><strong>Code NAF/APE:</strong> 59.20Z</p>
        </div>
      </div>
      <div class="invoice-info">
        <h2>FACTURE</h2>
        <p><strong>N° {{INVOICE_NUMBER}}</strong></p>
        <p>Date: ${new Date().toLocaleDateString('fr-FR')}</p>
        <p>Échéance: ${new Date(devis.dueDate || devis.date).toLocaleDateString('fr-FR')}</p>
        <p class="source-devis">Issue du devis ${devis.devisNumber}</p>
      </div>
    </div>
    <div class="details">
      <h3>Informations client</h3>
      <p style="margin: 10px 0; line-height: 1.8;">
        <strong style="font-size: 1.1em;">${devis.clientName}</strong><br>
        ${devis.clientCompany ? devis.clientCompany + '<br>' : ''}
        ${devis.clientEmail ? devis.clientEmail + '<br>' : ''}
        ${devis.clientAddress ? devis.clientAddress + '<br>' : ''}
        ${devis.clientPostalCode && devis.clientCity ? devis.clientPostalCode + ' ' + devis.clientCity : ''}
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
            <strong style="color: #333; font-size: 1.05em;">${devis.description}</strong><br>
            ${devis.subtitle ? '<small style="color: #666; line-height: 1.6;">' + devis.subtitle + '</small>' : ''}
          </td>
          <td style="text-align: center; width: 80px;">${devis.quantity}</td>
          <td style="text-align: right; width: 120px;">${devis.unitPrice.toFixed(2)} €</td>
          <td style="text-align: right; width: 120px;"><strong>${devis.totalHT.toFixed(2)} €</strong></td>
        </tr>
      </tbody>
    </table>
    <div class="total-section">
      <div class="total-line"><span>Total HT :</span><span>${devis.totalHT.toFixed(2)} €</span></div>
      <div class="total-line"><span>TVA (${devis.tvaRate}%) :</span><span>${devis.tvaAmount.toFixed(2)} €</span></div>
      ${devis.tvaRate === 0 ? '<div class="total-line tva-exempt"><span>« Association exonérée des impôts commerciaux, conformément à l\'article 261 du Code général des impôts (CGI). »</span></div>' : ''}
      <div class="total-line total-final"><span>Total TTC :</span><span>${devis.totalTTC.toFixed(2)} €</span></div>
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

  const generateDevis = async () => {
    if (!formData.clientLastName || !formData.invoiceDescription || formData.unitPrice <= 0) {
      alert('Veuillez remplir au minimum : Nom du client, Description et Prix unitaire');
      return;
    }
    try {
      setIsGenerating(true);
      const clientName = `${formData.clientFirstName} ${formData.clientLastName}`.trim();
      const dateIso = formData.date ? new Date(formData.date + 'T00:00:00').toISOString() : new Date().toISOString();
      const dueDateIso = formData.dueDate ? new Date(formData.dueDate + 'T00:00:00').toISOString() : null;

      const devisData = {
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
        totalHT, tvaRate: formData.tvaRate, tvaAmount, totalTTC,
        date: dateIso,
        dueDate: dueDateIso,
        validityDays: parseInt(formData.validityDays, 10) || 30,
        paymentTerms: formData.paymentTerms
      };

      const htmlContent = generateDevisHTML(devisData);
      const token = localStorage.getItem('token');

      const isEditing = !!editingDevisNumber;
      const url = isEditing
        ? `${API_URL}/api/invoices/scb/devis/${editingDevisNumber}`
        : `${API_URL}/api/invoices/scb/devis`;
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ ...devisData, htmlContent })
      });
      const data = await response.json();

      if (data.success) {
        await loadDevis();
        viewDevis(data.devis);
        setEditingDevisNumber(null);
        setFormData(prev => ({
          ...prev,
          invoiceDescription: '', invoiceSubtitle: '', quantity: 1, unitPrice: 0,
          date: todayStr, dueDate: computeDefaultDueDate(todayStr)
        }));
      } else {
        alert('Erreur lors de ' + (isEditing ? 'la modification' : 'la création') + ' du devis: ' + data.error);
      }
    } catch (error) {
      console.error('Erreur génération devis:', error);
      alert('Erreur lors de ' + (editingDevisNumber ? 'la modification' : 'la création') + ' du devis');
    } finally {
      setIsGenerating(false);
    }
  };

  const viewDevis = async (devis) => {
    try {
      const token = localStorage.getItem('token');
      const url = `${API_URL}/api/invoices/scb/devis/${devis.devisNumber}/html`;
      const response = await fetch(url, { headers: { 'Authorization': `Bearer ${token}` } });
      if (!response.ok) throw new Error('Erreur lors de la récupération du devis');
      const htmlContent = await response.text();
      const w = window.open('', '_blank');
      w.document.write(htmlContent);
      w.document.close();
    } catch (error) {
      console.error('Erreur visualisation devis:', error);
      alert('Erreur lors de la visualisation du devis');
    }
  };

  const handleEditDevis = (devis) => {
    const parts = (devis.clientName || '').split(' ');
    const firstName = parts.length > 1 ? parts[0] : '';
    const lastName = parts.length > 1 ? parts.slice(1).join(' ') : (devis.clientName || '');
    const toDateInput = (iso) => iso ? new Date(iso).toISOString().slice(0, 10) : '';
    setFormData({
      clientFirstName: firstName, clientLastName: lastName,
      clientCompany: devis.clientCompany || '', clientEmail: devis.clientEmail || '',
      clientAddress: devis.clientAddress || '', clientPostalCode: devis.clientPostalCode || '',
      clientCity: devis.clientCity || '',
      invoiceDescription: devis.description || '', invoiceSubtitle: devis.subtitle || '',
      quantity: devis.quantity || 1, unitPrice: devis.unitPrice || 0, tvaRate: devis.tvaRate || 0,
      date: toDateInput(devis.date),
      dueDate: toDateInput(devis.dueDate) || computeDefaultDueDate(toDateInput(devis.date)),
      validityDays: devis.validityDays || 30,
      paymentTerms: devis.paymentTerms || ''
    });
    setEditingDevisNumber(devis.devisNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingDevisNumber(null);
    setFormData(prev => ({
      ...prev,
      invoiceDescription: '', invoiceSubtitle: '', quantity: 1, unitPrice: 0,
      date: todayStr, dueDate: computeDefaultDueDate(todayStr)
    }));
  };

  const deleteDevis = async (devisNumber) => {
    if (!window.confirm('Voulez-vous vraiment supprimer ce devis ?')) return;
    try {
      setIsDeleting(devisNumber);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/invoices/scb/devis/${devisNumber}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) await loadDevis();
      else alert('Erreur lors de la suppression: ' + data.error);
    } catch (error) {
      console.error('Erreur suppression devis:', error);
      alert('Erreur lors de la suppression du devis');
    } finally {
      setIsDeleting(null);
    }
  };

  const convertToInvoice = async (devis) => {
    if (devis.status === 'converted' && devis.convertedTo) {
      const go = window.confirm(`Ce devis a déjà été converti en facture ${devis.convertedTo}. Voulez-vous ouvrir cette facture ?`);
      if (go) window.open(`${API_URL}/api/invoices/scb/${devis.convertedTo}/html`, '_blank');
      return;
    }
    if (!window.confirm(`Convertir le devis ${devis.devisNumber} en facture ? Un nouveau numéro de facture sera généré.`)) return;
    try {
      setIsConverting(devis.devisNumber);
      const token = localStorage.getItem('token');
      // Générer le HTML de la facture (avec mention "Issue du devis DEV-...")
      const htmlContent = generateInvoiceHTMLFromDevis(devis);
      const response = await fetch(`${API_URL}/api/invoices/scb/devis/${devis.devisNumber}/convert`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ htmlContent })
      });
      const data = await response.json();
      if (data.success) {
        await loadDevis();
        alert(`Devis converti en facture ${data.invoice.invoiceNumber} avec succès !`);
        // Ouvrir la facture créée
        const invResp = await fetch(`${API_URL}/api/invoices/scb/${data.invoice.invoiceNumber}/html`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (invResp.ok) {
          const html = await invResp.text();
          const w = window.open('', '_blank');
          w.document.write(html);
          w.document.close();
        }
      } else {
        alert('Erreur lors de la conversion: ' + data.error);
      }
    } catch (error) {
      console.error('Erreur conversion devis:', error);
      alert('Erreur lors de la conversion du devis');
    } finally {
      setIsConverting(null);
    }
  };

  return (
    <div className="invoice-generator-container">
      <div className="invoice-generator-header">
        <h1><i className="fas fa-file-signature"></i> Devis - Studio du Cap Brun</h1>
        <p className="subtitle">Générez vos devis professionnels, convertibles en factures</p>
        <div style={{ marginTop: '10px' }}>
          <Link to="/facturier" style={{ color: '#ff6b2c', textDecoration: 'none', fontSize: '14px' }}>
            <i className="fas fa-arrow-left"></i> Retour au facturier
          </Link>
        </div>
      </div>

      <div className="invoice-form-card">
        <h2><i className="fas fa-user"></i> Informations Client</h2>
        <div className="form-row">
          <div className="form-group">
            <label>Prénom</label>
            <input type="text" value={formData.clientFirstName}
              onChange={(e) => handleInputChange('clientFirstName', e.target.value)} placeholder="Jean" />
          </div>
          <div className="form-group">
            <label>Nom *</label>
            <input type="text" value={formData.clientLastName}
              onChange={(e) => handleInputChange('clientLastName', e.target.value)} placeholder="Dupont" required />
          </div>
        </div>
        <div className="form-group">
          <label>Société / Entreprise</label>
          <input type="text" value={formData.clientCompany}
            onChange={(e) => handleInputChange('clientCompany', e.target.value)} placeholder="Nom de l'entreprise (optionnel)" />
        </div>
        <div className="form-group">
          <label>Email</label>
          <input type="email" value={formData.clientEmail}
            onChange={(e) => handleInputChange('clientEmail', e.target.value)} placeholder="client@example.com" />
        </div>
        <div className="form-group">
          <label>Adresse</label>
          <input type="text" value={formData.clientAddress}
            onChange={(e) => handleInputChange('clientAddress', e.target.value)} placeholder="123 Rue de la République" />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Code postal</label>
            <input type="text" value={formData.clientPostalCode}
              onChange={(e) => handleInputChange('clientPostalCode', e.target.value)} placeholder="75001" />
          </div>
          <div className="form-group">
            <label>Ville</label>
            <input type="text" value={formData.clientCity}
              onChange={(e) => handleInputChange('clientCity', e.target.value)} placeholder="Paris" />
          </div>
        </div>

        <h2><i className="fas fa-file-alt"></i> Prestation</h2>
        <div className="form-group">
          <label>Description *</label>
          <input type="text" value={formData.invoiceDescription}
            onChange={(e) => handleInputChange('invoiceDescription', e.target.value)}
            placeholder="Rédaction d'articles de blog (5 articles)" required />
        </div>
        <div className="form-group">
          <label>Sous-titre / Détails</label>
          <textarea value={formData.invoiceSubtitle}
            onChange={(e) => handleInputChange('invoiceSubtitle', e.target.value)}
            placeholder="Détails de la prestation (optionnel)" rows="2" />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Quantité</label>
            <input type="number" min="1" step="1" value={formData.quantity}
              onChange={(e) => handleInputChange('quantity', parseInt(e.target.value, 10) || 1)} required />
          </div>
          <div className="form-group">
            <label>Prix unitaire (€) *</label>
            <input type="number" min="0" step="0.01" value={formData.unitPrice}
              onChange={(e) => handleInputChange('unitPrice', parseFloat(e.target.value) || 0)} placeholder="0.00" required />
          </div>
          <div className="form-group">
            <label>TVA (%)</label>
            <select value={formData.tvaRate}
              onChange={(e) => handleInputChange('tvaRate', parseFloat(e.target.value))}>
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
            <input type="date" value={formData.date}
              onChange={(e) => handleInputChange('date', e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Durée de validité (jours)</label>
            <input type="number" min="1" step="1" value={formData.validityDays}
              onChange={(e) => handleInputChange('validityDays', parseInt(e.target.value, 10) || 30)}
              title="Par défaut : 30 jours" />
          </div>
        </div>

        <div className="form-group">
          <label>Modalités de paiement</label>
          <textarea value={formData.paymentTerms}
            onChange={(e) => handleInputChange('paymentTerms', e.target.value)}
            placeholder="Acompte de 30% à la commande, solde à 30 jours..." rows="2" />
        </div>

        <div className="invoice-totals">
          <div className="total-row"><span>Total HT :</span><span className="total-value">{totalHT.toFixed(2)} €</span></div>
          <div className="total-row"><span>TVA ({formData.tvaRate}%) :</span><span className="total-value">{tvaAmount.toFixed(2)} €</span></div>
          <div className="total-row total-final"><span>Total TTC :</span><span className="total-value">{totalTTC.toFixed(2)} €</span></div>
        </div>

        {editingDevisNumber && (
          <div style={{ padding: '10px 12px', marginBottom: '10px', background: 'rgba(255, 107, 44, 0.1)', border: '1px solid #ff6b2c', borderRadius: '6px', fontSize: '13px', color: '#ff6b2c', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <i className="fas fa-edit"></i>
            <strong>Mode édition</strong> — Modification du devis {editingDevisNumber} (le numéro est conservé)
          </div>
        )}

        <button className="btn-generate" onClick={generateDevis} disabled={isGenerating}
          style={{ opacity: isGenerating ? 0.7 : 1 }}>
          {isGenerating ? (
            <><i className="fas fa-spinner fa-spin"></i> {editingDevisNumber ? 'Mise à jour...' : 'Génération en cours...'}</>
          ) : (
            <><i className={editingDevisNumber ? 'fas fa-save' : 'fas fa-file-signature'}></i> {editingDevisNumber ? 'Mettre à jour le Devis' : 'Générer le Devis'}</>
          )}
        </button>

        {editingDevisNumber && (
          <button className="btn-cancel-edit" onClick={handleCancelEdit} disabled={isGenerating}
            style={{ marginLeft: '10px', padding: '10px 20px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '6px', color: 'inherit', cursor: isGenerating ? 'not-allowed' : 'pointer', fontSize: '14px' }}>
            <i className="fas fa-times"></i> Annuler la modification
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="invoice-history-card">
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <i className="fas fa-spinner fa-spin" style={{ fontSize: '2em', color: '#ff6b2c' }}></i>
            <p style={{ marginTop: '15px', color: '#666' }}>Chargement des devis...</p>
          </div>
        </div>
      ) : devisList.length > 0 && (
        <div className="invoice-history-card">
          <h2><i className="fas fa-history"></i> Devis Générés ({devisList.length})</h2>
          <div className="invoice-history-list">
            {devisList.map((devis) => (
              <div key={devis.devisNumber} className="invoice-history-item">
                <div className="invoice-history-info">
                  <div className="invoice-number">
                    {devis.devisNumber}
                    {devis.status === 'converted' && (
                      <span style={{ marginLeft: '8px', fontSize: '11px', color: '#10b981', fontWeight: 'normal' }}>
                        ✓ Converti en {devis.convertedTo}
                      </span>
                    )}
                  </div>
                  <div className="invoice-client">{devis.clientName}</div>
                  <div className="invoice-date">{new Date(devis.date).toLocaleDateString('fr-FR')}</div>
                </div>
                <div className="invoice-history-amount">{devis.totalTTC.toFixed(2)} €</div>
                <div className="invoice-history-actions">
                  <button className="btn-view-small" onClick={() => viewDevis(devis)} title="Voir le devis">
                    <i className="fas fa-eye"></i>
                  </button>
                  <button className="btn-edit-small" onClick={() => handleEditDevis(devis)} title="Modifier le devis"
                    disabled={devis.status === 'converted'}>
                    <i className="fas fa-edit"></i>
                  </button>
                  <button className="btn-convert-small" onClick={() => convertToInvoice(devis)}
                    disabled={isConverting === devis.devisNumber || devis.status === 'converted'}
                    style={{ opacity: (isConverting === devis.devisNumber || devis.status === 'converted') ? 0.7 : 1 }}
                    title={devis.status === 'converted' ? 'Déjà converti' : 'Convertir en facture'}>
                    {isConverting === devis.devisNumber ? (
                      <i className="fas fa-spinner fa-spin"></i>
                    ) : (
                      <i className="fas fa-file-invoice"></i>
                    )}
                  </button>
                  <button className="btn-delete-small" onClick={() => deleteDevis(devis.devisNumber)}
                    disabled={isDeleting === devis.devisNumber}
                    style={{ opacity: isDeleting === devis.devisNumber ? 0.7 : 1 }} title="Supprimer">
                    {isDeleting === devis.devisNumber ? (
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

export default DevisGenerator;
