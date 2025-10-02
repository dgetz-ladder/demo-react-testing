#!/usr/bin/env node

const lambdatestTunnel = require('@lambdatest/node-tunnel');

const { LT_USERNAME, LT_ACCESS_KEY } = process.env;

if (!LT_USERNAME || !LT_ACCESS_KEY) {
    console.error('❌ LambdaTest credentials not found');
    console.error('Set them in .env.local or export them:');
    console.error('export LT_USERNAME=your_username');
    console.error('export LT_ACCESS_KEY=your_key');
    process.exit(1);
}

console.log('🔐 Starting LambdaTest tunnel...\n');

const tunnelInstance = lambdatestTunnel({
    user: LT_USERNAME,
    key: LT_ACCESS_KEY,
    verbose: true,
    tunnelName: 'react-app-tunnel'
});

tunnelInstance.start((error) => {
    if (error) {
        console.error('❌ Failed to start tunnel:', error);
        process.exit(1);
    }

    console.log('\n✅ LambdaTest tunnel is running!');
    console.log('📍 Your localhost is now accessible to LambdaTest browsers');
    console.log('\n💡 Keep this terminal open while running grid tests');
    console.log('🛑 Press Ctrl+C to stop the tunnel\n');

    // Handle graceful shutdown
    process.on('SIGINT', () => {
        console.log('\n🛑 Stopping LambdaTest tunnel...');
        tunnelInstance.stop((error) => {
            if (error) {
                console.error('Error stopping tunnel:', error);
            } else {
                console.log('✅ Tunnel stopped');
            }
            process.exit(0);
        });
    });
});

