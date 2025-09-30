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

Release notes
* Warning: Playwright's `slowMo` setting can be temperamental, and if set too high the tests often fail. The consistency of `slowMo` also seems to vary from browser to browser.

## Technologies

* [`playwright`](https://github.com/microsoft/playwright) - Cross-browser automation with methods to interact with pages, fill forms, simulate keystrokes and mouse actions
* [`selenium-webdriver`](https://www.selenium.dev/documentation/webdriver/) - Browser automation framework (alternative to Playwright)
* [`jest`](https://github.com/jestjs/jest) - Test runner and assertion library
* `pixelmatch` & `pngjs` - Image comparison for local screenshot testing
* [`@percy/playwright`](https://docs.percy.io/docs/playwright) - BrowserStack Percy for visual regression testing
* [`@percy/selenium-webdriver`](https://docs.percy.io/docs/selenium-webdriver-for-javascript) - BrowserStack Percy for Selenium
* [`@testing-library/react`](https://github.com/testing-library/react-testing-library) - Official React unit testing library


- `@percy/cli` - Percy command-line interface
- `@percy/playwright` - Percy SDK for Playwright
- Percy.io, requires token