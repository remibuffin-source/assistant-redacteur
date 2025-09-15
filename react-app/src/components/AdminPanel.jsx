import { useState } from 'react';

const AdminPanel = () => {
  const [showModal, setShowModal] = useState(false);

  const showAdminModal = () => {
    setShowModal(true);
  };

  const closeAdminModal = () => {
    setShowModal(false);
  };

  const confirmDisconnect = () => {
    if (confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
      if (confirm('Voulez-vous sauvegarder votre travail avant de vous déconnecter ?')) {
        // Sauvegarder le projet
        console.log('Sauvegarde du projet...');
      }
      alert('Déconnexion effectuée');
      closeAdminModal();
    }
  };

  return (
    <>
      <div className="admin-panel" onClick={showAdminModal} title="Mon Compte">
        <div className="admin-avatar">
          A
        </div>
      </div>

      {showModal && (
        <div className="admin-modal" id="adminModal">
          <div className="admin-modal-content">
            <div className="help-modal-header">
              <h2>Mon Compte</h2>
              <button className="close-modal" onClick={closeAdminModal}>&times;</button>
            </div>
            <div className="admin-content">
              <h3>👤 Mon Profil</h3>
              <p style={{ color: '#1a1a1a' }}>Informations de votre compte utilisateur :</p>
              <ul style={{ color: '#1a1a1a' }}>
                <li><strong>Nom :</strong> Utilisateur Studio du Cap Brun</li>
                <li><strong>Email :</strong> user@studioducapbrun.com</li>
                <li><strong>Statut :</strong> Administrateur</li>
                <li><strong>Dernière connexion :</strong> Aujourd'hui</li>
              </ul>
              <button 
                className="generate-btn" 
                style={{ margin: '20px 0', background: '#dc3545' }} 
                onClick={confirmDisconnect}
              >
                <i className="fas fa-sign-out-alt"></i>
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminPanel;