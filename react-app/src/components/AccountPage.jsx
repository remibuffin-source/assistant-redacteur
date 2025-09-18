import { useState } from 'react';
import { useAssistantAutoSave } from '../hooks/useLocalStorage';
import { useNavigate } from 'react-router-dom';
import './AccountPage.css';

const AccountPage = () => {
  const { autoSaveData, updateAutoSave } = useAssistantAutoSave();
  const [activeTab, setActiveTab] = useState('profile');
  const navigate = useNavigate();

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

  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

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

  const handleBackToMain = () => {
    navigate('/');
  };

  return (
    <div className="account-page">
      <button className="back-button" onClick={handleBackToMain}>
        <i className="fas fa-arrow-left"></i>
        Retour à l'accueil
      </button>
      
      <div className="account-header">
        <h2>
          <i className="fas fa-user-circle"></i>
          Mon Compte
        </h2>
        <p>Gérez vos paramètres personnels et préférences</p>
      </div>

      <div className="account-tabs">
        <button 
          className={activeTab === 'profile' ? 'active' : ''}
          onClick={() => setActiveTab('profile')}
        >
          <i className="fas fa-user"></i>
          Profil
        </button>
        <button 
          className={activeTab === 'preferences' ? 'active' : ''}
          onClick={() => setActiveTab('preferences')}
        >
          <i className="fas fa-cog"></i>
          Préférences
        </button>
        <button 
          className={activeTab === 'security' ? 'active' : ''}
          onClick={() => setActiveTab('security')}
        >
          <i className="fas fa-shield-alt"></i>
          Sécurité
        </button>
      </div>

      <div className="account-content">
        {activeTab === 'profile' && (
          <div className="tab-content">
            <h3>Informations personnelles</h3>
            
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
            </div>

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

            <div className="password-strength">
              <h4>Conseils de sécurité :</h4>
              <ul>
                <li>Utilisez au moins 8 caractères</li>
                <li>Combinez lettres, chiffres et symboles</li>
                <li>Évitez les mots de passe courants</li>
                <li>Changez régulièrement votre mot de passe</li>
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
  );
};

export default AccountPage;