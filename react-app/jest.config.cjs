module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.cjs'],
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(gif|ttf|eot|svg|png)$': '<rootDir>/__mocks__/fileMock.js',
    '^../services/aiService$': '<rootDir>/__mocks__/aiService.js',
    '^src/services/aiService$': '<rootDir>/__mocks__/aiService.js',
    '^../hooks/useLocalStorage$': '<rootDir>/__mocks__/useLocalStorage.js',
    '^src/hooks/useLocalStorage$': '<rootDir>/__mocks__/useLocalStorage.js',
  },
  transform: {
    '^.+\.(js|jsx|ts|tsx)$': 'babel-jest',
  },
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
};