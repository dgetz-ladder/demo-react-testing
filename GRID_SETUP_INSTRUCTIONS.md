# Browser Grid Setup Instructions

Quick setup guide for running tests on vendor browser grids.

## Prerequisites

1. **Percy Account** (for Percy cloud rendering)
   - Sign up at [percy.io](https://percy.io)
   - Get your `PERCY_TOKEN` from Settings

2. **BrowserStack Account** (for Percy on Automate - optional)
   - Sign up at [browserstack.com](https://www.browserstack.com)
   - Get your `BROWSERSTACK_USERNAME` and `BROWSERSTACK_ACCESS_KEY` from Dashboard
   - Link Percy project to BrowserStack in Percy dashboard

3. **LambdaTest Account** (for LambdaTest browser grid - optional)
   - Sign up at [lambdatest.com](https://www.lambdatest.com)
   - Get your `LT_USERNAME` and `LT_ACCESS_KEY` from Dashboard

## Environment Setup

Create a `.env.local` file in the project root:

```bash
# Percy Token (required for both Percy approaches)
PERCY_TOKEN=your_percy_token_here

# BrowserStack Credentials (for Percy on Automate)
BROWSERSTACK_USERNAME=your_browserstack_username
BROWSERSTACK_ACCESS_KEY=your_browserstack_access_key

# LambdaTest Credentials (for LambdaTest grid)
LT_USERNAME=your_lambdatest_username
LT_ACCESS_KEY=your_lambdatest_access_key

# SmartUI Project Name (optional)
SMARTUI_PROJECT_NAME=react-app-screenshots
```

## Verify Setup

Test your configuration:

```bash
# Test Percy Snapshot API (cloud rendering)
npm run e2e:selenium:screenshots:percy

# Test Percy on Automate (BrowserStack grid)
npm run e2e:selenium:grid:percy

# Test LambdaTest grid connection
npm run e2e:selenium:grid:smartui
```

## Quick Examples

### 1. Percy Snapshot API - Cloud Rendering ⚡

```bash
# Local browser → Percy cloud renders across all browsers
export PERCY_TOKEN=your_token
npm run e2e:selenium:screenshots:percy
```

**What happens:**
- ✅ Tests run once in Chrome (local)
- ✅ Percy captures DOM snapshot
- ✅ Percy renders on Chrome, Firefox, Safari, Edge (cloud)
- ✅ Visual comparisons done across all browsers
- ⚡ Fast: Single test run

### 2. Percy on Automate - BrowserStack Grid 🌐

```bash
# Run on BrowserStack's real browsers with Percy
export PERCY_TOKEN=your_percy_token
export BROWSERSTACK_USERNAME=your_username
export BROWSERSTACK_ACCESS_KEY=your_key
npm run e2e:selenium:grid:percy:all
```

**What happens:**
- ✅ Tests run on BrowserStack Chrome (Windows 10)
- ✅ Tests run on BrowserStack Firefox (Windows 10)
- ✅ Tests run on BrowserStack Safari (macOS)
- ✅ Tests run on BrowserStack Edge (Windows 10)
- ✅ Percy captures from each real browser execution
- ✅ BrowserStack records videos and logs

### 3. LambdaTest - Real Browser Grid

```bash
# Run on LambdaTest's real browsers
export LT_USERNAME=your_username
export LT_ACCESS_KEY=your_key
npm run e2e:selenium:grid:smartui:all
```

**What happens:**
- ✅ Tests execute on LambdaTest Chrome (Windows 10)
- ✅ Tests execute on LambdaTest Firefox (Windows 10)
- ✅ Tests execute on LambdaTest Safari (macOS)
- ✅ Tests execute on LambdaTest Edge (Windows 10)
- ✅ Screenshots uploaded to SmartUI
- ✅ LambdaTest records videos and logs

## Available Browsers

### Selenium Grid
- `chrome` - Windows 10, Chrome Latest
- `firefox` - Windows 10, Firefox Latest
- `safari` - macOS Ventura, Safari Latest
- `edge` - Windows 10, Edge Latest
- `chromeMobile` - Android Galaxy S21

### Playwright Grid
- `chromium` - Windows 10, Chrome Latest
- `firefox` - Windows 10, Firefox Latest
- `webkit` - macOS Ventura, Safari Latest

## Customizing Browser Configuration

Edit browser configurations in:
- **Selenium**: `e2e/selenium.config.js` → `lambdaTestCapabilities`
- **Playwright**: `e2e/playwright.config.js` → `lambdaTestCapabilities`

Example customization:

```javascript
chrome: {
    'LT:Options': {
        platform: 'Windows 11',      // Change OS
        browserName: 'Chrome',
        version: '120',              // Specific version
        resolution: '2560x1440',     // Higher resolution
        // ... other options
    }
}
```

## Running Specific Browsers

```bash
# Single browser
export USE_LAMBDATEST_GRID=true
export GRID_BROWSER=firefox
npm run e2e:selenium:screenshots

# Or use the convenience script
npm run e2e:selenium:grid:smartui  # Default: Chrome

# All browsers
npm run e2e:selenium:grid:smartui:all
```

## Troubleshooting

### "Percy token not found"
```bash
export PERCY_TOKEN=your_token
# Or add to .env.local
```

### "LambdaTest credentials not found"
```bash
export LT_USERNAME=your_username
export LT_ACCESS_KEY=your_key
# Or add to .env.local
```

### "Connection timeout"
- Verify credentials are correct
- Check LambdaTest dashboard for account status
- Ensure stable internet connection

### "Browser not available"
- Check supported browsers in config files
- Some browsers require specific LambdaTest plan tiers

## Cost Considerations

- **Percy**: Charges per snapshot (not per browser)
  - More cost-effective for cross-browser testing
  - Single test run = 1 snapshot × N browsers rendered

- **LambdaTest**: Charges per minute of browser usage
  - Each browser test counts separately
  - 4 browsers × 5 minutes = 20 minutes billed

## CI/CD Integration

### GitHub Actions

```yaml
name: Visual Tests

on: [push, pull_request]

jobs:
  percy-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: npm start &
      - name: Percy Tests
        env:
          PERCY_TOKEN: ${{ secrets.PERCY_TOKEN }}
        run: npm run e2e:selenium:screenshots:percy

  grid-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: npm start &
      - name: LambdaTest Grid Tests
        env:
          LT_USERNAME: ${{ secrets.LT_USERNAME }}
          LT_ACCESS_KEY: ${{ secrets.LT_ACCESS_KEY }}
        run: npm run e2e:selenium:grid:smartui:all
```

### GitLab CI

```yaml
percy-tests:
  script:
    - npm install
    - npm start &
    - npm run e2e:selenium:screenshots:percy
  variables:
    PERCY_TOKEN: $PERCY_TOKEN

grid-tests:
  script:
    - npm install
    - npm start &
    - npm run e2e:selenium:grid:smartui:all
  variables:
    LT_USERNAME: $LT_USERNAME
    LT_ACCESS_KEY: $LT_ACCESS_KEY
```

## Next Steps

1. ✅ Set up environment variables
2. ✅ Run local tests to verify functionality
3. ✅ Try Percy for fast cross-browser feedback
4. ✅ Use LambdaTest grid for real browser validation
5. ✅ Integrate into CI/CD pipeline

For detailed information, see [BROWSER_GRID_GUIDE.md](./BROWSER_GRID_GUIDE.md)

