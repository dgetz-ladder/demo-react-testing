# React App with E2E web automation testing (w/ screenshots)

Demonstration of **complete E2E testing solution**, supporting:
- **2 automation frameworks** (Playwright & Selenium)
- **3 visual testing modes** (Local, Percy, SmartUI)
- **6 total configurations** (every combination of framework × mode)

```
┌──────────────┬─────────────┬─────────────┬─────────────────────┐
│ Framework    │ Local       │ Percy       │ SmartUI             │
├──────────────┼─────────────┼─────────────┼─────────────────────┤
│ Playwright   │ ✅ Working  │ ✅ Working  │ ✅ Working          │
│ Selenium     │ ✅ Working  │ ✅ Working  │ ✅ Working          │
└──────────────┴─────────────┴─────────────┴─────────────────────┘
```

## Quick Start

```sh
npm install
npm start # Vite dev server
npm test  # Unit tests

# E2E Tests
npm run e2e            # All Playwright e2e tests
npm run e2e:functional # Functional tests only

# Playwright Visual Tests
npm run e2e:playwright                       # All Playwright tests
npm run e2e:playwright:screenshots           # Screenshots (local comparison)
npm run e2e:playwright:update-screenshots    # Update baselines
npm run e2e:playwright:screenshots:percy     # Screenshots with Percy
npm run e2e:playwright:screenshots:smartui   # Screenshots with SmartUI

# Selenium Visual Tests  
npm run e2e:selenium                         # All Selenium tests
npm run e2e:selenium:screenshots             # Screenshots (local comparison)
npm run e2e:selenium:update-screenshots      # Update baselines
npm run e2e:selenium:screenshots:percy       # Screenshots with Percy
npm run e2e:selenium:screenshots:smartui     # Screenshots with SmartUI
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
│       ├── playwright_screenshot_tests.js  (Playwright visual tests)
│       ├── selenium_screenshot_tests.js    (Selenium visual tests)
│       └── test_app.js                     (Functional tests)
│
└── Utils
    ├── screenshot-comparison.js   Shared comparison logic
    ├── playwright-screenshots.js  Playwright screenshots
    ├── selenium-screenshots.js    Selenium screenshots
    ├── percy-adapter.js           Percy integration
    ├── smartui-adapter.js         SmartUI integration
    └── jest-setup.js              Test setup & lifecycle
```

See [SIMPLIFIED_STRUCTURE.md](./SIMPLIFIED_STRUCTURE.md) for architecture details.

## Architecture Notes

**Explicit Configuration:**
This project uses explicit configuration files instead of hidden tooling:
* `vite.config.js` - Build and dev server configuration
* `jest.config.js` - Unit test configuration (explicitly loads `src/setupTests.js`)
* `e2e/jest.config.js` - E2E test configuration
* `__mocks__/` - Jest mocks for CSS/images (so unit tests don't crash on non-JS imports)
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