import nodemailer from 'nodemailer';

// Configuration Nodemailer
const createTransporter = () => {
  const emailUser = process.env.SMTP_USER;
  const emailPass = process.env.SMTP_PASS;

  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: emailUser,
      pass: emailPass
    },
    tls: {
      rejectUnauthorized: false
    }
  });
};

// Handler Lambda
export const handler = async (event) => {
  // Headers CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Gérer les requêtes OPTIONS (preflight CORS)
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  // Extraire le chemin et les query parameters
  const path = event.path || event.rawPath || '';
  const method = event.httpMethod || event.requestContext?.http?.method || 'GET';
  
  // Debug: log l'event pour comprendre la structure
  console.log('Event:', JSON.stringify(event));
  
  // Route de test - accepter plusieurs formats de chemin
  if (method === 'GET' && (path === '/test' || path.includes('test'))) {
    const emailUser = process.env.SMTP_USER;
    const emailPass = process.env.SMTP_PASS;

    if (!emailUser || !emailPass) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          success: false,
          error: 'Configuration email manquante',
          configured: false
        })
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Configuration email valide',
        configured: true,
        emailUser: emailUser
      })
    };
  }

  // Route d'envoi d'email - accepter plusieurs formats
  if (method === 'POST' && (path === '/send' || path.includes('send'))) {
    try {
      const body = JSON.parse(event.body);
      const { to, subject, html } = body;

      const emailUser = process.env.SMTP_USER;
      const emailPass = process.env.SMTP_PASS;

      if (!emailUser || !emailPass) {
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({
            success: false,
            error: 'Configuration email manquante'
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

  // Route non trouvée
  return {
    statusCode: 404,
    headers,
    body: JSON.stringify({
      success: false,
      error: 'Route not found'
    })
  };
};
