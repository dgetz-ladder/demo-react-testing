// Visual regression tests using Playwright screenshots
const { browserType, launchConfig, contextConfig, getRemoteConfig, getBrowserType } = require('../playwright.config');
const { captureScreenshot, captureElementScreenshot, compareDiff, expectMatch, disableElementAnimations } = require('../utils/playwright-screenshots');
const { chromium, firefox, webkit } = require('playwright');

const { USE_LAMBDATEST_GRID, USE_BROWSERSTACK_GRID, GRID_BROWSER = 'chromium' } = process.env;

let browser, context, page;

const loadLocal = async () => {
    // Map browser names to actual Playwright browser types
    const browserTypes = { chromium, firefox, webkit };
    const bType = browserTypes[GRID_BROWSER] || chromium;
    browser = await bType.launch({...launchConfig, headless: true});
    context = await browser.newContext(contextConfig);
    page = await context.newPage();
};

const loadLambdaTest = async () => {
    const { remote } = require('@lambdatest/playwright-driver');
    const config = getRemoteConfig(GRID_BROWSER);
    
    console.log(`[Playwright Grid] Connecting to LambdaTest browser: ${GRID_BROWSER}`);
    console.log(`[Playwright Grid] Platform: ${config.capabilities['LT:Options'].platform}`);
    
    // Connect to LambdaTest - will throw if fails
    browser = await remote(chromium, config.capabilities);
    page = await browser.newPage();
};

const loadBrowserStack = async () => {
    const playwright = require('playwright');
    const config = getRemoteConfig(GRID_BROWSER);
    
    console.log(`[Playwright Grid] Connecting to BrowserStack browser: ${GRID_BROWSER}`);
    const bstackOptions = config.capabilities['bstack:options'];
    console.log(`[Playwright Grid] Platform: ${bstackOptions.os} ${bstackOptions.osVersion}`);
    
    // Connect to BrowserStack using CDP endpoint - will throw if fails
    const cdpUrl = `wss://cdp.browserstack.com/playwright?caps=${encodeURIComponent(JSON.stringify(config.capabilities))}`;
    browser = await playwright.chromium.connectOverCDP(cdpUrl);
    const contexts = browser.contexts();
    context = contexts[0];
    page = await context.newPage();
};

const load = async () => {
    if (USE_BROWSERSTACK_GRID === 'true') {
        await loadBrowserStack();
    } else if (USE_LAMBDATEST_GRID === 'true') {
        await loadLambdaTest();
    } else {
        await loadLocal();
    }
    
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
        await disableElementAnimations(page, '.App-logo');
        await page.waitForTimeout(1000);
        const capture = await captureScreenshot(page, 'Full page', { fullPage: true });
        expectMatch('Full page', await compareDiff(capture));
    });

    it("should match the header section screenshot", async () => {
        await disableElementAnimations(page, '.App-logo');
        await page.waitForTimeout(500);
        const capture = await captureElementScreenshot(page, '.App-header', 'Header section');
        expectMatch('Header section', await compareDiff(capture));
    });

    it("should match the React logo screenshot", async () => {
        await page.waitForSelector('.App-logo', { state: 'visible' });
        await disableElementAnimations(page, '.App-logo');
        await page.waitForTimeout(100); // Brief wait for style application
        const capture = await captureElementScreenshot(page, '.App-logo', 'React logo');
        expectMatch('React logo', await compareDiff(capture));
    });

    it("should match the mobile viewport screenshot", async () => {
        await disableElementAnimations(page, '.App-logo');
        await page.waitForTimeout(1000);
        const capture = await captureScreenshot(page, 'Mobile viewport', { fullPage: true });
        expectMatch('Mobile viewport', await compareDiff(capture));
    });

    it("should match the learn react link screenshot", async () => {
        await page.waitForTimeout(500);
        const capture = await captureElementScreenshot(page, '.App-link', 'Learn React link');
        expectMatch('Learn React link', await compareDiff(capture));
    });
});
