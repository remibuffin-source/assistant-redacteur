import jwt from 'jsonwebtoken';

export function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    // Pour les routes qui tolèrent l'anonyme (ex: Dropbox token), on laisse passer sans user
    req.user = { id: 'anonymous' };
    return next();
  }

  // Vérifier si c'est un token Lambda simple (admin-001, user-xxx, etc.)
  if (token.startsWith('admin-') || token.startsWith('user-')) {
    // Token Lambda : créer un objet user basique
    req.user = {
      id: token,
      email: token === 'admin-001' ? 'admin@studioducapbrun.com' : 'user@example.com',
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

  jwt.verify(token, secret, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
}
