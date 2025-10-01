// Jest configuration for unit tests
module.exports = {
  testEnvironment: 'jsdom',
  
  // Explicitly configure setup file - no more automatic loading!
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.js'],
  
  // Transform JS/JSX files with babel
  transform: {
    '^.+\\.(js|jsx)$': 'babel-jest',
  },
  
  // Module name mapper for CSS and asset files
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': '<rootDir>/__mocks__/styleMock.js',
    '\\.(jpg|jpeg|png|gif|svg)$': '<rootDir>/__mocks__/fileMock.js',
  },
  
  // Test match patterns
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.{js,jsx}',
    '<rootDir>/src/**/*.{spec,test}.{js,jsx}'
  ],
  
  // Coverage configuration
  collectCoverageFrom: [
    'src/**/*.{js,jsx}',
    '!src/index.js',
    '!src/setupTests.js'
  ],
  
  // Ignore e2e tests
  testPathIgnorePatterns: [
    '/node_modules/',
    '/e2e/'
  ]
};

