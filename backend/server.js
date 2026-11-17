// IMPORTANT: Charger dotenv EN PREMIER avant tous les autres imports
import dotenv from 'dotenv';
import { existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Charger .env.local en priorité si il existe, sinon .env
const envLocalPath = join(__dirname, '.env.local');
const envPath = join(__dirname, '.env');

if (existsSync(envLocalPath)) {
  dotenv.config({ path: envLocalPath });
  console.log('✅ Loaded .env.local');
} else if (existsSync(envPath)) {
  dotenv.config({ path: envPath });
  console.log('✅ Loaded .env');
} else {
  console.warn('⚠️  No .env file found');
}

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

// Import des routes
import authRoutes from './routes/auth.js';
import publicationRoutes from './routes/publications.js';
import oauthRoutes from './routes/oauth.js';
import userRoutes from './routes/users.js';
import analyticsRoutes from './routes/analytics.js';
import emailRoutes from './routes/email.js';
import storageRoutes from './routes/storage.js';
import apiKeysRoutes from './routes/apiKeys.js';
import testApiKeysRoutes from './routes/testApiKeys.js';
import creditsRoutes from './routes/credits.js';
import pricingRoutes from './routes/pricing.js';
import stripeRoutes from './routes/stripe.js';
import aiRoutes from './routes/ai.js';
import debugAuthRoutes from './routes/debug-auth.js';

// Nouvelles routes pour le stockage serveur
import contentModelsRoutes from './routes/contentModels.js';
import completeModelsRoutes from './routes/completeModels.js';
import publicationsNewRoutes from './routes/publicationsNew.js';
import invoicesRoutes from './routes/invoices.js';
import wixBlogRoutes from './routes/wixBlog.js';
import metaAuthRoutes from './routes/metaAuthRoutes.js';
import socialMediaRoutes from './routes/socialMediaRoutes.js';
import dataDeleteRoutes from './routes/dataDeleteRoutes.js';
import postizRoutes from './routes/postizRoutes.js';
import { router as postizAuthRoutes } from './routes/postiz.js';
import wanRoutes from './routes/wan.js';
import veoRoutes from './routes/veo.js';
import videosRoutes from './routes/videos.js';
import diagnosticRoutes from './routes/diagnostic.js';
import mediaAIConfigRoutes from './routes/mediaAIConfig.js';

// Import des middlewares
import { errorHandler } from './middleware/errorHandler.js';
import { notFound } from './middleware/notFound.js';
import { logger } from './utils/logger.js';

// Import de la connexion MySQL/Sequelize
import { connectDB } from './config/sequelize.js';
import { initDatabase } from './models/index.sequelize.js';

// Import du service de stockage fichiers
import { fileStorageService } from './services/fileStorageService.js';

const app = express();
const PORT = process.env.PORT || 4000;

// Configuration de sécurité et performances
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://api.twitter.com", "https://graph.facebook.com"]
    }
  },
  crossOriginEmbedderPolicy: false
}));

// Configuration CORS
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      'https://assistant-redacteur.fr',
      'https://www.assistant-redacteur.fr',
      'http://localhost:3000',
      'http://localhost:3003',
      'http://localhost:5173',
      'http://127.0.0.1:3003',
      /^http:\/\/127\.0\.0\.1:\d+$/  // Autoriser tous les ports sur 127.0.0.1 (proxy Cascade)
    ];
    
    // Autoriser les requêtes sans origin (comme curl, Postman, etc.)
    if (!origin) return callback(null, true);
    
    // Vérifier si l'origin est autorisée (string ou regex)
    const isAllowed = allowedOrigins.some(allowed => {
      if (allowed instanceof RegExp) {
        return allowed.test(origin);
      }
      return allowed === origin;
    });
    
    if (isAllowed) {
      callback(null, true);
    } else {
      console.log('❌ CORS bloqué pour origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true, // Autoriser les cookies et credentials
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  preflightContinue: false,
  optionsSuccessStatus: 204,
  maxAge: 86400 // Cache preflight 24h
};

app.use(cors(corsOptions));

// Middleware supplémentaire pour gérer les requêtes OPTIONS
app.options('*', cors(corsOptions));

// Middleware CORS explicite pour forcer les headers sur toutes les réponses
app.use((req, res, next) => {
  const origin = req.headers.origin;
  const allowedOrigins = [
    'https://assistant-redacteur.fr',
    'https://www.assistant-redacteur.fr',
    'http://localhost:3000',
    'http://localhost:3003',
    'http://localhost:5173'
  ];
  
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else if (!origin) {
    // Pour les requêtes sans origin (curl, Postman)
    res.setHeader('Access-Control-Allow-Origin', 'https://assistant-redacteur.fr');
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Max-Age', '86400');
  
  // Gérer les requêtes OPTIONS
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }
  
  next();
});

// Compression des réponses
app.use(compression());

// Rate limiting
const limiter = rateLimit({
  windowMs: (process.env.RATE_LIMIT_WINDOW || 15) * 60 * 1000, // 15 minutes par défaut
  max: process.env.RATE_LIMIT_MAX_REQUESTS || 100, // limite par fenêtre
  message: {
    error: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

app.use('/api/', limiter);

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined', { stream: { write: msg => logger.info(msg.trim()) } }));
}

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Servir les fichiers statiques (uploads, etc.)
app.use('/uploads', express.static(join(__dirname, 'uploads')));

// Servir les fichiers du dossier stockage (images, modèles, etc.)
// Avec headers CORS pour permettre l'affichage cross-origin
const storagePath = process.env.STORAGE_PATH || join(__dirname, '..', 'stockage');
app.use('/stockage', (req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  next();
}, express.static(storagePath));

// Servir les fichiers temporaires (pour Veo, etc.)
app.use('/files', (req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  next();
}, express.static(storagePath));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV
  });
});

// API Routes (sans préfixe /api car le sous-domaine api.assistant-redacteur.fr gère déjà ça)
app.use('/auth', authRoutes);
app.use('/publications', publicationRoutes);
app.use('/oauth', oauthRoutes);
app.use('/users', userRoutes);
app.use('/analytics', analyticsRoutes);
app.use('/email', emailRoutes);
app.use('/storage', storageRoutes);
app.use('/admin', apiKeysRoutes);
app.use('/admin', testApiKeysRoutes);
app.use('/credits', creditsRoutes);
app.use('/pricing', pricingRoutes);
app.use('/stripe', stripeRoutes);
app.use('/ai', aiRoutes);
app.use('/debug', debugAuthRoutes); // Route temporaire de debug

// Nouvelles routes de stockage serveur
app.use('/content-models', contentModelsRoutes);
app.use('/complete-models', completeModelsRoutes);
app.use('/publications-v2', publicationsNewRoutes); // Nouvelle version avec fichiers
app.use('/api/invoices', invoicesRoutes); // Factures utilisateurs (avec préfixe /api)
app.use('/wix-blog', wixBlogRoutes); // API Wix Blog
app.use('/meta', metaAuthRoutes); // OAuth Meta (Facebook/Instagram)
app.use('/social', socialMediaRoutes); // Publication Facebook/Instagram
app.use('/data-deletion', dataDeleteRoutes); // Data Deletion Callback Meta
app.use('/postiz', postizRoutes); // Intégration Postiz pour réseaux sociaux
app.use('/postiz/auth', postizAuthRoutes); // Authentification Postiz par utilisateur
app.use('/wan', wanRoutes); // Génération vidéo WAN 2.6
app.use('/veo', veoRoutes); // Génération vidéo Veo 3.1
app.use('/videos', videosRoutes); // Gestion des vidéos
app.use('/api/diagnostic', diagnosticRoutes); // Diagnostic WAN et autres services
app.use('/media-ai-config', mediaAIConfigRoutes); // Configuration globale IA multimodales (admin)

// Middleware pour les routes non trouvées
app.use(notFound);

// Gestion globale des erreurs
app.use(errorHandler);

// Gestion des erreurs non capturées
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ UNHANDLED REJECTION COMPLÈTE:');
  console.error('Promise:', promise);
  console.error('Reason:', reason);
  console.error('Stack:', reason?.stack);
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Ne pas exit immédiatement pour voir l'erreur
  // process.exit(1);
});

// Connexion à MySQL et initialisation des tables
(async () => {
  try {
    await connectDB();
    
    // Créer les tables si elles n'existent pas (en développement uniquement)
    if (process.env.NODE_ENV === 'development') {
      await initDatabase();
      logger.info('✅ Tables MySQL initialisées');
    }
    
    // Initialiser le système de stockage fichiers
    await fileStorageService.initializeStorage();
    logger.info('✅ Système de stockage fichiers initialisé');
  } catch (error) {
    logger.error('❌ Erreur lors de l\'initialisation:', error);
    // Ne pas arrêter le serveur, continuer sans base de données
  }
})();

// Démarrage du serveur
const server = app.listen(PORT, () => {
  logger.info(`🚀 Assistant Rédactionnel Backend Server running on port ${PORT}`);
  logger.info(`📅 Environment: ${process.env.NODE_ENV}`);
  logger.info(`🔗 Frontend URL: ${process.env.FRONTEND_URL}`);
  logger.info(`📊 Health check: http://localhost:${PORT}/health`);
});

// Configuration Socket.IO pour les notifications temps réel
// TEMPORAIREMENT DÉSACTIVÉ POUR TESTS O2SWITCH
/*
import { Server } from 'socket.io';
import http from 'http';

const ioServer = http.createServer(app);
const io = new Server(ioServer, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3003",
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Gestion des connexions Socket.IO
io.on('connection', (socket) => {
  logger.info(`🔌 Socket client connected: ${socket.id}`);

  socket.on('join-user-room', (userId) => {
    socket.join(`user_${userId}`);
    logger.info(`👤 User ${userId} joined their notification room`);
  });

  socket.on('disconnect', () => {
    logger.info(`🔌 Socket client disconnected: ${socket.id}`);
  });
});

// Démarrer le serveur Socket.IO
const SOCKET_PORT = process.env.SOCKET_PORT || 4001;
ioServer.listen(SOCKET_PORT, () => {
  logger.info(`📡 Socket.IO server running on port ${SOCKET_PORT}`);
});
*/

// Exporter pour les tests
// io temporairement désactivé
export { app, server };
export default app;
