import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const backendDir = path.join(__dirname, '..');

/**
 * Script de nettoyage pour préparer le backend pour O2Switch
 * Supprime les fichiers et dossiers spécifiques à AWS Elastic Beanstalk
 */

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

const log = {
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
  title: (msg) => console.log(`\n${colors.cyan}${'='.repeat(60)}\n${msg}\n${'='.repeat(60)}${colors.reset}\n`)
};

// Fichiers et dossiers à supprimer
const toDelete = [
  // AWS Elastic Beanstalk
  '.ebextensions',
  '.elasticbeanstalk',
  '.platform',
  '.ebignore',
  
  // Docker
  'Dockerfile',
  'docker-compose.yml',
  
  // Configurations obsolètes
  'config/database.js',      // MongoDB
  'config/postgres.js',      // PostgreSQL
  
  // Modèles MongoDB (anciens)
  'models/ApiKey.js',
  'models/PricingConfig.js',
  'models/User.js',
  
  // Fichiers temporaires
  'services/dropboxStorageService.temp.js',
  
  // Documentation obsolète
  'MIGRATION_INSTRUCTIONS.md'
];

// Fichiers à renommer (optionnel)
const toRename = [
  { from: 'models/ApiKey.sequelize.js', to: 'models/ApiKey.js' },
  { from: 'models/PricingConfig.sequelize.js', to: 'models/PricingConfig.js' },
  { from: 'models/User.sequelize.js', to: 'models/User.js' },
  { from: 'routes/credits.sequelize.js', to: 'routes/credits.js' }
];

function deleteRecursive(itemPath) {
  if (fs.existsSync(itemPath)) {
    if (fs.lstatSync(itemPath).isDirectory()) {
      fs.readdirSync(itemPath).forEach((file) => {
        const curPath = path.join(itemPath, file);
        deleteRecursive(curPath);
      });
      fs.rmdirSync(itemPath);
    } else {
      fs.unlinkSync(itemPath);
    }
    return true;
  }
  return false;
}

async function cleanForO2Switch() {
  log.title('🧹 NETTOYAGE POUR O2SWITCH');
  
  let deletedCount = 0;
  let notFoundCount = 0;
  
  // Supprimer les fichiers AWS
  log.info('Suppression des fichiers AWS Elastic Beanstalk...');
  for (const item of toDelete) {
    const itemPath = path.join(backendDir, item);
    if (deleteRecursive(itemPath)) {
      log.success(`Supprimé: ${item}`);
      deletedCount++;
    } else {
      log.warning(`Non trouvé: ${item}`);
      notFoundCount++;
    }
  }
  
  console.log('');
  log.info('Résumé de la suppression:');
  log.success(`${deletedCount} élément(s) supprimé(s)`);
  if (notFoundCount > 0) {
    log.warning(`${notFoundCount} élément(s) non trouvé(s)`);
  }
  
  // Optionnel: Renommer les fichiers Sequelize
  console.log('');
  log.info('Voulez-vous renommer les fichiers .sequelize.js ?');
  log.warning('Cela remplacera les anciens fichiers MongoDB !');
  log.info('Pour renommer, exécutez: node scripts/cleanForO2Switch.js --rename');
  
  if (process.argv.includes('--rename')) {
    console.log('');
    log.info('Renommage des fichiers Sequelize...');
    let renamedCount = 0;
    
    for (const { from, to } of toRename) {
      const fromPath = path.join(backendDir, from);
      const toPath = path.join(backendDir, to);
      
      if (fs.existsSync(fromPath)) {
        // Supprimer l'ancien fichier s'il existe
        if (fs.existsSync(toPath)) {
          fs.unlinkSync(toPath);
          log.warning(`Ancien fichier supprimé: ${to}`);
        }
        
        // Renommer
        fs.renameSync(fromPath, toPath);
        log.success(`Renommé: ${from} → ${to}`);
        renamedCount++;
      } else {
        log.warning(`Non trouvé: ${from}`);
      }
    }
    
    log.success(`${renamedCount} fichier(s) renommé(s)`);
  }
  
  // Créer un fichier .o2switchignore
  console.log('');
  log.info('Création du fichier .o2switchignore...');
  const ignoreContent = `# Fichiers à ne pas uploader sur O2Switch
node_modules/
.env
.env.local
.env.*.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
.DS_Store
*.log
coverage/
.vscode/
.idea/
tests/
*.test.js
*.spec.js
.git/
.gitignore
README*.md
TESTS.md
ROUTES_MIGRATION.md
DEPLOIEMENT_O2SWITCH.md
scripts/testMigration.js
scripts/migrateToMySQL.js
scripts/cleanForO2Switch.js
`;
  
  fs.writeFileSync(path.join(backendDir, '.o2switchignore'), ignoreContent);
  log.success('Fichier .o2switchignore créé');
  
  // Résumé final
  log.title('✅ NETTOYAGE TERMINÉ !');
  
  console.log(`
${colors.green}Le backend est prêt pour O2Switch !${colors.reset}

Prochaines étapes :
1. Vérifiez que tout fonctionne localement
2. Uploadez les fichiers sur O2Switch (sauf ceux dans .o2switchignore)
3. Configurez Node.js 20.19.4 dans cPanel
4. Installez les dépendances: npm install --production
5. Démarrez l'application

Fichiers conservés :
- ✅ server.js (mis à jour pour Sequelize)
- ✅ Modèles Sequelize (.sequelize.js)
- ✅ Routes adaptées
- ✅ Services (cache, email, social, etc.)
- ✅ Configuration MySQL
- ✅ Documentation

Fichiers supprimés :
- ❌ Configuration AWS Elastic Beanstalk
- ❌ Docker
- ❌ Modèles MongoDB (anciens)
- ❌ Configurations obsolètes
  `);
}

// Exécuter le nettoyage
cleanForO2Switch().catch(error => {
  log.error(`Erreur: ${error.message}`);
  process.exit(1);
});
