# React App with Playwright E2E Testing

This project provides one way to add Playwright to a `create-react-app` generated app. It uses a Jest test runner, follows the page object model and shows how easy it is to get started with Playwright.

## Quick Start

```sh
npm install
npm start # react dev server
npm test # run unit tests
npm run e2e # run all e2e tests
npm run e2e:functional # run functional tests only
npm run e2e:screenshots # run screenshot tests only
npm run e2e:update-screenshots # update baseline screenshots

# saas vendors
export $(grep -v '^#' .env.local | xargs)
npm run e2e:screenshots:percy # https://percy.io/
npm run e2e:screenshots:smartui # https://smartui.lambdatest.com/
```

Release notes
* Warning: Playwright's `slowMo` setting can be temperamental, and if set too high the tests often fail. The consistency of `slowMo` also seems to vary from browser to browser.

Technologies
* [`playwright`](https://github.com/microsoft/playwright) - Cross-browser automation with methods to interact with pages, fill forms, simulate keystrokes and mouse actions
* [`jest`](https://github.com/jestjs/jest) - Test runner and assertion library
* `pixelmatch` & `pngjs` - Image comparison for local screenshot testing
* [`@percy/playwright`](https://docs.percy.io/docs/playwright) - BrowserStack Percy for visual regression testing
* [`@testing-library/react`](https://github.com/testing-library/react-testing-library) - Official React unit testing library


- `@percy/cli` - Percy command-line interface
- `@percy/playwright` - Percy SDK for Playwright
- Percy.io, requires token