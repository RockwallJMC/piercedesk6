import { test, expect } from '@playwright/test';

test.describe('Mobile Responsiveness - Mobile (390x844)', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 }); // iPhone 13 size
  });

  test('Leads list is responsive on mobile', async ({ page }) => {
    await page.goto('/apps/crm/leads');

    // Verify page loads
    await expect(page.getByRole('heading', { name: 'Leads' })).toBeVisible();

    // Take screenshot
    await page.screenshot({
      path: `test-results/leads-mobile.png`,
      fullPage: true
    });
  });

  test('Opportunities Kanban is responsive on mobile', async ({ page }) => {
    await page.goto('/apps/crm/opportunities');

    await expect(page.getByRole('heading', { name: 'Opportunities' })).toBeVisible();

    await page.screenshot({
      path: `test-results/opportunities-mobile.png`,
      fullPage: true
    });
  });

  test('Contact detail page is responsive on mobile', async ({ page }) => {
    await page.goto('/apps/crm/contacts');

    await expect(page.getByRole('heading')).toBeVisible();

    await page.screenshot({
      path: `test-results/contacts-mobile.png`,
      fullPage: true
    });
  });

  test('Proposals list is responsive on mobile', async ({ page }) => {
    await page.goto('/apps/crm/proposals');

    await expect(page.getByRole('heading')).toBeVisible();

    await page.screenshot({
      path: `test-results/proposals-mobile.png`,
      fullPage: true
    });
  });
});

test.describe('Mobile Responsiveness - Tablet (1024x1366)', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 1366 }); // iPad Pro size
  });

  test('Leads list is responsive on tablet', async ({ page }) => {
    await page.goto('/apps/crm/leads');

    await expect(page.getByRole('heading', { name: 'Leads' })).toBeVisible();

    await page.screenshot({
      path: `test-results/leads-tablet.png`,
      fullPage: true
    });
  });

  test('Opportunities Kanban is responsive on tablet', async ({ page }) => {
    await page.goto('/apps/crm/opportunities');

    await expect(page.getByRole('heading', { name: 'Opportunities' })).toBeVisible();

    await page.screenshot({
      path: `test-results/opportunities-tablet.png`,
      fullPage: true
    });
  });

  test('Contact detail page is responsive on tablet', async ({ page }) => {
    await page.goto('/apps/crm/contacts');

    await expect(page.getByRole('heading')).toBeVisible();

    await page.screenshot({
      path: `test-results/contacts-tablet.png`,
      fullPage: true
    });
  });

  test('Proposals list is responsive on tablet', async ({ page }) => {
    await page.goto('/apps/crm/proposals');

    await expect(page.getByRole('heading')).toBeVisible();

    await page.screenshot({
      path: `test-results/proposals-tablet.png`,
      fullPage: true
    });
  });
});

test.describe('Mobile Responsiveness - Desktop (1920x1080)', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
  });

  test('Leads list is responsive on desktop', async ({ page }) => {
    await page.goto('/apps/crm/leads');

    await expect(page.getByRole('heading', { name: 'Leads' })).toBeVisible();

    await page.screenshot({
      path: `test-results/leads-desktop.png`,
      fullPage: true
    });
  });

  test('Opportunities Kanban is responsive on desktop', async ({ page }) => {
    await page.goto('/apps/crm/opportunities');

    await expect(page.getByRole('heading', { name: 'Opportunities' })).toBeVisible();

    await page.screenshot({
      path: `test-results/opportunities-desktop.png`,
      fullPage: true
    });
  });

  test('Contact detail page is responsive on desktop', async ({ page }) => {
    await page.goto('/apps/crm/contacts');

    await expect(page.getByRole('heading')).toBeVisible();

    await page.screenshot({
      path: `test-results/contacts-desktop.png`,
      fullPage: true
    });
  });

  test('Proposals list is responsive on desktop', async ({ page }) => {
    await page.goto('/apps/crm/proposals');

    await expect(page.getByRole('heading')).toBeVisible();

    await page.screenshot({
      path: `test-results/proposals-desktop.png`,
      fullPage: true
    });
  });
});
