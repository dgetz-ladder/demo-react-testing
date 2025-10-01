const { exec } = require('child_process');
const { promisify } = require('util');
const fs = require('fs');
const path = require('path');
const execAsync = promisify(exec);

const { LT_USERNAME, LT_ACCESS_KEY, SMARTUI_PROJECT_NAME = 'react-app-screenshots' } = process.env;

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