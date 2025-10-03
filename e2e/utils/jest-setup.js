// Jest setup for E2E tests with Percy visual testing

// Percy finalization - clean up and report snapshots
afterAll(async () => {
    const { finalizePercy } = require('./percy-adapter');
    await finalizePercy();
}, 30000);
