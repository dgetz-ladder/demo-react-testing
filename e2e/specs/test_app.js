// using playwrite for browser automation and interact with the React app
const { browserType, launchConfig, contextConfig } = require('../playwright.config');

let browser, context, page;
const load = async () => {
    browser = await browserType.launch(launchConfig);
    context = await browser.newContext(contextConfig);
    page = await context.newPage();
    await page.goto(baseURL); // injected by Jest - see configured globals
};

const root = async () => await page.$('#root');
const getTitle = async () => await page.title();

const getIntroText = async () => {
    const app = await root();
    return await app.$eval('.App-header > p', el => el.innerText);
}
  
const getLinkText = async () => {
    const app = await root();
    return await app.$eval('.App-link', el => el.innerText);
}  

//const { describe, it, beforeEach, afterEach, expect } = require('@jest/globals') // optional, the Jest runner injects it

describe("React App", () => {
    beforeEach(async () => { await load(); }, 2000 /* 1000 too low */);
    afterEach(async () => { await page.close(); await context.close(); await browser.close(); }, 1000);

    it("should be titled 'React App'", async () => {
        expect(await getTitle()).toBe('React App');
    });

    it("should show the correct intro", async () => {
        expect(await getIntroText()).toBe("Edit src/App.js and save to reload.");
    });

    it("should show the correct link", async () => {
        expect(await getLinkText()).toBe("Learn React");
    });
});
