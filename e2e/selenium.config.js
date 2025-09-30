const { Builder, Browser, By } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

// Chrome options for headless and mobile emulation
const getChromeOptions = (mobile = false) => {
    const options = new chrome.Options();
    
    // Headless mode
    options.addArguments('--headless=new');
    options.addArguments('--disable-gpu');
    options.addArguments('--no-sandbox');
    options.addArguments('--disable-dev-shm-usage');
    
    // Mobile emulation (iPhone 6)
    if (mobile) {
        options.addArguments('--window-size=375,667');
        const mobileEmulation = {
            deviceMetrics: {
                width: 375,
                height: 667,
                pixelRatio: 2
            },
            userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A372 Safari/604.1'
        };
        options.setMobileEmulation(mobileEmulation);
    } else {
        options.addArguments('--window-size=1280,1024');
    }
    
    return options;
};

// Create Selenium WebDriver instance
const createDriver = async (mobile = false) => {
    const options = getChromeOptions(mobile);
    
    const driver = await new Builder()
        .forBrowser(Browser.CHROME)
        .setChromeOptions(options)
        .build();
    
    return driver;
};

module.exports = {
    Browser,
    By,
    createDriver,
    getChromeOptions
};
