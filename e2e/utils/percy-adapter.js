const fs = require('fs');
const path = require('path');

const { PERCY_TOKEN } = process.env;

// Track all screenshots for Percy upload
let percySnapshots = [];
let percyInitialized = false;
let percyInstance = null;

/**
 * Initialize Percy for the test run
 */
const initPercy = async () => {
    if (percyInitialized) {
        return percyInstance;
    }

    if (!PERCY_TOKEN) {
        throw new Error('Percy token not found. Set PERCY_TOKEN environment variable.');
    }

    try {
        // Dynamically import Percy
        const percyPlaywright = require('@percy/playwright');
        percyInstance = percyPlaywright;
        percyInitialized = true;
        console.log('[Percy] Initialized Percy for screenshot testing');
        return percyInstance;
    } catch (error) {
        console.error('[Percy] Failed to initialize Percy:', error.message);
        throw new Error('Percy SDK not installed. Run: npm install --save-dev @percy/cli @percy/playwright');
    }
};

/**
 * Upload a screenshot to Percy
 * @param {Object} page - Playwright page object
 * @param {Object} capture - Screenshot capture metadata
 * @param {Object} options - Percy snapshot options
 */
const uploadToPercy = async (page, capture, options = {}) => {
    const percy = await initPercy();
    
    try {
        const { testName } = capture;
        
        // Take Percy snapshot using Playwright page
        await percy.percySnapshot(page, testName, {
            widths: options.widths || [1280],
            minHeight: options.minHeight || 1024,
            enableJavaScript: options.enableJavaScript !== false,
            ...options
        });

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
 * Upload an element screenshot to Percy
 * @param {Object} page - Playwright page object
 * @param {string} selector - CSS selector for the element
 * @param {Object} capture - Screenshot capture metadata
 * @param {Object} options - Percy snapshot options
 */
const uploadElementToPercy = async (page, selector, capture, options = {}) => {
    const percy = await initPercy();
    
    try {
        const { testName } = capture;
        
        // For element screenshots, we can use Percy's scope option
        await percy.percySnapshot(page, testName, {
            scope: selector,
            widths: options.widths || [1280],
            ...options
        });

        percySnapshots.push({
            testName,
            selector,
            timestamp: new Date().toISOString(),
            options
        });

        return {
            success: true,
            testName,
            message: `Element screenshot uploaded to Percy: ${testName}`,
        };
    } catch (error) {
        console.error(`[Percy] Failed to upload element screenshot "${capture.testName}":`, error.message);
        return {
            success: false,
            testName: capture.testName,
            error: error.message
        };
    }
};

/**
 * Compare using Percy - returns result compatible with local comparison
 * @param {Object} capture - Screenshot capture metadata
 * @param {Object} page - Playwright page object (required for Percy)
 * @param {string|null} selector - CSS selector for element screenshots
 * @param {Object} options - Percy options
 */
const compareDiffPercy = async (capture, page, selector = null, options = {}) => {
    let result;
    
    if (selector) {
        result = await uploadElementToPercy(page, selector, capture, options);
    } else {
        result = await uploadToPercy(page, capture, options);
    }
    
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
const getPercySummary = () => {
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
const finalizePercy = async () => {
    if (percySnapshots.length > 0) {
        const summary = getPercySummary();
        console.log('\n' + summary.message);
        console.log('[Percy] Snapshots:', percySnapshots.map(s => s.testName).join(', '));
    }
    
    // Reset for next test run
    percySnapshots = [];
};

module.exports = {
    initPercy,
    uploadToPercy,
    uploadElementToPercy,
    compareDiffPercy,
    getPercySummary,
    finalizePercy
};
