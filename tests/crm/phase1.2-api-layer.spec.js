/**
 * Phase 1.2 API Layer Tests - POST /api/crm/contacts
 *
 * Tests the API endpoint for creating contacts with comprehensive form data.
 * Tests cover:
 * - Successful contact creation
 * - Duplicate email validation (personal_email and email)
 * - Account creation/linking logic (CRM uses accounts, not companies)
 * - Required field validation
 * - Multi-tenant isolation (organization_id)
 *
 * Following TDD: Write tests first, watch them fail, then implement.
 */

import { test, expect } from '@playwright/test';
import { loginAsOrgUser, TEST_ORGS } from '../helpers/multi-tenant-setup.js';

// ============================================================================
// Test Data
// ============================================================================

/**
 * Generate unique contact data for each test run
 * Uses timestamp to ensure email uniqueness
 */
function generateUniqueContactData() {
  const timestamp = Date.now();
  const uniqueId = Math.random().toString(36).substring(7);

  return {
    personalInfo: {
      firstName: 'John',
      lastName: 'Doe',
      workEmail: `john.doe.${timestamp}.${uniqueId}@example.com`,
      personalEmail: `john.personal.${timestamp}.${uniqueId}@gmail.com`,
      phoneNumber: '+1-555-0100',
      alternatePhoneNumber: '+1-555-0101',
      dateOfBirth: '1990-01-15',
      jobTitle: 'Software Engineer',
      status: 'currentlyWorking',
      linkedInUrl: 'https://linkedin.com/in/johndoe',
      note: 'Met at tech conference',
    },
    companyInfo: {
      companyName: `Tech Solutions Inc ${timestamp}`,
      industryType: 'Technology',
      foundingYear: '2015',
      contact: {
        officialEmail: `info.${timestamp}@techsolutions.com`,
        phoneNumber: '+1-555-0200',
        streetAddress: '123 Tech Street',
        city: 'San Francisco',
        state: 'CA',
        country: 'USA',
        zipCode: '94105',
      },
      website: 'https://techsolutions.com',
      note: 'Potential partner company',
    },
    leadInfo: {
      source: 'referral',
      assignedAgent: 'admin@acme-corp.com', // Will be resolved to user_id
      status: 'new',
      priority: 'high',
      tags: ['enterprise', 'tech'],
      note: 'High-value lead',
    },
  };
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Create contact via API endpoint
 */
async function createContact(page, contactData) {
  // Get auth token from session
  const cookies = await page.context().cookies();
  const authCookie = cookies.find(c => c.name.includes('auth-token') || c.name.includes('sb-'));

  const response = await page.request.post('http://localhost:4000/api/crm/contacts', {
    data: contactData,
    headers: authCookie ? {} : {}, // Cookies auto-included by Playwright
  });

  return {
    status: response.status(),
    data: response.ok() ? await response.json() : null,
    error: !response.ok() ? await response.json() : null,
  };
}

// ============================================================================
// Tests
// ============================================================================

test.describe('POST /api/crm/contacts - API Layer', () => {
  test.beforeEach(async ({ page }) => {
    // Login as Acme admin for all tests
    await loginAsOrgUser(page, 'ACME', 'admin');
  });

  test('successfully creates contact with all fields', async ({ page }) => {
    const testData = generateUniqueContactData();
    const result = await createContact(page, testData);

    // Debug output if test fails
    if (result.status !== 201) {
      console.log('Error response:', JSON.stringify(result.error, null, 2));
      console.log('Status:', result.status);
    }

    // Should return 201 Created
    expect(result.status).toBe(201);
    expect(result.data).toBeTruthy();

    // Verify contact data mapping (using actual DB field names)
    expect(result.data.first_name).toBe('John');
    expect(result.data.last_name).toBe('Doe');
    expect(result.data.email).toBe(testData.personalInfo.workEmail); // workEmail → email
    expect(result.data.personal_email).toBe(testData.personalInfo.personalEmail);
    expect(result.data.phone).toBe('+1-555-0100');
    expect(result.data.alternate_phone).toBe('+1-555-0101');
    expect(result.data.date_of_birth).toBe('1990-01-15');
    expect(result.data.title).toBe('Software Engineer'); // jobTitle → title
    expect(result.data.status).toBe('currentlyWorking');
    expect(result.data.linkedin_url).toBe('https://linkedin.com/in/johndoe');
    expect(result.data.notes).toBe('Met at tech conference');

    // Verify lead info mapping
    expect(result.data.lead_source).toBe('referral');
    expect(result.data.lead_status).toBe('new');
    expect(result.data.priority).toBe('high');
    expect(result.data.tags).toEqual(['enterprise', 'tech']);

    // Verify account was created and linked (CRM uses accounts, not companies)
    expect(result.data.account_id).toBeTruthy();
    expect(result.data.account).toBeTruthy();
    expect(result.data.account.name).toBe(testData.companyInfo.companyName);
    expect(result.data.account.industry).toBe('Technology');
    expect(result.data.account.founding_year).toBe(2015);
    expect(result.data.account.phone).toBe('+1-555-0200');
    expect(result.data.account.email).toBe(testData.companyInfo.contact.officialEmail);
    expect(result.data.account.website).toBe('https://techsolutions.com');
    expect(result.data.account.notes).toBe('Potential partner company');
    // Address is stored as jsonb in accounts table
    expect(result.data.account.address).toBeTruthy();
    expect(result.data.account.address.street).toBe('123 Tech Street');
    expect(result.data.account.address.city).toBe('San Francisco');
    expect(result.data.account.address.state).toBe('CA');
    expect(result.data.account.address.country).toBe('USA');
    expect(result.data.account.address.zipCode).toBe('94105');

    // Verify organization_id is set (multi-tenant)
    expect(result.data.organization_id).toBeTruthy();
  });

  test('links to existing account if name matches in same org', async ({ page }) => {
    // Create first contact with account
    const firstData = generateUniqueContactData();
    const firstResult = await createContact(page, firstData);
    expect(firstResult.status).toBe(201);
    const firstAccountId = firstResult.data.account_id;

    // Create second contact with same account name but different emails
    const timestamp = Date.now();
    const uniqueId = Math.random().toString(36).substring(7);
    const secondContactData = {
      ...firstData,
      personalInfo: {
        ...firstData.personalInfo,
        workEmail: `jane.smith.${timestamp}.${uniqueId}@example.com`, // Different email
        personalEmail: `jane.personal.${timestamp}.${uniqueId}@gmail.com`,
      },
    };

    const secondResult = await createContact(page, secondContactData);

    // Should link to existing account
    expect(secondResult.status).toBe(201);
    expect(secondResult.data.account_id).toBe(firstAccountId);
  });

  test('rejects duplicate work email', async ({ page }) => {
    // Create first contact
    const testData = generateUniqueContactData();
    const firstResult = await createContact(page, testData);
    expect(firstResult.status).toBe(201);

    // Try to create second contact with same work email
    const timestamp = Date.now();
    const uniqueId = Math.random().toString(36).substring(7);
    const duplicateData = {
      ...testData,
      personalInfo: {
        ...testData.personalInfo,
        personalEmail: `different.${timestamp}.${uniqueId}@gmail.com`, // Different personal email
      },
    };

    const result = await createContact(page, duplicateData);

    // Should return 409 Conflict
    expect(result.status).toBe(409);
    expect(result.error.error).toContain('email');
  });

  test('rejects duplicate personal email', async ({ page }) => {
    // Create first contact
    const testData = generateUniqueContactData();
    const firstResult = await createContact(page, testData);
    expect(firstResult.status).toBe(201);

    // Try to create second contact with same personal email
    const timestamp = Date.now();
    const uniqueId = Math.random().toString(36).substring(7);
    const duplicateData = {
      ...testData,
      personalInfo: {
        ...testData.personalInfo,
        workEmail: `different.${timestamp}.${uniqueId}@example.com`, // Different work email
      },
    };

    const result = await createContact(page, duplicateData);

    // Should return 409 Conflict
    expect(result.status).toBe(409);
    expect(result.error.error).toContain('email');
  });

  test('rejects missing required fields', async ({ page }) => {
    const invalidData = {
      personalInfo: {
        firstName: 'John',
        // Missing lastName
        workEmail: 'john@example.com',
        phoneNumber: '+1-555-0100',
      },
      companyInfo: {
        companyName: 'Tech Solutions Inc',
        // Missing required fields
      },
      leadInfo: {
        source: 'referral',
      },
    };

    const result = await createContact(page, invalidData);

    // Should return 400 Bad Request
    expect(result.status).toBe(400);
    expect(result.error.error).toContain('required');
  });

  test('enforces multi-tenant isolation', async ({ page, context }) => {
    // Create contact as Acme admin
    const testData = generateUniqueContactData();
    const acmeResult = await createContact(page, testData);
    expect(acmeResult.status).toBe(201);
    const acmeContactId = acmeResult.data.id;

    // Logout and login as TechStart user
    await page.goto('http://localhost:4000/authentication/logout');
    await page.waitForURL(/\/authentication.*login/, { timeout: 5000 });

    await loginAsOrgUser(page, 'TECHSTART', 'ceo');

    // Try to fetch Acme's contact
    const cookies = await context.cookies();
    const authCookie = cookies.find(c => c.name.includes('auth-token') || c.name.includes('sb-'));

    const response = await page.request.get(
      `http://localhost:4000/api/crm/contacts/${acmeContactId}`,
      {
        headers: authCookie ? {} : {},
      }
    );

    // Should not be accessible (404 or 403 via RLS)
    expect([403, 404]).toContain(response.status());
  });

  test('returns 401 for unauthenticated requests', async ({ page }) => {
    // Clear session
    await page.goto('http://localhost:4000/authentication/logout');
    await page.waitForURL(/\/authentication.*login/, { timeout: 5000 });

    const testData = generateUniqueContactData();
    const result = await createContact(page, testData);

    // Should return 401 Unauthorized
    expect(result.status).toBe(401);
  });
});
