const { Builder, Browser, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const { 
    buildLambdaTestSeleniumCaps,
    buildBrowserStackSeleniumCaps,
    getAvailableBrowsers
} = require('./grid-capabilities');

const { 
    LT_USERNAME, 
    LT_ACCESS_KEY, 
    USE_LAMBDATEST_GRID,
    BROWSERSTACK_USERNAME,
    BROWSERSTACK_ACCESS_KEY,
    USE_BROWSERSTACK_GRID
} = process.env;

const getChromeOptions = (mobile = false) => {
    // Chrome options for headless and mobile emulation (local execution)
    const options = new chrome.Options();
    options.addArguments('--headless=new');
    options.addArguments('--disable-gpu');
    options.addArguments('--no-sandbox');
    options.addArguments('--disable-dev-shm-usage');
    
    // Mobile emulation (iPhone 6)
    if (mobile) {
        options.addArguments('--window-size=375,667');
        options.setMobileEmulation({
            deviceMetrics: { width: 375, height: 667, pixelRatio: 2 },
            userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A372 Safari/604.1'
        });
    } else {
        options.addArguments('--window-size=1280,1024');
    }
    return options;
};

// Create local Selenium WebDriver instance
const createLocalDriver = async (mobile = false) => {
    return await new Builder()
        .forBrowser(Browser.CHROME)
        .setChromeOptions(getChromeOptions(mobile))
        .build();
};

// Create remote LambdaTest WebDriver instance
const createLambdaTestDriver = async (browserName = 'chrome') => {
    if (!LT_USERNAME || !LT_ACCESS_KEY) {
        throw new Error('LambdaTest credentials not found. Set LT_USERNAME and LT_ACCESS_KEY environment variables.');
    }

    const capabilities = buildLambdaTestSeleniumCaps(browserName);
    if (!capabilities) {
        throw new Error(`Unknown browser: ${browserName}. Available: ${getAvailableBrowsers('lambdatest').join(', ')}`);
    }

    const gridUrl = `https://${LT_USERNAME}:${LT_ACCESS_KEY}@hub.lambdatest.com/wd/hub`;
    
    console.log(`[LambdaTest] Connecting to browser: ${browserName}`);
    
    return await new Builder()
        .usingServer(gridUrl)
        .withCapabilities(capabilities)
        .build();
};

// Create remote BrowserStack WebDriver instance (for Percy on Automate)
const createBrowserStackDriver = async (browserName = 'chrome') => {
    if (!BROWSERSTACK_USERNAME || !BROWSERSTACK_ACCESS_KEY) {
        throw new Error('BrowserStack credentials not found. Set BROWSERSTACK_USERNAME and BROWSERSTACK_ACCESS_KEY environment variables.');
    }

    const capabilities = buildBrowserStackSeleniumCaps(browserName);
    if (!capabilities) {
        throw new Error(`Unknown browser: ${browserName}. Available: ${getAvailableBrowsers('browserstack').join(', ')}`);
    }

    const gridUrl = `https://${BROWSERSTACK_USERNAME}:${BROWSERSTACK_ACCESS_KEY}@hub-cloud.browserstack.com/wd/hub`;
    
    console.log(`[BrowserStack] Connecting to browser: ${browserName}`);
    
    return await new Builder()
        .usingServer(gridUrl)
        .withCapabilities(capabilities)
        .build();
};

// Main driver creation function - routes to local or remote based on env
const createDriver = async (mobile = false, browserName = 'chrome') => {
    if (USE_BROWSERSTACK_GRID === 'true') {
        return await createBrowserStackDriver(browserName);
    } else if (USE_LAMBDATEST_GRID === 'true') {
        return await createLambdaTestDriver(browserName);
    } else {
        return await createLocalDriver(mobile);
    }
};

module.exports = {
    Browser,
    By,
    until,
    createDriver,
    createLocalDriver,
    createLambdaTestDriver,
    createBrowserStackDriver,
    getChromeOptions,
    getGridBrowsers: getAvailableBrowsers
};
