#!/usr/bin/env node

// Unified grid test runner
// Replaces many npm scripts with a single configurable runner

const { execSync } = require('child_process');
const { getAvailableBrowsers } = require('./grid-capabilities');

// Parse command line arguments
const args = process.argv.slice(2);
const framework = args[0]; // 'selenium' or 'playwright'
const grid = args[1]; // 'percy' or 'smartui'
const mode = args[2] || 'single'; // 'single' or 'all'

// Validation
if (!['selenium', 'playwright'].includes(framework)) {
    console.error('Usage: node run-grid-tests.js <selenium|playwright> <percy|smartui> [single|all]');
    process.exit(1);
}

if (!['percy', 'smartui'].includes(grid)) {
    console.error('Grid must be "percy" or "smartui"');
    process.exit(1);
}

// Determine grid type and environment variables
const isPercy = grid === 'percy';
const gridType = isPercy ? 'browserstack' : 'lambdatest';
const gridEnv = isPercy ? 'USE_BROWSERSTACK_GRID' : 'USE_LAMBDATEST_GRID';
const visualEnv = isPercy ? 'USE_PERCY' : 'USE_SMARTUI';

// Get browsers for the grid
const browsers = getAvailableBrowsers(gridType);
const defaultBrowser = framework === 'selenium' ? 'chrome' : 'chromium';
const browsersToTest = mode === 'all' ? browsers : [process.env.GRID_BROWSER || defaultBrowser];

console.log(`\n${'='.repeat(60)}`);
console.log(`Running ${framework.toUpperCase()} tests on ${gridType.toUpperCase()} grid`);
console.log(`Visual testing: ${grid.toUpperCase()}`);
console.log(`Browsers: ${browsersToTest.join(', ')}`);
console.log(`${'='.repeat(60)}\n`);

const testFile = framework === 'selenium' 
    ? 'specs/selenium_screenshot_tests.js'
    : 'specs/playwright_screenshot_tests.js';

const results = [];
let failedTests = 0;

for (const browser of browsersToTest) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`Testing on: ${browser}`);
    console.log(`${'='.repeat(60)}\n`);

    const startTime = Date.now();
    
    try {
        const envVars = {
            ...process.env,
            [gridEnv]: 'true',
            [visualEnv]: 'true',
            GRID_BROWSER: browser
        };

        // For Percy, wrap with percy exec
        const command = isPercy
            ? `npx percy exec -- jest ${testFile}`
            : `jest ${testFile}`;

        execSync(command, {
            stdio: 'inherit',
            cwd: __dirname,
            env: envVars
        });

        const duration = ((Date.now() - startTime) / 1000).toFixed(2);
        results.push({ browser, success: true, duration: `${duration}s` });
        
    } catch (error) {
        const duration = ((Date.now() - startTime) / 1000).toFixed(2);
        results.push({ browser, success: false, duration: `${duration}s`, error: error.message });
        failedTests++;
    }
}

// Print summary
console.log(`\n\n${'='.repeat(60)}`);
console.log('TEST SUMMARY');
console.log(`${'='.repeat(60)}\n`);

results.forEach(({ browser, success, duration, error }) => {
    const status = success ? '✅ PASSED' : '❌ FAILED';
    console.log(`${status} - ${browser.padEnd(15)} (${duration})`);
    if (error) {
        console.log(`         Error: ${error.substring(0, 80)}...`);
    }
});

const passedTests = results.length - failedTests;
console.log(`\nTotal: ${passedTests}/${results.length} browsers passed`);
console.log(`${'='.repeat(60)}\n`);

// Exit with appropriate code
process.exit(failedTests > 0 ? 1 : 0);

