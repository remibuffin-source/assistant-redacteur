module.exports = {
  apps: [{
    name: 'assistant-redacteur-dev',
    script: 'node',
    args: './node_modules/vite/bin/vite.js',
    cwd: './',
    instances: 1,
    autorestart: true,
    watch: false, // Vite gère déjà le hot reload
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'development',
      PORT: 3003,
      VITE_API_URL: 'http://localhost:3003',
      VITE_NODE_ENV: 'development'
    },
    error_file: './logs/pm2-dev-error.log',
    out_file: './logs/pm2-dev-out.log',
    log_file: './logs/pm2-dev-combined.log',
    time: true,
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    // Options spécifiques au développement
    ignore_watch: [
      'node_modules',
      'dist',
      'logs',
      '.git'
    ],
    // Redémarrage automatique en cas de crash
    min_uptime: '10s',
    max_restarts: 10,
    // Variables d'environnement de développement
    env_development: {
      NODE_ENV: 'development',
      VITE_DEBUG: 'true',
      VITE_LOG_LEVEL: 'debug'
    }
  }]
};
