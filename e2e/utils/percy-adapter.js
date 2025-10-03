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

const initPercy = async () => {
    if (percyInitialized && percySDK) {
        return percySDK;
    }

    if (!PERCY_TOKEN) {
        throw new Error('Percy token not found. Set PERCY_TOKEN environment variable.');
    }

    try {
        percySDK = require('@percy/playwright');
        percyInitialized = true;
        return percySDK;
    } catch (error) {
        console.error('[Percy] Failed to initialize Percy:', error.message);
        throw new Error('Percy SDK not installed for Playwright');
    }
};

// Simple function to take Percy snapshot
const takePercySnapshot = async (page, testName, options = {}) => {
    const percy = await initPercy();
    
    const percyOptions = {
        widths: options.widths || [375, 1280],
        minHeight: options.minHeight || 1024,
        enableJavaScript: options.enableJavaScript !== false,
        ...options
    };

    await percy.percySnapshot(page, testName, percyOptions);

    percySnapshots.push({
        testName,
        framework: 'playwright',
        timestamp: new Date().toISOString(),
        options: percyOptions
    });
};


const finalizePercy = async () => {
    // Reset for next test run
    percySnapshots = [];
    percyInitialized = false;
    percySDK = null;
};

module.exports = {
    takePercySnapshot,
    finalizePercy
};
