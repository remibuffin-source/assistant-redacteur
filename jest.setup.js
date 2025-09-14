// Configuration de setup pour Jest
import '@testing-library/jest-dom';

// Mock pour import.meta.env utilisé par Vite
global.import_meta = global.import_meta || {};
global.import_meta.env = {
  VITE_OPENAI_API_KEY: 'test-api-key',
  MODE: 'test',
  DEV: true,
  PROD: false
};

// Mock global pour les tests
global.import = {
  meta: global.import_meta
};