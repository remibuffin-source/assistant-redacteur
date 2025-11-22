import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

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

// Import des middlewares
import { errorHandler } from './middleware/errorHandler.js';
import { notFound } from './middleware/notFound.js';
import { logger } from './utils/logger.js';

// Import de la connexion MongoDB
import { connectDB } from './config/database.js';

// Configuration ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Charger les variables d'environnement
dotenv.config();

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
    // Autoriser les requêtes sans origin (comme les apps mobiles ou Postman)
    if (!origin) return callback(null, true);

    const allowedOrigins = [
      'http://localhost:3003',
      'http://127.0.0.1:3003',
      'https://assistant-redacteur.fr',
      'https://www.assistant-redacteur.fr'
    ];

    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  exposedHeaders: ['Content-Range', 'X-Content-Range']
};

app.use(cors(corsOptions));

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

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/publications', publicationRoutes);
app.use('/api/oauth', oauthRoutes);
app.use('/api/users', userRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/email', emailRoutes);
app.use('/api/storage', storageRoutes);
app.use('/api/admin', apiKeysRoutes);
app.use('/api/admin', testApiKeysRoutes);

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
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Connexion à MongoDB avant de démarrer le serveur
connectDB();

// Démarrage du serveur
const server = app.listen(PORT, () => {
  logger.info(`🚀 Assistant Rédactionnel Backend Server running on port ${PORT}`);
  logger.info(`📅 Environment: ${process.env.NODE_ENV}`);
  logger.info(`🔗 Frontend URL: ${process.env.FRONTEND_URL}`);
  logger.info(`📊 Health check: http://localhost:${PORT}/health`);
});

// Configuration Socket.IO pour les notifications temps réel
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

// Exporter pour les tests
export { app, server, io };
export default app;
