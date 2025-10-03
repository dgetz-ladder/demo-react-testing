// Jest configuration for Playwright E2E tests with Percy
module.exports = {
    globals: {
      baseURL: process.env.BASE_URL || "http://localhost:3000"
    },
    testMatch: ["**/specs/**/*.js"],
    transform: {
      "^.+\\.js$": "babel-jest"
    },
    verbose: true,
    testTimeout: 30000,
    setupFilesAfterEnv: ["<rootDir>/utils/jest-setup.js"]
};
