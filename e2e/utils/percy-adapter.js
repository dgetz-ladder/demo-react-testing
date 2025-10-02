const { PERCY_TOKEN } = process.env;

/**
 * Percy Browser Grid Functionality - Two Approaches:
 * 
 * 1. PERCY SNAPSHOT API (Default - Cloud Rendering):
 *    When you call percySnapshot(), Percy:
 *    a) Captures the DOM snapshot from your test browser (local or CI)
 *    b) Uploads it to Percy's cloud
 *    c) Renders the snapshot across multiple browsers on their servers
 *    d) Compares the renderings against your baselines
 *    
 *    Benefits:
 *    - Fast: Single test run
 *    - Simple: No grid setup needed
 *    - Cost-effective: One snapshot → N browsers
 *    
 *    Browser rendering is managed through Percy dashboard or percyOptions:
 *    - widths: Responsive viewport testing (e.g., [375, 1280])
 *    - Percy renders across Chrome, Firefox, Safari, Edge automatically
 * 
 * 2. PERCY ON AUTOMATE (BrowserStack Grid - Real Browsers):
 *    Run tests on BrowserStack's real browsers with Percy integration:
 *    a) Tests execute on BrowserStack's browser grid
 *    b) Percy captures screenshots during actual browser execution
 *    c) Percy compares against your baselines
 *    
 *    Setup:
 *    - Set USE_BROWSERSTACK_GRID=true
 *    - Provide BROWSERSTACK_USERNAME and BROWSERSTACK_ACCESS_KEY
 *    - Provide PERCY_TOKEN
 *    - Percy automatically detects BrowserStack sessions
 *    
 *    Benefits:
 *    - Real browsers: Actual Chrome, Firefox, Safari, Edge
 *    - Real devices: iOS, Android
 *    - Network conditions: Test with throttling
 *    - Geolocation: Test from different regions
 *    
 *    Use Percy on Automate when you need:
 *    - Real browser validation (not rendering)
 *    - Device-specific testing
 *    - Complex browser interactions
 *    - Network/geolocation testing
 * 
 * Choose the right approach:
 * - Percy Snapshot API: Most use cases, faster, cheaper
 * - Percy on Automate: When you need real browsers/devices
 */

// Track all snapshots
let percySnapshots = [];
let percyInitialized = false;
let percySDK = null;

// works with both Playwright and Selenium
const detectFramework = (driverOrPage) => {
    if (driverOrPage.takeScreenshot) return 'selenium';
    if (driverOrPage.screenshot) return 'playwright';
    throw new Error('Unknown framework - driver/page object not recognized');
};

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
