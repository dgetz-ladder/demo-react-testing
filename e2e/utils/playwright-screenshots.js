// supports both Percy and SmartUI

const fs = require('fs');
const path = require('path');
const { ensureDirectories, routeComparison, expectMatch, ACTUAL_DIR } = require('./screenshot-comparison');

// Store page context for Percy
let currentPage = null;
let currentSelector = null;

const disableElementAnimations = async (page, selector) => {
    await page.evaluate((sel) => {
        const el = document.querySelector(sel);
        if (el) {
            el.style.animation = 'none !important';
            el.style.transition = 'none !important';
            el.style.animationPlayState = 'paused !important';
            el.style.transform = 'rotate(0deg)';
        }
    }, selector);
};

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

const captureElementScreenshot = async (page, selector, testName, options = {}) => {
    const element = await page.$(selector);
    if (!element) throw new Error(`Element not found: ${selector}`);
    
    await disableElementAnimations(page, selector);
    // Wait a bit for CSS to take effect, then get fresh element handle
    await page.waitForTimeout(200);
    
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

const compareDiff = async (capture) => {
    return await routeComparison(capture, currentPage, currentSelector);
};

module.exports = {
    captureScreenshot,
    captureElementScreenshot,
    compareDiff,
    expectMatch,
    disableElementAnimations
};