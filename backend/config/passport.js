import passport from 'passport';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import { Strategy as TwitterStrategy } from 'passport-twitter';
import { Strategy as LinkedInStrategy } from 'passport-linkedin-oauth2';
import User from '../models/User.js';
import SocialAccount from '../models/SocialAccount.js';
import { logger } from '../utils/logger.js';

// Configuration JWT Strategy
const jwtSecret = process.env.JWT_SECRET || 'dev-fallback-secret-key-change-this-in-production-minimum-32-chars';

if (!process.env.JWT_SECRET) {
  logger.warn('JWT_SECRET non défini dans .env - utilisation d\'une clé de développement (NON SÉCURISÉ)');
}

const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: jwtSecret
};

passport.use(new JwtStrategy(jwtOptions, async (payload, done) => {
  try {
    const user = await User.findById(payload.id);
    if (user) {
      return done(null, user);
    }
    return done(null, false);
  } catch (error) {
    logger.error('JWT Strategy error:', error);
    return done(error, false);
  }
}));

// Configuration Google OAuth Strategy (optionnelle)
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: `${process.env.FRONTEND_URL}/api/oauth/google/callback`,
    scope: ['profile', 'email']
  }, async (accessToken, refreshToken, profile, done) => {
  try {
    // Vérifier si l'utilisateur existe déjà
    let user = await User.findByOAuthProvider('google', profile.id);

    if (user) {
      // Mettre à jour les informations OAuth si nécessaire
      user.oauthProviders.google = {
        id: profile.id,
        email: profile.emails[0].value,
        name: profile.displayName,
        avatar: profile.photos[0].value
      };
      user.lastLogin = new Date();
      await user.save();
    } else {
      // Créer un nouvel utilisateur
      user = new User({
        email: profile.emails[0].value,
        name: profile.displayName,
        avatar: profile.photos[0].value,
        emailVerified: true,
        oauthProviders: {
          google: {
            id: profile.id,
            email: profile.emails[0].value,
            name: profile.displayName,
            avatar: profile.photos[0].value
          }
        }
      });
      await user.save();
    }

    // Générer les tokens
    const token = user.generateAuthToken();
    const refreshTokenJwt = user.generateRefreshToken();

    return done(null, { user, token, refreshToken: refreshTokenJwt });

  } catch (error) {
    logger.error('Google OAuth error:', error);
    return done(error, null);
  }
}));
} else {
  logger.warn('Google OAuth non configuré - GOOGLE_CLIENT_ID/SECRET manquants');
}

// Configuration Facebook OAuth Strategy (optionnelle)
if (process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET) {
  passport.use(new FacebookStrategy({
  clientID: process.env.FACEBOOK_APP_ID,
  clientSecret: process.env.FACEBOOK_APP_SECRET,
  callbackURL: `${process.env.FRONTEND_URL}/api/oauth/facebook/callback`,
  profileFields: ['id', 'emails', 'name', 'picture'],
  scope: ['email', 'pages_manage_posts', 'publish_to_groups']
}, async (accessToken, refreshToken, profile, done) => {
  try {
    let user = await User.findByOAuthProvider('facebook', profile.id);

    if (user) {
      user.oauthProviders.facebook = {
        id: profile.id,
        email: profile.emails[0].value,
        name: profile.displayName,
        avatar: profile.photos[0].value
      };
      user.lastLogin = new Date();
      await user.save();
    } else {
      user = new User({
        email: profile.emails[0].value,
        name: profile.displayName,
        avatar: profile.photos[0].value,
        emailVerified: true,
        oauthProviders: {
          facebook: {
            id: profile.id,
            email: profile.emails[0].value,
            name: profile.displayName,
            avatar: profile.photos[0].value
          }
        }
      });
      await user.save();
    }

    const token = user.generateAuthToken();
    const refreshTokenJwt = user.generateRefreshToken();

    return done(null, { user, token, refreshToken: refreshTokenJwt });

  } catch (error) {
    logger.error('Facebook OAuth error:', error);
    return done(error, null);
  }
}));
} else {
  logger.warn('Facebook OAuth non configuré - FACEBOOK_APP_ID/SECRET manquants');
}

// Configuration Twitter OAuth Strategy (optionnelle)
if (process.env.TWITTER_API_KEY && process.env.TWITTER_API_SECRET) {
  passport.use(new TwitterStrategy({
  consumerKey: process.env.TWITTER_API_KEY,
  consumerSecret: process.env.TWITTER_API_SECRET,
  callbackURL: `${process.env.FRONTEND_URL}/api/oauth/twitter/callback`,
  userProfileURL: 'https://api.twitter.com/2/users/me?user.fields=profile_image_url,public_metrics,verified',
  includeEmail: true
}, async (token, tokenSecret, profile, done) => {
  try {
    let user = await User.findByOAuthProvider('twitter', profile.id);

    if (user) {
      user.oauthProviders.twitter = {
        id: profile.id,
        username: profile.username,
        name: profile.displayName,
        avatar: profile.photos[0].value
      };
      user.lastLogin = new Date();
      await user.save();
    } else {
      user = new User({
        email: profile.emails?.[0]?.value || `${profile.username}@twitter.local`, // Email peut ne pas être disponible
        name: profile.displayName,
        avatar: profile.photos[0].value,
        emailVerified: profile.emails?.[0]?.verified || false,
        oauthProviders: {
          twitter: {
            id: profile.id,
            username: profile.username,
            name: profile.displayName,
            avatar: profile.photos[0].value
          }
        }
      });
      await user.save();
    }

    const authToken = user.generateAuthToken();
    const refreshTokenJwt = user.generateRefreshToken();

    return done(null, { user, token: authToken, refreshToken: refreshTokenJwt });

  } catch (error) {
    logger.error('Twitter OAuth error:', error);
    return done(error, null);
  }
}));
} else {
  logger.warn('Twitter OAuth non configuré - TWITTER_API_KEY/SECRET manquants');
}

// Configuration LinkedIn OAuth Strategy (optionnelle)
if (process.env.LINKEDIN_CLIENT_ID && process.env.LINKEDIN_CLIENT_SECRET) {
  passport.use(new LinkedInStrategy({
  clientID: process.env.LINKEDIN_CLIENT_ID,
  clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
  callbackURL: `${process.env.FRONTEND_URL}/api/oauth/linkedin/callback`,
  scope: ['r_liteprofile', 'w_member_social', 'r_emailaddress'],
  state: true
}, async (accessToken, refreshToken, profile, done) => {
  try {
    let user = await User.findByOAuthProvider('linkedin', profile.id);

    if (user) {
      user.oauthProviders.linkedin = {
        id: profile.id,
        email: profile.emails[0].value,
        name: profile.displayName,
        avatar: profile.photos[0].value
      };
      user.lastLogin = new Date();
      await user.save();
    } else {
      user = new User({
        email: profile.emails[0].value,
        name: profile.displayName,
        avatar: profile.photos[0].value,
        emailVerified: true,
        oauthProviders: {
          linkedin: {
            id: profile.id,
            email: profile.emails[0].value,
            name: profile.displayName,
            avatar: profile.photos[0].value
          }
        }
      });
      await user.save();
    }

    const authToken = user.generateAuthToken();
    const refreshTokenJwt = user.generateRefreshToken();

    return done(null, { user, token: authToken, refreshToken: refreshTokenJwt });

  } catch (error) {
    logger.error('LinkedIn OAuth error:', error);
    return done(error, null);
  }
}));
} else {
  logger.warn('LinkedIn OAuth non configuré - LINKEDIN_CLIENT_ID/SECRET manquants');
}

// Middleware pour vérifier l'authentification JWT
export const authenticateToken = (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (err, user, info) => {
    if (err) {
      return next(err);
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized - Invalid token'
      });
    }

    req.user = user;
    next();
  })(req, res, next);
};

// Middleware pour vérifier les rôles admin
export const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      error: 'Forbidden - Admin access required'
    });
  }
  next();
};

export default passport;
