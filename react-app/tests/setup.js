import '@testing-library/jest-dom';

// Configuration globale pour les tests
beforeAll(async () => {
  // Configuration globale pour tous les tests
});

afterAll(async () => {
  // Nettoyage après tous les tests
});

// Configuration pour les tests React
import { configure } from '@testing-library/react';

// Configurer Testing Library
configure({
  testIdAttribute: 'data-testid',
});

// Mock des modules externes si nécessaire
jest.mock('../src/services/apiService', () => ({
  apiService: {
    getPublications: jest.fn(),
    createPublication: jest.fn(),
    updatePublication: jest.fn(),
    deletePublication: jest.fn(),
    getOAuthStatus: jest.fn(),
    getSocialAccounts: jest.fn()
  }
}));

// Mock du router React
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
  useLocation: () => ({ pathname: '/' }),
}));

// Mock du localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

global.localStorage = localStorageMock;

// Mock de window.matchMedia pour les tests de thème
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});
