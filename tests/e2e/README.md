# HomeHarbor E2E Testing

This directory contains end-to-end tests for the HomeHarbor React application using Playwright.

## Test Structure

```
tests/e2e/
├── homeharbor-frontend.spec.js    # Main UI workflow tests
├── ai-assistant.spec.js           # AI chat and analysis tests
├── accessibility.spec.js          # WCAG compliance tests
├── mock-server.js                 # Mock API server for testing
├── global-setup.js               # Test environment setup
└── global-teardown.js            # Test environment cleanup
```

## Running Tests

### Prerequisites

1. Install dependencies:
   ```bash
   npm install
   cd frontend && npm install && cd ..
   ```

2. Install Playwright browsers:
   ```bash
   npx playwright install
   ```

### Test Commands

```bash
# Run all E2E tests
npm run test:e2e

# Run tests with UI mode (interactive)
npm run test:e2e:ui

# Run tests in debug mode
npm run test:e2e:debug

# View test reports
npm run test:e2e:report

# Run full test suite (starts servers automatically)
npm run test:e2e:full
```

## Test Coverage

### Frontend Tests (`homeharbor-frontend.spec.js`)
- ✅ Application loads successfully
- ✅ Search form displays all filters
- ✅ Help modal functionality
- ✅ Property search and results display
- ✅ Property card information display
- ✅ AI chat interface presence
- ✅ Keyboard navigation
- ✅ Responsive design (mobile)

### AI Assistant Tests (`ai-assistant.spec.js`)
- ✅ AI assistant initialization
- ✅ Message sending and receiving
- ✅ Property analysis requests
- ✅ Chat history maintenance
- ✅ Empty message handling
- ✅ Typing indicators
- ✅ Error handling
- ✅ Context-aware suggestions

### Accessibility Tests (`accessibility.spec.js`)
- ✅ Proper heading structure
- ✅ Image alt text compliance
- ✅ Form label associations
- ✅ Button accessible names
- ✅ Keyboard navigation
- ✅ Focus indicators
- ✅ Screen reader announcements
- ✅ Modal accessibility
- ✅ Loading state announcements

## Mock Server

The mock server (`mock-server.js`) provides realistic test data:

- **Properties API**: `/api/properties` - Searchable property listings
- **AI Chat API**: `/api/ai/chat` - Simulated AI responses
- **AI Analysis API**: `/api/ai/analyze` - Property analysis responses
- **Health Check**: `/api/health` - Server status

## Configuration

Tests run against:
- **React App**: `http://localhost:3000` (Vite dev server)
- **Mock API**: `http://localhost:3001` (Express server)
- **Browsers**: Chromium, Firefox, Webkit
- **Viewport**: Desktop (1280x720) + Mobile (375x667)

## Best Practices Implemented

- **Test Isolation**: Each test starts with fresh state
- **User-Facing Locators**: Uses roles, labels, and text over CSS selectors
- **Web-First Assertions**: `toBeVisible()`, `toContainText()` over manual checks
- **Mock External Dependencies**: API calls use mock server
- **Cross-Browser Testing**: Runs on all major browsers
- **Accessibility Testing**: WCAG compliance verification
- **Performance Testing**: Includes loading state checks

## Debugging

### Visual Debugging
```bash
# Run tests with browser UI
npm run test:e2e:ui
```

### Step-by-Step Debugging
```bash
# Run specific test in debug mode
npx playwright test --debug accessibility.spec.js:10
```

### Trace Collection
```bash
# Run with tracing enabled
npx playwright test --trace on
```

## CI/CD Integration

Tests are configured for GitHub Actions with:
- Automatic browser installation
- Parallel test execution
- Trace collection on failures
- HTML report generation

See `.github/workflows/e2e.yml` for CI configuration.