import { useEffect, useState } from 'react';

export const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
      // Notify other hook instances in the same window
      const evt = new CustomEvent('localStorage:update', { detail: { key } });
      window.dispatchEvent(evt);
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  // Keep in sync when storage changes elsewhere or when our custom event fires
  useEffect(() => {
    const refresh = () => {
      try {
        const item = window.localStorage.getItem(key);
        const parsed = item ? JSON.parse(item) : initialValue;
        setStoredValue(parsed);
      } catch (e) {
        // ignore
      }
    };
    const onStorage = (e) => {
      if (e.key === key) refresh();
    };
    const onCustom = (e) => {
      if (e.detail?.key === key) refresh();
    };
    window.addEventListener('storage', onStorage);
    window.addEventListener('localStorage:update', onCustom);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('localStorage:update', onCustom);
    };
  }, [key, initialValue]);

  return [storedValue, setValue];
};

// Hook spécifique pour la sauvegarde automatique de l'assistant
export const useAssistantAutoSave = () => {
  const defaultAutoSave = {
    projectTitle: '',
    targetAudience: '',
    projectDescription: '',
    contentInput: '',
    selectedAI: null,
    timestamp: null,
    // Nouvelles données de compte
    username: '',
    email: '',
    firstName: '',
    lastName: '',
    company: '',
    language: 'fr',
    notifications: true,
    autoSave: true,
    theme: 'auto',
    // Données API
    apiKeys: {
      openai: '',
      anthropic: '',
      gemini: '',
      deepseek: '',
      grok: '',
      kimi: '',
      twitter: '',
      facebook: '',
      linkedin: '',
      instagram: '',
      blog: '',
      website: ''
    }
  };
  const [autoSaveData, setAutoSaveData] = useLocalStorage('assistantRedacteur_autoSave', defaultAutoSave);

  // Migration: garantir la présence de toutes les clés attendues (y compris apiKeys)
  useEffect(() => {
    const merged = {
      ...defaultAutoSave,
      ...autoSaveData,
      apiKeys: {
        ...defaultAutoSave.apiKeys,
        ...(autoSaveData?.apiKeys || {})
      }
    };
    // Mettre à jour le stockage si le schéma a évolué
    try {
      const a = JSON.stringify(merged);
      const b = JSON.stringify(autoSaveData);
      if (a !== b) {
        setAutoSaveData(merged);
      }
    } catch {
      setAutoSaveData(merged);
    }
  }, [autoSaveData, setAutoSaveData]);

  const updateAutoSave = (updates) => {
    setAutoSaveData(prev => ({
      ...prev,
      ...updates,
      timestamp: new Date().toISOString()
    }));
  };

  const clearAutoSave = () => {
    setAutoSaveData({
      projectTitle: '',
      targetAudience: '',
      projectDescription: '',
      contentInput: '',
      selectedAI: null,
      timestamp: null
    });
  };

  const updateApiKey = (service, key) => {
    setAutoSaveData(prev => ({
      ...prev,
      apiKeys: {
        ...prev.apiKeys,
        [service]: key
      },
      timestamp: new Date().toISOString()
    }));
  };

  const testApiKey = async (service, key) => {
    if (!key || key.length < 10) {
      return {
        success: false,
        message: 'Clé trop courte (minimum 10 caractères)',
        valid: false
      };
    }

    // Simulation de tests spécifiques selon le service
    return new Promise((resolve) => {
      setTimeout(() => {
        let result;
        
        switch(service) {
          case 'openai':
            result = key.startsWith('sk-') && key.length > 30;
            break;
          case 'anthropic':
            result = key.startsWith('sk-ant-') && key.length > 40;
            break;
          case 'gemini':
            result = key.startsWith('AIza') && key.length > 30;
            break;
          case 'twitter':
            result = key.includes('Bearer ') || key.length > 40;
            break;
          case 'facebook':
            result = key.includes('EA') && key.length > 30;
            break;
          case 'linkedin':
            result = key.includes('AQ') && key.length > 30;
            break;
          default:
            result = key.length > 20; // Validation générique pour les autres services
        }

        resolve({
          success: true,
          message: result ?
            `✅ Clé ${service} valide` :
            `❌ Format de clé ${service} invalide`,
          valid: result
        });
      }, 1500);
    });
  };

  return {
    autoSaveData,
    updateAutoSave,
    clearAutoSave,
    updateApiKey,
    testApiKey
  };
};