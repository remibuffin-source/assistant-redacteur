import jwt from 'jsonwebtoken';

export function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    // Pour les routes qui tolèrent l'anonyme (ex: Dropbox token), on laisse passer sans user
    req.user = { id: 'anonymous' };
    return next();
  }

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
