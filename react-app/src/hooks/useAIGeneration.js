import { useState, useCallback } from 'react';
import AIService from '../services/aiService';

export const useAIGeneration = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const generateContent = useCallback(async (aiType, data) => {
    if (!aiType) {
      setError('Veuillez sélectionner une IA');
      return;
    }

    if (!data.content) {
      setError('Veuillez entrer du contenu à traiter');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const generationResult = await AIService.generateContent(aiType, data);
      
      if (generationResult.success) {
        setResult(generationResult);
      } else {
        // Gestion spécifique des erreurs OpenAI
        let errorMessage = generationResult.error || 'Erreur lors de la génération du contenu';
        
        // Messages d'erreur plus informatifs
        if (errorMessage.includes('OpenAI')) {
          if (errorMessage.includes('401')) {
            errorMessage = 'Clé API OpenAI invalide. Vérifiez votre configuration dans .env.local';
          } else if (errorMessage.includes('429')) {
            errorMessage = 'Quota OpenAI dépassé. Veuillez réessayer plus tard ou vérifier votre abonnement.';
          } else if (errorMessage.includes('Failed to deserialize')) {
            errorMessage = 'Erreur de formatage des données OpenAI. Le contenu peut être trop long ou mal formaté.';
          }
        }
        
        setError(errorMessage);
        setResult({
          success: false,
          error: errorMessage,
          // Fournir un contenu simulé en cas d'erreur
          content: generationResult.content || 'Impossible de générer du contenu en raison d\'une erreur technique.'
        });
      }
    } catch (err) {
      console.error('Erreur dans useAIGeneration:', err);
      
      let errorMessage = err.message || 'Erreur lors de la génération du contenu';
      
      // Détection spécifique des erreurs de réseau
      if (errorMessage.includes('Failed to fetch') || errorMessage.includes('NetworkError')) {
        errorMessage = 'Erreur de connexion. Vérifiez votre connexion internet.';
      }
      
      setError(errorMessage);
      setResult({
        success: false,
        error: errorMessage,
        content: 'Erreur technique lors de la génération. Veuillez réessayer.'
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  const copyToClipboard = useCallback(async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      console.error('Erreur lors de la copie:', err);
      return false;
    }
  }, []);

  const downloadResult = useCallback((content, filename = 'contenu-genere.txt') => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, []);

  const reset = useCallback(() => {
    setIsLoading(false);
    setResult(null);
    setError(null);
  }, []);

  return {
    isLoading,
    result,
    error,
    generateContent,
    copyToClipboard,
    downloadResult,
    reset
  };
};