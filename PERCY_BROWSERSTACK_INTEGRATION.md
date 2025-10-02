# Percy on Automate - BrowserStack Grid Integration

## Summary

This document explains the **Percy on Automate** integration, which combines Percy's visual testing with BrowserStack's real browser grid execution.

## What is Percy on Automate?

Percy on Automate is Percy's integration with BrowserStack that allows you to:
- Run tests on **real browsers** in BrowserStack's cloud
- Capture visual snapshots during actual browser execution
- Get the debugging benefits of both platforms

## Two Ways to Use Percy

### 1. Percy Snapshot API (Default) ⚡

**How it works:**
- Tests run in ONE browser (local/CI)
- Percy captures DOM snapshot
- Percy renders across multiple browsers on their servers
- Fast, simple, cost-effective

**Use for:**
- Most visual regression testing
- Fast feedback in CI/CD
- Cross-browser rendering validation

**Command:**
```bash
npm run e2e:selenium:screenshots:percy
```

### 2. Percy on Automate (BrowserStack Grid) 🌐

**How it works:**
- Tests run on BrowserStack's REAL browsers
- Percy captures during actual execution
- Full browser debugging with videos/logs

**Use for:**
- Real browser behavior validation
- Device-specific testing (iOS, Android)
- Complex JavaScript interactions
- Network/geolocation testing
- Debugging browser-specific issues

**Command:**
```bash
npm run e2e:selenium:grid:percy:all
```

## Setup Instructions

### 1. Sign Up for Both Services

1. **Percy**: [percy.io](https://percy.io)
2. **BrowserStack**: [browserstack.com](https://www.browserstack.com)

### 2. Link Percy to BrowserStack

1. Go to Percy dashboard
2. Navigate to your project settings
3. Find "Integrations" section
4. Enable BrowserStack integration
5. Follow the linking instructions

### 3. Set Environment Variables

```bash
# Percy token (required)
PERCY_TOKEN=your_percy_token

# BrowserStack credentials (required for grid)
BROWSERSTACK_USERNAME=your_browserstack_username
BROWSERSTACK_ACCESS_KEY=your_browserstack_access_key

# Enable grid execution
USE_BROWSERSTACK_GRID=true
USE_PERCY=true

# Optional: Specify browser
GRID_BROWSER=chrome  # or firefox, safari, edge
```

### 4. Run Tests

```bash
# Single browser
export PERCY_TOKEN=your_token
export BROWSERSTACK_USERNAME=your_username
export BROWSERSTACK_ACCESS_KEY=your_key
npm run e2e:selenium:grid:percy

# All browsers
npm run e2e:selenium:grid:percy:all
```

## Supported Browsers

### Selenium + BrowserStack
- **chrome** - Windows 10, Chrome Latest
- **firefox** - Windows 10, Firefox Latest
- **safari** - macOS Ventura, Safari Latest
- **edge** - Windows 10, Edge Latest
- **chromeMobile** - Android Galaxy S23, Chrome

### Playwright + BrowserStack
- **chromium** - Windows 10, Chrome Latest
- **firefox** - Windows 10, Firefox Latest
- **webkit** - macOS Ventura, WebKit Latest

## Configuration Files

### Selenium Configuration
File: `/e2e/selenium.config.js`

```javascript
const browserStackCapabilities = {
    chrome: {
        'bstack:options': {
            os: 'Windows',
            osVersion: '10',
            browserVersion: 'latest',
            // ... more options
        },
        browserName: 'Chrome'
    },
    // ... more browsers
};
```

### Playwright Configuration
File: `/e2e/playwright.config.js`

```javascript
const browserStackCapabilities = {
    chromium: {
        'bstack:options': {
            os: 'Windows',
            osVersion: '10',
            browserVersion: 'latest',
            // ... more options
        },
        browser: 'chrome'
    },
    // ... more browsers
};
```

## How Percy Detects BrowserStack Sessions

Percy automatically detects BrowserStack sessions when:
1. Tests run on BrowserStack grid
2. Percy token is set
3. `percy exec` wrapper is used
4. Percy SDK is initialized in tests

Percy identifies the session through:
- BrowserStack session IDs
- Browser capabilities
- Build/session names

## Cost Considerations

### Percy Snapshot API
- Charged per snapshot
- One snapshot = testing across N browsers
- More cost-effective for cross-browser testing

### Percy on Automate
- Charged by BrowserStack (per minute) + Percy (per snapshot)
- Each browser execution counts separately
- More expensive but provides real browser execution

**Example:**
- **Snapshot API**: 1 test run = 1 snapshot cost
- **On Automate**: 4 browsers × 5 minutes = 20 BrowserStack minutes + 4 Percy snapshots

## Debugging

### BrowserStack Dashboard
- View live tests
- Watch session recordings
- Check network logs
- Review console logs
- Download HAR files

### Percy Dashboard
- Compare visual diffs
- Review snapshots
- See which browser had issues
- Link directly to BrowserStack session

## Troubleshooting

### Connection Failed

**Error**: "Failed to connect to BrowserStack"

**Solutions**:
1. Verify credentials are correct
2. Check BrowserStack account status
3. Ensure stable internet connection
4. Verify firewall isn't blocking connection

### Percy Not Detecting Session

**Error**: "Percy not capturing on BrowserStack"

**Solutions**:
1. Ensure `percy exec` wrapper is used
2. Verify Percy project is linked to BrowserStack
3. Check PERCY_TOKEN is set
4. Confirm BrowserStack session has started

### Browser Not Available

**Error**: "Unknown browser: safari"

**Solutions**:
1. Check browser name matches config (case-sensitive)
2. Verify BrowserStack plan supports the browser
3. Check OS/version combination is valid

## Best Practices

1. **Start with Percy Snapshot API**
   - Use for most visual regression testing
   - Faster feedback, lower cost

2. **Use Percy on Automate when needed**
   - Real browser validation
   - Device-specific issues
   - Debugging production issues

3. **Parallel Execution**
   - Run multiple browsers simultaneously
   - Reduce overall test time

4. **Smart Browser Selection**
   - Test on browsers your users actually use
   - Focus on browsers with known issues

5. **CI/CD Integration**
   - Use Snapshot API for fast feedback
   - Use On Automate for release validation

## Example Workflow

```bash
# 1. Fast feedback during development
npm run e2e:selenium:screenshots:percy

# 2. Validate on real browsers before release
npm run e2e:selenium:grid:percy:all

# 3. Debug specific browser issue
export USE_BROWSERSTACK_GRID=true
export GRID_BROWSER=safari
npm run e2e:selenium:screenshots:percy
```

## Resources

- [Percy Documentation](https://docs.percy.io)
- [Percy on Automate Guide](https://docs.percy.io/docs/browserstack-integration)
- [BrowserStack Documentation](https://www.browserstack.com/docs)
- [BrowserStack Capabilities](https://www.browserstack.com/automate/capabilities)

## Support

For issues:
- Percy: [support@percy.io](mailto:support@percy.io)
- BrowserStack: [support@browserstack.com](mailto:support@browserstack.com)

For project-specific issues, see [BROWSER_GRID_GUIDE.md](./BROWSER_GRID_GUIDE.md)

