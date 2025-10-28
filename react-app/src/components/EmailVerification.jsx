import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { authService } from '../services/authService';
import './EmailVerification.css';

const EmailVerification = () => {
  const [verificationCode, setVerificationCode] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const email = searchParams.get('email');
  const displayCode = searchParams.get('code'); // Code passé depuis l'inscription

  const handleInputChange = (value) => {
    setVerificationCode(value);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (!verificationCode.trim()) {
      setError('Veuillez saisir le code de vérification');
      setIsLoading(false);
      return;
    }

    if (verificationCode.length !== 6) {
      setError('Le code de vérification doit contenir 6 chiffres');
      setIsLoading(false);
      return;
    }

    try {
      const result = await authService.verifyEmailCode(email, verificationCode);

      if (result.success) {
        setIsSuccess(true);
        // Redirection automatique vers la page de connexion après 3 secondes
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    setIsLoading(true);
    setError('');

    try {
      // Récupérer les données utilisateur depuis le localStorage temporaire
      const tempUserData = localStorage.getItem('temp_registration_data');
      if (tempUserData) {
        const userData = JSON.parse(tempUserData);
        const result = await authService.register(userData);

        if (result.success) {
          setError('');
          alert('Un nouveau code de vérification a été envoyé à votre adresse email.');
        }
      } else {
        setError('Informations d\'inscription non trouvées. Veuillez recommencer l\'inscription.');
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!email) {
    return (
      <div className="email-verification-container">
        <div className="email-verification-card">
          <h2>Erreur</h2>
          <p>Aucune adresse email spécifiée. Veuillez recommencer l'inscription.</p>
          <Link to="/login" className="btn-primary">
            Retour à la connexion
          </Link>
        </div>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="email-verification-container">
        <div className="email-verification-card success">
          <div className="success-icon">✅</div>
          <h2>Email vérifié avec succès !</h2>
          <p>Votre compte a été activé. Vous allez être redirigé vers la page de connexion...</p>
          <Link to="/login" className="btn-primary">
            Aller à la connexion
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="email-verification-container">
      <div className="email-verification-card">
        <h2>Vérification de votre email</h2>
        <p>
          Nous avons envoyé un code de vérification à l'adresse <strong>{email}</strong>
        </p>


        <form onSubmit={handleSubmit} className="verification-form">
          <div className="form-group">
            <label htmlFor="verificationCode">Code de vérification (6 chiffres)</label>
            <input
              type="text"
              id="verificationCode"
              value={verificationCode}
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder="123456"
              maxLength="6"
              className="verification-input"
              disabled={isLoading}
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button
            type="submit"
            className="btn-primary"
            disabled={isLoading || verificationCode.length !== 6}
          >
            {isLoading ? 'Vérification...' : 'Vérifier le code'}
          </button>
        </form>

        <div className="resend-section">
          <p>Vous n'avez pas reçu le code ?</p>
          <button
            onClick={handleResendCode}
            className="btn-secondary"
            disabled={isLoading}
          >
            Renvoyer le code
          </button>
        </div>

        <div className="back-to-login">
          <Link to="/login">Retour à la connexion</Link>
        </div>
      </div>
    </div>
  );
};

export default EmailVerification;
