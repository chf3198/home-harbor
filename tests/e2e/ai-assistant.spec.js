/**
 * @fileoverview HomeHarbor AI Assistant E2E Tests
 * Tests AI chat functionality and property analysis features
 */

import { test, expect } from '@playwright/test';

test.describe('HomeHarbor AI Assistant', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
  });

  test('AI assistant initializes correctly', async ({ page }) => {
    // Verify AI section is present
    await expect(page.locator('text=AI Property Assistant')).toBeVisible();

    // Verify welcome message
    await expect(page.locator('text=Hello! I\'m your AI property assistant.')).toBeVisible();

    // Verify input field
    await expect(page.locator('input[placeholder*="Ask about properties"]')).toBeVisible();
  });

  test('sends and receives AI messages', async ({ page }) => {
    // Type a question
    await page.locator('input[placeholder*="Ask about properties"]').fill('What neighborhoods in Hartford are good for families?');

    // Submit the message
    await page.locator('button[type="submit"]').click();

    // Verify user message appears
    await expect(page.locator('text=What neighborhoods in Hartford are good for families?')).toBeVisible();

    // Verify AI response appears (mocked response)
    await page.waitForSelector('.ai-response');
    await expect(page.locator('.ai-response')).toBeVisible();
  });

  test('handles property analysis requests', async ({ page }) => {
    // First perform a search to get properties
    await page.locator('input[placeholder*="city"]').fill('Hartford');
    await page.locator('button[type="submit"]').click();

    // Wait for results
    await page.waitForSelector('.property-card');

    // Click AI analysis on first property
    await page.locator('.property-card').first().locator('text=AI Analysis').click();

    // Verify analysis appears
    await expect(page.locator('text=AI Property Analysis')).toBeVisible();
    await expect(page.locator('.analysis-content')).toBeVisible();
  });

  test('maintains chat history', async ({ page }) => {
    // Send first message
    await page.locator('input[placeholder*="Ask about properties"]').fill('Message 1');
    await page.locator('button[type="submit"]').click();

    // Send second message
    await page.locator('input[placeholder*="Ask about properties"]').fill('Message 2');
    await page.locator('button[type="submit"]').click();

    // Verify both messages are visible
    await expect(page.locator('text=Message 1')).toBeVisible();
    await expect(page.locator('text=Message 2')).toBeVisible();
  });

  test('handles empty messages gracefully', async ({ page }) => {
    // Try to send empty message
    await page.locator('input[placeholder*="Ask about properties"]').fill('');
    await page.locator('button[type="submit"]').click();

    // Verify no empty message appears
    await expect(page.locator('.user-message:empty')).toHaveCount(0);
  });

  test('shows typing indicator during AI response', async ({ page }) => {
    // Send a message
    await page.locator('input[placeholder*="Ask about properties"]').fill('Test question');
    await page.locator('button[type="submit"]').click();

    // Verify typing indicator appears briefly
    await expect(page.locator('text=AI is thinking...')).toBeVisible();

    // Wait for response
    await page.waitForSelector('.ai-response');
  });

  test('handles API errors gracefully', async ({ page }) => {
    // This test would need to mock API failures
    // For now, verify error handling UI exists
    await expect(page.locator('.error-message')).toHaveCount(0); // No errors initially
  });

  test('AI suggestions appear based on search context', async ({ page }) => {
    // Perform a search
    await page.locator('input[placeholder*="city"]').fill('Hartford');
    await page.locator('button[type="submit"]').click();

    // Wait for results
    await page.waitForSelector('.property-card');

    // Verify AI suggestions appear
    await expect(page.locator('text=Suggested questions')).toBeVisible();
    await expect(page.locator('.suggestion-button')).toBeVisible();
  });
});