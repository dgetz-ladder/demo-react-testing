const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');
const { compareDiffSmartUI } = require('./smartui-adapter');
const { compareDiffPercySelenium } = require('./percy-selenium-adapter');

const { screenshotsDir, baselineDir, actualDir, diffDir } = global.screenshotConfig;
const USE_SMARTUI = process.env.USE_SMARTUI === 'true';
const USE_PERCY = process.env.USE_PERCY === 'true';
const SCREENSHOTS_DIR = path.join(__dirname, '..', screenshotsDir);
const BASELINE_DIR = path.join(SCREENSHOTS_DIR, baselineDir);
const ACTUAL_DIR = path.join(SCREENSHOTS_DIR, actualDir);
const DIFF_DIR = path.join(SCREENSHOTS_DIR, diffDir);

// Store driver context for Percy (since Percy needs the live driver object)
let currentDriver = null;
let currentElement = null;

const assert = (value, error) => value || (() => { throw new Error(error); })();

const logMismatch = (testName, result) => {
    console.log(`${testName} screenshot mismatch: ${result.pixelDifference} pixels (${result.pixelPercentage}%)`);
    console.log(`Baseline: ${result.baselinePath}`);
    console.log(`Actual: ${result.actualPath}`);
    console.log(`Diff: ${result.diffPath}`);
};

/**
 * Capture full page screenshot with Selenium
 */
const captureScreenshot = async (driver, testName, options = {}) => {
    const fileName = `${testName}.png`;
    const actualPath = path.join(ACTUAL_DIR, fileName);

    [BASELINE_DIR, ACTUAL_DIR, DIFF_DIR].forEach(dir => {
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    });

    // Store driver for Percy (Percy needs the live driver object)
    currentDriver = driver;
    currentElement = null;

    // Take screenshot
    const screenshot = await driver.takeScreenshot();
    fs.writeFileSync(actualPath, screenshot, 'base64');

    return { testName, fileName, actualPath };
};

/**
 * Capture element screenshot with Selenium
 */
const captureElementScreenshot = async (driver, selector, testName, options = {}) => {
    const By = require('selenium-webdriver').By;
    const fileName = `${testName}.png`;
    const actualPath = path.join(ACTUAL_DIR, fileName);

    [BASELINE_DIR, ACTUAL_DIR, DIFF_DIR].forEach(dir => {
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    });

    // Find element
    const element = await driver.findElement(By.css(selector));
    await assert(element, `Element not found: ${selector}`);

    // Disable animations
    await driver.executeScript(`
        const el = document.querySelector('${selector}');
        if (el) {
            el.style.animation = 'none !important';
            el.style.transition = 'none !important';
            el.style.animationPlayState = 'paused !important';
        }
    `);

    // Wait a bit for styles to apply
    await driver.sleep(100);

    // Store driver and element for Percy
    currentDriver = driver;
    currentElement = element;

    // Take element screenshot
    const screenshot = await element.takeScreenshot();
    fs.writeFileSync(actualPath, screenshot, 'base64');

    return { testName, fileName, actualPath };
};

/**
 * Compare screenshots locally using pixelmatch
 */
const compareDiffLocal = (capture) => {
    const { testName, fileName, actualPath } = capture;
    const baselinePath = path.join(BASELINE_DIR, fileName);
    const diffPath = path.join(DIFF_DIR, fileName);

    if (!fs.existsSync(baselinePath)) {
        fs.copyFileSync(actualPath, baselinePath);
        return {
            isNewBaseline: true,
            message: `Created new baseline screenshot: ${fileName}`
        };
    }

    const baseline = PNG.sync.read(fs.readFileSync(baselinePath));
    const actual = PNG.sync.read(fs.readFileSync(actualPath));
    
    const { width, height } = baseline;
    const diff = new PNG({ width, height });
    const pixelmatch = require('pixelmatch').default || require('pixelmatch');
    
    const pixelDifference = pixelmatch(
        baseline.data,
        actual.data,
        diff.data,
        width,
        height,
        { threshold: 0.2 }
    );

    if (pixelDifference > 0) {
        fs.writeFileSync(diffPath, PNG.sync.write(diff));
    }

    const pixelPercentage = (pixelDifference / (width * height)) * 100;

    return {
        isNewBaseline: false,
        pixelDifference,
        pixelPercentage: pixelPercentage.toFixed(2),
        isMatch: pixelDifference === 0,
        baselinePath,
        actualPath,
        diffPath: pixelDifference > 0 ? diffPath : null
    };
};

/**
 * Compare screenshots using appropriate method (local, Percy, or SmartUI)
 */
const compareDiff = async (capture) => {
    if (USE_PERCY) {
        return await compareDiffPercySelenium(capture, currentDriver, currentElement);
    } else if (USE_SMARTUI) {
        return await compareDiffSmartUI(capture);
    } else {
        return compareDiffLocal(capture);
    }
};

/**
 * Expect screenshot to match baseline
 */
const expectMatch = (testName, result) => {
    if (result.isNewBaseline) {
        console.log(result.message);
    } else {
        expect(result.isMatch).toBe(true);
        if (!result.isMatch) logMismatch(testName, result);
    }
    return result;
};

module.exports = {
    captureScreenshot,
    captureElementScreenshot,
    compareDiff,
    expectMatch
};
