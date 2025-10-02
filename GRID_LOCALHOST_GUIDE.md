# Grid Testing with Localhost

## The Problem

When running tests on **remote browser grids** (BrowserStack or LambdaTest), the browsers run in the cloud and **cannot access `localhost:3000`** on your machine.

## Three Solutions

### Option 1: Local Tunneling (✅ Best for Development)

Both services provide secure tunnels to route cloud browsers to your localhost.

#### BrowserStack Local

**Option A: Using npm (Recommended)** ✨

1. **Install dependencies** (already in package.json):
   ```bash
   npm install
   ```

2. **Start the tunnel:**
   ```bash
   npm run browserstack:connectivity
   ```
   
3. **In another terminal, run tests:**
   ```bash
   export USE_LOCAL_TUNNEL=true
   npm run e2e:selenium:grid percy single
   ```

**Option B: Using Binary**

1. **Download** [BrowserStack Local binary](https://www.browserstack.com/local-testing/automate)

2. **Start the tunnel:**
   ```bash
   ./BrowserStackLocal --key YOUR_ACCESS_KEY
   ```

3. **Run tests with tunnel enabled:**
   ```bash
   export USE_LOCAL_TUNNEL=true
   npm run e2e:selenium:grid percy single
   ```

#### LambdaTest Tunnel

**Option A: Using npm (Recommended)** ✨

1. **Install dependencies** (already in package.json):
   ```bash
   npm install
   ```

2. **Start the tunnel:**
   ```bash
   npm run lambdatest:connectivity
   ```
   
3. **In another terminal, run tests:**
   ```bash
   export USE_LOCAL_TUNNEL=true
   npm run e2e:selenium:grid smartui single
   ```

**Option B: Using Binary**

1. **Download** [LambdaTest Tunnel](https://www.lambdatest.com/support/docs/testing-locally-hosted-pages/)

2. **Start the tunnel:**
   ```bash
   ./LT --user YOUR_USERNAME --key YOUR_ACCESS_KEY
   ```

3. **Run tests with tunnel enabled:**
   ```bash
   export USE_LOCAL_TUNNEL=true
   npm run e2e:selenium:grid smartui single
   ```

### Option 2: Deploy to Public URL (✅ Best for CI/CD)

Deploy your app to a publicly accessible URL:

```bash
# Build and deploy
npm run build
# Deploy to Netlify, Vercel, etc.

# Update jest config to use public URL
# e2e/jest.config.js: baseURL: "https://your-app.netlify.app"

# Run tests (no tunnel needed)
npm run e2e:selenium:grid percy all
```

### Option 3: Use ngrok (Quick Testing)

For quick tests without setting up official tunnels:

```bash
# Install ngrok
brew install ngrok  # or download from ngrok.com

# Start your app
npm start

# Create tunnel in another terminal
ngrok http 3000

# Update jest config with ngrok URL
# e2e/jest.config.js: baseURL: "https://abc123.ngrok.io"

# Run tests
npm run e2e:selenium:grid percy all
```

## Configuration Details

The configs now check `USE_LOCAL_TUNNEL` environment variable:

```javascript
// When USE_LOCAL_TUNNEL=true:
// - BrowserStack: sets local: 'true'
// - LambdaTest: sets tunnel: true
```

**Files updated:**
- `e2e/grid-capabilities.js` - Checks `USE_LOCAL_TUNNEL`
- All grid capabilities now support tunneling

## Quick Reference

| Scenario | Solution | Command |
|----------|----------|---------|
| **Local development** | BrowserStack/LT Tunnel | `USE_LOCAL_TUNNEL=true npm run e2e:selenium:grid percy single` |
| **CI/CD pipeline** | Deploy to public URL | Update baseURL in jest.config.js |
| **Quick test** | ngrok | Use ngrok URL in jest.config.js |

## Troubleshooting

### "Connection refused" or "Cannot connect"
- ✅ Make sure tunnel binary is running
- ✅ Verify `USE_LOCAL_TUNNEL=true` is set
- ✅ Check app is running on localhost:3000

### Tunnel not working
- ✅ Verify credentials are correct
- ✅ Check tunnel logs for errors
- ✅ Ensure only one tunnel is running

### Tests timeout
- ✅ Increase timeout in jest.config.js
- ✅ Check tunnel connection is stable
- ✅ Verify app loads in your local browser first

## Recommended Workflow

**For Development (npm method):** ✨
```bash
# Terminal 1: Start app
npm start

# Terminal 2: Start tunnel via npm
npm run browserstack:connectivity
# or
npm run lambdatest:connectivity

# Terminal 3: Run tests
export USE_LOCAL_TUNNEL=true
npm run e2e:selenium:grid percy single
```

**For Development (binary method):**
```bash
# Terminal 1: Start app
npm start

# Terminal 2: Start tunnel binary
./BrowserStackLocal --key YOUR_KEY

# Terminal 3: Run tests
export USE_LOCAL_TUNNEL=true
npm run e2e:selenium:grid percy single
```

**For CI/CD:**
```bash
# Deploy app first
npm run build && deploy-to-production

# Update baseURL in config to production URL
# Run tests without tunnel
npm run e2e:selenium:grid percy all
```

## Important Notes

⚠️ **Without one of these solutions, grid tests will fail** because remote browsers cannot reach localhost.

✅ The configs now support tunneling via `USE_LOCAL_TUNNEL=true`

✅ Choose the solution that fits your workflow:
- **Development**: Use official tunnels
- **CI/CD**: Use public deployments  
- **Quick tests**: Use ngrok

## Resources

- [BrowserStack Local Testing](https://www.browserstack.com/local-testing)
- [LambdaTest Tunnel](https://www.lambdatest.com/support/docs/testing-locally-hosted-pages/)
- [ngrok](https://ngrok.com/)

