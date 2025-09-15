// Mock pour useLocalStorage pour les tests Jest
import { useState, useCallback } from 'react';

const mockUseLocalStorage = (key, initialValue) => {
  const [value, setValue] = useState(initialValue);
  
  return [value, setValue];
};

export const useLocalStorage = mockUseLocalStorage;

export const useAssistantAutoSave = () => {
  const [autoSaveData, setAutoSaveData] = useState({
    projectTitle: '',
    targetAudience: '',
    projectDescription: '',
    contentInput: '',
    selectedAI: null,
    timestamp: null
  });

  const updateAutoSave = useCallback((updates) => {
    setAutoSaveData(prev => ({
      ...prev,
      ...updates,
      timestamp: new Date().toISOString()
    }));
  }, []);

  const clearAutoSave = useCallback(() => {
    setAutoSaveData({
      projectTitle: '',
      targetAudience: '',
      projectDescription: '',
      contentInput: '',
      selectedAI: null,
      timestamp: null
    });
  }, []);

  return {
    autoSaveData,
    updateAutoSave,
    clearAutoSave
  };
};