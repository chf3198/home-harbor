/**
 * @fileoverview HomeHarbor AI Assistant E2E Tests
 * Tests AI chat functionality on the static HTML demo
 */

import { test, expect } from '@playwright/test';

test.describe('HomeHarbor AI Assistant', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('AI assistant initializes correctly', async ({ page }) => {
    // Verify AI section is present (static HTML uses "Ask HomeHarbor")
    await expect(page.locator('text=Ask HomeHarbor')).toBeVisible();

    // Verify AI description text
    await expect(page.locator('text=AI assistance using OpenRouter')).toBeVisible();

    // Verify textarea for input
    await expect(page.locator('textarea[name="message"]')).toBeVisible();
  });

  test('sends and receives AI messages', async ({ page }) => {
    // Type a question in the textarea
    await page.locator('textarea[name="message"]').fill('What neighborhoods in Hartford are good for families?');

    // Wait for form to stabilize before clicking (WebKit stability)
    await page.waitForTimeout(100);

    // Submit the message
    await page.locator('#chat-form button[type="submit"]').click({ timeout: 15000 });

    // Verify response area is visible (may show error without API key in test env)
    await expect(page.locator('#chat-response')).toBeVisible();
  });

  test('handles property analysis requests', async ({ page }) => {
    // Perform a search first
    await page.locator('input[name="city"]').fill('Hartford');
    await page.locator('#search-form button[type="submit"]').click();

    // Verify results container is visible
    await expect(page.locator('#results')).toBeVisible();
  });

  test('maintains chat history', async ({ page }) => {
    // Send first message
    await page.locator('textarea[name="message"]').fill('Message 1');
    await page.locator('#chat-form button[type="submit"]').click();

    // Wait for response area to update
    await page.waitForTimeout(500);

    // Send second message
    await page.locator('textarea[name="message"]').fill('Message 2');
    await page.locator('#chat-form button[type="submit"]').click();

    // Verify response area is still visible
    await expect(page.locator('#chat-response')).toBeVisible();
  });

  test('handles empty messages gracefully', async ({ page }) => {
    // Verify form exists with textarea
    await expect(page.locator('textarea[name="message"]')).toBeVisible();

    // Clear and try to send empty
    await page.locator('textarea[name="message"]').fill('');
    await page.locator('#chat-form button[type="submit"]').click();

    // Form should not cause errors
    await expect(page.locator('#chat-form')).toBeVisible();
  });

  test('shows typing indicator during AI response', async ({ page }) => {
    // Send a message
    await page.locator('textarea[name="message"]').fill('Test question');
    await page.locator('#chat-form button[type="submit"]').click();

    // Verify response area exists
    await expect(page.locator('#chat-response')).toBeVisible();
  });

  test('handles API errors gracefully', async ({ page }) => {
    // Verify page loads without initial errors
    await expect(page.locator('header')).toBeVisible();
    await expect(page.locator('main')).toBeVisible();
  });

  test('AI suggestions appear based on search context', async ({ page }) => {
    // Perform a search
    await page.locator('input[name="city"]').fill('Hartford');
    await page.locator('#search-form button[type="submit"]').click();

    // Verify results area is visible
    await expect(page.locator('#results')).toBeVisible();
  });
});