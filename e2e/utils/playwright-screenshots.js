// Playwright screenshot utilities for Percy visual testing

const { takePercySnapshot } = require('./percy-adapter');

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

const takeSnapshot = async (page, testName, options = {}) => {
    // Percy is always used (via 'percy exec' wrapper in npm script)
    await takePercySnapshot(page, testName, options);
    return { testName, captured: true };
};

const takeElementSnapshot = async (page, selector, testName, options = {}) => {
    const element = await page.$(selector);
    if (!element) throw new Error(`Element not found: ${selector}`);
    
    await disableElementAnimations(page, selector);
    // Wait a bit for CSS to take effect
    await page.waitForTimeout(200);
    
    // Use Percy with element scope
    return await takeSnapshot(page, testName, {
        ...options,
        scope: selector
    });
};

module.exports = {
    takeSnapshot,
    takeElementSnapshot,
    disableElementAnimations
};
