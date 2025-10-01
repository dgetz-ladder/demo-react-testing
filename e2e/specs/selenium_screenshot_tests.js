// Visual regression tests using Selenium WebDriver screenshots
const { createDriver, By, until } = require('../selenium.config');
const { captureScreenshot, captureElementScreenshot, compareDiff, expectMatch, disableElementAnimations } = require('../utils/selenium-screenshots');

let driver;

const load = async () => {
    driver = await createDriver(true); // true = mobile viewport (iPhone 6)
    await driver.get(baseURL);
    await driver.sleep(2000); // Wait for page to load i.e. network idle
    const rootElement = await driver.wait(until.elementLocated(By.css('#root')), 10000);
    await driver.wait(until.elementIsVisible(rootElement), 10000);
};

const cleanup = async () => driver && await driver.quit();

describe("Selenium Visual Regression Tests", () => {
    beforeEach(async () => { await load(); }, 15000); // Increased timeout for browser startup
    afterEach(async () => { await cleanup(); }, 5000);

    it("should match the full page screenshot", async () => {
        await disableElementAnimations(driver, '.App-logo');
        await driver.sleep(1000);
        const capture = await captureScreenshot(driver, 'Selenium - Full page');
        expectMatch('Selenium - Full page', await compareDiff(capture));
    });

    it("should match the header section screenshot", async () => {
        await disableElementAnimations(driver, '.App-logo');
        await driver.sleep(500);
        const capture = await captureElementScreenshot(driver, '.App-header', 'Selenium - Header section');
        expectMatch('Selenium - Header section', await compareDiff(capture));
    });

    it("should match the React logo screenshot", async () => {
        const logo = await driver.findElement(By.css('.App-logo'));
        await driver.wait(async () => await logo.isDisplayed(), 5000);
        await disableElementAnimations(driver, '.App-logo');    
        await driver.sleep(100); // Brief wait for style application
        const capture = await captureElementScreenshot(driver, '.App-logo', 'Selenium - React logo');
        expectMatch('Selenium - React logo', await compareDiff(capture));
    });

    it("should match the mobile viewport screenshot", async () => {
        await disableElementAnimations(driver, '.App-logo');
        await driver.sleep(1000);
        const capture = await captureScreenshot(driver, 'Selenium - Mobile viewport');
        expectMatch('Selenium - Mobile viewport', await compareDiff(capture));
    });

    it("should match the learn react link screenshot", async () => {
        await driver.sleep(500);
        const capture = await captureElementScreenshot(driver, '.App-link', 'Selenium - Learn React link');
        expectMatch('Selenium - Learn React link', await compareDiff(capture));
    });
});
