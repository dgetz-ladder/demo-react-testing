import { chromium, firefox, webkit, devices } from 'playwright';
const { 
    buildLambdaTestPlaywrightCaps,
    buildBrowserStackPlaywrightCaps,
    getAvailableBrowsers
} = require('./grid-capabilities');

const { 
    LT_USERNAME, 
    LT_ACCESS_KEY, 
    USE_LAMBDATEST_GRID,
    BROWSERSTACK_USERNAME,
    BROWSERSTACK_ACCESS_KEY,
    USE_BROWSERSTACK_GRID,
    USE_LOCAL_TUNNEL,
    BROWSERSTACK_LOCAL_IDENTIFIER
} = process.env;

const iPhone = devices['iPhone 6'];

// Local configuration
const localConfig = {
    browserType: chromium,
    launchConfig: { headless: true },
    contextConfig: {
        viewport: iPhone.viewport,
        userAgent: iPhone.userAgent
    }
};

// Remote LambdaTest configuration
const getLambdaTestConfig = (browserName = 'chromium') => {
    if (!LT_USERNAME || !LT_ACCESS_KEY) {
        throw new Error('LambdaTest credentials not found. Set LT_USERNAME and LT_ACCESS_KEY environment variables.');
    }

    const capabilities = buildLambdaTestPlaywrightCaps(browserName);
    if (!capabilities) {
        throw new Error(`Unknown browser: ${browserName}. Available: ${getAvailableBrowsers('lambdatest').join(', ')}`);
    }

    return {
        browserName,
        capabilities: {
            ...capabilities,
            'LT:Options': {
                username: LT_USERNAME,
                accessKey: LT_ACCESS_KEY,
                ...capabilities
            }
        }
    };
};

// Remote BrowserStack configuration (for Percy on Automate)
const getBrowserStackConfig = (browserName = 'chromium') => {
    if (!BROWSERSTACK_USERNAME || !BROWSERSTACK_ACCESS_KEY) {
        throw new Error('BrowserStack credentials not found. Set BROWSERSTACK_USERNAME and BROWSERSTACK_ACCESS_KEY environment variables.');
    }

    const capabilities = buildBrowserStackPlaywrightCaps(browserName);
    if (!capabilities) {
        throw new Error(`Unknown browser: ${browserName}. Available: ${getAvailableBrowsers('browserstack').join(', ')}`);
    }

    const config = {
        browserName,
        capabilities: {
            ...capabilities,
            'bstack:options': {
                userName: BROWSERSTACK_USERNAME,
                accessKey: BROWSERSTACK_ACCESS_KEY,
                ...capabilities['bstack:options']
            }
        }
    };

    // Ensure tunnel settings are properly propagated when USE_LOCAL_TUNNEL is set
    if (USE_LOCAL_TUNNEL === 'true') {
        config.capabilities['bstack:options'].local = 'true';
        if (BROWSERSTACK_LOCAL_IDENTIFIER) {
            config.capabilities['bstack:options'].localIdentifier = BROWSERSTACK_LOCAL_IDENTIFIER;
        }
    }

    return config;
};

// Unified remote config getter
const getRemoteConfig = (browserName = 'chromium') => {
    if (USE_BROWSERSTACK_GRID === 'true') {
        return getBrowserStackConfig(browserName);
    }
    return getLambdaTestConfig(browserName);
};

// Get browser type based on env and browser name
const getBrowserType = (browserName = 'chromium') => {
    if (USE_LAMBDATEST_GRID === 'true' || USE_BROWSERSTACK_GRID === 'true') {
        return null; // Remote testing doesn't use local browser type
    }
    
    const browserTypes = { chromium, firefox, webkit };
    return browserTypes[browserName] || chromium;
};

module.exports = {
    browserType: localConfig.browserType,
    launchConfig: localConfig.launchConfig,
    contextConfig: localConfig.contextConfig,
    localConfig,
    getLambdaTestConfig,
    getBrowserStackConfig,
    getRemoteConfig,
    getBrowserType,
    getGridBrowsers: getAvailableBrowsers
};
