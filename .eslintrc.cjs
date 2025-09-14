module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
    jest: true
  },
  extends: [
    'eslint:recommended',
    '@react-native',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended'
  ],
  parserOptions: {
    ecmaFeatures: {
      jsx: true
    },
    ecmaVersion: 'latest',
    sourceType: 'module'
  },
  plugins: [
    'react',
    'react-hooks'
  ],
  rules: {
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'off',
    'no-unused-vars': ['error', { 
      'varsIgnorePattern': '^[A-Z_]',
      'argsIgnorePattern': '^_'
    }],
    'no-undef': 'error'
  },
  settings: {
    react: {
      version: 'detect'
    }
  },
  overrides: [
    {
      files: ['**/__tests__/**/*', '**/*.test.js', '**/*.test.jsx'],
      env: {
        jest: true
      },
      rules: {
        'no-undef': 'off',
        'no-unused-vars': 'off'
      }
    },
    {
      files: ['**/__mocks__/**/*', 'jest.config.cjs', 'jest.setup.cjs', 'babel.config.cjs'],
      env: {
        node: true
      },
      rules: {
        'no-undef': 'off'
      }
    }
  ]
};