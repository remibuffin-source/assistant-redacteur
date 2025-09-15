import js from '@eslint/js';
import globals from 'globals';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';

export default [
  js.configs.recommended,
  {
    ignores: ['dist/**', '**/*.config.cjs', '**/__mocks__/**']
  },
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.jest
      },
      parserOptions: {
        ecmaFeatures: {
          jsx: true
        }
      }
    },
    plugins: {
      react,
      'react-hooks': reactHooks
    },
    rules: {
      ...react.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      'react/no-unescaped-entities': 'off',
      'no-unused-vars': ['error', {
        varsIgnorePattern: '^[A-Z_]',
        argsIgnorePattern: '^_'
      }]
    },
    settings: {
      react: {
        version: 'detect'
      }
    }
  },
  {
    files: ['**/__tests__/**/*', '**/*.test.js', '**/*.test.jsx'],
    languageOptions: {
      globals: {
        ...globals.jest
      }
    },
    rules: {
      'no-unused-vars': 'off'
    }
  },
  {
    files: ['**/__mocks__/**/*', 'jest.config.cjs', 'jest.setup.cjs', 'babel.config.cjs'],
    languageOptions: {
      globals: {
        ...globals.node
      }
    }
  }
];
