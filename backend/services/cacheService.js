import { logger } from '../utils/logger.js';

/**
 * Service de cache simple en mémoire pour remplacer Redis
 * Pour une application en production, considérez d'utiliser Redis ou Memcached
 */
class CacheService {
  constructor() {
    this.cache = new Map();
    this.ttlTimers = new Map();
  }

  /**
   * Définir une valeur dans le cache avec TTL optionnel
   * @param {string} key - Clé du cache
   * @param {any} value - Valeur à stocker
   * @param {number} ttl - Temps de vie en secondes (optionnel)
   */
  set(key, value, ttl = null) {
    try {
      // Nettoyer le timer existant si présent
      if (this.ttlTimers.has(key)) {
        clearTimeout(this.ttlTimers.get(key));
      }

      // Stocker la valeur
      this.cache.set(key, {
        value,
        createdAt: Date.now()
      });

      // Définir un TTL si spécifié
      if (ttl) {
        const timer = setTimeout(() => {
          this.delete(key);
        }, ttl * 1000);
        this.ttlTimers.set(key, timer);
      }

      return true;
    } catch (error) {
      logger.error(`Erreur lors de la mise en cache de ${key}:`, error);
      return false;
    }
  }

  /**
   * Récupérer une valeur du cache
   * @param {string} key - Clé du cache
   * @returns {any} Valeur ou null si non trouvée
   */
  get(key) {
    try {
      const item = this.cache.get(key);
      return item ? item.value : null;
    } catch (error) {
      logger.error(`Erreur lors de la récupération du cache ${key}:`, error);
      return null;
    }
  }

  /**
   * Vérifier si une clé existe dans le cache
   * @param {string} key - Clé du cache
   * @returns {boolean}
   */
  has(key) {
    return this.cache.has(key);
  }

  /**
   * Supprimer une valeur du cache
   * @param {string} key - Clé du cache
   * @returns {boolean}
   */
  delete(key) {
    try {
      // Nettoyer le timer si présent
      if (this.ttlTimers.has(key)) {
        clearTimeout(this.ttlTimers.get(key));
        this.ttlTimers.delete(key);
      }

      return this.cache.delete(key);
    } catch (error) {
      logger.error(`Erreur lors de la suppression du cache ${key}:`, error);
      return false;
    }
  }

  /**
   * Vider tout le cache
   */
  clear() {
    try {
      // Nettoyer tous les timers
      for (const timer of this.ttlTimers.values()) {
        clearTimeout(timer);
      }
      this.ttlTimers.clear();
      this.cache.clear();
      logger.info('✅ Cache vidé');
      return true;
    } catch (error) {
      logger.error('Erreur lors du vidage du cache:', error);
      return false;
    }
  }

  /**
   * Obtenir toutes les clés du cache
   * @returns {Array<string>}
   */
  keys() {
    return Array.from(this.cache.keys());
  }

  /**
   * Obtenir la taille du cache
   * @returns {number}
   */
  size() {
    return this.cache.size;
  }

  /**
   * Wrapper pour les appels API avec cache
   * @param {string} key - Clé du cache
   * @param {Function} fn - Fonction à exécuter si cache manquant
   * @param {number} ttl - Temps de vie en secondes
   * @returns {Promise<any>}
   */
  async wrap(key, fn, ttl = 300) {
    try {
      // Vérifier si la valeur est en cache
      if (this.has(key)) {
        logger.debug(`✅ Cache hit: ${key}`);
        return this.get(key);
      }

      // Exécuter la fonction et mettre en cache
      logger.debug(`❌ Cache miss: ${key}`);
      const result = await fn();
      this.set(key, result, ttl);
      return result;
    } catch (error) {
      logger.error(`Erreur dans cache.wrap pour ${key}:`, error);
      throw error;
    }
  }

  /**
   * Nettoyer les entrées expirées (appelé périodiquement)
   */
  cleanup() {
    const now = Date.now();
    let cleaned = 0;

    for (const [key, item] of this.cache.entries()) {
      // Supprimer les entrées de plus de 1 heure sans TTL
      if (!this.ttlTimers.has(key) && (now - item.createdAt) > 3600000) {
        this.delete(key);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      logger.info(`🧹 Cache nettoyé: ${cleaned} entrées supprimées`);
    }
  }
}

// Instance singleton
const cacheService = new CacheService();

// Nettoyer le cache toutes les 10 minutes
setInterval(() => {
  cacheService.cleanup();
}, 600000);

export default cacheService;
