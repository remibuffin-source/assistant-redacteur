import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import MenuBar from './MenuBar';
import './ResetPassword.css';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const [step, setStep] = useState(1); // 1: email, 2: code + nouveau mot de passe
  const [formData, setFormData] = useState({
    email: '',
    code: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Pré-remplir l'email s'il est passé dans l'URL
  useEffect(() => {
    const emailFromUrl = searchParams.get('email');
    if (emailFromUrl) {
      setFormData(prev => ({ ...prev, email: emailFromUrl }));
    }
  }, [searchParams]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(null);
  const [generatedCode, setGeneratedCode] = useState(''); // Code affiché directement

  const { requestPasswordReset, resetPassword } = useAuth();
  const navigate = useNavigate();

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
    setSuccess('');

    // Vérifier la force du mot de passe en temps réel
    if (field === 'newPassword') {
      const strength = validatePasswordStrength(value);
      setPasswordStrength(strength);
    }
  };

  const validatePasswordStrength = (password) => {
    const errors = [];

    if (password.length < 8) {
      errors.push('Au moins 8 caractères');
    }

    if (!/(?=.*[a-z])/.test(password)) {
      errors.push('Une minuscule');
    }

    if (!/(?=.*[A-Z])/.test(password)) {
      errors.push('Une majuscule');
    }

    if (!/(?=.*\d)/.test(password)) {
      errors.push('Un chiffre');
    }

    if (!/(?=.*[@$!%*?&])/.test(password)) {
      errors.push('Un caractère spécial');
    }

    return {
      isValid: errors.length === 0,
      errors,
      score: Math.max(0, 5 - errors.length)
    };
  };

  const handleRequestReset = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const result = await requestPasswordReset(formData.email);
      
      if (result.success) {
        setSuccess(result.message);
        setGeneratedCode(result.code || ''); // Stocker le code généré
        setStep(2);
      } else {
        setError(result.error || 'Une erreur est survenue');
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      if (formData.newPassword !== formData.confirmPassword) {
        throw new Error('Les mots de passe ne correspondent pas');
      }

      if (!validatePasswordStrength(formData.newPassword).isValid) {
        throw new Error('Le mot de passe ne respecte pas les critères de sécurité');
      }

      const result = await resetPassword(formData.email, formData.code, formData.newPassword);
      
      if (result.success) {
        setSuccess(result.message);
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        setError(result.error || 'Une erreur est survenue');
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="page-container">
      <MenuBar onHelp={() => {}} />
      <div className="page-content">
        <div className="reset-password-page">
          <div className="reset-container">
            <div className="reset-header">
              <img src="/Studio du Cap Brun.png" alt="Studio du Cap Brun" className="reset-logo" />
              <h1>Réinitialisation du mot de passe</h1>
              <p>
                {step === 1 
                  ? 'Entrez votre adresse email pour recevoir un code de réinitialisation'
                  : 'Entrez le code reçu par email et votre nouveau mot de passe'
                }
              </p>
            </div>

            {error && (
              <div className="alert alert-error">
                <i className="fas fa-exclamation-circle"></i>
                {error}
              </div>
            )}

            {success && (
              <div className="alert alert-success">
                <i className="fas fa-check-circle"></i>
                {success}
              </div>
            )}

            {step === 1 ? (
              <form onSubmit={handleRequestReset} className="reset-form">
                <div className="form-group">
                  <label htmlFor="email">Adresse email</label>
                  <input
                    type="email"
                    id="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="votre@email.com"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className={`btn-reset ${isLoading ? 'loading' : ''}`}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <div className="loader"></div>
                      Envoi en cours...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-paper-plane"></i>
                      Envoyer le code
                    </>
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={handleResetPassword} className="reset-form">
                {generatedCode && (
                  <div className="code-display-box">
                    <div className="code-display-header">
                      <i className="fas fa-key"></i>
                      <strong>Votre code de vérification :</strong>
                    </div>
                    <div className="code-display-value">{generatedCode}</div>
                    <small className="code-display-hint">
                      Copiez ce code et collez-le dans le champ ci-dessous
                    </small>
                  </div>
                )}

                <div className="form-group">
                  <label htmlFor="code">Code de vérification</label>
                  <input
                    type="text"
                    id="code"
                    value={formData.code}
                    onChange={(e) => handleInputChange('code', e.target.value)}
                    placeholder="Entrez le code à 6 chiffres"
                    maxLength="6"
                    required
                  />
                  <small className="form-hint">
                    {generatedCode ? 'Copiez le code affiché ci-dessus' : 'Vérifiez votre boîte email et vos spams'}
                  </small>
                </div>

                <div className="form-group">
                  <label htmlFor="newPassword">Nouveau mot de passe</label>
                  <input
                    type="password"
                    id="newPassword"
                    value={formData.newPassword}
                    onChange={(e) => handleInputChange('newPassword', e.target.value)}
                    placeholder="Créez un mot de passe sécurisé"
                    required
                  />
                  {passwordStrength && !passwordStrength.isValid && (
                    <div className="password-requirements">
                      <small>Le mot de passe doit contenir :</small>
                      <ul>
                        {passwordStrength.errors.map((err, idx) => (
                          <li key={idx}>{err}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="confirmPassword">Confirmer le mot de passe</label>
                  <input
                    type="password"
                    id="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    placeholder="Confirmez votre mot de passe"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className={`btn-reset ${isLoading ? 'loading' : ''}`}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <div className="loader"></div>
                      Réinitialisation...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-key"></i>
                      Réinitialiser le mot de passe
                    </>
                  )}
                </button>
              </form>
            )}

            <div className="reset-footer">
              <Link to="/login" className="back-to-login">
                <i className="fas fa-arrow-left"></i>
                Retour à la connexion
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
