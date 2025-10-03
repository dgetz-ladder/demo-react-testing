# React App with Playwright E2E Testing + Percy

Demonstration of **E2E testing solution** with Playwright and Percy, supporting:
- **Playwright automation framework** for browser automation
- **Percy visual testing** for cross-browser visual regression testing
- **BrowserStack tunnel integration** for testing localhost apps on BrowserStack with Percy
- **Cross-browser testing** via Percy (Chrome, Firefox, Safari, Edge, Mobile)

## Test Types Explained

- **Unit Tests** (`npm test`) - Test React components in isolation using `@testing-library/react` (no browser, fast)
- **Functional Tests** (`npm run e2e:functional`) - Test full app behavior in real browser (checks text, links, interactions)
- **Visual Tests** (`npm run e2e:visual`) - Percy cloud visual testing with automatic cross-browser rendering

## BrowserStack Tunnel Integration

**Automated tunnel management** - Run Playwright tests on BrowserStack's browser grid with Percy visual testing:

```sh
# Start your dev server first
npm start

npm run browserstack:connectivity # check vendor connectivity

# Run tests with automatic tunnel management
npm run e2e:browserstack:tunnel
```

The tunnel automatically:
1. Starts BrowserStack Local tunnel
2. Runs Playwright tests with Percy
3. Stops the tunnel when complete

See [BROWSERSTACK_TUNNEL_GUIDE.md](./BROWSERSTACK_TUNNEL_GUIDE.md) for details.

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
npm run e2e:visual                          # Percy visual testing (cross-browser)
npm run test:all                            # Run all tests (unit + functional + visual)

# BrowserStack Integration
npm run e2e:browserstack:tunnel             # Run tests via BrowserStack tunnel with Percy
npm run browserstack:connectivity           # Test BrowserStack tunnel connection
```

## 🗂️ Project Structure

```
e2e/
├── Config
│   ├── playwright.config.js                Playwright settings
│   ├── jest.config.js                      Jest configuration
│   └── grid-capabilities.js                BrowserStack browser configs
│
├── Tests
│   └── specs/
│       ├── app_visual.js                   Visual regression tests (Percy)
│       └── app_functional.js               Functional tests
│
├── Tunnel Management
│   └── browserstack-tunnel.mjs             Unified tunnel manager & test runner
│
└── Utils
    ├── playwright-screenshots.js           Playwright + Percy snapshot utilities
    ├── percy-adapter.js                    Percy SDK integration
    └── jest-setup.js                       Test setup & lifecycle
```

## Architecture Notes

**Explicit Configuration:**
This project uses explicit configuration files instead of hidden tooling:
* `vite.config.js` - Build and dev server configuration
* `jest.config.js` - Unit test configuration (explicitly loads `src/setupTests.js`)
* `e2e/jest.config.js` - E2E test configuration
* `e2e/playwright.config.js` - Playwright browser settings
* `__mocks__/` - Jest mocks for CSS/images (so unit tests don't crash on non-JS imports)

## Environment Variables

To use Percy and BrowserStack features, create a `.env.local` file:

```bash
# Percy (for visual testing)
PERCY_TOKEN=your_percy_token

# BrowserStack (for tunnel and grid testing)
BROWSERSTACK_USERNAME=your_username
BROWSERSTACK_ACCESS_KEY=your_access_key
```

## Technologies

**Build & Dev:**
* [`vite`](https://vitejs.dev/) - Fast build tool and dev server
* [`@vitejs/plugin-react`](https://github.com/vitejs/vite-plugin-react) - Official React plugin for Vite

**Testing:**
* [`jest`](https://github.com/jestjs/jest) - Test runner and assertion library
* [`playwright`](https://github.com/microsoft/playwright) - Cross-browser automation framework
* [`@testing-library/react`](https://github.com/testing-library/react-testing-library) - React unit testing library
* [`@percy/playwright`](https://docs.percy.io/docs/playwright) - Percy visual testing SDK
* [`@percy/cli`](https://github.com/percy/cli) - Percy command-line tools
* `browserstack-local` - BrowserStack tunnel for testing localhost apps