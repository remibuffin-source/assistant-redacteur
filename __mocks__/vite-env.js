// Mock pour import.meta.env utilisé par Vite
const mockEnv = {
  VITE_OPENAI_API_KEY: 'test-api-key',
  MODE: 'test',
  DEV: true,
  PROD: false
};

// Mock global pour import.meta
global.import_meta = {
  env: mockEnv
};

// Mock pour les tests Jest
module.exports = mockEnv;