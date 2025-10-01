// Unified Jest setup for screenshot tests (works with both Playwright and Selenium)
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
      return { message: () => `Screenshot matches baseline`, pass: true };
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

const updateBaseline = (testName = 'all') => {
    if (testName === 'all') {
        if (fs.existsSync(ACTUAL_DIR)) {
            const files = fs.readdirSync(ACTUAL_DIR);
            files.forEach(file => {
                const actualPath = path.join(ACTUAL_DIR, file);
                const baselinePath = path.join(BASELINE_DIR, file);
                fs.copyFileSync(actualPath, baselinePath);
            });
        }
    } else {
        const fileName = `${testName}.png`;
        const actualPath = path.join(ACTUAL_DIR, fileName);
        const baselinePath = path.join(BASELINE_DIR, fileName);
        
        if (fs.existsSync(actualPath)) {
            fs.copyFileSync(actualPath, baselinePath);
        }
    }
};

// Global setup
beforeAll(() => {
  if (process.env.UPDATE_SCREENSHOTS === 'true') {
    console.log('Running in screenshot update mode - baselines will be updated');
  }
});

// Update screenshots mode
if (process.env.UPDATE_SCREENSHOTS === 'true') {
  afterAll(() => {
    updateBaseline('all');
    console.log('Updated all baseline screenshots');
  });
}

// SmartUI batch upload
if (process.env.USE_SMARTUI === 'true') {
  afterAll(async () => {
    const { batchUploadToSmartUI } = require('./smartui-adapter');
    await batchUploadToSmartUI();
  }, 120000);
}

// Percy finalization
if (process.env.USE_PERCY === 'true') {
  afterAll(async () => {
    const { finalizePercy } = require('./percy-adapter');
    await finalizePercy();
  }, 30000);
}
