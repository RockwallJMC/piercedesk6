import { test, expect } from '@playwright/test';
import { loginAsOrgUser } from '../helpers/multi-tenant-setup.js';

test.describe('Input Validation - Security', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await loginAsOrgUser(page, 'ACME', 'admin');
  });

  test('Lead form validates email format', async ({ page }) => {
    await page.goto('http://localhost:4000/apps/crm/leads');
    await page.waitForLoadState('networkidle', { timeout: 10000 });

    // Click Add Lead button (try multiple selectors)
    const addButton = page.locator('button').filter({ hasText: /add.*lead|create.*lead|new.*lead/i });
    await addButton.first().click({ timeout: 5000 });

    // Wait for form to appear
    await page.waitForTimeout(1000);

    // Try invalid email
    const emailInput = page.locator('input[name="email"], input[type="email"]').first();
    await emailInput.fill('invalid-email');

    // Try to save
    const saveButton = page.locator('button').filter({ hasText: /save|submit|create/i });
    await saveButton.first().click({ timeout: 5000 });

    // Verify validation error (should appear near the email field or as toast)
    const validationError = page.locator('text=/valid email|invalid email|email.*required/i');
    await expect(validationError.first()).toBeVisible({ timeout: 5000 });
  });

  test('Lead form prevents XSS in name fields', async ({ page }) => {
    await page.goto('http://localhost:4000/apps/crm/leads');
    await page.waitForLoadState('networkidle', { timeout: 10000 });

    // Click Add Lead button
    const addButton = page.locator('button').filter({ hasText: /add.*lead|create.*lead|new.*lead/i });
    await addButton.first().click({ timeout: 5000 });

    // Wait for form to appear
    await page.waitForTimeout(1000);

    // Try XSS payload
    const xssPayload = '<script>alert("XSS")</script>';
    const nameInput = page.locator('input[name*="name"], input[label*="name"]').first();
    await nameInput.fill(xssPayload);

    const emailInput = page.locator('input[name="email"], input[type="email"]').first();
    await emailInput.fill('xss-test@example.com');

    // Save
    const saveButton = page.locator('button').filter({ hasText: /save|submit|create/i });
    await saveButton.first().click({ timeout: 5000 });

    // Wait for save to complete
    await page.waitForTimeout(2000);

    // Verify XSS is escaped (not executed) - check that no alert dialog appeared
    // If XSS worked, a dialog would be open, so we verify no dialog exists
    const hasDialog = await page.locator('role=dialog').count();
    expect(hasDialog).toBe(0);

    // Verify the script tag is rendered as text (escaped) in the UI
    await page.goto('http://localhost:4000/apps/crm/leads');
    await page.waitForLoadState('networkidle', { timeout: 10000 });

    // Check that the XSS payload appears as text (escaped)
    const cellText = await page.locator('text=/&lt;script&gt;|<script>/').first().textContent({ timeout: 5000 }).catch(() => null);
    // If we found the text, it means it was properly escaped
    expect(cellText).toBeTruthy();
  });

  test('Proposal form validates numeric fields', async ({ page }) => {
    await page.goto('http://localhost:4000/apps/crm/opportunities');
    await page.waitForLoadState('networkidle', { timeout: 10000 });

    // Click first opportunity (from test data)
    const opportunityRow = page.locator('[role="row"]').filter({ hasText: /newcorp|digital transformation/i });
    await opportunityRow.first().click({ timeout: 5000 });

    // Wait for opportunity detail page
    await page.waitForTimeout(1000);

    // Click Create Proposal button
    const createProposalButton = page.locator('button').filter({ hasText: /create.*proposal/i });
    await createProposalButton.first().click({ timeout: 5000 });

    // Wait for proposal form
    await page.waitForTimeout(1000);

    // Try to add line item with invalid values
    const addRowButton = page.locator('button').filter({ hasText: /add.*row|add.*item/i });
    await addRowButton.first().click({ timeout: 5000 }).catch(() => {}); // May already have rows

    // Fill invalid quantity
    const quantityInput = page.locator('input[name*="quantity"]').first();
    await quantityInput.fill('-5'); // Negative not allowed

    // Fill invalid price
    const priceInput = page.locator('input[name*="price"]').first();
    await priceInput.fill('abc'); // Text not allowed

    // Try to save
    const saveButton = page.locator('button').filter({ hasText: /save|submit/i });
    await saveButton.first().click({ timeout: 5000 });

    // Verify validation errors appear
    const validationError = page.locator('text=/quantity|price|invalid|greater than/i');
    await expect(validationError.first()).toBeVisible({ timeout: 5000 });
  });

  test('Contact form validates phone number format', async ({ page }) => {
    await page.goto('http://localhost:4000/apps/crm/contacts');
    await page.waitForLoadState('networkidle', { timeout: 10000 });

    // Click Add Contact button
    const addButton = page.locator('button').filter({ hasText: /add.*contact|create.*contact|new.*contact/i });
    await addButton.first().click({ timeout: 5000 });

    // Wait for form to appear
    await page.waitForTimeout(1000);

    // Try invalid phone
    const phoneInput = page.locator('input[name*="phone"], input[type="tel"]').first();
    await phoneInput.fill('abc-def-ghij');

    // Try to save
    const saveButton = page.locator('button').filter({ hasText: /save|submit|create/i });
    await saveButton.first().click({ timeout: 5000 });

    // Verify validation error
    const validationError = page.locator('text=/valid phone|invalid phone|phone.*format/i');
    await expect(validationError.first()).toBeVisible({ timeout: 5000 });
  });

  test('Opportunity form validates date fields', async ({ page }) => {
    await page.goto('http://localhost:4000/apps/crm/leads');
    await page.waitForLoadState('networkidle', { timeout: 10000 });

    // Click first lead (from test data)
    const leadRow = page.locator('[role="row"]').filter({ hasText: /michael johnson|newcorp/i });
    await leadRow.first().click({ timeout: 5000 });

    // Wait for lead detail page
    await page.waitForTimeout(1000);

    // Click Convert to Opportunity button
    const convertButton = page.locator('button').filter({ hasText: /convert.*opportunity/i });
    await convertButton.first().click({ timeout: 5000 });

    // Wait for conversion form
    await page.waitForTimeout(1000);

    // Try past date for expected close date
    const dateInput = page.locator('input[name*="date"], input[type="date"]').first();
    await dateInput.fill('2020-01-01');

    // Try to save/convert
    const convertSubmitButton = page.locator('button').filter({ hasText: /convert|save|submit/i });
    await convertSubmitButton.first().click({ timeout: 5000 });

    // Verify validation error
    const validationError = page.locator('text=/date.*future|past date|invalid date/i');
    await expect(validationError.first()).toBeVisible({ timeout: 5000 });
  });
});
