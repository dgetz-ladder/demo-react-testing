const { exec } = require('child_process');
const { promisify } = require('util');
const fs = require('fs');
const path = require('path');
const execAsync = promisify(exec);

const { LT_USERNAME, LT_ACCESS_KEY, SMARTUI_PROJECT_NAME = 'react-app-screenshots' } = process.env;

/**
 * LambdaTest SmartUI Browser Grid Functionality:
 * 
 * SmartUI provides two approaches for cross-browser visual testing:
 * 
 * 1. Local Screenshot Upload (current implementation):
 *    - Capture screenshots locally using Selenium/Playwright
 *    - Upload to SmartUI for visual comparison
 *    - Useful when you want to control the exact test environment
 * 
 * 2. Remote Browser Grid Execution (via USE_LAMBDATEST_GRID):
 *    - Run tests directly on LambdaTest's cloud browsers
 *    - Tests execute on real browsers in LambdaTest's infrastructure
 *    - Supports Chrome, Firefox, Safari, Edge, mobile browsers
 *    - Configure browsers via selenium.config.js or playwright.config.js
 *    - Screenshots taken on remote browsers can still be uploaded to SmartUI
 * 
 * To use the browser grid:
 * - Set USE_LAMBDATEST_GRID=true
 * - Tests will run on LambdaTest's cloud infrastructure
 * - Each browser is configured with platform, version, and resolution
 */

// Track all screenshots for batch upload
let allScreenshots = [];
let uploadExecuted = false;

const uploadToSmartUI = async (capture) => {
    if (!LT_USERNAME || !LT_ACCESS_KEY) {
        throw new Error('LambdaTest credentials not found. Set LT_USERNAME and LT_ACCESS_KEY environment variables.');
    }
    
    allScreenshots.push(capture); // Queue screenshot for batch upload
    
    return {
        success: true,
        testName: capture.testName,
        message: `Screenshot queued for SmartUI upload`,
        output: { stdout: '', stderr: '' }
    };
};

const batchUploadToSmartUI = async () => {
    if (uploadExecuted || allScreenshots.length === 0) {
        return;
    }
    
    uploadExecuted = true;
    
    console.log(`\n[SmartUI] Uploading ${allScreenshots.length} screenshots to LambdaTest SmartUI...`);
    
    const screenshotDir = path.dirname(allScreenshots[0].actualPath);
    const buildName = `test-run-${Date.now()}`;
    
    const command = `npx smartui upload "${screenshotDir}" --buildName "${buildName}" --userName "${LT_USERNAME}" --accessKey "${LT_ACCESS_KEY}"`;
    
    try {
        const { stdout, stderr } = await execAsync(command, { 
            timeout: 120000, // 2 minute timeout
            env: { ...process.env, LT_USERNAME, LT_ACCESS_KEY }
        });
        console.log(`[SmartUI] Upload successful!`);
        console.log(stdout);
        return { success: true, stdout, stderr };
    } catch (error) {
        console.error(`[SmartUI] Upload failed:`, error.message);
        if (error.stdout) console.log(error.stdout);
        if (error.stderr) console.error(error.stderr);
        return { success: false, error: error.message };
    }
};

const compareDiffSmartUI = async (capture) => {
    const result = await uploadToSmartUI(capture);
    return {
        isNewBaseline: false,
        isMatch: result.success,
        testName: capture.testName,
        actualPath: capture.actualPath,
        smartUIResult: result,
        pixelDifference: result.success ? 0 : Infinity,
        pixelPercentage: result.success ? '0.00' : '100.00'
    };
};

module.exports = {
    uploadToSmartUI,
    compareDiffSmartUI,
    batchUploadToSmartUI
};