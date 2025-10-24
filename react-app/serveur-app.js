const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3003;

// Fonction pour servir les fichiers statiques
function serveStaticFile(res, filePath, contentType) {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end('File not found');
      return;
    }
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
}

// Créer le serveur
const server = http.createServer((req, res) => {
  let filePath = '.' + req.url;

  if (filePath === './') {
    filePath = './index.html';
  }

  const extname = String(path.extname(filePath)).toLowerCase();
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

  const contentType = mimeTypes[extname] || 'application/octet-stream';

  // Servir les fichiers depuis le dossier dist
  filePath = path.join(__dirname, 'dist', filePath);

  serveStaticFile(res, filePath, contentType);
});

server.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
  console.log(`📅 Calendrier : http://localhost:${PORT}/calendar`);
  console.log('✅ Application complète disponible');
});
