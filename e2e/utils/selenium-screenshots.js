const fs = require('fs');
const path = require('path');
const { By } = require('selenium-webdriver');
const { ensureDirectories, routeComparison, expectMatch, ACTUAL_DIR } = require('./screenshot-base');

// Store driver context for Percy
let currentDriver = null;
let currentElement = null;

/**
 * Capture full page screenshot with Selenium
 */
const captureScreenshot = async (driver, testName, options = {}) => {
    const fileName = `${testName}.png`;
    const actualPath = path.join(ACTUAL_DIR, fileName);

    ensureDirectories();

    // Store driver for Percy
    currentDriver = driver;
    currentElement = null;

    const screenshot = await driver.takeScreenshot();
    fs.writeFileSync(actualPath, screenshot, 'base64');

    return { testName, fileName, actualPath };
};

/**
 * Capture element screenshot with Selenium
 */
const captureElementScreenshot = async (driver, selector, testName, options = {}) => {
    const fileName = `${testName}.png`;
    const actualPath = path.join(ACTUAL_DIR, fileName);

    ensureDirectories();

    const element = await driver.findElement(By.css(selector));
    if (!element) throw new Error(`Element not found: ${selector}`);

    // Disable animations
    await driver.executeScript(`
        const el = document.querySelector('${selector}');
        if (el) {
            el.style.animation = 'none !important';
            el.style.transition = 'none !important';
            el.style.animationPlayState = 'paused !important';
        }
    `);

    await driver.sleep(100);

    // Store context for Percy
    currentDriver = driver;
    currentElement = element;

    const screenshot = await element.takeScreenshot();
    fs.writeFileSync(actualPath, screenshot, 'base64');

    return { testName, fileName, actualPath };
};

/**
 * Compare screenshot using current mode (local/percy/smartui)
 */
const compareDiff = async (capture) => {
    return await routeComparison(capture, currentDriver, currentElement);
};

module.exports = {
    captureScreenshot,
    captureElementScreenshot,
    compareDiff,
    expectMatch
};