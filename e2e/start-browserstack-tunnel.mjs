#!/usr/bin/env node

import { Local } from 'browserstack-local';
import { chromium } from 'playwright';
import cp from 'child_process';

export const TUNNEL_IDENTIFIER = 'react-app-tunnel';
const clientPlaywrightVersion = cp.execSync('npx playwright --version').toString().trim().split(' ')[1];
const caps = {
    'browser': 'edge',  // allowed browsers are `chrome`, `edge`, `playwright-chromium`, `playwright-firefox` and `playwright-webkit`
    'os': 'osx',
    'os_version': 'catalina',
    'name': 'Playwright sample Local test',
    'build': 'playwright-build-3',
    'browserstack.local': 'true',
    'browserstack.localIdentifier': TUNNEL_IDENTIFIER,  // Must match tunnel's localIdentifier
    'browserstack.username': process.env.BROWSERSTACK_USERNAME,
    'browserstack.accessKey': process.env.BROWSERSTACK_ACCESS_KEY,
    'client.playwrightVersion': clientPlaywrightVersion  // advertise local playwrite version so BrowserStack can map request and responses correctly
};

export const startTunnel = () => {
    const bsLocal = new Local();
    return new Promise((resolve, reject) => {
        bsLocal.start({
            key: process.env.BROWSERSTACK_ACCESS_KEY,
            verbose: true,
            force: 'true',
            onlyAutomate: true,
            localIdentifier: TUNNEL_IDENTIFIER
        }, err => err ? reject(err) : resolve(bsLocal));
    });
};

export const stopTunnel = bsLocal =>
    new Promise((resolve, reject) => {
        if (!bsLocal) return resolve();
        bsLocal.stop(err => err ? reject(err) : resolve());
    });

function markTestStatus(page, status, reason) {
    return page.evaluate(_ => {}, `browserstack_executor: ${JSON.stringify({ action: 'setSessionStatus', arguments: { status, reason }})}`);
}

export async function testConnectivity() {
    let page;
    let bsLocal;
    
    try {
        bsLocal = await startTunnel();
        console.log(`✅ BrowserStack Local tunnel started: ${bsLocal.isRunning()}`);
        process.on('SIGINT', () => stopTunnel(bsLocal).then(() => process.exit(0)));
        const browser = await chromium.connect({ 
            wsEndpoint: `wss://cdp.browserstack.com/playwright?caps=${encodeURIComponent(JSON.stringify(caps))}`
        });
        page = await browser.newPage();
        await page.goto('http://localhost:3000');
        await page.waitForFunction(`document.querySelector("body")`);
        await markTestStatus(page, 'passed', 'Local tunnel is up and running');
        await browser.close();
        
        await stopTunnel(bsLocal);
        return true;
    } catch (err) {
        page && await markTestStatus(page, 'failed', 'BrowserStack Local binary is not running');
        bsLocal && await stopTunnel(bsLocal);
        throw err;
    }
}

// If run directly, perform a quick connectivity test
if (import.meta.url === `file://${process.argv[1]}`) {
    console.log('🔍 Testing BrowserStack Local tunnel connectivity...\n');
    testConnectivity()
        .then(() => {
            console.log('\n✅ Tunnel connectivity test passed! Your local server is accessible through BrowserStack.\n');
            process.exit(0);
        })
        .catch((err) => {
            console.log('\n❌ Tunnel connectivity test failed');
            console.error(err);
            process.exit(1);
        });
}
