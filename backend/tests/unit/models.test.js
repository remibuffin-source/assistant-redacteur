import { expect } from 'chai';
import User from '../../models/User.js';
import Publication from '../../models/Publication.js';
import SocialAccount from '../../models/SocialAccount.js';
import { connectDB, disconnectDB } from '../../config/database.js';

describe('Models Unit Tests', () => {
  before(async () => {
    await connectDB();
  });

  after(async () => {
    await User.deleteMany({});
    await Publication.deleteMany({});
    await SocialAccount.deleteMany({});
    await disconnectDB();
  });

  describe('User Model', () => {
    it('should hash password before saving', async () => {
      const user = new User({
        email: 'test@example.com',
        name: 'Test User',
        password: 'password123'
      });

      await user.save();
      expect(user.password).to.not.equal('password123');
      expect(user.password).to.be.a('string');
      expect(user.password.length).to.be.greaterThan(10);
    });

    it('should generate auth token', async () => {
      const user = new User({
        email: 'token@example.com',
        name: 'Token User',
        password: 'password123'
      });

      await user.save();
      const token = user.generateAuthToken();

      expect(token).to.be.a('string');
      expect(token.split('.')).to.have.length(3); // JWT format
    });

    it('should find user by OAuth provider', async () => {
      const user = new User({
        email: 'oauth@example.com',
        name: 'OAuth User',
        password: 'password123',
        oauthProviders: {
          google: {
            id: 'google_123',
            email: 'oauth@example.com'
          }
        }
      });

      await user.save();

      const foundUser = await User.findByOAuthProvider('google', 'google_123');
      expect(foundUser).to.not.be.null;
      expect(foundUser.email).to.equal('oauth@example.com');
    });
  });

  describe('Publication Model', () => {
    let user;
    let socialAccount;

    before(async () => {
      user = new User({
        email: 'pubtest@example.com',
        name: 'Publication Test User',
        password: 'password123'
      });
      await user.save();

      socialAccount = new SocialAccount({
        userId: user._id,
        platform: 'twitter',
        accountId: 'test_account_123',
        accountName: 'Test Account',
        accessToken: 'test_access_token',
        refreshToken: 'test_refresh_token',
        status: 'active'
      });
      await socialAccount.save();
    });

    it('should create publication with platforms', async () => {
      const publication = new Publication({
        userId: user._id,
        title: 'Test Publication',
        content: 'Test content',
        platforms: [{
          platform: 'twitter',
          accountId: socialAccount.accountId,
          scheduledDate: new Date(Date.now() + 3600000).toISOString()
        }]
      });

      await publication.save();

      expect(publication.title).to.equal('Test Publication');
      expect(publication.platforms).to.have.length(1);
      expect(publication.platforms[0].platform).to.equal('twitter');
    });

    it('should update platform status', async () => {
      const publication = new Publication({
        userId: user._id,
        title: 'Status Test Publication',
        content: 'Test content',
        platforms: [{
          platform: 'twitter',
          accountId: socialAccount.accountId,
          scheduledDate: new Date(Date.now() + 3600000).toISOString()
        }]
      });

      await publication.save();

      await publication.updatePlatformStatus(0, 'published', {
        postId: '123456789',
        postUrl: 'https://twitter.com/test/status/123456789'
      });

      expect(publication.platforms[0].status).to.equal('published');
      expect(publication.platforms[0].postId).to.equal('123456789');
      expect(publication.platforms[0].postUrl).to.equal('https://twitter.com/test/status/123456789');
    });

    it('should add history entry', async () => {
      const publication = new Publication({
        userId: user._id,
        title: 'History Test Publication',
        content: 'Test content',
        platforms: []
      });

      await publication.save();

      await publication.addHistoryEntry('edited', 'Publication modified', user._id);

      expect(publication.history).to.have.length(2); // created + edited
      expect(publication.history[1].action).to.equal('edited');
      expect(publication.history[1].details).to.equal('Publication modified');
      expect(publication.history[1].userId.toString()).to.equal(user._id.toString());
    });

    it('should find pending publications', async () => {
      // Créer des publications avec différents statuts
      const pendingPublication = new Publication({
        userId: user._id,
        title: 'Pending Publication',
        content: 'Pending content',
        platforms: [{
          platform: 'twitter',
          accountId: socialAccount.accountId,
          scheduledDate: new Date(Date.now() + 3600000).toISOString(),
          status: 'pending'
        }]
      });

      const publishedPublication = new Publication({
        userId: user._id,
        title: 'Published Publication',
        content: 'Published content',
        platforms: [{
          platform: 'twitter',
          accountId: socialAccount.accountId,
          scheduledDate: new Date(Date.now() - 3600000).toISOString(),
          status: 'published'
        }]
      });

      await pendingPublication.save();
      await publishedPublication.save();

      const pendingPublications = await Publication.findPendingPublications();

      expect(pendingPublications).to.be.an('array');
      expect(pendingPublications.some(pub => pub._id.toString() === pendingPublication._id.toString())).to.be.true;
      expect(pendingPublications.some(pub => pub._id.toString() === publishedPublication._id.toString())).to.be.false;
    });
  });

  describe('SocialAccount Model', () => {
    let user;

    before(async () => {
      user = new User({
        email: 'social@example.com',
        name: 'Social Test User',
        password: 'password123'
      });
      await user.save();
    });

    it('should create social account', async () => {
      const socialAccount = new SocialAccount({
        userId: user._id,
        platform: 'twitter',
        accountId: 'twitter_123',
        accountName: 'Test Twitter Account',
        accessToken: 'access_token_123',
        refreshToken: 'refresh_token_123',
        status: 'active'
      });

      await socialAccount.save();

      expect(socialAccount.platform).to.equal('twitter');
      expect(socialAccount.accountId).to.equal('twitter_123');
      expect(socialAccount.status).to.equal('active');
    });

    it('should update statistics', async () => {
      const socialAccount = new SocialAccount({
        userId: user._id,
        platform: 'facebook',
        accountId: 'facebook_456',
        accountName: 'Test Facebook Account',
        accessToken: 'fb_access_token',
        refreshToken: 'fb_refresh_token',
        status: 'active'
      });

      await socialAccount.save();

      await socialAccount.updateStats({ success: true });

      expect(socialAccount.stats.posts).to.equal(1);
      expect(socialAccount.stats.successfulPosts).to.equal(1);
      expect(socialAccount.stats.failedPosts).to.equal(0);
      expect(socialAccount.stats.lastPostAt).to.be.instanceOf(Date);
    });
  });
});
