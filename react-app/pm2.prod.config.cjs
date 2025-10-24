module.exports = {
  apps: [{
    name: 'assistant-redacteur-prod',
    script: 'npm',
    args: 'run preview', // ou 'run build && npm run serve' selon votre setup
    cwd: './',
    instances: 'max', // Utilise tous les CPU disponibles
    exec_mode: 'cluster',
    autorestart: true,
    watch: false,
    max_memory_restart: '500M',
    env: {
      NODE_ENV: 'production',
      PORT: 4173,
      VITE_API_URL: 'https://votre-domaine.com',
      VITE_NODE_ENV: 'production'
    },
    error_file: './logs/pm2-prod-error.log',
    out_file: './logs/pm2-prod-out.log',
    log_file: './logs/pm2-prod-combined.log',
    time: true,
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    // Options spécifiques à la production
    min_uptime: '60s',
    max_restarts: 5,
    // Rotation des logs pour éviter qu'ils deviennent trop volumineux
    log_type: 'json',
    // Variables d'environnement de production
    env_production: {
      NODE_ENV: 'production',
      VITE_DEBUG: 'false',
      VITE_LOG_LEVEL: 'error'
    },
    // Monitoring et performance
    monitoring: false, // Peut être activé avec PM2 Plus
    // Gestion des erreurs
    kill_timeout: 5000,
    listen_timeout: 3000,
    // Redémarrage programmé (optionnel)
    cron_restart: '0 2 * * *' // Redémarre tous les jours à 2h du matin
  }]
};
