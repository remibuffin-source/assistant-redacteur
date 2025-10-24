# 📧 Configuration du système d'envoi d'emails

## Mode Développement (Actuel)

En mode développement, **aucun email n'est réellement envoyé**. Les codes de vérification sont :
- ✅ Affichés directement dans l'interface utilisateur
- ✅ Affichés dans la console du serveur
- ✅ Fonctionnels pour tester l'inscription et la réinitialisation

**Aucune configuration n'est nécessaire pour le développement.**

---

## Mode Production (Envoi réel d'emails)

Pour envoyer de vrais emails en production, vous devez configurer un service SMTP.

### Option 1 : Gmail (Recommandé pour débuter)

#### Étape 1 : Créer un mot de passe d'application Gmail

1. Allez sur https://myaccount.google.com/apppasswords
2. Connectez-vous avec votre compte Gmail
3. Créez un nouveau mot de passe d'application :
   - Nom : "Assistant Rédactionnel"
   - Copiez le mot de passe généré (16 caractères)

#### Étape 2 : Configurer les variables d'environnement

Créez un fichier `.env.local` à la racine du projet :

```env
VITE_EMAIL_USER=votre_email@gmail.com
VITE_EMAIL_PASSWORD=xxxx xxxx xxxx xxxx
```

#### Étape 3 : Créer un backend Node.js

Le service `emailService.js` est prêt, mais **nécessite un backend** pour envoyer réellement les emails.

Créez un fichier `server/api/send-email.js` :

```javascript
import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { to, subject, html } = req.body;

  // Configuration Nodemailer
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.VITE_EMAIL_USER,
      pass: process.env.VITE_EMAIL_PASSWORD
    }
  });

  try {
    await transporter.sendMail({
      from: `"Assistant Rédactionnel" <${process.env.VITE_EMAIL_USER}>`,
      to,
      subject,
      html
    });

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Erreur envoi email:', error);
    res.status(500).json({ error: error.message });
  }
}
```

---

### Option 2 : SendGrid (Gratuit jusqu'à 100 emails/jour)

#### Installation
```bash
npm install @sendgrid/mail
```

#### Configuration
```env
VITE_SENDGRID_API_KEY=votre_cle_api_sendgrid
```

#### Code backend
```javascript
import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.VITE_SENDGRID_API_KEY);

export default async function handler(req, res) {
  const { to, subject, html } = req.body;

  try {
    await sgMail.send({
      to,
      from: 'noreply@votredomaine.com',
      subject,
      html
    });

    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
```

---

### Option 3 : Resend (Moderne, 100 emails/jour gratuits)

#### Installation
```bash
npm install resend
```

#### Configuration
```env
VITE_RESEND_API_KEY=votre_cle_api_resend
```

#### Code backend
```javascript
import { Resend } from 'resend';

const resend = new Resend(process.env.VITE_RESEND_API_KEY);

export default async function handler(req, res) {
  const { to, subject, html } = req.body;

  try {
    await resend.emails.send({
      from: 'Assistant Rédactionnel <onboarding@resend.dev>',
      to,
      subject,
      html
    });

    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
```

---

## Architecture actuelle

```
Frontend (React)
    ↓
emailService.js (simule en dev, appelle API en prod)
    ↓
Backend API /api/send-email (à créer)
    ↓
Service SMTP (Gmail/SendGrid/Resend)
    ↓
Email envoyé à l'utilisateur
```

---

## Templates d'emails inclus

Le système inclut 2 templates HTML professionnels :

1. **Email de vérification d'inscription**
   - Design moderne avec dégradé orange
   - Code de vérification en gros caractères
   - Valide 15 minutes

2. **Email de réinitialisation de mot de passe**
   - Même design cohérent
   - Avertissement de sécurité
   - Code de réinitialisation

---

## Sécurité

⚠️ **Important** :
- Ne jamais commiter les fichiers `.env` ou `.env.local`
- Utiliser des mots de passe d'application (pas votre mot de passe Gmail principal)
- En production, utiliser des variables d'environnement serveur
- Limiter le taux d'envoi pour éviter le spam

---

## Tests

### En développement
1. Inscrivez-vous avec un nouvel email
2. Le code s'affiche directement sur la page
3. Copiez-collez le code pour vérifier

### En production
1. Configurez les variables d'environnement
2. Créez le backend API
3. Testez avec votre propre email
4. Vérifiez les spams si l'email n'arrive pas

---

## Support

Pour toute question sur la configuration des emails :
- Gmail : https://support.google.com/accounts/answer/185833
- SendGrid : https://docs.sendgrid.com/
- Resend : https://resend.com/docs

---

**Statut actuel** : ✅ Mode développement actif (codes affichés dans l'interface)
**Pour production** : Configurer un backend + service SMTP
