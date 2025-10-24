{
  "name": "assistant-redacteur-frontend-tests",
  "version": "1.0.0",
  "description": "Tests for Assistant Rédacteur Frontend",
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:e2e": "jest --testPathPattern=e2e",
    "test:unit": "jest --testPathPattern=unit",
    "test:coverage": "jest --coverage"
  },
  "jest": {
    "testEnvironment": "node",
    "preset": "jest-puppeteer",
    "testMatch": [
      "**/tests/**/*.test.js",
      "**/__tests__/**/*.js"
    ],
    "collectCoverageFrom": [
      "src/**/*.{js,jsx}",
      "!src/index.js",
      "!src/reportWebVitals.js",
      "!src/**/*.test.{js,jsx}"
    ],
    "coverageDirectory": "coverage",
    "coverageReporters": [
      "text",
      "lcov",
      "html"
    ],
    "setupFilesAfterEnv": [
      "<rootDir>/tests/setup.js"
    ]
  },
  "devDependencies": {
    "@testing-library/jest-dom": "^5.16.5",
    "@testing-library/react": "^13.4.0",
    "@testing-library/user-event": "^14.4.3",
    "jest": "^29.6.4",
    "jest-environment-jsdom": "^29.6.4",
    "jest-puppeteer": "^6.1.1",
    "puppeteer": "^21.3.8"
  }
}
