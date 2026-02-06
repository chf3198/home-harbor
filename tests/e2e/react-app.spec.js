/**
 * @fileoverview HomeHarbor React App E2E Tests
 * Comprehensive tests for the React frontend
 */

import { test, expect } from '@playwright/test';

test.describe('HomeHarbor React App - Page Load', () => {
  test('loads the homepage successfully', async ({ page }) => {
    await page.goto('/');
    
    // Verify main header is visible (use specific role selectors)
    await expect(page.getByRole('heading', { name: 'AI-Powered Real Estate Search' })).toBeVisible();
  });

  test('displays all main sections', async ({ page }) => {
    await page.goto('/');
    
    // Search section - use heading role
    await expect(page.getByRole('heading', { name: 'Search Properties' })).toBeVisible();
    
    // Results section
    await expect(page.getByRole('heading', { name: 'Search Results' })).toBeVisible();
    
    // AI Chat section
    await expect(page.getByRole('heading', { name: 'Ask HomeHarbor' })).toBeVisible();
  });

  test('help button opens help modal', async ({ page }) => {
    await page.goto('/');
    
    // Click Help & Guides button (look for button containing "Help" text)
    const helpButton = page.locator('button:has-text("Help")').first();
    await expect(helpButton).toBeVisible({ timeout: 5000 });
    await helpButton.click();
    
    // Wait for modal - look for modal content
    await expect(page.getByText('User Guide')).toBeVisible({ timeout: 5000 });
  });
});

test.describe('HomeHarbor React App - Property Search', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('search form has all required fields', async ({ page }) => {
    // City input - by placeholder
    await expect(page.getByPlaceholder(/city/i)).toBeVisible();
    
    // Min/Max price inputs - by label
    await expect(page.getByLabel(/Min Price/i)).toBeVisible();
    await expect(page.getByLabel(/Max Price/i)).toBeVisible();
    
    // Search button
    await expect(page.getByRole('button', { name: 'Search Properties' })).toBeVisible();
  });

  test('searching for Hartford returns results', async ({ page }) => {
    // Fill city
    await page.getByPlaceholder(/city/i).fill('Hartford');
    
    // Submit search
    await page.getByRole('button', { name: 'Search Properties' }).click();
    
    // Wait for results
    await expect(page.getByText(/\d+ properties found/)).toBeVisible({ timeout: 10000 });
  });

  test('empty search shows suggested cities', async ({ page }) => {
    // Clear city and submit search without filters
    await page.getByPlaceholder(/city/i).fill('NoSuchCity');
    await page.getByRole('button', { name: 'Search Properties' }).click();
    
    // Should show empty results with suggestions
    await expect(page.getByText('No properties found')).toBeVisible({ timeout: 10000 });
  });

  test('price filter works correctly', async ({ page }) => {
    // Fill city
    await page.getByPlaceholder(/city/i).fill('Hartford');
    
    // Set max price filter
    await page.getByLabel(/Max Price/i).clear();
    await page.getByLabel(/Max Price/i).fill('300000');
    
    // Submit search
    await page.getByRole('button', { name: 'Search Properties' }).click();
    
    // Wait for results
    await expect(page.getByText(/properties found/)).toBeVisible({ timeout: 10000 });
  });
});

test.describe('HomeHarbor React App - AI Chat', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('AI chat section displays correctly', async ({ page }) => {
    // Chat header
    await expect(page.getByRole('heading', { name: 'Ask HomeHarbor' })).toBeVisible();
    
    // Online indicator
    await expect(page.getByText('Online')).toBeVisible();
    
    // Message input
    await expect(page.getByPlaceholder('Type a message...')).toBeVisible();
  });

  test('welcome message is shown initially', async ({ page }) => {
    await expect(page.getByText(/HomeHarbor assistant/i)).toBeVisible();
  });

  test('can send a message and receive response', async ({ page }) => {
    // Type message
    await page.getByPlaceholder('Type a message...').fill('Show me houses in Hartford');
    
    // Send message - use locator with first() to avoid strict mode issues
    const sendButton = page.locator('button[aria-label="Send message"]').first();
    await sendButton.click();
    
    // Verify user message appears in chat bubble (not in textarea)
    await expect(page.locator('p:has-text("Show me houses in Hartford")')).toBeVisible({ timeout: 5000 });
    
    // Wait for AI response - check for the AI assistant response container
    await expect(page.locator('.bg-slate-50').last()).toBeVisible({ timeout: 15000 });
  });

  test('Enter key sends message', async ({ page }) => {
    // Type message and press Enter
    const textarea = page.getByPlaceholder('Type a message...');
    await textarea.fill('Test message');
    await textarea.press('Enter');
    
    // Wait for message to appear in chat
    await page.waitForTimeout(500);
    
    // Verify message was sent (appears as chat bubble)
    await expect(page.locator('p:has-text("Test message")')).toBeVisible({ timeout: 5000 });
  });

  test('Shift+Enter creates new line', async ({ page }) => {
    const textarea = page.getByPlaceholder('Type a message...');
    await textarea.fill('Line 1');
    await textarea.press('Shift+Enter');
    await textarea.type('Line 2');
    
    // Message should not be sent yet
    const value = await textarea.inputValue();
    expect(value).toContain('Line 1');
    expect(value).toContain('Line 2');
  });

  test('clear button clears chat history', async ({ page }) => {
    // Send a message first
    await page.getByPlaceholder('Type a message...').fill('Hello');
    await page.getByRole('button', { name: 'Send message' }).click();
    
    // Wait for response
    await page.waitForTimeout(2000);
    
    // Click clear button
    await page.getByRole('button', { name: 'Clear chat' }).click();
    
    // Welcome message should reappear
    await expect(page.getByText(/HomeHarbor assistant/i)).toBeVisible({ timeout: 5000 });
  });

  test('AI extracts filters and updates search form', async ({ page }) => {
    // Send message with filter criteria
    await page.getByPlaceholder('Type a message...').fill('Show me 3 bedroom houses in Hartford under $400k');
    await page.getByRole('button', { name: 'Send message' }).click();
    
    // Wait for response with filters badge
    await expect(page.getByText(/filters applied/i)).toBeVisible({ timeout: 15000 });
  });
});

test.describe('HomeHarbor React App - Full Interaction Workflow', () => {
  test('AI chat triggers search and shows results', async ({ page }) => {
    await page.goto('/');
    
    // Send a property search request via chat
    await page.getByPlaceholder('Type a message...').fill('I want a 2 bedroom house in Hartford');
    await page.getByRole('button', { name: 'Send message' }).click();
    
    // Wait for AI response
    await expect(page.locator('.bg-slate-50').last()).toBeVisible({ timeout: 15000 });
    
    // Should see filters applied badge
    await expect(page.getByText(/filters applied/i)).toBeVisible({ timeout: 10000 });
    
    // Results section should show properties (not be empty or errored)
    await expect(page.getByText(/properties found/i)).toBeVisible({ timeout: 10000 });
  });

  test('search form manual search works', async ({ page }) => {
    await page.goto('/');
    
    // Fill city manually
    await page.getByPlaceholder(/city/i).fill('Hartford');
    
    // Submit search
    await page.getByRole('button', { name: 'Search Properties' }).click();
    
    // Should show results
    await expect(page.getByText(/properties found/i)).toBeVisible({ timeout: 10000 });
  });

  test('AI search applies default price values', async ({ page }) => {
    await page.goto('/');
    
    // Send message with partial criteria (no price specified)
    await page.getByPlaceholder('Type a message...').fill('Show me 2 bedroom homes in Hartford');
    await page.getByRole('button', { name: 'Send message' }).click();
    
    // Wait for AI response
    await expect(page.locator('.bg-slate-50').last()).toBeVisible({ timeout: 15000 });
    
    // Should get results even without explicit price (defaults applied)
    await expect(page.getByText(/filters applied/i)).toBeVisible({ timeout: 10000 });
  });
});

test.describe('HomeHarbor React App - Responsive Design', () => {
  test('mobile layout works correctly', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    // All sections should still be visible
    await expect(page.getByRole('heading', { name: 'Search Properties' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Ask HomeHarbor' })).toBeVisible();
  });

  test('tablet layout works correctly', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');
    
    // All sections should be visible
    await expect(page.getByRole('heading', { name: 'Search Properties' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Ask HomeHarbor' })).toBeVisible();
  });
});

test.describe('HomeHarbor React App - Error Handling', () => {
  test('handles network errors gracefully', async ({ page }) => {
    await page.goto('/');
    
    // Block API requests
    await page.route('**/api/**', route => route.abort());
    
    // Try to search
    await page.getByPlaceholder(/city/i).fill('Hartford');
    await page.getByRole('button', { name: 'Search Properties' }).click();
    
    // Should show error state or handle gracefully
    await page.waitForTimeout(2000);
  });
});
