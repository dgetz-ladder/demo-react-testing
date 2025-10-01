# React App with Playwright E2E Testing

Demonstration of **complete E2E testing solution**, supporting:
- **2 automation frameworks** (Playwright & Selenium)
- **3 visual testing modes** (Local, Percy, SmartUI)
- **6 total configurations** (every combination of framework × mode)

```
┌────────────────────────────────────────────────────────────────┐
│                    TESTING CONFIGURATIONS                      │
├──────────────┬─────────────┬─────────────┬─────────────────────┤
│ Framework    │ Local       │ Percy       │ SmartUI             │
├──────────────┼─────────────┼─────────────┼─────────────────────┤
│ Playwright   │ ✅ Working  │ ✅ Working  │ ✅ Working          │
│ Selenium     │ ✅ Working  │ ✅ Working  │ ✅ Working          │
└──────────────┴─────────────┴─────────────┴─────────────────────┘
```

## Quick Start

```sh
npm install
npm start # react dev server
npm test # run unit tests

# Playwright E2E Tests
npm run e2e # run all e2e tests
npm run e2e:functional # run functional tests only
npm run e2e:screenshots # run screenshot tests only (local)
npm run e2e:update-screenshots # update baseline screenshots

# Selenium E2E Tests
npm run e2e:selenium # run all selenium tests
npm run e2e:selenium:screenshots # run selenium screenshot tests (local)
npm run e2e:selenium:update-screenshots # update selenium baseline screenshots

# SaaS Visual Testing Vendors (works with both Playwright & Selenium)
export $(grep -v '^#' .env.local | xargs)

# Playwright with Percy/SmartUI
npm run e2e:screenshots:percy # https://percy.io/
npm run e2e:screenshots:smartui # https://smartui.lambdatest.com/

# Selenium with Percy/SmartUI
npm run e2e:selenium:screenshots:percy # https://percy.io/
npm run e2e:selenium:screenshots:smartui # https://smartui.lambdatest.com/
```

## 🗂️ Project Structure

```
e2e/
├── Config
│   ├── playwright.config.js      Playwright settings
│   ├── selenium.config.js        Selenium settings
│   └── jest.config.js            Jest configuration (CLI flags specify test patterns)
│
├── Tests
│   └── specs/
│       ├── screenshot_tests.js
│       ├── selenium_screenshot_tests.js
│       └── test_app.js
│
└── Utils
    ├── screenshot-base.js         Shared screenshot logic
    ├── screenshots.js             Playwright screenshots
    ├── selenium-screenshots.js    Selenium screenshots
    ├── percy-adapter-unified.js   Percy (both frameworks)
    ├── smartui-adapter.js         SmartUI integration
    └── jest-setup.js              Unified test setup
```

See [SIMPLIFIED_STRUCTURE.md](./SIMPLIFIED_STRUCTURE.md) for architecture details.

## Architecture Notes

**Explicit Configuration:**
This project uses explicit configuration files instead of hidden tooling:
* `vite.config.js` - Build and dev server configuration
* `jest.config.js` - Unit test configuration (explicitly loads `src/setupTests.js`)
* `e2e/jest.config.js` - E2E test configuration
* Test patterns specified via CLI flags in `package.json` scripts


## Release notes
* Warning: Playwright's `slowMo` setting can be temperamental, and if set too high the tests often fail. The consistency of `slowMo` also seems to vary from browser to browser.

## Technologies

**Build & Dev:**
* [`vite`](https://vitejs.dev/) - Fast build tool and dev server with explicit configuration
* [`@vitejs/plugin-react`](https://github.com/vitejs/vite-plugin-react) - Official React plugin for Vite

**Testing:**
* [`jest`](https://github.com/jestjs/jest) - Test runner and assertion library with explicit configuration
* [`playwright`](https://github.com/microsoft/playwright) - Cross-browser automation framework
* [`selenium-webdriver`](https://www.selenium.dev/documentation/webdriver/) - Browser automation framework (alternative to Playwright)
* [`@testing-library/react`](https://github.com/testing-library/react-testing-library) - React unit testing library
* `pixelmatch` & `pngjs` - Image comparison for local screenshot testing

**Visual Regression Testing:**
* [`@percy/playwright`](https://docs.percy.io/docs/playwright) - BrowserStack Percy for Playwright
* [`@percy/selenium-webdriver`](https://docs.percy.io/docs/selenium-webdriver-for-javascript) - BrowserStack Percy for Selenium
* `@lambdatest/smartui-cli` - LambdaTest SmartUI for visual testing