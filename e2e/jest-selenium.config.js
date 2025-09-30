const baseConfig = require('./jest-base.config');

module.exports = {
    ...baseConfig,
    testMatch: ["**/specs/selenium_*.js"]
};
