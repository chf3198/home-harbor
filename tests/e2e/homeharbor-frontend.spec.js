/**
 * @fileoverview HomeHarbor React Frontend E2E Tests
 * Tests complete user workflows from search to AI analysis
 */

import { test, expect } from '@playwright/test';

test.describe('HomeHarbor Property Search', () => {
  test.beforeEach(async ({ page }) => {
    // Start the development server
    await page.goto('http://localhost:3000');
  });

  test('loads application successfully', async ({ page }) => {
    // Verify page title
    await expect(page).toHaveTitle(/HomeHarbor/);

    // Verify main components are present
    await expect(page.locator('header')).toBeVisible();
    await expect(page.locator('text=Search Properties')).toBeVisible();
    await expect(page.locator('text=AI Assistant')).toBeVisible();
  });

  test('displays search form with all filters', async ({ page }) => {
    // Verify search form elements
    await expect(page.locator('input[placeholder*="city"]')).toBeVisible();
    await expect(page.locator('input[placeholder*="min price"]')).toBeVisible();
    await expect(page.locator('input[placeholder*="max price"]')).toBeVisible();

    // Verify property type filters
    await expect(page.locator('select[name*="property type"]')).toBeVisible();
    await expect(page.locator('select[name*="bedrooms"]')).toBeVisible();
    await expect(page.locator('select[name*="bathrooms"]')).toBeVisible();
  });

  test('shows help modal when help button clicked', async ({ page }) => {
    // Click help button
    await page.locator('button[aria-label*="help"]').click();

    // Verify modal appears
    await expect(page.locator('text=Help & Information')).toBeVisible();
    await expect(page.locator('text=User Guide')).toBeVisible();
    await expect(page.locator('text=Developer Info')).toBeVisible();
  });

  test('performs property search and displays results', async ({ page }) => {
    // Fill search form
    await page.locator('input[placeholder*="city"]').fill('Hartford');
    await page.locator('input[placeholder*="min price"]').fill('200000');
    await page.locator('input[placeholder*="max price"]').fill('500000');

    // Submit search
    await page.locator('button[type="submit"]').click();

    // Verify results section appears
    await expect(page.locator('text=Search Results')).toBeVisible();

    // Verify pagination appears
    await expect(page.locator('text=Page 1 of')).toBeVisible();
  });

  test('displays property cards with correct information', async ({ page }) => {
    // Perform search first
    await page.locator('input[placeholder*="city"]').fill('Hartford');
    await page.locator('button[type="submit"]').click();

    // Wait for results to load
    await page.waitForSelector('.property-card');

    // Verify property card structure
    const firstCard = page.locator('.property-card').first();
    await expect(firstCard.locator('text=Hartford')).toBeVisible();
    await expect(firstCard.locator('text=bedrooms')).toBeVisible();
    await expect(firstCard.locator('text=bathrooms')).toBeVisible();
    await expect(firstCard.locator('text=AI Analysis')).toBeVisible();
  });

  test('AI chat interface works correctly', async ({ page }) => {
    // Verify AI chat section is present
    await expect(page.locator('text=AI Property Assistant')).toBeVisible();

    // Verify chat input
    await expect(page.locator('input[placeholder*="Ask about properties"]')).toBeVisible();

    // Type a message
    await page.locator('input[placeholder*="Ask about properties"]').fill('What are the best deals in Hartford?');

    // Submit message
    await page.locator('button[type="submit"]').click();

    // Verify message appears in chat
    await expect(page.locator('text=What are the best deals in Hartford?')).toBeVisible();
  });

  test('keyboard navigation works', async ({ page }) => {
    // Tab through main interactive elements
    await page.keyboard.press('Tab'); // Header
    await page.keyboard.press('Tab'); // City input
    await expect(page.locator('input[placeholder*="city"]')).toBeFocused();

    await page.keyboard.press('Tab'); // Min price
    await expect(page.locator('input[placeholder*="min price"]')).toBeFocused();

    await page.keyboard.press('Tab'); // Max price
    await expect(page.locator('input[placeholder*="max price"]')).toBeFocused();
  });

  test('responsive design works on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Verify main elements still visible
    await expect(page.locator('header')).toBeVisible();
    await expect(page.locator('text=Search Properties')).toBeVisible();

    // Verify search form adapts
    await expect(page.locator('input[placeholder*="city"]')).toBeVisible();
  });
});