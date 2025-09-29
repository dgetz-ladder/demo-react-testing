This project provides one way to add Playwright to a `create-react-app` generated app. It uses a Jest test runner, follows the page object model and shows how easy it is to get started with Playwright.

```sh
npm install
npm start # react dev server
npm test # run unit tests
cd e2e
npx jest # run browser tests
```

Technologies
* Playwrite https://github.com/microsoft/playwright "Puppeteer w/ cross-browser support", has methods to interact with a page. Can automate browser interactions such as filling out forms, keystrokes, mouse move: https://github.com/microsoft/playwright/blob/master/docs/api.md
* Jest https://github.com/jestjs/jest used for the test runner and declarative assertions

Warning: OP says Playwrite's `slowMo` setting "an be temperamental, and if set too high the tests often fail. The consistency of `slowMo` also seems to vary from browser to browser"