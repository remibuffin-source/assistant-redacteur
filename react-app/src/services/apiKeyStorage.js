/**
 * Service de sauvegarde sécurisée des clés API
 * Gère le stockage local et la synchronisation avec le serveur
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Sauvegarde les clés API sur le serveur
 * @param {Object} apiKeys - Clés API à sauvegarder
 * @param {string} userId - ID de l'utilisateur
 * @returns {Promise<{success: boolean, message: string}>}
 */
export async function saveApiKeysToServer(apiKeys, userId) {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/api-keys`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`
      },
      body: JSON.stringify({
        userId,
        apiKeys,
        timestamp: new Date().toISOString()
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erreur lors de la sauvegarde');
    }

    const data = await response.json();
    return {
      success: true,
      message: '✅ Clés sauvegardées sur le serveur avec succès'
    };
  } catch (error) {
    console.error('Erreur sauvegarde serveur:', error);
    return {
      success: false,
      message: `❌ ${error.message || 'Erreur de connexion au serveur'}`
    };
  }
}

/**
 * Récupère les clés API depuis le serveur
 * @param {string} userId - ID de l'utilisateur
 * @returns {Promise<Object>} Clés API
 */
export async function loadApiKeysFromServer(userId) {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/api-keys/${userId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`
      }
    });

    if (!response.ok) {
      throw new Error('Erreur lors du chargement des clés');
    }

    const data = await response.json();
    return data.apiKeys || {};
  } catch (error) {
    console.error('Erreur chargement serveur:', error);
    return null;
  }
}

/**
 * Sauvegarde les clés API en local (localStorage)
 * @param {Object} apiKeys - Clés API à sauvegarder
 */
export function saveApiKeysLocally(apiKeys) {
  try {
    localStorage.setItem('config_api_keys', JSON.stringify(apiKeys));
    return { success: true };
  } catch (error) {
    console.error('Erreur sauvegarde locale:', error);
    return { success: false, message: 'Erreur de sauvegarde locale' };
  }
}

/**
 * Charge les clés API depuis le localStorage
 * @returns {Object} Clés API
 */
export function loadApiKeysLocally() {
  try {
    const stored = localStorage.getItem('config_api_keys');
    return stored ? JSON.parse(stored) : getDefaultApiKeys();
  } catch (error) {
    console.error('Erreur chargement local:', error);
    return getDefaultApiKeys();
  }
}

/**
 * Synchronise les clés entre local et serveur
 * @param {Object} apiKeys - Clés API
 * @param {string} userId - ID utilisateur
 */
export async function syncApiKeys(apiKeys, userId) {
  // Sauvegarde locale immédiate
  saveApiKeysLocally(apiKeys);
  
  // Sauvegarde serveur en arrière-plan
  if (userId) {
    return await saveApiKeysToServer(apiKeys, userId);
  }
  
  return { success: true, message: 'Sauvegardé localement' };
}

/**
 * Récupère le token d'authentification
 */
function getAuthToken() {
  const authData = localStorage.getItem('auth_user');
  if (authData) {
    const { token } = JSON.parse(authData);
    return token;
  }
  return null;
}

/**
 * Retourne les clés API par défaut (vides)
 */
function getDefaultApiKeys() {
  return {
    openai: '',
    'openai-mini': '',
    anthropic: '',
    'anthropic-haiku': '',
    gemini: '',
    'gemini-pro': '',
    deepseek: '',
    'deepseek-v3': '',
    grok: '',
    'grok-2': '',
    deepl: '',
    kimi: '',
    mistral: '',
    whisper: '',
    'gpt-vision': '',
    elevenlabs: '',
    twitter: '',
    facebook: '',
    linkedin: '',
    instagram: '',
    blog: '',
    website: ''
  };
}

/**
 * Chiffre une clé API pour stockage sécurisé (optionnel)
 * @param {string} apiKey - Clé à chiffrer
 * @returns {string} Clé chiffrée
 */
export function encryptApiKey(apiKey) {
  // TODO: Implémenter un vrai chiffrement si nécessaire
  // Pour l'instant, retourne la clé telle quelle
  // En production, utiliser crypto-js ou similaire
  return apiKey;
}

/**
 * Déchiffre une clé API
 * @param {string} encryptedKey - Clé chiffrée
 * @returns {string} Clé déchiffrée
 */
export function decryptApiKey(encryptedKey) {
  // TODO: Implémenter le déchiffrement correspondant
  return encryptedKey;
}
