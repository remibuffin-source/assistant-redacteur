// Configuration de déploiement pour l'Assistant Rédacteur React

export const deployConfig = {
  // Options de build
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'esbuild'
  },

  // Variables d'environnement pour les APIs
  env: {
    // Clés API (à définir dans .env)
    OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
    ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY || '',
    GEMINI_API_KEY: process.env.GEMINI_API_KEY || ''
  },

  // Configuration des plateformes de déploiement
  platforms: {
    vercel: {
      command: 'npm run build',
      output: 'dist',
      env: {
        VERCEL: '1'
      }
    },
    netlify: {
      command: 'npm run build',
      publish: 'dist',
      env: {
        NETLIFY: '1'
      }
    },
    aws: {
      command: 'npm run build',
      bucket: 'your-s3-bucket',
      region: 'us-east-1'
    }
  },

  // Scripts de déploiement
  scripts: {
    'deploy:vercel': 'vercel --prod',
    'deploy:netlify': 'netlify deploy --prod --dir=dist',
    'deploy:aws': 'aws s3 sync dist/ s3://your-bucket --delete'
  }
};

export default deployConfig;