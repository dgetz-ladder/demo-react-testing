// Shared browser grid capabilities for all frameworks
// Reduces duplication between Selenium and Playwright configs

const { USE_LOCAL_TUNNEL, BROWSERSTACK_LOCAL_IDENTIFIER = 'react-app-tunnel' } = process.env;

const baseConfig = {
    platform: 'Windows 10',
    resolution: '1920x1080',
    build: 'React App Screenshots',
    video: true,
    network: true,
    console: true,
    visual: true
};

// LambdaTest Capabilities (works for both Selenium and Playwright)
const lambdaTestBrowsers = {
    chrome: {
        name: 'Chrome - Visual Regression',
        platform: 'Windows 10',
        browser: 'Chrome',
        version: 'latest'
    },
    firefox: {
        name: 'Firefox - Visual Regression',
        platform: 'Windows 10',
        browser: 'Firefox',
        version: 'latest'
    },
    safari: {
        name: 'Safari - Visual Regression',
        platform: 'macOS Ventura',
        browser: 'Safari',
        version: 'latest'
    },
    edge: {
        name: 'Edge - Visual Regression',
        platform: 'Windows 10',
        browser: 'MicrosoftEdge',
        version: 'latest'
    },
    chromeMobile: {
        name: 'Chrome Mobile - Visual Regression',
        platform: 'Android',
        device: 'Galaxy S21',
        platformVersion: '11',
        browser: 'Chrome',
        isRealMobile: true
    }
};

// BrowserStack Capabilities (works for both Selenium and Playwright)
const browserStackBrowsers = {
    chrome: {
        name: 'Chrome - Visual Regression',
        os: 'Windows',
        osVersion: '10',
        browser: 'Chrome',
        browserVersion: 'latest'
    },
    chromium: { // Alias for Playwright
        name: 'Chromium - Visual Regression',
        os: 'Windows',
        osVersion: '10',
        browser: 'Chrome', // BrowserStack uses Chrome for Chromium
        browserVersion: 'latest'
    },
    firefox: {
        name: 'Firefox - Visual Regression',
        os: 'Windows',
        osVersion: '10',
        browser: 'Firefox',
        browserVersion: 'latest'
    },
    safari: {
        name: 'Safari - Visual Regression',
        os: 'OS X',
        osVersion: 'Ventura',
        browser: 'Safari',
        browserVersion: 'latest'
    },
    webkit: { // Alias for Playwright
        name: 'WebKit - Visual Regression',
        os: 'OS X',
        osVersion: 'Ventura',
        browser: 'Safari', // BrowserStack uses Safari for WebKit
        browserVersion: 'latest'
    },
    edge: {
        name: 'Edge - Visual Regression',
        os: 'Windows',
        osVersion: '10',
        browser: 'MicrosoftEdge',
        browserVersion: 'latest'
    },
    chromeMobile: {
        name: 'Chrome Mobile - Visual Regression',
        osVersion: '13.0',
        device: 'Samsung Galaxy S23',
        browser: 'chrome',
        realMobile: true
    }
};

// Build LambdaTest capabilities for Selenium
const buildLambdaTestSeleniumCaps = (browserName) => {
    const browser = lambdaTestBrowsers[browserName];
    if (!browser) return null;

    const caps = {
        'LT:Options': {
            ...baseConfig,
            ...browser,
            browserName: browser.browser,
            tunnel: USE_LOCAL_TUNNEL === 'true' // Enable tunnel for localhost access
        }
    };

    if (browser.isRealMobile) {
        caps['LT:Options'].deviceName = browser.device;
        caps['LT:Options'].platformName = browser.platform;
    } else {
        caps['LT:Options'].platform = browser.platform;
    }

    return caps;
};

// Build LambdaTest capabilities for Playwright
const buildLambdaTestPlaywrightCaps = (browserName) => {
    const browser = lambdaTestBrowsers[browserName];
    if (!browser) return null;

    return {
        ...baseConfig,
        ...browser,
        build: baseConfig.build + ' - Playwright',
        tunnel: USE_LOCAL_TUNNEL === 'true' // Enable tunnel for localhost access
    };
};

// Build BrowserStack capabilities for Selenium
const buildBrowserStackSeleniumCaps = (browserName) => {
    const browser = browserStackBrowsers[browserName];
    if (!browser) return null;

    const caps = {
        'bstack:options': {
            projectName: 'React App Visual Testing',
            buildName: 'Percy on Automate - Selenium',
            sessionName: browser.name,
            os: browser.os,
            osVersion: browser.osVersion,
            local: USE_LOCAL_TUNNEL === 'true' ? 'true' : 'false', // Enable tunnel for localhost access
            seleniumVersion: '4.1.0',
            debug: 'true',
            networkLogs: 'true',
            consoleLogs: 'info'
        },
        browserName: browser.browser,
        browserVersion: browser.browserVersion
    };

    // Add localIdentifier when tunnel is enabled
    if (USE_LOCAL_TUNNEL === 'true') {
        caps['bstack:options'].localIdentifier = BROWSERSTACK_LOCAL_IDENTIFIER;
    }

    return caps;
};

// Build BrowserStack capabilities for Playwright
const buildBrowserStackPlaywrightCaps = (browserName) => {
    const browser = browserStackBrowsers[browserName];
    if (!browser) return null;

    const caps = {
        'bstack:options': {
            projectName: 'React App Visual Testing',
            buildName: 'Percy on Automate - Playwright',
            sessionName: browser.name,
            os: browser.os,
            osVersion: browser.osVersion,
            local: USE_LOCAL_TUNNEL === 'true' ? 'true' : 'false' // Enable tunnel for localhost access
        },
        browser: browser.browser.toLowerCase(),
        browser_version: browser.browserVersion
    };

    // Add localIdentifier when tunnel is enabled
    if (USE_LOCAL_TUNNEL === 'true') {
        caps['bstack:options'].localIdentifier = BROWSERSTACK_LOCAL_IDENTIFIER;
    }

    return caps;
};

// Get all available browsers for a grid
const getAvailableBrowsers = (grid = 'lambdatest') => {
    return grid === 'browserstack' 
        ? Object.keys(browserStackBrowsers)
        : Object.keys(lambdaTestBrowsers);
};

module.exports = {
    buildLambdaTestSeleniumCaps,
    buildLambdaTestPlaywrightCaps,
    buildBrowserStackSeleniumCaps,
    buildBrowserStackPlaywrightCaps,
    getAvailableBrowsers,
    lambdaTestBrowsers,
    browserStackBrowsers
};

