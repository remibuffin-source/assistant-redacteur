import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3003,
    host: '0.0.0.0',
    strictPort: true,
    hmr: {
      overlay: true,
      protocol: 'ws',
      host: 'localhost',
      port: 24678, // Port dédié pour HMR (différent du serveur)
      clientPort: 24678
    },
    watch: {
      usePolling: true,
      interval: 100,
      // Ignorer les fichiers qui ne nécessitent pas de rechargement
      ignored: ['**/node_modules/**', '**/dist/**', '**/logs/**']
    }
  },
  // Optimisations pour le développement
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom']
  },
  // Activer le mode SPA
  appType: 'spa'
})
