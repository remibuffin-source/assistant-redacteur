import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import './DataDeletionStatus.css';

const DataDeletionStatus = () => {
  const [searchParams] = useSearchParams();
  const confirmationId = searchParams.get('id');
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchDeletionStatus = async () => {
      if (!confirmationId) {
        setStatus('error');
        setMessage('Code de confirmation manquant.');
        return;
      }

      try {
        const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';
        const response = await fetch(`${API_BASE_URL}/data-deletion/deletion-status/${confirmationId}`);
        
        if (response.ok) {
          const data = await response.json();
          setStatus(data.status);
          setMessage(data.message);
        } else {
          setStatus('error');
          setMessage('Impossible de récupérer le statut de votre demande.');
        }
      } catch (error) {
        console.error('Error fetching deletion status:', error);
        setStatus('error');
        setMessage('Une erreur est survenue lors de la récupération du statut.');
      }
    };

    fetchDeletionStatus();
  }, [confirmationId]);

  const getStatusIcon = () => {
    switch (status) {
      case 'completed':
        return <i className="fas fa-check-circle status-icon success"></i>;
      case 'pending':
        return <i className="fas fa-clock status-icon pending"></i>;
      case 'error':
        return <i className="fas fa-exclamation-circle status-icon error"></i>;
      default:
        return <i className="fas fa-spinner fa-spin status-icon loading"></i>;
    }
  };

  const getStatusTitle = () => {
    switch (status) {
      case 'completed':
        return 'Suppression terminée';
      case 'pending':
        return 'Suppression en cours';
      case 'error':
        return 'Erreur';
      default:
        return 'Vérification en cours...';
    }
  };

  return (
    <div className="data-deletion-container">
      <div className="data-deletion-content">
        {getStatusIcon()}
        <h1 className="data-deletion-title">{getStatusTitle()}</h1>
        
        {confirmationId && (
          <div className="confirmation-code">
            <strong>Code de confirmation :</strong> {confirmationId}
          </div>
        )}

        <p className="status-message">{message}</p>

        {status === 'completed' && (
          <div className="info-box success">
            <i className="fas fa-info-circle"></i>
            <p>
              Toutes vos données liées à Facebook et Instagram ont été supprimées de nos serveurs.
              Cette action est irréversible.
            </p>
          </div>
        )}

        {status === 'pending' && (
          <div className="info-box pending">
            <i className="fas fa-info-circle"></i>
            <p>
              Votre demande de suppression est en cours de traitement. Cela peut prendre jusqu'à 48 heures.
              Vous recevrez un email de confirmation une fois la suppression terminée.
            </p>
          </div>
        )}

        {status === 'error' && (
          <div className="info-box error">
            <i className="fas fa-exclamation-triangle"></i>
            <p>
              Si le problème persiste, veuillez contacter notre support à l'adresse : 
              <a href="mailto:support@assistant-redacteur.fr"> support@assistant-redacteur.fr</a>
            </p>
          </div>
        )}

        <div className="data-deletion-footer">
          <a href="https://assistant-redacteur.fr" className="btn-home">
            <i className="fas fa-home"></i> Retour à l'accueil
          </a>
        </div>
      </div>
    </div>
  );
};

export default DataDeletionStatus;
