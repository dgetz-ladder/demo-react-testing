// supports both Percy and SmartUI

const fs = require('fs');
const path = require('path');
const { By } = require('selenium-webdriver');
const { ensureDirectories, routeComparison, expectMatch, ACTUAL_DIR } = require('./screenshot-comparison');

// Store driver context for Percy
let currentDriver = null;
let currentElement = null;

const disableElementAnimations = async (driver, selector) => {
    await driver.executeScript(`
        const el = document.querySelector('${selector}');
        if (el) {
            el.style.animation = 'none !important';
            el.style.transition = 'none !important';
            el.style.animationPlayState = 'paused !important';
            el.style.transform = 'rotate(0deg)';
        }
    `);
};

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

const captureElementScreenshot = async (driver, selector, testName, options = {}) => {
    const fileName = `${testName}.png`;
    const actualPath = path.join(ACTUAL_DIR, fileName);

    ensureDirectories();

    const element = await driver.findElement(By.css(selector));
    if (!element) throw new Error(`Element not found: ${selector}`);

    await disableElementAnimations(driver, selector);
    await driver.sleep(100);

    // Store context for Percy
    currentDriver = driver;
    currentElement = element;

    const screenshot = await element.takeScreenshot();
    fs.writeFileSync(actualPath, screenshot, 'base64');

    return { testName, fileName, actualPath };
};

const compareDiff = async (capture) => {
    return await routeComparison(capture, currentDriver, currentElement);
};

module.exports = {
    captureScreenshot,
    captureElementScreenshot,
    compareDiff,
    expectMatch,
    disableElementAnimations
};