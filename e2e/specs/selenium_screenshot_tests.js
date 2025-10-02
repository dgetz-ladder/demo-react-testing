// Visual regression tests using Selenium WebDriver screenshots
const { createDriver, By, until } = require('../selenium.config');
const { captureScreenshot, captureElementScreenshot, compareDiff, expectMatch, disableElementAnimations } = require('../utils/selenium-screenshots');

const { USE_LAMBDATEST_GRID, USE_BROWSERSTACK_GRID, GRID_BROWSER = 'chrome' } = process.env;

let driver;

const load = async () => {
    // For grid testing, use the GRID_BROWSER env var; for local, use mobile viewport
    const isGrid = USE_LAMBDATEST_GRID === 'true' || USE_BROWSERSTACK_GRID === 'true';
    driver = await createDriver(!isGrid, GRID_BROWSER); // true = mobile viewport (iPhone 6) for local
    
    if (isGrid) {
        const gridType = USE_BROWSERSTACK_GRID === 'true' ? 'BrowserStack' : 'LambdaTest';
        console.log(`[Selenium Grid] Running on ${gridType} browser: ${GRID_BROWSER}`);
    }
    
    await driver.get(baseURL);
    await driver.sleep(5000); // Wait for page to load (longer for remote grid with tunnel)
    const rootElement = await driver.wait(until.elementLocated(By.css('#root')), 30000); // Increased for remote grid
    await driver.wait(until.elementIsVisible(rootElement), 30000); // Increased for remote grid
};

const cleanup = async () => driver && await driver.quit();

describe("Selenium Visual Regression Tests", () => {
    beforeEach(async () => { await load(); }, 60000); // Increased timeout for remote grid browser startup
    afterEach(async () => { await cleanup(); }, 10000);

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
