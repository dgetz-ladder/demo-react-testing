const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');

const { screenshotsDir, baselineDir, actualDir, diffDir } = global.screenshotConfig;
const SCREENSHOTS_DIR = path.join(__dirname, '..', screenshotsDir);
const BASELINE_DIR = path.join(SCREENSHOTS_DIR, baselineDir);
const ACTUAL_DIR = path.join(SCREENSHOTS_DIR, actualDir);
const DIFF_DIR = path.join(SCREENSHOTS_DIR, diffDir);

/**
 * Ensure screenshot directories exist
 */
const ensureDirectories = () => {
    [BASELINE_DIR, ACTUAL_DIR, DIFF_DIR].forEach(dir => {
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    });
};

/**
 * Log screenshot mismatch details
 */
const logMismatch = (testName, result) => {
    console.log(`${testName} screenshot mismatch: ${result.pixelDifference} pixels (${result.pixelPercentage}%)`);
    console.log(`Baseline: ${result.baselinePath}`);
    console.log(`Actual: ${result.actualPath}`);
    console.log(`Diff: ${result.diffPath}`);
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
 * Route to appropriate comparison method
 */
const routeComparison = async (capture, driverOrPage = null, element = null) => {
    const USE_PERCY = process.env.USE_PERCY === 'true';
    const USE_SMARTUI = process.env.USE_SMARTUI === 'true';

    if (USE_PERCY && driverOrPage) {
        const { compareDiffPercy } = require('./percy-adapter-unified');
        return await compareDiffPercy(capture, driverOrPage, element);
    } else if (USE_SMARTUI) {
        const { compareDiffSmartUI } = require('./smartui-adapter');
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
    ensureDirectories,
    logMismatch,
    compareDiffLocal,
    routeComparison,
    expectMatch,
    BASELINE_DIR,
    ACTUAL_DIR,
    DIFF_DIR
};
