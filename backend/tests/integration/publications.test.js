import request from 'supertest';
import { expect } from 'chai';
import app from '../../server.js';
import User from '../../models/User.js';
import Publication from '../../models/Publication.js';
import SocialAccount from '../../models/SocialAccount.js';
import { connectDB, disconnectDB } from '../../config/database.js';

describe('Publications API Integration Tests', () => {
  let authToken;
  let user;
  let socialAccount;

  before(async () => {
    await connectDB();

    // Créer un utilisateur de test
    user = new User({
      email: 'test@example.com',
      name: 'Test User',
      password: 'password123'
    });
    await user.save();

    // Générer un token d'authentification
    authToken = user.generateAuthToken();

    // Créer un compte social de test
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

  after(async () => {
    await User.deleteMany({});
    await Publication.deleteMany({});
    await SocialAccount.deleteMany({});
    await disconnectDB();
  });

  describe('POST /api/publications', () => {
    it('should create a new publication', async () => {
      const publicationData = {
        title: 'Test Publication',
        content: 'This is a test publication content',
        platforms: [{
          platform: 'twitter',
          accountId: socialAccount.accountId,
          scheduledDate: new Date(Date.now() + 3600000).toISOString() // +1 heure
        }],
        tags: ['test', 'integration']
      };

      const response = await request(app)
        .post('/api/publications')
        .set('Authorization', `Bearer ${authToken}`)
        .send(publicationData)
        .expect(201);

      expect(response.body.success).to.be.true;
      expect(response.body.data.title).to.equal(publicationData.title);
      expect(response.body.data.platforms).to.have.length(1);
    });

    it('should fail without authentication', async () => {
      const publicationData = {
        title: 'Test Publication',
        content: 'This is a test publication content',
        platforms: []
      };

      await request(app)
        .post('/api/publications')
        .send(publicationData)
        .expect(401);
    });

    it('should fail with invalid platform', async () => {
      const publicationData = {
        title: 'Test Publication',
        content: 'This is a test publication content',
        platforms: [{
          platform: 'invalid_platform',
          accountId: socialAccount.accountId,
          scheduledDate: new Date(Date.now() + 3600000).toISOString()
        }]
      };

      const response = await request(app)
        .post('/api/publications')
        .set('Authorization', `Bearer ${authToken}`)
        .send(publicationData)
        .expect(400);

      expect(response.body.success).to.be.false;
    });
  });

  describe('GET /api/publications', () => {
    let publication;

    before(async () => {
      publication = new Publication({
        userId: user._id,
        title: 'Test Publication for GET',
        content: 'Content for GET test',
        platforms: [{
          platform: 'twitter',
          accountId: socialAccount.accountId,
          scheduledDate: new Date(Date.now() + 3600000).toISOString()
        }]
      });
      await publication.save();
    });

    it('should get user publications', async () => {
      const response = await request(app)
        .get('/api/publications')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).to.be.true;
      expect(response.body.data).to.be.an('array');
      expect(response.body.data.length).to.be.greaterThan(0);
    });

    it('should filter publications by platform', async () => {
      const response = await request(app)
        .get('/api/publications?platform=twitter')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).to.be.true;
      expect(response.body.data.every(pub => pub.platforms.some(p => p.platform === 'twitter'))).to.be.true;
    });
  });

  describe('OAuth Integration', () => {
    it('should get OAuth platforms', async () => {
      const response = await request(app)
        .get('/api/oauth/platforms')
        .expect(200);

      expect(response.body.success).to.be.true;
      expect(response.body.data).to.be.an('array');
      expect(response.body.data.length).to.be.greaterThan(0);
    });

    it('should get OAuth status', async () => {
      const response = await request(app)
        .get('/api/oauth/status')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).to.be.true;
      expect(response.body.data).to.be.an('object');
    });

    it('should get social accounts', async () => {
      const response = await request(app)
        .get('/api/oauth/accounts')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).to.be.true;
      expect(response.body.data).to.be.an('array');
    });
  });

  describe('DELETE /api/publications/:id', () => {
    it('should delete a publication', async () => {
      const publication = new Publication({
        userId: user._id,
        title: 'Publication to delete',
        content: 'Content to delete',
        platforms: [{
          platform: 'twitter',
          accountId: socialAccount.accountId,
          scheduledDate: new Date(Date.now() + 3600000).toISOString()
        }]
      });
      await publication.save();

      const response = await request(app)
        .delete(`/api/publications/${publication._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).to.be.true;

      // Vérifier que la publication a été supprimée
      const deletedPublication = await Publication.findById(publication._id);
      expect(deletedPublication).to.be.null;
    });

    it('should fail to delete non-existent publication', async () => {
      await request(app)
        .delete('/api/publications/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });

  describe('Publication Scheduler', () => {
    it('should handle publication creation with scheduler', async () => {
      const futureDate = new Date(Date.now() + 7200000); // +2 heures

      const publicationData = {
        title: 'Scheduled Publication',
        content: 'This publication should be scheduled',
        platforms: [{
          platform: 'twitter',
          accountId: socialAccount.accountId,
          scheduledDate: futureDate.toISOString()
        }],
        tags: ['scheduled', 'test']
      };

      const response = await request(app)
        .post('/api/publications')
        .set('Authorization', `Bearer ${authToken}`)
        .send(publicationData)
        .expect(201);

      expect(response.body.success).to.be.true;

      // Vérifier que le statut est 'pending' pour les publications futures
      const createdPublication = await Publication.findById(response.body.data._id);
      expect(createdPublication.platforms[0].status).to.equal('pending');
    });
  });

  describe('Error Handling', () => {
    it('should handle malformed JSON', async () => {
      await request(app)
        .post('/api/publications')
        .set('Authorization', `Bearer ${authToken}`)
        .set('Content-Type', 'application/json')
        .send('{ malformed json }')
        .expect(400);
    });

    it('should handle missing required fields', async () => {
      const incompleteData = {
        title: 'Incomplete Publication'
        // Missing content and platforms
      };

      const response = await request(app)
        .post('/api/publications')
        .set('Authorization', `Bearer ${authToken}`)
        .send(incompleteData)
        .expect(400);

      expect(response.body.success).to.be.false;
    });
  });
});
