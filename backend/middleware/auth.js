import jwt from 'jsonwebtoken';

export function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    // Pour les routes qui tolèrent l'anonyme (ex: mode gratuit), on laisse passer sans user
    req.user = null; // Pas d'utilisateur connecté
    return next();
  }

  // Vérifier si c'est un token Lambda simple (admin-001, user-xxx, etc.)
  if (token.startsWith('admin-') || token.startsWith('user-')) {
    // Token Lambda : créer un objet user basique
    req.user = {
      id: token,
      email: token === 'admin-001' ? 'admin@assistant-redacteur.fr' : 'user@example.com',
      role: token.startsWith('admin-') ? 'admin' : 'user'
    };
    return next();
  }

  // Sinon, vérifier si c'est un JWT
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    // Si le secret n'est pas configuré, on évite de tout casser en dev
    req.user = { id: 'dev-user' };
    return next();
  }

  jwt.verify(token, secret, (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    // Normaliser l'objet user : userId → id
    req.user = {
      id: decoded.userId || decoded.id,
      email: decoded.email,
      role: decoded.role,
      ...decoded
    };
    next();
  });
}
