const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');
const { compareDiffSmartUI } = require('./smartui-adapter');

const { screenshotsDir, baselineDir, actualDir, diffDir } = global.screenshotConfig;
const USE_SMARTUI = process.env.USE_SMARTUI === 'true';
const SCREENSHOTS_DIR = path.join(__dirname, '..', screenshotsDir);
const BASELINE_DIR = path.join(SCREENSHOTS_DIR, baselineDir);
const ACTUAL_DIR = path.join(SCREENSHOTS_DIR, actualDir);
const DIFF_DIR = path.join(SCREENSHOTS_DIR, diffDir);

const assert = (value, error) => value || (() => { throw new Error(error); })();

const logMismatch = (testName, result) => {
    console.log(`${testName} screenshot mismatch: ${result.pixelDifference} pixels (${result.pixelPercentage}%)`);
    console.log(`Baseline: ${result.baselinePath}`);
    console.log(`Actual: ${result.actualPath}`);
    console.log(`Diff: ${result.diffPath}`);
};

const captureScreenshot = async (page, testName, options = {}) => {
    const fileName = `${testName}.png`;
    const actualPath = path.join(ACTUAL_DIR, fileName);

    [BASELINE_DIR, ACTUAL_DIR, DIFF_DIR].forEach(dir => {
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    });

    await page.screenshot({ 
        fullPage: true, 
        animations: 'disabled', 
        ...options, 
        path: actualPath 
    });

    return { testName, fileName, actualPath };
};

const captureElementScreenshot = async (page, selector, testName, options = {}) => {
    const element = await assert(await page.$(selector), `Element not found: ${selector}`);
    
    // Force disable all animations and transitions on the element
    await page.evaluate((sel) => {
        const el = document.querySelector(sel);
        if (el) {
            el.style.animation = 'none !important';
            el.style.transition = 'none !important';
            el.style.animationPlayState = 'paused !important';
        }
    }, selector);
    
    // Wait for element to be stable
    await element.waitForElementState('stable');
    
    const boundingBox = await element.boundingBox();
    return await captureScreenshot(page, testName, {
        clip: boundingBox,
        animations: 'disabled',
        ...options
    });
};

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

const compareDiff = async (capture) => 
    USE_SMARTUI ? await compareDiffSmartUI(capture) : compareDiffLocal(capture);

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
