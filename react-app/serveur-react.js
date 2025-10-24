const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3003;

console.log('🚀 Démarrage du serveur React...');
console.log(`📅 Calendrier : http://localhost:${PORT}/calendar`);
console.log(`🏠 Accueil : http://localhost:${PORT}/`);
console.log('✅ Serveur React avec routage corrigé');

const server = http.createServer((req, res) => {
  let filePath = '';

  // Route principale - servir index.html pour le routage React
  if (req.url === '/' || req.url.startsWith('/calendar') || req.url.startsWith('/?')) {
    filePath = path.join(__dirname, 'dist', 'index.html');
  } else {
    // Autres fichiers statiques
    filePath = path.join(__dirname, 'dist', req.url);
  }

  // Sécurité : empêcher l'accès aux fichiers en dehors de dist
  if (!filePath.startsWith(path.join(__dirname, 'dist'))) {
    res.writeHead(403);
    res.end('Accès interdit');
    return;
  }

  const extname = path.extname(filePath).toLowerCase();
  const mimeTypes = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpg',
    '.ico': 'image/x-icon',
    '.svg': 'image/svg+xml',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2'
  };

  const contentType = mimeTypes[extname] || 'application/octet-stream';

  fs.readFile(filePath, (error, content) => {
    if (error) {
      if (error.code === 'ENOENT') {
        // Fichier non trouvé - servir index.html pour le routage React
        const indexPath = path.join(__dirname, 'dist', 'index.html');
        fs.readFile(indexPath, (indexError, indexContent) => {
          if (indexError) {
            console.error('❌ Erreur serveur:', indexError);
            res.writeHead(500);
            res.end('Erreur serveur');
          } else {
            res.writeHead(200, {
              'Content-Type': 'text/html',
              'Cache-Control': 'no-cache'
            });
            res.end(indexContent);
          }
        });
      } else {
        console.error('❌ Erreur de lecture fichier:', error);
        res.writeHead(500);
        res.end('Erreur serveur');
      }
    } else {
      res.writeHead(200, {
        'Content-Type': contentType,
        'Cache-Control': 'no-cache'
      });
      res.end(content);
    }
  });
});

server.listen(PORT, () => {
  console.log(`✅ Serveur démarré avec succès sur le port ${PORT}`);
  console.log(`🎯 Route /calendar configurée pour CalendarPage`);
  console.log(`🔧 Reconstruction : Terminée`);
  console.log(`📦 Fichiers servis depuis : dist/`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.log(`❌ Port ${PORT} déjà utilisé`);
    console.log('Fermez les autres serveurs ou utilisez un autre port');
  } else {
    console.log('❌ Erreur serveur:', err.message);
  }
});
