import nodemailer from 'nodemailer';

// Configuration Nodemailer
const createTransporter = () => {
  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    },
    tls: {
      rejectUnauthorized: false
    }
  });
};

// Handler Lambda
export const handler = async (event) => {
  console.log('Event reçu:', JSON.stringify(event, null, 2));
  
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // OPTIONS pour CORS
  if (event.requestContext?.http?.method === 'OPTIONS' || event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  const method = event.requestContext?.http?.method || event.httpMethod || 'GET';
  const path = event.requestContext?.http?.path || event.path || event.rawPath || '';
  
  console.log('Method:', method, 'Path:', path);

  // Route de test
  if (method === 'GET') {
    const emailUser = process.env.SMTP_USER;
    const emailPass = process.env.SMTP_PASS;

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Email service opérationnel',
        configured: !!(emailUser && emailPass),
        emailUser: emailUser || 'non configuré',
        path: path,
        method: method
      })
    };
  }

  // Route d'envoi d'email
  if (method === 'POST') {
    try {
      const body = JSON.parse(event.body || '{}');
      const { to, subject, html } = body;

      if (!to || !subject || !html) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({
            success: false,
            error: 'Paramètres manquants: to, subject, html requis'
          })
        };
      }

      const emailUser = process.env.SMTP_USER;
      const emailPass = process.env.SMTP_PASS;

      if (!emailUser || !emailPass) {
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({
            success: false,
            error: 'Configuration SMTP manquante'
          })
        };
      }

      const transporter = createTransporter();

      await transporter.sendMail({
        from: `"Assistant Rédactionnel" <${emailUser}>`,
        to,
        subject,
        html
      });

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true })
      };
    } catch (error) {
      console.error('Erreur:', error);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          success: false,
          error: error.message
        })
      };
    }
  }

  // Méthode non supportée
  return {
    statusCode: 405,
    headers,
    body: JSON.stringify({
      success: false,
      error: 'Method not allowed'
    })
  };
};
