const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const port = 3003;

const mimeTypes = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2'
};

const server = http.createServer((req, res) => {
  let pathname = url.parse(req.url).pathname;

  // Route principale
  if (pathname === '/') {
    pathname = '/index.html';
  }

  // Servir les fichiers depuis le répertoire dist
  const filePath = path.join(__dirname, 'dist', pathname);

  // Sécurité : empêcher l'accès aux fichiers en dehors de dist
  if (!filePath.startsWith(path.join(__dirname, 'dist'))) {
    res.writeHead(403);
    res.end('Accès interdit');
    return;
  }

  const ext = path.extname(filePath).toLowerCase();
  const mimeType = mimeTypes[ext] || 'application/octet-stream';

  fs.readFile(filePath, (error, content) => {
    if (error) {
      if (error.code === 'ENOENT') {
        // Fichier non trouvé - laisser React Router gérer le routage
        const indexPath = path.join(__dirname, 'dist', 'index.html');
        fs.readFile(indexPath, (indexError, indexContent) => {
          if (indexError) {
            res.writeHead(500);
            res.end('Erreur serveur');
          } else {
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(indexContent);
          }
        });
      } else {
        res.writeHead(500);
        res.end('Erreur serveur');
      }
    } else {
      res.writeHead(200, { 'Content-Type': mimeType });
      res.end(content);
    }
  });
});

server.listen(port, () => {
  console.log(`🚀 Serveur démarré sur http://localhost:${port}`);
  console.log(`📅 Calendrier accessible sur http://localhost:${port}/calendar`);
  console.log('Pour arrêter le serveur : Ctrl+C');
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.log(`❌ Port ${port} déjà utilisé`);
    console.log('Essayez de fermer d\'autres serveurs ou utilisez un autre port');
  } else {
    console.log('Erreur serveur:', err);
  }
});
