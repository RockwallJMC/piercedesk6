import { test, expect } from '@playwright/test';
import { loginAsOrgUser, logout, verifyAccessDenied, getRowCount, TEST_DATA } from './helpers/multi-tenant-setup.js';

test.describe('Multi-User Data Isolation', () => {
  test('Organization A cannot see Organization B leads', async ({ page, context }) => {
    // Login as Acme admin
    await loginAsOrgUser(page, 'ACME', 'admin');

    // Navigate to leads
    await page.goto('http://localhost:4000/apps/crm/leads');
    await page.waitForLoadState('networkidle', { timeout: 10000 });
    const orgALeads = await getRowCount(page);

    // Logout
    await logout(page);

    // Login as TechStart CEO
    await loginAsOrgUser(page, 'TECHSTART', 'ceo');

    // Navigate to leads
    await page.goto('http://localhost:4000/apps/crm/leads');
    await page.waitForLoadState('networkidle', { timeout: 10000 });
    const orgBLeads = await getRowCount(page);

    // Verify different datasets
    expect(orgALeads).not.toEqual(orgBLeads);
    expect(orgALeads).toBeGreaterThan(0);
    expect(orgBLeads).toBeGreaterThan(0);

    // Verify cannot access Acme lead directly
    const orgALeadUrl = `http://localhost:4000/apps/crm/leads/${TEST_DATA.ACME_LEAD.id}`;
    const accessDenied = await verifyAccessDenied(page, orgALeadUrl);
    expect(accessDenied).toBe(true);
  });

  test('Organization A cannot see Organization B opportunities', async ({ page }) => {
    // Login as Acme admin
    await loginAsOrgUser(page, 'ACME', 'admin');

    // Navigate to opportunities
    await page.goto('http://localhost:4000/apps/crm/opportunities');
    await page.waitForLoadState('networkidle', { timeout: 10000 });
    const orgAOpportunities = await getRowCount(page);

    // Logout
    await logout(page);

    // Login as TechStart CEO
    await loginAsOrgUser(page, 'TECHSTART', 'ceo');

    // Navigate to opportunities
    await page.goto('http://localhost:4000/apps/crm/opportunities');
    await page.waitForLoadState('networkidle', { timeout: 10000 });
    const orgBOpportunities = await getRowCount(page);

    // Verify different datasets
    expect(orgAOpportunities).not.toEqual(orgBOpportunities);
    expect(orgAOpportunities).toBeGreaterThan(0);
    expect(orgBOpportunities).toBeGreaterThan(0);

    // Verify cannot access Acme opportunity directly
    const orgAOppUrl = `http://localhost:4000/apps/crm/opportunities/${TEST_DATA.ACME_OPPORTUNITY.id}`;
    const accessDenied = await verifyAccessDenied(page, orgAOppUrl);
    expect(accessDenied).toBe(true);
  });

  test('Organization A cannot see Organization B proposals', async ({ page }) => {
    // Login as Acme admin
    await loginAsOrgUser(page, 'ACME', 'admin');

    // Navigate to proposals
    await page.goto('http://localhost:4000/apps/crm/proposals');
    await page.waitForLoadState('networkidle', { timeout: 10000 });
    const orgAProposals = await getRowCount(page);

    // Logout
    await logout(page);

    // Login as TechStart CEO
    await loginAsOrgUser(page, 'TECHSTART', 'ceo');

    // Navigate to proposals
    await page.goto('http://localhost:4000/apps/crm/proposals');
    await page.waitForLoadState('networkidle', { timeout: 10000 });
    const orgBProposals = await getRowCount(page);

    // Verify different datasets
    expect(orgAProposals).not.toEqual(orgBProposals);
    expect(orgAProposals).toBeGreaterThan(0);
    expect(orgBProposals).toBeGreaterThan(0);

    // Verify cannot access Acme proposal directly
    const orgAPropUrl = `http://localhost:4000/apps/crm/proposals/${TEST_DATA.ACME_PROPOSAL.id}`;
    const accessDenied = await verifyAccessDenied(page, orgAPropUrl);
    expect(accessDenied).toBe(true);
  });

  test('Organization A cannot see Organization B contacts', async ({ page }) => {
    // Login as Acme admin
    await loginAsOrgUser(page, 'ACME', 'admin');

    // Navigate to contacts
    await page.goto('http://localhost:4000/apps/crm/contacts');
    await page.waitForLoadState('networkidle', { timeout: 10000 });
    const orgAContacts = await getRowCount(page);

    // Logout
    await logout(page);

    // Login as TechStart CEO
    await loginAsOrgUser(page, 'TECHSTART', 'ceo');

    // Navigate to contacts
    await page.goto('http://localhost:4000/apps/crm/contacts');
    await page.waitForLoadState('networkidle', { timeout: 10000 });
    const orgBContacts = await getRowCount(page);

    // Verify different datasets
    expect(orgAContacts).not.toEqual(orgBContacts);
    expect(orgAContacts).toBeGreaterThan(0);
    expect(orgBContacts).toBeGreaterThan(0);

    // Verify cannot access Acme contact directly
    const orgAContactUrl = `http://localhost:4000/apps/crm/contacts/${TEST_DATA.ACME_CONTACT.id}`;
    const accessDenied = await verifyAccessDenied(page, orgAContactUrl);
    expect(accessDenied).toBe(true);
  });

  test('Organization A cannot see Organization B accounts', async ({ page }) => {
    // Login as Acme admin
    await loginAsOrgUser(page, 'ACME', 'admin');

    // Navigate to accounts
    await page.goto('http://localhost:4000/apps/crm/accounts');
    await page.waitForLoadState('networkidle', { timeout: 10000 });
    const orgAAccounts = await getRowCount(page);

    // Logout
    await logout(page);

    // Login as TechStart CEO
    await loginAsOrgUser(page, 'TECHSTART', 'ceo');

    // Navigate to accounts
    await page.goto('http://localhost:4000/apps/crm/accounts');
    await page.waitForLoadState('networkidle', { timeout: 10000 });
    const orgBAccounts = await getRowCount(page);

    // Verify different datasets
    expect(orgAAccounts).not.toEqual(orgBAccounts);
    expect(orgAAccounts).toBeGreaterThan(0);
    expect(orgBAccounts).toBeGreaterThan(0);

    // Verify cannot access Acme account directly
    const orgAAccountUrl = `http://localhost:4000/apps/crm/accounts/${TEST_DATA.ACME_ACCOUNT.id}`;
    const accessDenied = await verifyAccessDenied(page, orgAAccountUrl);
    expect(accessDenied).toBe(true);
  });
});
