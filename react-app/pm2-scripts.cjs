#!/usr/bin/env node

/**
 * Scripts PM2 pour Assistant Rédacteur
 * Usage: node pm2-scripts.js [command]
 */

const { execSync } = require('child_process');
const path = require('path');

const commands = {
  // Développement
  'dev:start': () => {
    console.log('🚀 Démarrage en mode développement...');
    execSync('pm2 start pm2.dev.config.cjs', { stdio: 'inherit' });
  },
  
  'dev:stop': () => {
    console.log('⏹️ Arrêt du mode développement...');
    execSync('pm2 stop assistant-redacteur-dev', { stdio: 'inherit' });
  },
  
  'dev:restart': () => {
    console.log('🔄 Redémarrage en mode développement...');
    execSync('pm2 restart assistant-redacteur-dev', { stdio: 'inherit' });
  },
  
  'dev:logs': () => {
    console.log('📋 Logs du développement...');
    execSync('pm2 logs assistant-redacteur-dev', { stdio: 'inherit' });
  },
  
  // Production
  'prod:start': () => {
    console.log('🚀 Démarrage en mode production...');
    execSync('npm run build', { stdio: 'inherit' });
    execSync('pm2 start pm2.prod.config.cjs', { stdio: 'inherit' });
  },
  
  'prod:stop': () => {
    console.log('⏹️ Arrêt du mode production...');
    execSync('pm2 stop assistant-redacteur-prod', { stdio: 'inherit' });
  },
  
  'prod:restart': () => {
    console.log('🔄 Redémarrage en mode production...');
    execSync('pm2 restart assistant-redacteur-prod', { stdio: 'inherit' });
  },
  
  'prod:logs': () => {
    console.log('📋 Logs de la production...');
    execSync('pm2 logs assistant-redacteur-prod', { stdio: 'inherit' });
  },
  
  // Commandes générales
  'status': () => {
    console.log('📊 Status des processus PM2...');
    execSync('pm2 status', { stdio: 'inherit' });
  },
  
  'monitor': () => {
    console.log('📈 Monitoring PM2...');
    execSync('pm2 monit', { stdio: 'inherit' });
  },
  
  'stop-all': () => {
    console.log('⏹️ Arrêt de tous les processus...');
    execSync('pm2 stop all', { stdio: 'inherit' });
  },
  
  'delete-all': () => {
    console.log('🗑️ Suppression de tous les processus...');
    execSync('pm2 delete all', { stdio: 'inherit' });
  },
  
  'help': () => {
    console.log(`
📚 Commandes disponibles pour Assistant Rédacteur PM2:

🔧 Développement:
  dev:start    - Démarre le serveur de développement
  dev:stop     - Arrête le serveur de développement  
  dev:restart  - Redémarre le serveur de développement
  dev:logs     - Affiche les logs de développement

🚀 Production:
  prod:start   - Build et démarre en production
  prod:stop    - Arrête le serveur de production
  prod:restart - Redémarre le serveur de production
  prod:logs    - Affiche les logs de production

📊 Monitoring:
  status       - Affiche le status de tous les processus
  monitor      - Ouvre l'interface de monitoring
  stop-all     - Arrête tous les processus
  delete-all   - Supprime tous les processus
  help         - Affiche cette aide

💡 Exemples:
  node pm2-scripts.js dev:start
  node pm2-scripts.js status
  node pm2-scripts.js prod:logs
    `);
  }
};

const command = process.argv[2];

if (!command || !commands[command]) {
  console.log('❌ Commande non reconnue. Utilisez "help" pour voir les commandes disponibles.');
  commands.help();
  process.exit(1);
}

try {
  commands[command]();
} catch (error) {
  console.error('❌ Erreur lors de l\'exécution:', error.message);
  process.exit(1);
}
