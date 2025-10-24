# Dockerfile pour le backend Node.js
FROM node:18-alpine

# Créer le dossier de l'application
WORKDIR /app

# Installer les dépendances système nécessaires
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    git \
    curl \
    && rm -rf /var/cache/apk/*

# Copier les fichiers de dépendances
COPY package*.json ./
COPY .env.example .env

# Installer les dépendances
RUN npm ci --only=production && npm cache clean --force

# Créer les dossiers nécessaires
RUN mkdir -p logs uploads

# Copier le code source
COPY . .

# Créer un utilisateur non-root pour la sécurité
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Changer les permissions
RUN chown -R nextjs:nodejs /app
USER nextjs

# Exposer les ports
EXPOSE 4000 4001

# Démarrer l'application
CMD ["npm", "start"]
