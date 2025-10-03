#!/usr/bin/env node

/**
 * BrowserStack Local Tunnel Manager for Playwright + Percy
 * 
 * This script handles BrowserStack Local tunnel operations:
 * 1. Test connectivity (default mode)
 * 2. Run Playwright tests with tunnel (with --test flag)
 * 
 * Usage:
 *   node browserstack-tunnel.mjs                    # Test connectivity
 *   node browserstack-tunnel.mjs --test             # Run screenshot tests
 *   node browserstack-tunnel.mjs --test functional  # Run functional tests
 *   node browserstack-tunnel.mjs --test all         # Run all tests
 */

import { Local } from 'browserstack-local';
import { chromium } from 'playwright';
import { execSync } from 'child_process';
import cp from 'child_process';

export const TUNNEL_IDENTIFIER = 'react-app-tunnel';

// Get Playwright version for BrowserStack compatibility
const clientPlaywrightVersion = cp.execSync('npx playwright --version').toString().trim().split(' ')[1];

// BrowserStack capabilities for connectivity test
const caps = {
    'browser': 'edge',
    'os': 'osx',
    'os_version': 'catalina',
    'name': 'Playwright Local Tunnel Test',
    'build': 'playwright-tunnel-test',
    'browserstack.local': 'true',
    'browserstack.localIdentifier': TUNNEL_IDENTIFIER,
    'browserstack.username': process.env.BROWSERSTACK_USERNAME,
    'browserstack.accessKey': process.env.BROWSERSTACK_ACCESS_KEY,
    'client.playwrightVersion': clientPlaywrightVersion
};

// Start BrowserStack Local tunnel
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

// Stop BrowserStack Local tunnel
export const stopTunnel = bsLocal =>
    new Promise((resolve, reject) => {
        if (!bsLocal) return resolve();
        bsLocal.stop(err => err ? reject(err) : resolve());
    });

// Mark test status in BrowserStack
function markTestStatus(page, status, reason) {
    return page.evaluate(_ => {}, `browserstack_executor: ${JSON.stringify({ action: 'setSessionStatus', arguments: { status, reason }})}`);
}

// Test connectivity through the tunnel
export async function testConnectivity() {
    let page;
    let bsLocal;
    
    try {
        console.log('Starting BrowserStack Local tunnel...\n');
        bsLocal = await startTunnel();
        console.log(`✅ BrowserStack Local tunnel started: ${bsLocal.isRunning()}`);
        
        process.on('SIGINT', () => stopTunnel(bsLocal).then(() => process.exit(0)));
        
        console.log('Testing connectivity to localhost:3000 through tunnel...\n');
        const browser = await chromium.connect({ 
            wsEndpoint: `wss://cdp.browserstack.com/playwright?caps=${encodeURIComponent(JSON.stringify(caps))}`
        });
        
        page = await browser.newPage();
        await page.goto('http://localhost:3000');
        await page.waitForFunction(`document.querySelector("body")`);
        await markTestStatus(page, 'passed', 'Local tunnel is up and running');
        await browser.close();
        
        await stopTunnel(bsLocal);
        console.log('\n✅ Tunnel connectivity test passed! Your local server is accessible through BrowserStack.\n');
        return true;
    } catch (err) {
        page && await markTestStatus(page, 'failed', 'BrowserStack Local tunnel test failed');
        bsLocal && await stopTunnel(bsLocal);
        console.error('\n❌ Tunnel connectivity test failed');
        throw err;
    }
}

// Run tests with tunnel
async function runTestsWithTunnel(testType = 'screenshots', browser = 'chromium') {
    let bsLocal;
    let testsFailed = false;

    console.log(`Test Type:        ${testType}`);
    console.log(`Browser:          ${browser}`);
    console.log(`Tunnel ID:        ${TUNNEL_IDENTIFIER}`);
    console.log(`${'='.repeat(70)}\n`);

    const exitClean = async () => {
        try { 
            if (bsLocal) {
                console.log('\nStopping BrowserStack Local tunnel...');
                await stopTunnel(bsLocal);
                console.log('✅ Tunnel stopped.');
            }
        } catch (e) {
            console.error('Error stopping tunnel:', e.message);
        }
        process.exit(testsFailed ? 1 : 0);
    };

    try {
        console.log('Starting BrowserStack Local tunnel...\n');
        bsLocal = await startTunnel();
        console.log(`✅ Tunnel started and ready.\n`);
        
        process.on('SIGINT', exitClean); // Ctrl+C
        process.on('SIGTERM', exitClean); // kill

        // Determine which tests to run
        let command;
        const testFile = 'specs/app_visual.js';
        
        if (testType === 'functional') {
            command = 'jest specs/app_functional.js';
        } else if (testType === 'screenshots') {
            command = `jest ${testFile}`;
        } else if (testType === 'all') {
            command = `jest ${testFile} && jest specs/app_functional.js`;
        } else {
            throw new Error(`Invalid test type: ${testType}`);
        }

        console.log(`Running ${testType} tests on ${browser}...\n`);

        execSync(command, {
            stdio: 'inherit',
            cwd: new URL('.', import.meta.url).pathname,
            env: {
                ...process.env,
                USE_BROWSERSTACK_GRID: 'true',
                USE_LOCAL_TUNNEL: 'true',
                BROWSERSTACK_LOCAL_IDENTIFIER: TUNNEL_IDENTIFIER,
                GRID_BROWSER: browser
            }
        });

        console.log(`\n✅ Tests passed!\n`);
        await exitClean();
    } catch (error) {
        console.error(`\n❌ Tests failed!`);
        if (error.message) {
            console.error(`Error: ${error.message}`);
        }
        testsFailed = true;
        await exitClean();
    }
}

// Main execution
if (import.meta.url === `file://${process.argv[1]}`) {
    // Check for required environment variables
    if (!process.env.BROWSERSTACK_USERNAME || !process.env.BROWSERSTACK_ACCESS_KEY) {
        console.error('❌ Error: BROWSERSTACK_USERNAME and BROWSERSTACK_ACCESS_KEY must be set');
        console.error('   Please add them to your .env.local file or export them.');
        process.exit(1);
    }

    // Parse command line arguments
    const args = process.argv.slice(2);
    
    if (args.length === 0 || (args[0] !== '--test' && args[0] !== '--run')) {
        // Default mode: connectivity test
        console.log('Testing BrowserStack Local tunnel connectivity...\n');
        testConnectivity()
            .then(() => process.exit(0))
            .catch((err) => {
                console.error(err);
                process.exit(1);
            });
    } else {
        // Test mode: run actual tests
        const testType = args[1] || 'screenshots'; // 'screenshots', 'functional', or 'all'
        const browser = args[2] || 'chromium'; // browser name
        
        if (!['screenshots', 'functional', 'all'].includes(testType)) {
            console.error(`
❌ Invalid test type: ${testType}

Usage:
  node browserstack-tunnel.mjs                       # Test connectivity (default)
  node browserstack-tunnel.mjs --test                # Run screenshot tests
  node browserstack-tunnel.mjs --test functional     # Run functional tests
  node browserstack-tunnel.mjs --test all            # Run all tests
  node browserstack-tunnel.mjs --test screenshots chromium  # Specify browser

Valid test types: screenshots, functional, all
Valid browsers: chromium, firefox, webkit
`);
            process.exit(1);
        }

        runTestsWithTunnel(testType, browser);
    }
}

