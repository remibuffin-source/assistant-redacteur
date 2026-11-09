import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate, Link } from 'react-router-dom';
import MenuBar from './MenuBar';
import './LoginPage.css';

const LoginPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    username: '',
    company: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(null);
  const [showEmailExistsMessage, setShowEmailExistsMessage] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
    setShowEmailExistsMessage(false);

    // Vérifier la force du mot de passe en temps réel
    if (field === 'password') {
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      let result;

      if (isLogin) {
        result = await login(formData.email, formData.password);
      } else {
        if (formData.password !== formData.confirmPassword) {
          throw new Error('Les mots de passe ne correspondent pas');
        }

        if (!validatePasswordStrength(formData.password).isValid) {
          throw new Error('Le mot de passe ne respecte pas les critères de sécurité');
        }

        result = await register(formData);
      }

      if (result.success) {
        if (isLogin) {
          navigate('/');
        } else {
          // Inscription réussie, redirection vers la vérification par email avec le code
          const codeParam = result.verificationCode ? `&code=${result.verificationCode}` : '';
          navigate(`/verify-email?email=${encodeURIComponent(formData.email)}${codeParam}`);
        }
      } else {
        setError(result.error);
        
        // Si l'email existe déjà, afficher un message spécial avec lien de réinitialisation
        if (result.error && result.error.includes('déjà utilisée')) {
          setShowEmailExistsMessage(true);
        }
      }
    } catch (error) {
      setError(error.message);
      
      // Si l'email existe déjà, afficher un message spécial avec lien de réinitialisation
      if (error.message && error.message.includes('déjà utilisée')) {
        setShowEmailExistsMessage(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setShowEmailExistsMessage(false);
    setFormData({
      email: '',
      password: '',
      confirmPassword: '',
      firstName: '',
      lastName: '',
      username: '',
      company: ''
    });
  };

  return (
    <div className="page-container">
      <MenuBar onHelp={() => {}} />
      <div className="page-content">
        <div className="login-page">
          <div className="login-container">
            <div className="login-header">
              <img src="/Studio du Cap Brun.png" alt="Studio du Cap Brun" className="login-logo" />
              <h1>{isLogin ? 'Connexion' : 'Inscription'}</h1>
              <p>{isLogin ? 'Connectez-vous à votre compte' : 'Créez votre compte'}</p>
            </div>

            <form onSubmit={handleSubmit} className="login-form">
              {error && (
                <div className="alert alert-error">
                  <i className="fas fa-exclamation-circle"></i>
                  {error}
                  {showEmailExistsMessage && (
                    <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(220, 53, 69, 0.3)' }}>
                      <p style={{ marginBottom: '0.5rem' }}>
                        Vous avez déjà un compte avec cet email ?
                      </p>
                      <Link 
                        to={`/reset-password?email=${encodeURIComponent(formData.email)}`}
                        className="reset-link-inline"
                        style={{
                          color: '#d9534f',
                          fontWeight: '600',
                          textDecoration: 'underline',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.5rem'
                        }}
                      >
                        <i className="fas fa-key"></i>
                        Réinitialiser votre mot de passe
                      </Link>
                    </div>
                  )}
                </div>
              )}

              {!isLogin && (
                <>
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="firstName">Prénom</label>
                      <input
                        type="text"
                        id="firstName"
                        value={formData.firstName}
                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                        placeholder="Votre prénom"
                        required={!isLogin}
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="lastName">Nom</label>
                      <input
                        type="text"
                        id="lastName"
                        value={formData.lastName}
                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                        placeholder="Votre nom"
                        required={!isLogin}
                      />
                    </div>
                  </div>
                </>
              )}

              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="votre@email.com"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">Mot de passe</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    placeholder={isLogin ? 'Votre mot de passe' : 'Créez un mot de passe (min. 8 caractères)'}
                    required
                    style={{ paddingRight: '45px' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="password-toggle-btn"
                    title={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                  >
                    <i className={`fas fa-eye${showPassword ? '-slash' : ''}`}></i>
                  </button>
                </div>
              </div>

              {!isLogin && (
                <div className="form-group">
                  <label htmlFor="confirmPassword">Confirmer le mot de passe</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      id="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                      placeholder="Confirmez votre mot de passe"
                      required={!isLogin}
                      style={{ paddingRight: '45px' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="password-toggle-btn"
                      title={showConfirmPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                    >
                      <i className={`fas fa-eye${showConfirmPassword ? '-slash' : ''}`}></i>
                    </button>
                  </div>
                </div>
              )}

              <button
                type="submit"
                className={`btn-login ${isLoading ? 'loading' : ''}`}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="loader"></div>
                    {isLogin ? 'Connexion...' : 'Inscription...'}
                  </>
                ) : (
                  <>
                    <i className={`fas fa-${isLogin ? 'sign-in-alt' : 'user-plus'}`}></i>
                    {isLogin ? 'Se connecter' : 'Créer un compte'}
                  </>
                )}
              </button>
            </form>

            <div className="login-footer">
              <p>
                {isLogin ? 'Pas encore de compte ? ' : 'Déjà un compte ? '}
                <button type="button" onClick={toggleMode} className="link-button">
                  {isLogin ? 'Créer un compte' : 'Se connecter'}
                </button>
              </p>

              {isLogin && (
                <Link to="/reset-password" className="forgot-password">
                  Mot de passe oublié ?
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;