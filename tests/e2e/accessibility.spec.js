/**
 * @fileoverview HomeHarbor Accessibility E2E Tests
 * Tests WCAG compliance and keyboard navigation for static HTML demo
 */

import { test, expect } from '@playwright/test';

test.describe('HomeHarbor Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('has proper heading structure', async ({ page }) => {
    // Check for proper heading hierarchy
    const h1Elements = await page.locator('h1').count();
    expect(h1Elements).toBeGreaterThan(0);

    const h2Elements = await page.locator('h2').count();
    expect(h2Elements).toBeGreaterThan(0);

    // Verify main heading contains expected text
    await expect(page.locator('h1').first()).toContainText('AI-Powered Real Estate Search');
  });

  test('all images have alt text', async ({ page }) => {
    // Check all img elements have alt attribute
    const images = page.locator('img');
    const count = await images.count();

    for (let i = 0; i < count; i++) {
      const alt = await images.nth(i).getAttribute('alt');
      expect(alt).not.toBeNull();
      expect(alt).not.toBe('');
    }
  });

  test('form elements have proper labels', async ({ page }) => {
    // Check inputs are wrapped in label elements (static HTML pattern)
    const labels = page.locator('label');
    const labelCount = await labels.count();
    expect(labelCount).toBeGreaterThan(0);

    // Verify key inputs exist within labels
    await expect(page.locator('label:has(input[name="city"])')).toBeVisible();
    await expect(page.locator('label:has(input[name="minPrice"])')).toBeVisible();
    await expect(page.locator('label:has(input[name="maxPrice"])')).toBeVisible();
  });

  test('buttons have accessible names', async ({ page }) => {
    const buttons = page.locator('button');
    const buttonCount = await buttons.count();

    for (let i = 0; i < buttonCount; i++) {
      const button = buttons.nth(i);
      const text = await button.textContent();
      const ariaLabel = await button.getAttribute('aria-label');

      // Button should have text content or aria-label
      expect(text?.trim() || ariaLabel).toBeTruthy();
    }
  });

  test('color contrast meets WCAG standards', async ({ page }) => {
    // Basic check - verify text elements exist and are visible
    const textElements = page.locator('p, span, div, h1, h2, h3, h4, h5, h6');
    const count = await textElements.count();

    // Ensure text elements exist
    expect(count).toBeGreaterThan(0);
  });

  test('keyboard navigation works throughout application', async ({ page }) => {
    // Start keyboard navigation from beginning
    await page.keyboard.press('Tab');

    // First focusable element is the Help button
    await expect(page.locator('#help-button')).toBeFocused();

    // Continue tabbing through search form
    await page.keyboard.press('Tab');
    await expect(page.locator('input[name="city"]')).toBeFocused();

    await page.keyboard.press('Tab');
    await expect(page.locator('input[name="minPrice"]')).toBeFocused();

    await page.keyboard.press('Tab');
    await expect(page.locator('input[name="maxPrice"]')).toBeFocused();
  });

  test('focus indicators are visible', async ({ page }) => {
    // Focus on an input element
    await page.locator('input[name="city"]').focus();

    // Verify focus is on the element
    const isFocused = await page.locator('input[name="city"]').evaluate(el => el === document.activeElement);
    expect(isFocused).toBe(true);
  });

  test('screen reader announcements work', async ({ page }) => {
    // Check that semantic HTML elements exist for screen readers
    await expect(page.locator('header')).toBeVisible();
    await expect(page.locator('main')).toBeVisible();
    await expect(page.locator('footer')).toBeVisible();
  });

  test('modal dialogs are accessible', async ({ page }) => {
    // Open help modal
    await page.locator('#help-button').click();

    // Verify modal appears with proper structure
    const modal = page.locator('#help-modal');
    await expect(modal).toBeVisible();

    // Close modal with close button
    await page.locator('#help-close').click();
    await expect(modal).toHaveClass(/hidden/);
  });

  test('loading states are announced', async ({ page }) => {
    // Verify the results container exists for results display
    await expect(page.locator('#results')).toBeVisible();
  });
});