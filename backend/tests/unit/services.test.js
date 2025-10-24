import { expect } from 'chai';
import sinon from 'sinon';
import { TwitterApi } from 'twitter-api-v2';
import axios from 'axios';
import { TwitterService } from '../../services/twitterService.js';
import { FacebookService } from '../../services/facebookService.js';
import { LinkedInService } from '../../services/linkedinService.js';

describe('Publication Services Unit Tests', () => {
  let twitterService;
  let facebookService;
  let linkedinService;

  before(() => {
    twitterService = new TwitterService();
    facebookService = new FacebookService();
    linkedinService = new LinkedInService();
  });

  describe('TwitterService', () => {
    let mockTwitterClient;

    beforeEach(() => {
      // Mock du client Twitter
      mockTwitterClient = {
        v2: {
          tweet: sinon.stub(),
          me: sinon.stub()
        },
        v1: {
          uploadMedia: sinon.stub()
        }
      };

      // Remplacer le constructeur TwitterApi
      sinon.stub(TwitterApi.prototype, 'constructor').returns(mockTwitterClient);
    });

    afterEach(() => {
      sinon.restore();
    });

    it('should prepare tweet content with hashtags', async () => {
      const publication = {
        content: 'Test content for Twitter',
        tags: ['test', 'twitter', 'automation']
      };

      const platformData = {
        settings: {
          includeHashtags: true
        }
      };

      // Mock du client Twitter pour éviter les appels réels
      const mockClient = {
        v2: {
          tweet: sinon.stub().resolves({ data: { id: '123' } })
        }
      };

      const result = await twitterService.prepareTweetContent(publication, platformData);

      expect(result).to.include('Test content for Twitter');
      expect(result).to.include('#test');
      expect(result).to.include('#twitter');
      expect(result).to.include('#automation');
      expect(result.length).to.be.lessThanOrEqual(280);
    });

    it('should truncate long content', async () => {
      const longContent = 'a'.repeat(300);
      const publication = {
        content: longContent,
        tags: []
      };

      const platformData = {
        settings: {
          includeHashtags: false
        }
      };

      const result = await twitterService.prepareTweetContent(publication, platformData);

      expect(result.length).to.equal(280);
      expect(result).to.include('...');
    });

    it('should check permissions successfully', async () => {
      const mockAccount = {
        accessToken: 'test_token',
        refreshToken: 'test_refresh'
      };

      mockTwitterClient.v2.me.resolves({
        data: {
          id: '123',
          username: 'testuser',
          protected: false,
          verified: false,
          public_metrics: {
            followers_count: 100
          }
        }
      });

      const result = await twitterService.checkPermissions(mockAccount);

      expect(result.canPost).to.be.true;
      expect(result.isVerified).to.be.false;
      expect(result.followersCount).to.equal(100);
    });

    it('should fail permissions check for protected account', async () => {
      const mockAccount = {
        accessToken: 'test_token',
        refreshToken: 'test_refresh'
      };

      mockTwitterClient.v2.me.resolves({
        data: {
          protected: true
        }
      });

      const result = await twitterService.checkPermissions(mockAccount);

      expect(result.canPost).to.be.false;
    });
  });

  describe('FacebookService', () => {
    let axiosStub;

    beforeEach(() => {
      axiosStub = sinon.stub(axios, 'get');
      axiosStub = sinon.stub(axios, 'post');
    });

    afterEach(() => {
      sinon.restore();
    });

    it('should prepare post content with hashtags', async () => {
      const publication = {
        content: 'Test content for Facebook',
        tags: ['test', 'facebook', 'social']
      };

      const platformData = {
        settings: {
          includeHashtags: true
        }
      };

      const result = await facebookService.preparePostContent(publication, platformData);

      expect(result).to.include('Test content for Facebook');
      expect(result).to.include('#test');
      expect(result).to.include('#facebook');
      expect(result).to.include('#social');
    });

    it('should check permissions successfully', async () => {
      const mockAccount = {
        accessToken: 'test_token'
      };

      axiosStub.resolves({
        data: {
          data: [
            { permission: 'pages_manage_posts', status: 'granted' },
            { permission: 'email', status: 'granted' }
          ]
        }
      });

      const result = await facebookService.checkPermissions(mockAccount);

      expect(result.canPost).to.be.true;
      expect(result.hasEmail).to.be.true;
      expect(result.permissions).to.be.an('array');
    });

    it('should fail permissions check without publish permission', async () => {
      const mockAccount = {
        accessToken: 'test_token'
      };

      axiosStub.resolves({
        data: {
          data: [
            { permission: 'email', status: 'granted' }
          ]
        }
      });

      const result = await facebookService.checkPermissions(mockAccount);

      expect(result.canPost).to.be.false;
    });

    it('should get account info successfully', async () => {
      const mockAccount = {
        accessToken: 'test_token'
      };

      axiosStub.resolves({
        data: {
          id: '123',
          name: 'Test User',
          email: 'test@example.com',
          picture: {
            data: {
              url: 'https://example.com/avatar.jpg'
            }
          },
          accounts: {
            data: [
              {
                id: 'page_123',
                name: 'Test Page',
                access_token: 'page_token',
                category: 'Business'
              }
            ]
          }
        }
      });

      const result = await facebookService.getAccountInfo(mockAccount);

      expect(result.id).to.equal('123');
      expect(result.name).to.equal('Test User');
      expect(result.pages).to.have.length(1);
      expect(result.pages[0].name).to.equal('Test Page');
    });
  });

  describe('LinkedInService', () => {
    let axiosStub;

    beforeEach(() => {
      axiosStub = sinon.stub(axios, 'get');
      axiosStub = sinon.stub(axios, 'post');
    });

    afterEach(() => {
      sinon.restore();
    });

    it('should prepare post content with hashtags', async () => {
      const publication = {
        content: 'Test content for LinkedIn',
        tags: ['test', 'linkedin', 'professional']
      };

      const platformData = {
        settings: {
          includeHashtags: true
        }
      };

      const result = await linkedinService.preparePostContent(publication, platformData);

      expect(result).to.include('Test content for LinkedIn');
      expect(result).to.include('#test');
      expect(result).to.include('#linkedin');
      expect(result).to.include('#professional');
      expect(result.length).to.be.lessThanOrEqual(3000);
    });

    it('should truncate very long content', async () => {
      const longContent = 'a'.repeat(3100);
      const publication = {
        content: longContent,
        tags: []
      };

      const platformData = {
        settings: {
          includeHashtags: false
        }
      };

      const result = await linkedinService.preparePostContent(publication, platformData);

      expect(result.length).to.equal(3000);
      expect(result).to.include('...');
    });

    it('should check permissions successfully', async () => {
      const mockAccount = {
        accessToken: 'test_token'
      };

      axiosStub.resolves({
        data: {
          id: '123',
          firstName: { localized: { fr_FR: 'Test' } },
          lastName: { localized: { fr_FR: 'User' } },
          headline: { localized: { fr_FR: 'Test Professional' } }
        }
      });

      const result = await linkedinService.checkPermissions(mockAccount);

      expect(result.canPost).to.be.true;
      expect(result.profile.firstName).to.equal('Test');
      expect(result.profile.lastName).to.equal('User');
    });

    it('should get profile info successfully', async () => {
      const mockAccount = {
        accessToken: 'test_token'
      };

      axiosStub.resolves({
        data: {
          id: '123',
          firstName: { localized: { fr_FR: 'Test' } },
          lastName: { localized: { fr_FR: 'User' } },
          profilePicture: {
            displayImage: {
              elements: [{
                identifiers: [{
                  identifier: 'https://example.com/avatar.jpg'
                }]
              }]
            }
          },
          headline: { localized: { fr_FR: 'Test Professional' } }
        }
      });

      const result = await linkedinService.getProfileInfo(mockAccount);

      expect(result.id).to.equal('123');
      expect(result.firstName).to.equal('Test');
      expect(result.lastName).to.equal('User');
      expect(result.avatar).to.equal('https://example.com/avatar.jpg');
    });
  });
});
