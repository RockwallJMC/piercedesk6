import { test, expect } from '@playwright/test';

test.describe('Input Validation - Security', () => {
  test('Lead form validates email format', async ({ page }) => {
    await page.goto('/apps/crm/leads');
    await page.getByRole('button', { name: 'Add Lead' }).click();

    // Try invalid email
    await page.getByLabel('Email').fill('invalid-email');
    await page.getByRole('button', { name: 'Save' }).click();

    // Verify validation error
    await expect(page.getByText(/valid email/i)).toBeVisible();

    // Fix email
    await page.getByLabel('Email').fill('valid@example.com');
    await page.getByRole('button', { name: 'Save' }).click();

    // Should not show error
    await expect(page.getByText(/valid email/i)).not.toBeVisible();
  });

  test('Lead form prevents XSS in name fields', async ({ page }) => {
    await page.goto('/apps/crm/leads');
    await page.getByRole('button', { name: 'Add Lead' }).click();

    // Try XSS payload
    const xssPayload = '<script>alert("XSS")</script>';
    await page.getByLabel('First Name').fill(xssPayload);
    await page.getByLabel('Last Name').fill('Test');
    await page.getByLabel('Email').fill('test@example.com');
    await page.getByRole('button', { name: 'Save' }).click();

    // Verify XSS is escaped (not executed)
    await page.goto('/apps/crm/leads');
    const cellText = await page.getByRole('cell', { name: xssPayload }).textContent();
    expect(cellText).toContain('<script>'); // Should be rendered as text, not executed
  });

  test('Proposal form validates numeric fields', async ({ page }) => {
    await page.goto('/apps/crm/opportunities');
    await page.getByText(/opportunity1/).click();
    await page.getByRole('button', { name: 'Create Proposal' }).click();

    // Add line item with invalid quantity
    await page.getByRole('button', { name: 'Add Row' }).click();
    await page.getByLabel('Quantity').fill('-5'); // Negative not allowed
    await page.getByLabel('Unit Price').fill('abc'); // Text not allowed

    // Try to save
    await page.getByRole('button', { name: 'Save as Draft' }).click();

    // Verify validation errors
    await expect(page.getByText(/quantity must be greater than 0/i)).toBeVisible();
    await expect(page.getByText(/must be a valid number/i)).toBeVisible();
  });

  test('Contact form validates phone number format', async ({ page }) => {
    await page.goto('/apps/crm/contacts');
    await page.getByRole('button', { name: 'Add Contact' }).click();

    // Try invalid phone
    await page.getByLabel('Phone').fill('abc-def-ghij');
    await page.getByRole('button', { name: 'Save' }).click();

    // Verify validation
    await expect(page.getByText(/valid phone number/i)).toBeVisible();
  });

  test('Opportunity form validates date fields', async ({ page }) => {
    await page.goto('/apps/crm/leads');
    await page.getByText(/lead_001/).click();
    await page.getByRole('button', { name: 'Convert to Opportunity' }).click();

    // Try past date
    await page.getByLabel('Expected Close Date').fill('2020-01-01');
    await page.getByRole('button', { name: 'Convert' }).click();

    // Verify validation
    await expect(page.getByText(/close date must be in the future/i)).toBeVisible();
  });
});
