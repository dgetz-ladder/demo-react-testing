const baseConfig = require('./jest-base.config');

module.exports = {
    ...baseConfig,
    testMatch: ["**/specs/screenshot_tests.js", "**/specs/test_app.js"]
};
  