import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";

// Client SES
const sesClient = new SESClient({ region: "eu-west-1" });

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

  // Route de test (GET sur n'importe quel chemin)
  if (method === 'GET') {
    const fromEmail = process.env.FROM_EMAIL || 'noreply@assistant-redacteur.fr';

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Email service opérationnel (Amazon SES)',
        configured: true,
        fromEmail: fromEmail,
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

      const fromEmail = process.env.FROM_EMAIL || 'noreply@assistant-redacteur.fr';

      // Créer la commande SES
      const command = new SendEmailCommand({
        Source: fromEmail,
        Destination: {
          ToAddresses: [to]
        },
        Message: {
          Subject: {
            Data: subject,
            Charset: 'UTF-8'
          },
          Body: {
            Html: {
              Data: html,
              Charset: 'UTF-8'
            }
          }
        }
      });

      // Envoyer l'email
      await sesClient.send(command);

      console.log('Email envoyé avec succès à:', to);

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
