/**
 * @fileoverview HomeHarbor Static HTML E2E Tests
 * Tests user workflows on the production static HTML demo
 */

import { test, expect } from '@playwright/test';

test.describe('HomeHarbor Property Search', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to app - uses baseURL from playwright config
    await page.goto('/');
  });

  test('loads application successfully', async ({ page }) => {
    // Verify page title
    await expect(page).toHaveTitle(/HomeHarbor/);

    // Verify main components are present
    await expect(page.locator('header')).toBeVisible();
    await expect(page.locator('text=Search Properties')).toBeVisible();
    await expect(page.locator('text=Ask HomeHarbor')).toBeVisible();
  });

  test('displays search form with all filters', async ({ page }) => {
    // Verify search form elements (static HTML placeholders)
    await expect(page.locator('input[placeholder="West Hartford"]')).toBeVisible();
    await expect(page.locator('input[placeholder="100000"]')).toBeVisible();
    await expect(page.locator('input[placeholder="500000"]')).toBeVisible();

    // Verify property type and style inputs
    await expect(page.locator('input[placeholder="Residential"]')).toBeVisible();
    await expect(page.locator('input[placeholder="Single Family"]')).toBeVisible();
  });

  test('shows help modal when help button clicked', async ({ page }) => {
    // Click help button
    await page.locator('#help-button').click();

    // Verify modal appears
    await expect(page.locator('text=HomeHarbor Help')).toBeVisible();
  });

  test('performs property search and displays results', async ({ page }) => {
    // Fill search form using static HTML placeholders
    await page.locator('input[name="city"]').fill('Hartford');
    await page.locator('input[name="minPrice"]').fill('200000');
    await page.locator('input[name="maxPrice"]').fill('500000');

    // Submit search
    await page.locator('#search-form button[type="submit"]').click();

    // Verify results section shows (or no results message)
    await expect(page.locator('#search-results')).toBeVisible();
  });

  test('AI chat interface works correctly', async ({ page }) => {
    // Verify AI chat section is present
    await expect(page.locator('text=Ask HomeHarbor')).toBeVisible();

    // Verify chat textarea
    await expect(page.locator('textarea[placeholder="Ask about the market or search tips..."]')).toBeVisible();

    // Type a message
    await page.locator('textarea[name="message"]').fill('What are the best deals in Hartford?');

    // Submit form
    await page.locator('#chat-form button[type="submit"]').click();

    // Verify response area exists
    await expect(page.locator('#chat-response')).toBeVisible();
  });

  test('keyboard navigation works', async ({ page }) => {
    // Tab through main interactive elements
    await page.keyboard.press('Tab'); // Help button
    await expect(page.locator('#help-button')).toBeFocused();

    await page.keyboard.press('Tab'); // City input
    await expect(page.locator('input[name="city"]')).toBeFocused();

    await page.keyboard.press('Tab'); // Min price
    await expect(page.locator('input[name="minPrice"]')).toBeFocused();

    await page.keyboard.press('Tab'); // Max price
    await expect(page.locator('input[name="maxPrice"]')).toBeFocused();
  });

  test('responsive design works on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Verify main elements still visible
    await expect(page.locator('header')).toBeVisible();
    await expect(page.locator('text=Search Properties')).toBeVisible();

    // Verify search form adapts
    await expect(page.locator('input[name="city"]')).toBeVisible();
  });
});