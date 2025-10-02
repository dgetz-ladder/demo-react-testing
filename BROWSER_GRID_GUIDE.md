# Browser Grid Testing Guide

This guide explains how to use browser grids with Percy and LambdaTest SmartUI for cross-browser visual regression testing.

## Overview

This project now supports running visual regression tests on vendor-managed browser grids:

1. **Percy** - Cloud rendering infrastructure OR BrowserStack real browser grid
2. **LambdaTest SmartUI** - Cloud browser grid

## Percy Browser Grid

Percy offers **two approaches** for cross-browser visual testing:

### Approach 1: Percy Snapshot API (Cloud Rendering) ⚡ RECOMMENDED

**How It Works:**
1. Your tests run in **one** browser (local or CI)
2. Percy captures the **DOM snapshot**
3. Percy **renders** that snapshot across multiple browsers on their servers
4. Percy compares renderings against your baselines

**Key Benefits:**
- ✅ Fast: Single test run
- ✅ Simple: No grid setup needed
- ✅ Cost-effective: One snapshot → N browsers
- ✅ Consistent snapshots across all browsers

**Configuration:**

Browser rendering is configured in Percy's dashboard or via `percyOptions`:

```javascript
percyOptions: {
    widths: [375, 1280],           // Responsive viewports
    minHeight: 1024,
    enableJavaScript: true
}
```

Percy automatically renders across browsers (Chrome, Firefox, Safari, Edge) based on your project settings.

**Running Tests:**

```bash
# Selenium with Percy (local browser, Percy cloud rendering)
npm run e2e:selenium:screenshots:percy

# Playwright with Percy (local browser, Percy cloud rendering)
npm run e2e:playwright:screenshots:percy
```

**Environment Variables:**

```bash
PERCY_TOKEN=your_percy_token
USE_PERCY=true
```

---

### Approach 2: Percy on Automate (BrowserStack Grid) 🌐

**How It Works:**
1. Your tests run on **BrowserStack's real browsers**
2. Percy captures screenshots during **actual browser execution**
3. Percy compares against your baselines
4. BrowserStack records videos and logs

**Key Benefits:**
- ✅ Real browsers: Actual Chrome, Firefox, Safari, Edge
- ✅ Real devices: iOS, Android devices
- ✅ Network conditions: Throttling, offline mode
- ✅ Geolocation: Test from different regions
- ✅ Advanced debugging: Videos, network logs, console logs

**When to Use Percy on Automate:**
- Real browser validation (not just rendering)
- Device-specific testing (iOS Safari, Android Chrome)
- Complex browser interactions
- Network/geolocation testing
- Debugging real browser issues

**Running Tests:**

```bash
# Selenium - Single browser on BrowserStack grid
npm run e2e:selenium:grid:percy

# Selenium - All browsers on BrowserStack grid
npm run e2e:selenium:grid:percy:all

# Playwright - Single browser on BrowserStack grid
npm run e2e:playwright:grid:percy

# Playwright - All browsers on BrowserStack grid
npm run e2e:playwright:grid:percy:all
```

**Environment Variables:**

```bash
PERCY_TOKEN=your_percy_token
BROWSERSTACK_USERNAME=your_browserstack_username
BROWSERSTACK_ACCESS_KEY=your_browserstack_access_key
USE_BROWSERSTACK_GRID=true
USE_PERCY=true
GRID_BROWSER=chrome  # or firefox, safari, edge, chromium, webkit
```

**Percy on Automate Setup:**
1. Sign up for both Percy and BrowserStack
2. Link your Percy project to BrowserStack in Percy dashboard
3. Set environment variables (above)
4. Run tests - Percy automatically detects BrowserStack sessions

**Which Percy Approach to Choose?**

| Use Case | Recommended Approach |
|----------|---------------------|
| Fast feedback on UI changes | Percy Snapshot API |
| Cross-browser rendering validation | Percy Snapshot API |
| CI/CD pipeline | Percy Snapshot API |
| Need real browser behavior | Percy on Automate |
| Testing device-specific features | Percy on Automate |
| Complex JavaScript interactions | Percy on Automate |
| Network/geolocation testing | Percy on Automate |
| Debugging browser-specific issues | Percy on Automate |

---

## LambdaTest SmartUI Browser Grid

### How It Works

LambdaTest provides a **real browser execution grid** with two usage modes:

#### Mode 1: Local Screenshots + SmartUI Upload (Current Default)
- Tests run on your local browser
- Screenshots captured locally
- Uploaded to SmartUI for visual comparison

#### Mode 2: Remote Browser Grid Execution (New!)
- Tests run on **LambdaTest's cloud browsers**
- Execute across Chrome, Firefox, Safari, Edge, mobile browsers
- Screenshots captured on remote browsers
- Can optionally upload to SmartUI

### Supported Browsers

#### Selenium Grid Browsers
- `chrome` - Windows 10, Chrome Latest
- `firefox` - Windows 10, Firefox Latest
- `safari` - macOS Ventura, Safari Latest
- `edge` - Windows 10, Edge Latest
- `chromeMobile` - Android Galaxy S21, Chrome

#### Playwright Grid Browsers
- `chromium` - Windows 10, Chrome Latest
- `firefox` - Windows 10, Firefox Latest
- `webkit` - macOS Ventura, Safari Latest

### Running Tests

#### Local Screenshots → SmartUI Upload

```bash
# Selenium
npm run e2e:selenium:screenshots:smartui

# Playwright
npm run e2e:playwright:screenshots:smartui
```

#### Remote Browser Grid → SmartUI Upload

**Single Browser:**
```bash
# Selenium - Single browser (Chrome)
npm run e2e:selenium:grid:smartui

# Playwright - Single browser (Chromium)
npm run e2e:playwright:grid:smartui
```

**All Browsers:**
```bash
# Selenium - Chrome, Firefox, Safari, Edge
npm run e2e:selenium:grid:smartui:all

# Playwright - Chromium, Firefox, WebKit
npm run e2e:playwright:grid:smartui:all
```

**Custom Browser:**
```bash
# Selenium
export USE_LAMBDATEST_GRID=true
export USE_SMARTUI=true
export GRID_BROWSER=firefox
npm run e2e:selenium:screenshots

# Playwright
export USE_LAMBDATEST_GRID=true
export USE_SMARTUI=true
export GRID_BROWSER=webkit
npm run e2e:playwright:screenshots
```

### Environment Variables

Create a `.env.local` file:

```bash
# LambdaTest Credentials
LT_USERNAME=your_username
LT_ACCESS_KEY=your_access_key

# SmartUI Project
SMARTUI_PROJECT_NAME=react-app-screenshots

# Grid Execution
USE_LAMBDATEST_GRID=true
USE_SMARTUI=true
GRID_BROWSER=chrome  # or firefox, safari, edge, chromeMobile, chromium, webkit
```

---

## Comparison: Percy vs LambdaTest

| Feature | Percy Snapshot API | Percy on Automate | LambdaTest SmartUI |
|---------|-------------------|-------------------|-------------------|
| **Execution** | Local browser | BrowserStack grid | Local OR LambdaTest grid |
| **Cross-browser** | Cloud rendering | Real browser execution | Real browser execution |
| **Grid Provider** | Percy cloud | BrowserStack | LambdaTest |
| **Browsers** | Chrome, Firefox, Safari, Edge | Chrome, Firefox, Safari, Edge | Chrome, Firefox, Safari, Edge, Mobile |
| **Speed** | Fast (single run) | Slower (multiple runs) | Slower (multiple runs) |
| **Accuracy** | DOM-based rendering | Pixel-perfect (real browsers) | Pixel-perfect (real browsers) |
| **Mobile Testing** | Viewport emulation | Real iOS/Android devices | Real devices available |
| **Setup Complexity** | Simple | Moderate (2 accounts) | Moderate |
| **Debugging** | DOM snapshots | Videos, logs, network | Videos, logs, network |
| **Cost Model** | Per snapshot | BrowserStack + Percy | Per minute |
| **Best For** | Fast feedback, CI/CD | Real browser validation | Complete grid solution |

---

## Architecture

### File Structure

```
e2e/
├── playwright.config.js       # Playwright local & grid config
├── selenium.config.js         # Selenium local & grid config
├── specs/
│   ├── playwright_screenshot_tests.js  # Auto-detects local/grid
│   └── selenium_screenshot_tests.js    # Auto-detects local/grid
└── utils/
    ├── percy-adapter.js       # Percy cloud rendering
    ├── smartui-adapter.js     # SmartUI upload
    ├── playwright-screenshots.js
    ├── selenium-screenshots.js
    ├── screenshot-comparison.js
    └── grid-runner.js         # Multi-browser runner
```

### Configuration Flow

```
┌─────────────────────┐
│   Test Execution    │
└──────────┬──────────┘
           │
           ├─── USE_PERCY=true ──────► Percy (cloud rendering)
           │
           ├─── USE_SMARTUI=true ────► SmartUI (upload)
           │
           └─── USE_LAMBDATEST_GRID=true
                      │
                      ├─── Selenium ──► LambdaTest Selenium Grid
                      └─── Playwright ─► LambdaTest Playwright Grid
```

---

## Examples

### Example 1: Percy Snapshot API (Cloud Rendering)

```bash
# Run once locally, Percy renders across all browsers
export PERCY_TOKEN=your_token
npm run e2e:selenium:screenshots:percy
```

Result: Percy captures DOM → Renders on Chrome, Firefox, Safari, Edge (cloud)

### Example 1b: Percy on Automate (Real Browsers)

```bash
# Run on BrowserStack's real browsers with Percy
export PERCY_TOKEN=your_percy_token
export BROWSERSTACK_USERNAME=your_username
export BROWSERSTACK_ACCESS_KEY=your_key
npm run e2e:selenium:grid:percy:all
```

Result: Tests execute on BrowserStack's Chrome, Firefox, Safari, Edge → Percy captures and compares

### Example 2: LambdaTest All Browsers

```bash
# Run on 4 real browsers in LambdaTest cloud
export LT_USERNAME=your_username
export LT_ACCESS_KEY=your_key
npm run e2e:selenium:grid:smartui:all
```

Result: Tests execute on Chrome, Firefox, Safari, Edge (real browsers)

### Example 3: Mixed Approach

```bash
# Local execution + Percy rendering
npm run e2e:selenium:screenshots:percy

# Then, validate on real browsers
npm run e2e:selenium:grid:smartui
```

---

## Best Practices

1. **Use Percy for fast feedback** - Single test run, cross-browser rendering
2. **Use LambdaTest grid for validation** - Real browser execution when needed
3. **Start local** - Test locally before using cloud resources
4. **Parallel execution** - Run multiple browsers simultaneously on CI
5. **Cost optimization** - Percy is typically more cost-effective for cross-browser

---

## Troubleshooting

### Percy Issues

**Error: Percy token not found**
```bash
export PERCY_TOKEN=your_percy_token
```

**Error: Percy SDK not installed**
```bash
npm install @percy/playwright @percy/selenium-webdriver
```

### LambdaTest Issues

**Error: LambdaTest credentials not found**
```bash
export LT_USERNAME=your_username
export LT_ACCESS_KEY=your_access_key
```

**Error: Connection timeout**
- Check your LambdaTest account status
- Verify credentials are correct
- Check network connectivity

**Error: Browser not available**
- Check supported browsers in config files
- Selenium: chrome, firefox, safari, edge, chromeMobile
- Playwright: chromium, firefox, webkit

---

## CI/CD Integration

### GitHub Actions Example

```yaml
- name: Run Percy Tests
  env:
    PERCY_TOKEN: ${{ secrets.PERCY_TOKEN }}
  run: npm run e2e:selenium:screenshots:percy

- name: Run LambdaTest Grid Tests
  env:
    LT_USERNAME: ${{ secrets.LT_USERNAME }}
    LT_ACCESS_KEY: ${{ secrets.LT_ACCESS_KEY }}
  run: npm run e2e:selenium:grid:smartui:all
```

---

## Resources

- [Percy Documentation](https://docs.percy.io)
- [LambdaTest Documentation](https://www.lambdatest.com/support/docs/)
- [Selenium Grid Guide](https://www.selenium.dev/documentation/grid/)
- [Playwright Testing](https://playwright.dev)

