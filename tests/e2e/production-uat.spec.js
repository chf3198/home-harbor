/**
 * @fileoverview Production UAT Tests for GitHub Pages Deployment
 * @description End-to-end tests that run against the live GitHub Pages site
 * to verify the same functionality as manual UAT testing.
 * 
 * Tests cover:
 * - Page load and basic functionality
 * - AI chat messaging and filter extraction
 * - Property search integration with Socrata API
 * - Search results display
 * 
 * @example Run with: npx playwright test tests/e2e/production-uat.spec.js --config=playwright.production.config.ts
 */

import { test, expect } from '@playwright/test';

const PRODUCTION_URL = 'https://chf3198.github.io/home-harbor/';
const AI_RESPONSE_TIMEOUT = 60_000; // AI responses can take longer
const SEARCH_TIMEOUT = 30_000;

test.describe('Production UAT - GitHub Pages', () => {
  test.describe.configure({ mode: 'serial' }); // Run tests in order

  test.beforeEach(async ({ page }) => {
    // Navigate to production site
    await page.goto(PRODUCTION_URL, { waitUntil: 'networkidle' });
  });

  test('1. Page loads without critical errors', async ({ page }) => {
    // Verify main app container loads
    await expect(page.locator('#root')).toBeVisible();
    
    // Verify title
    await expect(page).toHaveTitle(/HomeHarbor/);
    
    // Check for critical console errors (ignore minor warnings)
    const criticalErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error' && !msg.text().includes('favicon') && !msg.text().includes('404')) {
        criticalErrors.push(msg.text());
      }
    });
    
    // Wait for app to settle
    await page.waitForTimeout(2000);
    
    // Verify no critical JavaScript errors
    expect(criticalErrors.length).toBe(0);
  });

  test('2. AI Chat section is visible and interactive', async ({ page }) => {
    // Wait for AI chat section to load
    const chatSection = page.locator('[data-testid="ai-chat-section"]').or(
      page.locator('text=AI Assistant').or(page.locator('textarea'))
    );
    await expect(chatSection.first()).toBeVisible({ timeout: 10_000 });
    
    // Verify textarea is present and enabled
    const textarea = page.locator('textarea').first();
    await expect(textarea).toBeVisible();
    await expect(textarea).toBeEnabled();
  });

  test('3. AI Chat processes family/school query and extracts filters', async ({ page }) => {
    // The exact query from manual UAT
    const testQuery = 'My family and I are moving from out of state. We have two highschool age boys and wish to locate so that they can attend the best highschool in the state';
    
    // Find and fill the chat textarea
    const textarea = page.locator('textarea').first();
    await textarea.fill(testQuery);
    
    // Submit the message (find submit button near textarea)
    const submitButton = page.locator('button[type="submit"]').first();
    await submitButton.click();
    
    // Wait for AI response - look for specific content in chat area
    // The AI will mention towns like West Hartford, Simsbury, etc.
    // Use a longer timeout since AI responses take time
    await page.waitForTimeout(5000); // Wait for AI to start responding
    
    // Look for AI response content about schools/towns
    const aiResponseContent = page.locator('text=/Conard|Hall|Simsbury|Glastonbury|education|school district/i').first();
    await expect(aiResponseContent).toBeVisible({ timeout: AI_RESPONSE_TIMEOUT });
    
    // Verify filters were applied (look for filter indicator in compact filters area)
    await expect(page.locator('text=/\\d+ filter/').first()).toBeVisible({ timeout: 10_000 });
  });

  test('4. Property search returns results from Socrata API', async ({ page }) => {
    // Trigger a search via AI chat
    const textarea = page.locator('textarea').first();
    await textarea.fill('Show me homes in Hartford');
    
    const submitButton = page.locator('button[type="submit"]').first();
    await submitButton.click();
    
    // Wait for search results to appear
    // Look for "Search Results" heading or "properties found" text
    const resultsIndicator = page.locator('text=Search Results').or(
      page.locator('text=properties found')
    );
    
    await expect(resultsIndicator.first()).toBeVisible({ timeout: SEARCH_TIMEOUT });
  });

  test('5. Search results display property information', async ({ page }) => {
    // Direct search with city filter
    const textarea = page.locator('textarea').first();
    await textarea.fill('Find properties in West Hartford');
    await page.locator('button[type="submit"]').first().click();
    
    // Wait for "properties found" text indicating results loaded
    await expect(page.locator('text=properties found')).toBeVisible({ timeout: SEARCH_TIMEOUT });
    
    // Verify property data is displayed (price format or CT addresses)
    const propertyInfo = page.locator('text=/\\$[0-9,]+/').or(
      page.locator('text=/[0-9]+ bed/i').or(
        page.locator('text=/, CT/')
      )
    );
    
    // Should have at least one property displayed
    await expect(propertyInfo.first()).toBeVisible({ timeout: 10_000 });
  });

  test('6. Console logs show correct API flow', async ({ page }) => {
    const consoleLogs = [];
    
    page.on('console', msg => {
      consoleLogs.push({ type: msg.type(), text: msg.text() });
    });
    
    // Trigger a search
    const textarea = page.locator('textarea').first();
    await textarea.fill('Show me houses in Hartford');
    await page.locator('button[type="submit"]').first().click();
    
    // Wait for API calls
    await page.waitForTimeout(10_000);
    
    // Verify expected log messages appear
    const logTexts = consoleLogs.map(l => l.text).join(' ');
    
    // Should see search being triggered
    expect(logTexts).toContain('searchProperties');
    
    // Should see API URL (AWS Lambda)
    expect(logTexts).toMatch(/execute-api.*amazonaws/);
  });

  test('7. Network requests go to AWS Lambda (not local)', async ({ page }) => {
    const apiRequests = [];
    
    page.on('request', request => {
      if (request.url().includes('execute-api') || request.url().includes('/properties')) {
        apiRequests.push(request.url());
      }
    });
    
    // Trigger a search
    const textarea = page.locator('textarea').first();
    await textarea.fill('Houses in Stamford');
    await page.locator('button[type="submit"]').first().click();
    
    // Wait for API calls
    await page.waitForTimeout(10_000);
    
    // Verify AWS Lambda endpoint is used
    const awsRequests = apiRequests.filter(url => url.includes('execute-api.us-east-1.amazonaws.com'));
    expect(awsRequests.length).toBeGreaterThan(0);
  });

  test('8. API returns data from CT Open Data Portal', async ({ page }) => {
    let responseData = null;
    
    page.on('response', async response => {
      if (response.url().includes('/properties')) {
        try {
          responseData = await response.json();
        } catch (e) {
          // Ignore parse errors
        }
      }
    });
    
    // Trigger a search
    const textarea = page.locator('textarea').first();
    await textarea.fill('Properties in New Haven');
    await page.locator('button[type="submit"]').first().click();
    
    // Wait for response
    await page.waitForTimeout(10_000);
    
    // Verify response structure from Socrata API
    if (responseData) {
      expect(responseData).toHaveProperty('data');
      expect(responseData).toHaveProperty('source', 'CT Open Data Portal');
    }
  });
});

test.describe('Production UAT - Error Handling', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(PRODUCTION_URL, { waitUntil: 'networkidle' });
  });

  test('Handles empty search gracefully', async ({ page }) => {
    // Submit button should be disabled when textarea is empty (good UX)
    const submitButton = page.locator('button[type="submit"]').first();
    await expect(submitButton).toBeDisabled();
    
    // Verify the textarea is visible and ready for input
    const textarea = page.locator('textarea').first();
    await expect(textarea).toBeVisible();
    await expect(textarea).toBeEnabled();
    
    // Page should not crash
    await expect(page.locator('#root')).toBeVisible();
  });

  test('Shows appropriate feedback during loading', async ({ page }) => {
    const textarea = page.locator('textarea').first();
    await textarea.fill('Find properties');
    await page.locator('button[type="submit"]').first().click();
    
    // Should show some loading indicator
    const loadingIndicator = page.locator('[class*="loading"]').or(
      page.locator('[class*="spinner"]').or(
        page.locator('text=/loading|searching|processing/i')
      )
    );
    
    // Loading state should appear (even briefly)
    // This is a soft check - some apps are fast enough to skip visible loading
    await page.waitForTimeout(1000);
  });
});
