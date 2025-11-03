# Dockerfile pour le backend Node.js - Version minimale
FROM node:20-alpine

# Créer le dossier de l'application
WORKDIR /app

# Installer les dépendances système nécessaires pour les modules natifs
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    cairo-dev \
    jpeg-dev \
    pango-dev \
    giflib-dev \
    && rm -rf /var/cache/apk/*

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer les dépendances
RUN npm install --only=production && npm cache clean --force

# Copier le code source
COPY . .

# Créer les dossiers nécessaires
RUN mkdir -p logs uploads

# Exposer le port
EXPOSE 4000

# Variable d'environnement par défaut
ENV NODE_ENV=production
ENV PORT=4000

# Démarrer l'application (version complète avec toutes les routes)
CMD ["node", "server.js"]
