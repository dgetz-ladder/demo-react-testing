const fs = require('fs');
const path = require('path');
const { ensureDirectories, routeComparison, expectMatch, ACTUAL_DIR } = require('./screenshot-base');

// Store page context for Percy
let currentPage = null;
let currentSelector = null;

/**
 * Capture full page screenshot with Playwright
 */
const captureScreenshot = async (page, testName, options = {}) => {
    const fileName = `${testName}.png`;
    const actualPath = path.join(ACTUAL_DIR, fileName);

    ensureDirectories();

    // Store page for Percy
    currentPage = page;
    currentSelector = null;

    await page.screenshot({ 
        fullPage: true, 
        animations: 'disabled', 
        ...options, 
        path: actualPath 
    });

    return { testName, fileName, actualPath };
};

/**
 * Capture element screenshot with Playwright
 */
const captureElementScreenshot = async (page, selector, testName, options = {}) => {
    const element = await page.$(selector);
    if (!element) throw new Error(`Element not found: ${selector}`);
    
    // Disable animations
    await page.evaluate((sel) => {
        const el = document.querySelector(sel);
        if (el) {
            el.style.animation = 'none !important';
            el.style.transition = 'none !important';
            el.style.animationPlayState = 'paused !important';
        }
    }, selector);
    
    await element.waitForElementState('stable');
    
    // Store context for Percy
    currentPage = page;
    currentSelector = selector;
    
    const boundingBox = await element.boundingBox();
    return await captureScreenshot(page, testName, {
        clip: boundingBox,
        animations: 'disabled',
        ...options
    });
};

/**
 * Compare screenshot using current mode (local/percy/smartui)
 */
const compareDiff = async (capture) => {
    return await routeComparison(capture, currentPage, currentSelector);
};

module.exports = {
    captureScreenshot,
    captureElementScreenshot,
    compareDiff,
    expectMatch
};