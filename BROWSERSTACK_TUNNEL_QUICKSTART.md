# BrowserStack Tunnel - Quick Start

## Prerequisites ✅

1. Set environment variables in `.env.local`:
   ```bash
   BROWSERSTACK_USERNAME=your_username
   BROWSERSTACK_ACCESS_KEY=your_access_key
   ```

2. Start your React app:
   ```bash
   npm start
   ```

## Run Tests 🚀

### Simple Commands

```bash
# Playwright tests (recommended)
npm run e2e:browserstack:tunnel

# Selenium tests
npm run e2e:browserstack:tunnel:selenium
```

### What Happens?

1. ✅ **Starts tunnel** - Connects to BrowserStack Local
2. ✅ **Runs tests** - Executes your test suite on real browsers
3. ✅ **Stops tunnel** - Cleans up automatically

## Test Connectivity 🔍

Verify tunnel works before running full test suite:

```bash
npm run browserstack:connectivity
```

## Advanced Usage 🛠️

### Test specific browser

```bash
cd e2e

# Playwright
node browserstack-tunnel-runner.mjs playwright screenshots chromium
node browserstack-tunnel-runner.mjs playwright screenshots firefox
node browserstack-tunnel-runner.mjs playwright screenshots webkit

# Selenium
node browserstack-tunnel-runner.mjs selenium screenshots chrome
node browserstack-tunnel-runner.mjs selenium screenshots firefox
node browserstack-tunnel-runner.mjs selenium screenshots edge
```

### Available test types

```bash
screenshots  # Visual regression tests (default)
functional   # Functional tests only
all         # All test types
```

## Troubleshooting 🔧

### Tests fail to connect

```bash
# Check server is running
curl http://localhost:3000

# Verify credentials
echo $BROWSERSTACK_USERNAME
echo $BROWSERSTACK_ACCESS_KEY
```

### Tunnel won't start

```bash
# Kill any stuck processes
pkill -f BrowserStackLocal

# Try connectivity test
npm run browserstack:connectivity
```

### Need help?

See [BROWSERSTACK_TUNNEL_GUIDE.md](./BROWSERSTACK_TUNNEL_GUIDE.md) for complete documentation.

## Supported Browsers 🌐

### Playwright
- `chromium` - Google Chrome/Chromium
- `firefox` - Mozilla Firefox
- `webkit` - Apple Safari (WebKit)

### Selenium
- `chrome` - Google Chrome
- `firefox` - Mozilla Firefox
- `edge` - Microsoft Edge
- `safari` - Apple Safari

## Example Output 📊

```
══════════════════════════════════════════════════════════════════
🚀 BrowserStack Tunnel Test Runner
══════════════════════════════════════════════════════════════════
Framework:        PLAYWRIGHT
Test Type:        screenshots
Browser:          chromium
Tunnel ID:        react-app-tunnel
══════════════════════════════════════════════════════════════════

⏳ Starting BrowserStack Local tunnel...

✅ BrowserStack Local tunnel started: true

══════════════════════════════════════════════════════════════════
🌐 Tunnel is ready. Starting tests...
══════════════════════════════════════════════════════════════════

[Playwright Grid] Connecting to BrowserStack browser: chromium
[Playwright Grid] Platform: Windows 10

PASS specs/playwright_screenshot_tests.js
  Visual Regression Tests
    ✓ should match the full page screenshot (5234ms)
    ✓ should match the header section screenshot (2145ms)
    ✓ should match the React logo screenshot (1876ms)
    ✓ should match the mobile viewport screenshot (2543ms)
    ✓ should match the learn react link screenshot (1654ms)

Test Suites: 1 passed, 1 total
Tests:       5 passed, 5 total

✅ PLAYWRIGHT tests passed!

══════════════════════════════════════════════════════════════════
📊 Test Execution Complete
══════════════════════════════════════════════════════════════════

🛑 BrowserStack Local tunnel stopped

✅ All tests passed!
```

## Integration Summary 📝

| Component | Purpose |
|-----------|---------|
| `start-browserstack-tunnel.mjs` | Tunnel management functions |
| `browserstack-tunnel-runner.mjs` | Orchestrates tunnel + tests |
| `grid-capabilities.js` | Browser configurations with tunnel support |
| `playwright.config.js` | Playwright grid config with tunnel |
| `selenium.config.js` | Selenium grid config (uses capabilities) |

---

**That's it!** Your tests now run on real browsers in BrowserStack's cloud while accessing your local development server. 🎉

