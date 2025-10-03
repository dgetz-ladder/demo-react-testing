// Visual regression tests using Playwright + Percy
const { browserType, launchConfig, contextConfig, getRemoteConfig, getBrowserType } = require('../playwright.config');
const { takeSnapshot, takeElementSnapshot, disableElementAnimations } = require('../utils/playwright-screenshots');
const { chromium, firefox, webkit } = require('playwright');

const { USE_BROWSERSTACK_GRID, GRID_BROWSER = 'chromium' } = process.env;

let browser, context, page;

const loadLocal = async () => {
    // Map browser names to actual Playwright browser types
    const browserTypes = { chromium, firefox, webkit };
    const bType = browserTypes[GRID_BROWSER] || chromium;
    browser = await bType.launch({...launchConfig, headless: true});
    context = await browser.newContext(contextConfig);
    page = await context.newPage();
};

const loadBrowserStack = async () => {
    const playwright = require('playwright');
    const config = getRemoteConfig(GRID_BROWSER);
    
    //console.log(`[Playwright Grid] Connecting to BrowserStack browser: ${GRID_BROWSER}`);
    const bstackOptions = config.capabilities['bstack:options'];
    //console.log(`[Playwright Grid] Platform: ${bstackOptions.os} ${bstackOptions.osVersion}`);
    
    // Connect to BrowserStack using CDP endpoint - will throw if fails
    browser = await playwright.chromium.connectOverCDP(`wss://cdp.browserstack.com/playwright?caps=${encodeURIComponent(JSON.stringify(config.capabilities))}`);
    const contexts = browser.contexts();
    context = contexts[0];
    page = await context.newPage();
};

const load = async () => {
    if (USE_BROWSERSTACK_GRID === 'true') {
        await loadBrowserStack();
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

describe("Visual Regression Tests - Percy", () => {
    beforeEach(async () => { await load(); }, 10000); // Increased timeout for browser startup
    afterEach(async () => { await cleanup(); }, 5000);

    it("should capture full page snapshot", async () => {
        await disableElementAnimations(page, '.App-logo');
        await page.waitForTimeout(1000);
        await takeSnapshot(page, 'Full page');
    });

    it("should capture header section snapshot", async () => {
        await disableElementAnimations(page, '.App-logo');
        await page.waitForTimeout(500);
        await takeElementSnapshot(page, '.App-header', 'Header section');
    });

    it("should capture React logo snapshot", async () => {
        await page.waitForSelector('.App-logo', { state: 'visible' });
        await disableElementAnimations(page, '.App-logo');
        await page.waitForTimeout(100); // Brief wait for style application
        await takeElementSnapshot(page, '.App-logo', 'React logo');
    });

    it("should capture mobile viewport snapshot", async () => {
        await disableElementAnimations(page, '.App-logo');
        await page.waitForTimeout(1000);
        await takeSnapshot(page, 'Mobile viewport');
    });

    it("should capture learn react link snapshot", async () => {
        await page.waitForTimeout(500);
        await takeElementSnapshot(page, '.App-link', 'Learn React link');
    });
});
