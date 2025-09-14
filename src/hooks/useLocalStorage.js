import { useState } from 'react';

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
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue];
};

// Hook spécifique pour la sauvegarde automatique de l'assistant
export const useAssistantAutoSave = () => {
  const [autoSaveData, setAutoSaveData] = useLocalStorage('assistantRedacteur_autoSave', {
    projectTitle: '',
    targetAudience: '',
    projectDescription: '',
    contentInput: '',
    selectedAI: null,
    timestamp: null
  });

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

  return {
    autoSaveData,
    updateAutoSave,
    clearAutoSave
  };
};