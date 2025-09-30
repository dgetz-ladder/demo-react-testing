const { Builder, Browser, By } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

const getChromeOptions = (mobile = false) => {
    // Chrome options for headless and mobile emulation
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

// Create Selenium WebDriver instance
const createDriver = async (mobile = false) => 
    await new Builder()
        .forBrowser(Browser.CHROME)
        .setChromeOptions(getChromeOptions(mobile))
        .build();

module.exports = {
    Browser,
    By,
    createDriver,
    getChromeOptions
};
