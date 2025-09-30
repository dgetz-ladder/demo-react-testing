module.exports = {
    globals: {
      baseURL: "http://localhost:3000",
      screenshotConfig: {
        screenshotsDir: process.env.SCREENSHOTS_DIR || "screenshots",
        baselineDir: process.env.BASELINE_DIR || "baseline", 
        actualDir: process.env.ACTUAL_DIR || "actual",
        diffDir: process.env.DIFF_DIR || "diff"
      }
    },
    testMatch: ["**/specs/selenium_*.js"],
    transform: {
      "\\.js$": "react-scripts/config/jest/babelTransform"
    },
    transformIgnorePatterns: [
      "node_modules/(?!(pixelmatch)/)"
    ],
    verbose: true,
    // Selenium test specific settings
    testTimeout: 30000, // Increased timeout for Selenium tests
    setupFilesAfterEnv: ["<rootDir>/utils/jest-selenium-setup.js"]
};
