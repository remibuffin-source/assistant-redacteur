import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import puppeteer from 'puppeteer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Script pour générer un PDF à partir d'une facture SCB
 * Usage: node generate-invoice-pdf.js SCB-20260127-0001
 */

async function generateInvoicePDF(invoiceNumber) {
  try {
    const storagePath = process.env.STORAGE_PATH || path.join(__dirname, '..', '..', 'stockage');
    const scbInvoicesDir = path.join(storagePath, 'users', 'scb', 'invoices');
    
    // Vérifier si le fichier HTML existe
    const htmlPath = path.join(scbInvoicesDir, `${invoiceNumber}.html`);
    const jsonPath = path.join(scbInvoicesDir, `${invoiceNumber}.json`);
    
    let htmlContent;
    
    try {
      // Essayer de lire le HTML existant
      htmlContent = await fs.readFile(htmlPath, 'utf8');
      console.log(`✅ HTML trouvé: ${htmlPath}`);
    } catch (err) {
      // Si pas de HTML, essayer de le générer depuis le JSON
      console.log(`⚠️  HTML non trouvé, tentative de génération depuis JSON...`);
      
      try {
        const jsonContent = await fs.readFile(jsonPath, 'utf8');
        const invoiceData = JSON.parse(jsonContent);
        htmlContent = generateHTMLFromData(invoiceData);
        console.log(`✅ HTML généré depuis JSON`);
      } catch (jsonErr) {
        console.error(`❌ Impossible de trouver le HTML ou le JSON pour ${invoiceNumber}`);
        console.error(`Chemins vérifiés:`);
        console.error(`  - ${htmlPath}`);
        console.error(`  - ${jsonPath}`);
        process.exit(1);
      }
    }
    
    // Copier le logo dans le dossier de la facture si nécessaire
    // Chemin local pour développement
    const logoSourcePath = path.join(__dirname, '..', '..', 'react-app', 'public', 'Studio du Cap Brun.png');
    const logoDestPath = path.join(scbInvoicesDir, 'Studio du Cap Brun.png');
    
    // Note: Sur O2Switch multisite, le logo doit être dans:
    // /home/bure7653/assistant-redacteur.fr/public_html/Studio du Cap Brun.png
    
    try {
      await fs.copyFile(logoSourcePath, logoDestPath);
      console.log(`✅ Logo copié dans le dossier de la facture`);
    } catch (err) {
      console.log(`⚠️  Logo non copié (peut-être déjà présent)`);
    }
    
    // Convertir le logo en base64 pour l'intégrer dans le HTML
    let logoBase64 = '';
    try {
      const logoBuffer = await fs.readFile(logoSourcePath);
      logoBase64 = `data:image/png;base64,${logoBuffer.toString('base64')}`;
      console.log(`✅ Logo converti en base64`);
    } catch (err) {
      console.log(`⚠️  Impossible de lire le logo`);
    }
    
    // Remplacer le chemin du logo dans le HTML par la version base64
    if (logoBase64) {
      htmlContent = htmlContent.replace(
        /src="\/Studio du Cap Brun\.png"/g,
        `src="${logoBase64}"`
      );
    }
    
    // Générer le PDF avec Puppeteer
    console.log(`🔄 Génération du PDF...`);
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
    
    const pdfPath = path.join(scbInvoicesDir, `${invoiceNumber}.pdf`);
    await page.pdf({
      path: pdfPath,
      format: 'A4',
      printBackground: true,
      margin: {
        top: '0',
        right: '0',
        bottom: '0',
        left: '0'
      }
    });
    
    await browser.close();
    
    console.log(`✅ PDF généré: ${pdfPath}`);
    return pdfPath;
    
  } catch (error) {
    console.error(`❌ Erreur génération PDF:`, error);
    process.exit(1);
  }
}

function generateHTMLFromData(data) {
  const date = new Date(data.date).toLocaleDateString('fr-FR');
  
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Facture ${data.invoiceNumber}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      color: #333;
      line-height: 1.6;
      padding: 40px;
    }
    .header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 40px;
      border-bottom: 3px solid #2c3e50;
      padding-bottom: 20px;
    }
    .company-info h1 {
      color: #2c3e50;
      font-size: 28px;
      margin-bottom: 10px;
    }
    .company-info p {
      color: #7f8c8d;
      font-size: 14px;
    }
    .invoice-info {
      text-align: right;
    }
    .invoice-info h2 {
      color: #e74c3c;
      font-size: 32px;
      margin-bottom: 10px;
    }
    .invoice-info p {
      font-size: 14px;
      color: #7f8c8d;
    }
    .client-info {
      background: #ecf0f1;
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 40px;
    }
    .client-info h3 {
      color: #2c3e50;
      margin-bottom: 10px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 30px;
    }
    thead {
      background: #34495e;
      color: white;
    }
    th, td {
      padding: 15px;
      text-align: left;
      border-bottom: 1px solid #ecf0f1;
    }
    th {
      font-weight: 600;
    }
    .text-right {
      text-align: right;
    }
    .totals {
      margin-left: auto;
      width: 300px;
    }
    .totals table {
      margin-bottom: 0;
    }
    .totals td {
      padding: 10px;
    }
    .totals .total-row {
      background: #2c3e50;
      color: white;
      font-weight: bold;
      font-size: 18px;
    }
    .footer {
      margin-top: 60px;
      padding-top: 20px;
      border-top: 2px solid #ecf0f1;
      text-align: center;
      color: #7f8c8d;
      font-size: 12px;
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="company-info">
      <h1>Studio du Cap Brun</h1>
      <p>Adresse de l'entreprise</p>
      <p>Code postal Ville</p>
      <p>SIRET: XXX XXX XXX XXXXX</p>
    </div>
    <div class="invoice-info">
      <h2>FACTURE</h2>
      <p><strong>${data.invoiceNumber}</strong></p>
      <p>Date: ${date}</p>
    </div>
  </div>

  <div class="client-info">
    <h3>Client</h3>
    <p><strong>${data.clientName}</strong></p>
    ${data.clientCompany ? `<p>${data.clientCompany}</p>` : ''}
    ${data.clientEmail ? `<p>${data.clientEmail}</p>` : ''}
    <p>${data.clientAddress || ''}</p>
    <p>${data.clientPostalCode || ''} ${data.clientCity || ''}</p>
  </div>

  <table>
    <thead>
      <tr>
        <th>Description</th>
        <th class="text-right">Quantité</th>
        <th class="text-right">Prix unitaire</th>
        <th class="text-right">Total HT</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>
          <strong>${data.description || 'Prestation'}</strong>
          ${data.subtitle ? `<br><small>${data.subtitle}</small>` : ''}
        </td>
        <td class="text-right">${data.quantity || 1}</td>
        <td class="text-right">${parseFloat(data.unitPrice || 0).toFixed(2)} €</td>
        <td class="text-right">${parseFloat(data.totalHT || 0).toFixed(2)} €</td>
      </tr>
    </tbody>
  </table>

  <div class="totals">
    <table>
      <tr>
        <td>Total HT</td>
        <td class="text-right">${parseFloat(data.totalHT || 0).toFixed(2)} €</td>
      </tr>
      <tr>
        <td>TVA (${data.tvaRate || 20}%)</td>
        <td class="text-right">${parseFloat(data.tvaAmount || 0).toFixed(2)} €</td>
      </tr>
      <tr class="total-row">
        <td>Total TTC</td>
        <td class="text-right">${parseFloat(data.totalTTC || 0).toFixed(2)} €</td>
      </tr>
    </table>
  </div>

  <div class="footer">
    <p>Merci de votre confiance</p>
    <p>Conditions de paiement: À réception de facture</p>
  </div>
</body>
</html>`;
}

// Exécution du script
const invoiceNumber = process.argv[2];

if (!invoiceNumber) {
  console.error('❌ Usage: node generate-invoice-pdf.js <numéro-facture>');
  console.error('   Exemple: node generate-invoice-pdf.js SCB-20260127-0001');
  process.exit(1);
}

generateInvoicePDF(invoiceNumber);
