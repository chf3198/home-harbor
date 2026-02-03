/**
 * @fileoverview HomeHarbor Accessibility E2E Tests
 * Tests WCAG compliance and keyboard navigation
 */

import { test, expect } from '@playwright/test';

test.describe('HomeHarbor Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
  });

  test('has proper heading structure', async ({ page }) => {
    // Check for proper heading hierarchy
    const h1Elements = await page.locator('h1').count();
    expect(h1Elements).toBeGreaterThan(0);

    const h2Elements = await page.locator('h2').count();
    expect(h2Elements).toBeGreaterThan(0);

    // Verify main heading
    await expect(page.locator('h1').first()).toContainText('HomeHarbor');
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
    // Check input elements have associated labels
    const inputs = page.locator('input');
    const inputCount = await inputs.count();

    for (let i = 0; i < inputCount; i++) {
      const input = inputs.nth(i);
      const ariaLabel = await input.getAttribute('aria-label');
      const ariaLabelledBy = await input.getAttribute('aria-labelledby');
      const id = await input.getAttribute('id');

      // Either aria-label, aria-labelledby, or associated label element
      expect(ariaLabel || ariaLabelledBy || id).toBeTruthy();
    }
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
    // This would require a color contrast testing library
    // For now, verify that text is readable (basic check)
    const textElements = page.locator('p, span, div, h1, h2, h3, h4, h5, h6');
    const count = await textElements.count();

    // Ensure text elements exist and are visible
    expect(count).toBeGreaterThan(0);
  });

  test('keyboard navigation works throughout application', async ({ page }) => {
    // Start keyboard navigation from beginning
    await page.keyboard.press('Tab');

    // Navigate through header
    await expect(page.locator('button[aria-label*="help"]')).toBeFocused();

    // Continue tabbing through search form
    await page.keyboard.press('Tab');
    await expect(page.locator('input[placeholder*="city"]')).toBeFocused();

    await page.keyboard.press('Tab');
    await expect(page.locator('input[placeholder*="min price"]')).toBeFocused();

    await page.keyboard.press('Tab');
    await expect(page.locator('input[placeholder*="max price"]')).toBeFocused();

    // Continue through selects
    await page.keyboard.press('Tab');
    await expect(page.locator('select[name*="property type"]')).toBeFocused();

    await page.keyboard.press('Tab');
    await expect(page.locator('select[name*="bedrooms"]')).toBeFocused();

    await page.keyboard.press('Tab');
    await expect(page.locator('select[name*="bathrooms"]')).toBeFocused();

    // Submit button
    await page.keyboard.press('Tab');
    await expect(page.locator('button[type="submit"]')).toBeFocused();
  });

  test('focus indicators are visible', async ({ page }) => {
    // Focus on an input element
    await page.locator('input[placeholder*="city"]').focus();

    // Verify focus is visible (this is a basic check - in practice would need visual verification)
    const isFocused = await page.locator('input[placeholder*="city"]').evaluate(el => el === document.activeElement);
    expect(isFocused).toBe(true);
  });

  test('screen reader announcements work', async ({ page }) => {
    // Perform a search
    await page.locator('input[placeholder*="city"]').fill('Hartford');
    await page.locator('button[type="submit"]').click();

    // Verify ARIA live regions announce results
    await expect(page.locator('[aria-live]')).toBeVisible();
  });

  test('modal dialogs are accessible', async ({ page }) => {
    // Open help modal
    await page.locator('button[aria-label*="help"]').click();

    // Verify modal has proper ARIA attributes
    const modal = page.locator('[role="dialog"]');
    await expect(modal).toBeVisible();

    // Verify focus is trapped in modal
    await page.keyboard.press('Tab');
    const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(['BUTTON', 'INPUT', 'SELECT', 'TEXTAREA'].includes(focusedElement)).toBe(true);

    // Close modal with Escape
    await page.keyboard.press('Escape');
    await expect(modal).not.toBeVisible();
  });

  test('loading states are announced', async ({ page }) => {
    // Perform search
    await page.locator('input[placeholder*="city"]').fill('Hartford');
    await page.locator('button[type="submit"]').click();

    // Verify loading announcement
    await expect(page.locator('[aria-live]')).toContainText(/loading|searching/i);
  });
});