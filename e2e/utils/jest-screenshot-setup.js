// Jest setup for screenshot tests
const fs = require('fs');
const path = require('path');

const { screenshotsDir, baselineDir, actualDir } = global.screenshotConfig;
const SCREENSHOTS_DIR = path.join(__dirname, '..', screenshotsDir);
const BASELINE_DIR = path.join(SCREENSHOTS_DIR, baselineDir);
const ACTUAL_DIR = path.join(SCREENSHOTS_DIR, actualDir);

// Custom matcher for screenshot comparison
expect.extend({
  toMatchScreenshot(received, testName, options = {}) {
    const { isMatch, pixelDifference, pixelPercentage, diffPath } = received;
    
    if (isMatch) {
      return { message: () => `Screenshot matches baseline`, pass: true, };
    } else {
      return {
        message: () => 
          `Screenshot does not match baseline:\n` +
          `  Pixel difference: ${pixelDifference} pixels (${pixelPercentage}%)\n` +
          `  Diff image: ${diffPath}\n` +
          `  To update baseline, run: npm run e2e:update-screenshots`,
        pass: false,
      };
    }
  },
});

/**
 * Updates baseline screenshots by copying actual screenshots
 * @param {string} testName - Specific test name or 'all' for all screenshots
 */
const updateBaseline = (testName = 'all') => {
    if (testName === 'all') {
        // Update all baselines
        if (fs.existsSync(ACTUAL_DIR)) {
            const files = fs.readdirSync(ACTUAL_DIR);
            files.forEach(file => {
                const actualPath = path.join(ACTUAL_DIR, file);
                const baselinePath = path.join(BASELINE_DIR, file);
                fs.copyFileSync(actualPath, baselinePath);
            });
        }
    } else {
        // Update specific baseline
        const fileName = `${testName}.png`;
        const actualPath = path.join(ACTUAL_DIR, fileName);
        const baselinePath = path.join(BASELINE_DIR, fileName);
        
        if (fs.existsSync(actualPath)) {
            fs.copyFileSync(actualPath, baselinePath);
        }
    }
};

// Global setup for screenshot tests
beforeAll(() => {
  // Check if we're running in update mode
  const updateMode = process.env.UPDATE_SCREENSHOTS === 'true';
  if (updateMode) {
    console.log('Running in screenshot update mode - baselines will be updated');
  }
});

// Environment variable to update screenshots
if (process.env.UPDATE_SCREENSHOTS === 'true') {
  afterAll(() => {
    updateBaseline('all');
    console.log('Updated all baseline screenshots');
  });
}

// SmartUI batch upload after all tests
if (process.env.USE_SMARTUI === 'true') {
  afterAll(async () => {
    const { batchUploadToSmartUI } = require('./smartui-adapter');
    await batchUploadToSmartUI();
  }, 120000); // 2 minute timeout for upload
}

// Percy finalization after all tests
if (process.env.USE_PERCY === 'true') {
  afterAll(async () => {
    const { finalizePercy } = require('./percy-adapter');
    await finalizePercy();
  }, 30000);
}
