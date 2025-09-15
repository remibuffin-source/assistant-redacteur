import { useState } from 'react';
import { useAssistantAutoSave } from '../hooks/useLocalStorage';
import './AccountPage.css';

const AccountPage = () => {
  const { autoSaveData, updateAutoSave } = useAssistantAutoSave();
  const [activeTab, setActiveTab] = useState('profile');

  const [userData, setUserData] = useState({
    username: autoSaveData.username || '',
    email: autoSaveData.email || '',
    firstName: autoSaveData.firstName || '',
    lastName: autoSaveData.lastName || '',
    company: autoSaveData.company || '',
    language: autoSaveData.language || 'fr',
    notifications: autoSaveData.notifications !== undefined ? autoSaveData.notifications : true,
    autoSave: autoSaveData.autoSave !== undefined ? autoSaveData.autoSave : true,
    theme: autoSaveData.theme || 'auto'
  });

  const handleInputChange = (field, value) => {
    const newData = { ...userData, [field]: value };
    setUserData(newData);
    updateAutoSave(newData);
  };

  const handleSave = () => {
    updateAutoSave(userData);
    alert('Paramètres sauvegardés avec succès !');
  };

  return (
    <div className="account-page">
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
                placeholder="Votre entreprise (optionnel)"
              />
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
                placeholder="Entrez votre mot de passe actuel"
              />
            </div>

            <div className="form-group">
              <label htmlFor="newPassword">Nouveau mot de passe</label>
              <input
                type="password"
                id="newPassword"
                placeholder="Entrez votre nouveau mot de passe"
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirmer le mot de passe</label>
              <input
                type="password"
                id="confirmPassword"
                placeholder="Confirmez votre nouveau mot de passe"
              />
            </div>

            <button className="btn-change-password">
              <i className="fas fa-key"></i>
              Changer le mot de passe
            </button>
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