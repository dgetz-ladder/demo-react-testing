const { PERCY_TOKEN } = process.env;

// Track all snapshots
let percySnapshots = [];
let percyInitialized = false;
let percySDK = null;

/**
 * Detect framework from driver/page object
 */
const detectFramework = (driverOrPage) => {
    if (driverOrPage.takeScreenshot) return 'selenium';
    if (driverOrPage.screenshot) return 'playwright';
    throw new Error('Unknown framework - driver/page object not recognized');
};

/**
 * Initialize Percy SDK for the appropriate framework
 */
const initPercy = async (framework) => {
    if (percyInitialized && percySDK) {
        return percySDK;
    }

    if (!PERCY_TOKEN) {
        throw new Error('Percy token not found. Set PERCY_TOKEN environment variable.');
    }

    try {
        if (framework === 'playwright') {
            percySDK = require('@percy/playwright');
        } else if (framework === 'selenium') {
            percySDK = require('@percy/selenium-webdriver');
        } else {
            throw new Error(`Unknown framework: ${framework}`);
        }
        
        percyInitialized = true;
        console.log(`[Percy] Initialized Percy for ${framework}`);
        return percySDK;
    } catch (error) {
        console.error('[Percy] Failed to initialize Percy:', error.message);
        throw new Error(`Percy SDK not installed for ${framework}`);
    }
};

/**
 * Upload screenshot to Percy (works with both Playwright and Selenium)
 */
const uploadToPercy = async (driverOrPage, capture, element = null, options = {}) => {
    const framework = detectFramework(driverOrPage);
    const percy = await initPercy(framework);
    
    try {
        const { testName } = capture;
        const percyOptions = {
            widths: options.widths || [375, 1280],
            minHeight: options.minHeight || 1024,
            enableJavaScript: options.enableJavaScript !== false,
            ...options
        };

        // For element screenshots with Selenium, add scope
        if (framework === 'selenium' && element) {
            const selector = await driverOrPage.executeScript(
                "return arguments[0].getAttribute('class') ? '.' + arguments[0].getAttribute('class').split(' ')[0] : arguments[0].tagName.toLowerCase();",
                element
            );
            percyOptions.scope = selector;
        }

        // For element screenshots with Playwright, add scope
        if (framework === 'playwright' && element) {
            percyOptions.scope = element;
        }

        await percy.percySnapshot(driverOrPage, testName, percyOptions);

        percySnapshots.push({
            testName,
            framework,
            timestamp: new Date().toISOString(),
            options: percyOptions
        });

        return {
            success: true,
            testName,
            message: `Screenshot uploaded to Percy: ${testName}`,
        };
    } catch (error) {
        console.error(`[Percy] Failed to upload screenshot "${capture.testName}":`, error.message);
        return {
            success: false,
            testName: capture.testName,
            error: error.message
        };
    }
};

/**
 * Compare using Percy - returns result compatible with local comparison
 */
const compareDiffPercy = async (capture, driverOrPage, element = null, options = {}) => {
    const result = await uploadToPercy(driverOrPage, capture, element, options);
    
    return {
        isNewBaseline: false,
        isMatch: result.success,
        testName: capture.testName,
        actualPath: capture.actualPath,
        percyResult: result,
        pixelDifference: result.success ? 0 : Infinity,
        pixelPercentage: result.success ? '0.00' : '100.00',
        message: result.message || result.error
    };
};

/**
 * Finalize Percy test run
 */
const finalizePercy = async () => {
    if (percySnapshots.length > 0) {
        console.log(`\n[Percy] Successfully uploaded ${percySnapshots.length} snapshots`);
        console.log('[Percy] Snapshots:', percySnapshots.map(s => s.testName).join(', '));
    }
    
    // Reset for next test run
    percySnapshots = [];
    percyInitialized = false;
    percySDK = null;
};

module.exports = {
    uploadToPercy,
    compareDiffPercy,
    finalizePercy
};
