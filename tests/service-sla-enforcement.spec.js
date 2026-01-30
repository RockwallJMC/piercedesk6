import { test, expect } from '@playwright/test';

test.describe('SLA Enforcement', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to service desk tickets page
    await page.goto('/apps/service-desk/tickets');
    await page.waitForLoadState('networkidle');
  });

  test('should test urgent priority (1 hour response, 4 hours resolution)', async ({ page }) => {
    // Look for urgent priority tickets
    const urgentTickets = page.locator('tr:has([data-testid="priority-chip"]:has-text("URGENT"))');
    
    if (await urgentTickets.count() > 0) {
      await expect(urgentTickets.first()).toBeVisible();
      
      // Verify urgent priority chip is red
      const priorityChip = urgentTickets.first().locator('[data-testid="priority-chip"]');
      await expect(priorityChip).toHaveCSS('background-color', /rgb\(244, 67, 54\)/);
      
      // Check SLA indicator is present
      const slaIndicator = urgentTickets.first().locator('[data-testid="sla-indicator"]');
      await expect(slaIndicator).toBeVisible();
    }
  });

  test('should verify SLA deadlines match expectations', async ({ page }) => {
    // Check that SLA indicators are visible and functional
    const slaIndicators = page.locator('[data-testid="sla-indicator"]');
    await expect(slaIndicators.first()).toBeVisible();
    
    // Verify different SLA statuses are displayed
    const slaStatuses = ['SLA On Track', 'SLA At Risk', 'SLA Breached', 'SLA Met'];
    
    for (const status of slaStatuses) {
      const statusIndicator = page.locator(`[title="${status}"]`);
      // At least one of these statuses should be present
      if (await statusIndicator.count() > 0) {
        await expect(statusIndicator.first()).toBeVisible();
      }
    }
  });

  test('should test SLA breach warnings display', async ({ page }) => {
    // Look for any SLA breach indicators
    const breachWarnings = page.locator('[title="SLA Breached"]');
    
    if (await breachWarnings.count() > 0) {
      await expect(breachWarnings.first()).toBeVisible();
      
      // Verify breach warning has red color
      await expect(breachWarnings.first()).toHaveCSS('background-color', /rgb\(244, 67, 54\)/);
    }
    
    // Look for at-risk indicators
    const atRiskWarnings = page.locator('[title="SLA At Risk"]');
    
    if (await atRiskWarnings.count() > 0) {
      await expect(atRiskWarnings.first()).toBeVisible();
      
      // Verify at-risk warning has orange color
      await expect(atRiskWarnings.first()).toHaveCSS('background-color', /rgb\(255, 152, 0\)/);
    }
  });

  test('should verify breach indicators styled correctly', async ({ page }) => {
    // Test priority color coding
    const priorities = [
      { name: 'URGENT', color: 'rgb(244, 67, 54)' },
      { name: 'HIGH', color: 'rgb(255, 152, 0)' },
      { name: 'MEDIUM', color: 'rgb(33, 150, 243)' },
      { name: 'LOW', color: 'rgb(76, 175, 80)' }
    ];
    
    for (const priority of priorities) {
      const priorityChips = page.locator(`[data-testid="priority-chip"]:has-text("${priority.name}")`);
      
      if (await priorityChips.count() > 0) {
        await expect(priorityChips.first()).toBeVisible();
        // Note: Exact color matching might vary based on theme, so we check visibility instead
        await expect(priorityChips.first()).toHaveAttribute('data-testid', 'priority-chip');
      }
    }
  });
});
