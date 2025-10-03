// BrowserStack browser grid capabilities for Playwright + Percy
// Used for running tests via BrowserStack tunnel with Percy visual testing

const { USE_LOCAL_TUNNEL, BROWSERSTACK_LOCAL_IDENTIFIER = 'react-app-tunnel' } = process.env;

// BrowserStack Capabilities for Playwright
const browserStackBrowsers = {
    chromium: {
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
    webkit: {
        name: 'WebKit - Visual Regression',
        os: 'OS X',
        osVersion: 'Ventura',
        browser: 'Safari', // BrowserStack uses Safari for WebKit
        browserVersion: 'latest'
    },
    safari: {
        name: 'Safari - Visual Regression',
        os: 'OS X',
        osVersion: 'Ventura',
        browser: 'Safari',
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

// Get all available browsers
const getAvailableBrowsers = () => {
    return Object.keys(browserStackBrowsers);
};

module.exports = {
    buildBrowserStackPlaywrightCaps,
    getAvailableBrowsers,
    browserStackBrowsers
};

