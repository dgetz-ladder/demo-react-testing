const { PERCY_TOKEN } = process.env;

// Track all snapshots for Percy
let percySnapshots = [];
let percyInitialized = false;
let percyInstance = null;

/**
 * Initialize Percy for Selenium
 */
const initPercySelenium = async () => {
    if (percyInitialized) {
        return percyInstance;
    }

    if (!PERCY_TOKEN) {
        throw new Error('Percy token not found. Set PERCY_TOKEN environment variable.');
    }

    try {
        // Dynamically import Percy Selenium SDK
        const percySelenium = require('@percy/selenium-webdriver');
        percyInstance = percySelenium;
        percyInitialized = true;
        console.log('[Percy] Initialized Percy for Selenium screenshot testing');
        return percyInstance;
    } catch (error) {
        console.error('[Percy] Failed to initialize Percy:', error.message);
        throw new Error('Percy Selenium SDK not installed. Run: npm install --save-dev @percy/selenium-webdriver');
    }
};

/**
 * Upload a screenshot to Percy using Selenium driver
 * @param {Object} driver - Selenium WebDriver instance
 * @param {Object} capture - Screenshot capture metadata
 * @param {Object} element - Optional Selenium WebElement for element screenshots
 */
const uploadToPercySelenium = async (driver, capture, element = null) => {
    const percy = await initPercySelenium();
    
    try {
        const { testName } = capture;
        
        // Percy Selenium uses percySnapshot function
        const options = {
            widths: [375, 1280],
            minHeight: 1024,
            enableJavaScript: true
        };

        // If element is provided, take element snapshot
        if (element) {
            // For element screenshots, we use scope option
            const By = require('selenium-webdriver').By;
            const selector = await driver.executeScript(
                "return arguments[0].getAttribute('class') ? '.' + arguments[0].getAttribute('class').split(' ')[0] : arguments[0].tagName.toLowerCase();",
                element
            );
            options.scope = selector;
        }

        await percy.percySnapshot(driver, testName, options);

        percySnapshots.push({
            testName,
            timestamp: new Date().toISOString(),
            options
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
 * Compare using Percy for Selenium - returns result compatible with local comparison
 * @param {Object} capture - Screenshot capture metadata
 * @param {Object} driver - Selenium WebDriver instance
 * @param {Object} element - Optional Selenium WebElement for element screenshots
 */
const compareDiffPercySelenium = async (capture, driver, element = null) => {
    const result = await uploadToPercySelenium(driver, capture, element);
    
    // Return format compatible with local comparison
    return {
        isNewBaseline: false,
        isMatch: result.success, // Percy handles comparison on their platform
        testName: capture.testName,
        actualPath: capture.actualPath,
        percyResult: result,
        pixelDifference: result.success ? 0 : Infinity,
        pixelPercentage: result.success ? '0.00' : '100.00',
        message: result.message || result.error
    };
};

/**
 * Get summary of Percy snapshots taken during the test run
 */
const getPercySummarySelenium = () => {
    return {
        totalSnapshots: percySnapshots.length,
        snapshots: percySnapshots,
        message: percySnapshots.length > 0 
            ? `[Percy] Successfully uploaded ${percySnapshots.length} snapshots. View results at https://percy.io/`
            : '[Percy] No snapshots uploaded'
    };
};

/**
 * Finalize Percy test run
 */
const finalizePercySelenium = async () => {
    if (percySnapshots.length > 0) {
        const summary = getPercySummarySelenium();
        console.log('\n' + summary.message);
        console.log('[Percy] Snapshots:', percySnapshots.map(s => s.testName).join(', '));
    }
    
    // Reset for next test run
    percySnapshots = [];
};

module.exports = {
    initPercySelenium,
    uploadToPercySelenium,
    compareDiffPercySelenium,
    getPercySummarySelenium,
    finalizePercySelenium
};
