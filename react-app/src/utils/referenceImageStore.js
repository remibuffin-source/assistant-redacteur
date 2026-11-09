/**
 * Persistance des images de référence / pièces jointes dans IndexedDB.
 *
 * localStorage est limité à ~5 Mo : quelques photos en base64 suffisent à
 * dépasser le quota, et les fichiers étaient alors perdus au rechargement.
 * IndexedDB conserve les fichiers (base64 inclus) entre les sessions.
 */

const DB_NAME = 'assistantRedacteur';
const DB_VERSION = 1;
const STORE_NAME = 'attachedFiles';
const KEY = 'home';
const PRESET_PREFIX = 'preset:';

/**
 * Garantit qu'un fichier possède une source d'affichage exploitable
 * (dataUrl ou base64), y compris pour les objets restaurés depuis le serveur.
 */
export function normalizeAttachedFiles(files) {
  if (!Array.isArray(files)) return [];
  return files.map(file => {
    if (!file || typeof file !== 'object') return file;
    return {
      ...file,
      dataUrl: file.dataUrl || file.base64 || undefined
    };
  });
}

function openDb() {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB non disponible'));
      return;
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveAttachedFiles(files) {
  try {
    const db = await openDb();
    await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      tx.objectStore(STORE_NAME).put(files, KEY);
      tx.oncomplete = resolve;
      tx.onerror = () => reject(tx.error);
    });
    db.close();
  } catch (error) {
    console.warn('Impossible de sauvegarder les pièces jointes dans IndexedDB:', error);
  }
}

export async function loadAttachedFiles() {
  try {
    const db = await openDb();
    const files = await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const request = tx.objectStore(STORE_NAME).get(KEY);
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
    db.close();
    return normalizeAttachedFiles(files);
  } catch (error) {
    console.warn('Impossible de charger les pièces jointes depuis IndexedDB:', error);
    return [];
  }
}

/**
 * Sauvegarde les pièces jointes d'un préréglage / modèle complet.
 * IndexedDB conserve le base64, les rôles (style/décor/sujet) et la force,
 * ce que les métadonnées serveur ne restituent pas.
 */
export async function savePresetFiles(presetId, files) {
  if (!presetId) return;
  try {
    const db = await openDb();
    await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      tx.objectStore(STORE_NAME).put(normalizeAttachedFiles(files), PRESET_PREFIX + presetId);
      tx.oncomplete = resolve;
      tx.onerror = () => reject(tx.error);
    });
    db.close();
  } catch (error) {
    console.warn('Impossible de sauvegarder les pièces jointes du préréglage:', error);
  }
}

export async function loadPresetFiles(presetId) {
  if (!presetId) return [];
  try {
    const db = await openDb();
    const files = await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const request = tx.objectStore(STORE_NAME).get(PRESET_PREFIX + presetId);
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
    db.close();
    return normalizeAttachedFiles(files);
  } catch (error) {
    console.warn('Impossible de charger les pièces jointes du préréglage:', error);
    return [];
  }
}

export async function deletePresetFiles(presetId) {
  if (!presetId) return;
  try {
    const db = await openDb();
    await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      tx.objectStore(STORE_NAME).delete(PRESET_PREFIX + presetId);
      tx.oncomplete = resolve;
      tx.onerror = () => reject(tx.error);
    });
    db.close();
  } catch (error) {
    console.warn('Impossible de supprimer les pièces jointes du préréglage:', error);
  }
}

export async function clearAttachedFiles() {
  try {
    const db = await openDb();
    await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      tx.objectStore(STORE_NAME).delete(KEY);
      tx.oncomplete = resolve;
      tx.onerror = () => reject(tx.error);
    });
    db.close();
  } catch (error) {
    console.warn('Impossible de vider les pièces jointes IndexedDB:', error);
  }
}
