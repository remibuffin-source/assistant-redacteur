import { useState, useEffect } from 'react';
import { useAssistantAutoSave } from '../hooks/useLocalStorage';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import MenuBar from './MenuBar';
import './AccountPage.css';
import './AccountPage-override.css';
import './AccountPage-force.css';

const AccountPage = () => {
  const { autoSaveData, updateAutoSave } = useAssistantAutoSave();
  const [activeTab, setActiveTab] = useState('profile');
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAuth();

  const [userData, setUserData] = useState({
    username: autoSaveData.username || 'utilisateur123',
    email: autoSaveData.email || 'contact@studioducapbrun.com',
    firstName: autoSaveData.firstName || 'Studio',
    lastName: autoSaveData.lastName || 'du Cap Brun',
    company: autoSaveData.company || 'Studio du Cap Brun',
    phone: autoSaveData.phone || '+33 6 12 34 56 78',
    address: autoSaveData.address || '123 Avenue de la Création, 75000 Paris',
    language: autoSaveData.language || 'fr',
    notifications: autoSaveData.notifications !== undefined ? autoSaveData.notifications : true,
    autoSave: autoSaveData.autoSave !== undefined ? autoSaveData.autoSave : true,
    theme: autoSaveData.theme || 'auto',
    bio: autoSaveData.bio || 'Créateur de contenu passionné par l\'IA et la communication digitale'
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [emailData, setEmailData] = useState({
    newEmail: '',
    confirmPassword: ''
  });

  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isChangingEmail, setIsChangingEmail] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [emailError, setEmailError] = useState('');
  const [emailSuccess, setEmailSuccess] = useState('');

  const handleInputChange = (field, value) => {
    const newData = { ...userData, [field]: value };
    setUserData(newData);
    updateAutoSave(newData);
  };

  const handleSave = () => {
    updateAutoSave(userData);
    alert('Paramètres sauvegardés avec succès !');
  };

  const handlePasswordChange = (field, value) => {
    setPasswordData(prev => ({ ...prev, [field]: value }));
    setPasswordError('');
    setPasswordSuccess('');
  };

  const handleEmailChange = (field, value) => {
    setEmailData(prev => ({ ...prev, [field]: value }));
    setEmailError('');
    setEmailSuccess('');
  };

  const handleChangePassword = () => {
    if (!passwordData.currentPassword) {
      setPasswordError('Veuillez entrer votre mot de passe actuel');
      return;
    }

    if (!passwordData.newPassword) {
      setPasswordError('Veuillez entrer un nouveau mot de passe');
      return;
    }

    if (passwordData.newPassword.length < 8) {
      setPasswordError('Le mot de passe doit contenir au moins 8 caractères');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('Les mots de passe ne correspondent pas');
      return;
    }

    setIsChangingPassword(true);
    
    // Simuler le changement de mot de passe (remplacer par appel API réel)
    setTimeout(() => {
      setIsChangingPassword(false);
      setPasswordSuccess('Mot de passe changé avec succès !');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      setTimeout(() => setPasswordSuccess(''), 3000);
    }, 1500);
  };

  const handleChangeEmail = async () => {
    if (!emailData.newEmail) {
      setEmailError('Veuillez entrer un nouvel email');
      return;
    }

    if (!emailData.confirmPassword) {
      setEmailError('Veuillez confirmer votre mot de passe');
      return;
    }

    // Validation basique de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailData.newEmail)) {
      setEmailError('Veuillez entrer un email valide');
      return;
    }

    setIsChangingEmail(true);
    
    try {
      // Simulation de changement d'email - remplacer par appel API réel
      setTimeout(() => {
        setIsChangingEmail(false);
        setEmailSuccess('Email changé avec succès !');
        
        // Mettre à jour l'email dans les données utilisateur
        handleInputChange('email', emailData.newEmail);
        
        setEmailData({
          newEmail: '',
          confirmPassword: ''
        });
        
        setTimeout(() => setEmailSuccess(''), 3000);
      }, 1500);
    } catch (error) {
      setIsChangingEmail(false);
      setEmailError('Erreur lors du changement d\'email');
    }
  };

  const handleBackToMain = () => {
    navigate('/');
  };

  // Auth guard: redirect to login if unauthenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, isLoading, navigate]);

  // Force l'écriture dans tous les inputs avec JavaScript
  useEffect(() => {
    const forceAllInputs = () => {
      // Sélectionne tous les inputs, textarea et select de la page
      const inputs = document.querySelectorAll('.account-page input, .account-page textarea, .account-page select');
      
      inputs.forEach(input => {
        if (input) {
          // Force les propriétés d'écriture
          input.style.pointerEvents = 'auto';
          input.style.userSelect = 'text';
          input.style.webkitUserSelect = 'text';
          input.style.mozUserSelect = 'text';
          input.style.msUserSelect = 'text';
          input.style.cursor = input.type === 'checkbox' ? 'pointer' : 'text';
          input.style.zIndex = '100';
          input.style.position = 'relative';
          input.style.backgroundColor = input.type === 'checkbox' ? 'transparent' : 'rgba(255, 255, 255, 0.97)';
          input.style.color = input.type === 'checkbox' ? 'inherit' : '#1a1a1a';
          input.style.border = input.type === 'checkbox' ? 'none' : '1px solid rgba(255, 255, 255, 0.3)';
          input.style.borderRadius = input.type === 'checkbox' ? '0' : '8px';
          input.style.padding = input.type === 'checkbox' ? '0' : (input.tagName === 'TEXTAREA' ? '12px 15px' : '12px 15px');
          input.style.fontSize = '14px';
          input.style.fontFamily = "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif";
          input.style.direction = 'ltr';
          input.style.textAlign = 'left';
          input.style.outline = 'none';
          input.style.webkitAppearance = input.type === 'checkbox' ? 'checkbox' : 'none';
          input.style.mozAppearance = input.type === 'checkbox' ? 'checkbox' : 'none';
          input.style.appearance = input.type === 'checkbox' ? 'checkbox' : 'none';
          input.style.opacity = '1';
          input.style.visibility = 'visible';
          input.style.display = input.type === 'checkbox' ? 'inline-block' : 'block';
          input.style.width = input.type === 'checkbox' ? '18px' : '100%';
          input.style.height = input.type === 'checkbox' ? '18px' : 'auto';
          input.style.boxSizing = 'border-box';
          
          // Propriétés ultra-forcées pour les champs de texte
          if (input.type !== 'checkbox' && input.tagName !== 'SELECT') {
            input.contentEditable = 'true';
            input.style.webkitUserModify = 'read-write';
            input.style.mozUserModify = 'read-write';
            input.style.userModify = 'read-write';
            input.style.webkitTextFillColor = '#1a1a1a';
          }
          
          // Événements pour s'assurer que l'input fonctionne
          if (input.type !== 'checkbox') {
            input.addEventListener('focus', () => {
              input.style.borderColor = '#ff6b2c';
              input.style.boxShadow = '0 0 0 2px rgba(255, 107, 44, 0.2)';
            });
            
            input.addEventListener('blur', () => {
              input.style.borderColor = 'rgba(255, 255, 255, 0.3)';
              input.style.boxShadow = 'none';
            });
          }
        }
      });
    };

    // Applique immédiatement et après un délai
    forceAllInputs();
    const timer1 = setTimeout(forceAllInputs, 100);
    const timer2 = setTimeout(forceAllInputs, 500);
    
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [activeTab]); // Re-applique quand on change d'onglet

  // Loader while auth initializes
  if (isLoading) {
    return (
      <div className="page-container">
        <MenuBar onHelp={() => {}} />
        <div className="page-content" style={{display:'flex', alignItems:'center', justifyContent:'center', minHeight: '60vh'}}>
          <div className="loader" />
        </div>
      </div>
    );
  }

  // Do not render content while redirecting unauthenticated users
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="page-container">
      <MenuBar onHelp={() => {}} />
      <div className="page-content">
        <div className="account-page">
          <h2 className="page-title">
            Mon Compte
          </h2>

          <div className="account-tabs">
            <button 
              className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => setActiveTab('profile')}
            >
              Profil
            </button>
            <button 
              className={`tab-btn ${activeTab === 'security' ? 'active' : ''}`}
              onClick={() => setActiveTab('security')}
            >
              Sécurité
            </button>
            <button 
              className={`tab-btn ${activeTab === 'preferences' ? 'active' : ''}`}
              onClick={() => setActiveTab('preferences')}
            >
              Préférences
            </button>
            <button 
              className={`tab-btn ${activeTab === 'subscription' ? 'active' : ''}`}
              onClick={() => setActiveTab('subscription')}
            >
              Abonnement
            </button>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="firstName">Prénom</label>
                <input
                  type="text"
                  id="firstName"
                  value={userData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  placeholder="Votre prénom"
                />
              </div>

              <div className="form-group">
                <label htmlFor="lastName">Nom</label>
                <input
                  type="text"
                  id="lastName"
                  value={userData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  placeholder="Votre nom"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="username">Nom d'utilisateur</label>
              <input
                type="text"
                id="username"
                value={userData.username}
                onChange={(e) => handleInputChange('username', e.target.value)}
                placeholder="Votre nom d'utilisateur"
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                value={userData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="votre@email.com"
              />
            </div>

            <div className="form-group">
              <label htmlFor="company">Entreprise</label>
              <input
                type="text"
                id="company"
                value={userData.company}
                onChange={(e) => handleInputChange('company', e.target.value)}
                placeholder="Votre entreprise"
              />
            </div>

            <div className="form-group">
              <label htmlFor="phone">Téléphone</label>
              <input
                type="tel"
                id="phone"
                value={userData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="+33 6 12 34 56 78"
              />
            </div>

            <div className="form-group">
              <label htmlFor="address">Adresse</label>
              <input
                type="text"
                id="address"
                value={userData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="Votre adresse complète"
              />
            </div>

            <div className="form-group">
              <label htmlFor="bio">Biographie</label>
              <textarea
                id="bio"
                value={userData.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                placeholder="Décrivez-vous en quelques mots..."
                rows="3"
              />
            </div>

            {/* Statistiques utilisateur */}
            <div className="security-stats">
              <div className="stat-item">
                <i className="fas fa-file-alt"></i>
                <div>
                  <h4>Contenus créés</h4>
                  <p>247 publications</p>
                </div>
              </div>
              
              <div className="stat-item">
                <i className="fas fa-calendar"></i>
                <div>
                  <h4>Membre depuis</h4>
                  <p>Janvier 2024</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'preferences' && (
          <div className="tab-content">
            <h3>Préférences générales</h3>
            
            <div className="form-group">
              <label htmlFor="language">Langue</label>
              <select
                id="language"
                value={userData.language}
                onChange={(e) => handleInputChange('language', e.target.value)}
              >
                <option value="fr">Français</option>
                <option value="en">English</option>
                <option value="es">Español</option>
                <option value="de">Deutsch</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="theme">Thème</label>
              <select
                id="theme"
                value={userData.theme}
                onChange={(e) => handleInputChange('theme', e.target.value)}
              >
                <option value="auto">Automatique</option>
                <option value="light">Clair</option>
                <option value="dark">Sombre</option>
              </select>
            </div>

            <div className="checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={userData.notifications}
                  onChange={(e) => handleInputChange('notifications', e.target.checked)}
                />
                <span className="checkmark"></span>
                Activer les notifications
              </label>
            </div>

            <div className="checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={userData.autoSave}
                  onChange={(e) => handleInputChange('autoSave', e.target.checked)}
                />
                <span className="checkmark"></span>
                Sauvegarde automatique
              </label>
            </div>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="tab-content">
            <h3>Sécurité du compte</h3>
            
            <div className="security-stats">
              <div className="stat-item">
                <i className="fas fa-shield-alt"></i>
                <div>
                  <h4>Niveau de sécurité</h4>
                  <p>Élevé</p>
                </div>
              </div>
              
              <div className="stat-item">
                <i className="fas fa-clock"></i>
                <div>
                  <h4>Dernière connexion</h4>
                  <p>{new Date().toLocaleDateString('fr-FR')}</p>
                </div>
              </div>

              <div className="stat-item">
                <i className="fas fa-envelope"></i>
                <div>
                  <h4>Email actuel</h4>
                  <p>{userData.email}</p>
                </div>
              </div>
            </div>

            {/* Section Changement d'Email */}
            <div className="security-section">
              <h4>Changer l'adresse email</h4>
              
              <div className="form-group">
                <label htmlFor="newEmail">Nouvel email</label>
                <input
                  type="email"
                  id="newEmail"
                  value={emailData.newEmail}
                  onChange={(e) => handleEmailChange('newEmail', e.target.value)}
                  placeholder="Entrez votre nouvel email"
                />
              </div>

              <div className="form-group">
                <label htmlFor="emailPassword">Confirmer le mot de passe</label>
                <input
                  type="password"
                  id="emailPassword"
                  value={emailData.confirmPassword}
                  onChange={(e) => handleEmailChange('confirmPassword', e.target.value)}
                  placeholder="Entrez votre mot de passe pour confirmer"
                />
              </div>

              {emailError && (
                <div className="alert alert-error">
                  <i className="fas fa-exclamation-circle"></i>
                  {emailError}
                </div>
              )}

              {emailSuccess && (
                <div className="alert alert-success">
                  <i className="fas fa-check-circle"></i>
                  {emailSuccess}
                </div>
              )}

              <button
                className={`btn-change-email ${isChangingEmail ? 'loading' : ''}`}
                onClick={handleChangeEmail}
                disabled={isChangingEmail}
              >
                {isChangingEmail ? (
                  <>
                    <div className="loader"></div>
                    Changement en cours...
                  </>
                ) : (
                  <>
                    <i className="fas fa-envelope"></i>
                    Changer l'email
                  </>
                )}
              </button>
            </div>

            {/* Section Changement de Mot de Passe */}
            <div className="security-section">
              <h4>Changer le mot de passe</h4>
              
              <div className="form-group">
                <label htmlFor="currentPassword">Mot de passe actuel</label>
                <input
                  type="password"
                  id="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                  placeholder="Entrez votre mot de passe actuel"
                />
              </div>

              <div className="form-group">
                <label htmlFor="newPassword">Nouveau mot de passe</label>
                <input
                  type="password"
                  id="newPassword"
                  value={passwordData.newPassword}
                  onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                  placeholder="Entrez votre nouveau mot de passe (min. 8 caractères)"
                />
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">Confirmer le mot de passe</label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                  placeholder="Confirmez votre nouveau mot de passe"
                />
              </div>

              {passwordError && (
                <div className="alert alert-error">
                  <i className="fas fa-exclamation-circle"></i>
                  {passwordError}
                </div>
              )}

              {passwordSuccess && (
                <div className="alert alert-success">
                  <i className="fas fa-check-circle"></i>
                  {passwordSuccess}
                </div>
              )}

              <button
                className={`btn-change-password ${isChangingPassword ? 'loading' : ''}`}
                onClick={handleChangePassword}
                disabled={isChangingPassword}
              >
                {isChangingPassword ? (
                  <>
                    <div className="loader"></div>
                    Changement en cours...
                  </>
                ) : (
                  <>
                    <i className="fas fa-key"></i>
                    Changer le mot de passe
                  </>
                )}
              </button>
            </div>

            <div className="password-strength">
              <h4>Conseils de sécurité :</h4>
              <ul>
                <li>Utilisez au moins 8 caractères</li>
                <li>Combinez lettres, chiffres et symboles</li>
                <li>Évitez les mots de passe courants</li>
                <li>Changez régulièrement votre mot de passe</li>
                <li>Utilisez un email valide et sécurisé</li>
              </ul>
            </div>
          </div>
        )}
      </div>

      <div className="account-actions">
        <button className="btn-save" onClick={handleSave}>
          <i className="fas fa-save"></i>
          Sauvegarder les modifications
        </button>

        <button className="btn-cancel">
          <i className="fas fa-times"></i>
          Annuler
        </button>
      </div>
        </div>
      </div>
    </div>
  );
};

export default AccountPage;