import express from 'express';
import cors from 'cors';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Logger pour toutes les requêtes
app.use((req, res, next) => {
  console.log(`\n🔔 ${req.method} ${req.url} - ${new Date().toLocaleTimeString()}`);
  next();
});

// Configuration Nodemailer
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // true pour 465, false pour autres ports
  auth: {
    user: process.env.VITE_EMAIL_USER,
    pass: process.env.VITE_EMAIL_PASSWORD
  },
  tls: {
    rejectUnauthorized: false // Accepter les certificats auto-signés
  }
});

// Route pour envoyer un email
app.post('/api/send-email', async (req, res) => {
  console.log('\n' + '─'.repeat(60));
  console.log('📨 NOUVELLE REQUÊTE D\'ENVOI D\'EMAIL');
  console.log('─'.repeat(60));
  
  const { to, subject, html } = req.body;
  
  console.log(`📧 Destinataire: ${to}`);
  console.log(`📝 Sujet: ${subject}`);
  console.log(`⏰ Heure: ${new Date().toLocaleTimeString()}`);

  if (!process.env.VITE_EMAIL_USER || !process.env.VITE_EMAIL_PASSWORD) {
    console.log('❌ Configuration email manquante !');
    return res.status(500).json({ 
      success: false, 
      error: 'Configuration email manquante. Veuillez configurer .env.local' 
    });
  }

  try {
    console.log('📤 Envoi en cours...');
    await transporter.sendMail({
      from: `"Assistant Rédactionnel" <${process.env.VITE_EMAIL_USER}>`,
      to,
      subject,
      html
    });

    console.log(`✅ Email envoyé avec succès à ${to}`);
    console.log('─'.repeat(60) + '\n');
    res.json({ success: true });
  } catch (error) {
    console.error('❌ ERREUR lors de l\'envoi:');
    console.error(error.message);
    console.log('─'.repeat(60) + '\n');
    res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(PORT, () => {
  console.log('\n' + '='.repeat(60));
  console.log(`🚀 SERVEUR EMAIL DÉMARRÉ`);
  console.log('='.repeat(60));
  console.log(`📍 URL locale:  http://localhost:${PORT}`);
  console.log(`📍 URL réseau:  http://127.0.0.1:${PORT}`);
  console.log(`📧 Email configuré: ${process.env.VITE_EMAIL_USER || '❌ NON CONFIGURÉ'}`);
  console.log(`🔗 Endpoint API: POST http://localhost:${PORT}/api/send-email`);
  console.log('='.repeat(60) + '\n');
});
