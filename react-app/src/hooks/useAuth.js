import { useState, useEffect } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { authService } from '../services/authService';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authData, setAuthData] = useLocalStorage('auth_data', {
    user: null,
    token: null
  });

  useEffect(() => {
    const initializeAuth = async () => {
      // Nettoyer les sessions et vérifications expirées
      authService.cleanupExpiredSessions();
      authService.cleanupExpiredVerifications();

      if (authData?.token) {
        // Vérifier la validité du token
        const userData = authService.verifyToken(authData.token);

        if (userData) {
          setUser(userData);
        } else {
          // Token invalide ou expiré
          setUser(null);
          setAuthData({ user: null, token: null });
        }
      }

      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    setIsLoading(true);

    try {
      const result = await authService.login(email, password);

      if (result.success) {
        setUser(result.user);
        setAuthData({
          user: result.user,
          token: result.token
        });

        return { success: true, user: result.user };
      } else {
        throw new Error(result.message || 'Erreur lors de la connexion');
      }
    } catch (error) {
      setIsLoading(false);
      return { success: false, error: error.message };
    }
  };

  const register = async (userData) => {
    setIsLoading(true);

    try {
      const result = await authService.register(userData);

      // Stocker temporairement les données pour la vérification par email
      if (result.success && result.requiresVerification) {
        localStorage.setItem('temp_registration_data', JSON.stringify(userData));
      }

      setIsLoading(false);
      return result;
    } catch (error) {
      setIsLoading(false);
      return { success: false, error: error.message };
    }
  };

  const verifyEmail = async (email, code) => {
    setIsLoading(true);

    try {
      const result = authService.verifyEmailCode(email, code);
      setIsLoading(false);
      return result;
    } catch (error) {
      setIsLoading(false);
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    if (authData?.token) {
      authService.logout(authData.token);
    }

    // Nettoyer les données temporaires
    localStorage.removeItem('temp_registration_data');

    setUser(null);
    setAuthData({
      user: null,
      token: null
    });
  };

  const updateUser = (updatedData) => {
    const updatedUser = { ...user, ...updatedData };
    setUser(updatedUser);
    setAuthData(prev => ({
      ...prev,
      user: updatedUser
    }));
  };

  const changePassword = async (currentPassword, newPassword) => {
    // Simulation de changement de mot de passe
    return { success: true };
  };

  const changeEmail = async (newEmail, password) => {
    if (!user) {
      return { success: false, error: 'Utilisateur non connecté' };
    }

    if (!newEmail || !password) {
      return { success: false, error: 'Email et mot de passe requis' };
    }

    // Simulation de vérification du mot de passe et changement d'email
    const updatedUser = { ...user, email: newEmail };
    setUser(updatedUser);
    setAuthData(prev => ({
      ...prev,
      user: updatedUser
    }));

    return { success: true, user: updatedUser };
  };

  const requestPasswordReset = async (email) => {
    try {
      const result = await authService.requestPasswordReset(email);
      return result;
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const resetPassword = async (email, code, newPassword) => {
    try {
      const result = await authService.resetPassword(email, code, newPassword);
      return result;
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  return {
    user,
    isLoading,
    login,
    register,
    verifyEmail,
    logout,
    updateUser,
    changePassword,
    changeEmail,
    requestPasswordReset,
    resetPassword,
    isAuthenticated: !!user
  };
};