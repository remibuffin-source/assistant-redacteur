# Dockerfile pour le serveur email Node.js
FROM node:20-alpine

# Créer le dossier de l'application
WORKDIR /app

# Copier package.json et package-lock.json
COPY package*.json ./

# Installer uniquement les dépendances nécessaires pour le serveur email
RUN npm install express cors nodemailer dotenv --production && npm cache clean --force

# Copier le serveur email
COPY server.js ./

# Exposer le port
EXPOSE 3001

# Variable d'environnement par défaut
ENV NODE_ENV=production
ENV PORT=3001

# Démarrer le serveur email
CMD ["node", "server.js"]
