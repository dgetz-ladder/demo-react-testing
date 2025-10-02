# React App with E2E web automation testing (w/ screenshots)

Demonstration of **complete E2E testing solution**, supporting:
- **2 automation frameworks** (Playwright & Selenium)
- **3 visual testing modes** (Local, Percy, SmartUI)
- **Remote browser grids** (Percy cloud rendering & LambdaTest browser grid)
- **Cross-browser testing** (Chrome, Firefox, Safari, Edge, Mobile)

```
┌──────────────┬─────────────┬──────────────────┬─────────────────────┐
│ Framework    │ Local       │ Percy (Cloud)    │ SmartUI (Grid)      │
├──────────────┼─────────────┼──────────────────┼─────────────────────┤
│ Playwright   │ ✅ Working  │ ✅ Cloud Render  │ ✅ Local + Grid     │
│ Selenium     │ ✅ Working  │ ✅ Cloud Render  │ ✅ Local + Grid     │
└──────────────┴─────────────┴──────────────────┴─────────────────────┘
```

## Test Types Explained

- **Unit Tests** (`npm test`) - Test React components in isolation using `@testing-library/react` (no browser, fast)
- **Functional Tests** (`npm run e2e:functional`) - Test full app behavior in real browser (checks text, links, interactions)
- **Visual Regression Tests** (`npm run e2e:*:screenshots`) - Test how the app looks (compares screenshots against baselines)

## 🚇 BrowserStack Tunnel Integration (NEW!)

**Automated tunnel management** - Run tests on BrowserStack's browser grid with automatic tunnel lifecycle:

```sh
# Start your dev server first
npm start

# Run tests with automatic tunnel management
npm run e2e:browserstack:tunnel              # Playwright tests
npm run e2e:browserstack:tunnel:selenium     # Selenium tests
```

See [GRID_LOCALHOST_GUIDE.md](./GRID_LOCALHOST_GUIDE.md) for details.

**🌐 New: Browser Grid Support!**
- **Percy Snapshot API**: Automatic cross-browser rendering (Chrome, Firefox, Safari, Edge)
- **Percy on Automate**: Real browser execution on BrowserStack grid
- **LambdaTest SmartUI**: Real browser execution on LambdaTest grid

See [BROWSER_GRID_GUIDE.md](./BROWSER_GRID_GUIDE.md) for detailed documentation.

## Quick Start

```sh
# Setup
npm install

# Development
npm start                                   # Start dev server (localhost:3000)
npm test                                    # Run unit tests
npm run build                               # Build for production
npm run deploy:preview                      # Build + preview production locally

# E2E Testing (requires dev server running)
npm run e2e:functional                      # Functional tests (Playwright)
npm run e2e:playwright:screenshots          # Visual regression (Playwright)
npm run e2e:selenium:screenshots            # Visual regression (Selenium)

# BrowserStack Grid Testing (automated tunnel)
npm run e2e:browserstack:tunnel             # Playwright on BrowserStack
npm run e2e:browserstack:tunnel:selenium    # Selenium on BrowserStack

# Update Visual Baselines
npm run e2e:playwright:update-screenshots   # Update Playwright baselines
npm run e2e:selenium:update-screenshots     # Update Selenium baselines
```

### Advanced Testing

```sh
# Percy Cloud Rendering
npm run e2e:playwright:screenshots:percy    # Percy + local Playwright
npm run e2e:selenium:screenshots:percy      # Percy + local Selenium
npm run e2e:playwright:grid -- percy all    # Percy + BrowserStack grid (all browsers)
npm run e2e:selenium:grid -- percy all      # Percy + BrowserStack grid (all browsers)

# SmartUI / LambdaTest Grid
npm run e2e:playwright:screenshots:smartui  # SmartUI + local Playwright
npm run e2e:selenium:screenshots:smartui    # SmartUI + local Selenium
npm run e2e:playwright:grid -- smartui all  # SmartUI + LambdaTest grid (all browsers)
npm run e2e:selenium:grid -- smartui all    # SmartUI + LambdaTest grid (all browsers)

# Connectivity Tests
npm run browserstack:connectivity           # Test BrowserStack tunnel
npm run lambdatest:connectivity             # Test LambdaTest tunnel
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
├── Grid Configuration
│   ├── grid-capabilities.js                Shared browser configs (DRY!)
│   ├── run-grid-tests.js                   Unified grid test runner
│   ├── start-browserstack-tunnel.mjs       BrowserStack tunnel management
│   └── browserstack-tunnel-runner.mjs      Automated tunnel test orchestration
│
└── Utils
    ├── screenshot-comparison.js   Shared comparison logic
    ├── playwright-screenshots.js  Playwright screenshots
    ├── selenium-screenshots.js    Selenium screenshots
    ├── percy-adapter.js           Percy cloud rendering integration
    ├── smartui-adapter.js         SmartUI & LambdaTest grid integration
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