import dotenv from 'dotenv';
import { connectDB as connectMongoDB } from '../config/database.js';
import { connectDB as connectMySQL, sequelize } from '../config/sequelize.js';
import { User, ApiKey, PricingConfig, CreditHistory, initDatabase } from '../models/index.sequelize.js';

// Modèles MongoDB
import UserMongo from '../models/User.js';
import ApiKeyMongo from '../models/ApiKey.js';
import PricingConfigMongo from '../models/PricingConfig.js';

dotenv.config();

/**
 * Script de migration de MongoDB vers MySQL
 */
async function migrateToMySQL() {
  console.log('🚀 Démarrage de la migration MongoDB → MySQL\n');

  try {
    // 1. Connexion aux deux bases de données
    console.log('📡 Connexion à MongoDB...');
    await connectMongoDB();
    
    console.log('📡 Connexion à MySQL...');
    await connectMySQL();

    // 2. Créer les tables MySQL
    console.log('\n📊 Création des tables MySQL...');
    await initDatabase();

    // 3. Migrer les utilisateurs
    console.log('\n👥 Migration des utilisateurs...');
    const usersMongo = await UserMongo.find({});
    console.log(`   Trouvé ${usersMongo.length} utilisateurs à migrer`);

    for (const userMongo of usersMongo) {
      try {
        const userData = {
          email: userMongo.email,
          password: userMongo.password, // Déjà hashé
          name: userMongo.name,
          avatar: userMongo.avatar,
          role: userMongo.role,
          isActive: userMongo.isActive,
          lastLogin: userMongo.lastLogin,
          emailVerified: userMongo.emailVerified,
          emailVerificationToken: userMongo.emailVerificationToken,
          passwordResetToken: userMongo.passwordResetToken,
          passwordResetExpires: userMongo.passwordResetExpires,

          // OAuth
          oauthGoogleId: userMongo.oauthProviders?.google?.id,
          oauthGoogleEmail: userMongo.oauthProviders?.google?.email,
          oauthGoogleName: userMongo.oauthProviders?.google?.name,
          oauthGoogleAvatar: userMongo.oauthProviders?.google?.avatar,
          oauthFacebookId: userMongo.oauthProviders?.facebook?.id,
          oauthFacebookEmail: userMongo.oauthProviders?.facebook?.email,
          oauthFacebookName: userMongo.oauthProviders?.facebook?.name,
          oauthFacebookAvatar: userMongo.oauthProviders?.facebook?.avatar,
          oauthTwitterId: userMongo.oauthProviders?.twitter?.id,
          oauthTwitterUsername: userMongo.oauthProviders?.twitter?.username,
          oauthTwitterName: userMongo.oauthProviders?.twitter?.name,
          oauthTwitterAvatar: userMongo.oauthProviders?.twitter?.avatar,
          oauthLinkedinId: userMongo.oauthProviders?.linkedin?.id,
          oauthLinkedinEmail: userMongo.oauthProviders?.linkedin?.email,
          oauthLinkedinName: userMongo.oauthProviders?.linkedin?.name,
          oauthLinkedinAvatar: userMongo.oauthProviders?.linkedin?.avatar,

          // Préférences
          preferencesTheme: userMongo.preferences?.theme,
          preferencesLanguage: userMongo.preferences?.language,
          preferencesTimezone: userMongo.preferences?.timezone,
          preferencesNotificationsEmail: userMongo.preferences?.notifications?.email,
          preferencesNotificationsPush: userMongo.preferences?.notifications?.push,
          preferencesNotificationsPublicationSuccess: userMongo.preferences?.notifications?.publicationSuccess,
          preferencesNotificationsPublicationFailure: userMongo.preferences?.notifications?.publicationFailure,

          // Crédits
          creditsBalance: userMongo.credits?.balance || 0,
          creditsTotalPurchased: userMongo.credits?.totalPurchased || 0,
          creditsTotalUsed: userMongo.credits?.totalUsed || 0,
          creditsLastRecharge: userMongo.credits?.lastRecharge,

          // Statistiques
          statsTotalPublications: userMongo.stats?.totalPublications || 0,
          statsSuccessfulPublications: userMongo.stats?.successfulPublications || 0,
          statsFailedPublications: userMongo.stats?.failedPublications || 0,
          statsLastPublicationDate: userMongo.stats?.lastPublicationDate,

          createdAt: userMongo.createdAt,
          updatedAt: userMongo.updatedAt
        };

        const userMySQL = await User.create(userData, {
          hooks: false // Désactiver les hooks pour garder le mot de passe hashé
        });

        // Migrer l'historique des crédits
        if (userMongo.credits?.history && userMongo.credits.history.length > 0) {
          for (const historyItem of userMongo.credits.history) {
            await CreditHistory.create({
              userId: userMySQL.id,
              type: historyItem.type,
              amount: historyItem.amount,
              balanceAfter: historyItem.balanceAfter,
              description: historyItem.description,
              relatedTo: historyItem.relatedTo,
              metadata: historyItem.metadata,
              createdAt: historyItem.createdAt
            });
          }
        }

        console.log(`   ✅ ${userMongo.email}`);
      } catch (error) {
        console.error(`   ❌ Erreur pour ${userMongo.email}:`, error.message);
      }
    }

    // 4. Migrer les clés API
    console.log('\n🔑 Migration des clés API...');
    const apiKeysMongo = await ApiKeyMongo.find({});
    console.log(`   Trouvé ${apiKeysMongo.length} clés API à migrer`);

    for (const apiKeyMongo of apiKeysMongo) {
      try {
        // Trouver l'utilisateur correspondant dans MySQL
        const userMySQL = await User.findOne({ 
          where: { email: (await UserMongo.findById(apiKeyMongo.userId))?.email }
        });

        if (userMySQL) {
          await ApiKey.create({
            userId: userMySQL.id,
            service: apiKeyMongo.service,
            encryptedKey: apiKeyMongo.encryptedKey,
            iv: apiKeyMongo.iv,
            isActive: apiKeyMongo.isActive,
            lastUsed: apiKeyMongo.lastUsed,
            metadataKeyPrefix: apiKeyMongo.metadata?.keyPrefix,
            metadataProvider: apiKeyMongo.metadata?.provider,
            metadataNotes: apiKeyMongo.metadata?.notes,
            createdAt: apiKeyMongo.createdAt,
            updatedAt: apiKeyMongo.updatedAt
          });
          console.log(`   ✅ ${apiKeyMongo.service} pour user ${userMySQL.id}`);
        }
      } catch (error) {
        console.error(`   ❌ Erreur pour clé API:`, error.message);
      }
    }

    // 5. Migrer la configuration de prix
    console.log('\n💰 Migration de la configuration de prix...');
    const pricingConfigMongo = await PricingConfigMongo.findOne({});
    
    if (pricingConfigMongo) {
      await PricingConfig.create({
        profitMargin: pricingConfigMongo.profitMargin,
        serviceCosts: pricingConfigMongo.serviceCosts,
        rechargeOffers: pricingConfigMongo.rechargeOffers,
        monthlySubscriptionAmount: pricingConfigMongo.monthlySubscriptionAmount,
        createdAt: pricingConfigMongo.createdAt,
        updatedAt: pricingConfigMongo.updatedAt
      });
      console.log('   ✅ Configuration de prix migrée');
    }

    console.log('\n✅ Migration terminée avec succès !');
    console.log('\n📊 Statistiques:');
    console.log(`   - Utilisateurs: ${await User.count()}`);
    console.log(`   - Clés API: ${await ApiKey.count()}`);
    console.log(`   - Historique crédits: ${await CreditHistory.count()}`);
    console.log(`   - Configuration prix: ${await PricingConfig.count()}`);

  } catch (error) {
    console.error('\n❌ Erreur lors de la migration:', error);
    throw error;
  } finally {
    // Fermer les connexions
    await sequelize.close();
    process.exit(0);
  }
}

// Exécuter la migration
migrateToMySQL().catch(error => {
  console.error('Erreur fatale:', error);
  process.exit(1);
});
