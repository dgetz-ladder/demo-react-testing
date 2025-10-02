#!/usr/bin/env node

/**
 * BrowserStack Tunnel Test Runner
 * 
 * Manages the complete lifecycle of running tests with BrowserStack Local tunnel:
 * 1. Starts the BrowserStack Local tunnel
 * 2. Runs the specified test suite(s)
 * 3. Stops the tunnel when tests complete
 */

import { startTunnel, stopTunnel, TUNNEL_IDENTIFIER } from './start-browserstack-tunnel.mjs';
import { execSync } from 'child_process';

// Parse command line arguments
const args = process.argv.slice(2);
const framework = args[0]; // 'selenium' or 'playwright'
const testType = args[1] || 'screenshots'; // 'screenshots', 'functional', or 'all'
const browser = args[2]; // Optional: specific browser (e.g., 'chrome', 'chromium')

// Validation
if (!framework || !['selenium', 'playwright'].includes(framework)) {
    console.error(`
Usage: node browserstack-tunnel-runner.mjs <framework> [testType] [browser]

Arguments:
  framework   - Required: 'selenium' or 'playwright'
  testType    - Optional: 'screenshots' (default), 'functional', or 'all'
  browser     - Optional: specific browser to test (e.g., 'chrome', 'chromium')

Examples:
  node browserstack-tunnel-runner.mjs playwright
  node browserstack-tunnel-runner.mjs selenium screenshots chrome
  node browserstack-tunnel-runner.mjs playwright all chromium
`);
    process.exit(1);
}

// Check for required environment variables
if (!process.env.BROWSERSTACK_USERNAME || !process.env.BROWSERSTACK_ACCESS_KEY) {
    console.error('❌ Error: BROWSERSTACK_USERNAME and BROWSERSTACK_ACCESS_KEY must be set');
    process.exit(1);
}

console.log(`\n${'='.repeat(70)}`);
console.log('🚀 BrowserStack Tunnel Test Runner');
console.log(`${'='.repeat(70)}`);
console.log(`Framework:        ${framework.toUpperCase()}`);
console.log(`Test Type:        ${testType}`);
console.log(`Browser:          ${browser || 'default (chromium/chrome)'}`);
console.log(`Tunnel ID:        ${TUNNEL_IDENTIFIER}`);
console.log(`${'='.repeat(70)}\n`);

let bsLocal;
let testsFailed = false;

function runTests(framework) {
    const testFile = framework === 'selenium' 
        ? 'specs/selenium_screenshot_tests.js'
        : 'specs/playwright_screenshot_tests.js';
    
    const defaultBrowser = framework === 'selenium' ? 'chrome' : 'chromium';
    const browserToTest = browser || defaultBrowser;

    console.log(`📋 Running ${framework.toUpperCase()} ${testType} tests on ${browserToTest}...`);

    let command;
    if (testType === 'functional') {
        command = 'jest specs/test_app.js';
    } else if (testType === 'screenshots') {
        command = `jest ${testFile}`;
    } else {
        // Run all tests
        command = `jest ${testFile} && jest specs/test_app.js`;
    }

    try {
        execSync(command, {
            stdio: 'inherit',
            cwd: new URL('.', import.meta.url).pathname,
            env: {
                ...process.env,
                USE_BROWSERSTACK_GRID: 'true',
                USE_LOCAL_TUNNEL: 'true',
                BROWSERSTACK_LOCAL_IDENTIFIER: TUNNEL_IDENTIFIER,
                GRID_BROWSER: browserToTest
            }
        });
        console.log(`\n✅ ${framework.toUpperCase()} tests passed!\n`);
    } catch (error) {
        console.error(`\n❌ ${framework.toUpperCase()} tests failed!\n`);
        testsFailed = true;
    }
}

async function runTestSuite() {
    const exitClean = async () => {
        try { bsLocal && await stopTunnel(bsLocal) } catch (e) {}
        process.exit(testsFailed ? 1 : 0);
    };

    try {
        console.log('⏳ Starting BrowserStack Local tunnel...\n');
        bsLocal = await startTunnel();
        process.on('SIGINT', exitClean); // C-c
        process.on('SIGTERM', exitClean); // kill
        console.log('Tunnel is ready. Starting tests...');
        //await new Promise(resolve => setTimeout(resolve, 2000)); // wait for browserstack to be actually ready?
        runTests(framework);
        exitClean();
    } catch (error) {
        console.error('❌ Fatal error:', error.message);
        console.error(error.stack);
        exitClean();
    }
}

runTestSuite();