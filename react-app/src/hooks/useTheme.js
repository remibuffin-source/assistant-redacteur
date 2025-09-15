import { useState, useEffect } from 'react';

export const useTheme = () => {
  const [currentTheme, setCurrentTheme] = useState(() => {
    // Récupérer le thème sauvegardé ou utiliser 'dark' par défaut
    return localStorage.getItem('theme') || 'dark';
  });

  const toggleTheme = () => {
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    setCurrentTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  useEffect(() => {
    // Appliquer le thème au body
    document.body.setAttribute('data-theme', currentTheme);
  }, [currentTheme]);

  return {
    currentTheme,
    toggleTheme,
    isDark: currentTheme === 'dark',
    isLight: currentTheme === 'light'
  };
};