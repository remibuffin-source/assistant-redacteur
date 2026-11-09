import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { Invoice, User } from '../models/index.sequelize.js';
import { logger } from '../utils/logger.js';
import fs from 'fs/promises';
import path from 'path';

const router = express.Router();

// Chemin de stockage des factures
const STORAGE_BASE_PATH = process.env.STORAGE_PATH || '/home/bure7653/assistant-redacteur/stockage';

// --- Compteur de factures SCB côté serveur (partagé entre tous les appareils) ---
// Verrou simple in-process pour éviter les race conditions sur le compteur.
let scbCounterLock = Promise.resolve();
function withScbLock(task) {
  const run = scbCounterLock.then(task, task);
  scbCounterLock = run.catch(() => {});
  return run;
}

/**
 * Génère le prochain numéro de facture SCB côté serveur.
 * Format: SCB-YYYYMMDD-XXXX (compteur par jour, persisté dans un fichier).
 * Garantit l'unicité : si un fichier de facture existe déjà pour ce numéro,
 * incrémente jusqu'à trouver un numéro libre (n'écrase jamais une facture existante).
 */
async function generateScbInvoiceNumber() {
  return withScbLock(async () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateStr = `${year}${month}${day}`;

    const scbDir = path.join(STORAGE_BASE_PATH, 'users', 'scb');
    const invoicesDir = path.join(scbDir, 'invoices');
    await fs.mkdir(invoicesDir, { recursive: true });

    const counterFile = path.join(scbDir, `counter_${dateStr}.txt`);
    let counter = 0;
    try {
      const content = await fs.readFile(counterFile, 'utf8');
      counter = parseInt(content, 10) || 0;
    } catch (e) {
      // fichier inexistant -> commence à 0
    }

    // Incrémente jusqu'à trouver un numéro dont aucun fichier n'existe
    let invoiceNumber;
    let attempts = 0;
    while (attempts < 1000) {
      counter += 1;
      attempts += 1;
      const counterStr = String(counter).padStart(4, '0');
      invoiceNumber = `SCB-${dateStr}-${counterStr}`;
      const htmlPath = path.join(invoicesDir, `${invoiceNumber}.html`);
      const jsonPath = path.join(invoicesDir, `${invoiceNumber}.json`);
      const exists = async (p) => fs.access(p).then(() => true).catch(() => false);
      const [h, j] = await Promise.all([exists(htmlPath), exists(jsonPath)]);
      if (!h && !j) break;
    }

    // Persister le compteur
    await fs.writeFile(counterFile, counter.toString(), 'utf8');
    return invoiceNumber;
  });
}

// --- Compteur de factures FACT- (recharges de crédit) côté serveur ---
// Verrou simple in-process pour éviter les race conditions sur le compteur.
let factCounterLock = Promise.resolve();
function withFactLock(task) {
  const run = factCounterLock.then(task, task);
  factCounterLock = run.catch(() => {});
  return run;
}

/**
 * Génère le prochain numéro de facture FACT- côté serveur.
 * Format: FACT-YYYYMMDD-XXXX (compteur global par jour, persisté dans un fichier).
 * Garantit l'unicité : vérifie en base (table invoices, invoice_number unique)
 * et incrémente jusqu'à trouver un numéro libre.
 */
async function generateFactInvoiceNumber() {
  return withFactLock(async () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateStr = `${year}${month}${day}`;

    const countersDir = path.join(STORAGE_BASE_PATH, 'users', '_counters');
    await fs.mkdir(countersDir, { recursive: true });
    const counterFile = path.join(countersDir, `fact_counter_${dateStr}.txt`);
    let counter = 0;
    try {
      const content = await fs.readFile(counterFile, 'utf8');
      counter = parseInt(content, 10) || 0;
    } catch (e) {
      // fichier inexistant -> commence à 0
    }

    // Incrémente jusqu'à trouver un numéro qui n'existe pas en base
    let invoiceNumber;
    let attempts = 0;
    while (attempts < 1000) {
      counter += 1;
      attempts += 1;
      const counterStr = String(counter).padStart(4, '0');
      invoiceNumber = `FACT-${dateStr}-${counterStr}`;
      const existing = await Invoice.findOne({ where: { invoiceNumber } });
      if (!existing) break;
    }

    // Persister le compteur
    await fs.writeFile(counterFile, counter.toString(), 'utf8');
    return invoiceNumber;
  });
}

// --- Compteur de devis SCB côté serveur ---
// Même logique que les factures, dossier séparé (users/scb/devis/).
let devisCounterLock = Promise.resolve();
function withDevisLock(task) {
  const run = devisCounterLock.then(task, task);
  devisCounterLock = run.catch(() => {});
  return run;
}

/**
 * Génère le prochain numéro de devis côté serveur.
 * Format: DEV-YYYYMMDD-XXXX (compteur par jour, persisté dans un fichier).
 * Garantit l'unicité (vérifie l'existence des fichiers).
 */
async function generateDevisNumber() {
  return withDevisLock(async () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateStr = `${year}${month}${day}`;

    const scbDir = path.join(STORAGE_BASE_PATH, 'users', 'scb');
    const devisDir = path.join(scbDir, 'devis');
    await fs.mkdir(devisDir, { recursive: true });

    const counterFile = path.join(scbDir, `devis_counter_${dateStr}.txt`);
    let counter = 0;
    try {
      const content = await fs.readFile(counterFile, 'utf8');
      counter = parseInt(content, 10) || 0;
    } catch (e) {
      // fichier inexistant -> commence à 0
    }

    let devisNumber;
    let attempts = 0;
    while (attempts < 1000) {
      counter += 1;
      attempts += 1;
      const counterStr = String(counter).padStart(4, '0');
      devisNumber = `DEV-${dateStr}-${counterStr}`;
      const htmlPath = path.join(devisDir, `${devisNumber}.html`);
      const jsonPath = path.join(devisDir, `${devisNumber}.json`);
      const exists = async (p) => fs.access(p).then(() => true).catch(() => false);
      const [h, j] = await Promise.all([exists(htmlPath), exists(jsonPath)]);
      if (!h && !j) break;
    }

    await fs.writeFile(counterFile, counter.toString(), 'utf8');
    return devisNumber;
  });
}

/**
 * POST /api/invoices
 * Créer une nouvelle facture
 */
router.post('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      amount,
      amountTTC,
      tva = 0,
      paymentMethod = 'stripe',
      paymentIntentId,
      items = [],
      htmlContent
    } = req.body;

    if (!amount) {
      return res.status(400).json({
        success: false,
        error: 'Montant requis'
      });
    }

    // Récupérer l'email de l'utilisateur
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ success: false, error: 'Utilisateur non trouvé' });
    }

    // Génération du numéro de facture CÔTÉ SERVEUR (partagé entre tous les appareils).
    // Le client n'envoie plus le numéro ; on l'attribue de façon atomique et unique.
    const invoiceNumber = await generateFactInvoiceNumber();

    // Nouvelle architecture : /stockage/users/{userId}/invoices/
    const invoicesDir = path.join(STORAGE_BASE_PATH, 'users', String(userId), 'invoices');
    await fs.mkdir(invoicesDir, { recursive: true });

    // Substituer le placeholder {{INVOICE_NUMBER}} par le numéro réel attribué.
    const finalHtml = htmlContent
      ? htmlContent.replace(/\{\{INVOICE_NUMBER\}\}/g, invoiceNumber)
      : null;

    // Sauvegarder le fichier HTML de la facture
    let filePath = null;
    if (finalHtml) {
      const fileName = `${invoiceNumber}.html`;
      filePath = path.join(invoicesDir, fileName);
      await fs.writeFile(filePath, finalHtml, 'utf8');
      logger.info(`📄 Facture HTML sauvegardée: ${filePath}`);
    }

    // Créer la facture en base de données
    const invoice = await Invoice.create({
      invoiceNumber,
      userId,
      userEmail: user.email,
      amount: parseFloat(amount),
      amountTTC: parseFloat(amountTTC || amount),
      tva: parseFloat(tva),
      paymentMethod,
      paymentIntentId,
      status: 'paid',
      items: JSON.stringify(items),
      htmlContent: finalHtml,
      filePath: filePath ? `users/${userId}/invoices/${invoiceNumber}.html` : null,
      invoiceDate: new Date()
    });

    logger.info(`✅ Facture créée: ${invoiceNumber} pour user ${userId}`);

    res.json({
      success: true,
      invoice: {
        id: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        amount: invoice.amount,
        amountTTC: invoice.amountTTC,
        status: invoice.status,
        invoiceDate: invoice.invoiceDate,
        filePath: invoice.filePath
      }
    });

  } catch (error) {
    logger.error('❌ Erreur création facture:', error);
    res.status(500).json({ success: false, error: 'Erreur lors de la création de la facture' });
  }
});

/**
 * POST /api/invoices/scb
 * Créer une facture Studio du Cap Brun (Admin uniquement)
 * IMPORTANT: Cette route doit être AVANT /:id pour éviter les conflits
 */
router.post('/scb', authenticateToken, async (req, res) => {
  try {
    // Vérifier que l'utilisateur est admin
    const user = await User.findByPk(req.user.id);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        error: 'Accès refusé. Droits administrateur requis.' 
      });
    }
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Erreur de vérification des droits' });
  }
  
  try {
    const {
      clientName,
      clientCompany,
      clientEmail,
      clientAddress,
      clientPostalCode,
      clientCity,
      description,
      subtitle,
      quantity,
      unitPrice,
      totalHT,
      tvaRate,
      tvaAmount,
      totalTTC,
      htmlContent
    } = req.body;

    if (!clientName || !totalTTC) {
      return res.status(400).json({
        success: false,
        error: 'Nom client et montant requis'
      });
    }

    // Dossier spécifique pour Studio du Cap Brun
    const scbInvoicesDir = path.join(STORAGE_BASE_PATH, 'users', 'scb', 'invoices');
    await fs.mkdir(scbInvoicesDir, { recursive: true });

    // Génération du numéro de facture CÔTÉ SERVEUR (partagé entre tous les appareils).
    // Le client n'envoie plus le numéro ; on l'attribue de façon atomique et unique.
    const invoiceNumber = await generateScbInvoiceNumber();

    // Garde finale anti-écrasement : ne jamais écraser une facture existante.
    const htmlFilePath = path.join(scbInvoicesDir, `${invoiceNumber}.html`);
    const jsonFilePath = path.join(scbInvoicesDir, `${invoiceNumber}.json`);
    const fileExists = async (p) => fs.access(p).then(() => true).catch(() => false);
    if (await fileExists(htmlFilePath) || await fileExists(jsonFilePath)) {
      logger.error(`❌ Conflit numéro de facture SCB (déjà existant): ${invoiceNumber}`);
      return res.status(409).json({
        success: false,
        error: `Le numéro de facture ${invoiceNumber} existe déjà. Réessayez.`
      });
    }

    // Substituer le placeholder {{INVOICE_NUMBER}} par le numéro réel attribué.
    const finalHtml = htmlContent
      ? htmlContent.replace(/\{\{INVOICE_NUMBER\}\}/g, invoiceNumber)
      : null;

    // Sauvegarder le fichier HTML de la facture
    if (finalHtml) {
      await fs.writeFile(htmlFilePath, finalHtml, 'utf8');
      logger.info(`📄 Facture SCB HTML sauvegardée: ${htmlFilePath}`);
    }

    // Sauvegarder aussi les métadonnées en JSON
    const invoiceData = {
      invoiceNumber,
      date: new Date().toISOString(),
      clientName,
      clientCompany,
      clientEmail,
      clientAddress,
      clientPostalCode,
      clientCity,
      description,
      subtitle,
      quantity,
      unitPrice,
      totalHT,
      tvaRate,
      tvaAmount,
      totalTTC
    };

    await fs.writeFile(jsonFilePath, JSON.stringify(invoiceData, null, 2), 'utf8');

    logger.info(`✅ Facture SCB créée: ${invoiceNumber}`);

    res.json({
      success: true,
      invoice: invoiceData,
      htmlPath: `users/scb/invoices/${invoiceNumber}.html`
    });

  } catch (error) {
    logger.error('❌ Erreur création facture SCB:', error);
    res.status(500).json({ success: false, error: 'Erreur lors de la création de la facture' });
  }
});

/**
 * GET /api/invoices/scb
 * Liste les factures Studio du Cap Brun (Admin uniquement)
 * IMPORTANT: Cette route doit être AVANT /:id pour éviter les conflits
 */
router.get('/scb', authenticateToken, async (req, res) => {
  try {
    // Vérifier que l'utilisateur est admin
    const user = await User.findByPk(req.user.id);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        error: 'Accès refusé. Droits administrateur requis.' 
      });
    }
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Erreur de vérification des droits' });
  }
  
  try {
    const scbInvoicesDir = path.join(STORAGE_BASE_PATH, 'users', 'scb', 'invoices');
    
    // Créer le dossier s'il n'existe pas
    await fs.mkdir(scbInvoicesDir, { recursive: true });

    // Lire tous les fichiers JSON
    const files = await fs.readdir(scbInvoicesDir);
    const jsonFiles = files.filter(f => f.endsWith('.json'));

    const invoices = [];
    for (const file of jsonFiles) {
      const filePath = path.join(scbInvoicesDir, file);
      const content = await fs.readFile(filePath, 'utf8');
      const invoice = JSON.parse(content);
      invoices.push(invoice);
    }

    // Trier par date décroissante
    invoices.sort((a, b) => new Date(b.date) - new Date(a.date));

    res.json({
      success: true,
      invoices,
      total: invoices.length
    });

  } catch (error) {
    logger.error('❌ Erreur liste factures SCB:', error);
    res.status(500).json({ success: false, error: 'Erreur lors de la récupération des factures' });
  }
});

/**
 * DELETE /api/invoices/scb/:invoiceNumber
 * Supprime une facture Studio du Cap Brun (Admin uniquement)
 * IMPORTANT: Cette route doit être AVANT /:id pour éviter les conflits
 */
router.delete('/scb/:invoiceNumber', authenticateToken, async (req, res) => {
  try {
    // Vérifier que l'utilisateur est admin
    const user = await User.findByPk(req.user.id);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        error: 'Accès refusé. Droits administrateur requis.' 
      });
    }
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Erreur de vérification des droits' });
  }
  
  try {
    const { invoiceNumber } = req.params;
    const scbInvoicesDir = path.join(STORAGE_BASE_PATH, 'users', 'scb', 'invoices');

    // Supprimer le fichier HTML
    const htmlPath = path.join(scbInvoicesDir, `${invoiceNumber}.html`);
    try {
      await fs.unlink(htmlPath);
    } catch (err) {
      // Fichier HTML peut ne pas exister
    }

    // Supprimer le fichier JSON
    const jsonPath = path.join(scbInvoicesDir, `${invoiceNumber}.json`);
    await fs.unlink(jsonPath);

    logger.info(`🗑️ Facture SCB supprimée: ${invoiceNumber}`);

    res.json({
      success: true,
      message: 'Facture supprimée avec succès'
    });

  } catch (error) {
    logger.error('❌ Erreur suppression facture SCB:', error);
    res.status(500).json({ success: false, error: 'Erreur lors de la suppression de la facture' });
  }
});

/**
 * PUT /api/invoices/scb/:invoiceNumber
 * Modifier une facture Studio du Cap Brun existante (Admin uniquement)
 * Le numéro de facture est conservé ; tous les autres champs sont mis à jour.
 * Le HTML est régénéré avec le placeholder {{INVOICE_NUMBER}} substitué.
 * IMPORTANT: Cette route doit être AVANT /:id pour éviter les conflits.
 */
router.put('/scb/:invoiceNumber', authenticateToken, async (req, res) => {
  try {
    // Vérifier que l'utilisateur est admin
    const user = await User.findByPk(req.user.id);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Accès refusé. Droits administrateur requis.'
      });
    }
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Erreur de vérification des droits' });
  }

  try {
    const { invoiceNumber } = req.params;
    const {
      clientName,
      clientCompany,
      clientEmail,
      clientAddress,
      clientPostalCode,
      clientCity,
      description,
      subtitle,
      quantity,
      unitPrice,
      totalHT,
      tvaRate,
      tvaAmount,
      totalTTC,
      date,
      dueDate,
      htmlContent
    } = req.body;

    if (!clientName || !totalTTC) {
      return res.status(400).json({
        success: false,
        error: 'Nom client et montant requis'
      });
    }

    const scbInvoicesDir = path.join(STORAGE_BASE_PATH, 'users', 'scb', 'invoices');
    const htmlFilePath = path.join(scbInvoicesDir, `${invoiceNumber}.html`);
    const jsonFilePath = path.join(scbInvoicesDir, `${invoiceNumber}.json`);

    // Vérifier que la facture existe
    const fileExists = async (p) => fs.access(p).then(() => true).catch(() => false);
    if (!await fileExists(jsonFilePath) && !await fileExists(htmlFilePath)) {
      return res.status(404).json({
        success: false,
        error: 'Facture introuvable'
      });
    }

    // Substituer le placeholder {{INVOICE_NUMBER}} par le numéro réel.
    const finalHtml = htmlContent
      ? htmlContent.replace(/\{\{INVOICE_NUMBER\}\}/g, invoiceNumber)
      : null;

    // Régénérer le fichier HTML
    if (finalHtml) {
      await fs.writeFile(htmlFilePath, finalHtml, 'utf8');
      logger.info(`📄 Facture SCB HTML mise à jour: ${htmlFilePath}`);
    }

    // Régénérer les métadonnées JSON (conserve le numéro, met à jour le reste)
    const invoiceData = {
      invoiceNumber,
      date: date || new Date().toISOString(),
      dueDate: dueDate || null,
      clientName,
      clientCompany,
      clientEmail,
      clientAddress,
      clientPostalCode,
      clientCity,
      description,
      subtitle,
      quantity,
      unitPrice,
      totalHT,
      tvaRate,
      tvaAmount,
      totalTTC
    };

    await fs.writeFile(jsonFilePath, JSON.stringify(invoiceData, null, 2), 'utf8');

    logger.info(`✏️ Facture SCB modifiée: ${invoiceNumber}`);

    res.json({
      success: true,
      invoice: invoiceData,
      htmlPath: `users/scb/invoices/${invoiceNumber}.html`
    });

  } catch (error) {
    logger.error('❌ Erreur modification facture SCB:', error);
    res.status(500).json({ success: false, error: 'Erreur lors de la modification de la facture' });
  }
});

/**
 * GET /api/invoices/scb/:invoiceNumber/html
 * Récupérer le HTML d'une facture Studio du Cap Brun (Admin uniquement)
 * IMPORTANT: Cette route doit être AVANT /:id pour éviter les conflits
 */
router.get('/scb/:invoiceNumber/html', authenticateToken, async (req, res) => {
  try {
    // Vérifier que l'utilisateur est admin
    const user = await User.findByPk(req.user.id);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        error: 'Accès refusé. Droits administrateur requis.' 
      });
    }
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Erreur de vérification des droits' });
  }
  
  try {
    const { invoiceNumber } = req.params;
    const scbInvoicesDir = path.join(STORAGE_BASE_PATH, 'users', 'scb', 'invoices');
    const htmlPath = path.join(scbInvoicesDir, `${invoiceNumber}.html`);

    // Vérifier que le fichier existe
    try {
      await fs.access(htmlPath);
    } catch (err) {
      return res.status(404).json({ 
        success: false, 
        error: 'Facture HTML non trouvée' 
      });
    }

    // Envoyer le fichier HTML
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    
    const htmlContent = await fs.readFile(htmlPath, 'utf8');
    res.send(htmlContent);

    logger.info(`📥 Facture SCB HTML récupérée: ${invoiceNumber}`);

  } catch (error) {
    logger.error('❌ Erreur récupération HTML:', error);
    res.status(500).json({ success: false, error: 'Erreur lors de la récupération du HTML' });
  }
});

/**
 * GET /api/invoices/scb/:invoiceNumber/pdf
 * Récupérer le PDF d'une facture Studio du Cap Brun (Admin uniquement)
 * IMPORTANT: Cette route doit être AVANT /:id pour éviter les conflits
 */
router.get('/scb/:invoiceNumber/pdf', authenticateToken, async (req, res) => {
  try {
    // Vérifier que l'utilisateur est admin
    const user = await User.findByPk(req.user.id);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        error: 'Accès refusé. Droits administrateur requis.' 
      });
    }
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Erreur de vérification des droits' });
  }
  
  try {
    const { invoiceNumber } = req.params;
    const scbInvoicesDir = path.join(STORAGE_BASE_PATH, 'users', 'scb', 'invoices');
    const pdfPath = path.join(scbInvoicesDir, `${invoiceNumber}.pdf`);

    // Vérifier que le fichier existe
    try {
      await fs.access(pdfPath);
    } catch (err) {
      return res.status(404).json({ 
        success: false, 
        error: 'Facture PDF non trouvée' 
      });
    }

    // Envoyer le fichier PDF
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${invoiceNumber}.pdf"`);
    
    const pdfContent = await fs.readFile(pdfPath);
    res.send(pdfContent);

    logger.info(`📥 Facture SCB PDF récupérée: ${invoiceNumber}`);

  } catch (error) {
    logger.error('❌ Erreur récupération PDF:', error);
    res.status(500).json({ success: false, error: 'Erreur lors de la récupération du PDF' });
  }
});

// ===========================================================================
// ROUTES DEVIS (Studio du Cap Brun)
// Stockage : users/scb/devis/{DEV-...}.html + .json
// ===========================================================================

/**
 * Vérifie admin (factorisé pour les routes devis).
 */
async function checkAdmin(req, res) {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user || user.role !== 'admin') {
      res.status(403).json({ success: false, error: 'Accès refusé. Droits administrateur requis.' });
      return false;
    }
    return true;
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erreur de vérification des droits' });
    return false;
  }
}

/**
 * POST /api/invoices/scb/devis
 * Créer un devis (Admin uniquement)
 */
router.post('/scb/devis', authenticateToken, async (req, res) => {
  if (!await checkAdmin(req, res)) return;
  try {
    const {
      clientName, clientCompany, clientEmail, clientAddress, clientPostalCode, clientCity,
      description, subtitle, quantity, unitPrice, totalHT, tvaRate, tvaAmount, totalTTC,
      date, dueDate, validityDays, paymentTerms, htmlContent
    } = req.body;

    if (!clientName || !totalTTC) {
      return res.status(400).json({ success: false, error: 'Nom client et montant requis' });
    }

    const devisDir = path.join(STORAGE_BASE_PATH, 'users', 'scb', 'devis');
    await fs.mkdir(devisDir, { recursive: true });

    const devisNumber = await generateDevisNumber();

    // Anti-écrasement
    const htmlPath = path.join(devisDir, `${devisNumber}.html`);
    const jsonPath = path.join(devisDir, `${devisNumber}.json`);
    const fileExists = async (p) => fs.access(p).then(() => true).catch(() => false);
    if (await fileExists(htmlPath) || await fileExists(jsonPath)) {
      return res.status(409).json({ success: false, error: `Le devis ${devisNumber} existe déjà. Réessayez.` });
    }

    const finalHtml = htmlContent
      ? htmlContent.replace(/\{\{DEVIS_NUMBER\}\}/g, devisNumber)
      : null;
    if (finalHtml) {
      await fs.writeFile(htmlPath, finalHtml, 'utf8');
      logger.info(`📄 Devis SCB HTML sauvegardé: ${htmlPath}`);
    }

    const devisData = {
      devisNumber,
      date: date || new Date().toISOString(),
      dueDate: dueDate || null,
      validityDays: validityDays || 30,
      paymentTerms: paymentTerms || '',
      clientName, clientCompany, clientEmail, clientAddress, clientPostalCode, clientCity,
      description, subtitle, quantity, unitPrice, totalHT, tvaRate, tvaAmount, totalTTC,
      status: 'pending', // pending, accepted, refused, converted
      convertedTo: null,
      convertedAt: null
    };

    await fs.writeFile(jsonPath, JSON.stringify(devisData, null, 2), 'utf8');
    logger.info(`✅ Devis SCB créé: ${devisNumber}`);

    res.json({ success: true, devis: devisData, htmlPath: `users/scb/devis/${devisNumber}.html` });
  } catch (error) {
    logger.error('❌ Erreur création devis SCB:', error);
    res.status(500).json({ success: false, error: 'Erreur lors de la création du devis' });
  }
});

/**
 * GET /api/invoices/scb/devis
 * Lister les devis (Admin uniquement)
 */
router.get('/scb/devis', authenticateToken, async (req, res) => {
  if (!await checkAdmin(req, res)) return;
  try {
    const devisDir = path.join(STORAGE_BASE_PATH, 'users', 'scb', 'devis');
    await fs.mkdir(devisDir, { recursive: true });
    const files = await fs.readdir(devisDir);
    const jsonFiles = files.filter(f => f.endsWith('.json'));
    const devis = [];
    for (const file of jsonFiles) {
      const content = await fs.readFile(path.join(devisDir, file), 'utf8');
      devis.push(JSON.parse(content));
    }
    devis.sort((a, b) => new Date(b.date) - new Date(a.date));
    res.json({ success: true, devis, total: devis.length });
  } catch (error) {
    logger.error('❌ Erreur liste devis SCB:', error);
    res.status(500).json({ success: false, error: 'Erreur lors de la récupération des devis' });
  }
});

/**
 * GET /api/invoices/scb/devis/:devisNumber/html
 * Récupérer le HTML d'un devis
 */
router.get('/scb/devis/:devisNumber/html', authenticateToken, async (req, res) => {
  if (!await checkAdmin(req, res)) return;
  try {
    const { devisNumber } = req.params;
    const htmlPath = path.join(STORAGE_BASE_PATH, 'users', 'scb', 'devis', `${devisNumber}.html`);
    try {
      await fs.access(htmlPath);
    } catch (err) {
      return res.status(404).json({ success: false, error: 'Devis HTML non trouvé' });
    }
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    const htmlContent = await fs.readFile(htmlPath, 'utf8');
    res.send(htmlContent);
    logger.info(`📥 Devis SCB HTML récupéré: ${devisNumber}`);
  } catch (error) {
    logger.error('❌ Erreur récupération HTML devis:', error);
    res.status(500).json({ success: false, error: 'Erreur lors de la récupération du HTML' });
  }
});

/**
 * PUT /api/invoices/scb/devis/:devisNumber
 * Modifier un devis existant (même numéro conservé)
 */
router.put('/scb/devis/:devisNumber', authenticateToken, async (req, res) => {
  if (!await checkAdmin(req, res)) return;
  try {
    const { devisNumber } = req.params;
    const {
      clientName, clientCompany, clientEmail, clientAddress, clientPostalCode, clientCity,
      description, subtitle, quantity, unitPrice, totalHT, tvaRate, tvaAmount, totalTTC,
      date, dueDate, validityDays, paymentTerms, htmlContent
    } = req.body;

    if (!clientName || !totalTTC) {
      return res.status(400).json({ success: false, error: 'Nom client et montant requis' });
    }

    const devisDir = path.join(STORAGE_BASE_PATH, 'users', 'scb', 'devis');
    const htmlPath = path.join(devisDir, `${devisNumber}.html`);
    const jsonPath = path.join(devisDir, `${devisNumber}.json`);
    const fileExists = async (p) => fs.access(p).then(() => true).catch(() => false);
    if (!await fileExists(jsonPath) && !await fileExists(htmlPath)) {
      return res.status(404).json({ success: false, error: 'Devis introuvable' });
    }

    // Lire l'ancien devis pour conserver le statut de conversion
    let existing = {};
    try {
      existing = JSON.parse(await fs.readFile(jsonPath, 'utf8'));
    } catch (e) {}

    const finalHtml = htmlContent
      ? htmlContent.replace(/\{\{DEVIS_NUMBER\}\}/g, devisNumber)
      : null;
    if (finalHtml) {
      await fs.writeFile(htmlPath, finalHtml, 'utf8');
      logger.info(`📄 Devis SCB HTML mis à jour: ${htmlPath}`);
    }

    const devisData = {
      devisNumber,
      date: date || existing.date || new Date().toISOString(),
      dueDate: dueDate || existing.dueDate || null,
      validityDays: validityDays || existing.validityDays || 30,
      paymentTerms: paymentTerms || existing.paymentTerms || '',
      clientName, clientCompany, clientEmail, clientAddress, clientPostalCode, clientCity,
      description, subtitle, quantity, unitPrice, totalHT, tvaRate, tvaAmount, totalTTC,
      status: existing.status || 'pending',
      convertedTo: existing.convertedTo || null,
      convertedAt: existing.convertedAt || null
    };

    await fs.writeFile(jsonPath, JSON.stringify(devisData, null, 2), 'utf8');
    logger.info(`✏️ Devis SCB modifié: ${devisNumber}`);
    res.json({ success: true, devis: devisData, htmlPath: `users/scb/devis/${devisNumber}.html` });
  } catch (error) {
    logger.error('❌ Erreur modification devis SCB:', error);
    res.status(500).json({ success: false, error: 'Erreur lors de la modification du devis' });
  }
});

/**
 * DELETE /api/invoices/scb/devis/:devisNumber
 * Supprimer un devis
 */
router.delete('/scb/devis/:devisNumber', authenticateToken, async (req, res) => {
  if (!await checkAdmin(req, res)) return;
  try {
    const { devisNumber } = req.params;
    const devisDir = path.join(STORAGE_BASE_PATH, 'users', 'scb', 'devis');
    const htmlPath = path.join(devisDir, `${devisNumber}.html`);
    const jsonPath = path.join(devisDir, `${devisNumber}.json`);
    try { await fs.unlink(htmlPath); } catch (err) {}
    try { await fs.unlink(jsonPath); } catch (err) {}
    logger.info(`🗑️ Devis SCB supprimé: ${devisNumber}`);
    res.json({ success: true, message: 'Devis supprimé avec succès' });
  } catch (error) {
    logger.error('❌ Erreur suppression devis SCB:', error);
    res.status(500).json({ success: false, error: 'Erreur lors de la suppression du devis' });
  }
});

/**
 * POST /api/invoices/scb/devis/:devisNumber/convert
 * Convertir un devis en facture : crée une nouvelle facture SCB- avec un nouveau
 * numéro, copie les données du devis, ajoute une mention "Issue du devis DEV-...".
 * Le devis est marqué comme "converted" (status + convertedTo + convertedAt).
 */
router.post('/scb/devis/:devisNumber/convert', authenticateToken, async (req, res) => {
  if (!await checkAdmin(req, res)) return;
  try {
    const { devisNumber } = req.params;
    const devisDir = path.join(STORAGE_BASE_PATH, 'users', 'scb', 'devis');
    const invoicesDir = path.join(STORAGE_BASE_PATH, 'users', 'scb', 'invoices');
    await fs.mkdir(invoicesDir, { recursive: true });

    const jsonPath = path.join(devisDir, `${devisNumber}.json`);
    const fileExists = async (p) => fs.access(p).then(() => true).catch(() => false);
    if (!await fileExists(jsonPath)) {
      return res.status(404).json({ success: false, error: 'Devis introuvable' });
    }

    const devis = JSON.parse(await fs.readFile(jsonPath, 'utf8'));

    // Vérifier qu'il n'est pas déjà converti
    if (devis.status === 'converted' && devis.convertedTo) {
      return res.status(409).json({
        success: false,
        error: `Ce devis a déjà été converti en facture ${devis.convertedTo}`
      });
    }

    // Générer un nouveau numéro de facture SCB-
    const invoiceNumber = await generateScbInvoiceNumber();

    // Anti-écrasement
    const invHtmlPath = path.join(invoicesDir, `${invoiceNumber}.html`);
    const invJsonPath = path.join(invoicesDir, `${invoiceNumber}.json`);
    if (await fileExists(invHtmlPath) || await fileExists(invJsonPath)) {
      return res.status(409).json({ success: false, error: `Le numéro de facture ${invoiceNumber} existe déjà. Réessayez.` });
    }

    // Le HTML de la facture est fourni par le client (avec placeholder {{INVOICE_NUMBER}}
    // et mention "Issue du devis DEV-..."). Si non fourni, on régénère à partir du devis.
    const htmlContent = req.body && req.body.htmlContent
      ? req.body.htmlContent.replace(/\{\{INVOICE_NUMBER\}\}/g, invoiceNumber)
      : null;

    if (htmlContent) {
      await fs.writeFile(invHtmlPath, htmlContent, 'utf8');
      logger.info(`📄 Facture (issue du devis ${devisNumber}) HTML sauvegardée: ${invHtmlPath}`);
    }

    const invoiceData = {
      invoiceNumber,
      date: new Date().toISOString(),
      dueDate: devis.dueDate || null,
      clientName: devis.clientName,
      clientCompany: devis.clientCompany,
      clientEmail: devis.clientEmail,
      clientAddress: devis.clientAddress,
      clientPostalCode: devis.clientPostalCode,
      clientCity: devis.clientCity,
      description: devis.description,
      subtitle: devis.subtitle,
      quantity: devis.quantity,
      unitPrice: devis.unitPrice,
      totalHT: devis.totalHT,
      tvaRate: devis.tvaRate,
      tvaAmount: devis.tvaAmount,
      totalTTC: devis.totalTTC,
      sourceDevis: devisNumber
    };

    await fs.writeFile(invJsonPath, JSON.stringify(invoiceData, null, 2), 'utf8');
    logger.info(`✅ Facture créée depuis devis ${devisNumber}: ${invoiceNumber}`);

    // Marquer le devis comme converti
    devis.status = 'converted';
    devis.convertedTo = invoiceNumber;
    devis.convertedAt = new Date().toISOString();
    await fs.writeFile(jsonPath, JSON.stringify(devis, null, 2), 'utf8');

    res.json({
      success: true,
      invoice: invoiceData,
      devis: devis,
      htmlPath: `users/scb/invoices/${invoiceNumber}.html`
    });
  } catch (error) {
    logger.error('❌ Erreur conversion devis en facture:', error);
    res.status(500).json({ success: false, error: 'Erreur lors de la conversion du devis' });
  }
});

/**
 * GET /api/invoices/admin/all
 * Liste toutes les factures (admin uniquement)
 * IMPORTANT: Cette route doit être AVANT /:id pour éviter les conflits
 */
router.get('/admin/all', authenticateToken, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Accès refusé' });
    }

    const { limit = 100, offset = 0 } = req.query;

    const invoices = await Invoice.findAll({
      order: [['invoiceDate', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'email', 'firstName', 'lastName']
      }]
    });

    const total = await Invoice.count();

    res.json({
      success: true,
      invoices,
      total,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

  } catch (error) {
    logger.error('❌ Erreur liste factures admin:', error);
    res.status(500).json({ success: false, error: 'Erreur lors de la récupération des factures' });
  }
});

/**
 * GET /api/invoices
 * Liste les factures de l'utilisateur connecté
 */
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 50, offset = 0 } = req.query;

    const invoices = await Invoice.findAll({
      where: { userId },
      order: [['invoiceDate', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
      attributes: ['id', 'invoiceNumber', 'amount', 'amountTTC', 'tva', 'status', 'paymentMethod', 'invoiceDate', 'filePath', 'createdAt']
    });

    const total = await Invoice.count({ where: { userId } });

    res.json({
      success: true,
      invoices,
      total,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

  } catch (error) {
    logger.error('❌ Erreur liste factures:', error);
    res.status(500).json({ success: false, error: 'Erreur lors de la récupération des factures' });
  }
});

/**
 * GET /api/invoices/:id
 * Récupère une facture spécifique
 */
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const invoiceId = req.params.id;

    const invoice = await Invoice.findOne({
      where: { 
        id: invoiceId,
        userId 
      }
    });

    if (!invoice) {
      return res.status(404).json({ success: false, error: 'Facture non trouvée' });
    }

    res.json({
      success: true,
      invoice
    });

  } catch (error) {
    logger.error('❌ Erreur récupération facture:', error);
    res.status(500).json({ success: false, error: 'Erreur lors de la récupération de la facture' });
  }
});

/**
 * GET /api/invoices/:id/download
 * Télécharge le fichier HTML de la facture
 */
router.get('/:id/download', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const invoiceId = req.params.id;

    const invoice = await Invoice.findOne({
      where: { 
        id: invoiceId,
        userId 
      }
    });

    if (!invoice) {
      return res.status(404).json({ success: false, error: 'Facture non trouvée' });
    }

    // Si le contenu HTML est stocké en base
    if (invoice.htmlContent) {
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="${invoice.invoiceNumber}.html"`);
      return res.send(invoice.htmlContent);
    }

    // Sinon, lire depuis le fichier
    if (invoice.filePath) {
      const fullPath = path.join(STORAGE_BASE_PATH, invoice.filePath);
      const content = await fs.readFile(fullPath, 'utf8');
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="${invoice.invoiceNumber}.html"`);
      return res.send(content);
    }

    res.status(404).json({ success: false, error: 'Fichier de facture non disponible' });

  } catch (error) {
    logger.error('❌ Erreur téléchargement facture:', error);
    res.status(500).json({ success: false, error: 'Erreur lors du téléchargement de la facture' });
  }
});

export default router;
