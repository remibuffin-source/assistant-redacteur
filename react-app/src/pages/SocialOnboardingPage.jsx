import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import MenuBar from '../components/MenuBar';
import PostizConnect from '../components/PostizConnect';
import postizApi from '../services/postizApi';
import { getSocialText } from '../i18n/socialTranslations';
import { useAssistantAutoSave } from '../hooks/useLocalStorage';
import './SocialOnboardingPage.css';

const SocialOnboardingPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { autoSaveData } = useAssistantAutoSave();
  const userLanguage = autoSaveData.language || 'fr';
  const t = (path) => getSocialText(userLanguage, path);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState({});
  const [message, setMessage] = useState(null);
  const [postizConnected, setPostizConnected] = useState(false);

  const platforms = [
    {
      id: 'facebook',
      name: 'Facebook',
      description: t('platforms.facebook'),
      icon: '/icons/facebook.ico',
      color: '#1877F2'
    },
    {
      id: 'instagram',
      name: 'Instagram',
      description: t('platforms.instagram'),
      icon: '/icons/instagram.ico',
      color: '#E4405F'
    },
    {
      id: 'x',
      name: 'X (Twitter)',
      description: t('platforms.x'),
      icon: '/icons/twitter.ico',
      color: '#000000'
    },
    {
      id: 'linkedin',
      name: 'LinkedIn',
      description: t('platforms.linkedin'),
      icon: '/icons/linkedin.ico',
      color: '#0A66C2'
    },
    {
      id: 'tiktok',
      name: 'TikTok',
      description: t('platforms.tiktok'),
      icon: '/icons/tiktok.ico',
      color: '#000000'
    },
    {
      id: 'youtube',
      name: 'YouTube',
      description: t('platforms.youtube'),
      icon: '/icons/youtube.ico',
      color: '#FF0000'
    },
    {
      id: 'pinterest',
      name: 'Pinterest',
      description: t('platforms.pinterest'),
      icon: '/icons/pinterest.ico',
      color: '#E60023'
    },
    {
      id: 'reddit',
      name: 'Reddit',
      description: t('platforms.reddit'),
      icon: 'fab fa-reddit',
      color: '#FF4500',
      useFontAwesome: true
    },
    {
      id: 'threads',
      name: 'Threads',
      description: t('platforms.threads'),
      icon: 'fab fa-threads',
      color: '#000000',
      useFontAwesome: true
    },
    {
      id: 'mastodon',
      name: 'Mastodon',
      description: t('platforms.mastodon'),
      icon: 'fab fa-mastodon',
      color: '#6364FF',
      useFontAwesome: true
    },
    {
      id: 'bluesky',
      name: 'Bluesky',
      description: t('platforms.bluesky'),
      icon: 'fas fa-cloud',
      color: '#1185FE',
      useFontAwesome: true
    },
    {
      id: 'discord',
      name: 'Discord',
      description: t('platforms.discord'),
      icon: 'fab fa-discord',
      color: '#5865F2',
      useFontAwesome: true
    }
  ];

  useEffect(() => {
    loadAccounts();
    checkCallbackStatus();
  }, []);

  const checkCallbackStatus = () => {
    const success = searchParams.get('success');
    const error = searchParams.get('error');
    const provider = searchParams.get('provider');

    if (success === 'true' && provider) {
      setMessage({
        type: 'success',
        text: `✅ ${getPlatformName(provider)} ${t('messages.connectSuccess')}`
      });
      setTimeout(() => setMessage(null), 5000);
      loadAccounts();
    } else if (error) {
      setMessage({
        type: 'error',
        text: `❌ ${t('messages.connectError')} : ${error}`
      });
      setTimeout(() => setMessage(null), 5000);
    }
  };

  const getPlatformName = (id) => {
    const platform = platforms.find(p => p.id === id);
    return platform ? platform.name : id;
  };

  const loadAccounts = async () => {
    setLoading(true);
    try {
      const result = await postizApi.getConnectedAccounts();
      if (result.success) {
        setAccounts(result.accounts);
      }
    } catch (error) {
      console.error('Erreur chargement comptes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async (provider) => {
    console.log('🔗 handleConnect appelé pour:', provider);
    console.log('📊 Postiz connecté:', postizConnected);
    
    if (!postizConnected) {
      console.log('❌ Postiz non connecté, blocage');
      setMessage({
        type: 'error',
        text: `⚠️ ${t('messages.postizRequired')}`
      });
      setTimeout(() => setMessage(null), 5000);
      return;
    }

    setConnecting(prev => ({ ...prev, [provider]: true }));
    console.log('⏳ Connexion en cours pour:', provider);
    
    try {
      console.log('📡 Appel API postizApi.connectProvider...');
      const result = await postizApi.connectProvider(provider);
      console.log('📦 Résultat API:', result);
      
      if (result.success && result.authUrl) {
        console.log('✅ URL d\'auth reçue:', result.authUrl);
        console.log('🌐 Redirection vers:', result.authUrl);
        window.location.href = result.authUrl;
      } else {
        console.log('❌ Erreur API:', result.error);
        setMessage({
          type: 'error',
          text: `❌ ${t('messages.connectError')} : ${result.error}`
        });
        setTimeout(() => setMessage(null), 5000);
      }
    } catch (error) {
      console.error(`❌ Exception lors de la connexion ${provider}:`, error);
      setMessage({
        type: 'error',
        text: `❌ ${t('messages.connectError')}: ${error.message}`
      });
      setTimeout(() => setMessage(null), 5000);
    } finally {
      console.log('🏁 Fin de handleConnect pour:', provider);
      setConnecting(prev => ({ ...prev, [provider]: false }));
    }
  };

  const handleDisconnect = async (accountId, provider) => {
    if (!confirm(`${t('messages.disconnectConfirm')} ${getPlatformName(provider)} ?`)) {
      return;
    }

    try {
      const result = await postizApi.disconnectAccount(accountId);
      
      if (result.success) {
        setMessage({
          type: 'success',
          text: `✅ ${t('messages.disconnectSuccess')}`
        });
        setTimeout(() => setMessage(null), 3000);
        loadAccounts();
      } else {
        setMessage({
          type: 'error',
          text: `❌ ${t('messages.connectError')} : ${result.error}`
        });
        setTimeout(() => setMessage(null), 5000);
      }
    } catch (error) {
      console.error('Erreur déconnexion:', error);
      setMessage({
        type: 'error',
        text: `❌ ${t('messages.disconnectError')}`
      });
      setTimeout(() => setMessage(null), 5000);
    }
  };

  const isConnected = (providerId) => {
    return accounts.some(acc => acc.provider === providerId && acc.status === 'connected');
  };

  const getConnectedAccount = (providerId) => {
    return accounts.find(acc => acc.provider === providerId && acc.status === 'connected');
  };

  return (
    <div className="page-container">
      <MenuBar onHelp={() => {}} />
      <div className="page-content social-onboarding-content">
        <div className="social-onboarding-page">
          <div className="onboarding-header">
            <div className="header-content">
              <h1 style={{ color: '#FF6B35' }}>
                <i className="fas fa-share-alt"></i>
                {t('title')}
              </h1>
              <p style={{ color: '#FF6B35', fontSize: '1.1rem', fontWeight: '500' }}>{t('subtitle')}</p>
            </div>
          </div>

          {message && (
            <div className={`message-banner ${message.type}`}>
              <i className={`fas ${message.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}`}></i>
              <span>{message.text}</span>
            </div>
          )}

          <div className="postiz-connection-section">
            <div className="section-header">
              <div className="header-icon">
                <i className="fas fa-plug"></i>
              </div>
              <div className="header-text">
                <h2>{t('step1.title')}</h2>
                <p style={{ fontWeight: '600', fontSize: '1.05rem' }}>{t('step1.description')}</p>
              </div>
            </div>
            <PostizConnect onConnectionChange={setPostizConnected} />
          </div>

          <div className="platforms-section">
            <div className="section-header">
              <div className="header-icon">
                <i className="fas fa-share-nodes"></i>
              </div>
              <div className="header-text">
                <h2>{t('step2.title')}</h2>
                <p>{t('step2.description')}</p>
              </div>
            </div>

            {!postizConnected && (
              <div className="warning-banner">
                <i className="fas fa-exclamation-triangle"></i>
                <div>
                  <strong>{t('banners.postizRequired.title')}</strong>
                  <p>{t('banners.postizRequired.description')}</p>
                </div>
              </div>
            )}

            <div className="info-banner">
              <i className="fas fa-shield-alt"></i>
              <div>
                <strong>{t('banners.secureConnection.title')}</strong>
                <p>{t('banners.secureConnection.description')}</p>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="loading-container">
              <i className="fas fa-spinner fa-spin"></i>
              <p>{t('status.loading')}</p>
            </div>
          ) : (
            <>
              <div className={`platforms-grid ${!postizConnected ? 'disabled' : ''}`}>
                {platforms.map(platform => {
                  const connected = isConnected(platform.id);
                  const account = getConnectedAccount(platform.id);
                  const isConnecting = connecting[platform.id];

                  return (
                    <div 
                      key={platform.id} 
                      className={`platform-card ${connected ? 'connected' : ''}`}
                      style={{ '--platform-color': platform.color }}
                    >
                      <div className="platform-header">
                        <div className="platform-icon">
                          {platform.useFontAwesome ? (
                            <i className={platform.icon} style={{ fontSize: '32px', color: platform.color }}></i>
                          ) : (
                            <img src={platform.icon} alt={platform.name} />
                          )}
                        </div>
                        <div className="platform-info">
                          <h3>{platform.name}</h3>
                          <p>{platform.description}</p>
                        </div>
                      </div>

                      {connected && account ? (
                        <div className="connected-account">
                          <div className="account-details">
                            {account.avatarUrl && (
                              <img 
                                src={account.avatarUrl} 
                                alt={account.displayName}
                                className="account-avatar"
                              />
                            )}
                            <div className="account-info">
                              <div className="account-name">{account.displayName}</div>
                              {account.username && (
                                <div className="account-username">@{account.username}</div>
                              )}
                              <div className="connection-status">
                                <i className="fas fa-check-circle"></i>
                                <span>{t('status.connected')}</span>
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => handleDisconnect(account.id, platform.id)}
                            className="btn-disconnect"
                          >
                            <i className="fas fa-unlink"></i>
                            {t('buttons.disconnect')}
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleConnect(platform.id)}
                          disabled={isConnecting || !postizConnected}
                          className="btn-connect"
                          style={{ opacity: (isConnecting || !postizConnected) ? 0.7 : 1 }}
                        >
                          {isConnecting ? (
                            <>
                              <i className="fas fa-spinner fa-spin"></i>
                              {t('buttons.connecting')}
                            </>
                          ) : (
                            <>
                              <i className="fas fa-link"></i>
                              {t('buttons.connect')}
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>

              {accounts.length > 0 && (
                <div className="onboarding-footer">
                  <div className="stats-summary">
                    <div className="stat-item">
                      <span className="stat-number">{accounts.length}</span>
                      <span className="stat-label">{t('stats.connectedAccounts')}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-number">{platforms.length}</span>
                      <span className="stat-label">{t('stats.availablePlatforms')}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => navigate('/calendar')}
                    className="btn-continue"
                  >
                    <i className="fas fa-calendar-alt"></i>
                    {t('buttons.continue')}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SocialOnboardingPage;
