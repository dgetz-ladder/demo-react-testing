// Visual regression tests using Playwright screenshots
const { browserType, launchConfig, contextConfig } = require('../playwright.config');
const { captureScreenshot, captureElementScreenshot, compareDiff, expectMatch } = require('../utils/screenshots');

let browser, context, page;

const load = async () => {
    browser = await browserType.launch({...launchConfig, headless: true});
    context = await browser.newContext(contextConfig);
    page = await context.newPage();
    await page.goto(baseURL);
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('#root', { state: 'visible' });
};

const cleanup = async () => {
    if (page) await page.close();
    if (context) await context.close();
    if (browser) await browser.close();
};

describe("Visual Regression Tests", () => {
    beforeEach(async () => { await load(); }, 10000); // Increased timeout for browser startup
    afterEach(async () => { await cleanup(); }, 5000);

    it("should match the full page screenshot", async () => {
        await page.waitForTimeout(1000);
        const capture = await captureScreenshot(page, 'Full page', { fullPage: true });
        expectMatch('Full page', compareDiff(capture));
    });

    it("should match the header section screenshot", async () => {
        await page.waitForTimeout(500);
        const capture = await captureElementScreenshot(page, '.App-header', 'Header section');
        expectMatch('Header section', compareDiff(capture));
    });

    it("should match the React logo screenshot", async () => {
        await page.waitForTimeout(500);
        const capture = await captureElementScreenshot(page, '.App-logo', 'React logo');
        expectMatch('React logo', compareDiff(capture));
    });

    it("should match the mobile viewport screenshot", async () => {
        await page.waitForTimeout(1000);
        const capture = await captureScreenshot(page, 'Mobile viewport', { fullPage: true });
        expectMatch('Mobile viewport', compareDiff(capture));
    });

    it("should match the learn react link screenshot", async () => {
        await page.waitForTimeout(500);
        const capture = await captureElementScreenshot(page, '.App-link', 'Learn React link');
        expectMatch('Learn React link', compareDiff(capture));
    });
});
