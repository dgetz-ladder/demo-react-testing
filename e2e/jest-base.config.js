// Base Jest configuration shared by both Playwright and Selenium tests
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
    transform: {
      "\\.js$": "react-scripts/config/jest/babelTransform"
    },
    transformIgnorePatterns: [
      "node_modules/(?!(pixelmatch)/)"
    ],
    verbose: true,
    testTimeout: 30000,
    setupFilesAfterEnv: ["<rootDir>/utils/jest-setup.js"]
};
