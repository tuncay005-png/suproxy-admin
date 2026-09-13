# How to Run End-to-End Tests

## Quick Start

```bash
# 1. Ensure dev server is running
npm run dev

# 2. In a new terminal, install Playwright browsers (first time only)
npx playwright install

# 3. Run all E2E tests
npm run test:e2e

# 4. Run with interactive UI
npm run test:e2e:ui
```

## Test Files

### Comprehensive User Journey Tests
**File:** `tests/e2e/user-journey.spec.ts`

Covers complete user journeys including:
- Login → Dashboard → Xray pages
- Language switching (EN/RU)
- Real-time data updates
- Mobile/tablet/desktop responsive layouts
- Language persistence

```bash
npx playwright test tests/e2e/user-journey.spec.ts
```

### Quick Smoke Tests
**File:** `tests/e2e/quick-smoke-test.spec.ts`

Fast verification of core functionality:
- Dashboard loads
- Charts present
- Navigation works
- Xray pages accessible

```bash
npx playwright test tests/e2e/quick-smoke-test.spec.ts
```

## Running on Different Devices

```bash
# Mobile (iPhone 12 - 375x812)
npx playwright test --project="Mobile Chrome"

# Tablet (iPad Pro - 1024x768)
npx playwright test --project="Tablet"

# Desktop (1920x1080)
npx playwright test --project="Desktop"
```

## Debugging Tests

```bash
# Run in headed mode (see browser)
npx playwright test --headed

# Run in debug mode (step through)
npx playwright test --debug

# Run specific test
npx playwright test -g "dashboard loads"
```

## Manual Testing

For comprehensive manual testing, use the checklist:

1. Open `MANUAL_E2E_TESTING_CHECKLIST.md`
2. Start dev server: `npm run dev`
3. Open browser to http://localhost:3000
4. Follow checklist sections
5. Document findings

## Test Reports

After running tests, view the HTML report:

```bash
npx playwright show-report
```

## Troubleshooting

### Tests Timeout
- Increase timeout: `--timeout=60000`
- Check dev server is running
- Verify backend API is accessible

### Login Fails
- Check test credentials in `.env.local`
- Verify login endpoint is working
- Check browser console for errors

### Browsers Not Installed
```bash
npx playwright install
```

## CI/CD Integration

For continuous integration:

```bash
# Run with reduced workers and retries
npx playwright test --workers=1 --retries=2
```
