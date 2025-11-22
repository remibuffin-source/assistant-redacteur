const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand, GetCommand, UpdateCommand, ScanCommand } = require('@aws-sdk/lib-dynamodb');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const client = new DynamoDBClient({ region: 'eu-west-1' });
const docClient = DynamoDBDocumentClient.from(client);

const TABLE_NAME = 'assistant-redacteur-users';

// Headers CORS
const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Content-Type': 'application/json'
};

exports.handler = async (event) => {
  console.log('Event reçu:', JSON.stringify(event, null, 2));

  // Gestion CORS preflight
  if (event.requestContext.http.method === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const body = JSON.parse(event.body || '{}');
    const path = event.rawPath || event.requestContext.http.path;
    const method = event.requestContext.http.method;

    console.log(`Method: ${method}, Path: ${path}`);

    // Route: Inscription
    if (path.includes('/signup') && method === 'POST') {
      return await handleSignup(body);
    }

    // Route: Connexion
    if (path.includes('/login') && method === 'POST') {
      return await handleLogin(body);
    }

    // Route: Vérification du code
    if (path.includes('/verify-code') && method === 'POST') {
      return await handleVerifyCode(body);
    }

    // Route: Mot de passe oublié
    if (path.includes('/forgot-password') && method === 'POST') {
      return await handleForgotPassword(body);
    }

    // Route: Réinitialisation du mot de passe
    if (path.includes('/reset-password') && method === 'POST') {
      return await handleResetPassword(body);
    }

    // Route: Obtenir les infos utilisateur
    if (path.includes('/user') && method === 'GET') {
      const email = event.queryStringParameters?.email;
      return await handleGetUser(email);
    }

    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ error: 'Route non trouvée' })
    };

  } catch (error) {
    console.error('Erreur:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message })
    };
  }
};

// Inscription
async function handleSignup(body) {
  const { email, password, firstName, lastName } = body;

  if (!email || !password) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'Email et mot de passe requis' })
    };
  }

  // Vérifier si l'utilisateur existe déjà
  const existingUser = await docClient.send(new GetCommand({
    TableName: TABLE_NAME,
    Key: { email }
  }));

  if (existingUser.Item) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'Un compte existe déjà avec cet email' })
    };
  }

  // Hasher le mot de passe
  const hashedPassword = await bcrypt.hash(password, 10);

  // Générer un code de vérification
  const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
  const verificationExpiry = Date.now() + 15 * 60 * 1000; // 15 minutes

  // Créer l'utilisateur
  const userId = crypto.randomUUID();
  const user = {
    email,
    userId,
    password: hashedPassword,
    firstName: firstName || '',
    lastName: lastName || '',
    credits: 10, // Crédits de démarrage
    createdAt: new Date().toISOString(),
    verificationCode,
    verificationExpiry,
    isVerified: false
  };

  await docClient.send(new PutCommand({
    TableName: TABLE_NAME,
    Item: user
  }));

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      success: true,
      message: 'Compte créé avec succès',
      userId,
      verificationCode, // À envoyer par email
      requiresVerification: true
    })
  };
}

// Connexion
async function handleLogin(body) {
  const { email, password } = body;

  if (!email || !password) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'Email et mot de passe requis' })
    };
  }

  // Récupérer l'utilisateur
  const result = await docClient.send(new GetCommand({
    TableName: TABLE_NAME,
    Key: { email }
  }));

  if (!result.Item) {
    return {
      statusCode: 401,
      headers,
      body: JSON.stringify({ error: 'Email ou mot de passe incorrect' })
    };
  }

  const user = result.Item;

  // Vérifier le mot de passe
  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    return {
      statusCode: 401,
      headers,
      body: JSON.stringify({ error: 'Email ou mot de passe incorrect' })
    };
  }

  // Mettre à jour la dernière connexion
  await docClient.send(new UpdateCommand({
    TableName: TABLE_NAME,
    Key: { email },
    UpdateExpression: 'SET lastLogin = :lastLogin',
    ExpressionAttributeValues: {
      ':lastLogin': new Date().toISOString()
    }
  }));

  // Retourner les infos utilisateur (sans le mot de passe)
  const { password: _, ...userWithoutPassword } = user;

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      success: true,
      user: userWithoutPassword
    })
  };
}

// Vérification du code
async function handleVerifyCode(body) {
  const { email, code } = body;

  if (!email || !code) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'Email et code requis' })
    };
  }

  const result = await docClient.send(new GetCommand({
    TableName: TABLE_NAME,
    Key: { email }
  }));

  if (!result.Item) {
    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ error: 'Utilisateur non trouvé' })
    };
  }

  const user = result.Item;

  // Vérifier le code et l'expiration
  if (user.verificationCode !== code) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'Code incorrect' })
    };
  }

  if (Date.now() > user.verificationExpiry) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'Code expiré' })
    };
  }

  // Marquer comme vérifié
  await docClient.send(new UpdateCommand({
    TableName: TABLE_NAME,
    Key: { email },
    UpdateExpression: 'SET isVerified = :verified REMOVE verificationCode, verificationExpiry',
    ExpressionAttributeValues: {
      ':verified': true
    }
  }));

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      success: true,
      message: 'Email vérifié avec succès'
    })
  };
}

// Mot de passe oublié
async function handleForgotPassword(body) {
  const { email } = body;

  if (!email) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'Email requis' })
    };
  }

  const result = await docClient.send(new GetCommand({
    TableName: TABLE_NAME,
    Key: { email }
  }));

  if (!result.Item) {
    // Pour des raisons de sécurité, on ne dit pas si l'email existe ou non
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Si un compte existe avec cet email, un lien de réinitialisation a été envoyé.'
      })
    };
  }

  // Générer un token de réinitialisation
  const resetToken = crypto.randomBytes(32).toString('hex');
  const resetExpiry = Date.now() + 30 * 60 * 1000; // 30 minutes

  // Sauvegarder le token
  await docClient.send(new UpdateCommand({
    TableName: TABLE_NAME,
    Key: { email },
    UpdateExpression: 'SET resetToken = :token, resetExpiry = :expiry',
    ExpressionAttributeValues: {
      ':token': resetToken,
      ':expiry': resetExpiry
    }
  }));

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      success: true,
      message: 'Un lien de réinitialisation a été envoyé à votre email.',
      resetToken // À envoyer par email
    })
  };
}

// Réinitialisation du mot de passe
async function handleResetPassword(body) {
  const { token, newPassword } = body;

  if (!token || !newPassword) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'Token et nouveau mot de passe requis' })
    };
  }

  // Trouver l'utilisateur avec ce token (scan nécessaire car token n'est pas la clé)
  // Note: En production, utilisez un index secondaire global pour éviter le scan
  const users = await docClient.send(new ScanCommand({
    TableName: TABLE_NAME
  }));

  const user = users.Items?.find(u => u.resetToken === token && u.resetExpiry > Date.now());

  if (!user) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'Token invalide ou expiré' })
    };
  }

  // Hasher le nouveau mot de passe
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  // Mettre à jour le mot de passe et supprimer le token
  await docClient.send(new UpdateCommand({
    TableName: TABLE_NAME,
    Key: { email: user.email },
    UpdateExpression: 'SET password = :password REMOVE resetToken, resetExpiry',
    ExpressionAttributeValues: {
      ':password': hashedPassword
    }
  }));

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      success: true,
      message: 'Mot de passe réinitialisé avec succès'
    })
  };
}

// Obtenir les infos utilisateur
async function handleGetUser(email) {
  if (!email) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'Email requis' })
    };
  }

  const result = await docClient.send(new GetCommand({
    TableName: TABLE_NAME,
    Key: { email }
  }));

  if (!result.Item) {
    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ error: 'Utilisateur non trouvé' })
    };
  }

  const { password: _, ...userWithoutPassword } = result.Item;

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ user: userWithoutPassword })
  };
}