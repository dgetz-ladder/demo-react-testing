# BrowserStack Tunnel Integration Guide

This guide explains how to run your test suites on BrowserStack's managed browser grid using the BrowserStack Local tunnel to access your locally running application.

## Overview

The BrowserStack tunnel integration allows you to:
- Test your local development server on BrowserStack's real browsers
- Run automated visual regression tests using BrowserStack's browser grid
- Maintain secure tunnel connections during test execution
- Execute both Playwright and Selenium tests with tunnel support

## Prerequisites

1. **BrowserStack Account**: You need a BrowserStack account with Automate enabled
2. **Environment Variables**: Set your credentials in `.env.local`:
   ```bash
   BROWSERSTACK_USERNAME=your_username
   BROWSERSTACK_ACCESS_KEY=your_access_key
   ```
3. **Local Server Running**: Your React app should be running on `http://localhost:3000`

## Quick Start

### 1. Start Your Development Server

```bash
npm start
```

### 2. Run Tests with Tunnel

```bash
# Run Playwright tests (default)
npm run e2e:browserstack:tunnel

# Run Selenium tests
npm run e2e:browserstack:tunnel:selenium
```

## Available NPM Scripts

| Script | Description |
|--------|-------------|
| `npm run e2e:browserstack:tunnel` | Run Playwright screenshot tests with tunnel |
| `npm run e2e:browserstack:tunnel:selenium` | Run Selenium screenshot tests with tunnel |
| `npm run browserstack:connectivity` | Test tunnel connectivity only |

## Advanced Usage

### Testing Specific Browsers

You can specify a particular browser to test:

```bash
# Playwright browsers: chromium, firefox, webkit
cd e2e && node browserstack-tunnel-runner.mjs playwright screenshots chromium

# Selenium browsers: chrome, firefox, safari, edge
cd e2e && node browserstack-tunnel-runner.mjs selenium screenshots chrome
```

### Test Types

The tunnel runner supports different test types:

```bash
# Screenshot tests only (default)
node browserstack-tunnel-runner.mjs playwright screenshots

# Functional tests only
node browserstack-tunnel-runner.mjs playwright functional

# All tests
node browserstack-tunnel-runner.mjs playwright all
```

## How It Works

### Architecture

```
┌─────────────────┐         ┌──────────────────┐
│  Local Server   │◄────────┤  BS Local Binary │
│  (localhost)    │         │    (Tunnel)       │
└─────────────────┘         └──────────────────┘
                                     ▲
                                     │ Secure Connection
                                     │
                            ┌────────┴──────────┐
                            │  BrowserStack     │
                            │  Browser Grid     │
                            └───────────────────┘
```

### Workflow

1. **Tunnel Startup**: The runner starts the BrowserStack Local tunnel binary
2. **Connection**: Establishes secure connection with tunnel identifier `react-app-tunnel`
3. **Test Execution**: Runs your test suite(s) on BrowserStack browsers
4. **Cleanup**: Automatically stops the tunnel when tests complete

### Configuration

The tunnel uses these settings (configured in `e2e/start-browserstack-tunnel.mjs`):

```javascript
{
  localIdentifier: 'react-app-tunnel',  // Unique tunnel ID
  verbose: true,                         // Detailed logging
  force: 'true',                         // Force new tunnel
  onlyAutomate: true                     // Automation-only mode
}
```

## Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `BROWSERSTACK_USERNAME` | Your BrowserStack username | Yes | - |
| `BROWSERSTACK_ACCESS_KEY` | Your BrowserStack access key | Yes | - |
| `USE_BROWSERSTACK_GRID` | Enable BrowserStack grid | Auto | `true` |
| `USE_LOCAL_TUNNEL` | Enable tunnel mode | Auto | `true` |
| `BROWSERSTACK_LOCAL_IDENTIFIER` | Tunnel identifier | No | `react-app-tunnel` |
| `GRID_BROWSER` | Browser to test | No | `chromium/chrome` |

## Debugging

### Enable Verbose Logging

The tunnel runs with verbose logging by default. Check the console output for:

```
✅ BrowserStack Local tunnel started: true
[Playwright Grid] Connecting to BrowserStack browser: chromium
[Playwright Grid] Platform: Windows 10
```

### Common Issues

#### Tunnel Connection Fails

**Problem**: Tunnel fails to connect
```
Error: Could not start tunnel
```

**Solutions**:
- Verify credentials are correct
- Check firewall/network settings
- Ensure BrowserStack Local binary downloaded correctly
- Try with `force: 'true'` (already enabled)

#### Tests Can't Access localhost

**Problem**: Tests timeout or can't reach localhost
```
TimeoutError: page.goto: Timeout 30000ms exceeded
```

**Solutions**:
- Verify local server is running on port 3000
- Check tunnel is running before tests start
- Ensure `localIdentifier` matches in capabilities
- Verify `USE_LOCAL_TUNNEL` environment variable is set

#### Multiple Tunnels Conflict

**Problem**: Previous tunnel still running
```
Error: Another tunnel is already running
```

**Solutions**:
- Use `force: 'true'` flag (already enabled)
- Manually stop previous tunnel processes
- Wait for previous tunnel to fully shut down

### Test Tunnel Connectivity

Run a quick connectivity test:

```bash
npm run browserstack:connectivity
```

This will:
1. Start the tunnel
2. Connect to BrowserStack
3. Load your local app
4. Report success/failure
5. Stop the tunnel

## Integration with CI/CD

### Example GitHub Actions Workflow

```yaml
name: BrowserStack Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Install dependencies
        run: npm install
      
      - name: Start server in background
        run: npm start &
        
      - name: Wait for server
        run: npx wait-on http://localhost:3000
      
      - name: Run BrowserStack tests
        env:
          BROWSERSTACK_USERNAME: ${{ secrets.BROWSERSTACK_USERNAME }}
          BROWSERSTACK_ACCESS_KEY: ${{ secrets.BROWSERSTACK_ACCESS_KEY }}
        run: npm run e2e:browserstack:tunnel:both
```

## File Structure

```
e2e/
├── start-browserstack-tunnel.mjs      # Tunnel management functions
├── browserstack-tunnel-runner.mjs     # Test orchestration with tunnel
├── grid-capabilities.js                # Browser capabilities config
├── playwright.config.js                # Playwright grid config
├── selenium.config.js                  # Selenium grid config
└── specs/
    ├── playwright_screenshot_tests.js  # Playwright visual tests
    └── selenium_screenshot_tests.js    # Selenium visual tests
```

## Best Practices

1. **Always start local server first**: Ensure your app is running before starting tests
2. **Use specific browsers**: Test on specific browsers first, then expand
3. **Monitor tunnel logs**: Watch for connection issues in verbose output
4. **Clean shutdown**: The runner handles cleanup automatically, but Ctrl+C works too
5. **Unique identifiers**: Keep the default `react-app-tunnel` identifier unless you need multiple tunnels

## Troubleshooting Commands

```bash
# Check if tunnel is running
ps aux | grep BrowserStackLocal

# Kill stuck tunnel processes
pkill -f BrowserStackLocal

# Test with minimal setup
cd e2e && node start-browserstack-tunnel.mjs

# Run with debug output
DEBUG=* npm run browserstack:connectivity
```

## Next Steps

- **Multi-browser testing**: Run tests across all BrowserStack browsers
- **Percy integration**: Combine with Percy for visual snapshot testing
- **Parallel execution**: Run multiple browsers simultaneously
- **Custom capabilities**: Modify browser capabilities in `grid-capabilities.js`

## Support

- **BrowserStack Docs**: https://www.browserstack.com/docs/automate/playwright
- **Tunnel Docs**: https://www.browserstack.com/local-testing/automate
- **Project Issues**: Check project README or create an issue

## Summary

The BrowserStack tunnel integration provides seamless testing of your local application on real browsers in the cloud. The automated tunnel management ensures reliable connections while the unified runner handles the complete test lifecycle from tunnel startup to cleanup.

**Key Benefits**:
- ✅ Automated tunnel lifecycle management
- ✅ Support for both Playwright and Selenium
- ✅ Multiple browser and test type options
- ✅ Secure local testing on real browsers
- ✅ CI/CD ready

